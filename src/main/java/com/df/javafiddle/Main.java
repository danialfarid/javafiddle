package com.df.javafiddle;

import java.io.IOException;

public class Main {
	public static void main(String[] args) throws IOException {
		Server server = new Server();
		server.start(8020);
	}
}