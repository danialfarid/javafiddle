package com.df.javafiddle;

import com.df.javafiddle.compiler.CompilationErrorDetails;
import com.df.javafiddle.compiler.Compiler;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.concurrent.ConcurrentHashMap;

public class DynamicURLClassLoader extends URLClassLoader {

    protected ConcurrentHashMap<String, Boolean> removedClasses = new ConcurrentHashMap<>();
    protected ConcurrentHashMap<String, String> classes = new ConcurrentHashMap<>();

    Compiler compiler;
    String path;

    public DynamicURLClassLoader(String path) throws MalformedURLException {
        super(new URL[]{new File(path).toURI().toURL()}, null);
        this.path = path;
        compiler = new Compiler().init(this);
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        return super.findClass(name);
    }

    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        if (removedClasses.containsKey(name)) {
            throw new ClassNotFoundException(name);
        } else if (classes.containsKey(name)) {
            URLClassLoader classLoader = URLClassLoader.newInstance(this.getURLs());
            return Class.forName(name, true, classLoader);
//            return super.findClass(name);
        }
        return super.loadClass(name);
    }

    @Override
    public void addURL(URL url) {
        super.addURL(url);
    }

    public CompilationErrorDetails addClass(String name, String source) {
        CompilationErrorDetails errorDetails = compiler.compile(name, source, path);
        if (errorDetails == null) {
            classes.put(name, name);
        }
        return errorDetails;
    }

    public void remove(String className) {
        removedClasses.put(className, true);
    }
}
