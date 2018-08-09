define(["@jupyter-widgets/base","@jupyter-widgets/jupyterlab-manager/lib/output","@phosphor/coreutils","d3"], function(__WEBPACK_EXTERNAL_MODULE__jupyter_widgets_base__, __WEBPACK_EXTERNAL_MODULE__jupyter_widgets_jupyterlab_manager_lib_output__, __WEBPACK_EXTERNAL_MODULE__phosphor_coreutils__, __WEBPACK_EXTERNAL_MODULE_d3__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/plugin.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/css-loader/index.js!./src/tree/panel.css":
/*!******************************************************!*\
  !*** ./node_modules/css-loader!./src/tree/panel.css ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".rg_tree .view {\n  user-select: none;\n}\n\n.rg_tree .view .node {\n  fill: white;\n  stroke: gray;\n  stroke-width: 0.5px;\n}\n\n.rg_tree .view .axis .axis-label {\n  fill: black;\n  font-size: 10pt;\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/index.js!./src/tree/tree.css":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader!./src/tree/tree.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".rg_tree .title {\n  font-size: 12pt;\n}\n.rg_tree .controls {\n  /* background-color: blue; */\n}\n\n.rg_tree .rtree {\n  background-color: lightgray;\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),

/***/ "./src/SidePanel.ts":
/*!**************************!*\
  !*** ./src/SidePanel.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = __webpack_require__(/*! @phosphor/coreutils */ "@phosphor/coreutils");
// import {
//   Widget
// } from '@phosphor/widgets';
// TODO: import from @jupyter-widgets/jupyterlab-manager once Output is
// exported by the main module.
const output_1 = __webpack_require__(/*! @jupyter-widgets/jupyterlab-manager/lib/output */ "@jupyter-widgets/jupyterlab-manager/lib/output");
class SidePanel extends output_1.OutputView {
    constructor(options) {
        super(options);
        this.app = options.app;
    }
    render() {
        if (!this.model.rendered) {
            super.render();
            let w = this._outputView;
            w.addClass('jupyterlab-sidecar');
            w.addClass('jp-LinkedOutputView');
            w.title.label = this.model.get('title');
            w.title.closable = true;
            w.id = coreutils_1.UUID.uuid4();
            if (Object.keys(this.model.views).length > 1) {
                w.node.style.display = 'none';
                let key = Object.keys(this.model.views)[0];
                this.model.views[key].then((v) => {
                    v._outputView.activate();
                });
            }
            else {
                let { shell } = this.app;
                console.log('mode:', this.model.get('side'));
                shell.addToMainArea(w, { mode: this.model.get('side') });
                // shell.activateById(w.id);
            }
        }
    }
}
exports.SidePanel = SidePanel;


/***/ }),

/***/ "./src/SidePanelModel.ts":
/*!*******************************!*\
  !*** ./src/SidePanelModel.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const output_1 = __webpack_require__(/*! @jupyter-widgets/jupyterlab-manager/lib/output */ "@jupyter-widgets/jupyterlab-manager/lib/output");
const version_1 = __webpack_require__(/*! ./version */ "./src/version.ts");
const MODULE_NAME = '@regulus/ipyregulus';
class SidePanelModel extends output_1.OutputModel {
    defaults() {
        return Object.assign({}, super.defaults(), { _model_name: SidePanelModel.model_name, _model_module: SidePanelModel.model_module, _model_module_version: SidePanelModel.model_module_version, _view_name: SidePanelModel.view_name, _view_module: SidePanelModel.view_module, _view_module_version: SidePanelModel.view_module_version, title: 'SidePanel', side: 'split-right' });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.widget_manager.display_model(undefined, this, {});
    }
}
SidePanelModel.serializers = Object.assign({}, output_1.OutputModel.serializers);
SidePanelModel.model_name = 'SidePanelModel';
SidePanelModel.model_module = MODULE_NAME;
SidePanelModel.model_module_version = version_1.EXTENSION_SPEC_VERSION;
SidePanelModel.view_name = 'SidePanel'; // Set to null if no view
SidePanelModel.view_module = MODULE_NAME; // Set to null if no view
SidePanelModel.view_module_version = version_1.EXTENSION_SPEC_VERSION;
exports.SidePanelModel = SidePanelModel;


/***/ }),

/***/ "./src/plugin.ts":
/*!***********************!*\
  !*** ./src/plugin.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "@jupyter-widgets/base");
const TreeModel_1 = __webpack_require__(/*! ./tree/TreeModel */ "./src/tree/TreeModel.ts");
const tree_1 = __webpack_require__(/*! ./tree/tree */ "./src/tree/tree.ts");
const SidePanelModel_1 = __webpack_require__(/*! ./SidePanelModel */ "./src/SidePanelModel.ts");
const SidePanel_1 = __webpack_require__(/*! ./SidePanel */ "./src/SidePanel.ts");
const version_1 = __webpack_require__(/*! ./version */ "./src/version.ts");
const EXTENSION_ID = '@regulus/ipyregulus-extension';
const regulusPlugin = {
    id: EXTENSION_ID,
    requires: [base_1.IJupyterWidgetRegistry],
    activate: activateRegulusExtension,
    autoStart: true
};
exports.default = regulusPlugin;
function activateRegulusExtension(app, registry) {
    console.log('Activate RegulusExtension');
    let AppSidePanel = class extends SidePanel_1.SidePanel {
        constructor(options) {
            super(Object.assign({ app }, options));
        }
    };
    registry.registerWidget({
        name: '@regulus/ipyregulus',
        version: version_1.EXTENSION_SPEC_VERSION,
        exports: {
            TreeModel: TreeModel_1.TreeModel,
            Tree: tree_1.Tree,
            SidePanelModel: SidePanelModel_1.SidePanelModel,
            SidePanel: AppSidePanel
        }
    });
}


/***/ }),

/***/ "./src/tree/TreeModel.ts":
/*!*******************************!*\
  !*** ./src/tree/TreeModel.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "@jupyter-widgets/base");
const version_1 = __webpack_require__(/*! ../version */ "./src/version.ts");
const MODULE_NAME = '@regulus/ipyregulus';
class Node {
    constructor(parent, data) {
        this.parent = parent;
        this.children = [];
        for (let key in data) {
            this[key] = data[key];
        }
    }
}
function unpack_tree(array) {
    let i = 0;
    return unpack(null);
    function unpack(parent) {
        let node = new Node(parent, array[i]);
        while (array[++i]) {
            node.children.push(unpack(node));
        }
        return node;
    }
}
class TreeModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign({}, super.defaults(), { _model_module: TreeModel.model_module, _model_module_version: TreeModel.model_module_version, _view_name: TreeModel.view_name, _view_module: TreeModel.view_module, _view_module_version: TreeModel.view_module_version, title: "", field: null, root: new Node(null, null) });
    }
}
TreeModel.serializers = Object.assign({}, base_1.DOMWidgetModel.serializers, { root: { deserialize: unpack_tree } });
TreeModel.model_name = "TreeModel";
TreeModel.model_module = MODULE_NAME;
TreeModel.model_module_version = version_1.EXTENSION_SPEC_VERSION;
TreeModel.view_name = "Tree";
TreeModel.view_module = MODULE_NAME;
TreeModel.view_module_version = version_1.EXTENSION_SPEC_VERSION;
exports.TreeModel = TreeModel;


/***/ }),

/***/ "./src/tree/panel.css":
/*!****************************!*\
  !*** ./src/tree/panel.css ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/css-loader!./panel.css */ "./node_modules/css-loader/index.js!./src/tree/panel.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./src/tree/panel.js":
/*!***************************!*\
  !*** ./src/tree/panel.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Panel; });
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3 */ "d3");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(d3__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _panel_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./panel.css */ "./src/tree/panel.css");
/* harmony import */ var _panel_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_panel_css__WEBPACK_IMPORTED_MODULE_1__);






function Panel() {
  let margin = {top: 10, right: 30, bottom: 50, left:60},
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  let svg = null;
  let root = null;
  let nodes = [];
  let selected = null;

  let x_type = 'linear';
  let y_type = 'linear';

  let sx = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]().domain([0, 1]).range([0, width]).clamp(true);
  let sy = d3__WEBPACK_IMPORTED_MODULE_0__["scaleLinear"]().domain([Number.EPSILON, 1]).range([height, 0]).clamp(true);

  let y_axis = d3__WEBPACK_IMPORTED_MODULE_0__["axisLeft"](sy).ticks(4, '.1e');
  let x_axis = d3__WEBPACK_IMPORTED_MODULE_0__["axisBottom"](sx).ticks(8, 's');

  let dispatch = d3__WEBPACK_IMPORTED_MODULE_0__["dispatch"]('highlight', 'select', 'details');

  function flatten(node, arr){
    arr.push(node);
    for (let child of node.children) {
      flatten(child, arr)
    }
    return arr;
  }

  function preprocess() {
    selected = null
    if (!root) return;
    nodes = flatten(root, []);
    sx.domain([0, root.size]);
  }

  function layout() {
    if (!root) return;
    visit(root, [0, root.size]);

    function visit(node, range) {
      let w = range[1] - range[0];
      node.pos = {x: range[0], y: node.lvl, w: w, yp: node.parent && node.parent.lvl || 1};
      let from = range[0];
      for (let child of node.children) {
        let to = from + child.size; // w * child.size / node.size;
        visit(child, [from, to]);
        from = to;
      }
    }
  }

  function render() {
    if (!svg) return;

    svg.select('.x').call(x_axis);
    svg.select('.y').call(y_axis);

    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(nodes, d => d.id);

    d3nodes.enter()
    .append('rect')
      .attr('class', 'node')
      // .on('mouseenter', d => hover(d, true))
      // .on('mouseleave', d => hover(d, false))
      // .on('click', ensure_single(details))
      // .on('dblclick', select)
    .merge(d3nodes)
      .attr('x', d => sx(d.pos.x))
      .attr('y', d => sy(d.pos.yp))
      .attr('width', d => Math.max(1, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1))
      .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
      // .classed('highlight', d => d.highlight)
      // .classed('selected', d => d.selected)
      // .classed('details', d => d.details);
      ;

    d3nodes.exit().remove();
  }

  function panel(selection) {
    width = parseInt(selection.style('width'))-margin.left - margin.right;
    height = parseInt(selection.style('height')) - margin.top - margin.bottom;
    console.log('panel:', width, height);
    if (isNaN(width) || isNaN(height)) return;

    let g = selection.selectAll('g')
      .data([1])
      .enter()
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('class', 'nodes');

    g.append('g')
      .attr('class', 'names');

    g.append('g')
      .attr('class', 'x axis')
      .append('text')
        .attr('class', 'axis-label')
        .style('text-anchor', 'middle')
        .text('Points');

    g.append('g')
      .attr('class', 'y axis')
      .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')

        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Persistence');

    svg = selection.merge(g);

     svg.select('.x')
       .attr('transform', `translate(0,${height})`)
       .select('text')
       .attr('transform', `translate(${width/2},${margin.top + 20})`);

     svg.select('.y text')
       .attr('y', 0 - margin.left)
       .attr('x',0 - (height / 2));

     sx.range([0, width]);
     sy.range([height, 0]);

     render();

     return panel;
  }

  panel.data = function(_) {
    root = _;
    preprocess();
    layout();
    return this;
  };

  panel.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return panel;
}


/***/ }),

/***/ "./src/tree/tree.css":
/*!***************************!*\
  !*** ./src/tree/tree.css ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../node_modules/css-loader!./tree.css */ "./node_modules/css-loader/index.js!./src/tree/tree.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./src/tree/tree.html":
/*!****************************!*\
  !*** ./src/tree/tree.html ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"rg_tree\">\n  <div class='title'>No Title</div>\n  <div class=\"controls\">\n    Controls\n  </div>\n\n  <svg class=\"view\"></svg>\n</div>\n"

/***/ }),

/***/ "./src/tree/tree.ts":
/*!**************************!*\
  !*** ./src/tree/tree.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __webpack_require__(/*! @jupyter-widgets/base */ "@jupyter-widgets/base");
const d3 = __webpack_require__(/*! d3 */ "d3");
const panel_1 = __webpack_require__(/*! ./panel */ "./src/tree/panel.js");
__webpack_require__(/*! ./tree.css */ "./src/tree/tree.css");
const template = __webpack_require__(/*! ./tree.html */ "./src/tree/tree.html");
class Tree extends base_1.DOMWidgetView {
    render() {
        this.d3el = d3.select(this.el);
        this.d3el.html(template);
        this.panel = panel_1.default();
        this.model.on('change:title', this.title_updated, this);
        this.model.on('change:field', this.data_updated, this);
        this.model.on('change:root', this.data_updated, this);
        this.title_updated();
        let self = this;
        setTimeout(function () {
            console.log('delayed', self);
            d3.select(self.el).select('.view').call(self.panel);
            self.data_updated();
            self.draw();
        }, 0);
    }
    events() {
        // See http://stackoverflow.com/questions/22077023/why-cant-i-indirectly-return-an-object-literal-to-satisfy-an-index-signature-re and https://github.com/Microsoft/TypeScript/pull/7029
        return { 'click': '_handle_click' };
    }
    _handle_click(event) {
        event.preventDefault();
        this.model.set('field', this.model.get('field') + '.1');
        this.touch();
    }
    title_updated() {
        this.d3el.select('.title').text(this.model.get('title'));
    }
    data_updated() {
        console.log('tree data updated');
        this.panel.data(this.model.get('root'));
        d3.select(this.el).select('.view').call(this.panel);
    }
    draw() {
        console.log('Tree:', this.model.get('title'), 'field:', this.model.get('field'));
    }
}
exports.Tree = Tree;


/***/ }),

/***/ "./src/version.ts":
/*!************************!*\
  !*** ./src/version.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Copyright (c) Yarden Livnat, University of Utah.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION_SPEC_VERSION = '1.0.0';


/***/ }),

/***/ "@jupyter-widgets/base":
/*!****************************************!*\
  !*** external "@jupyter-widgets/base" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@jupyter-widgets/base");

/***/ }),

/***/ "@jupyter-widgets/jupyterlab-manager/lib/output":
/*!*****************************************************************!*\
  !*** external "@jupyter-widgets/jupyterlab-manager/lib/output" ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@jupyter-widgets/jupyterlab-manager/lib/output");

/***/ }),

/***/ "@phosphor/coreutils":
/*!**************************************!*\
  !*** external "@phosphor/coreutils" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@phosphor/coreutils");

/***/ }),

/***/ "d3":
/*!*********************!*\
  !*** external "d3" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("d3");

/***/ })

/******/ })});;
//# sourceMappingURL=labext.js.map