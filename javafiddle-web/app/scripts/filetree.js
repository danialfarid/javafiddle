'use strict';

class FileTree {
  constructor(project) {
    this.project = project;
    this.currClassNode = null;

    FileTree.Node = class {
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
    };
    this.init();
  }

  init() {
    this.tree = new FileTree.Node(this.project.id, this.project);
    for (var i = 0; i < this.project.classes.length;i++) {
      var c = this.project.classes[i];
      this.tree.classes.push(new FileTree.Node(c.name, c, this.tree));
    }
    this.sortAndMakeChildren(this.tree);
  }

  nameSort(a, b) {
    return a.name < b.name ? -1 : 1;
  }

  sortAndMakeChildren(node) {
    node.packages = [];
    node.classes.sort(this.nameSort);

    var findSubPackage = function(subpkg) {
      return function (el) {
        return el.name === subpkg;
      };
    };

    for (var i = 0; i < node.classes.length; i++) {
      var c = node.classes[i];
      var split = c.name.split('.');
      var subpkg = '';

      for (var j = 0; j < split.length - 1; j++) {
        subpkg += (subpkg ? '.' : '') + split[j];
        var pkgNode = node.packages.find(findSubPackage(subpkg));
        if (!pkgNode && j === split.length - 2) {
          pkgNode = new FileTree.Node(subpkg, null, node);
          node.packages.push(pkgNode);
        }
        if (pkgNode) {
          node.classes.splice(i--, 1);
          pkgNode.classes.push(new FileTree.Node(c.name.substring(subpkg.length + 1), c.ref, pkgNode));
          break;
        }
      }
    }
    node.packages.forEach(function (p) {
      this.sortAndMakeChildren(p);
    });
  }

  startRename(node) {
    node.newName = node.name;
    node.rename = true;
  }

  addPackage(pkgNode) {
    var pkgName = 'untitled' + Math.floor(Math.random() * 10000);
    pkgNode.packages = pkgNode.packages || [];
    pkgNode.packages.push(new FileTree.Node(pkgName, null, pkgNode, true, pkgName));
    pkgNode.packages.sort(this.nameSort);
  }

  renamePackage(pkgNode, newName) {
    var oldName = pkgNode.fullName();
    pkgNode.name = newName;
    newName = pkgNode.fullName();
    this.renamePackageInClasses(pkgNode, oldName, newName);
    pkgNode.rename = false;
    pkgNode.packages.sort(this.nameSort);
  }

  renamePackageInClasses(pkgNode, oldName, newName) {
    pkgNode.classes.forEach(function (c) {
      c.ref.name = c.ref.name.replace(oldName.substring(this.project.id.length + 1),
        newName.substring(this.project.id.length + 1));
      c.ref.src = c.ref.src.replace(oldName, newName);
      this.project.updateClass(c.ref);
      if (c === this.currClassNode) {
        this.project.selectClass();
      }
    });
    pkgNode.packages.forEach(function (p) {
      this.renamePackageInClasses(p, oldName + '.' + p.name, newName + '.' + p.name);
    });
  }

  addClass(pkgNode) {
    var fullName = pkgNode.fullName();
    var clazz = project.createClass(fullName, function() {
      var newName = clazz.name.substring(fullName.length + 1);
      var node = new FileTree.Node(newName, clazz, pkgNode, true, newName);
      pkgNode.classes.push(node);
    });
  }

  renameClass(clazzNode) {
    clazzNode.name = clazzNode.newName;
    var newName = clazzNode.fullName();
    clazzNode.ref.name = newName.substring(this.project.id.length + 1);
    clazzNode.ref.src = clazzNode.ref.src.replace(/class +[\w\d]+/, 'class ' + clazzNode.name);
    jf.updateClass(clazzNode.ref);
    clazzNode.rename = false;
    jf.selectClass();
    clazzNode.parent.classes.sort(nameSort);
  }

  focus(el) {
    setTimeout(function () {
      el.focus();
    }, 0);
  }

  focusNext() {
    e.currentTarget.parentNode.nextElementSibling.querySelector('tr').focus();
  }
}
