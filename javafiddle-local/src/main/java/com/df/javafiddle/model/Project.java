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

    public static ConcurrentHashMap<String, Project> allProjects = new ConcurrentHashMap<>();

    public static String MAIN_CLASS_NAME = "Main";

    public String id;

    public List<String> libs = new CopyOnWriteArrayList<>();
    public List<Clazz> classes = new CopyOnWriteArrayList<>();

    protected DynamicURLClassLoader classLoader;

    public Project() {
    }

    public Project init(String id) {
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

    public Clazz createDefaultClass() {
        return new Clazz().init("Main",
                "package " + id + ";\n\n" +
                        "public class Main {\r\n\tpublic static void main(String args[]) {\r\n\t\t\r\n\t}\r\n}");
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
}
