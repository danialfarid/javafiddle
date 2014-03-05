package com.df.javafiddle;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;

public class IOUtil {
	public static String readFile(File file) throws IOException {
		return readStream(new FileInputStream(file));
	}

	public static String readURL(URL url) throws IOException {
		return readStream(url.openStream());
	}

	public static String readStream(InputStream is) throws IOException {
		try {
			return new String(readStreamAsBytes(is), "UTF-8");
		} finally {
			is.close();
		}
	}

	public static byte[] readStreamAsBytes(InputStream is) throws IOException {
		int c = 0;
		ByteArrayOutputStream os = new ByteArrayOutputStream();
		byte[] buffer = new byte[2048];
		while ((c = is.read(buffer)) > 0) {
			os.write(buffer, 0, c);
		}
		return os.toByteArray();
	}

	public static URL toURL(File file) {
		try {
			return file.toURI().toURL();
		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		}
	}
}
