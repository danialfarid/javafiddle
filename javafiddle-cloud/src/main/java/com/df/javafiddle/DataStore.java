package com.df.javafiddle;


import com.df.javafiddle.dbmap.DBMapper;
import com.df.javafiddle.model.Clazz;
import com.df.javafiddle.model.Lib;
import com.df.javafiddle.model.Project;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.UpdateOptions;
import org.bson.Document;

import static com.mongodb.client.model.Filters.eq;

public class DataStore {

    public static DataStore INSTANCE = new DataStore();

    MongoClient mongo = new MongoClient("localhost", 27017);
    MongoDatabase db = mongo.getDatabase("javafiddle");
    MongoCollection<Document> projects = db.getCollection("project");
    MongoCollection<Document> libs = db.getCollection("libs");
    public static final UpdateOptions UPSERT = new UpdateOptions().upsert(true);

    public Project createProject(Project project) {
        assert project.id != null;
        Project exists = findProject(project.id);
        if (exists != null) {
            return exists;
        }
        projects.insertOne(DBMapper.INSTANCE.toDocument(project));
        return project;
    }


    public Project findProject(String id) {
        Document document = projects.find(eq("id", id)).first();
        if (document == null) {
            return null;
        }
        return DBMapper.INSTANCE.toObject(new Project(), document);
    }

    public Lib findLib(String id) {
        Document document = projects.find(eq("_id", id)).first();
        if (document == null) {
            return null;
        }
        return DBMapper.INSTANCE.toObject(new Lib(), document);
    }

    public Lib createLib(Lib lib) {
        Document document = DBMapper.INSTANCE.toDocument(lib);
        libs.updateOne(document, new Document("$set", document), UPSERT);
        lib.id = libs.find(document).first().getObjectId("_id").toString();
        return lib;
    }

    public void addLibToProject(String projectId, String libId) {
        projects.updateOne(new Document("id", projectId),
                new Document("$push", new BasicDBObject("libs", libId)),
                UPSERT);
    }

    public void updateClass(String id, Clazz clazz) {
        projects.updateOne(new Document("id", id).append("classes.id", clazz.id),
                new Document("$set", new BasicDBObject("classes.$", DBMapper.INSTANCE.toDocument(clazz))));
    }

    public void createClass(String id, Clazz clazz) {
        projects.updateOne(new Document("id", id),
                new Document("$push", new BasicDBObject("classes", DBMapper.INSTANCE.toDocument(clazz))));
    }

//    protected Entity getLibEntity(String pkg, String name, String version) {
//        if (version != null) {
//            Entity entity = getLibExactVersion(pkg, name, version);
//            if (entity != null) return entity;
//        } else {
//            version = "";
//        }
//
//        Query q = new Query("Class");
//        q.addFilter("name", FilterOperator.EQUAL, name);
//        Iterable<Entity> entities = dataStore.prepare(q).asIterable();
//        String latestVersion = "";
//        Entity latestEntity = null;
//        for (Entity entity : entities) {
//            String v = (String) entity.getProperty("version");
//            if (v.startsWith(version)) {
//                if (isGreaterVersion(latestVersion, v)) {
//                    latestVersion = v;
//                    latestEntity = entity;
//                }
//            }
//        }
//        if (!latestVersion.equals("")) {
//            return latestEntity;
//        }
//        return null;
//    }
//
//    protected boolean isGreaterVersion(String v1, String v2) {
//        String s1 = v1.replaceAll("[^0-9\\.]+", "");
//        String s2 = v2.replaceAll("[^0-9\\.]+", "");
//        return s2.length() > s1.length() || s2.compareTo(s1) > 0;
//    }

    public String addLib(String id, String name, String url) {
//        deleteLib(id, name);
//        Entity lib = new Entity("Lib");
//        lib.setProperty("id", id);
//        lib.setProperty("name", name);
//        lib.setProperty("url", url);
//        lib.setProperty("date", new Date());
//        dataStore.put(lib);
        return name;
    }

    public void updateClass(String id, String name, String src) {
//        Filter filter = CompositeFilterOperator.and(new FilterPredicate("id", FilterOperator.EQUAL, id),
//                new FilterPredicate("name", FilterOperator.EQUAL, name));
//
//        Query q = new Query("Class").setFilter(filter);
//        Entity result = dataStore.prepare(q).asSingleEntity();
//
//        result.setProperty("src", src);
//        dataStore.put(result);
    }

    public void deleteClass(String id, String name) {
//        Filter filter = CompositeFilterOperator.and(new FilterPredicate("id", FilterOperator.EQUAL, id),
//                new FilterPredicate("name", FilterOperator.EQUAL, name));
//
//        Query q = new Query("Class").setFilter(filter);
//        Iterable<Entity> result = dataStore.prepare(q).asIterable();
//        for (Entity entity : result) {
//            dataStore.delete(entity.getKey());
//        }
    }

    public void deleteLib(String id, String name) {
//        Filter filter = CompositeFilterOperator.and(new FilterPredicate("id", FilterOperator.EQUAL, id),
//                new FilterPredicate("name", FilterOperator.EQUAL, name));
//
//        Query q = new Query("Lib").setFilter(filter);
//        Iterable<Entity> result = dataStore.prepare(q).asIterable();
//        for (Entity entity : result) {
//            dataStore.delete(entity.getKey());
//        }
    }

    public boolean getProject(String id) {
//        Filter filter = new FilterPredicate("id", FilterOperator.EQUAL, id);
//
//        Query q = new Query("Class").setFilter(filter);
//        int count = dataStore.prepare(q).countEntities(FetchOptions.Builder.withDefaults());
//        return count > 0;
        return false;
    }
}
