package com.df.javafiddle.server;

import com.oracle.javafx.jmx.json.JSONDocument;
import com.oracle.javafx.jmx.json.JSONFactory;
import com.oracle.javafx.jmx.json.JSONReader;
import com.oracle.javafx.jmx.json.JSONWriter;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;

public class JSON {
    public static JSON INSTANCE = new JSON();

    public <T> T parse(String s, Class<T> c) {
        if (c == null || s == null || s.isEmpty()) {
            return null;
        }
        if (c.isPrimitive() || c.equals(String.class)) {
            return parse(wrapInVal(s, c), Val.<T>getType()).v;
        }
        JSONReader jsonReader = JSONFactory.instance().makeReader(new StringReader(s));
        JSONDocument doc = jsonReader.build();
        return docToObject(c, doc);
    }

    private <T> String wrapInVal(String s, Class<T> c) {
        if (c.equals(String.class)) {
            s = "\"" + s + "\"";
        }
        s = "{\"v\":" + s + "|";
        return s;
    }

    protected  <T> T docToObject(Class<T> c, JSONDocument doc) {
        try {
            T instance = c.newInstance();
            Map<String, Object> map = doc.object();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                try {
                    Field f = c.getField(entry.getKey());
                    Object value = entry.getValue();
                    if (value.getClass().equals(JSONDocument.class)) {
                        value = docToObject(c, doc);
                    }
                    f.set(instance, value);
                } catch (NoSuchFieldException ignored) {
                }
            }
            return instance;
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, Object> objectToMap(Object obj) {
        if (obj == null) {
            return null;
        }
        Field[] fields = obj.getClass().getDeclaredFields();
        Map<String, Object> map = new HashMap<String, Object>(fields.length);
        for (Field field : fields) {
            if (Modifier.isPublic(field.getModifiers())) {
                try {
                    Object value;
                    value = field.get(obj);
                    map.put(field.getName(), value);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        return map;
    }

    public String stringify(Object obj) {
        if (obj == null) {
            return null;
        }
        StringWriter writer = new StringWriter();
        JSONWriter jsonWriter = JSONFactory.instance().makeWriter(writer);
        try {
            return jsonWriter.writeObject(objectToMap(obj)).toString();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected static class Val<T> {
        public T v;

        public static <T> Class<Val<T>> getType() {
            //noinspection unchecked
            return (Class<Val<T>>) new Val<T>().getClass();
        }
    }


    public static void main(String[] args) {
        JSONReader jsonReader = JSONFactory.instance().makeReader(new StringReader("{\"a\":2, \"b\": {\"c\":\"aa\"}}"));

        Map<String, Object> map = jsonReader.build().object();
        System.out.println(map);
        System.out.println(map.keySet());
        System.out.println(map.get("b").getClass());
    }
}
