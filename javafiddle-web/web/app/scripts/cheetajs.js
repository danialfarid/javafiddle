'use strict';
if (!Element.prototype.attr) {
	Element.prototype.attr = function (n, v) {
		if (v != null) {
			this.setAttribute(n, v);
			return this;
		} else {
			return this.getAttribute(n) || this.getAttribute('data-' + n) ||
				this.getAttribute('x-' + n);
		}
	};
}
if (!Element.prototype.addClass) {
	Element.prototype.addClass = function (c) {
		if (c != null) {
			if (!this.hasClass(c)) {
				this.setAttribute('class', (this.getAttribute('class') ? this.getAttribute('class') + ' ' : '') + c);
			}
		}
		return this;
	};
}
if (!Element.prototype.removeClass) {
	Element.prototype.removeClass = function (c) {
		if (c != null) {
			if (this.hasClass(c)) {
				this.setAttribute('class', this.getAttribute('class').replace(new RegExp('(' + c + '$)|( ' + c + ')', 'g'), ''));
			}
		}
		return this;
	};
}
if (!Element.prototype.hasClass) {
	Element.prototype.hasClass = function (c) {
		return this.getAttribute('class') && this.getAttribute('class').split(' ').indexOf(c) > -1;
	};
}
if (!Element.prototype.add) {
	Element.prototype.add = function (e, index) {
		if (e && e.length != null && e[0] != null) {
			for (var i = 0; i < e.length; i++) {
				this.add(e[i], index);
			}
		} else {
			this.insertBefore(e, index && this.childNodes[index]);
		}
		e.remove();
		return this;
	};
}
if (!Element.prototype.addBefore) {
	Element.prototype.addBefore = function (e) {
		if (e && e.length != null && e[0] != null) {
			for (var i = 0; i < e.length; i++) {
				this.addBefore(e[i]);
			}
		} else {
			this.parentNode.insertBefore(e, this);
		}
		return this;
	};
}
if (!Element.prototype.addAfter) {
	Element.prototype.addAfter = function (e) {
		if (e && e.length != null && e[0] != null) {
			for (var i = 0; i < e.length; i++) {
				this.addAfter(e[i]);
			}
		} else {
			this.parentNode.insertBefore(e, this.nextSibling);
		}
		return this;
	};
}
if (!Element.prototype.remove) {
	Element.prototype.remove = function () {
		if (this.parentNode) {this.parentNode.removeChild(this);}
		return this;
	};
}
if (!Element.prototype.html) {
	Element.prototype.html = function (h) {
		this.innerHTML = h;
		return this;
	};
}
if (!Element.prototype.wrap) {
	Element.prototype.wrap = function (e) {
		this.addAfter(e);
		this.remove();
		e.add(this);
		return this;
	};
}
if (!document.create) {
	document.create = function (s) {
		if (s.charAt(0) === '<') {
			var div = document.createElement('div');
			div.innerHTML = s;
			return div.removeChild(div.firstChild);
		} else {
			return document.createElement(s);
		}
	};
}
window.El = document.create;

(function() {
	var args = Array.prototype.slice.call(arguments);
	for (var i = 0; i < args.length; i++) {
		(args[i].prototype ? args[i].prototype : args[i]).on = (args[i].prototype ? args[i].prototype : args[i]).on ||
			function(events, fn) {
				var split = events.split(' ');
				for (var i = 0; i < split.length; i++) {
					if (split[i].length > 0) {
						this.addEventListener(split[i], fn, false);
					}
				}
			};
	}
})(Element, window, document);
(function() {
	var args = Array.prototype.slice.call(arguments);
	for (var i = 0; i < args.length; i++) {
		(args[i].prototype ? args[i].prototype : args[i]).off = (args[i].prototype ? args[i].prototype : args[i]).off ||
			function(events, fn) {
				var split = events.split(' ');
				for (var i = 0; i < split.length; i++) {
					if (split[i].length > 0) {
						this.removeEventListener(split[i], fn, false);
					}
				}
			};
	}
})(Element, window, document);
/*jshint -W020 */
window.$cheeta = window.Oo = function(obj) {
	if (typeof obj === 'string' || obj instanceof String) {
		if (obj[0] !== '<') {
			return $cheeta(document.createElement(obj));
		} else {
			var div = document.createElement('div');
			div.innerHTML = obj;
			return $cheeta(div.firstChild);
		}
	}
	var wrap = [];
	wrap.push(obj);

	wrap.on = function(events, fn) {
		var split = events.split(' ');
		for (var i = 0; i < split.length; i++) {
			if (split[i].length > 0) {
				obj.addEventListener(split[i], fn, false);
			}
		}
		return wrap;
	};
	wrap.off = function(events, fn) {
		var split = events.split(' ');
		for (var i = 0; i < split.length; i++) {
			if (split[i].length > 0) {
				obj.removeEventListener(split[i], fn, false);
			}
		}
		return wrap;
	};
	wrap.attr = function(n, v) {
		obj.setAttribute(n, v);
		return wrap;
	};
	return wrap;
};

$cheeta.model = $cheeta.model || {
	Model: function(parent, name) {
		this.value = undefined;
		this.bindings = [];
		this.parent = parent;
		this.names = [name];
		this.children = {};
		this.toExpr = function() {
			var expr = '';
			var model = this;
			while (model.parent != null && model.names[0] != null) {
				expr = (model.hasSpecialChar ? '[\'' + model.names[0] + '\']' : '.' + model.names[0]) + expr;
				model = model.parent;
			}

			return expr.substring(1);
		};
		this.getValue = function() {
			var names = [];
			var model = this;
			while (model.parent != null && model.names[0] != null) {
				names.push(model.hasSpecialChar ? '[\'' + model.names[0] + '\']' : '.' + model.names[0]);
				model = model.parent;
			}
			var val = window;
			for (var i = names.length - 1; i >= 0; i--) {
				if (val == null) {
					break;
				}
				val = val[names[i]];
			}
			return val === null && i > 0 ? undefined : val;
		};
		this.createOrGetChild = function(name, hasSpecialChar) {
			if (this.value == null) {
				this.value = this.isArray ? [] : {};
			}
			var model = this.children[name];
			if (model === undefined) {
				model = new $cheeta.model.Model(this, name);
				$cheeta.model.interceptProp(model, this.value, name);
				this.children[name] = model;
				model.value = this.value == null ? undefined : this.value[name];
			}
			model.hasSpecialChar = hasSpecialChar;
			return model;
		};
		this.alias = function(alias) {
			if (alias != null && alias !== this.names[0]) {
				this.names.push(alias);
			}
		};
		this.bindModelChange = function(elem, attrName, onChange) {
			if (onChange) {
				this.bindings.push({elem: elem, attrName: attrName});
//				console.log('binding: ' + this.toExpr(), elem, attrName, this.bindings.length);
				elem.addEventListener('$cheetaMC-' + attrName + '-' + this.toExpr(), onChange, false);
				if (this.value != null) {
					$cheeta.future.evals.push([onChange, {type: '$cheetaMC-' + attrName + '-' + this.toExpr(), 'detail':
						{value: this.value, oldValue: null, target: this}}]);
				}
			}
		};
		this.unbindModelChange = function(elem, attrName, onChange) {
			elem.removeEventListener('$cheetaMC-' + attrName, onChange, false);
			for (var i = 0; i < this.bindings.length; i++) {
				var binding = this.bindings[i];
				if (binding.elem === elem && binding.attrName === attrName) {
					this.bindings.splice(i, 1);
				}
			}
//			console.log('unbind: ', this.toExpr(), elem, attrName, this.bindings.length);
		};
		this.valueChange = function(val, oldVal) {
			if (val !== oldVal) {
				for (var i = 0; i < this.bindings.length; i++) {
//					console.log('dispatching: ' , this.toExpr(), i, this.bindings[i].elem, this.bindings[i].attrName, val);
					this.bindings[i].elem.dispatchEvent(new CustomEvent('$cheetaMC-' + this.bindings[i].attrName + '-' + this.toExpr(),
							{'detail': {value: val, oldValue: oldVal, target: this}}));
				}
			}
			return this;
		};
		this.addDirective = function(directive) {
			if (this.directives == null) {
				this.directives = {};
			}
			this.directives[directive.name] = directive;
			if (directive.isGlobal()) {
				if (this.directives['/'] == null) {
					this.directives['/'] = [];
				}
				this.directives['/'].push(directive.name.length - 1);
			}

		};
		this.getDirective = function(name) {
			return this.directives == null ? null : this.directives[name];
		};
	},
	ArrayInterceptor: function(model) {
		return {
			push: function() {
				var len = this.length;
				var result = Array.prototype.push.apply(this, arguments);
				var newLen = this.length;
				model.valueChange(newLen, len);
				return result;
			},
			pop: function() {
				var len = this.length;
				var result = Array.prototype.pop.apply(this, arguments);
				var newLen = this.length;
				model.valueChange(newLen, len);
				return result;
			},
			shift: function() {
				return this.splice(0, 1)[0];
			},
			unshift: function() {
				var args = [].slice.apply(arguments);
				args.unshift(0, 0);
				this.splice.apply(this, args);
				return this.length;
			},
			splice: function() {
				var len = this.length;
				var result = Array.prototype.splice.apply(this, arguments);
				var newLen = this.length;
				model.valueChange(newLen, len);
				return result;
			}
		};
	},
	interceptArray: function(model) {
		if (model.value != null) {
			var interceptor = new this.ArrayInterceptor(model);
			for (var key in interceptor) {
				if (model.value[key] === interceptor[key]) {
					break;
				}
				model.value[key] = interceptor[key];
			}
		}
	},
	interceptProp: function(model, value, name) {
		if (value != null) {
			var beforeValue = value[name];
			var isCheetaIntercepted = model.parent.children && model.parent.children[name] != null;
			// avoid infinite loop to redefine prop
			var prevProp = isCheetaIntercepted ? null : Object.getOwnPropertyDescriptor(value, name);
			try {
				Object.defineProperty(value, name, {
			        set: function(val) {
			        	if (prevProp && prevProp.set) {
			        		prevProp.set.apply(value, arguments);
			        	}
			        	val = (prevProp && prevProp.get && prevProp.get.apply(value)) || val;
			        	var prevVal = model.value;
			        	if (prevVal !== val) {
			        		model.value = val;
			        		if (model.isArray) {
			        			$cheeta.model.interceptArray(model);
			        		}
				        	model.valueChange(val, prevVal);
				        	if (val instanceof Object) {
								for (var key in model.children) {
									var origVal = val[key];
									// cleanup the previous value's child interceptors.
									if (prevVal != null) {
										var pval = prevVal[key];
										delete prevVal[key];
										prevVal[key] = pval;
									}
									$cheeta.model.interceptProp(model.children[key], val, key);
									val[key] = origVal;
								}
				        	}
			        	}
					},
					get: function() {
						return (prevProp && prevProp.get && prevProp.get.apply(value)) || model.value;
					},
					enumerable: true,
					configurable: true
				});
			} catch(e) {
				if (!(e instanceof TypeError)) {
					throw e;
				}
				return;
			}
			value[name] = beforeValue;
		}
	},
	findParentModel: function(model, rootName) {
		while (model !== $cheeta.model.root) {
			if (model.names.indexOf(rootName) > -1) {
				return model;
			}
			model = model.parent;
		}
		return model;
	},
	get: function(ref) {
		return this.createOrGetModel(null, ref);
	},
	createOrGetModel: function(parentModels, name) {
		if (name == null) {
			return $cheeta.model.root;
		}
		if (parentModels == null) {
			parentModels = [$cheeta.model.root];
		}
		if (name === '$i') {
			for (var i = parentModels.length - 1; i >= 0; i--) {
				if (parentModels[i].names[0] === '$i') {
					return parentModels[i];
				}
			}
		}
		if (name.search(/^ *\./) === 0) {
			// bind dot-starting to the first parent
			name = parentModels[0].names[0] + name;
		}

//		var split = name.split(/ *\. *| *(?=\[) */g);
		var split = name.split(/ *\. *| *\[ */g);
		var rootName = split[0];
		var parentModel = $cheeta.model.root;
		for (var j = 0; j < parentModels.length; j++) {
			parentModel = parentModels[j];
			parentModel = this.findParentModel(parentModel, rootName);
			if (parentModel !== $cheeta.model.root) {
				break;
			}
		}
		for (var k = parentModel === $cheeta.model.root ? 0 : 1; k < split.length; k++) {
			var hasSpecialChar = false, modelName = split[k];
			if (modelName.search(/\( *$/) > -1) {
				if (modelName.search(/\] */) > -1) {
					modelName = '[' + modelName;
				}
				return [parentModel, modelName];
			} else if (modelName.search(/\] *$/) > -1) {
				modelName = modelName.replace(/^ *'|'? *] *$/g, '');
				hasSpecialChar = true;
			}
			parentModel = parentModel.children[modelName] || parentModel.createOrGetChild(modelName, hasSpecialChar);
		}
		return parentModel;
	}
};

$cheeta.refresh = function(modelRef) {
	var model = $cheeta.model.createOrGetModel(null, modelRef);
	model.valueChange(model.getValue(), null);
};

$cheeta.model.root = $cheeta.model.root || new $cheeta.model.Model(null);
$cheeta.model.root.value = window;
$cheeta.root = $cheeta.model.root;

$cheeta.watchFns = [];
$cheeta.watch = function(modelExpr, fn) {
	$cheeta.watchFns.push(fn);
	var elem = document.createElement('div');
	elem.setAttribute('style', 'display:none');
	elem.setAttribute('watch.', modelExpr);
	elem.setAttribute('onwatch.', '$cheeta.watchFns[' + ($cheeta.watchFns.length - 1) + ']()');
	document.body.appendChild(elem);
	$cheeta.compiler.compile([$cheeta.model.root], elem);
};

$cheeta.future = function(future) {
	$cheeta.future.evals.push([future]);
};
$cheeta.future.evals = $cheeta.future.evals || [];

$cheeta.isString = function(str) {
	return typeof str === 'string' || str instanceof String;
};

$cheeta.isFunction = function(val) {
	return typeof val === 'function';
};

$cheeta.isArray = (function() {
  if (!$cheeta.isFunction(Array.isArray)) {
    return function(val) {
      return Object.prototype.toString.call(val) === '[object Array]';
    };
  }
  return Array.isArray;
})();

$cheeta.url = function(url) {
	var parser = document.createElement('a');
	parser.href = url;
	parser.param = function (k, v) {
		parser.search += (parser.search.indexOf('?') > -1 ? '&' : '?') + k + '=' + v;
		return parser;
	};
	parser.params = function (params) {
		if (params) {
			for (var key in params) {
				if (!$cheeta.isFunction(params[key])) {
					parser.param(key, params[key]);
				}
			}
		}
		return parser;
	};
	return parser;
};

$cheeta.copy = function(from, to, full) {
	for (var key in from) {
		if (full === true || ($cheeta.isFunction(full) && full(key, from[key]))) {
			to[key] = from[key];
		} else if (!$cheeta.isFunction(from[key])) {
			to[key] = from[key];
		}
	}
};


window.addEventListener('load', function() {
	if (!$cheeta.isInitialized) {
		$cheeta.isInitialized = true;
		$cheeta.hash.init();
		$cheeta.compiler.compile([$cheeta.model.root], document.documentElement);
	}
}, false);
$cheeta.Directive = function (name, model) {
	this.name = name;
	this.isGlobal = function () {
		return this.name.indexOf('*', this.name.length - 1) > -1;
	};
	this.order = 1000;
	this.setOrder = function (val) {
		this.order = val;
		return this;
	};
	this.onPreAttach = function (preAttachFn) {
		this.preAttach = this.preAttach ? function () {
			this.preAttach.apply(this, arguments);
			preAttachFn.apply(this, arguments);
		} : preAttachFn;
		return this;
	};
	this.onAttach = function (attachFn) {
		this.attach = this.attach ? function () {
			this.attach.apply(this, arguments);
			attachFn.apply(this, arguments);
		} : attachFn;
		return this;
	};
	this.onPostAttach = function (postAttachFn) {
		this.postAttach = this.postAttach ? function () {
			this.postAttach.apply(this, arguments);
			postAttachFn.apply(this, arguments);
		} : postAttachFn;
		return this;
	};
	this.onDetach = function (detachFn) {
		this.detach = this.detach ? function () {
			this.detach.apply(this, arguments);
			detachFn.apply(this, arguments);
		} : detachFn;
		return this;
	};
	this.onModelValueChange = function (changeFn, attrValueTransformer) {
		var origAttach = this.attach;
		var origDetach = this.detach;
		this.attach = function (elem, attrName, parentModels) {
			//var models = [];
			if (origAttach) {
				origAttach.apply(this);
			}
			if (!this.resolveModelNames(elem, attrName, parentModels, function (model) {
					//models.push(model);
					var _this = this;
					model.bindModelChange(elem, attrName, function () {
						var val = eval(elem.getAttribute(attrName));
						if (changeFn) {
							changeFn.apply(_this, [val, elem, attrName, parentModels]);
						}
					});
				}, attrValueTransformer)) {
				var val = eval(elem.getAttribute(attrName));
				if (changeFn) {
					changeFn.apply(this, [val, elem, attrName, parentModels]);
				}
			}
			//return models;
		};
		this.detach = function (elem, attrName, parentModels) {
			//var models = [];
			if (origDetach) {
				origDetach.apply(this);
			}
			this.resolveModelNames(elem, attrName, parentModels, function (model) {
				//models.push(model);
				model.unbindModelChange(elem, attrName);
			}, true);
			//return models;
		};
		return this;
	};
//	this.lastId = String.fromCharCode(33);
//	this.nextId = function() {
//		if (this.lastId.charCodeAt(0) === 126) {
//			this.lastId = String.fromCharCode(33) + this.lastId;
//		}
//		this.lastId[0] = String.fromCharCode(this.lastId.charCodeAt(0) + 1);
//		return this.lastId;
//	}
//	this.id = function(elem) {
//		return elem.__$cheeta__id_ || (elem.__$cheeta__id_ = this.this.nextId());
//	};
	this.resolveModelNames = function (elem, attrName, parentModels, onModel, attrValueTransformer) {
		var directive = this, hasModel = false;
		var resolvedVal = this.parseModelVars(
			(attrValueTransformer && attrValueTransformer(elem, attrName)) ||
			elem.getAttribute(attrName), function (modelRef) {
				var model = $cheeta.model.createOrGetModel(parentModels, modelRef.trim());

				hasModel = true;
				if (model instanceof Array) {
					var mexpr = model[0].toExpr();
//				return mexpr + (mexpr.length > 0 ? '.' : '') + model[1];
					return mexpr + (mexpr.length > 0 && model[1][0] !== '[' ? '.' : '') + model[1];
				} else {
					if (onModel) {
						onModel.call(directive, model);
					}
					return model.toExpr();
				}
			});
		if (!attrValueTransformer) {
			elem.setAttribute(attrName, resolvedVal);
		}
		return hasModel;
	};
	var modelVarRegExp = /(((((\. *)?[^ \.!%-\-/:-?\^\[\]{-~\t\r\n'"]+)|\[ *([^ \.!%-\-/:-?\^\[\]{-~\t\r\n'"]+|'(\\'|[^'])*') *\]) *)+\(?)|('(\\'|[^'])*')/g;
	var reservedWords = '(abstract|else|instanceof|super|boolean|enum|int|switch|break|export|interface|synchronized|byte|extends|let|this|case|false|long|' +
		'throw|catch|final|native|throws|char|finally|new|transient|class|float|null|true|const|for|package|try|continue|function|private|typeof|debugger|goto|' +
		'protected|var|default|if|public|void|delete|implements|return|volatile|do|import|short|while|double|in|static|with)';
	this.parseModelVars = function (val, modelCallback) {
		function replaceModelVars(val) {
			return val.replace(modelVarRegExp, function (match) {
				if (match.charAt(0) === '\'' || match.charAt(0) === '"' || match === 'true' || match === 'false' ||
					match === 'undefined' || match === 'null' || match === 'NaN' || !isNaN(match)) {
					return match;
				} else {
					match = match.replace(/\[ *([^0-9'"].*?)\]/g, function (m, $1) {
						return '[' + replaceModelVars($1) + ']';
					});
					var reserved = '';
					match = match.replace(new RegExp('(^|\\W)' + reservedWords + '(\\W|$)', 'g'), function (m, $1, $2, $3) {
						reserved += $2 + '|';
						return $1 + '\'' + $2 + '\'' + $3;
					});
					if (reserved.length > 0) {
						match = replaceModelVars(match);
						return match.replace(new RegExp('\'\(' + reserved.slice(0, -1) + '\)\'', 'g'), function (m) {
							return m.slice(1, -1);
						});
					} else {
						return modelCallback.call(this, match);
					}
				}
			});
		}

		return replaceModelVars(val);
	};
	this.extend = function () {
		var args = Array.prototype.slice.call(arguments, 0);
		for (var i = 0; i < args.length; i++) {
			this.onAttach(args.attach);
			this.onDetach(args.detach);
		}
		return this;
	};
//	this.tokenizeAttrVal = function(val, onToken) {
//		var quote = null, regexpMod = false, index = -1, optionsSplitIndex = val.indexOf(';');
//		if (optionsSplitIndex > -1 && optionsSplitIndex)
//		val += '\x1a';
//		for (var i = 0; i < val.length; i++) {
//			var ch = val.charAt(i);
//			if (quote != null) {
//				if (ch == quote && val.charAt(i - 1) != '\\') {
//					if (quote == '/') {
//						regexpMod = true;
//					}
//					quote = null;
//				}
//				onToken.onLiteral(ch);
//			} else {
//				if (regexpMod) {
//					if (ch < 'a' && ch > 'z') {
//						regexpMod = false;
//					}
//					onToken.onLiteral(ch);
//				} else if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === '!' || ch === '"' || ch === '[' || ch === ']' ||
//						(ch >= '%' && ch <= '/' && ch != '.') || (ch >= ':' && ch <= '?') || (ch >= '{' && ch <= '~') || ch === '^' || ch == '\x1a') {
//					if (ch === '\'' || ch === '"' || ch === '/') {
//						quote = ch;
//					}
//					if (index > -1) {
//						var name = val.substring(index, i);
//						if (name === 'true' || name === 'false' || name === 'undefined' || name === 'null' ||
//							name === 'NaN' || !isNaN(name)) {
//							onToken.onLiteral(name);
//						} else {
//							var ii = i;
//							while (val.charAt(ii) == ' ') {
//								ii++;
//							}
//							if (val.charAt(ii) == '(') {
//								var fnIndex = name.lastIndexOf('.');
//								if (fnIndex > -1) {
//									onToken.onFnVar(name.substring(0, fnIndex));
//									onToken.onLiteral(name.substring(fnIndex));
//								} else {
//									onToken.onLiteral(name);
//								}
//							} else {
//								onToken.onVar(name);
//							}
//						}
//						index = -1;
//					}
//					if (ch !== '\x1a') {
//						onToken.onLiteral(ch);
//					}
//				} else {
//					if (index == -1) {
//						index = i;
//					}
//				}
//			}
//		}
//	};
	$cheeta.model.get(model).addDirective(this);
};

$cheeta.Directive.get = function (name, parentModels) {
	if (name.indexOf('data-') === 0) {
		name = name.substring(5);
	}
	var endsWithDot = name.indexOf('.', name.length - 1) > -1;
	parentModels = parentModels || [$cheeta.model.root];
	for (var i = 0; i < parentModels.length; i++) {
		var model = parentModels[i];
		var directive = model.getDirective(name);
		if (directive == null && model.directives != null && model.directives['/'] != null && endsWithDot) {
			var indices = model.directives['/'];
			for (var k = 0; k < indices.length; k++) {
				directive = model.directives[name.substring(0, indices[k]) + '*'];
				if (directive != null) {
					return directive;
				}
			}
		} else {
			if (directive != null) {
				return directive;
			}
		}
	}
	return $cheeta.Directive.get('');
};
$cheeta.compiler = {
	recursiveCompile: function (parentModels, node, runInlineScripts, erase, skipSiblings, skipNode) {
		if (node) {
			var models = parentModels;
			if (!skipNode) {
				if (node.nodeType === 1) {
					if (node.tagName.toLowerCase() === 'script' && !erase) {
						if (runInlineScripts && (node.parentNode == null ||
							node.parentNode.tagName.toLowerCase() !== 'head') &&
							(node.type == null || node.type === '' || node.type === 'text/javascript')) {
							var content = node.innerHTML || '';
							var head = document.getElementsByTagName('head')[0] || document.documentElement;
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.appendChild(document.createTextNode(content));
							head.insertBefore(script, head.firstChild);
							head.removeChild(script);
						} else if (node.type === 'text/cheeta-template') {
							$cheeta.templates[node.getAttribute('id')] = node.innerHTML || '';
						}
					}
					models = this.compileDirectives(parentModels, node, erase);
				}
			}
			if (!node.__shouldSkipChildren_) {
				this.recursiveCompile(models, node.firstChild, runInlineScripts, erase);
			} else {
				node.__shouldSkipChildren_ = undefined;
			}
			if (!skipSiblings) {
				this.recursiveCompile(parentModels, node.nextSibling, runInlineScripts, erase);
			}
		}
	},
	doCompile: function () {
		this.recursiveCompile.apply(this, arguments);
		this.runFutures();
	},
	compile: function (parentModels, elem, runInlineScripts) {
		this.doCompile(parentModels, elem, runInlineScripts, false, true);
	},
	compileChildren: function (parentModels, elem, runInlineScripts) {
		this.doCompile(parentModels, elem, runInlineScripts, false, true, true);
	},
	uncompile: function (parentModels, elem) {
		this.doCompile(parentModels, elem, false, true, true);
	},
	uncompileChildren: function (parentModels, elem) {
		this.doCompile(parentModels, elem, false, true, true, true);
	},
	compileDirectives: function (parentModels, elem, erase) {
		var attrDirectives = this.getAttrDirectives(elem, erase, parentModels);
		for (var k = 0; k < attrDirectives.length; k++) {
			var attrDirective = attrDirectives[k];
			var models;
			if (erase) {
				if (attrDirective.directive.detach) {
					models = attrDirective.directive.detach(elem, attrDirective.attrName, parentModels);
				}
			} else {
				if (attrDirective.directive.attach) {
					models = attrDirective.directive.attach(elem, attrDirective.attrName, parentModels);
				}
				if (attrDirective.directive.postAttach) {
					attrDirective.directive.postAttach(elem, attrDirective.attrName, parentModels);
				}
			}
			parentModels = (models || []).concat(parentModels);

			if (attrDirective.directive.name === 'for.' || attrDirective.directive.name === 'show.') {
				elem.__shouldSkipChildren_ = true;
				break;
			}
		}
		return parentModels;
	},
	getAttrDirectives: function (elem, erase, parentModels) {
		var attrDirectives = [];
		var additionalAttribs = [];

		function addDirectiveToList(attr) {
			var directive = $cheeta.Directive.get(attr.name, parentModels);
			if (directive.preAttach) {directive.preAttach(elem, attr.name, parentModels);}
			var attrDirective = {attrName: attr.name, directive: directive};
			var index;
			for (index = attrDirectives.length - 1; index >= 0; index--) {
				if (attrDirective.directive.order > attrDirectives[index].directive.order) {
					break;
				}
			}
			attrDirectives.splice(index + 1, 0, attrDirective);
		}
		var attr;
		for (var k = 0; k < elem.attributes.length; k++) {
			attr = elem.attributes[k];
			if (attr.specified) {
				var split = attr.name.split('.');
				if (split[split.length - 1] === '') {
					split.pop();
				} else {
					continue;
				}
				if (split.length > 1) {
					for (var i = 0; i < split.length; i++) {
						additionalAttribs.push({name: split[i] + '.', value: attr.value});
					}
					elem.removeAttribute(attr.name);
				} else {
					addDirectiveToList(attr);
				}
			}
		}
		while (additionalAttribs.length) {
			attr = additionalAttribs.pop();
			if (elem.getAttribute(attr.name) == null) {
				elem.setAttribute(attr.name, attr.value);
			}
			addDirectiveToList(elem.attributes[attr.name]);
		}
		return attrDirectives;
	},
	runFutures: function () {
		var runs = $cheeta.future.evals.slice(0);
		$cheeta.future.evals = [];
		for (var i = 0; i < runs.length; i++) {
			var expr = runs[i];
			if (Array.isArray(expr)) {
				expr[0].call(expr.slice(1));
			} else {
				eval(expr);
			}
		}
	}
};
$cheeta.XHR = function(target) {
	target = target || this;
	var origSend = this.send;
	var origOpen = this.open;
	var xhr = new XMLHttpRequest();
	xhr.open = function() {
		origOpen.apply(xhr, arguments);
		return xhr;
	};
	xhr.send = function() {
		origSend.apply(xhr, arguments);
		return xhr;
	};
	var successCallbacks = [], completeCallbacks = [], errorCallbacks = [],
		stateChangeCallbacks = [], progressCallbacks = [];
	xhr.onError = function(callback) {
		errorCallbacks.push(callback);
		return xhr;
	};
	xhr.onSuccess = xhr.after = function(callback) {
		successCallbacks.push(callback);
		return xhr;
	};
	xhr.onComplete = function(callback) {
		completeCallbacks.push(callback);
		return xhr;
	};
	xhr.setTo = function(callback) {
		completeCallbacks.push(callback);
		return xhr;
	};
	xhr.onStateChange = function(callback) {
		stateChangeCallbacks.push(callback);
		return xhr;
	};
	xhr.onProgress = function(callback) {
		progressCallbacks.push(callback);
		return xhr;
	};

	xhr.onreadystatechange = function(e) {
		var i = 0;
		if (xhr.readyState === 4) {
			var contentType = xhr.getResponseHeader('Content-Type') || '';
			var response = [xhr, contentType.indexOf('application/json') > -1 ?
				JSON.parse(xhr.data) : xhr.data];
			if (200 <= xhr.status && xhr.status < 300) {
				for (i = 0; i < successCallbacks.length; i++) {
					successCallbacks[i].apply(target, response);
				}
				for (i = 0; i < $cheeta.XHR.successCallbacks.length; i++) {
					$cheeta.XHR.successCallbacks[i].apply(target, response);
				}
			} else {
				for (i = 0; i < errorCallbacks.length; i++) {
					errorCallbacks[i].apply(target, response);
				}
				for (i = 0; i < $cheeta.XHR.errorCallbacks.length; i++) {
					$cheeta.XHR.errorCallbacks[i].apply(target, response);
				}
			}
			for (i = 0; i < completeCallbacks.length; i++) {
				completeCallbacks[i].apply(target, response);
			}
			for (i = 0; i < $cheeta.XHR.completeCallbacks.length; i++) {
				$cheeta.XHR.completeCallbacks[i].apply(target, response);
			}

        }
		for (i = 0; i < stateChangeCallbacks.length; i++) {
			stateChangeCallbacks[i].apply(target, e);
		}
		for (i = 0; i < $cheeta.XHR.stateChangeCallbacks.length; i++) {
			$cheeta.XHR.stateChangeCallbacks[i].apply(target, e);
		}
	};

	xhr.upload.addEventListener('progress', function(e) {
		var i = 0;
		for (i = 0; i < progressCallbacks.length; i++) {
			progressCallbacks[i].apply(target, e);
		}
		for (i = 0; i < $cheeta.XHR.progressCallbacks.length; i++) {
			$cheeta.XHR.progressCallbacks[i].apply(target, e);
		}
	}, false);

	Object.defineProperty(xhr, 'data', {
		get: function() {
			return xhr.getResponseHeader('Content-Type') === 'application/json' ? JSON.parse(xhr.responseText) : xhr.responseText;
		},
		enumerable: true,
		configurable: true
	});

	return xhr;
};

$cheeta.XHR.successCallbacks = []; $cheeta.XHR.completeCallbacks = []; $cheeta.XHR.errorCallbacks = [];
$cheeta.XHR.stateChangeCallbacks = []; $cheeta.XHR.progressCallbacks = [];
$cheeta.XHR.onError = function(callback) {
	$cheeta.XHR.errorCallbacks.push(callback);
	return $cheeta.XHR;
};
$cheeta.XHR.onSuccess = function(callback) {
	$cheeta.XHR.successCallbacks.push(callback);
	return $cheeta.XHR;
};
$cheeta.XHR.onComplete = function(callback) {
	$cheeta.XHR.completeCallbacks.push(callback);
	return $cheeta.XHR;
};
$cheeta.XHR.onStateChange = function(callback) {
	$cheeta.XHR.stateChangeCallbacks.push(callback);
	return $cheeta.XHR;
};
$cheeta.XHR.onProgress = function(callback) {
	$cheeta.XHR.progressCallbacks.push(callback);
	return $cheeta.XHR;
};

$cheeta.XHR.prototype = new XMLHttpRequest();
$cheeta.resource = function (config) {
    if ($cheeta.isString(config)) {
        config = {url: config};
    }
    var ResourceClass = function (obj) {
        $cheeta.copy(obj, this);

        var _this = this;

        function callXHR(method, obj, fn, err) {
            _this.$xhr().open(method, _this.$resolveUrl(), config.async || true).send(obj)
                .after(function (x, data) {
                    if (data != null) {
                        $cheeta.copy(data, _this);
                    }
                    fn.call(_this, data);
                }).onError(function (x, data) {
                    if (err) {
                        err.call(_this, x.status, data);
                    }
                });
        }

        this.$resolveUrl = function () {
            var _this = this;
            return config.url.replace(/{:(\w+)}/, function (p, m) {
                var val = _this[m];
                return val ? val : '';
            });
        };
        this.$xhr = function (newXHR) {
            return newXHR ? newXHR() : new $cheeta.XHR();
        };
        this.$create = function (fn, err) {
            callXHR('POST', null, fn, err);
            return this;
        };
        this.$post = function (fn, err) {
            callXHR('POST', this, fn, err);
            return this;
        };
        this.$put = this.$update = function (fn, err) {
            callXHR('PUT', this, fn, err);
            return this;
        };
        this.$remove = function (fn, err) {
            callXHR('DELETE', null, fn, err);
            return this;
        };
        this.$get = function (fn, err) {
            callXHR('GET', null, fn, err);
            return this;
        };
        this.$query = function (params, dataPath, fn, err) {
            return ResourceClass.$query(this, dataPath).after(fn).error(err);
        };
    };

    ResourceClass.$query = function (params, dataPath) {
        var resp = [], after, err;
        resp.after = function (fn) {
            after = fn;
            return this;
        };

        resp.error = function (fn) {
            err = fn;
            return this;
        };

        var sample = params || params instanceof ResourceClass ? params : new ResourceClass();

        var isStringDataPath = dataPath && $cheeta.isString(dataPath);

        sample.$xhr().open('GET', $cheeta.url(sample.$resolveUrl(config.url)).params(params).toString(),
            config.async || true).send().after(function (x, data) {
                if (after) {
                    if (dataPath == null) {
                    } else if (isStringDataPath) {
                        var split = dataPath.split('.');
                        for (var j = 0; j < split.length; j++) {
                            data = data[split[j]];
                        }
                    }
                    for (var i = 0; i < data.length; i++) {
                        resp[i] = new ResourceClass(data[i]);
                    }
                    after.call(this, data, resp);
                }
            }).onError(function (x, data) {
                if (err) {
                    err.call(this, x.status, data);
                }
            });
        return resp;
    };

    return ResourceClass;
};
//define interceptor framework to easily add interceptor to any object's method like xhr.send()
(function() {
	new $cheeta.Directive('bind.').onAttach(function(elem, attrName, parentModels) {
		this.fn = this.fn || {};
		this.fn[elem] = function() {
			setTimeout(function() {
				var _tmpFn__ = function() {
					if (elem.type && elem.type.toLowerCase() === 'checkbox') {
						return elem.checked;
					}
					if (elem.tagName.toLowerCase() === 'input' || elem.tagName.toLowerCase() === 'textarea') {
						return elem.value;
					} else {
						return elem.innerHTML;
					}
				};
				_tmpFn__ = _tmpFn__ || {};
				eval(elem.getAttribute(attrName) + '=_tmpFn__()');
//				eval(elem.getAttribute(attrName) + '=\'' + elem.value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'');
			}, 0);
		};
		if (elem.tagName.toLowerCase() === 'input' || elem.tagName.toLowerCase() === 'textarea') {
			$cheeta.Directive.get('value.').attach(elem, attrName, parentModels);
		} else {
			$cheeta.Directive.get('html.').attach(elem, attrName, parentModels);
		}
		$cheeta(elem).on('keydown keyup change', this.fn[elem]);
	}).onDetach(function(elem, attrName, parentModels) {
		$cheeta.Directive.get('value.').detach(elem, attrName, parentModels);
		if (this.fn[elem]) {
			$cheeta(elem).off('keydown keyup change', this.fn[elem]);
		}
	}).setOrder(800);
})();

(function() {
	var attach = function(elem, attrName, parentModels) {
		//TODO handle app1['myapp,yourapp']
		var defs = elem.getAttribute(attrName).split(/ *, */g);
		var models = [];

		for (var i = 0; i < defs.length; i++) {
			var def = defs[i];
			//TODO handle app1['123 as 123']
			var split = def.split(/ +as +/g);
			var name = split[0];
			var as = split.length > 1 ? split[1] : null;
			var model = $cheeta.model.createOrGetModel(parentModels, name);
			model.alias(as);
			models.push(model);
//			eval(model.toExpr() + '=' + model.toExpr() + '|{}');
		}
		return models;
	};
	new $cheeta.Directive('ctrl.').setOrder(200).onAttach(attach).onDetach(attach);
	new $cheeta.Directive('model.').setOrder(200).onAttach(attach).onDetach(attach);
})();

new $cheeta.Directive('').onModelValueChange(function(val, elem, attrName) {
	var baseAttrName = attrName.substring(attrName.indexOf('data-') === 0 ? 5 : 0, attrName.length - 1);
	if (val == null) {
		elem.removeAttribute(baseAttrName);
	} else {
		elem.setAttribute(baseAttrName, val);
	}
});


new $cheeta.Directive('focus.').onModelValueChange(function(val, elem) {
	elem.focus(val);
});
new $cheeta.Directive('for.').setOrder(100).onAttach(function(elem, attrName, parentModels) {
	var parse = this.parseAttr(elem.getAttribute(attrName));
	var name = parse.name, as = parse.as, arrayVar = parse.arrayVar;

	var cloneElem = function(elem) {
		var clone = elem.cloneNode(true);
		clone.removeAttribute('for.');
		clone.removeAttribute('data-for.');
		clone.style.display = '';
		return clone;
	};

	var onChange = function(e) {
		var i = 0, clone, arrayIndexModel, rmElem;
		if (!isNaN(e.detail.value) || !isNaN(e.detail.oldValue) || Array.isArray(e.detail.value) || Array.isArray(e.detail.oldValue)) {
			var newLen = e.detail.value, oldLen = e.detail.oldValue;
			if (newLen instanceof Object || oldLen instanceof Object) {
	//				$cheeta.model.interceptArray(newLen, this.update);
				newLen = newLen == null ? 0 : newLen.length;
				oldLen = oldLen == null ? 0 : oldLen.length;
			}

			if (oldLen > newLen) {
				for (i = oldLen - 1; i >= newLen; i--) {
					rmElem = elem.previousSibling;
					rmElem.parentNode.removeChild(rmElem);
					delete model.children[i];
				}
			} else if (oldLen < newLen) {

				for (i = oldLen; i < newLen; i++) {
					clone = cloneElem(elem);
					clone.setAttribute('model.', name + '[' + i + '] as ' + arrayVar[0] +
							(elem.getAttribute('model.') ? (';' + elem.getAttribute('model.').value) : ''));
					clone.style.display = '';
					elem.parentNode.insertBefore(clone, elem);
					arrayIndexModel = new $cheeta.model.Model($cheeta.model.root, '$i');
					arrayIndexModel.toExpr = makeToExpr(i);
					$cheeta.compiler.compile(parentModels.concat(arrayIndexModel), clone);
				}
			}
		} else {
			var newVal = e.detail.value, oldVal = e.detail.oldValue;
			var newKeys = (newVal && Object.keys(newVal)) || [], oldKeys = (oldVal && Object.keys(oldVal)) || [];

			var refElem = elem;
			var j = newKeys.length - 1;
			i = oldKeys.length - 1;
			while (i >= 0 || j >= 0) {
				if (oldKeys[i] !== newKeys[j]) {
					if (j >= 0) {
						clone = cloneElem(elem);
						clone.setAttribute('model.', (arrayVar[1] ? name + '[\'' + newKeys[j] + '\'] as ' + arrayVar[1] : '') +
								(elem.getAttribute('model.') ? (';' + elem.getAttribute('model.').value) : ''));
						elem.parentNode.insertBefore(clone, refElem);
						arrayIndexModel = new $cheeta.model.Model($cheeta.model.root, '$i');
						arrayIndexModel.toExpr = makeToExpr(i);
						var keyModel = new $cheeta.model.Model($cheeta.model.root, arrayVar[0]);
						keyModel.toExpr = makeToExprModel(newKeys[j]);
						$cheeta.compiler.compile(parentModels.concat(arrayIndexModel, keyModel), clone);
						refElem = clone;
						j--;
					} else {
						rmElem = refElem.previousSibling;
						rmElem.parentNode.removeChild(rmElem);
						delete model.children[oldKeys[i]];
						i--;
					}
				} else {
					model.children[oldKeys[i]].valueChange(newVal[newKeys[j]], oldVal[oldKeys[i]]);
					j--;
					i--;
				}
			}
//			model.isArray = true;
		}
	};
	var model = $cheeta.model.createOrGetModel(parentModels, name);
	model.bindModelChange(elem, attrName, onChange);
	model.alias(as);
	if (arrayVar.length === 1) {
		model.isArray = true;
	}
	elem.style.display = 'none';

	function makeToExpr(i) {
		return function() {
			return i;
		};
	}
	function makeToExprModel(s) {
		return function() {
			return '\'' + s + '\'';
		};
	}

	return [model];
}).onDetach(function(elem, attrName, parentModels) {
	var parse = this.parseAttr(elem.getAttribute(attrName));
	var name = parse.name;
	var model = $cheeta.model.createOrGetModel(parentModels, name);
	model.unbindModelChange(elem, attrName);
	return [model];
}).parseAttr = function(val) {
	//TODO handle app1['a in b']
	var split = val.split(/ +in +/g);
	var name = split[1];
	var arrayVar = split[0].split(',');
	//TODO handle app1['a as b']
	split = name.split(/ +as +/g);
	name = split[0];
	var as = split.length > 1 ? split[1] : null;
	return {as: as, name: name, arrayVar: arrayVar};
};

new $cheeta.Directive('html.').onModelValueChange(function(val, elem) {
	if (val !== elem.innerHTML) {
		elem.innerHTML = val == null ? '' : val;
	}
});

new $cheeta.Directive('init.').onAttach(function(elem, attrName, parentModels) {
	this.resolveModelNames(elem, attrName, parentModels);
	$cheeta.future.evals.push(elem.getAttribute(attrName));
});

$cheeta.keyconsts = {
	'backspace':8,'tab':9,'enter':13,'shift':16,'ctrl':17,'alt':18,'space':32,'pause':19,'break':19,'capslock':20,'escape':27,'esc':27,'pageup':33,'pagedown':34,'end':35,
	'home':36,'left':37,'up':38,'right':39,'down arrow':40,'insert':45,	'delete':46,'colon':58, 'f1':112,'f2':113,'f3':114,'f4':115,'f5':116,'f6':117,'f7':118,
	'f8':119,'f9':120,'f10':121,'f11':122,'f12':123,'numlock':144,'scrolllock':145,'semicolon':186,'comma':188,'dash':189,'dot':190
};
new $cheeta.Directive('on*').onAttach(function(elem, attrName, parentModels) {
	this.resolveModelNames(elem, attrName, parentModels);

	var baseAttrName = attrName.substring(attrName.indexOf('data-') === 0 ? 7 : 2, attrName.length - 1);
	var split = baseAttrName.split('-');
	(function bindEvent(event, keys, attrName) {
		var fn = function() {
			eval(elem.getAttribute(attrName));
		};
		if (event.indexOf('key') === 0) {
			var codes = [];
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				if (key.length === 1) {
					codes[i] = key.charCodeAt(0);
				} else {
					codes[i] = $cheeta.keyconsts[key.toLowerCase()];
					if (codes[i] == null) {
						codes[i] = parseInt(key);
						if (isNaN(codes[i])) {
							throw 'unknown key: ' + key;
						}
					}
				}
			}
			var keyFn = function(e) {
				if (codes.indexOf(e.which) > -1) {
					fn.apply(elem, [e]);
					e.preventDefault();
					e.stopPropagation();
				}
			};
			elem.addEventListener(event, keyFn, false);
		} else {
			var listenerFn = function(e) {
				fn.apply(elem, [e]);
				e.preventDefault();
				e.stopPropagation();
			};
			elem.addEventListener(event, listenerFn, false);
		}
	})(split[0], split.slice(1), attrName);
});

new $cheeta.Directive('onaction.').onPreAttach(function(elem, attrName) {
	elem.setAttribute('onclick.onkeydown-space-enter.', elem.getAttribute(attrName));
}).onPostAttach(function(elem, attrName) {
	elem.removeAttribute(attrName);
});

new $cheeta.Directive('show.').onModelValueChange(function(val, elem, attrName, parentModels) {
	if (val) {
		elem.style.display = '';
		if (!elem.__isCompiled_) {
			elem.__isCompiled_ = true;
			$cheeta.compiler.compileChildren(parentModels, elem);
		}
	} else {
		elem.style.display = 'none';
	}
});

new $cheeta.Directive('text.').onModelValueChange(function(val, elem) {
	elem.innerHTML = '';
	elem.appendChild(document.createTextNode(val == null ? '' : val));
//	console.log('innerhtml after: ' +  elem.innerHTML);
});

new $cheeta.Directive('value.').onModelValueChange(function(val, elem) {
	if (elem.type && elem.type.toLowerCase() === 'checkbox') {
		elem.checked = val;
	} else if (elem.value !== val) {
		elem.value = val || null;
	}
});
(function() {
	$cheeta.templates = $cheeta.templates || {};
	var viewDirective = new $cheeta.Directive('view.').onModelValueChange(function(val, elem, attrName, parentModels) {
		if (!elem.__$cheetaViewIsLoading && val != null) {
			// to avoid infinite loop
			elem.__$cheetaViewIsLoading = true;
			try {
				var content = $cheeta.templates[val];
				if (content != null) {
					this.loadView(elem, content, parentModels);
				} else {
					var url = val.indexOf('/') === 0 ? this.baseURL + val : val;
					if (this.cache[url] != null) {
						this.loadView(elem, this.cache[url], parentModels);
					} else {
//						console.log('XHR: ' + url)
						new $cheeta.XHR(this).open('get', url).onSuccess(function(xhr) {
							this.cache[url] = xhr.data;
							this.loadView(elem, xhr.data, parentModels);
						}).send();
					}
				}
			} finally {
				elem.__$cheetaViewIsLoading = false;
			}
		}
	}).setOrder(900);
	viewDirective.baseURL = window.location.protocol + '//' + window.location.hostname +
		(window.location.port && ':' + window.location.port) + window.location.pathname;
	viewDirective.loadView = function(elem, content, parentModels) {
		$cheeta.compiler.uncompileChildren(parentModels, elem);
		elem.innerHTML = content;
		$cheeta.compiler.compileChildren(parentModels, elem, true);
	};
	viewDirective.cache = {};
})();
new $cheeta.Directive('watch*').onModelValueChange(function(v, elem) {
	eval(elem.attr('onwatch.'));
});

$cheeta.hash = {
	keyval: {},
	watchers: {},
	watch: function(key, fn) {
		if (key instanceof Function) {
			fn = key;
			key = '';
		}
		if (this.watchers[key] == null) {
			this.watchers[key] = [];
		}
		if (this.watchers[key].indexOf(fn) === -1) {
			this.watchers[key].push(fn);
		}
	},
	unwatch: function(fn, key) {
		if (key instanceof Function) {
			fn = key;
			key = '';
		}
		var list = this.watchers[key];
		if (list != null) {
			var index = list.indexOf(fn);
			if (index > -1) {
				list.splice(index, 1);
			}
		}
	},
	notify: function(key, newVal, oldVal) {
		var list = this.watchers[key];
		if (list != null) {
			for (var i = 0; i < list.length; i++) {
				list[i](newVal, oldVal);
			}
		}
	},
	set: function(key, val) {
		if (val === undefined) {
			val = key;
			key = '';
		}
		var oldVal = this.keyval[key];
		this.keyval[key] = val;
		var _this = this;
		var toHash = function() {
			var hash = _this.keyval[''] || '';
			for (var key in _this.keyval) {
				if (key.length) {
					hash += (hash.length > 0 ? '&' : '') + key + '=' + _this.keyval[key];
				}
			}
			return hash;
		};
		window.location.hash = toHash();
		this.notify(key, val, oldVal);
	},
	init: function() {
		var _this = this;
		var updateHash = function() {
			var hash = window.location.hash, index = 0, key = '', val, allKeys = {}, prev;
			try {
				hash = hash.substring(hash.length > 1 && hash.charAt(2) === '&' ? 2 : 1);
				for (var i = 0; i <= hash.length; i++) {
					if (hash.charAt(i) === '&' || i === hash.length) {
						val = hash.substring(index, i);
						if (_this.keyval[key] == null || _this.keyval[key] !== val) {
							prev = _this.keyval[key];
							_this.keyval[key] = val;
							_this.notify(key, val, prev);
						}
						index = i + 1;
						allKeys[key] = true;
						key = '';
					} else if (hash.charAt(i) === '=') {
						key = hash.substring(index, i);
						index = i + 1;
					}
				}

				for (key in _this.keyval) {
					if (allKeys[key] == null) {
						prev = _this.keyval[key];
						delete _this.keyval[key];
						_this.notify(key, null, prev);
					}
				}
			} finally {
				_this.value = hash;
			}
		};
		updateHash();
		window.addEventListener('hashchange', function () {
			updateHash();
		}, false);
	},
	get: function(key) {
		return this.keyval[key || ''];
	}
};

$cheeta.route = $cheeta.route || function(map, hashVal) {
	if (map == null) {
		return null;
	}
	var len = 0;
	var url = null;
	for (var key in map) {
		if (hashVal.indexOf(key) === 0 && len < key.length) {
			len = key.length;
			url = map[key];
		}
	}
	return url;
};
