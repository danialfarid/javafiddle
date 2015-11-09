package com.df.javafiddle.server;

import com.oracle.javafx.jmx.json.JSONDocument;
import com.oracle.javafx.jmx.json.JSONFactory;
import com.oracle.javafx.jmx.json.JSONReader;

import java.io.StringReader;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;

public class JSON {
    public static JSON INSTANCE = new JSON();
    public static Set<Class<?>> PRIMITIVE_TYPES = new HashSet<>();

    static {
        PRIMITIVE_TYPES.add(Boolean.class);
        PRIMITIVE_TYPES.add(Character.class);
        PRIMITIVE_TYPES.add(Byte.class);
        PRIMITIVE_TYPES.add(Short.class);
        PRIMITIVE_TYPES.add(Integer.class);
        PRIMITIVE_TYPES.add(Long.class);
        PRIMITIVE_TYPES.add(Float.class);
        PRIMITIVE_TYPES.add(Double.class);
        PRIMITIVE_TYPES.add(Void.class);
    }

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

    protected <T> T docToObject(Class<T> c, JSONDocument doc) {
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

    private String stringifyObj(Object obj) {
        if (obj == null) {
            return null;
        }

        StringBuilder sb = new StringBuilder("{");
        Field[] fields = obj.getClass().getDeclaredFields();
        for (Field field : fields) {
            if (Modifier.isPublic(field.getModifiers())) {
                try {
                    sb.append("\"").append(field.getName()).append("\"").append(":");
                    sb.append(internalStringify(field.get(obj))).append(",");
                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        if (sb.length() > 1) {
            sb.deleteCharAt(sb.length() - 1);
        }
        sb.append("}");
        return sb.toString();
    }

    public String stringify(Object obj) {
        if (obj instanceof String) {
            return (String) obj;
        }
        return internalStringify(obj).toString();
    }

    protected Object internalStringify(Object obj) {
        if (obj == null) {
            return null;
        } else if (obj instanceof String) {
            return quote(((String) obj));
        } else if (obj.getClass().isPrimitive() || PRIMITIVE_TYPES.contains(obj.getClass())) {
            return obj;
        } else if (obj instanceof Collection) {
            ArrayList<Object> list = new ArrayList<>();
            for (Object o : (Collection) obj) {
                list.add(internalStringify(o));
            }
            return list.toString();
        } else {
            return stringifyObj(obj);
        }
    }

    protected static class Val<T> {
        public T v;

        public static <T> Class<Val<T>> getType() {
            //noinspection unchecked
            return (Class<Val<T>>) new Val<T>().getClass();
        }
    }

    protected String quote(String string) {
        if (string == null || string.length() == 0) {
            return "\"\"";
        }

        char         c = 0;
        int          i;
        int          len = string.length();
        StringBuilder sb = new StringBuilder(len + 4);
        String       t;

        sb.append('"');
        for (i = 0; i < len; i += 1) {
            c = string.charAt(i);
            switch (c) {
                case '\\':
                case '"':
                    sb.append('\\');
                    sb.append(c);
                    break;
                case '/':
                    //                if (b == '<') {
                    sb.append('\\');
                    //                }
                    sb.append(c);
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                default:
                    if (c < ' ') {
                        t = "000" + Integer.toHexString(c);
                        sb.append("\\u" + t.substring(t.length() - 4));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append('"');
        return sb.toString();
    }

    public static void main(String[] args) {
        JSONReader jsonReader = JSONFactory.instance().makeReader(new StringReader("{\"a\":2, \"b\": {\"c\":\"aa\"}}"));

        Map<String, Object> map = jsonReader.build().object();
        System.out.println(map);
        System.out.println(map.keySet());
        System.out.println(map.get("b").getClass());
    }
}
