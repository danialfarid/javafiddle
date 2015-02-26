package com.df.javafiddle.compiler;

import java.util.List;

public class CompilationErrorException extends RuntimeException {
	public String className;
	public List<CompileError> compileErrors;

	public CompilationErrorException() {
	}

	public CompilationErrorException(String message) {
		super(message);
	}

	public CompilationErrorException(String className, List<CompileError> compileErrors) {
		this.className = className;
		this.compileErrors = compileErrors;
	}
}
