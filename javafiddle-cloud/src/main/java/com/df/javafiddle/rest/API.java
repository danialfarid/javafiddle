package com.df.javafiddle.rest;

import com.df.javafiddle.DataStore;
import com.df.javafiddle.MavenSearchIndexer;
import com.df.javafiddle.model.Clazz;
import com.df.javafiddle.model.Lib;
import com.df.javafiddle.model.Project;

import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import java.io.IOException;

@Path("/")
@Produces("application/json")
@Consumes("application/json")
public class API {

    @Path("/p/{id}")
    @GET
    public Project getProject(@PathParam("id") String id) throws BadRequestException {
        Project project = DataStore.INSTANCE.findProject(id);
        if (project == null) {
            throw new BadRequestException("Not Found project with id " + id);
        }
        return project;
    }

    @Path("/p")
    @POST
    public Project createProject() {
        Project project = new Project().init(null);
        Clazz defaultClass = Clazz.defaultMainClass(project.id);
        project.classes.add(defaultClass);

        return DataStore.INSTANCE.createProject(project);
    }

    @Path("/lib/{id}")
    @GET
    public Lib getLib(@PathParam("id") String id) {
        return DataStore.INSTANCE.findLib(id);
    }

    @Path("/p/{id}/class")
    @POST
    public Clazz createClass(@NotNull @PathParam("id") String id, Clazz clazz) {
        assert clazz.name != null;
        clazz = Clazz.defaultClass(id, clazz.name);
        DataStore.INSTANCE.createClass(id, clazz);
        return clazz;
    }

    @Path("/p/{id}/class")
    @PUT
    public Clazz updateClass(@NotNull @PathParam("id") String id, Clazz clazz) {
        assert clazz.id != null;
        DataStore.INSTANCE.updateClass(id, clazz);
        return clazz;
    }

    @Path("/p/{id}/lib")
    @POST
    public Lib createLib(@PathParam("id") String id, Lib lib) {
        DataStore.INSTANCE.addLib(id, lib.name, lib.url);
        return lib;
    }

    @Path("/p/{id}/class")
    @DELETE
    public void deleteClass(@PathParam("id") String id, Clazz clazz) {
        DataStore.INSTANCE.deleteClass(id, clazz.name);
    }

    @Path("/p/{id}/lib")
    @DELETE
    public void deleteLib(@PathParam("id") String id, Lib lib) {
        DataStore.INSTANCE.deleteLib(id, lib.name);
    }

    @Path("/indexMaven")
    @GET
    public void indexMaven() throws IOException {
        new MavenSearchIndexer().run();
    }
}
