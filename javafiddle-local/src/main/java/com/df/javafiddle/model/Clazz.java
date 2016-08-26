package com.df.javafiddle.model;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Clazz {
	public String id;
	public String name;
	public String src;

	public Clazz init(String name, String src) {
		this.name = name;
        this.src = src;
        return this;
	}

	public static Clazz defaultMainClass(String pkg) {
		Clazz clazz = new Clazz().init("Main",
				"package " + pkg + ";\n\n" +
						"public class Main {\r\n\tpublic static void clazz(String args[]) {\r\n\t\t\r\n\t}\r\n}");
		clazz.id = generateId();
		return clazz;
	}

	public static Clazz defaultClass(String pkg, String name) {
		String className = name;
		int i = name.lastIndexOf(".");
		if (i > -1) {
			pkg += "." + name.substring(0, i);
			className = name.substring(i + 1);
		}
		Clazz clazz = new Clazz().init(name,
				"package " + pkg + ";\n\n" + "public class " + className + " {\r\n}");
		clazz.id = generateId();
		return clazz;
	}

	private static String generateId() {
		return Long.toHexString(System.currentTimeMillis());
	}
}
