package com.df.javafiddle;

import com.df.javafiddle.model.Project;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.ArrayList;
import java.util.List;

public class IOUtil {
	public static String readFile(File file) throws IOException {
		return readStream(new FileInputStream(file));
	}

	public static String readURL(URL url) throws IOException {
		HttpURLConnection connection = (HttpURLConnection)url.openConnection();
		connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'");
		return readStream(connection.getInputStream());
	}

	public static String readURL(String url) throws IOException {
		return readURL(new URL(url));
	}

	public static String readStream(InputStream is) throws IOException {
		try {
			return new String(readStreamAsBytes(is), "UTF-8");
		} finally {
			is.close();
		}
	}

	public static byte[] readStreamAsBytes(InputStream is) throws IOException {
		int c;
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
	
	public static void downloadUrlToFile(URL url, String filePath) throws IOException {
		File file = new File(filePath);
		if (!file.exists()) {
			ReadableByteChannel rbc;
			rbc = Channels.newChannel(url.openStream());
			//noinspection ResultOfMethodCallIgnored
			file.getParentFile().mkdirs();
			try (FileOutputStream fos = new FileOutputStream(file)) {
				fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
			}
		}
	}

	public static String getTempFolder() {
		return System.getProperty("java.io.tmpdir") + "javafiddle";
	}

    public static String readStack(Throwable e) {
		e = e.getCause() != null ? e.getCause() : e;
		List<StackTraceElement> traceElementList = new ArrayList<>();
		for (StackTraceElement stackTraceElement : e.getStackTrace()) {
			if (!stackTraceElement.getClassName().startsWith(Project.class.getPackage().getName())) {
				traceElementList.add(stackTraceElement);
			}
		}

		e.setStackTrace(traceElementList.toArray(new StackTraceElement[traceElementList.size()]));
        StringWriter stringWriter = new StringWriter();
		e.printStackTrace(new PrintWriter(stringWriter));
        return stringWriter.toString();
    }
}
