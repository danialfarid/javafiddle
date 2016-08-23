package com.df.javafiddle.server;

import com.df.javafiddle.model.Project;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;

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
                StringBuilder sb = new StringBuilder();
                for (String str : Arrays.asList(string.split("\n"))) {
                    if (str.indexOf(Project.class.getPackage().getName()) == -1) {
                        sb.append(str).append("\n");
                    } else if (str.indexOf(Project.class.getName() + ".run") > -1){
                        break;
                    }
                }

                this.reset();
                return sb.toString();
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
