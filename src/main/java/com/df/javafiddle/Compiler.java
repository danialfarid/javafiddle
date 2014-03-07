package com.df.javafiddle;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;
import java.net.URI;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Arrays;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaCompiler.CompilationTask;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;

public class Compiler {
	protected JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

	public void compile(String className, final String source) {
		compiler.run(null, System.out, System.err, source);
		// try {
		// compiler.run(null, System.out, System.err, new
		// SimpleJavaFileObject(new URI(className),
		// Kind.SOURCE) {
		// @Override
		// public CharSequence getCharContent(boolean ignoreEncodingErrors)
		// throws IOException {
		// return source;
		// };
		// }.getCharContent(true).toString());
		// } catch (IOException e) {
		// throw new RuntimeException(e);
		// } catch (URISyntaxException e) {
		// throw new RuntimeException(e);
		// }
		DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();

		StringWriter writer = new StringWriter();
		PrintWriter out = new PrintWriter(writer);
		out.write(source);
		out.close();
		JavaFileObject file = new JavaSourceFromString("HelloWorld", writer.toString());

		Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(file);
		CompilationTask task = compiler.getTask(null, null, diagnostics, null, null, compilationUnits);

		boolean success = task.call();
		for (Diagnostic<?> diagnostic : diagnostics.getDiagnostics()) {
			System.out.println(diagnostic.getCode());
			System.out.println(diagnostic.getKind());
			System.out.println(diagnostic.getPosition());
			System.out.println(diagnostic.getStartPosition());
			System.out.println(diagnostic.getEndPosition());
			System.out.println(diagnostic.getSource());
			System.out.println(diagnostic.getMessage(null));
		}
		System.out.println("Success: " + success);

		// if (success) {
		// try {
		// Class.forName("HelloWorld").getDeclaredMethod("main", new Class[] {
		// String[].class })
		// .invoke(null, new Object[] { null });
		// } catch (ClassNotFoundException e) {
		// System.err.println("Class not found: " + e);
		// } catch (NoSuchMethodException e) {
		// System.err.println("No such method: " + e);
		// } catch (IllegalAccessException e) {
		// System.err.println("Illegal access: " + e);
		// } catch (InvocationTargetException e) {
		// System.err.println("Invocation target: " + e);
		// }
		// }
	}

	class JavaSourceFromString extends SimpleJavaFileObject {
		final String code;

		JavaSourceFromString(String name, String code) {
			super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
			this.code = code;
		}

		@Override
		public CharSequence getCharContent(boolean ignoreEncodingErrors) {
			return code;
		}
	}

	public static void main(String[] args) throws Exception {
		args = new String[] { "Main", "C:/Users/Dan/Documents/personal/a/Main2.java" };
		new Compiler().compile(args[0], args[1]);

		URL dirUrl = new URL("file:/" + "C:/Users/Dan/Documents/personal" + "/");
		URLClassLoader cl = new URLClassLoader(new URL[] { dirUrl }, Compiler.class.getClassLoader());
		Object mainClass = cl.loadClass("a.Main2").newInstance();
		Method mainMethod = mainClass.getClass().getMethod("main");
		mainMethod.invoke(mainClass);
	}
}
