package com.df.javafiddle;

import com.df.javafiddle.model.Lib;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.IOException;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class MavenSearchIndexer {

    public static final String MAVEN_BASE = "https://repo1.maven.org/maven2/";

    public void run() {
        extractLinks(MAVEN_BASE);
    }

    private void extractLinks(String url) {
        Pattern linkPattern = Pattern.compile(
                "<a[^>]+href=[\"']?([^\"'>]+)",
                Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
        try {
            Matcher pageMatcher = linkPattern.matcher(IOUtil.readURL(url));
            while (pageMatcher.find()) {
                String s = pageMatcher.group(1);
                char c = s.charAt(0);
                if (c == Character.toLowerCase(c) && (Character.isAlphabetic(c) || Character.isDigit(c))) {
                    if (s.endsWith("/")) {
                        extractLinks(url + s);
                    } else if (s.endsWith(".jar") && !s.endsWith("sources.jar") && !s.endsWith("javadoc.jar")) {
                        saveJar(url, s);
                        System.out.println(url + s);
                    }
                }
            }
        } catch (IOException e) {
            System.out.println(url);
            throw new RuntimeException(e);
        }
    }

    private void saveJar(String url, String s) throws IOException {
        String[] split = url.split("/");
        String version = split[split.length - 1];
        String name = split[split.length - 2];
        String pkg = IntStream.range(4, split.length - 2).boxed().map(i -> split[i]).collect(Collectors.joining("."));
        Lib lib = new Lib().init(pkg, name, version, url + s);
        lib = DataStore.INSTANCE.createLib(lib);
//        storeDependencies(url, s, lib);
    }

    private void storeDependencies(String url, String s, Lib lib) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc;
            try {
                doc = db.parse(new URL(url + s.replace(".jar", ".pom")).openStream());
            } catch (IOException e) {
                return;
            }
            XPathFactory factory = XPathFactory.newInstance();
            XPath xpath = factory.newXPath();
            XPathExpression expr = xpath.compile("/project/dependencies/dependency");
            NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++) {
                Node node = nodes.item(i);
                NodeList nodeList = node.getChildNodes();
                String depPkg = nodeList.item(1).getTextContent();
                String depName = nodeList.item(3).getTextContent();
                String depVersion = "";
                if (nodeList.getLength() > 5) {
                    depVersion = nodeList.item(5).getTextContent();
                }
                Lib depLib = new Lib().init(depPkg, depName, depVersion, MAVEN_BASE + depPkg.replace(".", "/") +
                        "/" + depName + "/" + depVersion + "/" + depName + "." + depVersion + ".jar");
                depLib = DataStore.INSTANCE.createLib(depLib);
                lib.addDependency(depLib.id);
//                DataStore.INSTANCE.createLibDep(name, version, childNodes.item(0).);
//                for (int j = 0; j < childNodes.getLength(); j++) {
//                }
            }
            DataStore.INSTANCE.createLib(lib);
        } catch (ParserConfigurationException | SAXException | XPathExpressionException e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws IOException {
        new MavenSearchIndexer().run();
    }
}
