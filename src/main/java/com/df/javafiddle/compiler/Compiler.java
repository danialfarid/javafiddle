package com.df.javafiddle.compiler;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.ToolProvider;

import com.df.javafiddle.DynamicURLClassLoader;
import com.df.javafiddle.IOUtil;

public class Compiler {
	Logger logger = Logger.getLogger(Compiler.class.getName());

	protected JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();


	public DynamicURLClassLoader classLoader;

	public Compiler init(DynamicURLClassLoader classLoader) {
		this.classLoader = classLoader;
		return this;
	}

	public Class<?> compile(String className, final String source, String projectId) {
		DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();

		StringWriter writer = new StringWriter();
		PrintWriter out = new PrintWriter(writer);
		out.write(source);
		out.close();
		String src = writer.toString();

		// We get an instance of JavaCompiler. Then we create a file manager
		// (our custom implementation of it)
		JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
		String projectFolder = IOUtil.getTempFolderForId(projectId) + projectId + File.separator;
		new File(projectFolder).mkdirs();
		ClassFileManager fileManager = new ClassFileManager(compiler.getStandardFileManager(null, null, null),
				projectFolder);
		// try {
		// fileManager.setLocation(StandardLocation.CLASS_OUTPUT,
		// Arrays.asList(new File(projectFolder)));
		// } catch (IOException e1) {
		// throw new RuntimeException(e);
		// }
		// Dynamic compiling requires specifying a list of "files" to compile.
		// In our case this is a list
		// containing one "file" which is in our case our own implementation
		// (see details below)
		List<JavaFileObject> jfiles = new ArrayList<JavaFileObject>();
		jfiles.add(new CharSequenceJavaFileObject(className, src));

		List<String> optionList = new ArrayList<String>();
		optionList.addAll(Arrays.asList("-classpath", System.getProperty("java.class.path") + File.pathSeparatorChar
				+ projectFolder));

		// We specify a task to the compiler. Compiler should use our file
		// manager and our list of "files".
		// Then we run the compilation with call()
		boolean compileSuccess = compiler.getTask(null, fileManager, diagnostics, optionList, null, jfiles).call();
		if (compileSuccess) {
			// Creating an instance of our compiled class and
			// running its toString() method
			try {
				return fileManager.getClassLoader(null).loadClass(className);
			} catch (ClassNotFoundException e) {
				logger.log(Level.SEVERE, "", e);
				return null;
			}
		} else {
			StringBuilder err = new StringBuilder("[");
			Iterator<Diagnostic<? extends JavaFileObject>> it = diagnostics.getDiagnostics().iterator();
			while (true) {
				if (!it.hasNext())
					break;
				Diagnostic<? extends javax.tools.JavaFileObject> diagnostic = it.next();
				err.append("{");
				err.append("\"reason\": \"" + diagnostic.getMessage(null) + "\",");
				err.append("\"line\": \"" + diagnostic.getLineNumber() + "\",");
				err.append("\"from\": \"" + diagnostic.getStartPosition() + "\",");
				err.append("\"to\": \"" + diagnostic.getEndPosition() + "\"}");
				if (it.hasNext())
					err.append(",");
			}
			err.append("]");
			throw new CompilationErrorException(className, err.toString());
		}
	}

	public static void main(String[] args) throws Exception {
		// args = new String[] { "Main",
		// "C:/Users/Dan/Documents/personal/a/Main2.java" };
		// new Compiler().compile(args[0], args[1]);
		//
		// URL dirUrl = new URL("file:/" + "C:/Users/Dan/Documents/personal" +
		// "/");
		// URLClassLoader cl = new URLClassLoader(new URL[] { dirUrl },
		// Compiler.class.getClassLoader());
		// Object mainClass = cl.loadClass("a.Main2").newInstance();
		// Method mainMethod = mainClass.getClass().getMethod("main");
		// mainMethod.invoke(mainClass);
	}
}
