package com.df.javafiddle.compiler;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.URI;

import javax.tools.SimpleJavaFileObject;

public class JavaClassObject extends SimpleJavaFileObject {
	protected final URI pathURI;

	/**
	 * Byte code created by the compiler will be stored in this ByteArrayOutputStream so that we can later
	 * get the byte array out of it and put it in the memory as an instance of our class.
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
	 * Registers the compiled class object under URI containing the class full name
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
	 * Will be used by our file manager to get the byte code that can be put into memory to instantiate
	 * our class
	 * 
	 * @return compiled byte code
	 */
	public byte[] getBytes() {
		return bos.toByteArray();
	}

	/**
	 * Will provide the compiler with an output stream that leads to our byte array. This way the compiler
	 * will write everything into the byte array that we will instantiate later
	 */
	@Override
	public OutputStream openOutputStream() throws IOException {
		return bos;
	}
}