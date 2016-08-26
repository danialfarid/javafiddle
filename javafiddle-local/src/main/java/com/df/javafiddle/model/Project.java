package com.df.javafiddle.model;

import com.df.javafiddle.DynamicURLClassLoader;
import com.df.javafiddle.IOUtil;
import com.df.javafiddle.compiler.CompilationErrorDetails;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class Project {

    static char[] alphanumeric = new char[]{'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
            'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};
    static char[] letters = new char[]{'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
            'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'};

    public static ConcurrentHashMap<String, Project> allProjects = new ConcurrentHashMap<>();

    public static String MAIN_CLASS_NAME = "Main";

    public String id;

    public List<String> libs = new CopyOnWriteArrayList<>();
    public List<Clazz> classes = new CopyOnWriteArrayList<>();

    protected DynamicURLClassLoader classLoader;

    public Project() {
    }

    public Project init(String id) {
        if (id == null) {
            id = generateId();
        }
        this.id = id;
        allProjects.put(id, this);
        return this;
    }

    public Project initClassLoader() {
        String baseFolder = IOUtil.getTempFolder();
        new File(baseFolder + File.separator + id).mkdirs();
        try {
            classLoader = new DynamicURLClassLoader(baseFolder);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
//        classLoader = new DynamicURLClassLoader(new URL[]{new File(baseFolder).toURI().toURL()}, Project.class.getClassLoader(), id);
        return this;
    }

    public void addLib(Lib lib) {
//        libsMap.put(lib.name, lib);
        libs.add(lib.id);
        classLoader.addURL(lib.toUrl());
    }

    public void removeLib(int index) {
//        libsMap.remove(name);
        libs.remove(index);
        // classLoader.addURL(lib.url);
    }

    public CompilationErrorDetails createClass(Clazz clazz) {
//        classesMap.put(id + "." + clazz.name, clazz);
        classes.add(clazz);
        return classLoader.addClass(id + "." + clazz.name, clazz.src);
    }

    public CompilationErrorDetails updateClass(Clazz clazz) {
        return createClass(clazz);
    }

    public void removeClass(int index) {
        Clazz clazz = classes.remove(index);
        classLoader.remove(id + "." + clazz.name);
    }

    public static Project get(String projectId) {
        return allProjects.get(projectId);
    }

    public void run() {
        try {
            classLoader.loadClass(id + "." + MAIN_CLASS_NAME).getMethod("main", String[].class).invoke(null, (Object) null);
        } catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }


    protected String generateId() {
        return "" + random(letters) + random(alphanumeric) +
                random(alphanumeric) + random(alphanumeric) + random(alphanumeric) + random(alphanumeric);
    }

    protected char random(char[] c) {
        return c[(int) (c.length * Math.random())];
    }
}
