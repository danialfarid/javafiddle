'use strict';
Oo.future(function () {
  var jf = M.jf;

  jf.makeFileTree = function (project) {
    var fileTree = {name: jf.project.id, classes: [], ref: jf.project};
    project.classes.forEach(function (c) {
      fileTree.classes.push({name: c.name, ref: c});
    });
    sortAndMakeChildren(fileTree);
    return fileTree;
  }

  function sortAndMakeChildren(tree) {
    tree.packages = [];
    tree.classes.sort(function (a, b) {
      return a.name < b.name ? -1 : 1;
    });
    for (var i = 0; i < tree.classes.length; i++) {
      var c = tree.classes[i];
      var subpkg = c.name.substring(0, c.name.lastIndexOf('.'));
      if (subpkg) {
        tree.classes.splice(i--, 1);
        var pkgNode = tree.packages.find(function (el) {
          return el.name === subpkg;
        });
        var cl = {name: c.name.substring(subpkg.length + 1), ref: c};
        if (pkgNode) {
          pkgNode.classes.push(cl);
        } else {
          tree.packages.push({name: subpkg, classes: [cl]});
        }
      }
    }
    tree.packages.forEach(function (p) {
      sortAndMakeChildren(p);
    });
  }

  jf.addClass = function (pkg, pkgName) {
    var clazz = {name: pkgName + '.UntitledClass'};
    pkg.classes.push({name: 'UntitledClass', ref: clazz, rename: true});
    var newClass = new Project.Class(clazz).$create(function () {
      jf.classesMap[newClass.name] = newClass;
      jf.project.classes.splice(0, 0, newClass);
      new LocalProject.Class(newClass).$create();
    });
  };

  jf.renameClass = function() {

  }
});
