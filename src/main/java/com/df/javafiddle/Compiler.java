package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URI;
import java.security.SecureClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.ForwardingJavaFileManager;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

public class Compiler {
	Logger logger = Logger.getLogger(Compiler.class.getName());

	protected JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

	public String outputPath = System.getProperty("java.io.tmpdir") + File.separator + "javafiddle" + File.separator;

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
		String projectFolder = outputPath + projectId + File.separator;
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
			StringBuilder err = new StringBuilder("Compile error: ");
			for (Diagnostic<?> diagnostic : diagnostics.getDiagnostics()) {
				err.append(diagnostic.getCode());
				err.append("line: " + diagnostic.getLineNumber());
				err.append(diagnostic.getKind());
				err.append(" at position: " + diagnostic.getPosition());
				err.append(" from: " + diagnostic.getStartPosition());
				err.append(" to: " + diagnostic.getEndPosition());
				err.append(" source: " + diagnostic.getSource());
				err.append(" reason: " + diagnostic.getMessage(null));
			}
			logger.severe(err.toString());
			return null;
		}
	}

	public static class CharSequenceJavaFileObject extends SimpleJavaFileObject {

		/**
		 * CharSequence representing the source code to be compiled
		 */
		private final CharSequence content;

		/**
		 * This constructor will store the source code in the internal "content"
		 * variable and register it as a source code, using a URI containing the
		 * class full name
		 * 
		 * @param className
		 *            name of the public class in the source code
		 * @param content
		 *            source code to compile
		 */
		public CharSequenceJavaFileObject(String className, CharSequence content) {
			super(URI.create("string:///" + className.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
			this.content = content;
		}

		/**
		 * Answers the CharSequence to be compiled. It will give the source code
		 * stored in variable "content"
		 */
		@Override
		public CharSequence getCharContent(boolean ignoreEncodingErrors) {
			return content;
		}

		@Override
		public String toString() {
			return content.toString();
		}
	}

	public static class JavaClassObject extends SimpleJavaFileObject {
		protected final URI pathURI;

		/**
		 * Byte code created by the compiler will be stored in this
		 * ByteArrayOutputStream so that we can later get the byte array out of
		 * it and put it in the memory as an instance of our class.
		 */
		protected final ByteArrayOutputStream bos = new ByteArrayOutputStream() {
			@Override
			public void close() throws IOException {
				super.close();
				PrintWriter writer = new PrintWriter(new File(pathURI));
				try {
					writer.print(this.toString());
				} finally {
					writer.close();
				}
			};
		};

		/**
		 * Registers the compiled class object under URI containing the class
		 * full name
		 * 
		 * @param name
		 *            Full name of the compiled class
		 * @param kind
		 *            Kind of the data. It will be CLASS in our case
		 */
		public JavaClassObject(String name, Kind kind, String path) {
			super(URI.create("string:///" + name.replace('.', File.separatorChar) + kind.extension), kind);
			this.pathURI = URI.create("file:///" + path + File.separator + name.replace('.', File.separatorChar)
					+ kind.extension);
		}

		/**
		 * Will be used by our file manager to get the byte code that can be put
		 * into memory to instantiate our class
		 * 
		 * @return compiled byte code
		 */
		public byte[] getBytes() {
			return bos.toByteArray();
		}

		/**
		 * Will provide the compiler with an output stream that leads to our
		 * byte array. This way the compiler will write everything into the byte
		 * array that we will instantiate later
		 */
		@Override
		public OutputStream openOutputStream() throws IOException {
			return bos;
		}
	}

	public class ClassFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {
		/**
		 * Instance of JavaClassObject that will store the compiled bytecode of
		 * our class
		 */
		private JavaClassObject jclassObject;
		protected final String classOutputPath;

		/**
		 * Will initialize the manager with the specified standard java file
		 * manager
		 * 
		 * @param standardManger
		 */
		public ClassFileManager(StandardJavaFileManager standardManager, String classOutputPath) {
			super(standardManager);
			this.classOutputPath = classOutputPath;
		}

		/**
		 * Will be used by us to get the class loader for our compiled class. It
		 * creates an anonymous class extending the SecureClassLoader which uses
		 * the byte code created by the compiler and stored in the
		 * JavaClassObject, and returns the Class for it
		 */
		@Override
		public ClassLoader getClassLoader(Location location) {
			// return classLoader;
			return new SecureClassLoader() {
				@Override
				protected Class<?> findClass(String name) throws ClassNotFoundException {
					byte[] b = jclassObject.getBytes();
					return super.defineClass(name, jclassObject.getBytes(), 0, b.length);
				}
			};
		}

		/**
		 * Gives the compiler an instance of the JavaClassObject so that the
		 * compiler can write the byte code into it.
		 */
		@Override
		public JavaFileObject getJavaFileForOutput(Location location, String className,
				javax.tools.JavaFileObject.Kind kind, FileObject sibling) throws IOException {
			jclassObject = new JavaClassObject(className, kind, classOutputPath);
			return jclassObject;
		}
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
