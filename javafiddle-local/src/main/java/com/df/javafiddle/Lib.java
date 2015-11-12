package com.df.javafiddle;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

public class Lib {
	private static final String DEFAULT_LIB_DOWNLOAD_FOLDER = "javafiddle-libs";

	public static String MAVEN_URL = "http://repo.maven.apache.org/maven2/";

	public String name;
	public String url;

	public Lib init(String name, String url) {
		this.name = name;
        this.url = url;
		return this;
	}

    public Lib resolveUrl() {
        URL resolvedUrl;
        if ("maven".equalsIgnoreCase(this.url)) {
            if (name.endsWith(".jar")) {
                name = name.substring(0, name.length() - 4);
            }
            String version = "";
            int hashIndex = name.lastIndexOf("#");
            if (hashIndex > -1) {
                version = name.substring(hashIndex + 1);
                name = name.substring(0, hashIndex);
            }

            String basePath = name.replace('.', '/');
            String mavenUrl = MAVEN_URL + basePath;
            String jarName = name.substring(name.lastIndexOf('.') + 1);

            try {
                if (version.isEmpty()) {
                    DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
                    DocumentBuilder db = dbf.newDocumentBuilder();
                    Document doc = db.parse(new URL(mavenUrl + "/maven-metadata.xml").openStream());
                    XPathFactory factory = XPathFactory.newInstance();
                    XPath xpath = factory.newXPath();
                    XPathExpression expr = xpath.compile("/metadata/versioning/versions/version[last()]");
                    NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
                    version = nodes.item(nodes.getLength() - 1).getTextContent();
                    name = name + "#" + version;
                }

                String filePath = basePath + "/" + version + "/" + jarName + "-" + version + ".jar";
                String localFilePath = getLocalMavenRepoPath() + "/" + filePath;

                IOUtil.downloadUrlToFile(new URL(MAVEN_URL + filePath), localFilePath);
                resolvedUrl = new File(localFilePath).toURI().toURL();

            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            } catch (ParserConfigurationException e) {
                throw new RuntimeException(e);
            } catch (XPathExpressionException e) {
                throw new RuntimeException(e);
            } catch (SAXException e) {
                throw new RuntimeException(e);
            }
        } else {
            try {
                resolvedUrl = this.url == null ? null : new URL(this.url);
                String fileName = IOUtil.getTempFolder() + File.separator + DEFAULT_LIB_DOWNLOAD_FOLDER +
                        File.separator + StringUtil.removeNoneAlphanumeric(this.url, name);
                IOUtil.downloadUrlToFile(resolvedUrl, fileName);
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        this.url = resolvedUrl.toString();
        return this;
    }

    public URL toUrl() {
        try {
            return new URL(url);
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    protected String getLocalMavenRepoPath() {
		return System.getProperty("user.home") + "/.m2/repository";
	}

}
