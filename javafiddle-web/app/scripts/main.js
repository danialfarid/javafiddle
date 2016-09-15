'use strict';
class Jf {
  constructor() {
    this.project = new Jf.Project();
    this.init();
  }

  init() {
    var jf = this;
    this.fileTree = new Jf.FileTree(this);
    this.project.onLoad(() => {
      jf.fileTree.init();
      this.initEditor();
    });
    // pollLogs();

    this.alerts = [];
    Oo.http.onError(function (xhr) {
      jf.alerts.push(xhr.data);
    });
  }

  initEditor() {
    var jf = this;
    this.editorElem = document.getElementsByClassName('javaEditor')[0];
    var compileValidator = function (cm, updateLinting) {
      jf.showCompileErrors = updateLinting;
      if (cm && cm.length) {
        updateLinting([{
          from: CodeMirror.Pos(2 - 1, 2),
          to: CodeMirror.Pos(2 - 1, 10),
          message: 'aaaa'
        }]);
      }
    };
    this.javaEditor = new CodeMirror(this.editorElem, {
      lineNumbers: true,
      indentUnit: 4,
      matchBrackets: true,
      styleActiveLine: true,
      lineWrapping: false,
      gutters: ['CodeMirror-lint-markers'],
      mode: 'text/x-java',
      lint: {
        'getAnnotations': compileValidator,
        'async': true
      },
      //after selection readonly will be reset
      readOnly: true
    });
    var mac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault;
    CodeMirror.keyMap.default[(mac ? 'Cmd' : 'Ctrl') + '-Space'] = 'autocomplete';

    this.javaEditor.on('change', function () {
      jf.currClass.src = jf.javaEditor.getValue();
      jf.updateSrc(jf.currClass);
    });

    this.updateSrc = DF.util.runFixedRate(function (clazz) {
      // var name = clazz.name.substring(clazz.name.lastIndexOf('.') + 1), newName;
      // clazz.src.replace(/class +(\w+)/, function(m,p){newName = p;});
      // if (newName && newName != name) {
      //   this.fileTree.renameClass()
      // }
      clazz.$update();
      new jf.LocalProject.Class(clazz).$update(function (resp) {
        var errors = [];
        if (resp && resp.length) {
          resp.forEach(function (err) {
            errors.push({
              from: CodeMirror.Pos(err.line - 1, err.from),
              to: CodeMirror.Pos(err.line - 1, err.to + 1),
              message: err.reason
            });
          });
        }
        if (jf.showCompileErrors) {
          jf.showCompileErrors(errors);
        }
      });
    }, 1000, 3000);
  }

  setCurrClass(c) {
    this.showInEditor(this.currClass = c);
  }

  showInEditor() {
    if (this.editorElem && !this.editorElem.contains(document.activeElement)) {
      this.javaEditor.setOption('readOnly', false);
      // this.updateClass(this.currClass);
      this.javaEditor.setValue(this.currClass.src || '\r\n');
      this.javaEditor.clearHistory();
    }
  }
}
Jf.apiBase = window.jfApiUrl || '/';
