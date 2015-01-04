package com.df.javafiddle;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class Lib {
	private static final String DEFAULT_LIB_DOWNLOAD_FOLDER = "javafiddle-libs";

	public static String MAVEN_URL = "http://repo.maven.apache.org/maven2/";

	public String name;
	public URL url;

	public Lib init(String name, String url) {
		this.name = name;

		if ("maven".equalsIgnoreCase(url)) {
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
					this.name = name;
				}

				String filePath = basePath + "/" + version + "/" + jarName + "-" + version + ".jar";
				String localFilePath = getLocalMavenRepoPath() + "/" + filePath;

				IOUtil.downloadUrlToFile(new URL(MAVEN_URL + filePath), localFilePath);
				this.url = new URL(localFilePath);

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
				this.url = url == null ? null : new URL(url);
				String fileName = IOUtil.getTempFolderForId(DEFAULT_LIB_DOWNLOAD_FOLDER) + 
						StringUtil.removeNoneAlphanumeric(url, name);
				IOUtil.downloadUrlToFile(this.url, fileName);
			} catch (MalformedURLException e) {
				throw new RuntimeException(e);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}
		return this;
	}

	protected String getLocalMavenRepoPath() {
		return System.getProperty("user.home") + "/.m2/repository";
	}

}
