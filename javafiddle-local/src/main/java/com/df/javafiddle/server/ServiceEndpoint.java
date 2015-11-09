package com.df.javafiddle.server;

import java.util.HashMap;
import java.util.Map;

public class ServiceEndpoint {
    public String method;
    public String path;
    private ServerAction action;
    private String[] pathParts;

    public ServiceEndpoint init(String method, String path) {
        this.method = method;
        this.path = path;
        this.pathParts = (path.startsWith("/") ? path.substring(1) : path).split("/", 0);
        return this;  }

    public ServiceEndpoint withAction(ServerAction action) {
        this.action = action;
        return this;
    }

    public <R> Class<R> getRequestClass() {
        return action.getRequestClass();
    }

    public <R, Q> Result<R> consume(String method, Map<String, String> varsMap, Q obj) {
        R r = (R) action.perform(method, varsMap, obj);
        return new Result<R>(true, action == null ? null : r);
    }

    public Map<String, String> matches(String method, String[] paths) {
        if (!"*".equalsIgnoreCase(this.method) && !this.method.equalsIgnoreCase(method)) {
            return null;
        }
        if (pathParts.length != paths.length) {
            return null;
        }
        Map<String, String> varsMap = new HashMap<String, String>();
        for (int i = 0; i < paths.length; i++) {
            String s = paths[i];
            if (!"*".equals(s)) {
                if (s.equalsIgnoreCase(pathParts[i])) {
                    continue;
                } else if (pathParts[i].startsWith("{")) {
                    varsMap.put(pathParts[i].substring(1, pathParts[i].length() - 1), s);
                } else {
                    return null;
                }
            }
        }
        return varsMap;
    }

    public class Result<R> {
        public R data;
        public boolean hasResult;

        public Result(boolean hasResult, R data) {
            this.hasResult = hasResult;
            this.data = data;
        }
    }
}
