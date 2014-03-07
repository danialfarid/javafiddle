package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.concurrent.ConcurrentHashMap;

public class DynamicURLClassLoader extends URLClassLoader {

	protected ConcurrentHashMap<String, String> newClassesMap = new ConcurrentHashMap<String, String>();
	protected ConcurrentHashMap<String, Boolean> removedClasses = new ConcurrentHashMap<String, Boolean>();

	Compiler compiler = new Compiler();
	ByteArrayOutputStream logStream = new ByteArrayOutputStream();

	public DynamicURLClassLoader(URL[] urls, ClassLoader parent) {
		super(urls, parent);
	}

	@Override
	public Class<?> loadClass(String name) throws ClassNotFoundException {
		String source;
		if ((source = newClassesMap.remove(name)) != null) {
			compiler.compile(name, source);
			return Class.forName(name);
			// return defineClass(name, , 0, bytes.length);
		} else if (removedClasses.containsKey(name)) {
			throw new ClassNotFoundException(name);
		}
		return getParent().loadClass(name);
	}

	@Override
	public void addURL(URL url) {
		super.addURL(url);
	}

	public void addClass(String name, String source) {
		newClassesMap.put(name, source);
	}

	public void remove(String className) {
		removedClasses.put(className, true);
	}
}
