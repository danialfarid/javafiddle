//var editor = function(elem) {
//	return {
//		root: elem,
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
//			console.log('set focus ', elem, pos);
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
//		treeChange: function(e) {
//			console.log(e.target);
//			var el = this.currElem();
//			var str = e.target.innerHTML;
//			str.match(/\w+/g)
//			var type, prevType, qoute, tokens = [];
//			for (var i = 0; i < str.length; i++) {
//				var ch = str.charAt(i);
//				var currType = el.attr('t');
//				if (ch === ' ' || ch === '\t') type = 's';
//				else if (ch === '"') type = 'q"';
//				else if (ch === '\'') type = 'q\'';
//				else if (ch === '/' && str.charAt(i + 1) === '/') {
//					type = 'q//';
//				} else if (ch === '/' && str.charAt(i + 1) === '*') {
//					type = 'q/*';
//				} else if (ch === '*' && str.charAt(i + 1) === '/') {
//					type = 'q*/';
//				} else if ((ch >= '!' && ch <= '/') || (ch >= ':' && ch <= '@') || (ch >= '[' && ch <= '^') || (ch >= '{' && ch <= '~')) {
//					type = 'p';
//				} else if (ch >= '0') {
//					type = 'w';
//				}
//				if (prevType !== type || type.charAt(0) === 'q') {
//					tokens.push({t: type, pos: i});
//				}
//				if (type.charAt(0) === 'q' && type.length > 2) {
//					i++;
//				}
//				prevType = type;
//			}
//			this.root.off('DOMSubtreeModified', this.treeChange);
//			try {
//				if (tokens.length > 1) {
//					for (var i = 0; i < tokens.length; i++) {
//						if (i > 0) {
//							var newEl = El('span');
//							el.addAfter(newEl);
//							newEl.attr('q', el.attr('q') || qoute);
//							el = newEl;
//						}
//						el.innerHTML = str.substring(tokens[i].pos, (tokens[i + 1] && tokens[i + 1].pos) || str.length);
//						el.attr('t', tokens[i].t);
//						if (el.attr('t').charAt(0) === 'q') {
//							if (el.attr('q') === el.attr('t') || (el.attr('q') === 'q/*' && el.attr('t') === 'q*/')) {
//								qoute = null;
//							} else {
//								qoute = el.attr('t');
//							}
//						}
//					}
//				}
//				
//				if (qoute) {
//					var next = el.nextSibling;
//					while (next) {
//						if (next.attr('t') === qoute || (qoute === 'q/*' && next.attr('t') === 'q*/') {
//							break;
//						}
//						next.attr('q', qoute);
//						next = next.nextSibling;
//						if (!next && qoute === 'q12') {
//							next = next.parentNode.nextSibling && next.parentNode.nextSibling.firstChild; 
//						}
//					}
//					while (next) {
//						if (next.attr('t') === qoute) {
//							break;
//						}
//						if (next.attr('q') === qoute) {
//							next.attr('q', undefined);
//						} else {
//							break;
//						}
//						next = next.nextSibling;
//						if (!next && qoute === 'q12') {
//							next = next.parentNode.nextSibling && next.parentNode.nextSibling.firstChild; 
//						}
//					}
//				}
//			} finally {
//				this.root.on('DOMSubtreeModified', this.treeChange);
//			}
//		},
//		init: function() {
//			this.root.add(El('<div><span>&zwnj;</span></div>')); 
//			var _this = this;
////			this.root.on('keyup', function() {
////				_this.currElem();
////			});
//			this.root.on('DOMSubtreeModified', this.treeChange);
//			
//			this.root.on('focus', function(e) {
////				var sel = window.getSelection();
////				sel.removeAllRanges();
////				sel.addRange(this.r);
//////				_this.setFocus(_this.lastFocus, _this.lastPos);
////				e.preventDefault();
////				e.stopPropagation();
//			});
//			this.root.on('keydown cut paste', function(e) {
//				var c = e.which;
//				// tab, backspace, delete, enter
//				if (c === 9 || c === 8 || c === 127 || c === 13 || e.type.toLowerCase() === 'cut' || e.type.toLowerCase() === 'paste') {
//					var sel = window.getSelection();
//					var r = sel.getRangeAt(0);
////					if (r.startOffset > 0) setTimeout(function() {
////						_this.syntaxCheck(r.startContainer.parentNode);
////					}, 1);
//					setTimeout(function() {
//						_this.fixElemStructure(_this.currElem(), _this.lastPos);
//					}, 1);
////					if (r.startContainer != r.endContainer && 
////							r.endOffset < r.endContainer.textContent.length) setTimeout(function() {
////						_this.syntaxCheck(r.endContainer.parentNode);
////					}, 1);
//					// if we delete everything re-initialize the editor
//					setTimeout(function() {
//						if ((_this.root.innerText || _this.root.textContent).trim() === '') {
//							_this.root.innerHTML = "";
//							var el = El('<div><span>&zwnj;</span></div>')
//							_this.root.add(el);
//							_this.setFocus(el.firstChild, 1);
//						}					
//					}, 1);
//				}
//				if (c === 9 || (c === 13 && _this.isFireFox)) {
//					e.preventDefault();
//					_this.handleKeyPress(c, true);
//				}
//			});
//			this.root.on('paste', function(e) {
//				return;
//				e.preventDefault();
//				e.stopPropagation();
//				var sel = window.getSelection();
//				var r = sel.getRangeAt(0);
//				var focusNode = (r.startOffset === 0) ? (r.startContainer.nodeType === 3 ? r.startContainer.parentNode.previousSibling : r.previousSibling) :
//													(r.startContainer.parentNode);  
//				var deletedStr = _this.deleteSelectedRange(r);
//				console.log(deletedStr, _this.currElem());
//				var str = e.clipboardData.getData('text/plain');
//				_this.setFocus(r.startContainer, r.startOffset);
//				for (var i = 0; i < str.length; i++) {
//					_this.handleKeyPress(str.charCodeAt(i), true);
//				}
//				for (var i = 0; i < deletedStr.length; i++) {
//					_this.handleKeyPress(deletedStr.charCodeAt(i), true);
//				}
//				_this.syntaxCheck(_this.currElem());
//			});
//			this.root.on('keypress', function(e) {
//				_this.handleKeyPress(e.which);
//			});
//			
////			setInterval(function() {
////				_this.syntaxCheck(_this.currElem());
////			}, 1000)
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
//				// if they are not on the same line then merge lines
//				if (r.startContainer.parentNode.parentNode != r.endContainer.parentNode.parentNode) {
//					var endLine = r.endContainer.parentNode.parentNode;
//					var el = r.endContainer.parentNode.nextSibling, startEl = r.startContainer.parentNode;
//					while (el) {
//						var next = el.nextSibling;
//						el.remove();
//						startEl.addAfter(el);
//						startEl = el;
//						el = next;
//					}
//					endLine.remove();
//				} else {
//					r.endContainer.parentNode.remove();
//				}
//			}
//			return str;
//		},
//		fixElemStructure: function(el, pos) {
//			var t = el.attr('t');
//			if (pos === 1) {
//				var prev = el.previousSibling;
//				if (prev && isMergable(prev.attr('t'), t)) {
//					el.innerHTML = prev.innerHTML + el.innerHTML;
//					var l = prev.innerHTML.length;
//					prev.remove();
//					this.setFocus(el, l);
//				}
//			} else if (pos === el.innerHTML.length + 1) {
//				var next = el.nextSibling;
//				if (next && isMergable(t, next.attr('t'))) {
//					el.innerHTML = el.innerHTML + next.innerHTML;
//					next.remove();
//					this.setFocus(el, pos);
//				}
//			}
//			el.attr(t, undefined);
//			this.calcType(el);
//		},
//		// t: tab, s: space, p: punctuation, n: number, w: word, cl: line comment, cm: multiline comment, ecm: end multiline comment
//		// q1: qoute', q2: qoute"
//		calcType: function(el) {
//			if (el.innerHTML[0] === '\u200C') {
//				//removing zero-lenght space
//				el.innerHTML = el.innerHTML.substring(1);
//			}
//			var s = elem.innerHTML, c = s.charCodeAt(0), ch = s.charAt(0); type;
//			if (c === 9) {
//				type = 't';
//			} else if (c === 32) {
//				type = 's';
//			} else if (this.isPunc(c)) {
//				var begin = s.substring(0, 2)
//				if (c === 34) t = 'q2';
//				else if (c === 39) {
//					t = 'q1';
//					var i = -1;
//					joinNextElems(el, 'q1');
//				} else if (begin === '/*') {
//					t = 'cm';
//				}
//				else if (begin === '//') t = 'cl';
//				else if (begin === '*/') t = 'ecm';
//				else t = 'p';
//			} else if (c >= 48) {
//				if (s.trim() !== '' && !isNaN(s)) {
//					t = 'n'
//				} else {
//					t = 'w';
//				}
//			}
//			elem.attr('t', t);
//			var clazz = this.reservedWords[s];
//			if (clazz) elem.attr('class', clazz);
//		},
//		joinNextElems: function(el, t, len, multiLine) {
//			var next = el.nextSibling;
//			while (next && next.attr('t') !== t) {
//				el.innerHTML += next.innerHTML;
//				var tmp = next.nextSibling;
//				next.remove();
//				next = tmp;
//				if (multiLine) {
//					while (!next) {
//						if (el.parentNode.nextSibling) {
//							el.innerHTML += '\n';
//							el.addAfter(el.parentNode.nextSibling.childNodes);
//							el.parentNode.nextSibling.remove();
//							next = el.nextSiblilng;
//						} else {
//							break;
//						}
//					}
//				}
//			}
//			if (next) {
//				el.innerHTML += next.innerHTML.substring(0, len);
//				if (next.innerHTML.length > len + 1) {
//					next.innerHTML = next.innerHTML.substring(len + 1);
//					next.attr('t', undefined);
//					calcTyep(next);
//				} else {
//					next.remove();
//				}
//			}
//		},
//		isPunc: function(c) {
//			return (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 94) || (c >= 123 && c <= 126);
//		},
//		isMergable: function(t1, t2) {
//			return t1 === t2 || t1 === 'q' || t1 === 'c' || 
//				((t1 === 'w' || t1 === 'n') && (t2 === 'w' || t2 === 'n')); 
//		},
//		handleKeyPress: function(ch, typeIn, el) {
//			var el = el || this.currElem();
//			var type = null;
//			var currType = el.attr('t');
//			if (ch === '\t') {	
//				type = 't';
//				typeIn = true;
//			} else if (ch === ' ') {
//				if (currType !== 's') type = 's'
//			} else if ((ch === '\n' || ch === '\r') && typeIn) {
//				type = 'r';
//				typeIn = false;
//			} else if (ch === '"') {
//				type = 'q2';
//			} else if (ch === '\'') {
//				type = 'q1';
//			} else if (ch === '/') {
//				if (currType === 'p' && this.currPos === 2 && el.charAt(0) === '/') { 
//					el.attr('t', 'c');
//					this.joinNextElems(el, 'c', 2);
//				} else { 
//					if (currType !== 'p') type = 'p';
//				}
//			} else if (ch === '*' && this.currPos === 2 && el.innerHTML.charAt(0) === '/') {
//				type = 'cm';
//				joinNextElems(el, 'cm', 2, true);
//			} else if ((ch >= '!' && ch <= '/') || (c >= 58 && c <= 64) || (c >= 91 && c <= 94) || (c >= 123 && c <= 126)) {
//				if (currType !== 'p') type = 'p';
//			} else if (c >= 48) {
//				if (currType !== 'w') type = 'w';
//			}
//			var newEl;
//			if (type) {
//				if (this.lastPos != el.innerHTML.length) {
//					var breakEl = El('span').html(el.innerHTML.substring(this.lastPos));
//					el.innerHTML = el.innerHTML.substring(0, this.lastPos);
//					el.addAfter(breakEl);
//					this.syntaxCheck(breakEl);
//				}
//				if (type == 'r') {
//					newEl = El('span').html('&zwnj;');
//					el.parentNode.addAfter(El('div').add(newEl));
//					var tailEl = el.nextSibling;
//					while (tailEl != null) {
//						var next = tailEl.nextSibling;
//						newEl.addAfter(tailEl);
//						tailEl = next;
//					}
//				} else {
//					newEl = El('span').html('&zwnj;').attr('class', classs);
//					el.addAfter(newEl);
//				}
//				if (el.innerHTML[0] === '\u200C') {
//					//removing zero-lenght space
//					el.innerHTML = el.innerHTML.substring(1);
//				} else if (el.childNodes.length === 1 && el.firstChild.tagName === 'BR') {
//					//removing browser's created <br/> when enter is pressed
//					el.innerHTML = '';
//				}
//				this.syntaxCheck(el);
//				this.setFocus(newEl.firsChild || newEl, 1);
//				if (typeIn) {
//					el = newEl || el;
////					el.innerHTML = el.innerHTML +  String.fromCharCode(c);
//					 var txt = el.firstChild.textContent;
//					el.firstChild.textContent += txt.substring(0, this.lastPos) + String.fromCharCode(c) + txt.substring(this.lastPos);
//					this.setFocus(el, this.lastPos + 1);
//				}
//			}
//		},
//		lastFocus: null,
//		lastPos: 0,
//		syntaxCheck: function(elem) {
//			if (elem.innerHTML[0] === '\u200C') {
//				//removing zero-lenght space
//				elem.innerHTML = elem.innerHTML.substring(1);
//			}
//			var s = (elem.firstChild && (elem.firstChild.textContent || elem.firstChild.innerHTML)) || elem.innerHTML;
//			if (s.trim() !== '' && !isNaN(s)) {
//				elem.attr('class', 'n');
//			}
//			var clazz = this.reservedWords[s];
//			if (clazz) elem.attr('class', clazz);
//		},
//		reservedWords: {'for': 'rw'},
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
