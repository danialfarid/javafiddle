package com.df.javafiddle;

public class StringUtil {

	public static String removeNoneAlphanumeric(String... strs) {
		StringBuilder builder = new StringBuilder();
		for (String string : strs) {
			builder.append(string.replaceAll("[^\\w\\d_]", ""));
		}
		return builder.toString();
	}

}
