package com.df.javafiddle.server;

import com.df.javafiddle.Clazz;
import com.df.javafiddle.IOUtil;
import com.df.javafiddle.Lib;
import com.df.javafiddle.Project;
import com.df.javafiddle.compiler.CompilationErrorException;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

@SuppressWarnings("restriction")
public class JFServer {
    public static JFServer INSTANCE = new JFServer();
    protected Logger logger = Logger.getLogger(JFServer.class.getName());

    protected HttpServer server;

    protected ServerOutStream out = new ServerOutStream().init(System.out);
    protected ServerOutStream err = new ServerOutStream().init(System.err);

    public List<ServiceEndpoint> endpoints = new ArrayList<ServiceEndpoint>();

    {
        endpoints.add(new ServiceEndpoint().init("OPTIONS", "*"));

        endpoints.add(new ServiceEndpoint().init("POST", "/{id}").withAction(new ServerAction<Void, Void>() {
            @Override
            protected Void perform(String method, Map<String, String> params, Void obj) {
                getProject(params);
                return null;
            }
        }));

        endpoints.add(new ServiceEndpoint().init("*", "/{id}/class").withAction(new ServerAction<Void, Clazz>() {
            @Override
            public Void perform(String method, Map<String, String> params, Clazz clazz) {
                Project project = getProject(params);
                if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                    project.updateClass(clazz);
                } else if ("DELETE".equalsIgnoreCase(method)) {
                    project.removeClass(clazz.name);
                }
                return null;
            }
        }.withRequestClass(Clazz.class)));

        endpoints.add(new ServiceEndpoint().init("*", "/{id}/lib").withAction(new ServerAction<Void, Lib>() {
            @Override
            public Void perform(String method, Map<String, String> params, Lib lib) {
                Project project = getProject(params);
                if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)) {
                    project.createLib(lib);
                } else if ("DELETE".equalsIgnoreCase(method)) {
                    project.removeClass(lib.name);
                }
                return null;
            }
        }.withRequestClass(Lib.class)));

        endpoints.add(new ServiceEndpoint().init("POST", "/{id}/run").withAction(new ServerAction<Void, Void>() {
            @Override
            public Void perform(String method, Map<String, String> params, Void obj) {
                Project project = getProject(params);
                try {
                    project.run();
                } catch (CompilationErrorException e) {
                    throw new ServiceException(400, e.compileErrors);
                } catch (Throwable e) {
                    logger.log(Level.SEVERE, "", e);
                    throw new ServiceException(500, IOUtil.readStack(e));
                }
                return null;
            }
        }));

        endpoints.add(new ServiceEndpoint().init("GET", "/out").withAction(new ServerAction<String, Void>() {
            @Override
            public String perform(String method, Map<String, String> params, Void obj) {
                return out.poll();
            }
        }));

        endpoints.add(new ServiceEndpoint().init("GET", "/err").withAction(new ServerAction<String, Void>() {
            @Override
            public String perform(String method, Map<String, String> params, Void obj) {
                return err.poll();
            }
        }));
    }

    private Project getProject(Map<String, String> params) {
        String id = params.get("id");
        if (!projectMap.containsKey(id)) {
            Project project = new Project().init(id).initClassLoader();
            projectMap.put(id, project);
        }
        return projectMap.get(id);
    }

    Map<String, Project> projectMap = new HashMap<String, Project>(1);

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

    public void start(int port) throws IOException {
        System.setOut(new PrintStream(out));
        System.setErr(new PrintStream(err));
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newCachedThreadPool());

        createContext("/", new HttpHandler() {
            @Override
            public void handle(HttpExchange httpExchange) throws IOException {
                String content = IOUtil.readStream(httpExchange.getRequestBody());
                String path = httpExchange.getRequestURI().getPath();
                String[] paths = (path.startsWith("/") ? path.substring(1) : path).split("/", 0);
                for (ServiceEndpoint endpoint : endpoints) {
                    Map<String, String> varMap = endpoint.matches(httpExchange.getRequestMethod(), paths);
                    if (varMap != null) {
                        Object val = JSON.INSTANCE.parse(content, endpoint.getRequestClass());
                        try {
                            ServiceEndpoint.Result<Object> result = endpoint.consume(varMap, val);
                            if (result.hasResult) {
                                writeResponse(httpExchange, JSON.INSTANCE.stringify(result.data),
                                        "application/json", 200);
                            }
                            writeResponse(httpExchange, "", "text/plain", 200);
                        } catch (ServiceException e) {
                            writeResponse(httpExchange, JSON.INSTANCE.stringify(e.error),
                                    "application/json", e.status);
                        }
                    }
                }
                writeResponse(httpExchange, null, "text/plain", 404);
            }
        });

        // creates a default executor
        server.start();
    }

    protected String mimeType(String file) {
        return file.endsWith(".js") ? "text/javascript" : file.endsWith(".html") ? "text/html"
                : file.endsWith(".css") ? "text/css" : "text/plain";
    }

    protected void writeResponse(HttpExchange httpExchange, String content, String contentType, int code)
            throws IOException {
        httpExchange.getResponseHeaders().add("Content-Type", contentType);
        List<String> originList = httpExchange.getRequestHeaders().get("Origin");
        if (originList != null && !originList.isEmpty()) {
            String origin = originList.get(0);
            if (origin.startsWith("http://localhost:")) {
                httpExchange.getResponseHeaders().add("Access-Control-Allow-Origin", origin);
            }
        }
        httpExchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS'");
        // $response->header('Access-Control-Allow-Headers', 'Content-Type,
        // X-Requested-With, X-authentication, X-client');

        if (content != null) {
            byte[] bytes = content.getBytes("UTF-8");
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
        } else {
            httpExchange.sendResponseHeaders(code, 0);
        }
        httpExchange.close();
    }

    public void stop() {
        server.stop(0);
    }
}