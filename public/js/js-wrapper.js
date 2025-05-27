/**
 * JavaScript Wrapper - The wrappers of browser JavaScript objects
 * Copyright (C) 2005-2007 Alexandr Nosov, http://www.alex.4n.com.ua/
 *
 * Licensed under the terms of the GNU Lesser General Public License:
 * 	http://www.opensource.org/licenses/lgpl-license.php
 *
 * This version includes three basic wrappers:
 * 	winWrapper - wrapper of window;
 *	elmWrapper - wrapper of html-element;
 *	evtWrapper - wrapper of event-object;
 * For further information visit:
 * 	http://www.alex.4n.com.ua/js-wrapper/
 *
 * Do not remove this comment if you want to use script!
 * Не удаляйте данный комментарий, если вы хотите использовать скрипт!
 *
 * @author: Alexandr Nosov (alex@4n.com.ua)
 * @version:  02.01.26 Beta
 * @modified: 2007-01-17 21:00:00
 */

// ===== Additional functions and classes ===== \\

// --- Implements add property to any object --- \\
function implement(destObj, srcObj, needCheck)
{
	if (destObj && srcObj) {
		if (srcObj.constructor == Array) {
			for (var i=0; i<srcObj.length; i++) {
				implement(destObj, srcObj[i], needCheck);
			}
		} else {
			for (var p in srcObj) {
				if (!needCheck || !destObj[p]) destObj[p] = srcObj[p];
			}
		}
		return destObj;
	}
	return null;
};

// --- Check type of browser --- \\
var browserVer = (function(w)
{
	var d, o, m;
	d = w.document;
	o = {};

	o.aN = w.navigator.appName;
	o.aV = w.navigator.appVersion;
	o.uA = w.navigator.userAgent;

	o.isDOM = d.getElementById ? true : false;
	o.isOpera = o.isOpera5 = w.opera && o.isDOM ? true : false;
	o.isOpera6 = o.isOpera && w.print ? true : false;
	o.isOpera7 = o.isOpera && d.readyState ? true : false;
	o.isOpera8 = /\WOpera\s+[^67]/.test(o.uA);

	o.isMSIE = o.isIE = d.all && d.all.item && !o.isOpera ? true : false;
	o.isStrict = d.compatMode == 'CSS1Compat';

	o.isSafari = /\WSafari\W/.test(o.uA);

	o.isNN = o.isNC = o.aN=="Netscape";
	o.isMozilla = o.isNN6 = o.isNN && o.isDOM;

	o.identifyBrowser = o.isDOM || o.isNC || o.isMSIE || o.isOpera;

	m = (o.isMSIE ? /MSIE\s*([\d\.]*)/i : /([\d\.]*)$/i).exec(o.uA);
	o.ver = m ? m[1] : null;
	return o;
})(window);
var browserVersion = browserVer;

// --- Basic Broadcaster for different object --- \\
var basicBroadcaster = function()
{
	this._listeners = {};
};
basicBroadcaster.prototype = {
	broadcastMessage : function()
	{
		var eType, mName, arg, i;
		eType = arguments[0];
		arg = [];
		for (i = 1; i<arguments.length; ++i) {
			arg[i-1] = arguments[i];
		}
		if (this._listeners[eType]) for (mName in this._listeners[eType]) {
			this._doMethod(this._listeners[eType][mName], mName, arg);
		}
		this._doMethod(this._getListeners(), eType, arg);
	},
	addListener : function(obj, eType, mName)
	{
		this.removeListener(obj, eType, mName);
		var param = {};
		this._getListeners(eType, mName).push([obj, param]);
		return param;
	},
	removeListener : function(obj, eType, mName)
	{
		var list, ql, i, p;
		list = this._getListeners(eType, mName);
		for (i = list.length - 1; i >= 0; i--) {
			if (list[i][0] == obj || obj == null) {
				list.splice(i, 1);
				break;
			}
		}
		ql = 0;
		for (p in this._listeners[eType]) {
		    ql += this._listeners[eType][p].length;
		}
		return ql;
	},
	_getListeners : function(eType, mName)
	{
		if (!eType) eType = "all";
		if (!mName || eType == "all") mName = eType;
		if (!this._listeners[eType]) this._listeners[eType] = {};
		if (!this._listeners[eType][mName]) this._listeners[eType][mName] = [];
		return this._listeners[eType][mName];
	},
	_doMethod : function(list, mName, arg)
	{
		if (list) {
			var list_, l, emsg, i;
			l = arg.length;
			list_ = [];
			for (i = 0; i<list.length; i++) {
			    if (list[i] && (typeof(list[i][0][mName]) == "function")) list_[list_.length] = list[i];
			}
			for (i = 0; i<list_.length; i++) {
				arg[l] = list_[i][1];
				try {
				    list_[i][0][mName].apply(list_[i][0], arg);
				} catch(e) {
				    emsg = (e.fileName ? "Error in " + e.fileName : "") + (e.lineNumber ? " line " + e.lineNumber : "");
				    emsg += (emsg ? "\n" : "") + (e.name ? e.name + ": " : "") + e.message;
				    alert("Can't run method \"" + mName + "\"!\n\n" + emsg);
				}
			}
			arg.pop();
		}
	}
};


// ------- Broadcaster for HTML object ------- \\
var htmlBroadcaster = {
	iniBroadcaster : function()
	{
		this._listenersFunc = {};
		this._BBC = new basicBroadcaster();
	},
	broadcastMessage : function(evt)
	{
		var evtWr;
		if (evt._wrapper) {
			evtWr = evt._wrapper;
			evtWr.setElement.call(evtWr, this);
		} else {
		    try {
		        evtWr = new evtWrapper(evt, this);
		    } catch(e) {
		        evtWr = {};
		        evtWr.evt = evt;
		    }
		}
		this._BBC.broadcastMessage("on" + evtWr.evt.type, evtWr);
	},
	addListener : function(obj, EventType, mName, useCapture)
	{
	    var eType = this._getType(obj, EventType, "addListener");
	    if(eType == null) return null;
		if (typeof(mName) == "undefined") mName = EventType;
		var elm = this.bcElement(eType);
		if (!elm) return null;
		if (!this._listenersFunc[eType]) {
			this._listenersFunc[eType] = (function(BCobj){return function(e){return BCobj.broadcastMessage.call(BCobj, e);};})(this);
			if (this.bv.isMSIE) elm.attachEvent(eType, this._listenersFunc[eType]);
			else if (this.addEventListener) elm.addEventListener(eType.substr(2), this._listenersFunc[eType], useCapture ? true : false);
			else elm[eType] = this._listenersFunc[eType];
		}
		return this._BBC.addListener(obj, eType, mName);
	},
	removeListener : function(obj, EventType, mName, useCapture)
	{
	    var eType = this._getType(obj, EventType, "removeListener");
	    if(eType == null) return;
		if (typeof(mName) == "undefined") mName = EventType;
		var elm = this.bcElement(eType);
        if (!elm) return;
		if (!this._BBC.removeListener(obj, eType, mName) && this._listenersFunc[eType]) {
			if (this.bv.isMSIE) elm.detachEvent(eType, this._listenersFunc[eType]);
			else if (this.removeEventListener) elm.removeEventListener(eType.substr(2), this._listenersFunc[eType], useCapture ? true : false);
			else elm[eType] = undefined;
			this._listenersFunc[eType] = null;
		}
	},
	_getType : function(obj, EventType, proc)
	{
	    if(typeof(obj) != "object") {
	        alert("Incorrect object type in "+proc+"!");
	        return null;
	    }
	    if(typeof(EventType) != "string") {
	        alert("Incorrect event type!");
	        return null;
	    }
	    return (this.config.SubscriberUse_on ? "" : "on") + EventType.toLowerCase();
	}
};


// --- Event Wrapper --- \\
var evtWrapper = function (e, elmWr)
{
	this.evt = e ? e: window.event;
	this.evt._wrapper = this;
	this.setElement(elmWr);
};
evtWrapper.prototype = {
	eventStatus : true,
	bubbleStatus : true,
	eventDrop : function (doNot)
	{
		if (!doNot) {
			if (this.bv.isMSIE) this.evt.returnValue = false;
			else if (this.evt.preventDefault) this.evt.preventDefault();
			this.eventStatus = false;
		}
	},
	stopBubbling : function (doNot)
	{
		if (!doNot) {
			if (this.bv.isMSIE) this.evt.cancelBubble = true;
			else if (this.evt.stopPropagation) this.evt.stopPropagation();
			this.bubbleStatus = false;
		}
	},
	setElement : function (elmWr)
	{
		if (elmWr) this.elmWr = elmWr;
		else {
			var elm = this.bv.isMSIE ? this.evt.srcElement : this.evt.target;
			if (!elm) return;
			this.elmWr = new elmWrapper(elm);
		}
		var winWr = elmWr.win && elmWr.doc ? elmWr : elmWr.winWr;
		if (winWr) {
			if (this.bv.isMSIE || this.bv.isOpera7){
				this.absX=this.evt.clientX+winWr.getScrollX();
				this.absY=this.evt.clientY+winWr.getScrollY();
			}else if (this.bv.isOpera){
				this.absX=this.evt.clientX;
				this.absY=this.evt.clientY;
			}else if (this.bv.isNC){
				this.absX=this.evt.pageX;
				this.absY=this.evt.pageY;
			}
			this.relX = elmWr.elm ? this.absX - elmWr.getAbsLeft() : this.absX;
			this.relY = elmWr.elm ? this.absY - elmWr.getAbsTop() : this.absY;
		} else this.absX=this.absY=this.relX=this.relY=0;
	},
	bv : browserVer
};

// --- Event processor allows to call from HTML --- \\
function eventProcessor(elm, evt, obj, method, param)
{
	var evtWr;
	var elmWr = getElmWrapper(elm);
	if (evt._wrapper) {
		evtWr = evt._wrapper;
		evtWr.setElement.call(evtWr, elmWr);
	} else {
	    evtWr = new evtWrapper(evt, elmWr);
	}
	if (!obj) obj = window;
	return obj[method].call(obj, evtWr, param);
};


// ------- HTML-elements wrapper ------- \\
var elmWrapper = function(elm, winWr)
{
	this.elm = elm;
	this.winWr = winWr ? winWr : window._wrapper; // ToDo: Search windowWrapper relatively element - if it is not set as parameter
	if (this.elm) {
		elm._wrapper = this;
		if (typeof(elm.style) != "undefined") {
			var doc = this.winWr.doc;
		    this.style = elm.style;
			if (this.bv.isMSIE) this.css = elm.currentStyle;
			else if (this.bv.isDOM && doc.defaultView && doc.defaultView.getComputedStyle) this.css = doc.defaultView.getComputedStyle(elm, null);
			else if (this.bv.isSafari) this.css = elm.style;
			else this.css = elm.style;
		} else this.style = this.css = {};
		this.iniBroadcaster();
		this.userData = {};
	}
};
elmWrapper.prototype = {

    // .... Get parameters .... \\
	bcElement : function(eType)
	{
		if (!this.elm && this.config.DebugMode) {
		    alert('Element for event "' + eType + "' is not set!");
		    return null;
		}
	    return this.elm;
	},
	getAbsOffset : function()
	{
		var bv = this.bv;
		var left = 0;
		var top  = 0;
		var elm = this.elm;
		if (bv.isMSIE || bv.isOpera || bv.isMozilla) {
			do {
				left += elm.offsetLeft;
				top += elm.offsetTop;
				elm = elm.offsetParent;
			} while (elm);
		} else if (bv.isMozilla) {
			left += elm.offsetLeft;
			top += elm.offsetTop;
		}
		return [left, top];
	},
	getAbsLeft : function()
	{
		return this.getAbsOffset()[0] - this.winWr.shiftLeft;
	},

	getAbsTop : function()
	{
		return this.getAbsOffset()[1] - this.winWr.shiftTop;
	},

	getRelOffset : function()
	{
		var bv = this.bv;
		var left = 0;
		var top  = 0;
		var elm = this.elm;
		if (bv.isMSIE || (bv.isOpera && !bv.isOpera8)) {
			left = elm.offsetLeft;
			top  = elm.offsetTop;
		} else if (bv.isMozilla || bv.isOpera) {
			left = elm.offsetLeft - elm.parentNode.offsetLeft;
			top  = elm.offsetTop - elm.parentNode.offsetTop;
		}
		return [left, top];
	},
	getRelLeft : function()
	{
		return this.getRelOffset()[0];
	},

	getRelTop : function()
	{
		return this.getRelOffset()[1];
	},

	getWidth : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isMozilla || bv.isOpera7) return this.elm.offsetWidth;
		if (bv.isOpera) return this.css.pixelWidth;
		return null;
	},

	getHeight : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isMozilla || bv.isOpera7) return this.elm.offsetHeight;
		if (bv.isOpera) return this.css.pixelHeight;
		return null;
	},

	getZIndex : function() //deprecated
	{
		return this.css.zIndex;
	},

	// type: color (default), backgroundColor, borderLeftColor, borderRightColor, borderTopColor, borderBottomColor
	getColor : function(type)
	{
		if (!type) type = "color";
		var clr = this.css[type];
		var toHex = function(s){
			var n = parseInt(s);
			return (n<16? "0" : "") + n.toString(16);
		};
		if ((rArr = /^rgb\((\d+)\,\s*(\d+)\,\s*(\d+)\)$/i.exec(clr))) clr = "#" + toHex(rArr[1]) + toHex(rArr[2]) + toHex(rArr[3]);
		return clr;
	},

	isVisible : function()
	{
		return this.css.visibility.toLowerCase().charAt(0)!='h';
	},

	isDisplay : function()
	{
		return this.css.display!='none';
	},

	isShow : function()
	{
		return this.isDisplay() && this.isVisible();
	},

	// -- Set parameters --
	setAbsLeft : function(x)
	{
		var bv = this.bv;
		x+=this.winWr.shiftLeft;
		if (bv.isOpera) this.style.pixelLeft=x;
		else this.style.left=x + "px";
	},

	setAbsTop : function(y)
	{
		var bv = this.bv;
		y+=this.winWr.shiftTop;
		if (bv.isOpera) this.style.pixelTop=y;
		else this.style.top = y + "px";
	},

	moveAbs : function(x,y)
	{
		this.setAbsLeft(x);
		this.setAbsTop(y);
	},

	moveRel : function(x,y)
	{
		this.moveAbs(this.getRelLeft()+x, this.getRelTop()+y);
	},

	setZIndex : function(z) //deprecated
	{
		this.style.zIndex=z;
	},


	setVisibility : function(v)
	{
		this.style.visibility = v ? "visible" : "hidden";
	},

	setDisplay : function(v)
	{
		if (!v) v = "none";
		else if (v.toString() == "true") v="block";
		else if (this.bv.isIE && this.config.ReplaceDisplay4IE && v!="none") v="block";
		this.style.display = v;
	},

	invVisibility : function()
	{
		this.setVisibility(this.isVisible());
	},

	invDisplay : function(v)
	{
		this.setDisplay(this.isDisplay() ? "none" : (v ? v : "block"));
	},

	show : function(display)
	{
		if (display || typeof(display) == "undefined") this.setDisplay(typeof(display) == "undefined" || display == "none"? true : display);
		else this.setVisibility(true);
	},

	hide : function(display)
	{
		if (display || typeof(display) == "undefined") this.setDisplay(false);
		else this.setVisibility(false);
	},

	write : function(text, pos, noDOM)
	{
		var bv = this.bv;
		if (bv.isDOM && !noDOM) {
			if (!pos){while (this.elm.hasChildNodes()) this.elm.removeChild(this.elm.firstChild);}
			var tNode = this.winWr.doc.createTextNode(text);
			if (pos<0) this.elm.insertBefore(tNode, this.elm.firstChild);
			else this.elm.appendChild(tNode);
		} else {
			this.elm.innerHTML = pos ? (pos>0 ? this.elm.innerHTML + text : text + this.elm.innerHTML) : text;
		}
	},

	setBgColor : function(c)
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isMozilla || bv.isOpera7) this.style.backgroundColor=c;
		else if (bv.isOpera) this.style.background=c;
	},

	setBgImage : function(url)
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isMozilla || bv.isOpera6) this.style.backgroundImage="url("+url+")";
	},

	setClip : function(top,right,bottom,left)
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isMozilla || bv.isOpera7) this.style.clip="rect("+top+"px "+right+"px "+bottom+"px "+left+"px)";
	},

	setClass : function(className)
	{
		this.elm.className = className;
	},
	addClass : function(className)
	{
		this.removeClass(className);
		this.setClass((this.elm.className ? this.elm.className + " " : "") + className);
	},
	removeClass : function(className)
	{
		var curClass = this.elm.className;
		if (!curClass || curClass == className) curClass = "";
		else {
			curClass = curClass.replace(new RegExp("^" + className + "\\s+", "i"), "");
			curClass = curClass.replace(new RegExp("\\s+" + className + "(?!\\S)", "i"), "");
		}
		this.elm.className = curClass;
	},
	bv : browserVer
};
with (elmWrapper.prototype) {
    implement(elmWrapper.prototype, {
        getX  : getAbsLeft,
        getY  : getAbsTop,
        moveX : setAbsLeft,
        moveY : setAbsTop,
        move  : moveAbs,
        moveZ : setZIndex,
        clip  : setClip
    });
}
implement(elmWrapper.prototype, htmlBroadcaster);

// --- get wrapper of HTML-element --- \\
function getElmWrapper(elm, winWr)
{
	return !elm ? {} : (elm._wrapper && elm._wrapper.elm == elm ? elm._wrapper : new elmWrapper(elm, winWr));
}


// --- Window wrapper --- \\
var winWrapper = function(win)
{
	if(typeof(win._wrapper) != "undefined") {
	    throw "You can't create many Wrappers for one window!";
	}
    this.win = win;
	this.doc = this.win.document;
	this.win._wrapper = this;
	this.doc._wrapper = this;
	this.iniBroadcaster();
};
winWrapper.prototype = {
	shiftLeft   : 0,
	shiftTop    : 0,
	cookieVal   : null,
	cookieExtra : null,
	sidVal      : null,

	bcElement : function(eType)
	{
		if (eType == "onload" || eType == "onunload") {
			return this.bv.isOpera ? this.doc : this.win;
		} else {
			var winEvt = ["onresize", "onscroll", "onfocus", "onactivate", "onblur", "onerror", "onafterprint", "onbeforedeactivate", "onbeforeprint", "onbeforeunload", "oncontrolselect", "ondeactivate", "onhelp", "onresizeend", "onresizestart"];
			for (var i=0; i<winEvt.length; i++) if (eType == winEvt[i]) return this.win;
			return this.doc;
		}
	},
// .... Event subscribing .... \\
	setOnloadListener : function(obj, mName)
	{
		return this.addListener(obj, this.config.SubscriberUse_on ? "onload" : "load", mName);
	},
	removeOnloadListener : function(obj, mName)
	{
		this.removeListener(obj, this.config.SubscriberUse_on ? "onload" : "load", mName);
	},
	setOnUnloadListener : function(obj, mName)
	{
		return this.addListener(obj, this.config.SubscriberUse_on ? "onunload" : "unload", mName);
	},
// .... Get elements .... \\
	checkElement : function(idElm)
	{
		return this._getElmWrapper(idElm).elm ? true : false;
	},
	getElement : function(idElm, noErr)
	{
		var elmWr = this._getElmWrapper(idElm);
		if (!elmWr.elm && !noErr && this.config.DebugMode) alert('Element with ID "'+idElm+'" is not found!');
	    return elmWr;
	},
	getForm : function(nameFrm, noErr)
	{
		if (!nameFrm) nameFrm = 0;
		return this._checkError(this.doc.forms[nameFrm] ? this.doc.forms[nameFrm] : null, noErr, 'Form ['+nameFrm+'] is not found!');
	},
	getFormElement : function(nameFrm, nameElm, noErr)
	{
		var frm = this.getForm(nameFrm).elm;
		if (!frm) return null;
		if (!nameElm) nameElm = 0;
		return this._checkError(frm.elements[nameElm], noErr, 'Form element ['+nameElm+'] is not found!');
	},
	getImage : function(idImg, noErr)
	{
		if (!idImg) idImg = 0;
		return this._checkError(this.doc.images[idImg], noErr, 'Image ['+idImg+'] is not found!');
	},
	getElmWrapper : function(elm)
	{
		return getElmWrapper(elm, this);
	},
	getCloneElement : function(idElm, noErr)
	{
		var elm = this.getElement(idElm, noErr).elm.cloneNode(true);
		elm.removeAttribute("id");
	    return this.getElmWrapper(elm);
	},

// .... Global window/document methods .... \\
	getDocFrame : function()
	{
		return this.bv.isStrict ? this.doc.documentElement : this.doc.body;
	},
	getWindowLeft : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isOpera7) return this.win.screenLeft;
		if (bv.isNN || bv.isOpera) return this.win.screenX;
		return null;
	},
	getWindowTop : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isOpera7) return this.win.screenTop;
		if (bv.isNN || bv.isOpera) return this.win.screenY;
		return null;
	},
	getWindowWidth : function()
	{
		var bv = this.bv;
		if (bv.isMSIE) return this.getDocFrame().clientWidth;
		if (bv.isNN || bv.isOpera) return this.win.innerWidth;
		return null;
	},
	getWindowHeight : function()
	{
		var bv = this.bv;
		if (bv.isMSIE) return this.getDocFrame().clientHeight;
		if (bv.isNN || bv.isOpera) return this.win.innerHeight;
		return null;
	},
	getDocumentWidth : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isOpera7) return this.getDocFrame().scrollWidth;
		if (bv.isNN) return this.doc.width;
		if (bv.isOpera) return this.doc.body.style.pixelWidth;
		return null;
	},
	getDocumentHeight : function()
	{
		var bv = this.bv;
		if (bv.isMSIE || bv.isOpera7) return this.getDocFrame().scrollHeight;
		if (bv.isNN) return this.doc.height;
		if (bv.isOpera) return this.doc.body.style.pixelHeight;
		return null;
	},
	getScrollX : function()
	{
		var bv = this.bv;
		try {
			if (bv.isMSIE || bv.isOpera7) return this.getDocFrame().scrollLeft;
			if (bv.isNN || bv.isOpera) return this.win.pageXOffset;
		} catch(e) {}
		return null;
	},
	getScrollY : function()
	{
		var bv = this.bv;
		try {
			if (bv.isMSIE || bv.isOpera7) return this.getDocFrame().scrollTop;
			if (bv.isNN || bv.isOpera) return this.win.pageYOffset;
		} catch(e) {}
		return null;
	},
	createStyle : function(selector, style, indx)
	{
		var ss = this.doc.styleSheets;
		if (typeof(indx) == "undefined") indx = ss.length - 1;
		else if (indx < 0) {
		    this.doc.getElementsByTagName('head')[0].appendChild(this.doc.createElement('style'));
		    indx = ss.length - 1;
		} else indx = Number(indx);
		if (this.bv.isIE) ss[indx].addRule(selector, style, ss[indx].rules.length);
		else ss[indx].insertRule(selector+"{"+style+"}", ss[indx].cssRules.length);
	},
	loadStyle : function(url)
	{
		var style = this.doc.createElement('link');
	    style.rel = 'stylesheet';
	    style.type = 'text/css';
	    style.href = url;
		this.doc.getElementsByTagName('head')[0].appendChild(style);
	},
	getSelection : function()
	{
	    if (this.doc.getSelection) return this.doc.getSelection();
	    if (this.doc.selection && this.doc.selection.createRange) return this.doc.selection.createRange().text;
	    return "";
	},
// .... Additional methods .... \\
	getCookie : function(name)
	{
		if (!this.cookieVal) {
			var rArr;
			this.cookieVal = {};
			var re = /\s*(\w*)\=([^;]*)\;?/g;
			while ((rArr = re.exec(this.doc.cookie))) this.cookieVal[rArr[1]] = unescape(rArr[2]);
		}
		return (name && this.cookieVal[name]) ? this.cookieVal[name] : null;
	},
	setCookie : function(name, val, expires, path, secure)
	{
		var old = this.getCookie(name);
		if (name && old != val) {
			var curCookie = name + "=" + escape(val);
			if (curCookie.length > 4000 && this.config.DebugMode) alert("Cookie length exceed 4KB and will be cut!");
			if (!expires && !path && !secure && this.cookieExtra) curCookie += "; " + this.cookieExtra;
			else {
				if (expires) curCookie += "; expires=" + expires.toGMTString();
				if (path || this.config.DefaultCookiePath) curCookie += "; path=" + (path ? path : this.config.DefaultCookiePath);
				if (this.config.SubdomainCookie) {
					var rArr = /^(?:www[^.]*\.)?(.*)$/i.exec(this.doc.domain);
					curCookie += "; domain=." + rArr[1];
				}
				if (secure) curCookie += "; secure";
			}
			this.doc.cookie = curCookie;
			this.cookieVal[name] = val;
		}
	},
	deleteCookie : function(name, path)
	{
		if (this.getCookie(name)) {
			this.setCookie(name, '', new Date(1970,1,1,0,0,1), path);
			delete this.cookieVal[name];
		}
	},
	getSid : function()
	{
		if (!this.sidVal) {
			var sk = this.config.SessionIdKey;
			if (this.getCookie(sk)) this.sidVal = this.getCookie(sk);
			else {
				var re = new RegExp("\\?.*?" + sk + "\\=([a-zA-Z0-9]+)");
				var rArr = re.exec(this.doc.location);
				if (rArr) this.sidVal = rArr[1];
			}
		}
		return this.sidVal;
	},
	setSid : function(val)
	{
		this.sidVal = val;
	},

// .... Special methods .... \\
    getClosedFunction : function(obj,met,arg)
	{
        if(!arg) arg=[];
	    return function(){obj[met].apply(obj,arg);};
	},
    setTimeout : function(time,obj,met,arg)
	{
	    return setTimeout(this.getClosedFunction(obj,met,arg), time);
	},
    setInterval : function(time,obj,met,arg)
	{
	    return setInterval(this.getClosedFunction(obj,met,arg), time);
	},
    openPopUp : function(obj,met,uri,name,prop)
	{
        this.setTimeout(0,obj,met,[open(uri, name, prop)]);
	},
// .... Private methods .... \\
	_getElmWrapper : function(idElm)
	{
		var elm;
		if (this.bv.isDOM) elm = this.doc.getElementById(idElm);
		else if (this.bv.isMSIE) elm = this.doc.all[idElm];
		else elm = null;
		return this.getElmWrapper(elm);
	},
	_checkError : function(elm, noErr, errMsg)
	{
	    var elmWr = this.getElmWrapper(elm);
		if (!elmWr.elm && !noErr && this.config.DebugMode) alert(errMsg);
		return elmWr;
	},
	bv : browserVer
};
winWrapper.prototype.getElementWrapper = winWrapper.prototype.getElmWrapper;
implement(winWrapper.prototype, htmlBroadcaster);


elmWrapper.prototype.config = winWrapper.prototype.config = {
	useDataLoader      : true,  // Add winWrapperDataLoader object to winWrapper.prototype
	SubscriberUse_on   : true,  // Use or not prefix "on" at the event name
	ReplaceDisplay4IE  : true,  // Replace "table", "table-row", etc. on "block" on Display for IE
	DefaultEventReturn : true,  // Return this value after event
	DefaultCookiePath  : "/",   // Default Cookie Path
	SubdomainCookie    : true,  // Enable read set cookie in subdomain too
	SessionIdKey       : "SID", // Session ID key
	DebugMode          : true   // Show or not incorrect calls
};

if (!window._wrapper) new winWrapper(window);

var mainBroadcaster = {

	allParams : [],

	set_message : function(name, params) {
		this.allParams[name] = params;
		this.broadcastMessage(name);
	},
	get_params : function(name) {
		return this.allParams[name];
	}

}

implement(mainBroadcaster,[new basicBroadcaster()]);