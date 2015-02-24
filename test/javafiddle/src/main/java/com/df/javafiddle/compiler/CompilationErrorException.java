package com.df.javafiddle.compiler;

public class CompilationErrorException extends RuntimeException {
	public String className;
	public String errorJson;

	public CompilationErrorException() {
	}

	public CompilationErrorException(String message) {
		super(message);
	}

	public CompilationErrorException(String className, String errorJson) {
		this.className = className;
		this.errorJson = errorJson;
	}
}
