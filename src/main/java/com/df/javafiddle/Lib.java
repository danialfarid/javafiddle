package com.df.javafiddle;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;

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
	public static String MAVEN_URL = "http://repo.maven.apache.org/maven2/";

	public String name;
	public String type;
	public URL url;

	public Lib init(String name, String type, String url) {
		this.name = name;
		this.type = type;

		try {
			this.url = url == null ? null : new URL(url);
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}

		if (type.equalsIgnoreCase("maven")) {
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
			String filePath = basePath + "/" + version + "/" + name.substring(name.lastIndexOf('.') + 1) + "-"
					+ version + ".jar";
			String localFilePath = getLocalMavenRepoPath() + "/" + filePath;

			try {
				if (version.isEmpty()) {
					DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
					DocumentBuilder db = dbf.newDocumentBuilder();
					Document doc = db.parse(new URL(mavenUrl + "maven-metadata.xml").openStream());
					XPathFactory factory = XPathFactory.newInstance();
					XPath xpath = factory.newXPath();
					XPathExpression expr = xpath.compile("/metadata/versioning/versions/version[last()]");
					NodeList nodes = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);
					version = nodes.item(nodes.getLength() - 1).getTextContent();
				}

				if (!new File(localFilePath).exists()) {
					URL website;
					website = new URL(MAVEN_URL + filePath);
					ReadableByteChannel rbc;
					rbc = Channels.newChannel(website.openStream());
					FileOutputStream fos = new FileOutputStream(localFilePath);
					try {
						fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
					} finally {
						fos.close();
					}
				}
				this.url = new File(localFilePath).toURI().toURL();

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
		}
		return this;
	}

	protected String getLocalMavenRepoPath() {
		return System.getProperty("user.home") + ".m2/repository";
	}

}
