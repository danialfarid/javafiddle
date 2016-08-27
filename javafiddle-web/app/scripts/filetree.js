'use strict';
Oo.future(function () {
  class Node {
    constructor(name, ref, parent, rename, newName) {
      this.name = name;
      this.ref = ref;
      this.parent = parent;
      this.rename = rename;
      this.newName = newName;
      this.classes = [];
      this.packages = [];
    }

    fullName() {
      var node = this;
      var name = node.name;
      while (node.parent) {
        node = node.parent;
        name = node.name + '.' + name;
      }
      return name;
    }
  }

  var jf = M.jf;

  jf.makeFileTree = function (project) {
    var fileTree = new Node(jf.project.id, jf.project);
    project.classes.forEach(function (c) {
      var node = new Node(c.name, c, fileTree);
      fileTree.classes.push(node);
    });
    sortAndMakeChildren(fileTree);
    return fileTree;
  }

  function nameSort(a, b) {
    return a.name < b.name ? -1 : 1;
  }

  function sortAndMakeChildren(tree) {
    tree.packages = [];
    tree.classes.sort(nameSort);
    for (var i = 0; i < tree.classes.length; i++) {
      var c = tree.classes[i];
      var split = c.name.split('.');
      var subpkg = '';
      for (var j = 0; j < split.length - 1; j++) {
        subpkg += (subpkg ? '.' : '') + split[j];
        var pkgNode = tree.packages.find(function (el) {
          return el.name === subpkg;
        });
        if (!pkgNode && j == split.length - 2) {
          pkgNode = new Node(subpkg, null, tree);
          tree.packages.push(pkgNode);
        }
        if (pkgNode) {
          tree.classes.splice(i--, 1);
          var node = new Node(c.name.substring(subpkg.length + 1), c.ref, pkgNode);
          pkgNode.classes.push(node);
          break;
        }
      }
    }
    tree.packages.forEach(function (p) {
      sortAndMakeChildren(p);
    });
  }

  jf.startRename = function (node) {
    node.newName = node.name;
    node.rename = true;
  };

  jf.addPackage = function (pkgNode) {
    var pkgName = 'untitled' + Math.floor(Math.random() * 10000);
    pkgNode.packages = pkgNode.packages || [];
    pkgNode.packages.push(new Node(pkgName, null, pkgNode, true, pkgName));
    pkgNode.packages.sort(nameSort);
  };

  jf.renamePackage = function (pkgNode, newName) {
    var oldName = pkgNode.fullName();
    pkgNode.name = newName;
    newName = pkgNode.fullName();
    renamePackageInClasses(pkgNode, oldName, newName);
    pkgNode.rename = false;
    pkgNode.packages.sort(nameSort);
  };

  function renamePackageInClasses(pkgNode, oldName, newName) {
    pkgNode.classes.forEach(function (c) {
      c.ref.name = c.ref.name.replace(oldName.substring(jf.project.id.length + 1),
        newName.substring(jf.project.id.length + 1));
      c.ref.src = c.ref.src.replace(oldName, newName);
      jf.updateClass(c.ref);
      if (c === jf.currClassNode) {
        jf.selectClass();
      }
    });
    pkgNode.packages.forEach(function (p) {
      renamePackageInClasses(p, oldName + '.' + p.name, newName + '.' + p.name);
    });
  }

  jf.addClass = function (pkgNode) {
    var newName = 'UntitledClass' + Math.floor(Math.random() * 10000);
    var pkgName = pkgNode.fullName().substring(jf.project.id.length + 1);
    var clazz = {name: pkgName + (pkgName ? '.' : '') + newName};
    clazz = new jf.Project.Class(clazz).$create(function () {
      jf.classesMap[clazz.name] = clazz;
      jf.project.classes.splice(0, 0, clazz);
      new jf.LocalProject.Class(clazz).$create();
    });
    var node = new Node(newName, clazz, pkgNode, true, newName)
    pkgNode.classes.push(node);
  };

  jf.renameClass = function (clazzNode) {
    var oldName = clazzNode.fullName();
    clazzNode.name = clazzNode.newName;
    var newName = clazzNode.fullName();
    clazzNode.ref.name = newName.substring(jf.project.id.length + 1);
    clazzNode.ref.src = clazzNode.ref.src.replace(/class +[\w\d]+/, 'class ' + clazzNode.name);
    jf.updateClass(clazzNode.ref);
    clazzNode.rename = false;
    jf.selectClass();
    clazzNode.parent.classes.sort(nameSort);
  };

  jf.focus = function (el) {
    setTimeout(function () {
      el.focus();
    }, 0)
  };
});
