package com.df.javafiddle;

import java.io.*;
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
    public Map<String, Clazz> classesMap = new ConcurrentHashMap<String, Clazz>();

    private DynamicURLClassLoader classLoader;

    public Project() {
    }

    public Project init(String id) {
        this.id = id;
        allProjects.put(id, this);
        return this;
    }

    public Project initClassLoader() {
        classLoader = new DynamicURLClassLoader(new URL[]{}, Project.class.getClassLoader(), id);
        return this;
    }

    public void createLib(Lib lib) {
        libs.put(lib.name, lib);
        classLoader.addURL(lib.toUrl());
    }

    public void removeLib(String name) {
        libs.remove(name);
        // classLoader.addURL(lib.url);
    }

    public Lib getLib(String name) {
        return libs.get(name);
    }

    public void createClass(Clazz clazz) {
        classesMap.put(clazz.name, clazz);
        classLoader.addClass(clazz.name, clazz.src);
    }

    public void updateClass(Clazz clazz) {
        createClass(clazz);
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

    public Clazz getClass(String className) {
        return classesMap.get(className);
    }

    public void run() {
        try {
            classLoader.loadClass(MAIN_CLASS_NAME).getMethod("main", String[].class).invoke(null, (Object) null);
        } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
