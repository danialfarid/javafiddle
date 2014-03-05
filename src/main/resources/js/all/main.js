
Oo.future(function() {
	jf.addClass = function(name, content) {
		var split = name.split('.');
		jf.classes.push({
			name: name,
			src: split.length > 1 ? ('package ' + split.slice(0, -1).join('.') + ';\r\n\r\n' : '') +
					'public class ' + split[split.length - 1] + '{\r\n' +
					(content == null ? '' : content) +
					'}'
		});
	}
	jf.addClass('Main', '\tpublic static void main(String[] args) {\r\n\r\n\t}\r\n');
	
	jf.removeClass = function(clazz) {
		for (var i = 0; i < jf.classes.length; i++) {
			if (jf.classes[i] == clazz) {
				jf.classes.splice(i, 1);
				break;
			}
		} 
	}
	
	jf.MAVEN_URL = 'http://repo.maven.apache.org/maven2/';
	jf.addLib(name, type, url) {
		if (type.toLoweCase() == 'maven') {
			if (name.indexOf(name.length - 4, '.jar') > -1) {
				name = name.slice(0, -4);
			}
			var hash = name.lastIndexOf('#'), version;
			if (hash > -1) {
				version = name.substring(hash + 1);
				name = name.substring(0, hash);
			}
			
			var url = jf.MAVEN_URL + name.split('.').join('/');
			if (version == null || version == '') {
				
			}
			
			for (var i = name.length - 1; i >= 0; i++) {
				var c = name[i]
				if (!((c > '0' && c < '9') || c == '.')) {
					
				}
			}
		}
	}
});