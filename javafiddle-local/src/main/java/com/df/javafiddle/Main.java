package com.df.javafiddle;

import com.df.javafiddle.server.JFServer;

import java.io.IOException;

public class Main {
	public static void main(String[] args) throws IOException {
		JFServer server = new JFServer();
		server.start(8020);
	}
}