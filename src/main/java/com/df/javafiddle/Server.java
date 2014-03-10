package com.df.javafiddle;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@SuppressWarnings("restriction")
public class Server {
	public static Server INSTANCE = new Server();
	protected Logger logger = Logger.getLogger(Server.class.getName());

	public StringBuffer updatedScript = new StringBuffer();

	protected HttpServer server;

	public String loadURL;

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
		server = HttpServer.create(new InetSocketAddress(port), 0);

		createContext("/base", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				writeResponse(httpExchange, loadURL, "text/plain", 200);
			}
		});

		createContext("/", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				String[] split = httpExchange.getRequestURI().getPath().substring(1).split("/", 0);
				if (split.length == 1) {
					if (split[0].isEmpty()) {
						String projectId = Project.create();
						httpExchange.getResponseHeaders().add("Location", httpExchange.getRequestURI() + projectId);
						httpExchange.sendResponseHeaders(302, 0);
						return;
					}
					String file;
					if (isProjctId(split[0])) {
						file = "index.html";
					} else {
						file = split[0];
					}
					System.out.println(file);
					InputStream stream = this.getClass().getClassLoader().getResourceAsStream(file);
					if (stream != null) {
						writeResponse(httpExchange, IOUtil.readStream(stream), mimeType(file), 200);
					} else {
						writeResponse(httpExchange, "", "text/plain", 404);
					}
					return;
				}

				if (split[1].equals("class")) {
					handleClass(httpExchange, split);
				} else if (split[1].equals("lib")) {
					handleLib(httpExchange, split);
				}
			}
		});

		/*****
		 * final ReentrantLock lock = new ReentrantLock(); final Condition
		 * condition = lock.newCondition();
		 * Loader.INSTANCE.addScriptUpdateListener(new ScriptUpdateListener() {
		 * 
		 * @Override public void onUpdate(String script) { lock.lock(); try {
		 *           updatedScript.append(script); condition.signalAll(); }
		 *           finally { lock.unlock(); } } });
		 * 
		 *           createContext("/l", new HttpHandler() { Thread lastThread =
		 *           null;
		 * @Override public void handle(final HttpExchange httpExchange) throws
		 *           IOException {
		 *           System.out.println(System.currentTimeMillis()); lastThread
		 *           = new Thread(new Runnable() {
		 * @Override public void run() { try { if (getLastScript().length() ==
		 *           0) { lock.lock(); try { try { condition.await(30,
		 *           TimeUnit.SECONDS); } catch (InterruptedException e) { //
		 *           ignore } } finally { lock.unlock(); } }
		 *           httpExchange.getResponseHeaders().add("Content-Type",
		 *           "text/javascript"); String script = getLastScript(); byte[]
		 *           result = script.getBytes("UTF-8"); try {
		 *           httpExchange.sendResponseHeaders(200, result.length);
		 *           writeResponse(httpExchange, result); } catch (IOException
		 *           e) { throw new RuntimeException(e); } } catch (Throwable e)
		 *           { logger.log(Level.SEVERE, "Server error", e); try {
		 *           writeError(httpExchange, e); } catch (IOException e1) {
		 *           throw new RuntimeException(e); } } }
		 * 
		 *           }); lastThread.start(); } });
		 *****/
		server.setExecutor(null);
		// creates a default executor
		server.start();
	}

	protected void handleClass(HttpExchange httpExchange, String[] split) throws IOException {
		Project project = Project.get(split[0]);
		if ("GET".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			writeResponse(httpExchange, project.classesMap.keySet().toString(), "application/json", 200);
			return;
		}
		String className = split[2];

		String source = project.getClass(className);

		if ("POST".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.createClass(className);
		} else if ("PUT".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.updateClass(className, IOUtil.readStream(httpExchange.getRequestBody()));
		} else if ("DELETE".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.removeClass(className);
		}
		writeResponse(httpExchange, source, "text/x-java-source,java", 200);
	}

	protected void handleLib(HttpExchange httpExchange, String[] split) throws IOException {
		Map<String, String> params = queryToMap(httpExchange.getRequestURI().getQuery());
		Project project = Project.get(split[0]);
		if ("GET".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			writeResponse(httpExchange, project.libs.keySet().toString(), "application/json", 200);
			return;
		}

		String name = split.length > 2 ? split[2] : null;
		String type = params.get("type");
		String url = IOUtil.readStream(httpExchange.getRequestBody());

		Lib lib = project.getLib(name);

		if (lib == null) {
			lib = new Lib().init(name, type, url);
		}

		if ("POST".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.createLib(lib);
		} else if ("DELETE".equalsIgnoreCase(httpExchange.getRequestMethod())) {
			project.removeClass(name);
		}
		writeResponse(httpExchange, lib.url.toString(), "text/plain", 200);
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
		List<String> origin = httpExchange.getRequestHeaders().get("Origin");
		if (origin != null && !origin.isEmpty()) {
			httpExchange.getResponseHeaders().add("Access-Control-Allow-Origin", origin.get(0));
		}
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