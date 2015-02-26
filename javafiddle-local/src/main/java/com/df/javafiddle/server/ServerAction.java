package com.df.javafiddle.server;

import java.util.Map;

public abstract class ServerAction<R, Q> {
    private Class<Q> requestClass;

    protected abstract R perform(String method, Map<String, String> params, Q obj);

    public ServerAction withRequestClass(Class<Q> requestClass) {
        this.requestClass = requestClass;
        return this;
    }

    public Class<Q> getRequestClass() {
        return requestClass;
    }
}
