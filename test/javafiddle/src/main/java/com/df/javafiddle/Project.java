package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Project {

	public static ConcurrentHashMap<String, Project> allProjects = new ConcurrentHashMap<String, Project>();

	public static String MAIN_CLASS_NAME = "Main";

	public String id;
	public Map<String, Lib> libs = new ConcurrentHashMap<String, Lib>();
	public Map<String, String> classesMap = new ConcurrentHashMap<String, String>();

	public DynamicURLClassLoader classLoader;

	public Project() {
	}

	public Project(String id) {
		this.id = id;
		classLoader = new DynamicURLClassLoader(new URL[] {}, Project.class.getClassLoader(), id);
		allProjects.put(id, this);
	}

	public void createLib(Lib lib) {
		libs.put(lib.name, lib);
		classLoader.addURL(lib.url);
	}

	public void removeLib(String name) {
		libs.remove(name);
		// classLoader.addURL(lib.url);
	}

	public Lib getLib(String name) {
		return libs.get(name);
	}

	public void createClass(String className, String src) {
		classesMap.put(className, src);
		classLoader.addClass(className, src);
	}

	public void updateClass(String name, String bytes) {
		classesMap.put(name, bytes);
		classLoader.addClass(name, bytes);
	}

	public void removeClass(String className) {
		classesMap.remove(className);
		classLoader.remove(className);
	}

	public static String readFile(File file) throws IOException {
		return readStream(new FileInputStream(file));
	}

	public static String readURL(URL url) throws IOException {
		return readStream(url.openStream());
	}

	public static String readStream(InputStream is) throws IOException {
		try {
			return new String(readStreamAsBytes(is), "UTF-8");
		} finally {
			is.close();
		}
	}

	public static byte[] readStreamAsBytes(InputStream is) throws IOException {
		int c = 0;
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		byte[] buffer = new byte[2048];
		while ((c = is.read(buffer)) > 0) {
			os.write(buffer, 0, c);
		}
		return os.toByteArray();
	}

	public static URL toURL(File file) {
		try {
			return file.toURI().toURL();
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}
	}

	public static Project get(String projectId) {
		return allProjects.get(projectId);
	}

	public String getClass(String className) {
		return classesMap.get(className);
	}

	public void run() {
		try {
			classLoader.loadClass(MAIN_CLASS_NAME).getMethod("main", String[].class).invoke(null, (Object) null);
		} catch (IllegalAccessException e) {
			throw new RuntimeException(e);
		} catch (IllegalArgumentException e) {
			throw new RuntimeException(e);
		} catch (InvocationTargetException e) {
			throw new RuntimeException(e);
		} catch (NoSuchMethodException e) {
			throw new RuntimeException(e);
		} catch (SecurityException e) {
			throw new RuntimeException(e);
		} catch (ClassNotFoundException e) {
			throw new RuntimeException(e);
		}
	}
}
