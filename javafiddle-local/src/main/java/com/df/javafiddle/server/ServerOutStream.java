package com.df.javafiddle.server;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;

public class ServerOutStream extends ByteArrayOutputStream {
    public PrintStream stream;
    public ServerOutStream init(PrintStream printStream) {
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
