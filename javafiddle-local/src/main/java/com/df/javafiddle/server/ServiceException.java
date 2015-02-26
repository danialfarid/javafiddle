package com.df.javafiddle.server;

public class ServiceException extends RuntimeException {
    public int status;
    public Object error;

    public ServiceException(int status, Object error){
        this.status = status;
        this.error = error;
    }
}
