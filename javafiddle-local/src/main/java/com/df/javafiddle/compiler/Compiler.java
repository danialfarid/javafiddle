package com.df.javafiddle.compiler;

import com.df.javafiddle.DynamicURLClassLoader;
import com.df.javafiddle.IOUtil;

import javax.tools.*;
import java.io.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

public class Compiler {
    Logger logger = Logger.getLogger(Compiler.class.getName());

    protected JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();


    public DynamicURLClassLoader classLoader;

    public Compiler init(DynamicURLClassLoader classLoader) {
        this.classLoader = classLoader;
        return this;
    }

    public CompilationErrorDetails compile(String className, final String source, String outputFolder) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();

        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
        try {

            Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(new JavaSourceFromString(className, source));
            List<String> options = Arrays.asList("-cp", System.getProperty("java.class.path") + File.pathSeparatorChar + outputFolder, "-d", outputFolder);
            Boolean success = compiler.getTask(null, fileManager, diagnostics, options, null, compilationUnits).call();
            if (!success) {
                return handleCompileError(className, diagnostics);
            }
        } finally {
            try {
                fileManager.close();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return null;
    }

    private CompilationErrorDetails handleCompileError(String className, DiagnosticCollector<JavaFileObject> diagnostics) {
        List<CompileError> compileErrors = new ArrayList<>();
        Iterator<Diagnostic<? extends JavaFileObject>> it = diagnostics.getDiagnostics().iterator();
        while (true) {
            if (!it.hasNext())
                break;
            Diagnostic<? extends JavaFileObject> diagnostic = it.next();
            int lineStart = getLineStart(diagnostic.getSource(), diagnostic.getLineNumber());
            compileErrors.add(new CompileError().init(diagnostic.getMessage(null),
                    diagnostic.getLineNumber(), diagnostic.getStartPosition() - lineStart,
                    diagnostic.getEndPosition() - lineStart));
        }
        return new CompilationErrorDetails(className, compileErrors);
    }

    private int getLineStart(JavaFileObject source, long lineNumber) {
        try {
            Reader reader = source.openReader(true);
            int line = 1;
            int count = 0;
            while (line < lineNumber) {
                int i = reader.read();
                count++;
                if ((char) i == '\n') {
                    line++;
                }
            }
            return count;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws Exception {

        String baseFolder = IOUtil.getTempFolder();
        // Prepare source somehow.
        final String source = "package test; public class Test { static { System.out.println(\"hello\"); } public Test() { System.out.println(\"world\"); } }";
        final String source2 = "package test; public class Test2 { static { System.out.println(Test.class); } public Test2() { System.out.println(Test.class); } }";

// Save source in .java file.
        File root = new File(baseFolder + "/a" + Math.random()); // On Windows running on C:\, this is C:\java.
        root.mkdirs();

        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<JavaFileObject>();

        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);

        Iterable<? extends JavaFileObject> compilationUnits = Arrays.asList(new JavaSourceFromString("test.Test", source));
//                fileManager.getJavaFileObjectsFromFiles(Arrays.asList(sourceFile));
        compiler.getTask(null, fileManager, diagnostics, Arrays.asList("-cp", root.getPath(), "-d", root.getPath()), null, compilationUnits).call();

        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[]{root.toURI().toURL()});
        Class<?> cls = Class.forName("test.Test", true, classLoader); // Should print "hello".
        Object instance = cls.newInstance(); // Should print "world".
        System.out.println(instance);

        fileManager = compiler.getStandardFileManager(diagnostics, null, null);

        compilationUnits = Arrays.asList(new JavaSourceFromString("test.Test2", source2));
//                fileManager.getJavaFileObjectsFromFiles(Arrays.asList(sourceFile2));
        compiler.getTask(null, fileManager, diagnostics, Arrays.asList("-cp", root.getPath(), "-d", root.getPath()), null, compilationUnits).call();

        classLoader = URLClassLoader.newInstance(new URL[]{root.toURI().toURL()});
        cls = Class.forName("test.Test2", true, classLoader); // Should print "hello".
        instance = cls.newInstance(); // Should print "world".
        System.out.println(instance);

        fileManager.close();

//// Compile source file.
//        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
//        compiler.run(null, null, null, "-cp", root.getPath(), sourceFile.getPath());
////        compiler.run(null, null, null, "-cp", root.getPath(), sourceFile2.getPath());
//        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
//        JavacFileManager  javacFileManager = (JavacFileManager) compiler.getStandardFileManager(null, null, null);
//        ClassFileManager fileManager = new ClassFileManager(javacFileManager, root.getPath());
//        Boolean compileSuccess = compiler.getTask(null, fileManager, diagnostics,
//                Arrays.asList("-cp",  root.getPath(), "-d", root.getPath()),
//                null, Arrays.asList(new RegularFileObject(javacFileManager, sourceFile))).call();
//
//        Class<?> aClass = fileManager.getClassLoader(null).loadClass("test.Test");
//        System.out.println(aClass.newInstance());
//
//         compileSuccess = compiler.getTask(null, fileManager, diagnostics,
//                Arrays.asList("-cp", root.getPath() , "-d", root.getPath()),
//                 null, Arrays.asList(new RegularFileObject(javacFileManager, sourceFile2))).call();
//
//
//        System.out.println(compileSuccess);
//        aClass = fileManager.getClassLoader(null).loadClass("test.Test2");
//        System.out.println(aClass.newInstance());

// Load and instantiate compiled class.
//        URLClassLoader classLoader = URLClassLoader.newInstance(new URL[]{root.toURI().toURL()});
//        Class<?> cls = Class.forName("test.Test", true, classLoader); // Should print "hello".
//        Object instance = cls.newInstance(); // Should print "world".
//        System.out.println(instance); // Should print "test.Test@hashcode".
//        Class<?> cls2 = Class.forName("test.Test2", true, classLoader); // Should print "hello".
//        Object instance2 = cls2.newInstance(); // Should print "world".
//        System.out.println(instance2); // Should print "test.Test@hashcode".


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
