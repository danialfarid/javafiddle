package com.df.javafiddle.compiler;

import java.util.List;

public class CompilationErrorDetails {
	public String className;
	public List<CompileError> compileErrors;

	public CompilationErrorDetails(String className, List<CompileError> compileErrors) {
		this.className = className;
		this.compileErrors = compileErrors;
	}
}
