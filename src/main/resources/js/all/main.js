Oo.future(function() {
	var baseUrl = window.location.href;
	var path = window.location.pathname + '/'
	var slashIndex = path.indexOf('/');
	jf.projectId = path.substring(slashIndex + 1, path.indexOf('/', slashIndex + 1));
	
	jf.classes = [];
	jf.libs = [];
	new Oo.XHR().open('GET', baseUrl + '/' + jf.projectId + '/class').send().onSuccess(function(xhr) {
		var split = xhr.data.split('\0');
		for (var i = 0; i < split.length; i = i + 2) {
			jf.classes.push({"name": split[i], "src": split[i + 1]});
		}
	});
	new Oo.XHR().open('GET', baseUrl + '/' + jf.projectId + '/lib').send().onSuccess(function(xhr) {
		var split = xhr.data.split('\0');
		for (var i = 0; i < split.length; i = i + 2) {
			jf.libs.push({"name": split[i], "url": split[i + 1]});
		}
	});
	
//	Oo.XHR.onError(function(xhr) {
//		jf.messages.push(xhr.data);
//	}) 
	
	jf.addClass = function(name) {
		jf.removeClass(name);
		var split = name.split('.');
		new Oo.XHR().open('POST', '/' + jf.projectId + '/class/' + name).send().onSuccess(function(xhr) {
			jf.classes.push({name: name, src: xhr.data});			
		});
	};	
	
	jf.removeClass = function(name) {
		for (var i = 0; i < jf.classes.length; i++) {
			if (jf.classes[i].name == name) {
				new Oo.XHR().open('DELETE', '/' + jf.projectId + '/class/' + name).send().onSuccess(function(xhr) {
					jf.classes.splice(i, 1);
				});
			}
		}
	};
	
	jf.addLib = function(name, url) {
		new Oo.XHR().open('POST', '/' + jf.projectId + '/lib/' + name).send(url).onSuccess(function(xhr) {
			jf.libs.push({name: name, url: url);
		});
	};
	
	jf.removeLib = function(lib) {
		for (var i = 0; i < jf.classes.length; i++) {
			if (jf.classes[i] == clazz) {
				jf.classes.splice(i, 1);
				new Oo.XHR().open('DELETE', '/' + jf.projectId + '/lib/').send(url).onError(function(xhr) {
					jf.messages.push('Failed to delete lib ' + name + '\n' + xhr.data);
					jf.libs.splice(i, 0, lib);
				});
				break;
			}
		}
	};
});