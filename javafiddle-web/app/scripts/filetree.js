'use strict';

Jf.FileTree = class {
  constructor(jf) {
    this.jf = jf;
    this.currClassNode = null;
  }

  init() {
    this.root = new Jf.FileTree.Package(this.jf.project.id, this.project);
    for (var i = 0; i < this.jf.project.classes.length; i++) {
      var c = this.jf.project.classes[i];
      this.root.classes.push(new Jf.FileTree.Class(c.name, c, this.root));
    }
    this.sortAndMakeChildren(this.root);
    return this;
  }

  nameSort(a, b) {
    return a.name < b.name ? -1 : 1;
  }

  sortAndMakeChildren(node) {
    node.packages = [];
    node.classes.sort(this.nameSort);

    var findSubPackage = function (subpkg) {
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
          pkgNode = new Jf.FileTree.Package(subpkg, null, node);
          node.packages.push(pkgNode);
        }
        if (pkgNode) {
          node.classes.splice(i--, 1);
          pkgNode.classes.push(new Jf.FileTree.Class(c.name.substring(subpkg.length + 1), c.ref, pkgNode));
          break;
        }
      }
    }
    for (var k = 0; k < node.packages.length; k++) {
      this.sortAndMakeChildren(node.packages[k]);
    }
  }

  selectNode(node) {
    this.currNode = node;
    if (this.currNode instanceof Jf.FileTree.Class) {
      this.jf.selectClass(node.ref);
    }
  }

  addClass(pkgNode) {
    pkgNode.expand = true;
    pkgNode.classes.unshift(new Jf.FileTree.Class('', null, pkgNode, true, ''));
  }

  addPackage(pkgNode) {
    pkgNode.expand = true;
    pkgNode.packages.unshift(new Jf.FileTree.Package('', null, pkgNode, true, ''));
  }

  startRename(node) {
    node.newName = node.name;
    node.rename = true;
  }

  renameNode(node, elem) {
    if (!node.newName) {
      return this.cancelRename(node);
    }
    if (this.nameExists(node.newName, node)) {
      this.jf.alerts.push('Name already exists');
      setTimeout(function(){elem.focus();}, 0);
    } else {
      if (node instanceof Jf.FileTree.Package) {
        this.renamePackage(node);
      } else {
        this.renameClass(node);
      }
    }
  }

  renamePackage(pkgNode) {
    if (!pkgNode.hasChild() && !pkgNode.newName) {
      return this.cancelRename(pkgNode);
    }
    var oldName = pkgNode.fullName();
    pkgNode.name = pkgNode.newName;
    var newName = pkgNode.fullName();
    this.renamePackageInClasses(pkgNode, oldName, newName);
    pkgNode.rename = false;
    setTimeout(() => {pkgNode.parent.packages.sort(this.nameSort);}, 0);
  }

  renamePackageInClasses(pkgNode, oldName, newName) {
    for (var i = 0; i < pkgNode.classes.length; i++) {
      var c = pkgNode.classes[i];
      c.ref.name = c.ref.name.replace(oldName.substring(this.jf.project.id.length + 1),
        newName.substring(this.jf.project.id.length + 1));
      c.ref.src = c.ref.src.replace(oldName, newName);
      this.jf.project.updateClass(c.ref);
      if (c === this.currClassNode) {
        this.jf.project.selectClass();
      }
    }
    for (var j = 0; j < pkgNode.packages.length; j++) {
      var p = pkgNode.packages[j];
      this.renamePackageInClasses(p, oldName + '.' + p.name, newName + '.' + p.name);
    }
  }

  renameClass(clazzNode) {
    clazzNode.name = clazzNode.newName;
    var newName = clazzNode.fullName();
    var project = this.jf.project;
    if (!clazzNode.ref) {
      if (!clazzNode.newName) {
        return this.cancelRename(clazzNode);
      } else {
        project.createClass(newName, function (clazz) {
          clazzNode.ref = clazz;
        });
      }
    } else {
      clazzNode.ref.name = newName.substring(this.jf.project.id.length + 1);
      this.jf.project.renameClass(clazzNode.ref, clazzNode.name);
      this.jf.selectClass(clazzNode.ref);
    }
    clazzNode.rename = false;
    setTimeout(() => {clazzNode.parent.classes.sort(this.nameSort);}, 0);
  }

  cancelRename(node) {
    node.rename = false;
    if (!node.ref && !node.hasChild()) {
      node.parent.classes.remove(node);
      node.parent.packages.remove(node);
    }
  }

  focus(el) {
    setTimeout(function () {
      el.focus();
    }, 0);
  }

  focusNext(reverse) {
    var elem = this.findNextVisible(reverse);
    if (elem) {
      elem.click();
    }
  }

  findNextVisible(reverse) {
    var allRows = Array.prototype.slice.call(document.querySelector('.file-tree').querySelectorAll('.row'));
    if (reverse) {
      allRows = allRows.reverse();
    }
    var len = allRows.length, prevVisible = null;
    while(len--) {
      if (allRows[len].offsetWidth) {
        if (allRows[len].hasClass('selected')) {
          return prevVisible;
        }
        prevVisible = allRows[len];
      }
    }
  }

  nameExists(name, node) {
    for (var i = 0; i < node.parent.classes.length; i++) {
      var c = node.parent.classes[i];
      if (c !== node && c.name === name) {
        return true;
      }
    }
    for (var j = 0; j < node.parent.packages.length; j++) {
      var p = node.parent.packages[j];
      if (p !== node && p.name === name) {
        return true;
      }
    }
  }
};

Jf.FileTree.Node = class {
  constructor(name, ref, parent, rename, newName) {
    this.name = name;
    this.ref = ref;
    this.parent = parent;
    this.rename = rename;
    this.newName = newName;
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

Jf.FileTree.Class = class extends Jf.FileTree.Node {
  hasChild() {
    return false;
  }
};
Jf.FileTree.Package = class extends Jf.FileTree.Node {
  constructor(name, ref, parent, rename, newName) {
    super(name, ref, parent, rename, newName);
    this.classes = [];
    this.packages = [];
  }

  hasChild() {
    return (this.classes && this.classes.length > 0) || (this.packages && this.packages.length > 0);
  }
};

