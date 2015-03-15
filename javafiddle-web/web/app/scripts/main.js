'use strict';
Oo.future(function () {

var jf = window.jf = {};
var localUrl = function () {
	return 'http://localhost:' + (jf.port || '8020') + '/';
};
var apiBase = (window.jfApiUrl || '/');

var Project = Oo.resource(apiBase + '{:id}');
var LocalProject = Oo.resource(localUrl() + '{:id}');

var path = Oo.url(window.location.href).pathname.substring(1);
var id = path.length ? path : null;

function createProject() {
	jf.project = new Project().$create(function () {
		jf.localProject = new LocalProject(jf.project).$create();
		jf.initializeProject(jf.project.id);
		window.history.pushState(null, null, '/' + jf.project.id);
	});
}

if (id != null) {
	jf.project = new Project({id: id}).$get(function () {
		jf.localProject = new LocalProject(jf.project).$create();
		jf.initializeProject(jf.project.id);
		pollLogs();
	}, function() {
		createProject();
	});
} else {
	createProject();
}

jf.initializeProject = function (id) {
	Project.Class = Oo.resource(apiBase + id + '/class');
	Project.Lib = Oo.resource(apiBase + id + '/lib');
	LocalProject.Class = Oo.resource(localUrl() + id + '/class');
	LocalProject.Lib = Oo.resource(localUrl() + id + '/lib');

	jf.classesMap = {};
	jf.classes = Project.Class.$query(null, 'items').after(function() {
		for (var i = 0; i < jf.classes.length; i++) {
			jf.classesMap[jf.classes[i].name] = jf.classes[i];
			new LocalProject.Class(jf.classes[i]).$create();
		}
	});
	jf.libsMap = {};
	jf.libs = Project.Lib.$query(null, 'items').after(function() {
		for (var j = 0; j < jf.libs.length; j++) {
			jf.libsMap[jf.libs[j].name] = jf.libs[j];
			new LocalProject.Lib(jf.libs[j]).$create();
		}
	});
};

jf.addClass = function (name) {
	if (jf.classesMap[name]) {
		window.alert('Class name already exists: ' + name);
		return;
	}
	var newClass = new Project.Class({name: name}).$create(function () {
		jf.classes.push(newClass);
		jf.classesMap[newClass.name] = newClass;
		new LocalProject.Class(newClass).$create();
	});
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
		new LocalProject.Class(clazz).$remove();
	}
};

jf.updateClass = DF.util.runFixedRate(function (clazz) {
	clazz.$update();
	new LocalProject.Class(clazz).$update();
}, 1000, 3000);

jf.addLib = function (name, url) {
	if (jf.libsMap[name]) {
		window.alert('Lib name already exists: ' + name);
		return;
	}
	var newLib = new Project.Lib({name: name, url: url}).$create(function () {
		jf.libs.push(newLib);
		jf.libsMap[newLib.name] = newLib;
		new LocalProject.Lib(newLib).$create();
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
		new LocalProject.Lib(lib).$remove();
	}
};

jf.preserveLog = true;
jf.run = function () {
	if (!jf.preserveLog) {
		jf.out = '';
		jf.err = '';
	}
	new Oo.XHR().open('POST', localUrl() + jf.project.id + '/run').send().onError(function (xhr) {
		jf.err += xhr.responseText;
	});
};

function pollLogs() {
	jf.out = '';
	var pollOut = function () {
		new Oo.XHR().open('GET', localUrl() + jf.project.id + '/out').send().onSuccess(function (xhr) {
			jf.out += xhr.responseText;
			pollOut();
		});
	};
	pollOut();
	jf.err = '';
	var pollErr = function () {
		new Oo.XHR().open('GET', localUrl() + jf.project.id + '/err').send().onSuccess(function (xhr) {
			jf.err += xhr.responseText;
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
	mode: 'text/x-java',
	readOnly: true
});

var mac = CodeMirror.keyMap.default === CodeMirror.keyMap.macDefault;
CodeMirror.keyMap.default[(mac ? 'Cmd' : 'Ctrl') + '-Space'] = 'autocomplete';

javaEditor.on('change', function () {
	jf.selClass.src = javaEditor.getValue();
});

Oo.watch('jf.selClass', function () {
	javaEditor.setOption('readOnly', false);
	jf.updateClass(jf.selClass);
	javaEditor.setValue(jf.selClass.src);
	javaEditor.clearHistory();
});

jf.messages = [];
Oo.XHR.onError(function (xhr) {
	jf.messages.push(xhr.data);
});

});
