package com.df.javafiddle;

public class StringUtil {

	public static String removeNoneAlphanumeric(String... strings) {
		StringBuilder builder = new StringBuilder();
		for (String string : strings) {
			builder.append(string.replaceAll("[^\\w\\d_]", ""));
		}
		return builder.toString();
	}

}
