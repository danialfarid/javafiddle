//var editor = function(elem) {
//	return {
//		root: elem,
//		init: function() {
//			this.root.add(El('<div><span>&zwnj;</span></div>'));
//			this.root.on('keyup', this.handleKeyUp);
//		}
//		src: "",
//		line: 0,
//		lastFocus: null,
//		lastPos: 0,
//		isFireFox: typeof InstallTrigger !== 'undefined',
//		currElem: function() {
//			var f = window.getSelection().focusNode;
//			if (f && f.parentNode) {
//				if (f.nodeType === 3) {
//					this.lastFocus = f.parentNode;
//					this.lastPos = window.getSelection().getRangeAt(0).startOffset;
//				} else {
//					this.lastFocus = f;
//					this.lastPos = 0;
//				}
//			}
//			return this.lastFocus;
//		},
//		newElem: function(currElem, tag) {
//			var el = El(tag ? tag : 'span', this.root, currElem || this.currElem());
//			this.lastFocus = el;
//			return el;
//		},
//		setFocus: function(elem, pos) {
//			var sel = window.getSelection();
//			var r = document.createRange();
////			r.selectNode(elem.firstChild);
////			try {
//				r.setStart(elem.firstChild || elem, pos);
//				r.setEnd(elem.firstChild || elem, pos);
////			} catch (e){}
////			r.collapse();
//			sel.removeAllRanges();
//			sel.addRange(r);
//			this.lastFocus = elem;
//			this.lastPos = pos;
//		},
//		getSelectedNodes: function() {
//			var sel = window.getSelection();
//			var r = sel.getRangeAt(0);
//			return r.startContainer;
//		},
//		findElementsBetween: function(from, to) {
//			var list = []
//			function dfs(e1, e2) {
//				if (e1) {
//					list.add(e1);
//					if (e1 !== e2) {
//						return dfs(e1.firstElementChild) ||
//							dfs(e1.nextElementSibling) ||
//							dfs(e1.parentElement);
//					}
//					return true;
//				}
//				return false;
//			}
//			if (!dfs(from, to)) {
//				list = [];
//				dfs(to, from);
//			}
//			return list;
//		},
//		handleKeyUp: function(e) {
//			var newFocus = _this.getSelectedNodes()
//			var elems = this.findElementsBetween(this.lastFocus, newFocus);
//			for(var i = 0; i < elems.length; i++) {
//				this.resolve(elems[i], i == items.length - 1 ? elems[i].nextSibling : null);
//			}
//			this.lastFocus = newFocus;
//			console.log(e.type, _this.getSelectedNodes());
//		},
//		separator: / [](){}\r\n\t,."'/,
//		resolve: function(el, nextEl) {
////			if (nextEl && !this.isSeparator(nextEl.charAt(0))) {
////				el.innerHTML += nextEL.innerHTML;
////				nextEl.remove();
////			}
//			if (el === this.root) {
//				el = El('span').html(el.innerHTML);
//				this.root.add(El('div').add(el));
//			} else if (el.parentElement === this.root) {
//				el.wrap(El('div'));
//			} else if (el.parentElement.parentElement !== this.root) {
//
//			}
//			if (el.tagName !== 'SPAN') {
//				el.addAfter(El('span').html(el.html()));
//				el.remove();
//			}
//			var str = element.innerText || element.textContent;
//			var type;
//			for (var i = 0; i < str.length; i++) {
//				var c = str[i];
//				if (c === 9) {
//					type = 't';
//				} else if (c === 32) {
//					if (type !== 's')) type = 's'
//				} else if (c === 13 || c === 10) {
//					type = 'r';
//				} else if ((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 94) || (c >= 123 && c <= 126)) {
//					if (type !== 'p')) type = 'p'
//				} else if (c >= 48) {
//					if (type !== 'w')) type = 'w'
//				}
//				if (el.attr('t') != type) {
//					el.attr('t', type);
//					el.
//				}
//			}
//		},
//		init: function() {
//			var _this = this;
//			this.root.add(El('<div><span>&zwnj;</span></div>'));
//			this.root.on('keyup', this.handleKeyUp);
////			this.root.on('keydown cut', function(e) {
////				var c = e.which;
////				// tab, backspace, delete, enter
////				if (c === 9 || c === 8 || c === 127 || c === 13 || e.type.toLowerCase() === 'cut') {
////					var sel = window.getSelection();
////					var r = sel.getRangeAt(0);
////					if (r.startOffset > 0) setTimeout(function() {
////						_this.syntaxCheck(r.startContainer.parentNode);
////					}, 1);
////					if (r.startContainer != r.endContainer &&
////							r.endOffset < r.endContainer.textContent.length) setTimeout(function() {
////						_this.syntaxCheck(r.endContainer.parentNode);
////					}, 1);
////					// if we delete everything re-initialize the editor
////					setTimeout(function() {
////						if (_this.root.innerText.trim() === '') {
////							_this.root.innerHTML = "";
////							var el = El('<div><span>&zwnj;</span></div>')
////							_this.root.add(el);
////							_this.setFocus(el.firstChild, 1);
////						}
////					}, 1);
////				}
////				if (c === 9 || (c === 13 && _this.isFireFox)) {
////					e.preventDefault();
////					_this.handleKeyPress(c);
////				}
////			});
////			this.root.on('paste', function(e) {
////				e.preventDefault();
////				e.stopPropagation();
////				var sel = window.getSelection();
////				var r = sel.getRangeAt(0);
////				var focusNode = (r.startOffset === 0) ? (r.startContainer.nodeType === 3 ? r.startContainer.parentNode.previousSibling : r.previousSibling) :
////													(r.startContainer.parentNode);
////				var deletedStr = _this.deleteSelectedRange(r);
////				var str = e.clipboardData.getData('text/plain');
////				_this.setFocus(r.startContainer, r.startOffset);
////				for (var i = 0; i < str.length; i++) {
////					_this.handleKeyPress(str.charCodeAt(i), true);
////				}
////				for (var i = 0; i < deletedStr.length; i++) {
////					_this.handleKeyPress(deletedStr.charCodeAt(i), true);
////				}
////			});
////			this.root.on('keypress', function(e) {
////				_this.handleKeyPress(e.which);
////			});
//			return this;
//		},
//		deleteSelectedRange: function(r) {
//			var selection = window.getSelection();
//			var range = selection.getRangeAt(0);
//			var allWithinRangeParent = range.commonAncestorContainer.getElementsByTagName &&
//				range.commonAncestorContainer.getElementsByTagName("*") || [];
//
//			for (var i=0, el; el = allWithinRangeParent[i]; i++) {
//				// The second parameter says to include the element
//				// even if it's not fully selected
//				if (selection.containsNode(el, false) ) {
//					console.log(el);
//					el.remove();
//				}
//			}
//			var str = r.endContainer.textContent.substring(r.endOffset);
//			r.startContainer.textContent = r.startContainer.textContent.substring(0, r.startOffset);
//			if (r.endContainer !== r.startContainer) {
//				r.endContainer.remove();
//			}
//			console.log(str);
//			return str;
//		},
//		handleKeyPress: function(c, typeIn, el) {
//			var el = el || this.currElem();
//			if (!el.attr('hasqoute')) {
//				var classs = null;
//				if (c === 9) {
////					el.parentElement.innerHTML += '\t';
//					classs = 't';
////					if (el.tagName !== 'S') tag = 'S';
////					var newEl = El('<B>\t</B>');
////					el.addAfter(newEl);
////					this.setFocus(newEl.firsChild || newEl, 1);
////					if (el.innerHTML[0] === '\u200C') {
////						el.innerHTML = el.innerHTML.substring(1);
////					}
////					el = newEl;
//					typeIn = true;
//				} else if (c === 32) {
//					if (!el.hasClass('s')) classs = 's'
//				} else if ((c === 13 || c === 10) && (this.isFireFox || typeIn)) {
//					while (el.parentElement !== this.root) {
//						el = el.parentElement;
//					}
//					classs = 'r';
//					typeIn = false;
//				} else if ((c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 94) || (c >= 123 && c <= 126)) {
//					if (!el.hasClass('p')) classs = 'p';
//				} else if (c >= 48) {
//					if (!el.hasClass('w')) classs = 'w';
//				}
//				var newEl;
//				if (classs) {
//					if (classs == 'r') {
//						newEl = El('div').add(El('span').html('&zwnj;'));
//					} else {
//						newEl = El('span').html('&zwnj;').addClass(classs);
//					}
//					el.addAfter(newEl);
//					if (el.tagName === 'S') {
//						el.remove();
//					} else if (el.innerHTML[0] === '\u200C') {
//						//removing zero-lenght space
//						el.innerHTML = el.innerHTML.substring(1);
//					} else if (el.childNodes.length === 1 && el.firstChild.tagName === 'BR') {
//						//removing browser's created <br/> when enter is pressed
//						el.innerHTML = '';
//					}
//					this.syntaxCheck(el);
//					this.setFocus(newEl.firsChild || newEl, 1);
//				}
//				el = newEl || el;
//				if (typeIn) {
////					el.innerHTML = el.innerHTML +  String.fromCharCode(c);
//					el.firstChild.textContent += String.fromCharCode(c);
//					this.setFocus(el, el.textContent.length);
//				}
//			}
//		},
//		lastFocus: null,
//		lastPos: 0,
//		syntaxCheck: function(elem) {
//			var s = (elem.firstChild && (elem.firstChild.textContent || elem.firstChild.innerHTML)) || elem.innerHTML;
//			if (s.trim() !== '' && !isNaN(s)) {
//				elem.addClass('n');
//			}
//			var clazz = this.reservedWords[s];
//			if (clazz) elem.addClass(clazz);
//		},
//		reservedWords: {'for': 'r'},
//		type: function(ch, meta, ctrl, alt) {
//			if (this.currElem == null || this.currElem.tagName.toLowerCase() !== 'span') {
//				this.newToken();
//			}
//			str = this.currElem.innerHTML;
//			if (meta) {
//				if (ch === 68) {//meta+D
//					this.deleteLine();
//				}
//			} else if (ch === 8) {//backspace
//				if (this.pos === 0) {
//					this.deleteLine();
//				}
//				this.currElem.innerHTML = str.substring(0, this.pos - 1) + str.substring(this.pos, str.length);
//				this.pos--;
//			} else if (ch === 46) {//delete
//				this.currElem.innerHTML = str.substring(0, this.pos) + str.substring(this.pos + 1, str.length);
//			} else if (ch === 13) {//enter
//				this.currElem = Oo('div')[0];
//				this.root.appendChild(this.currElem);
//				this.pos = 0;
//				this.line++;
//				this.type(27);
//			} else if (ch === 37) {//left
//				this.pos = Math.max(this.pos - 1, 0);
//			} else if (ch === 38) {//up
//				this.line = Math.max(this.line - 1, 0);
//				this.currElem = this.root.childNodes[this.line];
//				this.pos = Math.min(this.pos, this.currElem.innerHTML.length);
//			} else if (ch === 39) {//right
//				this.pos = Math.min(this.pos + 1, this.currElem.innerHTML.length);
//			} else if (ch === 40) {//down
//				this.line = Math.min(this.line + 1, this.root.childNodes.length - 1);
//				this.currElem = this.root.childNodes[this.line];
//				this.pos = Math.min(this.pos, this.currElem.innerHTML.length);
//			} else {
//				this.currElem.innerHTML = str.substring(0, this.pos) + String.fromCharCode(ch) + str.substring(this.pos, str.length);
//				this.pos++;
//			}
//            var range = document.createRange();
////	        range.setStartAfter(this.currElem);
//	        range.setStart(this.currElem.firstChild, this.pos);
//	        range.setEnd(this.currElem.firstChild, this.pos);
////            range.setEndBefore(this.currElem);
//
//	        window.getSelection().removeAllRanges();
//	        window.getSelection().addRange(range);
//
////	        range.move('character', this.pos);
////	        range.select();
//		},
//		deleteLine: function() {
//			this.root.removeChild(this.root.childNodes[this.line]);
//		}
//	};
//}
//
//new $cheeta.Directive('editor.').onAttach(function(elem, attrName, parentModels) {
//	this.resolveModelNames(elem, attrName, parentModels);
//	elem.__editor_ = new editor(elem).init();
//	$cheeta(elem).attr("contentEditable", "true");
//	$cheeta(elem).on("paste change keypress", function(e) {
//	});
//
////	$cheeta(elem).on("keydown", function(e) {
////		var c = e.keyCode;
////		if (c == 8) {
////			e.preventDefault();
////			e.stopPropagation();
////			e.target.__editor_.type(e.keyCode, e.metaKey);
////		}
////		console.log(e.keyCode);
////	});
////	$cheeta(elem).on("keypress", function(e) {
////		e.preventDefault();
////		e.stopPropagation();
////		e.target.__editor_.type(e.keyCode);
////	});
////
//	setTimeout(function() {
//		var _tmp__editor_fn__ = function() {
//			return editor.src;
//		};
////		eval(elem.getAttribute(attrName) + '=_tmp__editor_fn__()');
//	}, 0);
//
//});
