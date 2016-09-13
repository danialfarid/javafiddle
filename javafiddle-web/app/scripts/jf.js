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
      jf.project.updateClass(jf.currClass);
    });
  }

  selectClass(c) {
    if (c) {
      this.currClass = c;
    }
    if (this.currClass) {
      this.javaEditor.setOption('readOnly', false);
      // this.updateClass(this.currClass);
      this.javaEditor.setValue(this.currClass.src || '\r\n');
      this.javaEditor.clearHistory();
    }
  }
}
Jf.apiBase = window.jfApiUrl || '/';
