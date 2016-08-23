package com.df.javafiddle.model;

public class Clazz {
	public String id;
	public String name;
	public String src;

	public Clazz init(String name, String src) {
		this.name = name;
        this.src = src;
        return this;
	}
}
