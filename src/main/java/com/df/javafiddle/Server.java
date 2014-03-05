package com.df.javafiddle;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.script.ScriptException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@SuppressWarnings("restriction")
public class Server {
	protected static final String MAVEN_URL = "http://repo.maven.apache.org/maven2/";
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
					writeError(httpExchange, e);
				}
			}
		});

	}

	protected void writeError(HttpExchange httpExchange, Throwable e) throws IOException {
		String result = e.getMessage() == null ? "" : e.getMessage();
		httpExchange.sendResponseHeaders(500, result.length());
		writeResponse(httpExchange, result.getBytes("UTF-8"));
		logger.log(Level.SEVERE, "Server error", e);
	}

	public void start(int port) throws IOException {
		server = HttpServer.create(new InetSocketAddress(port), 0);

		createContext("/base", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				httpExchange.getResponseHeaders().add("Content-Type", "text/plain");
				byte[] bytes = loadURL.getBytes("UTF-8");
				httpExchange.sendResponseHeaders(200, bytes.length);
				writeResponse(httpExchange, bytes);
			}
		});

		createContext("/", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				String file = httpExchange.getRequestURI().getPath().replaceFirst("/", "");
				if ("".equals(file)) {
					file = "index.html";
				}
				System.out.println(file);
				InputStream stream = this.getClass().getClassLoader().getResourceAsStream(file);
				if (stream != null) {
					byte[] html = IOUtil.readStreamAsBytes(stream);
					httpExchange.getResponseHeaders().add("Content-Type", mimeType(file));
					httpExchange.sendResponseHeaders(200, html.length);
					writeResponse(httpExchange, html);
				} else {
					httpExchange.sendResponseHeaders(404, 0);
					writeResponse(httpExchange, new byte[0]);
				}
			}
		});

		// createContext("/img", new HttpHandler() {
		// @Override
		// public void handle(HttpExchange httpExchange) throws IOException {
		// String path = httpExchange.getRequestURI().getPath();
		// byte[] img =
		// IOUtil.readStreamAsBytes(this.getClass().getClassLoader()
		// .getResourceAsStream(path.replaceFirst("/", "")));
		// httpExchange.getResponseHeaders().add("Content-Type",
		// URLConnection.guessContentTypeFromName(path));
		// httpExchange.sendResponseHeaders(200, img.length);
		// writeResponse(httpExchange, img);
		// }
		// });

		createContext("/create", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				String className = IOUtil.readStream(httpExchange.getRequestBody());

				String result = createClass(className, null);
				String result;
				byte[] bytes;
				httpExchange.getResponseHeaders().add("Content-Type", "text/x-java-source,java");
				bytes = result.getBytes("UTF-8");
				httpExchange.sendResponseHeaders(200, bytes.length);
				writeResponse(httpExchange, bytes);
			}
		});

		createContext("/addLib", new HttpHandler() {
			@Override
			public void handle(HttpExchange httpExchange) throws IOException {
				String result = "";
				Map<String, String> params = queryToMap(httpExchange.getRequestURI().getQuery());
				String name = params.get("name");
				String type = params.get("type");
				String url = params.get("url");

				if (type.equalsIgnoreCase("maven")) {
					if (name.endsWith(".jar")) {
						name = name.substring(0, name.length() - 4);
					}
					String version = "";
					int hashIndex = name.lastIndexOf("#");
					if (hashIndex > -1) {
						version = name.substring(hashIndex + 1);
						name = name.substring(0, hashIndex);
					}

					String basePath = name.replace('.', '/');
					String mavenUrl = MAVEN_URL + basePath;
					if (version.isEmpty()) {
						DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
						DocumentBuilder db = dbf.newDocumentBuilder();
						Document doc = db.parse(new URL(mavenUrl + "maven-metadata.xml").openStream());
						XPathFactory factory = XPathFactory.newInstance();
						XPath xpath = factory.newXPath();
						XPathExpression expr = xpath.compile("/metadata/versioning/versions/version[last()]");
						NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
						version = nodes.item(nodes.getLength() - 1).getTextContent();
					}

					String filePath = basePath + "/" + version + "/" + name.substring(name.lastIndexOf('.') + 1) + "-"
							+ version + ".jar";
					String localFilePath = getLocalMavenRepoPath() + "/" + filePath;
					if (new File(localFilePath).exists()) {
						return 
					}
					URL website = new URL(MAVEN_URL + filePath);
					ReadableByteChannel rbc = Channels.newChannel(website.openStream());
					FileOutputStream fos = new FileOutputStream(localFilePath);
					fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
					result = localFilePath;
				}

				byte[] bytes;
				httpExchange.getResponseHeaders().add("Content-Type", "text/x-java-source,java");
				bytes = result.getBytes("UTF-8");
				httpExchange.sendResponseHeaders(200, bytes.length);
				writeResponse(httpExchange, bytes);
			}
		});

		final ReentrantLock lock = new ReentrantLock();
		final Condition condition = lock.newCondition();

		Loader.INSTANCE.addScriptUpdateListener(new ScriptUpdateListener() {
			@Override
			public void onUpdate(String script) {
				lock.lock();
				try {
					updatedScript.append(script);
					condition.signalAll();
				} finally {
					lock.unlock();
				}
			}
		});

		createContext("/l", new HttpHandler() {
			Thread lastThread = null;

			@Override
			public void handle(final HttpExchange httpExchange) throws IOException {
				System.out.println(System.currentTimeMillis());
				lastThread = new Thread(new Runnable() {
					@Override
					public void run() {
						try {
							if (getLastScript().length() == 0) {
								lock.lock();
								try {
									try {
										condition.await(30, TimeUnit.SECONDS);
									} catch (InterruptedException e) {
										// ignore
									}
								} finally {
									lock.unlock();
								}
							}
							httpExchange.getResponseHeaders().add("Content-Type", "text/javascript");
							String script = getLastScript();
							byte[] result = script.getBytes("UTF-8");
							try {
								httpExchange.sendResponseHeaders(200, result.length);
								writeResponse(httpExchange, result);
							} catch (IOException e) {
								throw new RuntimeException(e);
							}
						} catch (Throwable e) {
							logger.log(Level.SEVERE, "Server error", e);
							try {
								writeError(httpExchange, e);
							} catch (IOException e1) {
								throw new RuntimeException(e);
							}
						}
					}

				});
				lastThread.start();
			}
		});

		server.setExecutor(null);
		// creates a default executor
		server.start();
	}

	protected String getLocalMavenRepoPath() {
		return System.getProperty("user.home") + ".m2/repository";
	}

	protected String createClass(String className, String inner) {
		String[] split = className.split("\\.");
		String packageName = "";
		for (int i = 0; i < split.length - 1; i++) {
			packageName += (i > 0 ? "." : "") + split[i];
		}
		String content = packageName.length() > 0 ? "package " + packageName + "\r\n\r\n": "";
		content += "public class " + split[split.length - 1] + "{\r\n\t" + (inner == null ? "" + inner) + "\r\n}";
		return content;
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

	protected void writeResponse(HttpExchange httpExchange, byte[] bytes) throws IOException {
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
		for (String param : query.split("&")) {
			String pair[] = param.split("=");
			if (pair.length > 1) {
				result.put(pair[0], pair[1]);
			} else {
				result.put(pair[0], "");
			}
		}
		return result;
	}

	public void stop() {
		server.stop(0);
	}
}