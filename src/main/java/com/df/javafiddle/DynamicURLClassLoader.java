package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.concurrent.ConcurrentHashMap;

public class DynamicURLClassLoader extends URLClassLoader {

	protected ConcurrentHashMap<String, String> newClassesMap = new ConcurrentHashMap<String, String>();
	protected ConcurrentHashMap<String, Boolean> removedClasses = new ConcurrentHashMap<String, Boolean>();

	protected ConcurrentHashMap<String, Class<?>> classes = new ConcurrentHashMap<String, Class<?>>();

	Compiler compiler;
	ByteArrayOutputStream logStream = new ByteArrayOutputStream();
	protected final String projectId;

	public DynamicURLClassLoader(URL[] urls, ClassLoader parent, String projectId) {
		super(urls, parent);
		this.projectId = projectId;
		compiler = new Compiler().init(this);
	}

	@Override
	protected Class<?> findClass(String name) throws ClassNotFoundException {
		return super.findClass(name);
	}

	@Override
	public Class<?> loadClass(String name) throws ClassNotFoundException {
		String source;
		if ((source = newClassesMap.remove(name)) != null) {
			classes.remove(name);
			try {
				Class<?> compiled = compiler.compile(name, source, projectId);
				classes.put(name, compiled);
				return compiled;
			} catch (CompilationErrorException e) {
				newClassesMap.put(name, source);
			}
			// return Class.forName(name);
			// return defineClass(name, , 0, bytes.length);
		} else if (removedClasses.containsKey(name)) {
			throw new ClassNotFoundException(name);
		} else if (classes.containsKey(name)) {
			return classes.get(name);
		}
		// return getParent().loadClass(name);
		return super.loadClass(name);
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
