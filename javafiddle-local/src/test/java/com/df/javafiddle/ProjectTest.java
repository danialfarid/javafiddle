package com.df.javafiddle;

import org.junit.Ignore;
import org.junit.Test;

public class ProjectTest {

    @Ignore
	@Test
	public void testExternalLib() {
		Project project = new Project().init("1");
		project.createLib(new Lib().init("com.google.guava.guava#18.0", "maven"));
		project.updateClass(new Clazz().init("Main", "import com.google.common.collect.Maps;"
                + "public class Main {\r\n\tpublic static void main(String args[]) {"
                + "System.out.println(\"aaa\");"
                + "\r\n\t\t\r\n\t}\r\n}"));
		project.run();
	}

    @Ignore
	@Test
	public void testPackage() {
		Project project = new Project().init("1");
		project.createLib(new Lib().init("com.google.guava.guava#18.0", "maven"));
		project.createClass(new Clazz().init("Main", "package com.df.test; import com.df.test.A;"
				+ "public class Main {\r\n\tpublic static void main(String args[]) {"
				+ "System.out.println(new A());"
				+ "\r\n\t\t\r\n\t}\r\n}"));
		project.createClass(new Clazz().init("A", "package com.df.test;"
				+ "public class A {\r\n\tpublic String a() {"
				+ "return \"aaa\";"
				+ "\r\n\t\t\r\n\t}\r\n}"));
		project.run();
	}
	
}
