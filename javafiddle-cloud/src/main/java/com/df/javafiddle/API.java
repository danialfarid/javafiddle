package com.df.javafiddle;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.config.Named;
import com.google.api.server.spi.response.BadRequestException;

import java.util.List;

import static com.google.api.server.spi.config.ApiMethod.HttpMethod.*;

@Api(name = "jf", version = "v1",
        namespace = @ApiNamespace(ownerDomain = "com.df.javafiddle", ownerName = "danial.farid"))
public class API {

    @ApiMethod(httpMethod = GET, path = "p/{id}")
    public Project getProject(@Named("id") String id) throws BadRequestException {
        if (DataStore.INSTANCE.getProject(id)) {
            return new Project().init(id);
        } else {
            throw new BadRequestException("Not Found project with id " + id);
        }
    }

    @ApiMethod(httpMethod = POST, path = "p")
    public Project createProject() {
        return DataStore.INSTANCE.createProject();
    }

    @ApiMethod(httpMethod = GET, path = "p/{id}/class")
    public List<Clazz> getClasses(@Named("id") String id) {
        return DataStore.INSTANCE.getClasses(id);
    }

    @ApiMethod(httpMethod = GET, path = "p/{id}/lib")
    public List<Lib> getLibs(@Named("id") String id) {
        return DataStore.INSTANCE.getLibs(id);
    }

    @ApiMethod(httpMethod = POST, path = "p/{id}/class")
    public Clazz createClass(@Named("id") String id, Clazz clazz) {
        clazz.src = DataStore.INSTANCE.createClass(id, clazz.name);
        return clazz;
    }

    @ApiMethod(httpMethod = POST, path = "p/{id}/lib")
    public Lib createLib(@Named("id") String id, Lib lib) {
        DataStore.INSTANCE.createLib(id, lib.name, lib.url);
        return lib;
    }

    @ApiMethod(httpMethod = PUT, path = "p/{id}/class")
    public void updateClass(@Named("id") String id, Clazz clazz) {
        DataStore.INSTANCE.updateClass(id, clazz.name, clazz.src);
    }

    @ApiMethod(httpMethod = DELETE, path = "p/{id}/class")
    public void deleteClass(@Named("id") String id, Clazz clazz) {
        DataStore.INSTANCE.deleteClass(id, clazz.name);
    }

    @ApiMethod(httpMethod = DELETE, path = "p/{id}/lib")
    public void deleteLib(@Named("id") String id, Lib lib) {
        DataStore.INSTANCE.deleteLib(id, lib.name);
    }
}
