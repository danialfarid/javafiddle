package com.df.javafiddle;

import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;

import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

public class Compiler {
	protected JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

	public void compile(String className, final String source) {
		compiler.run(null, System.out, System.err, source);
		// try {
		// compiler.run(null, System.out, System.err, new SimpleJavaFileObject(new URI(className),
		// Kind.SOURCE) {
		// @Override
		// public CharSequence getCharContent(boolean ignoreEncodingErrors) throws IOException {
		// return source;
		// };
		// }.getCharContent(true).toString());
		// } catch (IOException e) {
		// throw new RuntimeException(e);
		// } catch (URISyntaxException e) {
		// throw new RuntimeException(e);
		// }
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
