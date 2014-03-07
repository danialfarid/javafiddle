Oo.future(function() {
	var path = window.location.pathname + '/'
	var slashIndex = path.indexOf('/');
	jf.projectId = path.substring(slashIndex + 1, path.indexOf('/', slashIndex + 1));
	
	jf.classes = [];
	jf.libs = [];
	new Oo.XHR().open('GET', '/' + jf.projectId + '/class').send().onSuccess(function(xhr) {
		jf.classes = xhr.data;
	});
	new Oo.XHR().open('GET', '/' + jf.projectId + '/lib').send().onSuccess(function(xhr) {
		jf.libs = xhr.data;
	});
	
//	Oo.XHR.onError(function(xhr) {
//		jf.messages.push(xhr.data);
//	}) 
	
	jf.addClass = function(name) {
		var split = name.split('.');
		var clazz = {
				name: name,
				src: xhr.data
			};
		jf.classes.push(clazz);			
		new Oo.XHR().open('POST', '/' + jf.projectId + '/class/' + name).send().onError(function(xhr) {
			jf.messages.push('Failed to create class ' + name + '\n' + xhr.data);
			jf.removeClass(clazz);
		});
	};	
	
	jf.removeClass = function(clazz) {
		for (var i = 0; i < jf.classes.length; i++) {
			if (jf.classes[i] == clazz) {
				jf.classes.splice(i, 1);
				new Oo.XHR().open('DELETE', '/' + jf.projectId + '/class/' + clazz.name).send().onError(function(xhr) {
					jf.messages.push('Failed to remove class ' + name + '\n' + xhr.data);
					jf.classes.splice(i, 0, clazz);
				});
				break;
			}
		}
	};
	
	jf.addLib = function(name, type, url) {
		new Oo.XHR().open('POST', '/' + jf.projectId + '/lib/' + name + '?type=' + type).send(url).onError(function(xhr) {
			jf.messages.push('Failed to add lib ' + type + ': ' + name + ' (' + url + ')\n' + xhr.data);
			jf.removeLib(name);
		});
	};
	
	jf.removeLib = function(lib) {
		for (var i = 0; i < jf.classes.length; i++) {
			if (jf.classes[i] == clazz) {
				jf.classes.splice(i, 1);
				new Oo.XHR().open('DELETE', '/' + jf.projectId + '/lib/' + name).send(url).onError(function(xhr) {
					jf.messages.push('Failed to delete lib ' + name + '\n' + xhr.data);
					jf.libs.splice(i, 0, lib);
				});
				break;
			}
		}
	};
});