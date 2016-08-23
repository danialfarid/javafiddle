package com.df.javafiddle.dbmap;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;

import java.util.Map;

public class DBMapper {
    public static DBMapper INSTANCE = new DBMapper();
    ObjectMapper mapper = new ObjectMapper();

    {
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public <T> Document toDocument(T t) {
        return mapper.convertValue(t, Document.class);
    }

    public <T> T toObject(T t, Map obj) {
        return mapper.convertValue(obj, (Class<T>) t.getClass());
    }
}
