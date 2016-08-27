'use strict';
Oo.future(function () {

  var jf = M.jf;
  var localUrl = function () {
    return 'http://localhost:' + (jf.port || '8020') + '/';
  };
  var apiBase = (window.jfApiUrl || '/');

  jf.Project = Oo.resource(apiBase + '{:id}');
  jf.LocalProject = Oo.resource(localUrl() + '{:id}');

  var id = Oo.hash.get() || null;

  var ping = function () {
    Oo.http.get(localUrl() + 'ping').send().after(function () {
      jf.clientAlive = true;
      setTimeout(ping, 10000);
    }, function () {
      jf.clientAlive = false;
      setTimeout(ping, 3000);
    });
  };
  ping();

  function createProject() {
    jf.project = new jf.Project().$create(function () {
      jf.localProject = new jf.LocalProject(jf.project).$create();
      jf.initializeProject();
      //window.history.pushState(null, null, '/' + jf.project.id);
      Oo.hash.set(jf.project.id);
    });
  }

  if (id != null) {
    jf.project = new jf.Project({id: id}).$get(function () {
      jf.localProject = new jf.LocalProject(jf.project).$create();
      jf.initializeProject();
      pollLogs();
    }, function () {
      createProject();
    });
  } else {
    createProject();
  }

  jf.initializeProject = function () {
    jf.Project.Class = Oo.resource(apiBase + jf.project.id + '/class');
    jf.Project.Lib = Oo.resource(apiBase + jf.project.id + '/lib');
    jf.LocalProject.Class = Oo.resource(localUrl() + jf.project.id + '/class');
    jf.LocalProject.Lib = Oo.resource(localUrl() + jf.project.id + '/lib');

    jf.classesMap = {};
    jf.project.classes.forEach(function (c) {
      jf.classesMap[c.id] = c;
      new jf.LocalProject.Class(c).$create();
    });
    jf.libsMap = {};
    jf.project.libs.forEach(function (c) {
      jf.libsMap[c.id] = c;
      new jf.LocalProject.Lib(c).$create();
    });
    jf.fileTree = jf.makeFileTree(jf.project);
  };

  jf.removeClass = function (name) {
    if (window.confirm('Delete ' + name)) {
      var clazz = jf.classesMap[name];
      clazz.$remove(function () {
        for (var i = 0; i < jf.classes.length; i++) {
          if (jf.classes[i].name === name) {
            jf.classes.splice(i, 1);
            break;
          }
        }
        delete jf.classesMap[name];
      });
      new jf.LocalProject.Class(clazz).$remove();
    }
  };

  jf.updateClass = DF.util.runFixedRate(function (clazz) {
    new jf.Project.Class(clazz).$update();
    new jf.LocalProject.Class(clazz).$update(function (resp) {
      var errors = [];
      if (resp && resp.length) {
        resp.forEach(function (err) {
          errors.push({
            from: CodeMirror.Pos(err.line - 1, err.from),
            to: CodeMirror.Pos(err.line - 1, err.to + 1),
            message: err.reason
          });
        })
      }
      if (jf.showCompileErrors) jf.showCompileErrors(errors);
    });
  }, 1000, 3000);

  jf.addLib = function (name, url) {
    if (jf.libsMap[name]) {
      window.alert('Lib name already exists: ' + name);
      return;
    }
    var newLib = new jf.Project.Lib({name: name, url: url}).$create(function () {
      jf.libsMap[newLib.name] = newLib;
      new jf.LocalProject.Lib(newLib).$create();
    });
  };

  jf.removeLib = function (name) {
    if (window.confirm('Delete ' + name)) {
      var lib = jf.libsMap[name];
      lib.$remove(function () {
        for (var i = 0; i < jf.classes.length; i++) {
          if (jf.libs[i].name === name) {
            jf.libs.splice(i, 1);
            break;
          }
        }
        delete jf.libsMap[name];
      });
      new jf.LocalProject.Lib(lib).$remove();
    }
  };

  jf.preserveLog = true;
  jf.run = function () {
    if (!jf.preserveLog) {
      jf.out = '';
      jf.err = '';
    }
    Oo.http.post(localUrl() + jf.project.id + '/run').send().after(function (resp) {
      jf.err += resp;
    });
  };

  function pollLogs() {
    jf.out = '';
    var pollOut = function () {
      Oo.http.get(localUrl() + jf.project.id + '/out').send().after(function (resp) {
        jf.out += resp;
        pollOut();
      });
    };
    pollOut();
    jf.err = '';
    var pollErr = function () {
      Oo.http.get(localUrl() + jf.project.id + '/err').send().after(function (resp) {
        jf.err += resp;
        pollErr();
      });
    };
    pollErr();
  }

  var editorElem = document.getElementsByClassName('javaEditor')[0];
  var javaEditor = new CodeMirror(editorElem, {
    lineNumbers: true,
    indentUnit: 4,
    matchBrackets: true,
    styleActiveLine: true,
    lineWrapping: false,
    gutters: ["CodeMirror-lint-markers"],
    mode: 'text/x-java',
    lint: {
      "getAnnotations": compileValidator,
      "async": true
    },
    //after selection readonly will be reset
    readOnly: true
  });

  function compileValidator(cm, updateLinting, options) {
    jf.showCompileErrors = updateLinting;
    //if (cm && cm.length) {
    //  updateLinting([{
    //    from: CodeMirror.Pos(2 - 1, 2),
    //    to: CodeMirror.Pos(2 - 1, 10),
    //    message: 'aaaa'
    //  }]);
    //}
  }

  var mac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault;
  CodeMirror.keyMap.default[(mac ? 'Cmd' : 'Ctrl') + '-Space'] = 'autocomplete';

  javaEditor.on('change', function () {
    jf.currClassNode.ref.src = javaEditor.getValue();
    jf.updateClass(jf.currClassNode.ref);
  });

  jf.selectClass = function () {
    if (jf.currClassNode) {
      javaEditor.setOption('readOnly', false);
      jf.updateClass(jf.currClassNode.ref);
      javaEditor.setValue(jf.currClassNode.ref.src || '\r\n');
      javaEditor.clearHistory();
    }
  };

  jf.messages = [];
  Oo.http.onError(function (xhr) {
    jf.messages.push(xhr.data);
  });
});
Oo.directive({
  name: 'resizable',
  link: function (elem, attr) {
    var val = attr.evaluate(), grips = [],
      style = 'position:absolute;background-color:#DDDDDD;padding:1px;';
    elem.style.position = 'relative';
    if (val.indexOf('left') > -1) {
      grips.push(document.create('<div class="oo-grip" style="' + style + 'left:0;top:0;bottom:0;cursor:col-resize;"></div>'))
    }
    if (val.indexOf('right') > -1) {
      grips.push(document.create('<div class="oo-grip" style="' + style + 'right:0;top:0;bottom:0;cursor:col-resize;"></div>'))
    }
    if (val.indexOf('bottom') > -1) {
      grips.push(document.create('<div class="oo-grip" style="' + style + 'left:0;right:0;bottom:0;cursor:row-resize;"></div>'))
    }
    if (val.indexOf('top') > -1) {
      grips.push(document.create('<div class="oo-grip" style="' + style + 'left:0;right:0;top:0;cursor:row-resize;"></div>'))
    }
    grips.forEach(function (grip) {
      elem.add(grip);
      grip.on('mousedown', function (e) {
        var listener, initialX = e.screenX, initialY = e.screenY, width = elem.offsetWidth, height = elem.offsetHeight;
        listener = document.on('mousemove', function (e) {
          var deltaX = e.screenX - initialX;
          var deltaY = e.screenY - initialY;
          if (grip.style.left === 'inherit') {
            elem.style.width = (width + delta) + 'px';
          } else if (grip.style.right === 'inherit') {
            elem.style.width = (width - delta) + 'px';
          } else if (grip.style.top === 'inherit') {
            elem.style.heigth = (height + delta) + 'px';
          } else if (grip.style.bottom === 'inherit') {
            elem.style.heigth = (height - delta) + 'px';
          }
          elem.style.width = width + (e.screenX - initialX) + "px";
        });
        document.on('mouseup', function () {
          document.off('mousemove', listener);
        });
      });
    });
  }
});
