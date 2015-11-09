package com.df.javafiddle.compiler;

public class CompileError {
    public String reason;
    public long line;
    public long from;
    public long to;

    public CompileError init(String reason, long line, long from, long to) {
        this.reason = reason;
        this.line = line;
        this.from = from;
        this.to = to;
        return this;
    }

    @Override
    public String toString() {
        return "CompileError{" +
                "reason='" + reason + '\'' +
                ", line=" + line +
                ", from=" + from +
                ", to=" + to +
                '}';
    }
}
