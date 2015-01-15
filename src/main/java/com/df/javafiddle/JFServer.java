package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.df.javafiddle.compiler.CompilationErrorException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@SuppressWarnings("restriction")
public class JFServer {
	public static JFServer INSTANCE = new JFServer();
	protected Logger logger = Logger.getLogger(JFServer.class.getName());

	public StringBuffer updatedScript = new StringBuffer();

	protected HttpServer server;

	public String loadURL;
	
	protected OutStream out = new OutStream().init(System.out);
	protected OutStream err = new OutStream().init(System.err);
	
	class OutStream extends ByteArrayOutputStream {
		public PrintStream stream;
		public OutStream init(PrintStream printStream) {
			this.stream = printStream;
			return this;
		}
		@Override
		public synchronized void write(byte[] b, int off, int len) {
			stream.write(b, off, len);
			super.write(b, off, len);
			this.notifyAll();
		}
		public synchronized String poll() {
			try {
				if (this.size() > 0) {
					String string = this.toString("UTF-8");
					this.reset();
					return string;
				} else {
					this.wait();
					return poll();
				}
			} catch (UnsupportedEncodingException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
		}
	}

	protected void createContext(String context, final HttpHandler httpHandler) {
		server.createContext(context, new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				try {
					httpHandler.handle(httpExchange);
				} catch (Throwable e) {
					writeResponse(httpExchange, e.getMessage(), "text/plain", 500);
					logger.log(Level.SEVERE, "Server error", e);
				}
			}
		});

	}

	// protected void writeError(HttpExchange httpExchange, Throwable e) throws
	// IOException {
	// String result = e.getMessage() == null ? "" : e.getMessage();
	// httpExchange.sendResponseHeaders(500, result.length());
	// writeResponse(httpExchange, result.getBytes("UTF-8"));
	// logger.log(Level.SEVERE, "Server error", e);
	// }

	public void start(int port) throws IOException {
		System.setOut(new PrintStream(out));
		System.setErr(new PrintStream(err));
		server = HttpServer.create(new InetSocketAddress(port), 0);
		server.setExecutor(Executors.newCachedThreadPool());

		createContext("/", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				String[] split = httpExchange.getRequestURI().getPath().substring(1).split("/", 0);
				Project project = Project.get(split[0]);
				if ("POST".equalsIgnoreCase(httpExchange.getRequestMethod()) && split.length == 1) {
					if (project == null) {
						project = new Project(split[0]);
					}
					writeResponse(httpExchange, split[0], "text/plain", 200);
					return;
				}
				String path1 = split[1];
				if (path1.equals("class")) {
					handleClass(httpExchange, project, split);
					return;
				} else if (path1.equals("lib")) {
					handleLib(httpExchange, project, split);
					return;
				} else if (path1.equals("run")) {
					try {
						project.run();
					} catch (CompilationErrorException e) {
						writeResponse(httpExchange, e.errorJson, "application/json", 400);
					} catch (Throwable e) {
						logger.log(Level.SEVERE, "", e);
						StringWriter stringWriter = new StringWriter();
						(e.getCause() != null ? e.getCause() : e).printStackTrace(new PrintWriter(stringWriter));
						writeResponse(httpExchange, stringWriter.toString(), "text/plain", 500);
					}
				} else if (path1.equals("out")) {
					writeResponse(httpExchange, out.poll(), "text/plain", 200);
				} else if (path1.equals("err")) {
					writeResponse(httpExchange, err.poll(), "text/plain", 200);
				}
				writeResponse(httpExchange, "", "text/plain", 200);
			}
		});

		// creates a default executor
		server.start();
	}

	protected void handleClass(HttpExchange httpExchange, Project project, String[] split) throws IOException {
		String className = split[2];

		if ("POST".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.createClass(className, IOUtil.readStream(httpExchange.getRequestBody()));
		} else if ("PUT".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.updateClass(className, IOUtil.readStream(httpExchange.getRequestBody()));
		} else if ("DELETE".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.removeClass(className);
		}
		writeResponse(httpExchange, className, "text/plain", 200);
	}

	protected void handleLib(HttpExchange httpExchange, Project project, String[] split) throws IOException {
		String content = IOUtil.readStream(httpExchange.getRequestBody());
		String[] nameUrl = content.split((char) 0 + "", -1);

		String result = nameUrl[0];

		if ("POST".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			Lib lib = new Lib().init(nameUrl[0], nameUrl[1]);
			project.createLib(lib);
			result = lib.name;
		} else if ("DELETE".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.removeLib(nameUrl[0]);
		}
		writeResponse(httpExchange, result, "text/plain", 200);
	}

	protected boolean isProjctId(String str) {
		return str.matches("[A-Za-z0-9]{8}");
	}

	protected String mimeType(String file) {
		return file.endsWith(".js") ? "text/javascript" : file.endsWith(".html") ? "text/html"
				: file.endsWith(".css") ? "text/css" : "text/plain";
	}

	protected synchronized String getLastScript() {
		int len = updatedScript.length();
		String script = updatedScript.substring(0, len);
		updatedScript.delete(0, len);
		return script;
	}

	protected void writeResponse(HttpExchange httpExchange, String content, String contentType, int code)
			throws IOException {
		byte[] bytes = content.getBytes("UTF-8");
		httpExchange.getResponseHeaders().add("Content-Type", contentType);
		httpExchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:8888");
		httpExchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS'");
		// $response->header('Access-Control-Allow-Headers', 'Content-Type,
		// X-Requested-With, X-authentication, X-client');

		httpExchange.sendResponseHeaders(code, bytes.length);
		OutputStream os = httpExchange.getResponseBody();
		try {
			os.write(bytes);
		} finally {
			try {
				os.close();
			} catch (IOException e) {
				// ignore
			}
		}
		httpExchange.close();
	}

	protected Map<String, String> queryToMap(String query) {
		Map<String, String> result = new HashMap<String, String>();
		if (query != null) {
			for (String param : query.split("&")) {
				String pair[] = param.split("=");
				if (pair.length > 1) {
					result.put(pair[0], pair[1]);
				} else {
					result.put(pair[0], "");
				}
			}
		}
		return result;
	}

	public void stop() {
		server.stop(0);
	}
}