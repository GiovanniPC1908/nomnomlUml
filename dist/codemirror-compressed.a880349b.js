// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"lib/codemirror/lib/codemirror.js":[function(require,module,exports) {
var define;
var global = arguments[3];
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
// This is CodeMirror (https://codemirror.net), a code editor
// implemented in JavaScript on top of the browser's DOM.
//
// You can find some technical background for some of the code below
// at http://marijnhaverbeke.nl/blog/#cm-internals .
(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.CodeMirror = factory();
})(this, function () {
  'use strict'; // Kludges for bugs and behavior differences that can't be feature
  // detected are enabled based on userAgent etc sniffing.

  var userAgent = navigator.userAgent;
  var platform = navigator.platform;
  var gecko = /gecko\/\d/i.test(userAgent);
  var ie_upto10 = /MSIE \d/.test(userAgent);
  var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(userAgent);
  var edge = /Edge\/(\d+)/.exec(userAgent);
  var ie = ie_upto10 || ie_11up || edge;
  var ie_version = ie && (ie_upto10 ? document.documentMode || 6 : +(edge || ie_11up)[1]);
  var webkit = !edge && /WebKit\//.test(userAgent);
  var qtwebkit = webkit && /Qt\/\d+\.\d+/.test(userAgent);
  var chrome = !edge && /Chrome\//.test(userAgent);
  var presto = /Opera\//.test(userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var mac_geMountainLion = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(userAgent);
  var phantom = /PhantomJS/.test(userAgent);
  var ios = !edge && /AppleWebKit/.test(userAgent) && /Mobile\/\w+/.test(userAgent);
  var android = /Android/.test(userAgent); // This is woefully incomplete. Suggestions for alternative methods welcome.

  var mobile = ios || android || /webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(userAgent);
  var mac = ios || /Mac/.test(platform);
  var chromeOS = /\bCrOS\b/.test(userAgent);
  var windows = /win/i.test(platform);
  var presto_version = presto && userAgent.match(/Version\/(\d*\.\d*)/);

  if (presto_version) {
    presto_version = Number(presto_version[1]);
  }

  if (presto_version && presto_version >= 15) {
    presto = false;
    webkit = true;
  } // Some browsers use the wrong event properties to signal cmd/ctrl on OS X


  var flipCtrlCmd = mac && (qtwebkit || presto && (presto_version == null || presto_version < 12.11));
  var captureRightClick = gecko || ie && ie_version >= 9;

  function classTest(cls) {
    return new RegExp("(^|\\s)" + cls + "(?:$|\\s)\\s*");
  }

  var rmClass = function rmClass(node, cls) {
    var current = node.className;
    var match = classTest(cls).exec(current);

    if (match) {
      var after = current.slice(match.index + match[0].length);
      node.className = current.slice(0, match.index) + (after ? match[1] + after : "");
    }
  };

  function removeChildren(e) {
    for (var count = e.childNodes.length; count > 0; --count) {
      e.removeChild(e.firstChild);
    }

    return e;
  }

  function removeChildrenAndAdd(parent, e) {
    return removeChildren(parent).appendChild(e);
  }

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);

    if (className) {
      e.className = className;
    }

    if (style) {
      e.style.cssText = style;
    }

    if (typeof content == "string") {
      e.appendChild(document.createTextNode(content));
    } else if (content) {
      for (var i = 0; i < content.length; ++i) {
        e.appendChild(content[i]);
      }
    }

    return e;
  } // wrapper for elt, which removes the elt from the accessibility tree


  function eltP(tag, content, className, style) {
    var e = elt(tag, content, className, style);
    e.setAttribute("role", "presentation");
    return e;
  }

  var range;

  if (document.createRange) {
    range = function range(node, start, end, endNode) {
      var r = document.createRange();
      r.setEnd(endNode || node, end);
      r.setStart(node, start);
      return r;
    };
  } else {
    range = function range(node, start, end) {
      var r = document.body.createTextRange();

      try {
        r.moveToElementText(node.parentNode);
      } catch (e) {
        return r;
      }

      r.collapse(true);
      r.moveEnd("character", end);
      r.moveStart("character", start);
      return r;
    };
  }

  function contains(parent, child) {
    if (child.nodeType == 3) // Android browser always returns false when child is a textnode
      {
        child = child.parentNode;
      }

    if (parent.contains) {
      return parent.contains(child);
    }

    do {
      if (child.nodeType == 11) {
        child = child.host;
      }

      if (child == parent) {
        return true;
      }
    } while (child = child.parentNode);
  }

  function activeElt() {
    // IE and Edge may throw an "Unspecified Error" when accessing document.activeElement.
    // IE < 10 will throw when accessed while the page is loading or in an iframe.
    // IE > 9 and Edge will throw when accessed in an iframe if document.body is unavailable.
    var activeElement;

    try {
      activeElement = document.activeElement;
    } catch (e) {
      activeElement = document.body || null;
    }

    while (activeElement && activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
      activeElement = activeElement.shadowRoot.activeElement;
    }

    return activeElement;
  }

  function addClass(node, cls) {
    var current = node.className;

    if (!classTest(cls).test(current)) {
      node.className += (current ? " " : "") + cls;
    }
  }

  function joinClasses(a, b) {
    var as = a.split(" ");

    for (var i = 0; i < as.length; i++) {
      if (as[i] && !classTest(as[i]).test(b)) {
        b += " " + as[i];
      }
    }

    return b;
  }

  var selectInput = function selectInput(node) {
    node.select();
  };

  if (ios) // Mobile Safari apparently has a bug where select() is broken.
    {
      selectInput = function selectInput(node) {
        node.selectionStart = 0;
        node.selectionEnd = node.value.length;
      };
    } else if (ie) // Suppress mysterious IE10 errors
    {
      selectInput = function selectInput(node) {
        try {
          node.select();
        } catch (_e) {}
      };
    }

  function bind(f) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
      return f.apply(null, args);
    };
  }

  function copyObj(obj, target, overwrite) {
    if (!target) {
      target = {};
    }

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop) && (overwrite !== false || !target.hasOwnProperty(prop))) {
        target[prop] = obj[prop];
      }
    }

    return target;
  } // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.


  function countColumn(string, end, tabSize, startIndex, startValue) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);

      if (end == -1) {
        end = string.length;
      }
    }

    for (var i = startIndex || 0, n = startValue || 0;;) {
      var nextTab = string.indexOf("\t", i);

      if (nextTab < 0 || nextTab >= end) {
        return n + (end - i);
      }

      n += nextTab - i;
      n += tabSize - n % tabSize;
      i = nextTab + 1;
    }
  }

  var Delayed = function Delayed() {
    this.id = null;
  };

  Delayed.prototype.set = function (ms, f) {
    clearTimeout(this.id);
    this.id = setTimeout(f, ms);
  };

  function indexOf(array, elt) {
    for (var i = 0; i < array.length; ++i) {
      if (array[i] == elt) {
        return i;
      }
    }

    return -1;
  } // Number of pixels added to scroller and sizer to hide scrollbar


  var scrollerGap = 30; // Returned or thrown by various protocols to signal 'I'm not
  // handling this'.

  var Pass = {
    toString: function toString() {
      return "CodeMirror.Pass";
    }
  }; // Reused option objects for setSelection & friends

  var sel_dontScroll = {
    scroll: false
  },
      sel_mouse = {
    origin: "*mouse"
  },
      sel_move = {
    origin: "+move"
  }; // The inverse of countColumn -- find the offset that corresponds to
  // a particular column.

  function findColumn(string, goal, tabSize) {
    for (var pos = 0, col = 0;;) {
      var nextTab = string.indexOf("\t", pos);

      if (nextTab == -1) {
        nextTab = string.length;
      }

      var skipped = nextTab - pos;

      if (nextTab == string.length || col + skipped >= goal) {
        return pos + Math.min(skipped, goal - col);
      }

      col += nextTab - pos;
      col += tabSize - col % tabSize;
      pos = nextTab + 1;

      if (col >= goal) {
        return pos;
      }
    }
  }

  var spaceStrs = [""];

  function spaceStr(n) {
    while (spaceStrs.length <= n) {
      spaceStrs.push(lst(spaceStrs) + " ");
    }

    return spaceStrs[n];
  }

  function lst(arr) {
    return arr[arr.length - 1];
  }

  function map(array, f) {
    var out = [];

    for (var i = 0; i < array.length; i++) {
      out[i] = f(array[i], i);
    }

    return out;
  }

  function insertSorted(array, value, score) {
    var pos = 0,
        priority = score(value);

    while (pos < array.length && score(array[pos]) <= priority) {
      pos++;
    }

    array.splice(pos, 0, value);
  }

  function nothing() {}

  function createObj(base, props) {
    var inst;

    if (Object.create) {
      inst = Object.create(base);
    } else {
      nothing.prototype = base;
      inst = new nothing();
    }

    if (props) {
      copyObj(props, inst);
    }

    return inst;
  }

  var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;

  function isWordCharBasic(ch) {
    return /\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  }

  function isWordChar(ch, helper) {
    if (!helper) {
      return isWordCharBasic(ch);
    }

    if (helper.source.indexOf("\\w") > -1 && isWordCharBasic(ch)) {
      return true;
    }

    return helper.test(ch);
  }

  function isEmpty(obj) {
    for (var n in obj) {
      if (obj.hasOwnProperty(n) && obj[n]) {
        return false;
      }
    }

    return true;
  } // Extending unicode characters. A series of a non-extending char +
  // any number of extending chars is treated as a single unit as far
  // as editing and measuring is concerned. This is not fully correct,
  // since some scripts/fonts/browsers also treat other configurations
  // of code points as a group.


  var extendingChars = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;

  function isExtendingChar(ch) {
    return ch.charCodeAt(0) >= 768 && extendingChars.test(ch);
  } // Returns a number from the range [`0`; `str.length`] unless `pos` is outside that range.


  function skipExtendingChars(str, pos, dir) {
    while ((dir < 0 ? pos > 0 : pos < str.length) && isExtendingChar(str.charAt(pos))) {
      pos += dir;
    }

    return pos;
  } // Returns the value from the range [`from`; `to`] that satisfies
  // `pred` and is closest to `from`. Assumes that at least `to`
  // satisfies `pred`. Supports `from` being greater than `to`.


  function findFirst(pred, from, to) {
    // At any point we are certain `to` satisfies `pred`, don't know
    // whether `from` does.
    var dir = from > to ? -1 : 1;

    for (;;) {
      if (from == to) {
        return from;
      }

      var midF = (from + to) / 2,
          mid = dir < 0 ? Math.ceil(midF) : Math.floor(midF);

      if (mid == from) {
        return pred(mid) ? from : to;
      }

      if (pred(mid)) {
        to = mid;
      } else {
        from = mid + dir;
      }
    }
  } // BIDI HELPERS


  function iterateBidiSections(order, from, to, f) {
    if (!order) {
      return f(from, to, "ltr", 0);
    }

    var found = false;

    for (var i = 0; i < order.length; ++i) {
      var part = order[i];

      if (part.from < to && part.to > from || from == to && part.to == from) {
        f(Math.max(part.from, from), Math.min(part.to, to), part.level == 1 ? "rtl" : "ltr", i);
        found = true;
      }
    }

    if (!found) {
      f(from, to, "ltr");
    }
  }

  var bidiOther = null;

  function getBidiPartAt(order, ch, sticky) {
    var found;
    bidiOther = null;

    for (var i = 0; i < order.length; ++i) {
      var cur = order[i];

      if (cur.from < ch && cur.to > ch) {
        return i;
      }

      if (cur.to == ch) {
        if (cur.from != cur.to && sticky == "before") {
          found = i;
        } else {
          bidiOther = i;
        }
      }

      if (cur.from == ch) {
        if (cur.from != cur.to && sticky != "before") {
          found = i;
        } else {
          bidiOther = i;
        }
      }
    }

    return found != null ? found : bidiOther;
  } // Bidirectional ordering algorithm
  // See http://unicode.org/reports/tr9/tr9-13.html for the algorithm
  // that this (partially) implements.
  // One-char codes used for character types:
  // L (L):   Left-to-Right
  // R (R):   Right-to-Left
  // r (AL):  Right-to-Left Arabic
  // 1 (EN):  European Number
  // + (ES):  European Number Separator
  // % (ET):  European Number Terminator
  // n (AN):  Arabic Number
  // , (CS):  Common Number Separator
  // m (NSM): Non-Spacing Mark
  // b (BN):  Boundary Neutral
  // s (B):   Paragraph Separator
  // t (S):   Segment Separator
  // w (WS):  Whitespace
  // N (ON):  Other Neutrals
  // Returns null if characters are ordered as they appear
  // (left-to-right), or an array of sections ({from, to, level}
  // objects) in the order in which they occur visually.


  var bidiOrdering = function () {
    // Character types for codepoints 0 to 0xff
    var lowTypes = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN"; // Character types for codepoints 0x600 to 0x6f9

    var arabicTypes = "nnnnnnNNr%%r,rNNmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmmmnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmnNmmmmmmrrmmNmmmmrr1111111111";

    function charType(code) {
      if (code <= 0xf7) {
        return lowTypes.charAt(code);
      } else if (0x590 <= code && code <= 0x5f4) {
        return "R";
      } else if (0x600 <= code && code <= 0x6f9) {
        return arabicTypes.charAt(code - 0x600);
      } else if (0x6ee <= code && code <= 0x8ac) {
        return "r";
      } else if (0x2000 <= code && code <= 0x200b) {
        return "w";
      } else if (code == 0x200c) {
        return "b";
      } else {
        return "L";
      }
    }

    var bidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
    var isNeutral = /[stwN]/,
        isStrong = /[LRr]/,
        countsAsLeft = /[Lb1n]/,
        countsAsNum = /[1n]/;

    function BidiSpan(level, from, to) {
      this.level = level;
      this.from = from;
      this.to = to;
    }

    return function (str, direction) {
      var outerType = direction == "ltr" ? "L" : "R";

      if (str.length == 0 || direction == "ltr" && !bidiRE.test(str)) {
        return false;
      }

      var len = str.length,
          types = [];

      for (var i = 0; i < len; ++i) {
        types.push(charType(str.charCodeAt(i)));
      } // W1. Examine each non-spacing mark (NSM) in the level run, and
      // change the type of the NSM to the type of the previous
      // character. If the NSM is at the start of the level run, it will
      // get the type of sor.


      for (var i$1 = 0, prev = outerType; i$1 < len; ++i$1) {
        var type = types[i$1];

        if (type == "m") {
          types[i$1] = prev;
        } else {
          prev = type;
        }
      } // W2. Search backwards from each instance of a European number
      // until the first strong type (R, L, AL, or sor) is found. If an
      // AL is found, change the type of the European number to Arabic
      // number.
      // W3. Change all ALs to R.


      for (var i$2 = 0, cur = outerType; i$2 < len; ++i$2) {
        var type$1 = types[i$2];

        if (type$1 == "1" && cur == "r") {
          types[i$2] = "n";
        } else if (isStrong.test(type$1)) {
          cur = type$1;

          if (type$1 == "r") {
            types[i$2] = "R";
          }
        }
      } // W4. A single European separator between two European numbers
      // changes to a European number. A single common separator between
      // two numbers of the same type changes to that type.


      for (var i$3 = 1, prev$1 = types[0]; i$3 < len - 1; ++i$3) {
        var type$2 = types[i$3];

        if (type$2 == "+" && prev$1 == "1" && types[i$3 + 1] == "1") {
          types[i$3] = "1";
        } else if (type$2 == "," && prev$1 == types[i$3 + 1] && (prev$1 == "1" || prev$1 == "n")) {
          types[i$3] = prev$1;
        }

        prev$1 = type$2;
      } // W5. A sequence of European terminators adjacent to European
      // numbers changes to all European numbers.
      // W6. Otherwise, separators and terminators change to Other
      // Neutral.


      for (var i$4 = 0; i$4 < len; ++i$4) {
        var type$3 = types[i$4];

        if (type$3 == ",") {
          types[i$4] = "N";
        } else if (type$3 == "%") {
          var end = void 0;

          for (end = i$4 + 1; end < len && types[end] == "%"; ++end) {}

          var replace = i$4 && types[i$4 - 1] == "!" || end < len && types[end] == "1" ? "1" : "N";

          for (var j = i$4; j < end; ++j) {
            types[j] = replace;
          }

          i$4 = end - 1;
        }
      } // W7. Search backwards from each instance of a European number
      // until the first strong type (R, L, or sor) is found. If an L is
      // found, then change the type of the European number to L.


      for (var i$5 = 0, cur$1 = outerType; i$5 < len; ++i$5) {
        var type$4 = types[i$5];

        if (cur$1 == "L" && type$4 == "1") {
          types[i$5] = "L";
        } else if (isStrong.test(type$4)) {
          cur$1 = type$4;
        }
      } // N1. A sequence of neutrals takes the direction of the
      // surrounding strong text if the text on both sides has the same
      // direction. European and Arabic numbers act as if they were R in
      // terms of their influence on neutrals. Start-of-level-run (sor)
      // and end-of-level-run (eor) are used at level run boundaries.
      // N2. Any remaining neutrals take the embedding direction.


      for (var i$6 = 0; i$6 < len; ++i$6) {
        if (isNeutral.test(types[i$6])) {
          var end$1 = void 0;

          for (end$1 = i$6 + 1; end$1 < len && isNeutral.test(types[end$1]); ++end$1) {}

          var before = (i$6 ? types[i$6 - 1] : outerType) == "L";
          var after = (end$1 < len ? types[end$1] : outerType) == "L";
          var replace$1 = before == after ? before ? "L" : "R" : outerType;

          for (var j$1 = i$6; j$1 < end$1; ++j$1) {
            types[j$1] = replace$1;
          }

          i$6 = end$1 - 1;
        }
      } // Here we depart from the documented algorithm, in order to avoid
      // building up an actual levels array. Since there are only three
      // levels (0, 1, 2) in an implementation that doesn't take
      // explicit embedding into account, we can build up the order on
      // the fly, without following the level-based algorithm.


      var order = [],
          m;

      for (var i$7 = 0; i$7 < len;) {
        if (countsAsLeft.test(types[i$7])) {
          var start = i$7;

          for (++i$7; i$7 < len && countsAsLeft.test(types[i$7]); ++i$7) {}

          order.push(new BidiSpan(0, start, i$7));
        } else {
          var pos = i$7,
              at = order.length;

          for (++i$7; i$7 < len && types[i$7] != "L"; ++i$7) {}

          for (var j$2 = pos; j$2 < i$7;) {
            if (countsAsNum.test(types[j$2])) {
              if (pos < j$2) {
                order.splice(at, 0, new BidiSpan(1, pos, j$2));
              }

              var nstart = j$2;

              for (++j$2; j$2 < i$7 && countsAsNum.test(types[j$2]); ++j$2) {}

              order.splice(at, 0, new BidiSpan(2, nstart, j$2));
              pos = j$2;
            } else {
              ++j$2;
            }
          }

          if (pos < i$7) {
            order.splice(at, 0, new BidiSpan(1, pos, i$7));
          }
        }
      }

      if (direction == "ltr") {
        if (order[0].level == 1 && (m = str.match(/^\s+/))) {
          order[0].from = m[0].length;
          order.unshift(new BidiSpan(0, 0, m[0].length));
        }

        if (lst(order).level == 1 && (m = str.match(/\s+$/))) {
          lst(order).to -= m[0].length;
          order.push(new BidiSpan(0, len - m[0].length, len));
        }
      }

      return direction == "rtl" ? order.reverse() : order;
    };
  }(); // Get the bidi ordering for the given line (and cache it). Returns
  // false for lines that are fully left-to-right, and an array of
  // BidiSpan objects otherwise.


  function getOrder(line, direction) {
    var order = line.order;

    if (order == null) {
      order = line.order = bidiOrdering(line.text, direction);
    }

    return order;
  } // EVENT HANDLING
  // Lightweight event framework. on/off also work on DOM nodes,
  // registering native DOM handlers.


  var noHandlers = [];

  var on = function on(emitter, type, f) {
    if (emitter.addEventListener) {
      emitter.addEventListener(type, f, false);
    } else if (emitter.attachEvent) {
      emitter.attachEvent("on" + type, f);
    } else {
      var map$$1 = emitter._handlers || (emitter._handlers = {});
      map$$1[type] = (map$$1[type] || noHandlers).concat(f);
    }
  };

  function getHandlers(emitter, type) {
    return emitter._handlers && emitter._handlers[type] || noHandlers;
  }

  function off(emitter, type, f) {
    if (emitter.removeEventListener) {
      emitter.removeEventListener(type, f, false);
    } else if (emitter.detachEvent) {
      emitter.detachEvent("on" + type, f);
    } else {
      var map$$1 = emitter._handlers,
          arr = map$$1 && map$$1[type];

      if (arr) {
        var index = indexOf(arr, f);

        if (index > -1) {
          map$$1[type] = arr.slice(0, index).concat(arr.slice(index + 1));
        }
      }
    }
  }

  function signal(emitter, type
  /*, values...*/
  ) {
    var handlers = getHandlers(emitter, type);

    if (!handlers.length) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 2);

    for (var i = 0; i < handlers.length; ++i) {
      handlers[i].apply(null, args);
    }
  } // The DOM events that CodeMirror handles can be overridden by
  // registering a (non-DOM) handler on the editor for the event name,
  // and preventDefault-ing the event in that handler.


  function signalDOMEvent(cm, e, override) {
    if (typeof e == "string") {
      e = {
        type: e,
        preventDefault: function preventDefault() {
          this.defaultPrevented = true;
        }
      };
    }

    signal(cm, override || e.type, cm, e);
    return e_defaultPrevented(e) || e.codemirrorIgnore;
  }

  function signalCursorActivity(cm) {
    var arr = cm._handlers && cm._handlers.cursorActivity;

    if (!arr) {
      return;
    }

    var set = cm.curOp.cursorActivityHandlers || (cm.curOp.cursorActivityHandlers = []);

    for (var i = 0; i < arr.length; ++i) {
      if (indexOf(set, arr[i]) == -1) {
        set.push(arr[i]);
      }
    }
  }

  function hasHandler(emitter, type) {
    return getHandlers(emitter, type).length > 0;
  } // Add on and off methods to a constructor's prototype, to make
  // registering events on such objects more convenient.


  function eventMixin(ctor) {
    ctor.prototype.on = function (type, f) {
      on(this, type, f);
    };

    ctor.prototype.off = function (type, f) {
      off(this, type, f);
    };
  } // Due to the fact that we still support jurassic IE versions, some
  // compatibility wrappers are needed.


  function e_preventDefault(e) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  function e_stopPropagation(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else {
      e.cancelBubble = true;
    }
  }

  function e_defaultPrevented(e) {
    return e.defaultPrevented != null ? e.defaultPrevented : e.returnValue == false;
  }

  function e_stop(e) {
    e_preventDefault(e);
    e_stopPropagation(e);
  }

  function e_target(e) {
    return e.target || e.srcElement;
  }

  function e_button(e) {
    var b = e.which;

    if (b == null) {
      if (e.button & 1) {
        b = 1;
      } else if (e.button & 2) {
        b = 3;
      } else if (e.button & 4) {
        b = 2;
      }
    }

    if (mac && e.ctrlKey && b == 1) {
      b = 3;
    }

    return b;
  } // Detect drag-and-drop


  var dragAndDrop = function () {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie && ie_version < 9) {
      return false;
    }

    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  var zwspSupported;

  function zeroWidthElement(measure) {
    if (zwspSupported == null) {
      var test = elt("span", "\u200B");
      removeChildrenAndAdd(measure, elt("span", [test, document.createTextNode("x")]));

      if (measure.firstChild.offsetHeight != 0) {
        zwspSupported = test.offsetWidth <= 1 && test.offsetHeight > 2 && !(ie && ie_version < 8);
      }
    }

    var node = zwspSupported ? elt("span", "\u200B") : elt("span", "\xA0", null, "display: inline-block; width: 1px; margin-right: -1px");
    node.setAttribute("cm-text", "");
    return node;
  } // Feature-detect IE's crummy client rect reporting for bidi text


  var badBidiRects;

  function hasBadBidiRects(measure) {
    if (badBidiRects != null) {
      return badBidiRects;
    }

    var txt = removeChildrenAndAdd(measure, document.createTextNode("A\u062EA"));
    var r0 = range(txt, 0, 1).getBoundingClientRect();
    var r1 = range(txt, 1, 2).getBoundingClientRect();
    removeChildren(measure);

    if (!r0 || r0.left == r0.right) {
      return false;
    } // Safari returns null in some cases (#2780)


    return badBidiRects = r1.right - r0.right < 3;
  } // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.


  var splitLinesAuto = "\n\nb".split(/\n/).length != 3 ? function (string) {
    var pos = 0,
        result = [],
        l = string.length;

    while (pos <= l) {
      var nl = string.indexOf("\n", pos);

      if (nl == -1) {
        nl = string.length;
      }

      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");

      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }

    return result;
  } : function (string) {
    return string.split(/\r\n?|\n/);
  };
  var hasSelection = window.getSelection ? function (te) {
    try {
      return te.selectionStart != te.selectionEnd;
    } catch (e) {
      return false;
    }
  } : function (te) {
    var range$$1;

    try {
      range$$1 = te.ownerDocument.selection.createRange();
    } catch (e) {}

    if (!range$$1 || range$$1.parentElement() != te) {
      return false;
    }

    return range$$1.compareEndPoints("StartToEnd", range$$1) != 0;
  };

  var hasCopyEvent = function () {
    var e = elt("div");

    if ("oncopy" in e) {
      return true;
    }

    e.setAttribute("oncopy", "return;");
    return typeof e.oncopy == "function";
  }();

  var badZoomedRects = null;

  function hasBadZoomedRects(measure) {
    if (badZoomedRects != null) {
      return badZoomedRects;
    }

    var node = removeChildrenAndAdd(measure, elt("span", "x"));
    var normal = node.getBoundingClientRect();
    var fromRange = range(node, 0, 1).getBoundingClientRect();
    return badZoomedRects = Math.abs(normal.left - fromRange.left) > 1;
  } // Known modes, by name and by MIME


  var modes = {},
      mimeModes = {}; // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)

  function defineMode(name, mode) {
    if (arguments.length > 2) {
      mode.dependencies = Array.prototype.slice.call(arguments, 2);
    }

    modes[name] = mode;
  }

  function defineMIME(mime, spec) {
    mimeModes[mime] = spec;
  } // Given a MIME type, a {name, ...options} config object, or a name
  // string, return a mode config object.


  function resolveMode(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec)) {
      spec = mimeModes[spec];
    } else if (spec && typeof spec.name == "string" && mimeModes.hasOwnProperty(spec.name)) {
      var found = mimeModes[spec.name];

      if (typeof found == "string") {
        found = {
          name: found
        };
      }

      spec = createObj(found, spec);
      spec.name = found.name;
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec)) {
      return resolveMode("application/xml");
    } else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+json$/.test(spec)) {
      return resolveMode("application/json");
    }

    if (typeof spec == "string") {
      return {
        name: spec
      };
    } else {
      return spec || {
        name: "null"
      };
    }
  } // Given a mode spec (anything that resolveMode accepts), find and
  // initialize an actual mode object.


  function getMode(options, spec) {
    spec = resolveMode(spec);
    var mfactory = modes[spec.name];

    if (!mfactory) {
      return getMode(options, "text/plain");
    }

    var modeObj = mfactory(options, spec);

    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];

      for (var prop in exts) {
        if (!exts.hasOwnProperty(prop)) {
          continue;
        }

        if (modeObj.hasOwnProperty(prop)) {
          modeObj["_" + prop] = modeObj[prop];
        }

        modeObj[prop] = exts[prop];
      }
    }

    modeObj.name = spec.name;

    if (spec.helperType) {
      modeObj.helperType = spec.helperType;
    }

    if (spec.modeProps) {
      for (var prop$1 in spec.modeProps) {
        modeObj[prop$1] = spec.modeProps[prop$1];
      }
    }

    return modeObj;
  } // This can be used to attach properties to mode objects from
  // outside the actual mode definition.


  var modeExtensions = {};

  function extendMode(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : modeExtensions[mode] = {};
    copyObj(properties, exts);
  }

  function copyState(mode, state) {
    if (state === true) {
      return state;
    }

    if (mode.copyState) {
      return mode.copyState(state);
    }

    var nstate = {};

    for (var n in state) {
      var val = state[n];

      if (val instanceof Array) {
        val = val.concat([]);
      }

      nstate[n] = val;
    }

    return nstate;
  } // Given a mode and a state (for that mode), find the inner mode and
  // state at the position that the state refers to.


  function innerMode(mode, state) {
    var info;

    while (mode.innerMode) {
      info = mode.innerMode(state);

      if (!info || info.mode == mode) {
        break;
      }

      state = info.state;
      mode = info.mode;
    }

    return info || {
      mode: mode,
      state: state
    };
  }

  function startState(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  } // STRING STREAM
  // Fed to the mode parsers, provides helper functions to make
  // parsers more succinct.


  var StringStream = function StringStream(string, tabSize, lineOracle) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
    this.lastColumnPos = this.lastColumnValue = 0;
    this.lineStart = 0;
    this.lineOracle = lineOracle;
  };

  StringStream.prototype.eol = function () {
    return this.pos >= this.string.length;
  };

  StringStream.prototype.sol = function () {
    return this.pos == this.lineStart;
  };

  StringStream.prototype.peek = function () {
    return this.string.charAt(this.pos) || undefined;
  };

  StringStream.prototype.next = function () {
    if (this.pos < this.string.length) {
      return this.string.charAt(this.pos++);
    }
  };

  StringStream.prototype.eat = function (match) {
    var ch = this.string.charAt(this.pos);
    var ok;

    if (typeof match == "string") {
      ok = ch == match;
    } else {
      ok = ch && (match.test ? match.test(ch) : match(ch));
    }

    if (ok) {
      ++this.pos;
      return ch;
    }
  };

  StringStream.prototype.eatWhile = function (match) {
    var start = this.pos;

    while (this.eat(match)) {}

    return this.pos > start;
  };

  StringStream.prototype.eatSpace = function () {
    var this$1 = this;
    var start = this.pos;

    while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) {
      ++this$1.pos;
    }

    return this.pos > start;
  };

  StringStream.prototype.skipToEnd = function () {
    this.pos = this.string.length;
  };

  StringStream.prototype.skipTo = function (ch) {
    var found = this.string.indexOf(ch, this.pos);

    if (found > -1) {
      this.pos = found;
      return true;
    }
  };

  StringStream.prototype.backUp = function (n) {
    this.pos -= n;
  };

  StringStream.prototype.column = function () {
    if (this.lastColumnPos < this.start) {
      this.lastColumnValue = countColumn(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
      this.lastColumnPos = this.start;
    }

    return this.lastColumnValue - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  };

  StringStream.prototype.indentation = function () {
    return countColumn(this.string, null, this.tabSize) - (this.lineStart ? countColumn(this.string, this.lineStart, this.tabSize) : 0);
  };

  StringStream.prototype.match = function (pattern, consume, caseInsensitive) {
    if (typeof pattern == "string") {
      var cased = function cased(str) {
        return caseInsensitive ? str.toLowerCase() : str;
      };

      var substr = this.string.substr(this.pos, pattern.length);

      if (cased(substr) == cased(pattern)) {
        if (consume !== false) {
          this.pos += pattern.length;
        }

        return true;
      }
    } else {
      var match = this.string.slice(this.pos).match(pattern);

      if (match && match.index > 0) {
        return null;
      }

      if (match && consume !== false) {
        this.pos += match[0].length;
      }

      return match;
    }
  };

  StringStream.prototype.current = function () {
    return this.string.slice(this.start, this.pos);
  };

  StringStream.prototype.hideFirstChars = function (n, inner) {
    this.lineStart += n;

    try {
      return inner();
    } finally {
      this.lineStart -= n;
    }
  };

  StringStream.prototype.lookAhead = function (n) {
    var oracle = this.lineOracle;
    return oracle && oracle.lookAhead(n);
  };

  StringStream.prototype.baseToken = function () {
    var oracle = this.lineOracle;
    return oracle && oracle.baseToken(this.pos);
  }; // Find the line object corresponding to the given line number.


  function getLine(doc, n) {
    n -= doc.first;

    if (n < 0 || n >= doc.size) {
      throw new Error("There is no line " + (n + doc.first) + " in the document.");
    }

    var chunk = doc;

    while (!chunk.lines) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i],
            sz = child.chunkSize();

        if (n < sz) {
          chunk = child;
          break;
        }

        n -= sz;
      }
    }

    return chunk.lines[n];
  } // Get the part of a document between two positions, as an array of
  // strings.


  function getBetween(doc, start, end) {
    var out = [],
        n = start.line;
    doc.iter(start.line, end.line + 1, function (line) {
      var text = line.text;

      if (n == end.line) {
        text = text.slice(0, end.ch);
      }

      if (n == start.line) {
        text = text.slice(start.ch);
      }

      out.push(text);
      ++n;
    });
    return out;
  } // Get the lines between from and to, as array of strings.


  function getLines(doc, from, to) {
    var out = [];
    doc.iter(from, to, function (line) {
      out.push(line.text);
    }); // iter aborts when callback returns truthy value

    return out;
  } // Update the height of a line, propagating the height change
  // upwards to parent nodes.


  function updateLineHeight(line, height) {
    var diff = height - line.height;

    if (diff) {
      for (var n = line; n; n = n.parent) {
        n.height += diff;
      }
    }
  } // Given a line object, find its line number by walking up through
  // its parent links.


  function lineNo(line) {
    if (line.parent == null) {
      return null;
    }

    var cur = line.parent,
        no = indexOf(cur.lines, line);

    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0;; ++i) {
        if (chunk.children[i] == cur) {
          break;
        }

        no += chunk.children[i].chunkSize();
      }
    }

    return no + cur.first;
  } // Find the line at the given vertical position, using the height
  // information in the document tree.


  function _lineAtHeight(chunk, h) {
    var n = chunk.first;

    outer: do {
      for (var i$1 = 0; i$1 < chunk.children.length; ++i$1) {
        var child = chunk.children[i$1],
            ch = child.height;

        if (h < ch) {
          chunk = child;
          continue outer;
        }

        h -= ch;
        n += child.chunkSize();
      }

      return n;
    } while (!chunk.lines);

    var i = 0;

    for (; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i],
          lh = line.height;

      if (h < lh) {
        break;
      }

      h -= lh;
    }

    return n + i;
  }

  function isLine(doc, l) {
    return l >= doc.first && l < doc.first + doc.size;
  }

  function lineNumberFor(options, i) {
    return String(options.lineNumberFormatter(i + options.firstLineNumber));
  } // A Pos instance represents a position within the text.


  function Pos(line, ch, sticky) {
    if (sticky === void 0) sticky = null;

    if (!(this instanceof Pos)) {
      return new Pos(line, ch, sticky);
    }

    this.line = line;
    this.ch = ch;
    this.sticky = sticky;
  } // Compare two positions, return 0 if they are the same, a negative
  // number when a is less, and a positive number otherwise.


  function cmp(a, b) {
    return a.line - b.line || a.ch - b.ch;
  }

  function equalCursorPos(a, b) {
    return a.sticky == b.sticky && cmp(a, b) == 0;
  }

  function copyPos(x) {
    return Pos(x.line, x.ch);
  }

  function maxPos(a, b) {
    return cmp(a, b) < 0 ? b : a;
  }

  function minPos(a, b) {
    return cmp(a, b) < 0 ? a : b;
  } // Most of the external API clips given positions to make sure they
  // actually exist within the document.


  function clipLine(doc, n) {
    return Math.max(doc.first, Math.min(n, doc.first + doc.size - 1));
  }

  function _clipPos(doc, pos) {
    if (pos.line < doc.first) {
      return Pos(doc.first, 0);
    }

    var last = doc.first + doc.size - 1;

    if (pos.line > last) {
      return Pos(last, getLine(doc, last).text.length);
    }

    return clipToLen(pos, getLine(doc, pos.line).text.length);
  }

  function clipToLen(pos, linelen) {
    var ch = pos.ch;

    if (ch == null || ch > linelen) {
      return Pos(pos.line, linelen);
    } else if (ch < 0) {
      return Pos(pos.line, 0);
    } else {
      return pos;
    }
  }

  function clipPosArray(doc, array) {
    var out = [];

    for (var i = 0; i < array.length; i++) {
      out[i] = _clipPos(doc, array[i]);
    }

    return out;
  }

  var SavedContext = function SavedContext(state, lookAhead) {
    this.state = state;
    this.lookAhead = lookAhead;
  };

  var Context = function Context(doc, state, line, lookAhead) {
    this.state = state;
    this.doc = doc;
    this.line = line;
    this.maxLookAhead = lookAhead || 0;
    this.baseTokens = null;
    this.baseTokenPos = 1;
  };

  Context.prototype.lookAhead = function (n) {
    var line = this.doc.getLine(this.line + n);

    if (line != null && n > this.maxLookAhead) {
      this.maxLookAhead = n;
    }

    return line;
  };

  Context.prototype.baseToken = function (n) {
    var this$1 = this;

    if (!this.baseTokens) {
      return null;
    }

    while (this.baseTokens[this.baseTokenPos] <= n) {
      this$1.baseTokenPos += 2;
    }

    var type = this.baseTokens[this.baseTokenPos + 1];
    return {
      type: type && type.replace(/( |^)overlay .*/, ""),
      size: this.baseTokens[this.baseTokenPos] - n
    };
  };

  Context.prototype.nextLine = function () {
    this.line++;

    if (this.maxLookAhead > 0) {
      this.maxLookAhead--;
    }
  };

  Context.fromSaved = function (doc, saved, line) {
    if (saved instanceof SavedContext) {
      return new Context(doc, copyState(doc.mode, saved.state), line, saved.lookAhead);
    } else {
      return new Context(doc, copyState(doc.mode, saved), line);
    }
  };

  Context.prototype.save = function (copy) {
    var state = copy !== false ? copyState(this.doc.mode, this.state) : this.state;
    return this.maxLookAhead > 0 ? new SavedContext(state, this.maxLookAhead) : state;
  }; // Compute a style array (an array starting with a mode generation
  // -- for invalidation -- followed by pairs of end positions and
  // style strings), which is used to highlight the tokens on the
  // line.


  function highlightLine(cm, line, context, forceToEnd) {
    // A styles array always starts with a number identifying the
    // mode/overlays that it is based on (for easy invalidation).
    var st = [cm.state.modeGen],
        lineClasses = {}; // Compute the base array of styles

    runMode(cm, line.text, cm.doc.mode, context, function (end, style) {
      return st.push(end, style);
    }, lineClasses, forceToEnd);
    var state = context.state; // Run overlays, adjust style array.

    var loop = function loop(o) {
      context.baseTokens = st;
      var overlay = cm.state.overlays[o],
          i = 1,
          at = 0;
      context.state = true;
      runMode(cm, line.text, overlay.mode, context, function (end, style) {
        var start = i; // Ensure there's a token end at the current position, and that i points at it

        while (at < end) {
          var i_end = st[i];

          if (i_end > end) {
            st.splice(i, 1, end, st[i + 1], i_end);
          }

          i += 2;
          at = Math.min(end, i_end);
        }

        if (!style) {
          return;
        }

        if (overlay.opaque) {
          st.splice(start, i - start, end, "overlay " + style);
          i = start + 2;
        } else {
          for (; start < i; start += 2) {
            var cur = st[start + 1];
            st[start + 1] = (cur ? cur + " " : "") + "overlay " + style;
          }
        }
      }, lineClasses);
      context.state = state;
      context.baseTokens = null;
      context.baseTokenPos = 1;
    };

    for (var o = 0; o < cm.state.overlays.length; ++o) {
      loop(o);
    }

    return {
      styles: st,
      classes: lineClasses.bgClass || lineClasses.textClass ? lineClasses : null
    };
  }

  function getLineStyles(cm, line, updateFrontier) {
    if (!line.styles || line.styles[0] != cm.state.modeGen) {
      var context = getContextBefore(cm, lineNo(line));
      var resetState = line.text.length > cm.options.maxHighlightLength && copyState(cm.doc.mode, context.state);
      var result = highlightLine(cm, line, context);

      if (resetState) {
        context.state = resetState;
      }

      line.stateAfter = context.save(!resetState);
      line.styles = result.styles;

      if (result.classes) {
        line.styleClasses = result.classes;
      } else if (line.styleClasses) {
        line.styleClasses = null;
      }

      if (updateFrontier === cm.doc.highlightFrontier) {
        cm.doc.modeFrontier = Math.max(cm.doc.modeFrontier, ++cm.doc.highlightFrontier);
      }
    }

    return line.styles;
  }

  function getContextBefore(cm, n, precise) {
    var doc = cm.doc,
        display = cm.display;

    if (!doc.mode.startState) {
      return new Context(doc, true, n);
    }

    var start = findStartLine(cm, n, precise);
    var saved = start > doc.first && getLine(doc, start - 1).stateAfter;
    var context = saved ? Context.fromSaved(doc, saved, start) : new Context(doc, startState(doc.mode), start);
    doc.iter(start, n, function (line) {
      processLine(cm, line.text, context);
      var pos = context.line;
      line.stateAfter = pos == n - 1 || pos % 5 == 0 || pos >= display.viewFrom && pos < display.viewTo ? context.save() : null;
      context.nextLine();
    });

    if (precise) {
      doc.modeFrontier = context.line;
    }

    return context;
  } // Lightweight form of highlight -- proceed over this line and
  // update state, but don't save a style array. Used for lines that
  // aren't currently visible.


  function processLine(cm, text, context, startAt) {
    var mode = cm.doc.mode;
    var stream = new StringStream(text, cm.options.tabSize, context);
    stream.start = stream.pos = startAt || 0;

    if (text == "") {
      callBlankLine(mode, context.state);
    }

    while (!stream.eol()) {
      readToken(mode, stream, context.state);
      stream.start = stream.pos;
    }
  }

  function callBlankLine(mode, state) {
    if (mode.blankLine) {
      return mode.blankLine(state);
    }

    if (!mode.innerMode) {
      return;
    }

    var inner = innerMode(mode, state);

    if (inner.mode.blankLine) {
      return inner.mode.blankLine(inner.state);
    }
  }

  function readToken(mode, stream, state, inner) {
    for (var i = 0; i < 10; i++) {
      if (inner) {
        inner[0] = innerMode(mode, state).mode;
      }

      var style = mode.token(stream, state);

      if (stream.pos > stream.start) {
        return style;
      }
    }

    throw new Error("Mode " + mode.name + " failed to advance stream.");
  }

  var Token = function Token(stream, type, state) {
    this.start = stream.start;
    this.end = stream.pos;
    this.string = stream.current();
    this.type = type || null;
    this.state = state;
  }; // Utility for getTokenAt and getLineTokens


  function takeToken(cm, pos, precise, asArray) {
    var doc = cm.doc,
        mode = doc.mode,
        style;
    pos = _clipPos(doc, pos);
    var line = getLine(doc, pos.line),
        context = getContextBefore(cm, pos.line, precise);
    var stream = new StringStream(line.text, cm.options.tabSize, context),
        tokens;

    if (asArray) {
      tokens = [];
    }

    while ((asArray || stream.pos < pos.ch) && !stream.eol()) {
      stream.start = stream.pos;
      style = readToken(mode, stream, context.state);

      if (asArray) {
        tokens.push(new Token(stream, style, copyState(doc.mode, context.state)));
      }
    }

    return asArray ? tokens : new Token(stream, style, context.state);
  }

  function extractLineClasses(type, output) {
    if (type) {
      for (;;) {
        var lineClass = type.match(/(?:^|\s+)line-(background-)?(\S+)/);

        if (!lineClass) {
          break;
        }

        type = type.slice(0, lineClass.index) + type.slice(lineClass.index + lineClass[0].length);
        var prop = lineClass[1] ? "bgClass" : "textClass";

        if (output[prop] == null) {
          output[prop] = lineClass[2];
        } else if (!new RegExp("(?:^|\s)" + lineClass[2] + "(?:$|\s)").test(output[prop])) {
          output[prop] += " " + lineClass[2];
        }
      }
    }

    return type;
  } // Run the given mode's parser over a line, calling f for each token.


  function runMode(cm, text, mode, context, f, lineClasses, forceToEnd) {
    var flattenSpans = mode.flattenSpans;

    if (flattenSpans == null) {
      flattenSpans = cm.options.flattenSpans;
    }

    var curStart = 0,
        curStyle = null;
    var stream = new StringStream(text, cm.options.tabSize, context),
        style;
    var inner = cm.options.addModeClass && [null];

    if (text == "") {
      extractLineClasses(callBlankLine(mode, context.state), lineClasses);
    }

    while (!stream.eol()) {
      if (stream.pos > cm.options.maxHighlightLength) {
        flattenSpans = false;

        if (forceToEnd) {
          processLine(cm, text, context, stream.pos);
        }

        stream.pos = text.length;
        style = null;
      } else {
        style = extractLineClasses(readToken(mode, stream, context.state, inner), lineClasses);
      }

      if (inner) {
        var mName = inner[0].name;

        if (mName) {
          style = "m-" + (style ? mName + " " + style : mName);
        }
      }

      if (!flattenSpans || curStyle != style) {
        while (curStart < stream.start) {
          curStart = Math.min(stream.start, curStart + 5000);
          f(curStart, curStyle);
        }

        curStyle = style;
      }

      stream.start = stream.pos;
    }

    while (curStart < stream.pos) {
      // Webkit seems to refuse to render text nodes longer than 57444
      // characters, and returns inaccurate measurements in nodes
      // starting around 5000 chars.
      var pos = Math.min(stream.pos, curStart + 5000);
      f(pos, curStyle);
      curStart = pos;
    }
  } // Finds the line to start with when starting a parse. Tries to
  // find a line with a stateAfter, so that it can start with a
  // valid state. If that fails, it returns the line with the
  // smallest indentation, which tends to need the least context to
  // parse correctly.


  function findStartLine(cm, n, precise) {
    var minindent,
        minline,
        doc = cm.doc;
    var lim = precise ? -1 : n - (cm.doc.mode.innerMode ? 1000 : 100);

    for (var search = n; search > lim; --search) {
      if (search <= doc.first) {
        return doc.first;
      }

      var line = getLine(doc, search - 1),
          after = line.stateAfter;

      if (after && (!precise || search + (after instanceof SavedContext ? after.lookAhead : 0) <= doc.modeFrontier)) {
        return search;
      }

      var indented = countColumn(line.text, null, cm.options.tabSize);

      if (minline == null || minindent > indented) {
        minline = search - 1;
        minindent = indented;
      }
    }

    return minline;
  }

  function retreatFrontier(doc, n) {
    doc.modeFrontier = Math.min(doc.modeFrontier, n);

    if (doc.highlightFrontier < n - 10) {
      return;
    }

    var start = doc.first;

    for (var line = n - 1; line > start; line--) {
      var saved = getLine(doc, line).stateAfter; // change is on 3
      // state on line 1 looked ahead 2 -- so saw 3
      // test 1 + 2 < 3 should cover this

      if (saved && (!(saved instanceof SavedContext) || line + saved.lookAhead < n)) {
        start = line + 1;
        break;
      }
    }

    doc.highlightFrontier = Math.min(doc.highlightFrontier, start);
  } // Optimize some code when these features are not used.


  var sawReadOnlySpans = false,
      sawCollapsedSpans = false;

  function seeReadOnlySpans() {
    sawReadOnlySpans = true;
  }

  function seeCollapsedSpans() {
    sawCollapsedSpans = true;
  } // TEXTMARKER SPANS


  function MarkedSpan(marker, from, to) {
    this.marker = marker;
    this.from = from;
    this.to = to;
  } // Search an array of spans for a span matching the given marker.


  function getMarkedSpanFor(spans, marker) {
    if (spans) {
      for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];

        if (span.marker == marker) {
          return span;
        }
      }
    }
  } // Remove a span from an array, returning undefined if no spans are
  // left (we don't store arrays for lines without spans).


  function removeMarkedSpan(spans, span) {
    var r;

    for (var i = 0; i < spans.length; ++i) {
      if (spans[i] != span) {
        (r || (r = [])).push(spans[i]);
      }
    }

    return r;
  } // Add a span to a line.


  function addMarkedSpan(line, span) {
    line.markedSpans = line.markedSpans ? line.markedSpans.concat([span]) : [span];
    span.marker.attachLine(line);
  } // Used for the algorithm that adjusts markers for a change in the
  // document. These functions cut an array of spans at a given
  // character position, returning an array of remaining chunks (or
  // undefined if nothing remains).


  function markedSpansBefore(old, startCh, isInsert) {
    var nw;

    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);

        if (startsBefore || span.from == startCh && marker.type == "bookmark" && (!isInsert || !span.marker.insertLeft)) {
          var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
          (nw || (nw = [])).push(new MarkedSpan(marker, span.from, endsAfter ? null : span.to));
        }
      }
    }

    return nw;
  }

  function markedSpansAfter(old, endCh, isInsert) {
    var nw;

    if (old) {
      for (var i = 0; i < old.length; ++i) {
        var span = old[i],
            marker = span.marker;
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);

        if (endsAfter || span.from == endCh && marker.type == "bookmark" && (!isInsert || span.marker.insertLeft)) {
          var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
          (nw || (nw = [])).push(new MarkedSpan(marker, startsBefore ? null : span.from - endCh, span.to == null ? null : span.to - endCh));
        }
      }
    }

    return nw;
  } // Given a change object, compute the new set of marker spans that
  // cover the line in which the change took place. Removes spans
  // entirely within the change, reconnects spans belonging to the
  // same marker that appear on both sides of the change, and cuts off
  // spans partially within the change. Returns an array of span
  // arrays with one element for each line in (after) the change.


  function stretchSpansOverChange(doc, change) {
    if (change.full) {
      return null;
    }

    var oldFirst = isLine(doc, change.from.line) && getLine(doc, change.from.line).markedSpans;
    var oldLast = isLine(doc, change.to.line) && getLine(doc, change.to.line).markedSpans;

    if (!oldFirst && !oldLast) {
      return null;
    }

    var startCh = change.from.ch,
        endCh = change.to.ch,
        isInsert = cmp(change.from, change.to) == 0; // Get the spans that 'stick out' on both sides

    var first = markedSpansBefore(oldFirst, startCh, isInsert);
    var last = markedSpansAfter(oldLast, endCh, isInsert); // Next, merge those two ends

    var sameLine = change.text.length == 1,
        offset = lst(change.text).length + (sameLine ? startCh : 0);

    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];

        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);

          if (!found) {
            span.to = startCh;
          } else if (sameLine) {
            span.to = found.to == null ? null : found.to + offset;
          }
        }
      }
    }

    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i$1 = 0; i$1 < last.length; ++i$1) {
        var span$1 = last[i$1];

        if (span$1.to != null) {
          span$1.to += offset;
        }

        if (span$1.from == null) {
          var found$1 = getMarkedSpanFor(first, span$1.marker);

          if (!found$1) {
            span$1.from = offset;

            if (sameLine) {
              (first || (first = [])).push(span$1);
            }
          }
        } else {
          span$1.from += offset;

          if (sameLine) {
            (first || (first = [])).push(span$1);
          }
        }
      }
    } // Make sure we didn't create any zero-length spans


    if (first) {
      first = clearEmptySpans(first);
    }

    if (last && last != first) {
      last = clearEmptySpans(last);
    }

    var newMarkers = [first];

    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = change.text.length - 2,
          gapMarkers;

      if (gap > 0 && first) {
        for (var i$2 = 0; i$2 < first.length; ++i$2) {
          if (first[i$2].to == null) {
            (gapMarkers || (gapMarkers = [])).push(new MarkedSpan(first[i$2].marker, null, null));
          }
        }
      }

      for (var i$3 = 0; i$3 < gap; ++i$3) {
        newMarkers.push(gapMarkers);
      }

      newMarkers.push(last);
    }

    return newMarkers;
  } // Remove spans that are empty and don't have a clearWhenEmpty
  // option of false.


  function clearEmptySpans(spans) {
    for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];

      if (span.from != null && span.from == span.to && span.marker.clearWhenEmpty !== false) {
        spans.splice(i--, 1);
      }
    }

    if (!spans.length) {
      return null;
    }

    return spans;
  } // Used to 'clip' out readOnly ranges when making a change.


  function removeReadOnlyRanges(doc, from, to) {
    var markers = null;
    doc.iter(from.line, to.line + 1, function (line) {
      if (line.markedSpans) {
        for (var i = 0; i < line.markedSpans.length; ++i) {
          var mark = line.markedSpans[i].marker;

          if (mark.readOnly && (!markers || indexOf(markers, mark) == -1)) {
            (markers || (markers = [])).push(mark);
          }
        }
      }
    });

    if (!markers) {
      return null;
    }

    var parts = [{
      from: from,
      to: to
    }];

    for (var i = 0; i < markers.length; ++i) {
      var mk = markers[i],
          m = mk.find(0);

      for (var j = 0; j < parts.length; ++j) {
        var p = parts[j];

        if (cmp(p.to, m.from) < 0 || cmp(p.from, m.to) > 0) {
          continue;
        }

        var newParts = [j, 1],
            dfrom = cmp(p.from, m.from),
            dto = cmp(p.to, m.to);

        if (dfrom < 0 || !mk.inclusiveLeft && !dfrom) {
          newParts.push({
            from: p.from,
            to: m.from
          });
        }

        if (dto > 0 || !mk.inclusiveRight && !dto) {
          newParts.push({
            from: m.to,
            to: p.to
          });
        }

        parts.splice.apply(parts, newParts);
        j += newParts.length - 3;
      }
    }

    return parts;
  } // Connect or disconnect spans from a line.


  function detachMarkedSpans(line) {
    var spans = line.markedSpans;

    if (!spans) {
      return;
    }

    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.detachLine(line);
    }

    line.markedSpans = null;
  }

  function attachMarkedSpans(line, spans) {
    if (!spans) {
      return;
    }

    for (var i = 0; i < spans.length; ++i) {
      spans[i].marker.attachLine(line);
    }

    line.markedSpans = spans;
  } // Helpers used when computing which overlapping collapsed span
  // counts as the larger one.


  function extraLeft(marker) {
    return marker.inclusiveLeft ? -1 : 0;
  }

  function extraRight(marker) {
    return marker.inclusiveRight ? 1 : 0;
  } // Returns a number indicating which of two overlapping collapsed
  // spans is larger (and thus includes the other). Falls back to
  // comparing ids when the spans cover exactly the same range.


  function compareCollapsedMarkers(a, b) {
    var lenDiff = a.lines.length - b.lines.length;

    if (lenDiff != 0) {
      return lenDiff;
    }

    var aPos = a.find(),
        bPos = b.find();
    var fromCmp = cmp(aPos.from, bPos.from) || extraLeft(a) - extraLeft(b);

    if (fromCmp) {
      return -fromCmp;
    }

    var toCmp = cmp(aPos.to, bPos.to) || extraRight(a) - extraRight(b);

    if (toCmp) {
      return toCmp;
    }

    return b.id - a.id;
  } // Find out whether a line ends or starts in a collapsed span. If
  // so, return the marker for that span.


  function collapsedSpanAtSide(line, start) {
    var sps = sawCollapsedSpans && line.markedSpans,
        found;

    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];

        if (sp.marker.collapsed && (start ? sp.from : sp.to) == null && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) {
          found = sp.marker;
        }
      }
    }

    return found;
  }

  function collapsedSpanAtStart(line) {
    return collapsedSpanAtSide(line, true);
  }

  function collapsedSpanAtEnd(line) {
    return collapsedSpanAtSide(line, false);
  }

  function collapsedSpanAround(line, ch) {
    var sps = sawCollapsedSpans && line.markedSpans,
        found;

    if (sps) {
      for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];

        if (sp.marker.collapsed && (sp.from == null || sp.from < ch) && (sp.to == null || sp.to > ch) && (!found || compareCollapsedMarkers(found, sp.marker) < 0)) {
          found = sp.marker;
        }
      }
    }

    return found;
  } // Test whether there exists a collapsed span that partially
  // overlaps (covers the start or end, but not both) of a new span.
  // Such overlap is not allowed.


  function conflictingCollapsedRange(doc, lineNo$$1, from, to, marker) {
    var line = getLine(doc, lineNo$$1);
    var sps = sawCollapsedSpans && line.markedSpans;

    if (sps) {
      for (var i = 0; i < sps.length; ++i) {
        var sp = sps[i];

        if (!sp.marker.collapsed) {
          continue;
        }

        var found = sp.marker.find(0);
        var fromCmp = cmp(found.from, from) || extraLeft(sp.marker) - extraLeft(marker);
        var toCmp = cmp(found.to, to) || extraRight(sp.marker) - extraRight(marker);

        if (fromCmp >= 0 && toCmp <= 0 || fromCmp <= 0 && toCmp >= 0) {
          continue;
        }

        if (fromCmp <= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.to, from) >= 0 : cmp(found.to, from) > 0) || fromCmp >= 0 && (sp.marker.inclusiveRight && marker.inclusiveLeft ? cmp(found.from, to) <= 0 : cmp(found.from, to) < 0)) {
          return true;
        }
      }
    }
  } // A visual line is a line as drawn on the screen. Folding, for
  // example, can cause multiple logical lines to appear on the same
  // visual line. This finds the start of the visual line that the
  // given line is part of (usually that is the line itself).


  function visualLine(line) {
    var merged;

    while (merged = collapsedSpanAtStart(line)) {
      line = merged.find(-1, true).line;
    }

    return line;
  }

  function visualLineEnd(line) {
    var merged;

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
    }

    return line;
  } // Returns an array of logical lines that continue the visual line
  // started by the argument, or undefined if there are no such lines.


  function visualLineContinued(line) {
    var merged, lines;

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
      (lines || (lines = [])).push(line);
    }

    return lines;
  } // Get the line number of the start of the visual line that the
  // given line number is part of.


  function visualLineNo(doc, lineN) {
    var line = getLine(doc, lineN),
        vis = visualLine(line);

    if (line == vis) {
      return lineN;
    }

    return lineNo(vis);
  } // Get the line number of the start of the next visual line after
  // the given line.


  function visualLineEndNo(doc, lineN) {
    if (lineN > doc.lastLine()) {
      return lineN;
    }

    var line = getLine(doc, lineN),
        merged;

    if (!lineIsHidden(doc, line)) {
      return lineN;
    }

    while (merged = collapsedSpanAtEnd(line)) {
      line = merged.find(1, true).line;
    }

    return lineNo(line) + 1;
  } // Compute whether a line is hidden. Lines count as hidden when they
  // are part of a visual line that starts with another line, or when
  // they are entirely covered by collapsed, non-widget span.


  function lineIsHidden(doc, line) {
    var sps = sawCollapsedSpans && line.markedSpans;

    if (sps) {
      for (var sp = void 0, i = 0; i < sps.length; ++i) {
        sp = sps[i];

        if (!sp.marker.collapsed) {
          continue;
        }

        if (sp.from == null) {
          return true;
        }

        if (sp.marker.widgetNode) {
          continue;
        }

        if (sp.from == 0 && sp.marker.inclusiveLeft && lineIsHiddenInner(doc, line, sp)) {
          return true;
        }
      }
    }
  }

  function lineIsHiddenInner(doc, line, span) {
    if (span.to == null) {
      var end = span.marker.find(1, true);
      return lineIsHiddenInner(doc, end.line, getMarkedSpanFor(end.line.markedSpans, span.marker));
    }

    if (span.marker.inclusiveRight && span.to == line.text.length) {
      return true;
    }

    for (var sp = void 0, i = 0; i < line.markedSpans.length; ++i) {
      sp = line.markedSpans[i];

      if (sp.marker.collapsed && !sp.marker.widgetNode && sp.from == span.to && (sp.to == null || sp.to != span.from) && (sp.marker.inclusiveLeft || span.marker.inclusiveRight) && lineIsHiddenInner(doc, line, sp)) {
        return true;
      }
    }
  } // Find the height above the given line.


  function _heightAtLine(lineObj) {
    lineObj = visualLine(lineObj);
    var h = 0,
        chunk = lineObj.parent;

    for (var i = 0; i < chunk.lines.length; ++i) {
      var line = chunk.lines[i];

      if (line == lineObj) {
        break;
      } else {
        h += line.height;
      }
    }

    for (var p = chunk.parent; p; chunk = p, p = chunk.parent) {
      for (var i$1 = 0; i$1 < p.children.length; ++i$1) {
        var cur = p.children[i$1];

        if (cur == chunk) {
          break;
        } else {
          h += cur.height;
        }
      }
    }

    return h;
  } // Compute the character length of a line, taking into account
  // collapsed ranges (see markText) that might hide parts, and join
  // other lines onto it.


  function lineLength(line) {
    if (line.height == 0) {
      return 0;
    }

    var len = line.text.length,
        merged,
        cur = line;

    while (merged = collapsedSpanAtStart(cur)) {
      var found = merged.find(0, true);
      cur = found.from.line;
      len += found.from.ch - found.to.ch;
    }

    cur = line;

    while (merged = collapsedSpanAtEnd(cur)) {
      var found$1 = merged.find(0, true);
      len -= cur.text.length - found$1.from.ch;
      cur = found$1.to.line;
      len += cur.text.length - found$1.to.ch;
    }

    return len;
  } // Find the longest line in the document.


  function findMaxLine(cm) {
    var d = cm.display,
        doc = cm.doc;
    d.maxLine = getLine(doc, doc.first);
    d.maxLineLength = lineLength(d.maxLine);
    d.maxLineChanged = true;
    doc.iter(function (line) {
      var len = lineLength(line);

      if (len > d.maxLineLength) {
        d.maxLineLength = len;
        d.maxLine = line;
      }
    });
  } // LINE DATA STRUCTURE
  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).


  var Line = function Line(text, markedSpans, estimateHeight) {
    this.text = text;
    attachMarkedSpans(this, markedSpans);
    this.height = estimateHeight ? estimateHeight(this) : 1;
  };

  Line.prototype.lineNo = function () {
    return lineNo(this);
  };

  eventMixin(Line); // Change the content (text, markers) of a line. Automatically
  // invalidates cached information and tries to re-estimate the
  // line's height.

  function updateLine(line, text, markedSpans, estimateHeight) {
    line.text = text;

    if (line.stateAfter) {
      line.stateAfter = null;
    }

    if (line.styles) {
      line.styles = null;
    }

    if (line.order != null) {
      line.order = null;
    }

    detachMarkedSpans(line);
    attachMarkedSpans(line, markedSpans);
    var estHeight = estimateHeight ? estimateHeight(line) : 1;

    if (estHeight != line.height) {
      updateLineHeight(line, estHeight);
    }
  } // Detach a line from the document tree and its markers.


  function cleanUpLine(line) {
    line.parent = null;
    detachMarkedSpans(line);
  } // Convert a style as returned by a mode (either null, or a string
  // containing one or more styles) to a CSS style. This is cached,
  // and also looks for line-wide styles.


  var styleToClassCache = {},
      styleToClassCacheWithMode = {};

  function interpretTokenStyle(style, options) {
    if (!style || /^\s*$/.test(style)) {
      return null;
    }

    var cache = options.addModeClass ? styleToClassCacheWithMode : styleToClassCache;
    return cache[style] || (cache[style] = style.replace(/\S+/g, "cm-$&"));
  } // Render the DOM representation of the text of a line. Also builds
  // up a 'line map', which points at the DOM nodes that represent
  // specific stretches of text, and is used by the measuring code.
  // The returned object contains the DOM node, this map, and
  // information about line-wide styles that were set by the mode.


  function buildLineContent(cm, lineView) {
    // The padding-right forces the element to have a 'border', which
    // is needed on Webkit to be able to get line-level bounding
    // rectangles for it (in measureChar).
    var content = eltP("span", null, null, webkit ? "padding-right: .1px" : null);
    var builder = {
      pre: eltP("pre", [content], "CodeMirror-line"),
      content: content,
      col: 0,
      pos: 0,
      cm: cm,
      trailingSpace: false,
      splitSpaces: cm.getOption("lineWrapping")
    };
    lineView.measure = {}; // Iterate over the logical lines that make up this visual line.

    for (var i = 0; i <= (lineView.rest ? lineView.rest.length : 0); i++) {
      var line = i ? lineView.rest[i - 1] : lineView.line,
          order = void 0;
      builder.pos = 0;
      builder.addToken = buildToken; // Optionally wire in some hacks into the token-rendering
      // algorithm, to deal with browser quirks.

      if (hasBadBidiRects(cm.display.measure) && (order = getOrder(line, cm.doc.direction))) {
        builder.addToken = buildTokenBadBidi(builder.addToken, order);
      }

      builder.map = [];
      var allowFrontierUpdate = lineView != cm.display.externalMeasured && lineNo(line);
      insertLineContent(line, builder, getLineStyles(cm, line, allowFrontierUpdate));

      if (line.styleClasses) {
        if (line.styleClasses.bgClass) {
          builder.bgClass = joinClasses(line.styleClasses.bgClass, builder.bgClass || "");
        }

        if (line.styleClasses.textClass) {
          builder.textClass = joinClasses(line.styleClasses.textClass, builder.textClass || "");
        }
      } // Ensure at least a single node is present, for measuring.


      if (builder.map.length == 0) {
        builder.map.push(0, 0, builder.content.appendChild(zeroWidthElement(cm.display.measure)));
      } // Store the map and a cache object for the current logical line


      if (i == 0) {
        lineView.measure.map = builder.map;
        lineView.measure.cache = {};
      } else {
        (lineView.measure.maps || (lineView.measure.maps = [])).push(builder.map);
        (lineView.measure.caches || (lineView.measure.caches = [])).push({});
      }
    } // See issue #2901


    if (webkit) {
      var last = builder.content.lastChild;

      if (/\bcm-tab\b/.test(last.className) || last.querySelector && last.querySelector(".cm-tab")) {
        builder.content.className = "cm-tab-wrap-hack";
      }
    }

    signal(cm, "renderLine", cm, lineView.line, builder.pre);

    if (builder.pre.className) {
      builder.textClass = joinClasses(builder.pre.className, builder.textClass || "");
    }

    return builder;
  }

  function defaultSpecialCharPlaceholder(ch) {
    var token = elt("span", "\u2022", "cm-invalidchar");
    token.title = "\\u" + ch.charCodeAt(0).toString(16);
    token.setAttribute("aria-label", token.title);
    return token;
  } // Build up the DOM representation for a single token, and add it to
  // the line map. Takes care to render special characters separately.


  function buildToken(builder, text, style, startStyle, endStyle, css, attributes) {
    if (!text) {
      return;
    }

    var displayText = builder.splitSpaces ? splitSpaces(text, builder.trailingSpace) : text;
    var special = builder.cm.state.specialChars,
        mustWrap = false;
    var content;

    if (!special.test(text)) {
      builder.col += text.length;
      content = document.createTextNode(displayText);
      builder.map.push(builder.pos, builder.pos + text.length, content);

      if (ie && ie_version < 9) {
        mustWrap = true;
      }

      builder.pos += text.length;
    } else {
      content = document.createDocumentFragment();
      var pos = 0;

      while (true) {
        special.lastIndex = pos;
        var m = special.exec(text);
        var skipped = m ? m.index - pos : text.length - pos;

        if (skipped) {
          var txt = document.createTextNode(displayText.slice(pos, pos + skipped));

          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt]));
          } else {
            content.appendChild(txt);
          }

          builder.map.push(builder.pos, builder.pos + skipped, txt);
          builder.col += skipped;
          builder.pos += skipped;
        }

        if (!m) {
          break;
        }

        pos += skipped + 1;
        var txt$1 = void 0;

        if (m[0] == "\t") {
          var tabSize = builder.cm.options.tabSize,
              tabWidth = tabSize - builder.col % tabSize;
          txt$1 = content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
          txt$1.setAttribute("role", "presentation");
          txt$1.setAttribute("cm-text", "\t");
          builder.col += tabWidth;
        } else if (m[0] == "\r" || m[0] == "\n") {
          txt$1 = content.appendChild(elt("span", m[0] == "\r" ? "\u240D" : "\u2424", "cm-invalidchar"));
          txt$1.setAttribute("cm-text", m[0]);
          builder.col += 1;
        } else {
          txt$1 = builder.cm.options.specialCharPlaceholder(m[0]);
          txt$1.setAttribute("cm-text", m[0]);

          if (ie && ie_version < 9) {
            content.appendChild(elt("span", [txt$1]));
          } else {
            content.appendChild(txt$1);
          }

          builder.col += 1;
        }

        builder.map.push(builder.pos, builder.pos + 1, txt$1);
        builder.pos++;
      }
    }

    builder.trailingSpace = displayText.charCodeAt(text.length - 1) == 32;

    if (style || startStyle || endStyle || mustWrap || css) {
      var fullStyle = style || "";

      if (startStyle) {
        fullStyle += startStyle;
      }

      if (endStyle) {
        fullStyle += endStyle;
      }

      var token = elt("span", [content], fullStyle, css);

      if (attributes) {
        for (var attr in attributes) {
          if (attributes.hasOwnProperty(attr) && attr != "style" && attr != "class") {
            token.setAttribute(attr, attributes[attr]);
          }
        }
      }

      return builder.content.appendChild(token);
    }

    builder.content.appendChild(content);
  } // Change some spaces to NBSP to prevent the browser from collapsing
  // trailing spaces at the end of a line when rendering text (issue #1362).


  function splitSpaces(text, trailingBefore) {
    if (text.length > 1 && !/  /.test(text)) {
      return text;
    }

    var spaceBefore = trailingBefore,
        result = "";

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);

      if (ch == " " && spaceBefore && (i == text.length - 1 || text.charCodeAt(i + 1) == 32)) {
        ch = "\xA0";
      }

      result += ch;
      spaceBefore = ch == " ";
    }

    return result;
  } // Work around nonsense dimensions being reported for stretches of
  // right-to-left text.


  function buildTokenBadBidi(inner, order) {
    return function (builder, text, style, startStyle, endStyle, css, attributes) {
      style = style ? style + " cm-force-border" : "cm-force-border";
      var start = builder.pos,
          end = start + text.length;

      for (;;) {
        // Find the part that overlaps with the start of this text
        var part = void 0;

        for (var i = 0; i < order.length; i++) {
          part = order[i];

          if (part.to > start && part.from <= start) {
            break;
          }
        }

        if (part.to >= end) {
          return inner(builder, text, style, startStyle, endStyle, css, attributes);
        }

        inner(builder, text.slice(0, part.to - start), style, startStyle, null, css, attributes);
        startStyle = null;
        text = text.slice(part.to - start);
        start = part.to;
      }
    };
  }

  function buildCollapsedSpan(builder, size, marker, ignoreWidget) {
    var widget = !ignoreWidget && marker.widgetNode;

    if (widget) {
      builder.map.push(builder.pos, builder.pos + size, widget);
    }

    if (!ignoreWidget && builder.cm.display.input.needsContentAttribute) {
      if (!widget) {
        widget = builder.content.appendChild(document.createElement("span"));
      }

      widget.setAttribute("cm-marker", marker.id);
    }

    if (widget) {
      builder.cm.display.input.setUneditable(widget);
      builder.content.appendChild(widget);
    }

    builder.pos += size;
    builder.trailingSpace = false;
  } // Outputs a number of spans to make up a line, taking highlighting
  // and marked text into account.


  function insertLineContent(line, builder, styles) {
    var spans = line.markedSpans,
        allText = line.text,
        at = 0;

    if (!spans) {
      for (var i$1 = 1; i$1 < styles.length; i$1 += 2) {
        builder.addToken(builder, allText.slice(at, at = styles[i$1]), interpretTokenStyle(styles[i$1 + 1], builder.cm.options));
      }

      return;
    }

    var len = allText.length,
        pos = 0,
        i = 1,
        text = "",
        style,
        css;
    var nextChange = 0,
        spanStyle,
        spanEndStyle,
        spanStartStyle,
        collapsed,
        attributes;

    for (;;) {
      if (nextChange == pos) {
        // Update current marker set
        spanStyle = spanEndStyle = spanStartStyle = css = "";
        attributes = null;
        collapsed = null;
        nextChange = Infinity;
        var foundBookmarks = [],
            endStyles = void 0;

        for (var j = 0; j < spans.length; ++j) {
          var sp = spans[j],
              m = sp.marker;

          if (m.type == "bookmark" && sp.from == pos && m.widgetNode) {
            foundBookmarks.push(m);
          } else if (sp.from <= pos && (sp.to == null || sp.to > pos || m.collapsed && sp.to == pos && sp.from == pos)) {
            if (sp.to != null && sp.to != pos && nextChange > sp.to) {
              nextChange = sp.to;
              spanEndStyle = "";
            }

            if (m.className) {
              spanStyle += " " + m.className;
            }

            if (m.css) {
              css = (css ? css + ";" : "") + m.css;
            }

            if (m.startStyle && sp.from == pos) {
              spanStartStyle += " " + m.startStyle;
            }

            if (m.endStyle && sp.to == nextChange) {
              (endStyles || (endStyles = [])).push(m.endStyle, sp.to);
            } // support for the old title property
            // https://github.com/codemirror/CodeMirror/pull/5673


            if (m.title) {
              (attributes || (attributes = {})).title = m.title;
            }

            if (m.attributes) {
              for (var attr in m.attributes) {
                (attributes || (attributes = {}))[attr] = m.attributes[attr];
              }
            }

            if (m.collapsed && (!collapsed || compareCollapsedMarkers(collapsed.marker, m) < 0)) {
              collapsed = sp;
            }
          } else if (sp.from > pos && nextChange > sp.from) {
            nextChange = sp.from;
          }
        }

        if (endStyles) {
          for (var j$1 = 0; j$1 < endStyles.length; j$1 += 2) {
            if (endStyles[j$1 + 1] == nextChange) {
              spanEndStyle += " " + endStyles[j$1];
            }
          }
        }

        if (!collapsed || collapsed.from == pos) {
          for (var j$2 = 0; j$2 < foundBookmarks.length; ++j$2) {
            buildCollapsedSpan(builder, 0, foundBookmarks[j$2]);
          }
        }

        if (collapsed && (collapsed.from || 0) == pos) {
          buildCollapsedSpan(builder, (collapsed.to == null ? len + 1 : collapsed.to) - pos, collapsed.marker, collapsed.from == null);

          if (collapsed.to == null) {
            return;
          }

          if (collapsed.to == pos) {
            collapsed = false;
          }
        }
      }

      if (pos >= len) {
        break;
      }

      var upto = Math.min(len, nextChange);

      while (true) {
        if (text) {
          var end = pos + text.length;

          if (!collapsed) {
            var tokenText = end > upto ? text.slice(0, upto - pos) : text;
            builder.addToken(builder, tokenText, style ? style + spanStyle : spanStyle, spanStartStyle, pos + tokenText.length == nextChange ? spanEndStyle : "", css, attributes);
          }

          if (end >= upto) {
            text = text.slice(upto - pos);
            pos = upto;
            break;
          }

          pos = end;
          spanStartStyle = "";
        }

        text = allText.slice(at, at = styles[i++]);
        style = interpretTokenStyle(styles[i++], builder.cm.options);
      }
    }
  } // These objects are used to represent the visible (currently drawn)
  // part of the document. A LineView may correspond to multiple
  // logical lines, if those are connected by collapsed ranges.


  function LineView(doc, line, lineN) {
    // The starting line
    this.line = line; // Continuing lines, if any

    this.rest = visualLineContinued(line); // Number of logical lines in this visual line

    this.size = this.rest ? lineNo(lst(this.rest)) - lineN + 1 : 1;
    this.node = this.text = null;
    this.hidden = lineIsHidden(doc, line);
  } // Create a range of LineView objects for the given lines.


  function buildViewArray(cm, from, to) {
    var array = [],
        nextPos;

    for (var pos = from; pos < to; pos = nextPos) {
      var view = new LineView(cm.doc, getLine(cm.doc, pos), pos);
      nextPos = pos + view.size;
      array.push(view);
    }

    return array;
  }

  var operationGroup = null;

  function pushOperation(op) {
    if (operationGroup) {
      operationGroup.ops.push(op);
    } else {
      op.ownsGroup = operationGroup = {
        ops: [op],
        delayedCallbacks: []
      };
    }
  }

  function fireCallbacksForOps(group) {
    // Calls delayed callbacks and cursorActivity handlers until no
    // new ones appear
    var callbacks = group.delayedCallbacks,
        i = 0;

    do {
      for (; i < callbacks.length; i++) {
        callbacks[i].call(null);
      }

      for (var j = 0; j < group.ops.length; j++) {
        var op = group.ops[j];

        if (op.cursorActivityHandlers) {
          while (op.cursorActivityCalled < op.cursorActivityHandlers.length) {
            op.cursorActivityHandlers[op.cursorActivityCalled++].call(null, op.cm);
          }
        }
      }
    } while (i < callbacks.length);
  }

  function finishOperation(op, endCb) {
    var group = op.ownsGroup;

    if (!group) {
      return;
    }

    try {
      fireCallbacksForOps(group);
    } finally {
      operationGroup = null;
      endCb(group);
    }
  }

  var orphanDelayedCallbacks = null; // Often, we want to signal events at a point where we are in the
  // middle of some work, but don't want the handler to start calling
  // other methods on the editor, which might be in an inconsistent
  // state or simply not expect any other events to happen.
  // signalLater looks whether there are any handlers, and schedules
  // them to be executed when the last operation ends, or, if no
  // operation is active, when a timeout fires.

  function signalLater(emitter, type
  /*, values...*/
  ) {
    var arr = getHandlers(emitter, type);

    if (!arr.length) {
      return;
    }

    var args = Array.prototype.slice.call(arguments, 2),
        list;

    if (operationGroup) {
      list = operationGroup.delayedCallbacks;
    } else if (orphanDelayedCallbacks) {
      list = orphanDelayedCallbacks;
    } else {
      list = orphanDelayedCallbacks = [];
      setTimeout(fireOrphanDelayed, 0);
    }

    var loop = function loop(i) {
      list.push(function () {
        return arr[i].apply(null, args);
      });
    };

    for (var i = 0; i < arr.length; ++i) {
      loop(i);
    }
  }

  function fireOrphanDelayed() {
    var delayed = orphanDelayedCallbacks;
    orphanDelayedCallbacks = null;

    for (var i = 0; i < delayed.length; ++i) {
      delayed[i]();
    }
  } // When an aspect of a line changes, a string is added to
  // lineView.changes. This updates the relevant part of the line's
  // DOM structure.


  function updateLineForChanges(cm, lineView, lineN, dims) {
    for (var j = 0; j < lineView.changes.length; j++) {
      var type = lineView.changes[j];

      if (type == "text") {
        updateLineText(cm, lineView);
      } else if (type == "gutter") {
        updateLineGutter(cm, lineView, lineN, dims);
      } else if (type == "class") {
        updateLineClasses(cm, lineView);
      } else if (type == "widget") {
        updateLineWidgets(cm, lineView, dims);
      }
    }

    lineView.changes = null;
  } // Lines with gutter elements, widgets or a background class need to
  // be wrapped, and have the extra elements added to the wrapper div


  function ensureLineWrapped(lineView) {
    if (lineView.node == lineView.text) {
      lineView.node = elt("div", null, null, "position: relative");

      if (lineView.text.parentNode) {
        lineView.text.parentNode.replaceChild(lineView.node, lineView.text);
      }

      lineView.node.appendChild(lineView.text);

      if (ie && ie_version < 8) {
        lineView.node.style.zIndex = 2;
      }
    }

    return lineView.node;
  }

  function updateLineBackground(cm, lineView) {
    var cls = lineView.bgClass ? lineView.bgClass + " " + (lineView.line.bgClass || "") : lineView.line.bgClass;

    if (cls) {
      cls += " CodeMirror-linebackground";
    }

    if (lineView.background) {
      if (cls) {
        lineView.background.className = cls;
      } else {
        lineView.background.parentNode.removeChild(lineView.background);
        lineView.background = null;
      }
    } else if (cls) {
      var wrap = ensureLineWrapped(lineView);
      lineView.background = wrap.insertBefore(elt("div", null, cls), wrap.firstChild);
      cm.display.input.setUneditable(lineView.background);
    }
  } // Wrapper around buildLineContent which will reuse the structure
  // in display.externalMeasured when possible.


  function getLineContent(cm, lineView) {
    var ext = cm.display.externalMeasured;

    if (ext && ext.line == lineView.line) {
      cm.display.externalMeasured = null;
      lineView.measure = ext.measure;
      return ext.built;
    }

    return buildLineContent(cm, lineView);
  } // Redraw the line's text. Interacts with the background and text
  // classes because the mode may output tokens that influence these
  // classes.


  function updateLineText(cm, lineView) {
    var cls = lineView.text.className;
    var built = getLineContent(cm, lineView);

    if (lineView.text == lineView.node) {
      lineView.node = built.pre;
    }

    lineView.text.parentNode.replaceChild(built.pre, lineView.text);
    lineView.text = built.pre;

    if (built.bgClass != lineView.bgClass || built.textClass != lineView.textClass) {
      lineView.bgClass = built.bgClass;
      lineView.textClass = built.textClass;
      updateLineClasses(cm, lineView);
    } else if (cls) {
      lineView.text.className = cls;
    }
  }

  function updateLineClasses(cm, lineView) {
    updateLineBackground(cm, lineView);

    if (lineView.line.wrapClass) {
      ensureLineWrapped(lineView).className = lineView.line.wrapClass;
    } else if (lineView.node != lineView.text) {
      lineView.node.className = "";
    }

    var textClass = lineView.textClass ? lineView.textClass + " " + (lineView.line.textClass || "") : lineView.line.textClass;
    lineView.text.className = textClass || "";
  }

  function updateLineGutter(cm, lineView, lineN, dims) {
    if (lineView.gutter) {
      lineView.node.removeChild(lineView.gutter);
      lineView.gutter = null;
    }

    if (lineView.gutterBackground) {
      lineView.node.removeChild(lineView.gutterBackground);
      lineView.gutterBackground = null;
    }

    if (lineView.line.gutterClass) {
      var wrap = ensureLineWrapped(lineView);
      lineView.gutterBackground = elt("div", null, "CodeMirror-gutter-background " + lineView.line.gutterClass, "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px; width: " + dims.gutterTotalWidth + "px");
      cm.display.input.setUneditable(lineView.gutterBackground);
      wrap.insertBefore(lineView.gutterBackground, lineView.text);
    }

    var markers = lineView.line.gutterMarkers;

    if (cm.options.lineNumbers || markers) {
      var wrap$1 = ensureLineWrapped(lineView);
      var gutterWrap = lineView.gutter = elt("div", null, "CodeMirror-gutter-wrapper", "left: " + (cm.options.fixedGutter ? dims.fixedPos : -dims.gutterTotalWidth) + "px");
      cm.display.input.setUneditable(gutterWrap);
      wrap$1.insertBefore(gutterWrap, lineView.text);

      if (lineView.line.gutterClass) {
        gutterWrap.className += " " + lineView.line.gutterClass;
      }

      if (cm.options.lineNumbers && (!markers || !markers["CodeMirror-linenumbers"])) {
        lineView.lineNumber = gutterWrap.appendChild(elt("div", lineNumberFor(cm.options, lineN), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + dims.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + cm.display.lineNumInnerWidth + "px"));
      }

      if (markers) {
        for (var k = 0; k < cm.display.gutterSpecs.length; ++k) {
          var id = cm.display.gutterSpecs[k].className,
              found = markers.hasOwnProperty(id) && markers[id];

          if (found) {
            gutterWrap.appendChild(elt("div", [found], "CodeMirror-gutter-elt", "left: " + dims.gutterLeft[id] + "px; width: " + dims.gutterWidth[id] + "px"));
          }
        }
      }
    }
  }

  function updateLineWidgets(cm, lineView, dims) {
    if (lineView.alignable) {
      lineView.alignable = null;
    }

    for (var node = lineView.node.firstChild, next = void 0; node; node = next) {
      next = node.nextSibling;

      if (node.className == "CodeMirror-linewidget") {
        lineView.node.removeChild(node);
      }
    }

    insertLineWidgets(cm, lineView, dims);
  } // Build a line's DOM representation from scratch


  function buildLineElement(cm, lineView, lineN, dims) {
    var built = getLineContent(cm, lineView);
    lineView.text = lineView.node = built.pre;

    if (built.bgClass) {
      lineView.bgClass = built.bgClass;
    }

    if (built.textClass) {
      lineView.textClass = built.textClass;
    }

    updateLineClasses(cm, lineView);
    updateLineGutter(cm, lineView, lineN, dims);
    insertLineWidgets(cm, lineView, dims);
    return lineView.node;
  } // A lineView may contain multiple logical lines (when merged by
  // collapsed spans). The widgets for all of them need to be drawn.


  function insertLineWidgets(cm, lineView, dims) {
    insertLineWidgetsFor(cm, lineView.line, lineView, dims, true);

    if (lineView.rest) {
      for (var i = 0; i < lineView.rest.length; i++) {
        insertLineWidgetsFor(cm, lineView.rest[i], lineView, dims, false);
      }
    }
  }

  function insertLineWidgetsFor(cm, line, lineView, dims, allowAbove) {
    if (!line.widgets) {
      return;
    }

    var wrap = ensureLineWrapped(lineView);

    for (var i = 0, ws = line.widgets; i < ws.length; ++i) {
      var widget = ws[i],
          node = elt("div", [widget.node], "CodeMirror-linewidget");

      if (!widget.handleMouseEvents) {
        node.setAttribute("cm-ignore-events", "true");
      }

      positionLineWidget(widget, node, lineView, dims);
      cm.display.input.setUneditable(node);

      if (allowAbove && widget.above) {
        wrap.insertBefore(node, lineView.gutter || lineView.text);
      } else {
        wrap.appendChild(node);
      }

      signalLater(widget, "redraw");
    }
  }

  function positionLineWidget(widget, node, lineView, dims) {
    if (widget.noHScroll) {
      (lineView.alignable || (lineView.alignable = [])).push(node);
      var width = dims.wrapperWidth;
      node.style.left = dims.fixedPos + "px";

      if (!widget.coverGutter) {
        width -= dims.gutterTotalWidth;
        node.style.paddingLeft = dims.gutterTotalWidth + "px";
      }

      node.style.width = width + "px";
    }

    if (widget.coverGutter) {
      node.style.zIndex = 5;
      node.style.position = "relative";

      if (!widget.noHScroll) {
        node.style.marginLeft = -dims.gutterTotalWidth + "px";
      }
    }
  }

  function widgetHeight(widget) {
    if (widget.height != null) {
      return widget.height;
    }

    var cm = widget.doc.cm;

    if (!cm) {
      return 0;
    }

    if (!contains(document.body, widget.node)) {
      var parentStyle = "position: relative;";

      if (widget.coverGutter) {
        parentStyle += "margin-left: -" + cm.display.gutters.offsetWidth + "px;";
      }

      if (widget.noHScroll) {
        parentStyle += "width: " + cm.display.wrapper.clientWidth + "px;";
      }

      removeChildrenAndAdd(cm.display.measure, elt("div", [widget.node], null, parentStyle));
    }

    return widget.height = widget.node.parentNode.offsetHeight;
  } // Return true when the given mouse event happened in a widget


  function eventInWidget(display, e) {
    for (var n = e_target(e); n != display.wrapper; n = n.parentNode) {
      if (!n || n.nodeType == 1 && n.getAttribute("cm-ignore-events") == "true" || n.parentNode == display.sizer && n != display.mover) {
        return true;
      }
    }
  } // POSITION MEASUREMENT


  function paddingTop(display) {
    return display.lineSpace.offsetTop;
  }

  function paddingVert(display) {
    return display.mover.offsetHeight - display.lineSpace.offsetHeight;
  }

  function paddingH(display) {
    if (display.cachedPaddingH) {
      return display.cachedPaddingH;
    }

    var e = removeChildrenAndAdd(display.measure, elt("pre", "x", "CodeMirror-line-like"));
    var style = window.getComputedStyle ? window.getComputedStyle(e) : e.currentStyle;
    var data = {
      left: parseInt(style.paddingLeft),
      right: parseInt(style.paddingRight)
    };

    if (!isNaN(data.left) && !isNaN(data.right)) {
      display.cachedPaddingH = data;
    }

    return data;
  }

  function scrollGap(cm) {
    return scrollerGap - cm.display.nativeBarWidth;
  }

  function displayWidth(cm) {
    return cm.display.scroller.clientWidth - scrollGap(cm) - cm.display.barWidth;
  }

  function displayHeight(cm) {
    return cm.display.scroller.clientHeight - scrollGap(cm) - cm.display.barHeight;
  } // Ensure the lineView.wrapping.heights array is populated. This is
  // an array of bottom offsets for the lines that make up a drawn
  // line. When lineWrapping is on, there might be more than one
  // height.


  function ensureLineHeights(cm, lineView, rect) {
    var wrapping = cm.options.lineWrapping;
    var curWidth = wrapping && displayWidth(cm);

    if (!lineView.measure.heights || wrapping && lineView.measure.width != curWidth) {
      var heights = lineView.measure.heights = [];

      if (wrapping) {
        lineView.measure.width = curWidth;
        var rects = lineView.text.firstChild.getClientRects();

        for (var i = 0; i < rects.length - 1; i++) {
          var cur = rects[i],
              next = rects[i + 1];

          if (Math.abs(cur.bottom - next.bottom) > 2) {
            heights.push((cur.bottom + next.top) / 2 - rect.top);
          }
        }
      }

      heights.push(rect.bottom - rect.top);
    }
  } // Find a line map (mapping character offsets to text nodes) and a
  // measurement cache for the given line number. (A line view might
  // contain multiple lines when collapsed ranges are present.)


  function mapFromLineView(lineView, line, lineN) {
    if (lineView.line == line) {
      return {
        map: lineView.measure.map,
        cache: lineView.measure.cache
      };
    }

    for (var i = 0; i < lineView.rest.length; i++) {
      if (lineView.rest[i] == line) {
        return {
          map: lineView.measure.maps[i],
          cache: lineView.measure.caches[i]
        };
      }
    }

    for (var i$1 = 0; i$1 < lineView.rest.length; i$1++) {
      if (lineNo(lineView.rest[i$1]) > lineN) {
        return {
          map: lineView.measure.maps[i$1],
          cache: lineView.measure.caches[i$1],
          before: true
        };
      }
    }
  } // Render a line into the hidden node display.externalMeasured. Used
  // when measurement is needed for a line that's not in the viewport.


  function updateExternalMeasurement(cm, line) {
    line = visualLine(line);
    var lineN = lineNo(line);
    var view = cm.display.externalMeasured = new LineView(cm.doc, line, lineN);
    view.lineN = lineN;
    var built = view.built = buildLineContent(cm, view);
    view.text = built.pre;
    removeChildrenAndAdd(cm.display.lineMeasure, built.pre);
    return view;
  } // Get a {top, bottom, left, right} box (in line-local coordinates)
  // for a given character.


  function measureChar(cm, line, ch, bias) {
    return measureCharPrepared(cm, prepareMeasureForLine(cm, line), ch, bias);
  } // Find a line view that corresponds to the given line number.


  function findViewForLine(cm, lineN) {
    if (lineN >= cm.display.viewFrom && lineN < cm.display.viewTo) {
      return cm.display.view[findViewIndex(cm, lineN)];
    }

    var ext = cm.display.externalMeasured;

    if (ext && lineN >= ext.lineN && lineN < ext.lineN + ext.size) {
      return ext;
    }
  } // Measurement can be split in two steps, the set-up work that
  // applies to the whole line, and the measurement of the actual
  // character. Functions like coordsChar, that need to do a lot of
  // measurements in a row, can thus ensure that the set-up work is
  // only done once.


  function prepareMeasureForLine(cm, line) {
    var lineN = lineNo(line);
    var view = findViewForLine(cm, lineN);

    if (view && !view.text) {
      view = null;
    } else if (view && view.changes) {
      updateLineForChanges(cm, view, lineN, getDimensions(cm));
      cm.curOp.forceUpdate = true;
    }

    if (!view) {
      view = updateExternalMeasurement(cm, line);
    }

    var info = mapFromLineView(view, line, lineN);
    return {
      line: line,
      view: view,
      rect: null,
      map: info.map,
      cache: info.cache,
      before: info.before,
      hasHeights: false
    };
  } // Given a prepared measurement object, measures the position of an
  // actual character (or fetches it from the cache).


  function measureCharPrepared(cm, prepared, ch, bias, varHeight) {
    if (prepared.before) {
      ch = -1;
    }

    var key = ch + (bias || ""),
        found;

    if (prepared.cache.hasOwnProperty(key)) {
      found = prepared.cache[key];
    } else {
      if (!prepared.rect) {
        prepared.rect = prepared.view.text.getBoundingClientRect();
      }

      if (!prepared.hasHeights) {
        ensureLineHeights(cm, prepared.view, prepared.rect);
        prepared.hasHeights = true;
      }

      found = measureCharInner(cm, prepared, ch, bias);

      if (!found.bogus) {
        prepared.cache[key] = found;
      }
    }

    return {
      left: found.left,
      right: found.right,
      top: varHeight ? found.rtop : found.top,
      bottom: varHeight ? found.rbottom : found.bottom
    };
  }

  var nullRect = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };

  function nodeAndOffsetInLineMap(map$$1, ch, bias) {
    var node, start, end, collapse, mStart, mEnd; // First, search the line map for the text node corresponding to,
    // or closest to, the target character.

    for (var i = 0; i < map$$1.length; i += 3) {
      mStart = map$$1[i];
      mEnd = map$$1[i + 1];

      if (ch < mStart) {
        start = 0;
        end = 1;
        collapse = "left";
      } else if (ch < mEnd) {
        start = ch - mStart;
        end = start + 1;
      } else if (i == map$$1.length - 3 || ch == mEnd && map$$1[i + 3] > ch) {
        end = mEnd - mStart;
        start = end - 1;

        if (ch >= mEnd) {
          collapse = "right";
        }
      }

      if (start != null) {
        node = map$$1[i + 2];

        if (mStart == mEnd && bias == (node.insertLeft ? "left" : "right")) {
          collapse = bias;
        }

        if (bias == "left" && start == 0) {
          while (i && map$$1[i - 2] == map$$1[i - 3] && map$$1[i - 1].insertLeft) {
            node = map$$1[(i -= 3) + 2];
            collapse = "left";
          }
        }

        if (bias == "right" && start == mEnd - mStart) {
          while (i < map$$1.length - 3 && map$$1[i + 3] == map$$1[i + 4] && !map$$1[i + 5].insertLeft) {
            node = map$$1[(i += 3) + 2];
            collapse = "right";
          }
        }

        break;
      }
    }

    return {
      node: node,
      start: start,
      end: end,
      collapse: collapse,
      coverStart: mStart,
      coverEnd: mEnd
    };
  }

  function getUsefulRect(rects, bias) {
    var rect = nullRect;

    if (bias == "left") {
      for (var i = 0; i < rects.length; i++) {
        if ((rect = rects[i]).left != rect.right) {
          break;
        }
      }
    } else {
      for (var i$1 = rects.length - 1; i$1 >= 0; i$1--) {
        if ((rect = rects[i$1]).left != rect.right) {
          break;
        }
      }
    }

    return rect;
  }

  function measureCharInner(cm, prepared, ch, bias) {
    var place = nodeAndOffsetInLineMap(prepared.map, ch, bias);
    var node = place.node,
        start = place.start,
        end = place.end,
        collapse = place.collapse;
    var rect;

    if (node.nodeType == 3) {
      // If it is a text node, use a range to retrieve the coordinates.
      for (var i$1 = 0; i$1 < 4; i$1++) {
        // Retry a maximum of 4 times when nonsense rectangles are returned
        while (start && isExtendingChar(prepared.line.text.charAt(place.coverStart + start))) {
          --start;
        }

        while (place.coverStart + end < place.coverEnd && isExtendingChar(prepared.line.text.charAt(place.coverStart + end))) {
          ++end;
        }

        if (ie && ie_version < 9 && start == 0 && end == place.coverEnd - place.coverStart) {
          rect = node.parentNode.getBoundingClientRect();
        } else {
          rect = getUsefulRect(range(node, start, end).getClientRects(), bias);
        }

        if (rect.left || rect.right || start == 0) {
          break;
        }

        end = start;
        start = start - 1;
        collapse = "right";
      }

      if (ie && ie_version < 11) {
        rect = maybeUpdateRectForZooming(cm.display.measure, rect);
      }
    } else {
      // If it is a widget, simply get the box for the whole widget.
      if (start > 0) {
        collapse = bias = "right";
      }

      var rects;

      if (cm.options.lineWrapping && (rects = node.getClientRects()).length > 1) {
        rect = rects[bias == "right" ? rects.length - 1 : 0];
      } else {
        rect = node.getBoundingClientRect();
      }
    }

    if (ie && ie_version < 9 && !start && (!rect || !rect.left && !rect.right)) {
      var rSpan = node.parentNode.getClientRects()[0];

      if (rSpan) {
        rect = {
          left: rSpan.left,
          right: rSpan.left + charWidth(cm.display),
          top: rSpan.top,
          bottom: rSpan.bottom
        };
      } else {
        rect = nullRect;
      }
    }

    var rtop = rect.top - prepared.rect.top,
        rbot = rect.bottom - prepared.rect.top;
    var mid = (rtop + rbot) / 2;
    var heights = prepared.view.measure.heights;
    var i = 0;

    for (; i < heights.length - 1; i++) {
      if (mid < heights[i]) {
        break;
      }
    }

    var top = i ? heights[i - 1] : 0,
        bot = heights[i];
    var result = {
      left: (collapse == "right" ? rect.right : rect.left) - prepared.rect.left,
      right: (collapse == "left" ? rect.left : rect.right) - prepared.rect.left,
      top: top,
      bottom: bot
    };

    if (!rect.left && !rect.right) {
      result.bogus = true;
    }

    if (!cm.options.singleCursorHeightPerLine) {
      result.rtop = rtop;
      result.rbottom = rbot;
    }

    return result;
  } // Work around problem with bounding client rects on ranges being
  // returned incorrectly when zoomed on IE10 and below.


  function maybeUpdateRectForZooming(measure, rect) {
    if (!window.screen || screen.logicalXDPI == null || screen.logicalXDPI == screen.deviceXDPI || !hasBadZoomedRects(measure)) {
      return rect;
    }

    var scaleX = screen.logicalXDPI / screen.deviceXDPI;
    var scaleY = screen.logicalYDPI / screen.deviceYDPI;
    return {
      left: rect.left * scaleX,
      right: rect.right * scaleX,
      top: rect.top * scaleY,
      bottom: rect.bottom * scaleY
    };
  }

  function clearLineMeasurementCacheFor(lineView) {
    if (lineView.measure) {
      lineView.measure.cache = {};
      lineView.measure.heights = null;

      if (lineView.rest) {
        for (var i = 0; i < lineView.rest.length; i++) {
          lineView.measure.caches[i] = {};
        }
      }
    }
  }

  function clearLineMeasurementCache(cm) {
    cm.display.externalMeasure = null;
    removeChildren(cm.display.lineMeasure);

    for (var i = 0; i < cm.display.view.length; i++) {
      clearLineMeasurementCacheFor(cm.display.view[i]);
    }
  }

  function clearCaches(cm) {
    clearLineMeasurementCache(cm);
    cm.display.cachedCharWidth = cm.display.cachedTextHeight = cm.display.cachedPaddingH = null;

    if (!cm.options.lineWrapping) {
      cm.display.maxLineChanged = true;
    }

    cm.display.lineNumChars = null;
  }

  function pageScrollX() {
    // Work around https://bugs.chromium.org/p/chromium/issues/detail?id=489206
    // which causes page_Offset and bounding client rects to use
    // different reference viewports and invalidate our calculations.
    if (chrome && android) {
      return -(document.body.getBoundingClientRect().left - parseInt(getComputedStyle(document.body).marginLeft));
    }

    return window.pageXOffset || (document.documentElement || document.body).scrollLeft;
  }

  function pageScrollY() {
    if (chrome && android) {
      return -(document.body.getBoundingClientRect().top - parseInt(getComputedStyle(document.body).marginTop));
    }

    return window.pageYOffset || (document.documentElement || document.body).scrollTop;
  }

  function widgetTopHeight(lineObj) {
    var height = 0;

    if (lineObj.widgets) {
      for (var i = 0; i < lineObj.widgets.length; ++i) {
        if (lineObj.widgets[i].above) {
          height += widgetHeight(lineObj.widgets[i]);
        }
      }
    }

    return height;
  } // Converts a {top, bottom, left, right} box from line-local
  // coordinates into another coordinate system. Context may be one of
  // "line", "div" (display.lineDiv), "local"./null (editor), "window",
  // or "page".


  function intoCoordSystem(cm, lineObj, rect, context, includeWidgets) {
    if (!includeWidgets) {
      var height = widgetTopHeight(lineObj);
      rect.top += height;
      rect.bottom += height;
    }

    if (context == "line") {
      return rect;
    }

    if (!context) {
      context = "local";
    }

    var yOff = _heightAtLine(lineObj);

    if (context == "local") {
      yOff += paddingTop(cm.display);
    } else {
      yOff -= cm.display.viewOffset;
    }

    if (context == "page" || context == "window") {
      var lOff = cm.display.lineSpace.getBoundingClientRect();
      yOff += lOff.top + (context == "window" ? 0 : pageScrollY());
      var xOff = lOff.left + (context == "window" ? 0 : pageScrollX());
      rect.left += xOff;
      rect.right += xOff;
    }

    rect.top += yOff;
    rect.bottom += yOff;
    return rect;
  } // Coverts a box from "div" coords to another coordinate system.
  // Context may be "window", "page", "div", or "local"./null.


  function fromCoordSystem(cm, coords, context) {
    if (context == "div") {
      return coords;
    }

    var left = coords.left,
        top = coords.top; // First move into "page" coordinate system

    if (context == "page") {
      left -= pageScrollX();
      top -= pageScrollY();
    } else if (context == "local" || !context) {
      var localBox = cm.display.sizer.getBoundingClientRect();
      left += localBox.left;
      top += localBox.top;
    }

    var lineSpaceBox = cm.display.lineSpace.getBoundingClientRect();
    return {
      left: left - lineSpaceBox.left,
      top: top - lineSpaceBox.top
    };
  }

  function _charCoords(cm, pos, context, lineObj, bias) {
    if (!lineObj) {
      lineObj = getLine(cm.doc, pos.line);
    }

    return intoCoordSystem(cm, lineObj, measureChar(cm, lineObj, pos.ch, bias), context);
  } // Returns a box for a given cursor position, which may have an
  // 'other' property containing the position of the secondary cursor
  // on a bidi boundary.
  // A cursor Pos(line, char, "before") is on the same visual line as `char - 1`
  // and after `char - 1` in writing order of `char - 1`
  // A cursor Pos(line, char, "after") is on the same visual line as `char`
  // and before `char` in writing order of `char`
  // Examples (upper-case letters are RTL, lower-case are LTR):
  //     Pos(0, 1, ...)
  //     before   after
  // ab     a|b     a|b
  // aB     a|B     aB|
  // Ab     |Ab     A|b
  // AB     B|A     B|A
  // Every position after the last character on a line is considered to stick
  // to the last character on the line.


  function _cursorCoords(cm, pos, context, lineObj, preparedMeasure, varHeight) {
    lineObj = lineObj || getLine(cm.doc, pos.line);

    if (!preparedMeasure) {
      preparedMeasure = prepareMeasureForLine(cm, lineObj);
    }

    function get(ch, right) {
      var m = measureCharPrepared(cm, preparedMeasure, ch, right ? "right" : "left", varHeight);

      if (right) {
        m.left = m.right;
      } else {
        m.right = m.left;
      }

      return intoCoordSystem(cm, lineObj, m, context);
    }

    var order = getOrder(lineObj, cm.doc.direction),
        ch = pos.ch,
        sticky = pos.sticky;

    if (ch >= lineObj.text.length) {
      ch = lineObj.text.length;
      sticky = "before";
    } else if (ch <= 0) {
      ch = 0;
      sticky = "after";
    }

    if (!order) {
      return get(sticky == "before" ? ch - 1 : ch, sticky == "before");
    }

    function getBidi(ch, partPos, invert) {
      var part = order[partPos],
          right = part.level == 1;
      return get(invert ? ch - 1 : ch, right != invert);
    }

    var partPos = getBidiPartAt(order, ch, sticky);
    var other = bidiOther;
    var val = getBidi(ch, partPos, sticky == "before");

    if (other != null) {
      val.other = getBidi(ch, other, sticky != "before");
    }

    return val;
  } // Used to cheaply estimate the coordinates for a position. Used for
  // intermediate scroll updates.


  function estimateCoords(cm, pos) {
    var left = 0;
    pos = _clipPos(cm.doc, pos);

    if (!cm.options.lineWrapping) {
      left = charWidth(cm.display) * pos.ch;
    }

    var lineObj = getLine(cm.doc, pos.line);
    var top = _heightAtLine(lineObj) + paddingTop(cm.display);
    return {
      left: left,
      right: left,
      top: top,
      bottom: top + lineObj.height
    };
  } // Positions returned by coordsChar contain some extra information.
  // xRel is the relative x position of the input coordinates compared
  // to the found position (so xRel > 0 means the coordinates are to
  // the right of the character position, for example). When outside
  // is true, that means the coordinates lie outside the line's
  // vertical range.


  function PosWithInfo(line, ch, sticky, outside, xRel) {
    var pos = Pos(line, ch, sticky);
    pos.xRel = xRel;

    if (outside) {
      pos.outside = outside;
    }

    return pos;
  } // Compute the character position closest to the given coordinates.
  // Input must be lineSpace-local ("div" coordinate system).


  function _coordsChar(cm, x, y) {
    var doc = cm.doc;
    y += cm.display.viewOffset;

    if (y < 0) {
      return PosWithInfo(doc.first, 0, null, -1, -1);
    }

    var lineN = _lineAtHeight(doc, y),
        last = doc.first + doc.size - 1;

    if (lineN > last) {
      return PosWithInfo(doc.first + doc.size - 1, getLine(doc, last).text.length, null, 1, 1);
    }

    if (x < 0) {
      x = 0;
    }

    var lineObj = getLine(doc, lineN);

    for (;;) {
      var found = coordsCharInner(cm, lineObj, lineN, x, y);
      var collapsed = collapsedSpanAround(lineObj, found.ch + (found.xRel > 0 || found.outside > 0 ? 1 : 0));

      if (!collapsed) {
        return found;
      }

      var rangeEnd = collapsed.find(1);

      if (rangeEnd.line == lineN) {
        return rangeEnd;
      }

      lineObj = getLine(doc, lineN = rangeEnd.line);
    }
  }

  function wrappedLineExtent(cm, lineObj, preparedMeasure, y) {
    y -= widgetTopHeight(lineObj);
    var end = lineObj.text.length;
    var begin = findFirst(function (ch) {
      return measureCharPrepared(cm, preparedMeasure, ch - 1).bottom <= y;
    }, end, 0);
    end = findFirst(function (ch) {
      return measureCharPrepared(cm, preparedMeasure, ch).top > y;
    }, begin, end);
    return {
      begin: begin,
      end: end
    };
  }

  function wrappedLineExtentChar(cm, lineObj, preparedMeasure, target) {
    if (!preparedMeasure) {
      preparedMeasure = prepareMeasureForLine(cm, lineObj);
    }

    var targetTop = intoCoordSystem(cm, lineObj, measureCharPrepared(cm, preparedMeasure, target), "line").top;
    return wrappedLineExtent(cm, lineObj, preparedMeasure, targetTop);
  } // Returns true if the given side of a box is after the given
  // coordinates, in top-to-bottom, left-to-right order.


  function boxIsAfter(box, x, y, left) {
    return box.bottom <= y ? false : box.top > y ? true : (left ? box.left : box.right) > x;
  }

  function coordsCharInner(cm, lineObj, lineNo$$1, x, y) {
    // Move y into line-local coordinate space
    y -= _heightAtLine(lineObj);
    var preparedMeasure = prepareMeasureForLine(cm, lineObj); // When directly calling `measureCharPrepared`, we have to adjust
    // for the widgets at this line.

    var widgetHeight$$1 = widgetTopHeight(lineObj);
    var begin = 0,
        end = lineObj.text.length,
        ltr = true;
    var order = getOrder(lineObj, cm.doc.direction); // If the line isn't plain left-to-right text, first figure out
    // which bidi section the coordinates fall into.

    if (order) {
      var part = (cm.options.lineWrapping ? coordsBidiPartWrapped : coordsBidiPart)(cm, lineObj, lineNo$$1, preparedMeasure, order, x, y);
      ltr = part.level != 1; // The awkward -1 offsets are needed because findFirst (called
      // on these below) will treat its first bound as inclusive,
      // second as exclusive, but we want to actually address the
      // characters in the part's range

      begin = ltr ? part.from : part.to - 1;
      end = ltr ? part.to : part.from - 1;
    } // A binary search to find the first character whose bounding box
    // starts after the coordinates. If we run across any whose box wrap
    // the coordinates, store that.


    var chAround = null,
        boxAround = null;
    var ch = findFirst(function (ch) {
      var box = measureCharPrepared(cm, preparedMeasure, ch);
      box.top += widgetHeight$$1;
      box.bottom += widgetHeight$$1;

      if (!boxIsAfter(box, x, y, false)) {
        return false;
      }

      if (box.top <= y && box.left <= x) {
        chAround = ch;
        boxAround = box;
      }

      return true;
    }, begin, end);
    var baseX,
        sticky,
        outside = false; // If a box around the coordinates was found, use that

    if (boxAround) {
      // Distinguish coordinates nearer to the left or right side of the box
      var atLeft = x - boxAround.left < boxAround.right - x,
          atStart = atLeft == ltr;
      ch = chAround + (atStart ? 0 : 1);
      sticky = atStart ? "after" : "before";
      baseX = atLeft ? boxAround.left : boxAround.right;
    } else {
      // (Adjust for extended bound, if necessary.)
      if (!ltr && (ch == end || ch == begin)) {
        ch++;
      } // To determine which side to associate with, get the box to the
      // left of the character and compare it's vertical position to the
      // coordinates


      sticky = ch == 0 ? "after" : ch == lineObj.text.length ? "before" : measureCharPrepared(cm, preparedMeasure, ch - (ltr ? 1 : 0)).bottom + widgetHeight$$1 <= y == ltr ? "after" : "before"; // Now get accurate coordinates for this place, in order to get a
      // base X position

      var coords = _cursorCoords(cm, Pos(lineNo$$1, ch, sticky), "line", lineObj, preparedMeasure);

      baseX = coords.left;
      outside = y < coords.top ? -1 : y >= coords.bottom ? 1 : 0;
    }

    ch = skipExtendingChars(lineObj.text, ch, 1);
    return PosWithInfo(lineNo$$1, ch, sticky, outside, x - baseX);
  }

  function coordsBidiPart(cm, lineObj, lineNo$$1, preparedMeasure, order, x, y) {
    // Bidi parts are sorted left-to-right, and in a non-line-wrapping
    // situation, we can take this ordering to correspond to the visual
    // ordering. This finds the first part whose end is after the given
    // coordinates.
    var index = findFirst(function (i) {
      var part = order[i],
          ltr = part.level != 1;
      return boxIsAfter(_cursorCoords(cm, Pos(lineNo$$1, ltr ? part.to : part.from, ltr ? "before" : "after"), "line", lineObj, preparedMeasure), x, y, true);
    }, 0, order.length - 1);
    var part = order[index]; // If this isn't the first part, the part's start is also after
    // the coordinates, and the coordinates aren't on the same line as
    // that start, move one part back.

    if (index > 0) {
      var ltr = part.level != 1;

      var start = _cursorCoords(cm, Pos(lineNo$$1, ltr ? part.from : part.to, ltr ? "after" : "before"), "line", lineObj, preparedMeasure);

      if (boxIsAfter(start, x, y, true) && start.top > y) {
        part = order[index - 1];
      }
    }

    return part;
  }

  function coordsBidiPartWrapped(cm, lineObj, _lineNo, preparedMeasure, order, x, y) {
    // In a wrapped line, rtl text on wrapping boundaries can do things
    // that don't correspond to the ordering in our `order` array at
    // all, so a binary search doesn't work, and we want to return a
    // part that only spans one line so that the binary search in
    // coordsCharInner is safe. As such, we first find the extent of the
    // wrapped line, and then do a flat search in which we discard any
    // spans that aren't on the line.
    var ref = wrappedLineExtent(cm, lineObj, preparedMeasure, y);
    var begin = ref.begin;
    var end = ref.end;

    if (/\s/.test(lineObj.text.charAt(end - 1))) {
      end--;
    }

    var part = null,
        closestDist = null;

    for (var i = 0; i < order.length; i++) {
      var p = order[i];

      if (p.from >= end || p.to <= begin) {
        continue;
      }

      var ltr = p.level != 1;
      var endX = measureCharPrepared(cm, preparedMeasure, ltr ? Math.min(end, p.to) - 1 : Math.max(begin, p.from)).right; // Weigh against spans ending before this, so that they are only
      // picked if nothing ends after

      var dist = endX < x ? x - endX + 1e9 : endX - x;

      if (!part || closestDist > dist) {
        part = p;
        closestDist = dist;
      }
    }

    if (!part) {
      part = order[order.length - 1];
    } // Clip the part to the wrapped line.


    if (part.from < begin) {
      part = {
        from: begin,
        to: part.to,
        level: part.level
      };
    }

    if (part.to > end) {
      part = {
        from: part.from,
        to: end,
        level: part.level
      };
    }

    return part;
  }

  var measureText; // Compute the default text height.

  function textHeight(display) {
    if (display.cachedTextHeight != null) {
      return display.cachedTextHeight;
    }

    if (measureText == null) {
      measureText = elt("pre", null, "CodeMirror-line-like"); // Measure a bunch of lines, for browsers that compute
      // fractional heights.

      for (var i = 0; i < 49; ++i) {
        measureText.appendChild(document.createTextNode("x"));
        measureText.appendChild(elt("br"));
      }

      measureText.appendChild(document.createTextNode("x"));
    }

    removeChildrenAndAdd(display.measure, measureText);
    var height = measureText.offsetHeight / 50;

    if (height > 3) {
      display.cachedTextHeight = height;
    }

    removeChildren(display.measure);
    return height || 1;
  } // Compute the default character width.


  function charWidth(display) {
    if (display.cachedCharWidth != null) {
      return display.cachedCharWidth;
    }

    var anchor = elt("span", "xxxxxxxxxx");
    var pre = elt("pre", [anchor], "CodeMirror-line-like");
    removeChildrenAndAdd(display.measure, pre);
    var rect = anchor.getBoundingClientRect(),
        width = (rect.right - rect.left) / 10;

    if (width > 2) {
      display.cachedCharWidth = width;
    }

    return width || 10;
  } // Do a bulk-read of the DOM positions and sizes needed to draw the
  // view, so that we don't interleave reading and writing to the DOM.


  function getDimensions(cm) {
    var d = cm.display,
        left = {},
        width = {};
    var gutterLeft = d.gutters.clientLeft;

    for (var n = d.gutters.firstChild, i = 0; n; n = n.nextSibling, ++i) {
      var id = cm.display.gutterSpecs[i].className;
      left[id] = n.offsetLeft + n.clientLeft + gutterLeft;
      width[id] = n.clientWidth;
    }

    return {
      fixedPos: compensateForHScroll(d),
      gutterTotalWidth: d.gutters.offsetWidth,
      gutterLeft: left,
      gutterWidth: width,
      wrapperWidth: d.wrapper.clientWidth
    };
  } // Computes display.scroller.scrollLeft + display.gutters.offsetWidth,
  // but using getBoundingClientRect to get a sub-pixel-accurate
  // result.


  function compensateForHScroll(display) {
    return display.scroller.getBoundingClientRect().left - display.sizer.getBoundingClientRect().left;
  } // Returns a function that estimates the height of a line, to use as
  // first approximation until the line becomes visible (and is thus
  // properly measurable).


  function estimateHeight(cm) {
    var th = textHeight(cm.display),
        wrapping = cm.options.lineWrapping;
    var perLine = wrapping && Math.max(5, cm.display.scroller.clientWidth / charWidth(cm.display) - 3);
    return function (line) {
      if (lineIsHidden(cm.doc, line)) {
        return 0;
      }

      var widgetsHeight = 0;

      if (line.widgets) {
        for (var i = 0; i < line.widgets.length; i++) {
          if (line.widgets[i].height) {
            widgetsHeight += line.widgets[i].height;
          }
        }
      }

      if (wrapping) {
        return widgetsHeight + (Math.ceil(line.text.length / perLine) || 1) * th;
      } else {
        return widgetsHeight + th;
      }
    };
  }

  function estimateLineHeights(cm) {
    var doc = cm.doc,
        est = estimateHeight(cm);
    doc.iter(function (line) {
      var estHeight = est(line);

      if (estHeight != line.height) {
        updateLineHeight(line, estHeight);
      }
    });
  } // Given a mouse event, find the corresponding position. If liberal
  // is false, it checks whether a gutter or scrollbar was clicked,
  // and returns null if it was. forRect is used by rectangular
  // selections, and tries to estimate a character position even for
  // coordinates beyond the right of the text.


  function posFromMouse(cm, e, liberal, forRect) {
    var display = cm.display;

    if (!liberal && e_target(e).getAttribute("cm-not-content") == "true") {
      return null;
    }

    var x,
        y,
        space = display.lineSpace.getBoundingClientRect(); // Fails unpredictably on IE[67] when mouse is dragged around quickly.

    try {
      x = e.clientX - space.left;
      y = e.clientY - space.top;
    } catch (e) {
      return null;
    }

    var coords = _coordsChar(cm, x, y),
        line;

    if (forRect && coords.xRel == 1 && (line = getLine(cm.doc, coords.line).text).length == coords.ch) {
      var colDiff = countColumn(line, line.length, cm.options.tabSize) - line.length;
      coords = Pos(coords.line, Math.max(0, Math.round((x - paddingH(cm.display).left) / charWidth(cm.display)) - colDiff));
    }

    return coords;
  } // Find the view element corresponding to a given line. Return null
  // when the line isn't visible.


  function findViewIndex(cm, n) {
    if (n >= cm.display.viewTo) {
      return null;
    }

    n -= cm.display.viewFrom;

    if (n < 0) {
      return null;
    }

    var view = cm.display.view;

    for (var i = 0; i < view.length; i++) {
      n -= view[i].size;

      if (n < 0) {
        return i;
      }
    }
  } // Updates the display.view data structure for a given change to the
  // document. From and to are in pre-change coordinates. Lendiff is
  // the amount of lines added or subtracted by the change. This is
  // used for changes that span multiple lines, or change the way
  // lines are divided into visual lines. regLineChange (below)
  // registers single-line changes.


  function regChange(cm, from, to, lendiff) {
    if (from == null) {
      from = cm.doc.first;
    }

    if (to == null) {
      to = cm.doc.first + cm.doc.size;
    }

    if (!lendiff) {
      lendiff = 0;
    }

    var display = cm.display;

    if (lendiff && to < display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers > from)) {
      display.updateLineNumbers = from;
    }

    cm.curOp.viewChanged = true;

    if (from >= display.viewTo) {
      // Change after
      if (sawCollapsedSpans && visualLineNo(cm.doc, from) < display.viewTo) {
        resetView(cm);
      }
    } else if (to <= display.viewFrom) {
      // Change before
      if (sawCollapsedSpans && visualLineEndNo(cm.doc, to + lendiff) > display.viewFrom) {
        resetView(cm);
      } else {
        display.viewFrom += lendiff;
        display.viewTo += lendiff;
      }
    } else if (from <= display.viewFrom && to >= display.viewTo) {
      // Full overlap
      resetView(cm);
    } else if (from <= display.viewFrom) {
      // Top overlap
      var cut = viewCuttingPoint(cm, to, to + lendiff, 1);

      if (cut) {
        display.view = display.view.slice(cut.index);
        display.viewFrom = cut.lineN;
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    } else if (to >= display.viewTo) {
      // Bottom overlap
      var cut$1 = viewCuttingPoint(cm, from, from, -1);

      if (cut$1) {
        display.view = display.view.slice(0, cut$1.index);
        display.viewTo = cut$1.lineN;
      } else {
        resetView(cm);
      }
    } else {
      // Gap in the middle
      var cutTop = viewCuttingPoint(cm, from, from, -1);
      var cutBot = viewCuttingPoint(cm, to, to + lendiff, 1);

      if (cutTop && cutBot) {
        display.view = display.view.slice(0, cutTop.index).concat(buildViewArray(cm, cutTop.lineN, cutBot.lineN)).concat(display.view.slice(cutBot.index));
        display.viewTo += lendiff;
      } else {
        resetView(cm);
      }
    }

    var ext = display.externalMeasured;

    if (ext) {
      if (to < ext.lineN) {
        ext.lineN += lendiff;
      } else if (from < ext.lineN + ext.size) {
        display.externalMeasured = null;
      }
    }
  } // Register a change to a single line. Type must be one of "text",
  // "gutter", "class", "widget"


  function regLineChange(cm, line, type) {
    cm.curOp.viewChanged = true;
    var display = cm.display,
        ext = cm.display.externalMeasured;

    if (ext && line >= ext.lineN && line < ext.lineN + ext.size) {
      display.externalMeasured = null;
    }

    if (line < display.viewFrom || line >= display.viewTo) {
      return;
    }

    var lineView = display.view[findViewIndex(cm, line)];

    if (lineView.node == null) {
      return;
    }

    var arr = lineView.changes || (lineView.changes = []);

    if (indexOf(arr, type) == -1) {
      arr.push(type);
    }
  } // Clear the view.


  function resetView(cm) {
    cm.display.viewFrom = cm.display.viewTo = cm.doc.first;
    cm.display.view = [];
    cm.display.viewOffset = 0;
  }

  function viewCuttingPoint(cm, oldN, newN, dir) {
    var index = findViewIndex(cm, oldN),
        diff,
        view = cm.display.view;

    if (!sawCollapsedSpans || newN == cm.doc.first + cm.doc.size) {
      return {
        index: index,
        lineN: newN
      };
    }

    var n = cm.display.viewFrom;

    for (var i = 0; i < index; i++) {
      n += view[i].size;
    }

    if (n != oldN) {
      if (dir > 0) {
        if (index == view.length - 1) {
          return null;
        }

        diff = n + view[index].size - oldN;
        index++;
      } else {
        diff = n - oldN;
      }

      oldN += diff;
      newN += diff;
    }

    while (visualLineNo(cm.doc, newN) != newN) {
      if (index == (dir < 0 ? 0 : view.length - 1)) {
        return null;
      }

      newN += dir * view[index - (dir < 0 ? 1 : 0)].size;
      index += dir;
    }

    return {
      index: index,
      lineN: newN
    };
  } // Force the view to cover a given range, adding empty view element
  // or clipping off existing ones as needed.


  function adjustView(cm, from, to) {
    var display = cm.display,
        view = display.view;

    if (view.length == 0 || from >= display.viewTo || to <= display.viewFrom) {
      display.view = buildViewArray(cm, from, to);
      display.viewFrom = from;
    } else {
      if (display.viewFrom > from) {
        display.view = buildViewArray(cm, from, display.viewFrom).concat(display.view);
      } else if (display.viewFrom < from) {
        display.view = display.view.slice(findViewIndex(cm, from));
      }

      display.viewFrom = from;

      if (display.viewTo < to) {
        display.view = display.view.concat(buildViewArray(cm, display.viewTo, to));
      } else if (display.viewTo > to) {
        display.view = display.view.slice(0, findViewIndex(cm, to));
      }
    }

    display.viewTo = to;
  } // Count the number of lines in the view whose DOM representation is
  // out of date (or nonexistent).


  function countDirtyView(cm) {
    var view = cm.display.view,
        dirty = 0;

    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];

      if (!lineView.hidden && (!lineView.node || lineView.changes)) {
        ++dirty;
      }
    }

    return dirty;
  }

  function updateSelection(cm) {
    cm.display.input.showSelection(cm.display.input.prepareSelection());
  }

  function prepareSelection(cm, primary) {
    if (primary === void 0) primary = true;
    var doc = cm.doc,
        result = {};
    var curFragment = result.cursors = document.createDocumentFragment();
    var selFragment = result.selection = document.createDocumentFragment();

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      if (!primary && i == doc.sel.primIndex) {
        continue;
      }

      var range$$1 = doc.sel.ranges[i];

      if (range$$1.from().line >= cm.display.viewTo || range$$1.to().line < cm.display.viewFrom) {
        continue;
      }

      var collapsed = range$$1.empty();

      if (collapsed || cm.options.showCursorWhenSelecting) {
        drawSelectionCursor(cm, range$$1.head, curFragment);
      }

      if (!collapsed) {
        drawSelectionRange(cm, range$$1, selFragment);
      }
    }

    return result;
  } // Draws a cursor for the given range


  function drawSelectionCursor(cm, head, output) {
    var pos = _cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine);

    var cursor = output.appendChild(elt("div", "\xA0", "CodeMirror-cursor"));
    cursor.style.left = pos.left + "px";
    cursor.style.top = pos.top + "px";
    cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px";

    if (pos.other) {
      // Secondary cursor, shown when on a 'jump' in bi-directional text
      var otherCursor = output.appendChild(elt("div", "\xA0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      otherCursor.style.display = "";
      otherCursor.style.left = pos.other.left + "px";
      otherCursor.style.top = pos.other.top + "px";
      otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px";
    }
  }

  function cmpCoords(a, b) {
    return a.top - b.top || a.left - b.left;
  } // Draws the given range as a highlighted selection


  function drawSelectionRange(cm, range$$1, output) {
    var display = cm.display,
        doc = cm.doc;
    var fragment = document.createDocumentFragment();
    var padding = paddingH(cm.display),
        leftSide = padding.left;
    var rightSide = Math.max(display.sizerWidth, displayWidth(cm) - display.sizer.offsetLeft) - padding.right;
    var docLTR = doc.direction == "ltr";

    function add(left, top, width, bottom) {
      if (top < 0) {
        top = 0;
      }

      top = Math.round(top);
      bottom = Math.round(bottom);
      fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left + "px;\n                             top: " + top + "px; width: " + (width == null ? rightSide - left : width) + "px;\n                             height: " + (bottom - top) + "px"));
    }

    function drawForLine(line, fromArg, toArg) {
      var lineObj = getLine(doc, line);
      var lineLen = lineObj.text.length;
      var start, end;

      function coords(ch, bias) {
        return _charCoords(cm, Pos(line, ch), "div", lineObj, bias);
      }

      function wrapX(pos, dir, side) {
        var extent = wrappedLineExtentChar(cm, lineObj, null, pos);
        var prop = dir == "ltr" == (side == "after") ? "left" : "right";
        var ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1);
        return coords(ch, prop)[prop];
      }

      var order = getOrder(lineObj, doc.direction);
      iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, function (from, to, dir, i) {
        var ltr = dir == "ltr";
        var fromPos = coords(from, ltr ? "left" : "right");
        var toPos = coords(to - 1, ltr ? "right" : "left");
        var openStart = fromArg == null && from == 0,
            openEnd = toArg == null && to == lineLen;
        var first = i == 0,
            last = !order || i == order.length - 1;

        if (toPos.top - fromPos.top <= 3) {
          // Single line
          var openLeft = (docLTR ? openStart : openEnd) && first;
          var openRight = (docLTR ? openEnd : openStart) && last;
          var left = openLeft ? leftSide : (ltr ? fromPos : toPos).left;
          var right = openRight ? rightSide : (ltr ? toPos : fromPos).right;
          add(left, fromPos.top, right - left, fromPos.bottom);
        } else {
          // Multiple lines
          var topLeft, topRight, botLeft, botRight;

          if (ltr) {
            topLeft = docLTR && openStart && first ? leftSide : fromPos.left;
            topRight = docLTR ? rightSide : wrapX(from, dir, "before");
            botLeft = docLTR ? leftSide : wrapX(to, dir, "after");
            botRight = docLTR && openEnd && last ? rightSide : toPos.right;
          } else {
            topLeft = !docLTR ? leftSide : wrapX(from, dir, "before");
            topRight = !docLTR && openStart && first ? rightSide : fromPos.right;
            botLeft = !docLTR && openEnd && last ? leftSide : toPos.left;
            botRight = !docLTR ? rightSide : wrapX(to, dir, "after");
          }

          add(topLeft, fromPos.top, topRight - topLeft, fromPos.bottom);

          if (fromPos.bottom < toPos.top) {
            add(leftSide, fromPos.bottom, null, toPos.top);
          }

          add(botLeft, toPos.top, botRight - botLeft, toPos.bottom);
        }

        if (!start || cmpCoords(fromPos, start) < 0) {
          start = fromPos;
        }

        if (cmpCoords(toPos, start) < 0) {
          start = toPos;
        }

        if (!end || cmpCoords(fromPos, end) < 0) {
          end = fromPos;
        }

        if (cmpCoords(toPos, end) < 0) {
          end = toPos;
        }
      });
      return {
        start: start,
        end: end
      };
    }

    var sFrom = range$$1.from(),
        sTo = range$$1.to();

    if (sFrom.line == sTo.line) {
      drawForLine(sFrom.line, sFrom.ch, sTo.ch);
    } else {
      var fromLine = getLine(doc, sFrom.line),
          toLine = getLine(doc, sTo.line);
      var singleVLine = visualLine(fromLine) == visualLine(toLine);
      var leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end;
      var rightStart = drawForLine(sTo.line, singleVLine ? 0 : null, sTo.ch).start;

      if (singleVLine) {
        if (leftEnd.top < rightStart.top - 2) {
          add(leftEnd.right, leftEnd.top, null, leftEnd.bottom);
          add(leftSide, rightStart.top, rightStart.left, rightStart.bottom);
        } else {
          add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom);
        }
      }

      if (leftEnd.bottom < rightStart.top) {
        add(leftSide, leftEnd.bottom, null, rightStart.top);
      }
    }

    output.appendChild(fragment);
  } // Cursor-blinking


  function restartBlink(cm) {
    if (!cm.state.focused) {
      return;
    }

    var display = cm.display;
    clearInterval(display.blinker);
    var on = true;
    display.cursorDiv.style.visibility = "";

    if (cm.options.cursorBlinkRate > 0) {
      display.blinker = setInterval(function () {
        return display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden";
      }, cm.options.cursorBlinkRate);
    } else if (cm.options.cursorBlinkRate < 0) {
      display.cursorDiv.style.visibility = "hidden";
    }
  }

  function ensureFocus(cm) {
    if (!cm.state.focused) {
      cm.display.input.focus();
      onFocus(cm);
    }
  }

  function delayBlurEvent(cm) {
    cm.state.delayingBlurEvent = true;
    setTimeout(function () {
      if (cm.state.delayingBlurEvent) {
        cm.state.delayingBlurEvent = false;
        onBlur(cm);
      }
    }, 100);
  }

  function onFocus(cm, e) {
    if (cm.state.delayingBlurEvent) {
      cm.state.delayingBlurEvent = false;
    }

    if (cm.options.readOnly == "nocursor") {
      return;
    }

    if (!cm.state.focused) {
      signal(cm, "focus", cm, e);
      cm.state.focused = true;
      addClass(cm.display.wrapper, "CodeMirror-focused"); // This test prevents this from firing when a context
      // menu is closed (since the input reset would kill the
      // select-all detection hack)

      if (!cm.curOp && cm.display.selForContextMenu != cm.doc.sel) {
        cm.display.input.reset();

        if (webkit) {
          setTimeout(function () {
            return cm.display.input.reset(true);
          }, 20);
        } // Issue #1730

      }

      cm.display.input.receivedFocus();
    }

    restartBlink(cm);
  }

  function onBlur(cm, e) {
    if (cm.state.delayingBlurEvent) {
      return;
    }

    if (cm.state.focused) {
      signal(cm, "blur", cm, e);
      cm.state.focused = false;
      rmClass(cm.display.wrapper, "CodeMirror-focused");
    }

    clearInterval(cm.display.blinker);
    setTimeout(function () {
      if (!cm.state.focused) {
        cm.display.shift = false;
      }
    }, 150);
  } // Read the actual heights of the rendered lines, and update their
  // stored heights to match.


  function updateHeightsInViewport(cm) {
    var display = cm.display;
    var prevBottom = display.lineDiv.offsetTop;

    for (var i = 0; i < display.view.length; i++) {
      var cur = display.view[i],
          wrapping = cm.options.lineWrapping;
      var height = void 0,
          width = 0;

      if (cur.hidden) {
        continue;
      }

      if (ie && ie_version < 8) {
        var bot = cur.node.offsetTop + cur.node.offsetHeight;
        height = bot - prevBottom;
        prevBottom = bot;
      } else {
        var box = cur.node.getBoundingClientRect();
        height = box.bottom - box.top; // Check that lines don't extend past the right of the current
        // editor width

        if (!wrapping && cur.text.firstChild) {
          width = cur.text.firstChild.getBoundingClientRect().right - box.left - 1;
        }
      }

      var diff = cur.line.height - height;

      if (diff > .005 || diff < -.005) {
        updateLineHeight(cur.line, height);
        updateWidgetHeight(cur.line);

        if (cur.rest) {
          for (var j = 0; j < cur.rest.length; j++) {
            updateWidgetHeight(cur.rest[j]);
          }
        }
      }

      if (width > cm.display.sizerWidth) {
        var chWidth = Math.ceil(width / charWidth(cm.display));

        if (chWidth > cm.display.maxLineLength) {
          cm.display.maxLineLength = chWidth;
          cm.display.maxLine = cur.line;
          cm.display.maxLineChanged = true;
        }
      }
    }
  } // Read and store the height of line widgets associated with the
  // given line.


  function updateWidgetHeight(line) {
    if (line.widgets) {
      for (var i = 0; i < line.widgets.length; ++i) {
        var w = line.widgets[i],
            parent = w.node.parentNode;

        if (parent) {
          w.height = parent.offsetHeight;
        }
      }
    }
  } // Compute the lines that are visible in a given viewport (defaults
  // the the current scroll position). viewport may contain top,
  // height, and ensure (see op.scrollToPos) properties.


  function visibleLines(display, doc, viewport) {
    var top = viewport && viewport.top != null ? Math.max(0, viewport.top) : display.scroller.scrollTop;
    top = Math.floor(top - paddingTop(display));
    var bottom = viewport && viewport.bottom != null ? viewport.bottom : top + display.wrapper.clientHeight;

    var from = _lineAtHeight(doc, top),
        to = _lineAtHeight(doc, bottom); // Ensure is a {from: {line, ch}, to: {line, ch}} object, and
    // forces those lines into the viewport (if possible).


    if (viewport && viewport.ensure) {
      var ensureFrom = viewport.ensure.from.line,
          ensureTo = viewport.ensure.to.line;

      if (ensureFrom < from) {
        from = ensureFrom;
        to = _lineAtHeight(doc, _heightAtLine(getLine(doc, ensureFrom)) + display.wrapper.clientHeight);
      } else if (Math.min(ensureTo, doc.lastLine()) >= to) {
        from = _lineAtHeight(doc, _heightAtLine(getLine(doc, ensureTo)) - display.wrapper.clientHeight);
        to = ensureTo;
      }
    }

    return {
      from: from,
      to: Math.max(to, from + 1)
    };
  } // SCROLLING THINGS INTO VIEW
  // If an editor sits on the top or bottom of the window, partially
  // scrolled out of view, this ensures that the cursor is visible.


  function maybeScrollWindow(cm, rect) {
    if (signalDOMEvent(cm, "scrollCursorIntoView")) {
      return;
    }

    var display = cm.display,
        box = display.sizer.getBoundingClientRect(),
        doScroll = null;

    if (rect.top + box.top < 0) {
      doScroll = true;
    } else if (rect.bottom + box.top > (window.innerHeight || document.documentElement.clientHeight)) {
      doScroll = false;
    }

    if (doScroll != null && !phantom) {
      var scrollNode = elt("div", "\u200B", null, "position: absolute;\n                         top: " + (rect.top - display.viewOffset - paddingTop(cm.display)) + "px;\n                         height: " + (rect.bottom - rect.top + scrollGap(cm) + display.barHeight) + "px;\n                         left: " + rect.left + "px; width: " + Math.max(2, rect.right - rect.left) + "px;");
      cm.display.lineSpace.appendChild(scrollNode);
      scrollNode.scrollIntoView(doScroll);
      cm.display.lineSpace.removeChild(scrollNode);
    }
  } // Scroll a given position into view (immediately), verifying that
  // it actually became visible (as line heights are accurately
  // measured, the position of something may 'drift' during drawing).


  function scrollPosIntoView(cm, pos, end, margin) {
    if (margin == null) {
      margin = 0;
    }

    var rect;

    if (!cm.options.lineWrapping && pos == end) {
      // Set pos and end to the cursor positions around the character pos sticks to
      // If pos.sticky == "before", that is around pos.ch - 1, otherwise around pos.ch
      // If pos == Pos(_, 0, "before"), pos and end are unchanged
      pos = pos.ch ? Pos(pos.line, pos.sticky == "before" ? pos.ch - 1 : pos.ch, "after") : pos;
      end = pos.sticky == "before" ? Pos(pos.line, pos.ch + 1, "before") : pos;
    }

    for (var limit = 0; limit < 5; limit++) {
      var changed = false;

      var coords = _cursorCoords(cm, pos);

      var endCoords = !end || end == pos ? coords : _cursorCoords(cm, end);
      rect = {
        left: Math.min(coords.left, endCoords.left),
        top: Math.min(coords.top, endCoords.top) - margin,
        right: Math.max(coords.left, endCoords.left),
        bottom: Math.max(coords.bottom, endCoords.bottom) + margin
      };
      var scrollPos = calculateScrollPos(cm, rect);
      var startTop = cm.doc.scrollTop,
          startLeft = cm.doc.scrollLeft;

      if (scrollPos.scrollTop != null) {
        updateScrollTop(cm, scrollPos.scrollTop);

        if (Math.abs(cm.doc.scrollTop - startTop) > 1) {
          changed = true;
        }
      }

      if (scrollPos.scrollLeft != null) {
        setScrollLeft(cm, scrollPos.scrollLeft);

        if (Math.abs(cm.doc.scrollLeft - startLeft) > 1) {
          changed = true;
        }
      }

      if (!changed) {
        break;
      }
    }

    return rect;
  } // Scroll a given set of coordinates into view (immediately).


  function scrollIntoView(cm, rect) {
    var scrollPos = calculateScrollPos(cm, rect);

    if (scrollPos.scrollTop != null) {
      updateScrollTop(cm, scrollPos.scrollTop);
    }

    if (scrollPos.scrollLeft != null) {
      setScrollLeft(cm, scrollPos.scrollLeft);
    }
  } // Calculate a new scroll position needed to scroll the given
  // rectangle into view. Returns an object with scrollTop and
  // scrollLeft properties. When these are undefined, the
  // vertical/horizontal position does not need to be adjusted.


  function calculateScrollPos(cm, rect) {
    var display = cm.display,
        snapMargin = textHeight(cm.display);

    if (rect.top < 0) {
      rect.top = 0;
    }

    var screentop = cm.curOp && cm.curOp.scrollTop != null ? cm.curOp.scrollTop : display.scroller.scrollTop;
    var screen = displayHeight(cm),
        result = {};

    if (rect.bottom - rect.top > screen) {
      rect.bottom = rect.top + screen;
    }

    var docBottom = cm.doc.height + paddingVert(display);
    var atTop = rect.top < snapMargin,
        atBottom = rect.bottom > docBottom - snapMargin;

    if (rect.top < screentop) {
      result.scrollTop = atTop ? 0 : rect.top;
    } else if (rect.bottom > screentop + screen) {
      var newTop = Math.min(rect.top, (atBottom ? docBottom : rect.bottom) - screen);

      if (newTop != screentop) {
        result.scrollTop = newTop;
      }
    }

    var screenleft = cm.curOp && cm.curOp.scrollLeft != null ? cm.curOp.scrollLeft : display.scroller.scrollLeft;
    var screenw = displayWidth(cm) - (cm.options.fixedGutter ? display.gutters.offsetWidth : 0);
    var tooWide = rect.right - rect.left > screenw;

    if (tooWide) {
      rect.right = rect.left + screenw;
    }

    if (rect.left < 10) {
      result.scrollLeft = 0;
    } else if (rect.left < screenleft) {
      result.scrollLeft = Math.max(0, rect.left - (tooWide ? 0 : 10));
    } else if (rect.right > screenw + screenleft - 3) {
      result.scrollLeft = rect.right + (tooWide ? 0 : 10) - screenw;
    }

    return result;
  } // Store a relative adjustment to the scroll position in the current
  // operation (to be applied when the operation finishes).


  function addToScrollTop(cm, top) {
    if (top == null) {
      return;
    }

    resolveScrollToPos(cm);
    cm.curOp.scrollTop = (cm.curOp.scrollTop == null ? cm.doc.scrollTop : cm.curOp.scrollTop) + top;
  } // Make sure that at the end of the operation the current cursor is
  // shown.


  function ensureCursorVisible(cm) {
    resolveScrollToPos(cm);
    var cur = cm.getCursor();
    cm.curOp.scrollToPos = {
      from: cur,
      to: cur,
      margin: cm.options.cursorScrollMargin
    };
  }

  function scrollToCoords(cm, x, y) {
    if (x != null || y != null) {
      resolveScrollToPos(cm);
    }

    if (x != null) {
      cm.curOp.scrollLeft = x;
    }

    if (y != null) {
      cm.curOp.scrollTop = y;
    }
  }

  function scrollToRange(cm, range$$1) {
    resolveScrollToPos(cm);
    cm.curOp.scrollToPos = range$$1;
  } // When an operation has its scrollToPos property set, and another
  // scroll action is applied before the end of the operation, this
  // 'simulates' scrolling that position into view in a cheap way, so
  // that the effect of intermediate scroll commands is not ignored.


  function resolveScrollToPos(cm) {
    var range$$1 = cm.curOp.scrollToPos;

    if (range$$1) {
      cm.curOp.scrollToPos = null;
      var from = estimateCoords(cm, range$$1.from),
          to = estimateCoords(cm, range$$1.to);
      scrollToCoordsRange(cm, from, to, range$$1.margin);
    }
  }

  function scrollToCoordsRange(cm, from, to, margin) {
    var sPos = calculateScrollPos(cm, {
      left: Math.min(from.left, to.left),
      top: Math.min(from.top, to.top) - margin,
      right: Math.max(from.right, to.right),
      bottom: Math.max(from.bottom, to.bottom) + margin
    });
    scrollToCoords(cm, sPos.scrollLeft, sPos.scrollTop);
  } // Sync the scrollable area and scrollbars, ensure the viewport
  // covers the visible area.


  function updateScrollTop(cm, val) {
    if (Math.abs(cm.doc.scrollTop - val) < 2) {
      return;
    }

    if (!gecko) {
      updateDisplaySimple(cm, {
        top: val
      });
    }

    setScrollTop(cm, val, true);

    if (gecko) {
      updateDisplaySimple(cm);
    }

    startWorker(cm, 100);
  }

  function setScrollTop(cm, val, forceScroll) {
    val = Math.min(cm.display.scroller.scrollHeight - cm.display.scroller.clientHeight, val);

    if (cm.display.scroller.scrollTop == val && !forceScroll) {
      return;
    }

    cm.doc.scrollTop = val;
    cm.display.scrollbars.setScrollTop(val);

    if (cm.display.scroller.scrollTop != val) {
      cm.display.scroller.scrollTop = val;
    }
  } // Sync scroller and scrollbar, ensure the gutter elements are
  // aligned.


  function setScrollLeft(cm, val, isScroller, forceScroll) {
    val = Math.min(val, cm.display.scroller.scrollWidth - cm.display.scroller.clientWidth);

    if ((isScroller ? val == cm.doc.scrollLeft : Math.abs(cm.doc.scrollLeft - val) < 2) && !forceScroll) {
      return;
    }

    cm.doc.scrollLeft = val;
    alignHorizontally(cm);

    if (cm.display.scroller.scrollLeft != val) {
      cm.display.scroller.scrollLeft = val;
    }

    cm.display.scrollbars.setScrollLeft(val);
  } // SCROLLBARS
  // Prepare DOM reads needed to update the scrollbars. Done in one
  // shot to minimize update/measure roundtrips.


  function measureForScrollbars(cm) {
    var d = cm.display,
        gutterW = d.gutters.offsetWidth;
    var docH = Math.round(cm.doc.height + paddingVert(cm.display));
    return {
      clientHeight: d.scroller.clientHeight,
      viewHeight: d.wrapper.clientHeight,
      scrollWidth: d.scroller.scrollWidth,
      clientWidth: d.scroller.clientWidth,
      viewWidth: d.wrapper.clientWidth,
      barLeft: cm.options.fixedGutter ? gutterW : 0,
      docHeight: docH,
      scrollHeight: docH + scrollGap(cm) + d.barHeight,
      nativeBarWidth: d.nativeBarWidth,
      gutterWidth: gutterW
    };
  }

  var NativeScrollbars = function NativeScrollbars(place, scroll, cm) {
    this.cm = cm;
    var vert = this.vert = elt("div", [elt("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar");
    var horiz = this.horiz = elt("div", [elt("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    vert.tabIndex = horiz.tabIndex = -1;
    place(vert);
    place(horiz);
    on(vert, "scroll", function () {
      if (vert.clientHeight) {
        scroll(vert.scrollTop, "vertical");
      }
    });
    on(horiz, "scroll", function () {
      if (horiz.clientWidth) {
        scroll(horiz.scrollLeft, "horizontal");
      }
    });
    this.checkedZeroWidth = false; // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).

    if (ie && ie_version < 8) {
      this.horiz.style.minHeight = this.vert.style.minWidth = "18px";
    }
  };

  NativeScrollbars.prototype.update = function (measure) {
    var needsH = measure.scrollWidth > measure.clientWidth + 1;
    var needsV = measure.scrollHeight > measure.clientHeight + 1;
    var sWidth = measure.nativeBarWidth;

    if (needsV) {
      this.vert.style.display = "block";
      this.vert.style.bottom = needsH ? sWidth + "px" : "0";
      var totalHeight = measure.viewHeight - (needsH ? sWidth : 0); // A bug in IE8 can cause this value to be negative, so guard it.

      this.vert.firstChild.style.height = Math.max(0, measure.scrollHeight - measure.clientHeight + totalHeight) + "px";
    } else {
      this.vert.style.display = "";
      this.vert.firstChild.style.height = "0";
    }

    if (needsH) {
      this.horiz.style.display = "block";
      this.horiz.style.right = needsV ? sWidth + "px" : "0";
      this.horiz.style.left = measure.barLeft + "px";
      var totalWidth = measure.viewWidth - measure.barLeft - (needsV ? sWidth : 0);
      this.horiz.firstChild.style.width = Math.max(0, measure.scrollWidth - measure.clientWidth + totalWidth) + "px";
    } else {
      this.horiz.style.display = "";
      this.horiz.firstChild.style.width = "0";
    }

    if (!this.checkedZeroWidth && measure.clientHeight > 0) {
      if (sWidth == 0) {
        this.zeroWidthHack();
      }

      this.checkedZeroWidth = true;
    }

    return {
      right: needsV ? sWidth : 0,
      bottom: needsH ? sWidth : 0
    };
  };

  NativeScrollbars.prototype.setScrollLeft = function (pos) {
    if (this.horiz.scrollLeft != pos) {
      this.horiz.scrollLeft = pos;
    }

    if (this.disableHoriz) {
      this.enableZeroWidthBar(this.horiz, this.disableHoriz, "horiz");
    }
  };

  NativeScrollbars.prototype.setScrollTop = function (pos) {
    if (this.vert.scrollTop != pos) {
      this.vert.scrollTop = pos;
    }

    if (this.disableVert) {
      this.enableZeroWidthBar(this.vert, this.disableVert, "vert");
    }
  };

  NativeScrollbars.prototype.zeroWidthHack = function () {
    var w = mac && !mac_geMountainLion ? "12px" : "18px";
    this.horiz.style.height = this.vert.style.width = w;
    this.horiz.style.pointerEvents = this.vert.style.pointerEvents = "none";
    this.disableHoriz = new Delayed();
    this.disableVert = new Delayed();
  };

  NativeScrollbars.prototype.enableZeroWidthBar = function (bar, delay, type) {
    bar.style.pointerEvents = "auto";

    function maybeDisable() {
      // To find out whether the scrollbar is still visible, we
      // check whether the element under the pixel in the bottom
      // right corner of the scrollbar box is the scrollbar box
      // itself (when the bar is still visible) or its filler child
      // (when the bar is hidden). If it is still visible, we keep
      // it enabled, if it's hidden, we disable pointer events.
      var box = bar.getBoundingClientRect();
      var elt$$1 = type == "vert" ? document.elementFromPoint(box.right - 1, (box.top + box.bottom) / 2) : document.elementFromPoint((box.right + box.left) / 2, box.bottom - 1);

      if (elt$$1 != bar) {
        bar.style.pointerEvents = "none";
      } else {
        delay.set(1000, maybeDisable);
      }
    }

    delay.set(1000, maybeDisable);
  };

  NativeScrollbars.prototype.clear = function () {
    var parent = this.horiz.parentNode;
    parent.removeChild(this.horiz);
    parent.removeChild(this.vert);
  };

  var NullScrollbars = function NullScrollbars() {};

  NullScrollbars.prototype.update = function () {
    return {
      bottom: 0,
      right: 0
    };
  };

  NullScrollbars.prototype.setScrollLeft = function () {};

  NullScrollbars.prototype.setScrollTop = function () {};

  NullScrollbars.prototype.clear = function () {};

  function updateScrollbars(cm, measure) {
    if (!measure) {
      measure = measureForScrollbars(cm);
    }

    var startWidth = cm.display.barWidth,
        startHeight = cm.display.barHeight;
    updateScrollbarsInner(cm, measure);

    for (var i = 0; i < 4 && startWidth != cm.display.barWidth || startHeight != cm.display.barHeight; i++) {
      if (startWidth != cm.display.barWidth && cm.options.lineWrapping) {
        updateHeightsInViewport(cm);
      }

      updateScrollbarsInner(cm, measureForScrollbars(cm));
      startWidth = cm.display.barWidth;
      startHeight = cm.display.barHeight;
    }
  } // Re-synchronize the fake scrollbars with the actual size of the
  // content.


  function updateScrollbarsInner(cm, measure) {
    var d = cm.display;
    var sizes = d.scrollbars.update(measure);
    d.sizer.style.paddingRight = (d.barWidth = sizes.right) + "px";
    d.sizer.style.paddingBottom = (d.barHeight = sizes.bottom) + "px";
    d.heightForcer.style.borderBottom = sizes.bottom + "px solid transparent";

    if (sizes.right && sizes.bottom) {
      d.scrollbarFiller.style.display = "block";
      d.scrollbarFiller.style.height = sizes.bottom + "px";
      d.scrollbarFiller.style.width = sizes.right + "px";
    } else {
      d.scrollbarFiller.style.display = "";
    }

    if (sizes.bottom && cm.options.coverGutterNextToScrollbar && cm.options.fixedGutter) {
      d.gutterFiller.style.display = "block";
      d.gutterFiller.style.height = sizes.bottom + "px";
      d.gutterFiller.style.width = measure.gutterWidth + "px";
    } else {
      d.gutterFiller.style.display = "";
    }
  }

  var scrollbarModel = {
    "native": NativeScrollbars,
    "null": NullScrollbars
  };

  function initScrollbars(cm) {
    if (cm.display.scrollbars) {
      cm.display.scrollbars.clear();

      if (cm.display.scrollbars.addClass) {
        rmClass(cm.display.wrapper, cm.display.scrollbars.addClass);
      }
    }

    cm.display.scrollbars = new scrollbarModel[cm.options.scrollbarStyle](function (node) {
      cm.display.wrapper.insertBefore(node, cm.display.scrollbarFiller); // Prevent clicks in the scrollbars from killing focus

      on(node, "mousedown", function () {
        if (cm.state.focused) {
          setTimeout(function () {
            return cm.display.input.focus();
          }, 0);
        }
      });
      node.setAttribute("cm-not-content", "true");
    }, function (pos, axis) {
      if (axis == "horizontal") {
        setScrollLeft(cm, pos);
      } else {
        updateScrollTop(cm, pos);
      }
    }, cm);

    if (cm.display.scrollbars.addClass) {
      addClass(cm.display.wrapper, cm.display.scrollbars.addClass);
    }
  } // Operations are used to wrap a series of changes to the editor
  // state in such a way that each change won't have to update the
  // cursor and display (which would be awkward, slow, and
  // error-prone). Instead, display updates are batched and then all
  // combined and executed at once.


  var nextOpId = 0; // Start a new operation.

  function _startOperation(cm) {
    cm.curOp = {
      cm: cm,
      viewChanged: false,
      // Flag that indicates that lines might need to be redrawn
      startHeight: cm.doc.height,
      // Used to detect need to update scrollbar
      forceUpdate: false,
      // Used to force a redraw
      updateInput: 0,
      // Whether to reset the input textarea
      typing: false,
      // Whether this reset should be careful to leave existing text (for compositing)
      changeObjs: null,
      // Accumulated changes, for firing change events
      cursorActivityHandlers: null,
      // Set of handlers to fire cursorActivity on
      cursorActivityCalled: 0,
      // Tracks which cursorActivity handlers have been called already
      selectionChanged: false,
      // Whether the selection needs to be redrawn
      updateMaxLine: false,
      // Set when the widest line needs to be determined anew
      scrollLeft: null,
      scrollTop: null,
      // Intermediate scroll position, not pushed to DOM yet
      scrollToPos: null,
      // Used to scroll to a specific position
      focus: false,
      id: ++nextOpId // Unique ID

    };
    pushOperation(cm.curOp);
  } // Finish an operation, updating the display and signalling delayed events


  function _endOperation(cm) {
    var op = cm.curOp;

    if (op) {
      finishOperation(op, function (group) {
        for (var i = 0; i < group.ops.length; i++) {
          group.ops[i].cm.curOp = null;
        }

        endOperations(group);
      });
    }
  } // The DOM updates done when an operation finishes are batched so
  // that the minimum number of relayouts are required.


  function endOperations(group) {
    var ops = group.ops;

    for (var i = 0; i < ops.length; i++) // Read DOM
    {
      endOperation_R1(ops[i]);
    }

    for (var i$1 = 0; i$1 < ops.length; i$1++) // Write DOM (maybe)
    {
      endOperation_W1(ops[i$1]);
    }

    for (var i$2 = 0; i$2 < ops.length; i$2++) // Read DOM
    {
      endOperation_R2(ops[i$2]);
    }

    for (var i$3 = 0; i$3 < ops.length; i$3++) // Write DOM (maybe)
    {
      endOperation_W2(ops[i$3]);
    }

    for (var i$4 = 0; i$4 < ops.length; i$4++) // Read DOM
    {
      endOperation_finish(ops[i$4]);
    }
  }

  function endOperation_R1(op) {
    var cm = op.cm,
        display = cm.display;
    maybeClipScrollbars(cm);

    if (op.updateMaxLine) {
      findMaxLine(cm);
    }

    op.mustUpdate = op.viewChanged || op.forceUpdate || op.scrollTop != null || op.scrollToPos && (op.scrollToPos.from.line < display.viewFrom || op.scrollToPos.to.line >= display.viewTo) || display.maxLineChanged && cm.options.lineWrapping;
    op.update = op.mustUpdate && new DisplayUpdate(cm, op.mustUpdate && {
      top: op.scrollTop,
      ensure: op.scrollToPos
    }, op.forceUpdate);
  }

  function endOperation_W1(op) {
    op.updatedDisplay = op.mustUpdate && updateDisplayIfNeeded(op.cm, op.update);
  }

  function endOperation_R2(op) {
    var cm = op.cm,
        display = cm.display;

    if (op.updatedDisplay) {
      updateHeightsInViewport(cm);
    }

    op.barMeasure = measureForScrollbars(cm); // If the max line changed since it was last measured, measure it,
    // and ensure the document's width matches it.
    // updateDisplay_W2 will use these properties to do the actual resizing

    if (display.maxLineChanged && !cm.options.lineWrapping) {
      op.adjustWidthTo = measureChar(cm, display.maxLine, display.maxLine.text.length).left + 3;
      cm.display.sizerWidth = op.adjustWidthTo;
      op.barMeasure.scrollWidth = Math.max(display.scroller.clientWidth, display.sizer.offsetLeft + op.adjustWidthTo + scrollGap(cm) + cm.display.barWidth);
      op.maxScrollLeft = Math.max(0, display.sizer.offsetLeft + op.adjustWidthTo - displayWidth(cm));
    }

    if (op.updatedDisplay || op.selectionChanged) {
      op.preparedSelection = display.input.prepareSelection();
    }
  }

  function endOperation_W2(op) {
    var cm = op.cm;

    if (op.adjustWidthTo != null) {
      cm.display.sizer.style.minWidth = op.adjustWidthTo + "px";

      if (op.maxScrollLeft < cm.doc.scrollLeft) {
        setScrollLeft(cm, Math.min(cm.display.scroller.scrollLeft, op.maxScrollLeft), true);
      }

      cm.display.maxLineChanged = false;
    }

    var takeFocus = op.focus && op.focus == activeElt();

    if (op.preparedSelection) {
      cm.display.input.showSelection(op.preparedSelection, takeFocus);
    }

    if (op.updatedDisplay || op.startHeight != cm.doc.height) {
      updateScrollbars(cm, op.barMeasure);
    }

    if (op.updatedDisplay) {
      setDocumentHeight(cm, op.barMeasure);
    }

    if (op.selectionChanged) {
      restartBlink(cm);
    }

    if (cm.state.focused && op.updateInput) {
      cm.display.input.reset(op.typing);
    }

    if (takeFocus) {
      ensureFocus(op.cm);
    }
  }

  function endOperation_finish(op) {
    var cm = op.cm,
        display = cm.display,
        doc = cm.doc;

    if (op.updatedDisplay) {
      postUpdateDisplay(cm, op.update);
    } // Abort mouse wheel delta measurement, when scrolling explicitly


    if (display.wheelStartX != null && (op.scrollTop != null || op.scrollLeft != null || op.scrollToPos)) {
      display.wheelStartX = display.wheelStartY = null;
    } // Propagate the scroll position to the actual DOM scroller


    if (op.scrollTop != null) {
      setScrollTop(cm, op.scrollTop, op.forceScroll);
    }

    if (op.scrollLeft != null) {
      setScrollLeft(cm, op.scrollLeft, true, true);
    } // If we need to scroll a specific position into view, do so.


    if (op.scrollToPos) {
      var rect = scrollPosIntoView(cm, _clipPos(doc, op.scrollToPos.from), _clipPos(doc, op.scrollToPos.to), op.scrollToPos.margin);
      maybeScrollWindow(cm, rect);
    } // Fire events for markers that are hidden/unidden by editing or
    // undoing


    var hidden = op.maybeHiddenMarkers,
        unhidden = op.maybeUnhiddenMarkers;

    if (hidden) {
      for (var i = 0; i < hidden.length; ++i) {
        if (!hidden[i].lines.length) {
          signal(hidden[i], "hide");
        }
      }
    }

    if (unhidden) {
      for (var i$1 = 0; i$1 < unhidden.length; ++i$1) {
        if (unhidden[i$1].lines.length) {
          signal(unhidden[i$1], "unhide");
        }
      }
    }

    if (display.wrapper.offsetHeight) {
      doc.scrollTop = cm.display.scroller.scrollTop;
    } // Fire change events, and delayed event handlers


    if (op.changeObjs) {
      signal(cm, "changes", cm, op.changeObjs);
    }

    if (op.update) {
      op.update.finish();
    }
  } // Run the given function in an operation


  function runInOp(cm, f) {
    if (cm.curOp) {
      return f();
    }

    _startOperation(cm);

    try {
      return f();
    } finally {
      _endOperation(cm);
    }
  } // Wraps a function in an operation. Returns the wrapped function.


  function operation(cm, f) {
    return function () {
      if (cm.curOp) {
        return f.apply(cm, arguments);
      }

      _startOperation(cm);

      try {
        return f.apply(cm, arguments);
      } finally {
        _endOperation(cm);
      }
    };
  } // Used to add methods to editor and doc instances, wrapping them in
  // operations.


  function methodOp(f) {
    return function () {
      if (this.curOp) {
        return f.apply(this, arguments);
      }

      _startOperation(this);

      try {
        return f.apply(this, arguments);
      } finally {
        _endOperation(this);
      }
    };
  }

  function docMethodOp(f) {
    return function () {
      var cm = this.cm;

      if (!cm || cm.curOp) {
        return f.apply(this, arguments);
      }

      _startOperation(cm);

      try {
        return f.apply(this, arguments);
      } finally {
        _endOperation(cm);
      }
    };
  } // HIGHLIGHT WORKER


  function startWorker(cm, time) {
    if (cm.doc.highlightFrontier < cm.display.viewTo) {
      cm.state.highlight.set(time, bind(highlightWorker, cm));
    }
  }

  function highlightWorker(cm) {
    var doc = cm.doc;

    if (doc.highlightFrontier >= cm.display.viewTo) {
      return;
    }

    var end = +new Date() + cm.options.workTime;
    var context = getContextBefore(cm, doc.highlightFrontier);
    var changedLines = [];
    doc.iter(context.line, Math.min(doc.first + doc.size, cm.display.viewTo + 500), function (line) {
      if (context.line >= cm.display.viewFrom) {
        // Visible
        var oldStyles = line.styles;
        var resetState = line.text.length > cm.options.maxHighlightLength ? copyState(doc.mode, context.state) : null;
        var highlighted = highlightLine(cm, line, context, true);

        if (resetState) {
          context.state = resetState;
        }

        line.styles = highlighted.styles;
        var oldCls = line.styleClasses,
            newCls = highlighted.classes;

        if (newCls) {
          line.styleClasses = newCls;
        } else if (oldCls) {
          line.styleClasses = null;
        }

        var ischange = !oldStyles || oldStyles.length != line.styles.length || oldCls != newCls && (!oldCls || !newCls || oldCls.bgClass != newCls.bgClass || oldCls.textClass != newCls.textClass);

        for (var i = 0; !ischange && i < oldStyles.length; ++i) {
          ischange = oldStyles[i] != line.styles[i];
        }

        if (ischange) {
          changedLines.push(context.line);
        }

        line.stateAfter = context.save();
        context.nextLine();
      } else {
        if (line.text.length <= cm.options.maxHighlightLength) {
          processLine(cm, line.text, context);
        }

        line.stateAfter = context.line % 5 == 0 ? context.save() : null;
        context.nextLine();
      }

      if (+new Date() > end) {
        startWorker(cm, cm.options.workDelay);
        return true;
      }
    });
    doc.highlightFrontier = context.line;
    doc.modeFrontier = Math.max(doc.modeFrontier, context.line);

    if (changedLines.length) {
      runInOp(cm, function () {
        for (var i = 0; i < changedLines.length; i++) {
          regLineChange(cm, changedLines[i], "text");
        }
      });
    }
  } // DISPLAY DRAWING


  var DisplayUpdate = function DisplayUpdate(cm, viewport, force) {
    var display = cm.display;
    this.viewport = viewport; // Store some values that we'll need later (but don't want to force a relayout for)

    this.visible = visibleLines(display, cm.doc, viewport);
    this.editorIsHidden = !display.wrapper.offsetWidth;
    this.wrapperHeight = display.wrapper.clientHeight;
    this.wrapperWidth = display.wrapper.clientWidth;
    this.oldDisplayWidth = displayWidth(cm);
    this.force = force;
    this.dims = getDimensions(cm);
    this.events = [];
  };

  DisplayUpdate.prototype.signal = function (emitter, type) {
    if (hasHandler(emitter, type)) {
      this.events.push(arguments);
    }
  };

  DisplayUpdate.prototype.finish = function () {
    var this$1 = this;

    for (var i = 0; i < this.events.length; i++) {
      signal.apply(null, this$1.events[i]);
    }
  };

  function maybeClipScrollbars(cm) {
    var display = cm.display;

    if (!display.scrollbarsClipped && display.scroller.offsetWidth) {
      display.nativeBarWidth = display.scroller.offsetWidth - display.scroller.clientWidth;
      display.heightForcer.style.height = scrollGap(cm) + "px";
      display.sizer.style.marginBottom = -display.nativeBarWidth + "px";
      display.sizer.style.borderRightWidth = scrollGap(cm) + "px";
      display.scrollbarsClipped = true;
    }
  }

  function selectionSnapshot(cm) {
    if (cm.hasFocus()) {
      return null;
    }

    var active = activeElt();

    if (!active || !contains(cm.display.lineDiv, active)) {
      return null;
    }

    var result = {
      activeElt: active
    };

    if (window.getSelection) {
      var sel = window.getSelection();

      if (sel.anchorNode && sel.extend && contains(cm.display.lineDiv, sel.anchorNode)) {
        result.anchorNode = sel.anchorNode;
        result.anchorOffset = sel.anchorOffset;
        result.focusNode = sel.focusNode;
        result.focusOffset = sel.focusOffset;
      }
    }

    return result;
  }

  function restoreSelection(snapshot) {
    if (!snapshot || !snapshot.activeElt || snapshot.activeElt == activeElt()) {
      return;
    }

    snapshot.activeElt.focus();

    if (snapshot.anchorNode && contains(document.body, snapshot.anchorNode) && contains(document.body, snapshot.focusNode)) {
      var sel = window.getSelection(),
          range$$1 = document.createRange();
      range$$1.setEnd(snapshot.anchorNode, snapshot.anchorOffset);
      range$$1.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range$$1);
      sel.extend(snapshot.focusNode, snapshot.focusOffset);
    }
  } // Does the actual updating of the line display. Bails out
  // (returning false) when there is nothing to be done and forced is
  // false.


  function updateDisplayIfNeeded(cm, update) {
    var display = cm.display,
        doc = cm.doc;

    if (update.editorIsHidden) {
      resetView(cm);
      return false;
    } // Bail out if the visible area is already rendered and nothing changed.


    if (!update.force && update.visible.from >= display.viewFrom && update.visible.to <= display.viewTo && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo) && display.renderedView == display.view && countDirtyView(cm) == 0) {
      return false;
    }

    if (maybeUpdateLineNumberWidth(cm)) {
      resetView(cm);
      update.dims = getDimensions(cm);
    } // Compute a suitable new viewport (from & to)


    var end = doc.first + doc.size;
    var from = Math.max(update.visible.from - cm.options.viewportMargin, doc.first);
    var to = Math.min(end, update.visible.to + cm.options.viewportMargin);

    if (display.viewFrom < from && from - display.viewFrom < 20) {
      from = Math.max(doc.first, display.viewFrom);
    }

    if (display.viewTo > to && display.viewTo - to < 20) {
      to = Math.min(end, display.viewTo);
    }

    if (sawCollapsedSpans) {
      from = visualLineNo(cm.doc, from);
      to = visualLineEndNo(cm.doc, to);
    }

    var different = from != display.viewFrom || to != display.viewTo || display.lastWrapHeight != update.wrapperHeight || display.lastWrapWidth != update.wrapperWidth;
    adjustView(cm, from, to);
    display.viewOffset = _heightAtLine(getLine(cm.doc, display.viewFrom)); // Position the mover div to align with the current scroll position

    cm.display.mover.style.top = display.viewOffset + "px";
    var toUpdate = countDirtyView(cm);

    if (!different && toUpdate == 0 && !update.force && display.renderedView == display.view && (display.updateLineNumbers == null || display.updateLineNumbers >= display.viewTo)) {
      return false;
    } // For big changes, we hide the enclosing element during the
    // update, since that speeds up the operations on most browsers.


    var selSnapshot = selectionSnapshot(cm);

    if (toUpdate > 4) {
      display.lineDiv.style.display = "none";
    }

    patchDisplay(cm, display.updateLineNumbers, update.dims);

    if (toUpdate > 4) {
      display.lineDiv.style.display = "";
    }

    display.renderedView = display.view; // There might have been a widget with a focused element that got
    // hidden or updated, if so re-focus it.

    restoreSelection(selSnapshot); // Prevent selection and cursors from interfering with the scroll
    // width and height.

    removeChildren(display.cursorDiv);
    removeChildren(display.selectionDiv);
    display.gutters.style.height = display.sizer.style.minHeight = 0;

    if (different) {
      display.lastWrapHeight = update.wrapperHeight;
      display.lastWrapWidth = update.wrapperWidth;
      startWorker(cm, 400);
    }

    display.updateLineNumbers = null;
    return true;
  }

  function postUpdateDisplay(cm, update) {
    var viewport = update.viewport;

    for (var first = true;; first = false) {
      if (!first || !cm.options.lineWrapping || update.oldDisplayWidth == displayWidth(cm)) {
        // Clip forced viewport to actual scrollable area.
        if (viewport && viewport.top != null) {
          viewport = {
            top: Math.min(cm.doc.height + paddingVert(cm.display) - displayHeight(cm), viewport.top)
          };
        } // Updated line heights might result in the drawn area not
        // actually covering the viewport. Keep looping until it does.


        update.visible = visibleLines(cm.display, cm.doc, viewport);

        if (update.visible.from >= cm.display.viewFrom && update.visible.to <= cm.display.viewTo) {
          break;
        }
      }

      if (!updateDisplayIfNeeded(cm, update)) {
        break;
      }

      updateHeightsInViewport(cm);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.force = false;
    }

    update.signal(cm, "update", cm);

    if (cm.display.viewFrom != cm.display.reportedViewFrom || cm.display.viewTo != cm.display.reportedViewTo) {
      update.signal(cm, "viewportChange", cm, cm.display.viewFrom, cm.display.viewTo);
      cm.display.reportedViewFrom = cm.display.viewFrom;
      cm.display.reportedViewTo = cm.display.viewTo;
    }
  }

  function updateDisplaySimple(cm, viewport) {
    var update = new DisplayUpdate(cm, viewport);

    if (updateDisplayIfNeeded(cm, update)) {
      updateHeightsInViewport(cm);
      postUpdateDisplay(cm, update);
      var barMeasure = measureForScrollbars(cm);
      updateSelection(cm);
      updateScrollbars(cm, barMeasure);
      setDocumentHeight(cm, barMeasure);
      update.finish();
    }
  } // Sync the actual display DOM structure with display.view, removing
  // nodes for lines that are no longer in view, and creating the ones
  // that are not there yet, and updating the ones that are out of
  // date.


  function patchDisplay(cm, updateNumbersFrom, dims) {
    var display = cm.display,
        lineNumbers = cm.options.lineNumbers;
    var container = display.lineDiv,
        cur = container.firstChild;

    function rm(node) {
      var next = node.nextSibling; // Works around a throw-scroll bug in OS X Webkit

      if (webkit && mac && cm.display.currentWheelTarget == node) {
        node.style.display = "none";
      } else {
        node.parentNode.removeChild(node);
      }

      return next;
    }

    var view = display.view,
        lineN = display.viewFrom; // Loop over the elements in the view, syncing cur (the DOM nodes
    // in display.lineDiv) with the view as we go.

    for (var i = 0; i < view.length; i++) {
      var lineView = view[i];
      if (lineView.hidden) ;else if (!lineView.node || lineView.node.parentNode != container) {
        // Not drawn yet
        var node = buildLineElement(cm, lineView, lineN, dims);
        container.insertBefore(node, cur);
      } else {
        // Already drawn
        while (cur != lineView.node) {
          cur = rm(cur);
        }

        var updateNumber = lineNumbers && updateNumbersFrom != null && updateNumbersFrom <= lineN && lineView.lineNumber;

        if (lineView.changes) {
          if (indexOf(lineView.changes, "gutter") > -1) {
            updateNumber = false;
          }

          updateLineForChanges(cm, lineView, lineN, dims);
        }

        if (updateNumber) {
          removeChildren(lineView.lineNumber);
          lineView.lineNumber.appendChild(document.createTextNode(lineNumberFor(cm.options, lineN)));
        }

        cur = lineView.node.nextSibling;
      }
      lineN += lineView.size;
    }

    while (cur) {
      cur = rm(cur);
    }
  }

  function updateGutterSpace(display) {
    var width = display.gutters.offsetWidth;
    display.sizer.style.marginLeft = width + "px";
  }

  function setDocumentHeight(cm, measure) {
    cm.display.sizer.style.minHeight = measure.docHeight + "px";
    cm.display.heightForcer.style.top = measure.docHeight + "px";
    cm.display.gutters.style.height = measure.docHeight + cm.display.barHeight + scrollGap(cm) + "px";
  } // Re-align line numbers and gutter marks to compensate for
  // horizontal scrolling.


  function alignHorizontally(cm) {
    var display = cm.display,
        view = display.view;

    if (!display.alignWidgets && (!display.gutters.firstChild || !cm.options.fixedGutter)) {
      return;
    }

    var comp = compensateForHScroll(display) - display.scroller.scrollLeft + cm.doc.scrollLeft;
    var gutterW = display.gutters.offsetWidth,
        left = comp + "px";

    for (var i = 0; i < view.length; i++) {
      if (!view[i].hidden) {
        if (cm.options.fixedGutter) {
          if (view[i].gutter) {
            view[i].gutter.style.left = left;
          }

          if (view[i].gutterBackground) {
            view[i].gutterBackground.style.left = left;
          }
        }

        var align = view[i].alignable;

        if (align) {
          for (var j = 0; j < align.length; j++) {
            align[j].style.left = left;
          }
        }
      }
    }

    if (cm.options.fixedGutter) {
      display.gutters.style.left = comp + gutterW + "px";
    }
  } // Used to ensure that the line number gutter is still the right
  // size for the current document size. Returns true when an update
  // is needed.


  function maybeUpdateLineNumberWidth(cm) {
    if (!cm.options.lineNumbers) {
      return false;
    }

    var doc = cm.doc,
        last = lineNumberFor(cm.options, doc.first + doc.size - 1),
        display = cm.display;

    if (last.length != display.lineNumChars) {
      var test = display.measure.appendChild(elt("div", [elt("div", last)], "CodeMirror-linenumber CodeMirror-gutter-elt"));
      var innerW = test.firstChild.offsetWidth,
          padding = test.offsetWidth - innerW;
      display.lineGutter.style.width = "";
      display.lineNumInnerWidth = Math.max(innerW, display.lineGutter.offsetWidth - padding) + 1;
      display.lineNumWidth = display.lineNumInnerWidth + padding;
      display.lineNumChars = display.lineNumInnerWidth ? last.length : -1;
      display.lineGutter.style.width = display.lineNumWidth + "px";
      updateGutterSpace(cm.display);
      return true;
    }

    return false;
  }

  function getGutters(gutters, lineNumbers) {
    var result = [],
        sawLineNumbers = false;

    for (var i = 0; i < gutters.length; i++) {
      var name = gutters[i],
          style = null;

      if (typeof name != "string") {
        style = name.style;
        name = name.className;
      }

      if (name == "CodeMirror-linenumbers") {
        if (!lineNumbers) {
          continue;
        } else {
          sawLineNumbers = true;
        }
      }

      result.push({
        className: name,
        style: style
      });
    }

    if (lineNumbers && !sawLineNumbers) {
      result.push({
        className: "CodeMirror-linenumbers",
        style: null
      });
    }

    return result;
  } // Rebuild the gutter elements, ensure the margin to the left of the
  // code matches their width.


  function renderGutters(display) {
    var gutters = display.gutters,
        specs = display.gutterSpecs;
    removeChildren(gutters);
    display.lineGutter = null;

    for (var i = 0; i < specs.length; ++i) {
      var ref = specs[i];
      var className = ref.className;
      var style = ref.style;
      var gElt = gutters.appendChild(elt("div", null, "CodeMirror-gutter " + className));

      if (style) {
        gElt.style.cssText = style;
      }

      if (className == "CodeMirror-linenumbers") {
        display.lineGutter = gElt;
        gElt.style.width = (display.lineNumWidth || 1) + "px";
      }
    }

    gutters.style.display = specs.length ? "" : "none";
    updateGutterSpace(display);
  }

  function updateGutters(cm) {
    renderGutters(cm.display);
    regChange(cm);
    alignHorizontally(cm);
  } // The display handles the DOM integration, both for input reading
  // and content drawing. It holds references to DOM nodes and
  // display-related state.


  function Display(place, doc, input, options) {
    var d = this;
    this.input = input; // Covers bottom-right square when both scrollbars are present.

    d.scrollbarFiller = elt("div", null, "CodeMirror-scrollbar-filler");
    d.scrollbarFiller.setAttribute("cm-not-content", "true"); // Covers bottom of gutter when coverGutterNextToScrollbar is on
    // and h scrollbar is present.

    d.gutterFiller = elt("div", null, "CodeMirror-gutter-filler");
    d.gutterFiller.setAttribute("cm-not-content", "true"); // Will contain the actual code, positioned to cover the viewport.

    d.lineDiv = eltP("div", null, "CodeMirror-code"); // Elements are added to these to represent selection and cursors.

    d.selectionDiv = elt("div", null, null, "position: relative; z-index: 1");
    d.cursorDiv = elt("div", null, "CodeMirror-cursors"); // A visibility: hidden element used to find the size of things.

    d.measure = elt("div", null, "CodeMirror-measure"); // When lines outside of the viewport are measured, they are drawn in this.

    d.lineMeasure = elt("div", null, "CodeMirror-measure"); // Wraps everything that needs to exist inside the vertically-padded coordinate system

    d.lineSpace = eltP("div", [d.measure, d.lineMeasure, d.selectionDiv, d.cursorDiv, d.lineDiv], null, "position: relative; outline: none");
    var lines = eltP("div", [d.lineSpace], "CodeMirror-lines"); // Moved around its parent to cover visible view.

    d.mover = elt("div", [lines], null, "position: relative"); // Set to the height of the document, allowing scrolling.

    d.sizer = elt("div", [d.mover], "CodeMirror-sizer");
    d.sizerWidth = null; // Behavior of elts with overflow: auto and padding is
    // inconsistent across browsers. This is used to ensure the
    // scrollable area is big enough.

    d.heightForcer = elt("div", null, null, "position: absolute; height: " + scrollerGap + "px; width: 1px;"); // Will contain the gutters, if any.

    d.gutters = elt("div", null, "CodeMirror-gutters");
    d.lineGutter = null; // Actual scrollable element.

    d.scroller = elt("div", [d.sizer, d.heightForcer, d.gutters], "CodeMirror-scroll");
    d.scroller.setAttribute("tabIndex", "-1"); // The element in which the editor lives.

    d.wrapper = elt("div", [d.scrollbarFiller, d.gutterFiller, d.scroller], "CodeMirror"); // Work around IE7 z-index bug (not perfect, hence IE7 not really being supported)

    if (ie && ie_version < 8) {
      d.gutters.style.zIndex = -1;
      d.scroller.style.paddingRight = 0;
    }

    if (!webkit && !(gecko && mobile)) {
      d.scroller.draggable = true;
    }

    if (place) {
      if (place.appendChild) {
        place.appendChild(d.wrapper);
      } else {
        place(d.wrapper);
      }
    } // Current rendered range (may be bigger than the view window).


    d.viewFrom = d.viewTo = doc.first;
    d.reportedViewFrom = d.reportedViewTo = doc.first; // Information about the rendered lines.

    d.view = [];
    d.renderedView = null; // Holds info about a single rendered line when it was rendered
    // for measurement, while not in view.

    d.externalMeasured = null; // Empty space (in pixels) above the view

    d.viewOffset = 0;
    d.lastWrapHeight = d.lastWrapWidth = 0;
    d.updateLineNumbers = null;
    d.nativeBarWidth = d.barHeight = d.barWidth = 0;
    d.scrollbarsClipped = false; // Used to only resize the line number gutter when necessary (when
    // the amount of lines crosses a boundary that makes its width change)

    d.lineNumWidth = d.lineNumInnerWidth = d.lineNumChars = null; // Set to true when a non-horizontal-scrolling line widget is
    // added. As an optimization, line widget aligning is skipped when
    // this is false.

    d.alignWidgets = false;
    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null; // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.

    d.maxLine = null;
    d.maxLineLength = 0;
    d.maxLineChanged = false; // Used for measuring wheel scrolling granularity

    d.wheelDX = d.wheelDY = d.wheelStartX = d.wheelStartY = null; // True when shift is held down.

    d.shift = false; // Used to track whether anything happened since the context menu
    // was opened.

    d.selForContextMenu = null;
    d.activeTouch = null;
    d.gutterSpecs = getGutters(options.gutters, options.lineNumbers);
    renderGutters(d);
    input.init(d);
  } // Since the delta values reported on mouse wheel events are
  // unstandardized between browsers and even browser versions, and
  // generally horribly unpredictable, this code starts by measuring
  // the scroll effect that the first few mouse wheel events have,
  // and, from that, detects the way it can convert deltas to pixel
  // offsets afterwards.
  //
  // The reason we want to know the amount a wheel event will scroll
  // is that it gives us a chance to update the display before the
  // actual scrolling happens, reducing flickering.


  var wheelSamples = 0,
      wheelPixelsPerUnit = null; // Fill in a browser-detected starting value on browsers where we
  // know one. These don't have to be accurate -- the result of them
  // being wrong would just be a slight flicker on the first wheel
  // scroll (if it is large enough).

  if (ie) {
    wheelPixelsPerUnit = -.53;
  } else if (gecko) {
    wheelPixelsPerUnit = 15;
  } else if (chrome) {
    wheelPixelsPerUnit = -.7;
  } else if (safari) {
    wheelPixelsPerUnit = -1 / 3;
  }

  function wheelEventDelta(e) {
    var dx = e.wheelDeltaX,
        dy = e.wheelDeltaY;

    if (dx == null && e.detail && e.axis == e.HORIZONTAL_AXIS) {
      dx = e.detail;
    }

    if (dy == null && e.detail && e.axis == e.VERTICAL_AXIS) {
      dy = e.detail;
    } else if (dy == null) {
      dy = e.wheelDelta;
    }

    return {
      x: dx,
      y: dy
    };
  }

  function wheelEventPixels(e) {
    var delta = wheelEventDelta(e);
    delta.x *= wheelPixelsPerUnit;
    delta.y *= wheelPixelsPerUnit;
    return delta;
  }

  function onScrollWheel(cm, e) {
    var delta = wheelEventDelta(e),
        dx = delta.x,
        dy = delta.y;
    var display = cm.display,
        scroll = display.scroller; // Quit if there's nothing to scroll here

    var canScrollX = scroll.scrollWidth > scroll.clientWidth;
    var canScrollY = scroll.scrollHeight > scroll.clientHeight;

    if (!(dx && canScrollX || dy && canScrollY)) {
      return;
    } // Webkit browsers on OS X abort momentum scrolls when the target
    // of the scroll event is removed from the scrollable element.
    // This hack (see related code in patchDisplay) makes sure the
    // element is kept around.


    if (dy && mac && webkit) {
      outer: for (var cur = e.target, view = display.view; cur != scroll; cur = cur.parentNode) {
        for (var i = 0; i < view.length; i++) {
          if (view[i].node == cur) {
            cm.display.currentWheelTarget = cur;
            break outer;
          }
        }
      }
    } // On some browsers, horizontal scrolling will cause redraws to
    // happen before the gutter has been realigned, causing it to
    // wriggle around in a most unseemly way. When we have an
    // estimated pixels/delta value, we just handle horizontal
    // scrolling entirely here. It'll be slightly off from native, but
    // better than glitching out.


    if (dx && !gecko && !presto && wheelPixelsPerUnit != null) {
      if (dy && canScrollY) {
        updateScrollTop(cm, Math.max(0, scroll.scrollTop + dy * wheelPixelsPerUnit));
      }

      setScrollLeft(cm, Math.max(0, scroll.scrollLeft + dx * wheelPixelsPerUnit)); // Only prevent default scrolling if vertical scrolling is
      // actually possible. Otherwise, it causes vertical scroll
      // jitter on OSX trackpads when deltaX is small and deltaY
      // is large (issue #3579)

      if (!dy || dy && canScrollY) {
        e_preventDefault(e);
      }

      display.wheelStartX = null; // Abort measurement, if in progress

      return;
    } // 'Project' the visible viewport to cover the area that is being
    // scrolled into view (if we know enough to estimate it).


    if (dy && wheelPixelsPerUnit != null) {
      var pixels = dy * wheelPixelsPerUnit;
      var top = cm.doc.scrollTop,
          bot = top + display.wrapper.clientHeight;

      if (pixels < 0) {
        top = Math.max(0, top + pixels - 50);
      } else {
        bot = Math.min(cm.doc.height, bot + pixels + 50);
      }

      updateDisplaySimple(cm, {
        top: top,
        bottom: bot
      });
    }

    if (wheelSamples < 20) {
      if (display.wheelStartX == null) {
        display.wheelStartX = scroll.scrollLeft;
        display.wheelStartY = scroll.scrollTop;
        display.wheelDX = dx;
        display.wheelDY = dy;
        setTimeout(function () {
          if (display.wheelStartX == null) {
            return;
          }

          var movedX = scroll.scrollLeft - display.wheelStartX;
          var movedY = scroll.scrollTop - display.wheelStartY;
          var sample = movedY && display.wheelDY && movedY / display.wheelDY || movedX && display.wheelDX && movedX / display.wheelDX;
          display.wheelStartX = display.wheelStartY = null;

          if (!sample) {
            return;
          }

          wheelPixelsPerUnit = (wheelPixelsPerUnit * wheelSamples + sample) / (wheelSamples + 1);
          ++wheelSamples;
        }, 200);
      } else {
        display.wheelDX += dx;
        display.wheelDY += dy;
      }
    }
  } // Selection objects are immutable. A new one is created every time
  // the selection changes. A selection is one or more non-overlapping
  // (and non-touching) ranges, sorted, and an integer that indicates
  // which one is the primary selection (the one that's scrolled into
  // view, that getCursor returns, etc).


  var Selection = function Selection(ranges, primIndex) {
    this.ranges = ranges;
    this.primIndex = primIndex;
  };

  Selection.prototype.primary = function () {
    return this.ranges[this.primIndex];
  };

  Selection.prototype.equals = function (other) {
    var this$1 = this;

    if (other == this) {
      return true;
    }

    if (other.primIndex != this.primIndex || other.ranges.length != this.ranges.length) {
      return false;
    }

    for (var i = 0; i < this.ranges.length; i++) {
      var here = this$1.ranges[i],
          there = other.ranges[i];

      if (!equalCursorPos(here.anchor, there.anchor) || !equalCursorPos(here.head, there.head)) {
        return false;
      }
    }

    return true;
  };

  Selection.prototype.deepCopy = function () {
    var this$1 = this;
    var out = [];

    for (var i = 0; i < this.ranges.length; i++) {
      out[i] = new Range(copyPos(this$1.ranges[i].anchor), copyPos(this$1.ranges[i].head));
    }

    return new Selection(out, this.primIndex);
  };

  Selection.prototype.somethingSelected = function () {
    var this$1 = this;

    for (var i = 0; i < this.ranges.length; i++) {
      if (!this$1.ranges[i].empty()) {
        return true;
      }
    }

    return false;
  };

  Selection.prototype.contains = function (pos, end) {
    var this$1 = this;

    if (!end) {
      end = pos;
    }

    for (var i = 0; i < this.ranges.length; i++) {
      var range = this$1.ranges[i];

      if (cmp(end, range.from()) >= 0 && cmp(pos, range.to()) <= 0) {
        return i;
      }
    }

    return -1;
  };

  var Range = function Range(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  };

  Range.prototype.from = function () {
    return minPos(this.anchor, this.head);
  };

  Range.prototype.to = function () {
    return maxPos(this.anchor, this.head);
  };

  Range.prototype.empty = function () {
    return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
  }; // Take an unsorted, potentially overlapping set of ranges, and
  // build a selection out of it. 'Consumes' ranges array (modifying
  // it).


  function normalizeSelection(cm, ranges, primIndex) {
    var mayTouch = cm && cm.options.selectionsMayTouch;
    var prim = ranges[primIndex];
    ranges.sort(function (a, b) {
      return cmp(a.from(), b.from());
    });
    primIndex = indexOf(ranges, prim);

    for (var i = 1; i < ranges.length; i++) {
      var cur = ranges[i],
          prev = ranges[i - 1];
      var diff = cmp(prev.to(), cur.from());

      if (mayTouch && !cur.empty() ? diff > 0 : diff >= 0) {
        var from = minPos(prev.from(), cur.from()),
            to = maxPos(prev.to(), cur.to());
        var inv = prev.empty() ? cur.from() == cur.head : prev.from() == prev.head;

        if (i <= primIndex) {
          --primIndex;
        }

        ranges.splice(--i, 2, new Range(inv ? to : from, inv ? from : to));
      }
    }

    return new Selection(ranges, primIndex);
  }

  function simpleSelection(anchor, head) {
    return new Selection([new Range(anchor, head || anchor)], 0);
  } // Compute the position of the end of a change (its 'to' property
  // refers to the pre-change end).


  function changeEnd(change) {
    if (!change.text) {
      return change.to;
    }

    return Pos(change.from.line + change.text.length - 1, lst(change.text).length + (change.text.length == 1 ? change.from.ch : 0));
  } // Adjust a position to refer to the post-change position of the
  // same text, or the end of the change if the change covers it.


  function adjustForChange(pos, change) {
    if (cmp(pos, change.from) < 0) {
      return pos;
    }

    if (cmp(pos, change.to) <= 0) {
      return changeEnd(change);
    }

    var line = pos.line + change.text.length - (change.to.line - change.from.line) - 1,
        ch = pos.ch;

    if (pos.line == change.to.line) {
      ch += changeEnd(change).ch - change.to.ch;
    }

    return Pos(line, ch);
  }

  function computeSelAfterChange(doc, change) {
    var out = [];

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      var range = doc.sel.ranges[i];
      out.push(new Range(adjustForChange(range.anchor, change), adjustForChange(range.head, change)));
    }

    return normalizeSelection(doc.cm, out, doc.sel.primIndex);
  }

  function offsetPos(pos, old, nw) {
    if (pos.line == old.line) {
      return Pos(nw.line, pos.ch - old.ch + nw.ch);
    } else {
      return Pos(nw.line + (pos.line - old.line), pos.ch);
    }
  } // Used by replaceSelections to allow moving the selection to the
  // start or around the replaced test. Hint may be "start" or "around".


  function computeReplacedSel(doc, changes, hint) {
    var out = [];
    var oldPrev = Pos(doc.first, 0),
        newPrev = oldPrev;

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];
      var from = offsetPos(change.from, oldPrev, newPrev);
      var to = offsetPos(changeEnd(change), oldPrev, newPrev);
      oldPrev = change.to;
      newPrev = to;

      if (hint == "around") {
        var range = doc.sel.ranges[i],
            inv = cmp(range.head, range.anchor) < 0;
        out[i] = new Range(inv ? to : from, inv ? from : to);
      } else {
        out[i] = new Range(from, from);
      }
    }

    return new Selection(out, doc.sel.primIndex);
  } // Used to get the editor into a consistent state again when options change.


  function loadMode(cm) {
    cm.doc.mode = getMode(cm.options, cm.doc.modeOption);
    resetModeState(cm);
  }

  function resetModeState(cm) {
    cm.doc.iter(function (line) {
      if (line.stateAfter) {
        line.stateAfter = null;
      }

      if (line.styles) {
        line.styles = null;
      }
    });
    cm.doc.modeFrontier = cm.doc.highlightFrontier = cm.doc.first;
    startWorker(cm, 100);
    cm.state.modeGen++;

    if (cm.curOp) {
      regChange(cm);
    }
  } // DOCUMENT DATA STRUCTURE
  // By default, updates that start and end at the beginning of a line
  // are treated specially, in order to make the association of line
  // widgets and marker elements with the text behave more intuitive.


  function isWholeLineUpdate(doc, change) {
    return change.from.ch == 0 && change.to.ch == 0 && lst(change.text) == "" && (!doc.cm || doc.cm.options.wholeLineUpdateBefore);
  } // Perform a change on the document data structure.


  function updateDoc(doc, change, markedSpans, estimateHeight$$1) {
    function spansFor(n) {
      return markedSpans ? markedSpans[n] : null;
    }

    function update(line, text, spans) {
      updateLine(line, text, spans, estimateHeight$$1);
      signalLater(line, "change", line, change);
    }

    function linesFor(start, end) {
      var result = [];

      for (var i = start; i < end; ++i) {
        result.push(new Line(text[i], spansFor(i), estimateHeight$$1));
      }

      return result;
    }

    var from = change.from,
        to = change.to,
        text = change.text;
    var firstLine = getLine(doc, from.line),
        lastLine = getLine(doc, to.line);
    var lastText = lst(text),
        lastSpans = spansFor(text.length - 1),
        nlines = to.line - from.line; // Adjust the line structure

    if (change.full) {
      doc.insert(0, linesFor(0, text.length));
      doc.remove(text.length, doc.size - text.length);
    } else if (isWholeLineUpdate(doc, change)) {
      // This is a whole-line replace. Treated specially to make
      // sure line objects move the way they are supposed to.
      var added = linesFor(0, text.length - 1);
      update(lastLine, lastLine.text, lastSpans);

      if (nlines) {
        doc.remove(from.line, nlines);
      }

      if (added.length) {
        doc.insert(from.line, added);
      }
    } else if (firstLine == lastLine) {
      if (text.length == 1) {
        update(firstLine, firstLine.text.slice(0, from.ch) + lastText + firstLine.text.slice(to.ch), lastSpans);
      } else {
        var added$1 = linesFor(1, text.length - 1);
        added$1.push(new Line(lastText + firstLine.text.slice(to.ch), lastSpans, estimateHeight$$1));
        update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
        doc.insert(from.line + 1, added$1);
      }
    } else if (text.length == 1) {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0] + lastLine.text.slice(to.ch), spansFor(0));
      doc.remove(from.line + 1, nlines);
    } else {
      update(firstLine, firstLine.text.slice(0, from.ch) + text[0], spansFor(0));
      update(lastLine, lastText + lastLine.text.slice(to.ch), lastSpans);
      var added$2 = linesFor(1, text.length - 1);

      if (nlines > 1) {
        doc.remove(from.line + 1, nlines - 1);
      }

      doc.insert(from.line + 1, added$2);
    }

    signalLater(doc, "change", doc, change);
  } // Call f for all linked documents.


  function linkedDocs(doc, f, sharedHistOnly) {
    function propagate(doc, skip, sharedHist) {
      if (doc.linked) {
        for (var i = 0; i < doc.linked.length; ++i) {
          var rel = doc.linked[i];

          if (rel.doc == skip) {
            continue;
          }

          var shared = sharedHist && rel.sharedHist;

          if (sharedHistOnly && !shared) {
            continue;
          }

          f(rel.doc, shared);
          propagate(rel.doc, doc, shared);
        }
      }
    }

    propagate(doc, null, true);
  } // Attach a document to an editor.


  function attachDoc(cm, doc) {
    if (doc.cm) {
      throw new Error("This document is already in use.");
    }

    cm.doc = doc;
    doc.cm = cm;
    estimateLineHeights(cm);
    loadMode(cm);
    setDirectionClass(cm);

    if (!cm.options.lineWrapping) {
      findMaxLine(cm);
    }

    cm.options.mode = doc.modeOption;
    regChange(cm);
  }

  function setDirectionClass(cm) {
    (cm.doc.direction == "rtl" ? addClass : rmClass)(cm.display.lineDiv, "CodeMirror-rtl");
  }

  function directionChanged(cm) {
    runInOp(cm, function () {
      setDirectionClass(cm);
      regChange(cm);
    });
  }

  function History(startGen) {
    // Arrays of change events and selections. Doing something adds an
    // event to done and clears undo. Undoing moves events from done
    // to undone, redoing moves them in the other direction.
    this.done = [];
    this.undone = [];
    this.undoDepth = Infinity; // Used to track when changes can be merged into a single undo
    // event

    this.lastModTime = this.lastSelTime = 0;
    this.lastOp = this.lastSelOp = null;
    this.lastOrigin = this.lastSelOrigin = null; // Used by the isClean() method

    this.generation = this.maxGeneration = startGen || 1;
  } // Create a history change event from an updateDoc-style change
  // object.


  function historyChangeFromChange(doc, change) {
    var histChange = {
      from: copyPos(change.from),
      to: changeEnd(change),
      text: getBetween(doc, change.from, change.to)
    };
    attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    linkedDocs(doc, function (doc) {
      return attachLocalSpans(doc, histChange, change.from.line, change.to.line + 1);
    }, true);
    return histChange;
  } // Pop all selection events off the end of a history array. Stop at
  // a change event.


  function clearSelectionEvents(array) {
    while (array.length) {
      var last = lst(array);

      if (last.ranges) {
        array.pop();
      } else {
        break;
      }
    }
  } // Find the top change event in the history. Pop off selection
  // events that are in the way.


  function lastChangeEvent(hist, force) {
    if (force) {
      clearSelectionEvents(hist.done);
      return lst(hist.done);
    } else if (hist.done.length && !lst(hist.done).ranges) {
      return lst(hist.done);
    } else if (hist.done.length > 1 && !hist.done[hist.done.length - 2].ranges) {
      hist.done.pop();
      return lst(hist.done);
    }
  } // Register a change in the history. Merges changes that are within
  // a single operation, or are close together with an origin that
  // allows merging (starting with "+") into a single event.


  function addChangeToHistory(doc, change, selAfter, opId) {
    var hist = doc.history;
    hist.undone.length = 0;
    var time = +new Date(),
        cur;
    var last;

    if ((hist.lastOp == opId || hist.lastOrigin == change.origin && change.origin && (change.origin.charAt(0) == "+" && hist.lastModTime > time - (doc.cm ? doc.cm.options.historyEventDelay : 500) || change.origin.charAt(0) == "*")) && (cur = lastChangeEvent(hist, hist.lastOp == opId))) {
      // Merge this change into the last event
      last = lst(cur.changes);

      if (cmp(change.from, change.to) == 0 && cmp(change.from, last.to) == 0) {
        // Optimized case for simple insertion -- don't want to add
        // new changesets for every character typed
        last.to = changeEnd(change);
      } else {
        // Add new sub-event
        cur.changes.push(historyChangeFromChange(doc, change));
      }
    } else {
      // Can not be merged, start a new event.
      var before = lst(hist.done);

      if (!before || !before.ranges) {
        pushSelectionToHistory(doc.sel, hist.done);
      }

      cur = {
        changes: [historyChangeFromChange(doc, change)],
        generation: hist.generation
      };
      hist.done.push(cur);

      while (hist.done.length > hist.undoDepth) {
        hist.done.shift();

        if (!hist.done[0].ranges) {
          hist.done.shift();
        }
      }
    }

    hist.done.push(selAfter);
    hist.generation = ++hist.maxGeneration;
    hist.lastModTime = hist.lastSelTime = time;
    hist.lastOp = hist.lastSelOp = opId;
    hist.lastOrigin = hist.lastSelOrigin = change.origin;

    if (!last) {
      signal(doc, "historyAdded");
    }
  }

  function selectionEventCanBeMerged(doc, origin, prev, sel) {
    var ch = origin.charAt(0);
    return ch == "*" || ch == "+" && prev.ranges.length == sel.ranges.length && prev.somethingSelected() == sel.somethingSelected() && new Date() - doc.history.lastSelTime <= (doc.cm ? doc.cm.options.historyEventDelay : 500);
  } // Called whenever the selection changes, sets the new selection as
  // the pending selection in the history, and pushes the old pending
  // selection into the 'done' array when it was significantly
  // different (in number of selected ranges, emptiness, or time).


  function addSelectionToHistory(doc, sel, opId, options) {
    var hist = doc.history,
        origin = options && options.origin; // A new event is started when the previous origin does not match
    // the current, or the origins don't allow matching. Origins
    // starting with * are always merged, those starting with + are
    // merged when similar and close together in time.

    if (opId == hist.lastSelOp || origin && hist.lastSelOrigin == origin && (hist.lastModTime == hist.lastSelTime && hist.lastOrigin == origin || selectionEventCanBeMerged(doc, origin, lst(hist.done), sel))) {
      hist.done[hist.done.length - 1] = sel;
    } else {
      pushSelectionToHistory(sel, hist.done);
    }

    hist.lastSelTime = +new Date();
    hist.lastSelOrigin = origin;
    hist.lastSelOp = opId;

    if (options && options.clearRedo !== false) {
      clearSelectionEvents(hist.undone);
    }
  }

  function pushSelectionToHistory(sel, dest) {
    var top = lst(dest);

    if (!(top && top.ranges && top.equals(sel))) {
      dest.push(sel);
    }
  } // Used to store marked span information in the history.


  function attachLocalSpans(doc, change, from, to) {
    var existing = change["spans_" + doc.id],
        n = 0;
    doc.iter(Math.max(doc.first, from), Math.min(doc.first + doc.size, to), function (line) {
      if (line.markedSpans) {
        (existing || (existing = change["spans_" + doc.id] = {}))[n] = line.markedSpans;
      }

      ++n;
    });
  } // When un/re-doing restores text containing marked spans, those
  // that have been explicitly cleared should not be restored.


  function removeClearedSpans(spans) {
    if (!spans) {
      return null;
    }

    var out;

    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) {
        if (!out) {
          out = spans.slice(0, i);
        }
      } else if (out) {
        out.push(spans[i]);
      }
    }

    return !out ? spans : out.length ? out : null;
  } // Retrieve and filter the old marked spans stored in a change event.


  function getOldSpans(doc, change) {
    var found = change["spans_" + doc.id];

    if (!found) {
      return null;
    }

    var nw = [];

    for (var i = 0; i < change.text.length; ++i) {
      nw.push(removeClearedSpans(found[i]));
    }

    return nw;
  } // Used for un/re-doing changes from the history. Combines the
  // result of computing the existing spans with the set of spans that
  // existed in the history (so that deleting around a span and then
  // undoing brings back the span).


  function mergeOldSpans(doc, change) {
    var old = getOldSpans(doc, change);
    var stretched = stretchSpansOverChange(doc, change);

    if (!old) {
      return stretched;
    }

    if (!stretched) {
      return old;
    }

    for (var i = 0; i < old.length; ++i) {
      var oldCur = old[i],
          stretchCur = stretched[i];

      if (oldCur && stretchCur) {
        spans: for (var j = 0; j < stretchCur.length; ++j) {
          var span = stretchCur[j];

          for (var k = 0; k < oldCur.length; ++k) {
            if (oldCur[k].marker == span.marker) {
              continue spans;
            }
          }

          oldCur.push(span);
        }
      } else if (stretchCur) {
        old[i] = stretchCur;
      }
    }

    return old;
  } // Used both to provide a JSON-safe object in .getHistory, and, when
  // detaching a document, to split the history in two


  function copyHistoryArray(events, newGroup, instantiateSel) {
    var copy = [];

    for (var i = 0; i < events.length; ++i) {
      var event = events[i];

      if (event.ranges) {
        copy.push(instantiateSel ? Selection.prototype.deepCopy.call(event) : event);
        continue;
      }

      var changes = event.changes,
          newChanges = [];
      copy.push({
        changes: newChanges
      });

      for (var j = 0; j < changes.length; ++j) {
        var change = changes[j],
            m = void 0;
        newChanges.push({
          from: change.from,
          to: change.to,
          text: change.text
        });

        if (newGroup) {
          for (var prop in change) {
            if (m = prop.match(/^spans_(\d+)$/)) {
              if (indexOf(newGroup, Number(m[1])) > -1) {
                lst(newChanges)[prop] = change[prop];
                delete change[prop];
              }
            }
          }
        }
      }
    }

    return copy;
  } // The 'scroll' parameter given to many of these indicated whether
  // the new cursor position should be scrolled into view after
  // modifying the selection.
  // If shift is held or the extend flag is set, extends a range to
  // include a given position (and optionally a second position).
  // Otherwise, simply returns the range between the given positions.
  // Used for cursor motion and such.


  function extendRange(range, head, other, extend) {
    if (extend) {
      var anchor = range.anchor;

      if (other) {
        var posBefore = cmp(head, anchor) < 0;

        if (posBefore != cmp(other, anchor) < 0) {
          anchor = head;
          head = other;
        } else if (posBefore != cmp(head, other) < 0) {
          head = other;
        }
      }

      return new Range(anchor, head);
    } else {
      return new Range(other || head, head);
    }
  } // Extend the primary selection range, discard the rest.


  function extendSelection(doc, head, other, options, extend) {
    if (extend == null) {
      extend = doc.cm && (doc.cm.display.shift || doc.extend);
    }

    setSelection(doc, new Selection([extendRange(doc.sel.primary(), head, other, extend)], 0), options);
  } // Extend all selections (pos is an array of selections with length
  // equal the number of selections)


  function extendSelections(doc, heads, options) {
    var out = [];
    var extend = doc.cm && (doc.cm.display.shift || doc.extend);

    for (var i = 0; i < doc.sel.ranges.length; i++) {
      out[i] = extendRange(doc.sel.ranges[i], heads[i], null, extend);
    }

    var newSel = normalizeSelection(doc.cm, out, doc.sel.primIndex);
    setSelection(doc, newSel, options);
  } // Updates a single range in the selection.


  function replaceOneSelection(doc, i, range, options) {
    var ranges = doc.sel.ranges.slice(0);
    ranges[i] = range;
    setSelection(doc, normalizeSelection(doc.cm, ranges, doc.sel.primIndex), options);
  } // Reset the selection to a single range.


  function setSimpleSelection(doc, anchor, head, options) {
    setSelection(doc, simpleSelection(anchor, head), options);
  } // Give beforeSelectionChange handlers a change to influence a
  // selection update.


  function filterSelectionChange(doc, sel, options) {
    var obj = {
      ranges: sel.ranges,
      update: function update(ranges) {
        var this$1 = this;
        this.ranges = [];

        for (var i = 0; i < ranges.length; i++) {
          this$1.ranges[i] = new Range(_clipPos(doc, ranges[i].anchor), _clipPos(doc, ranges[i].head));
        }
      },
      origin: options && options.origin
    };
    signal(doc, "beforeSelectionChange", doc, obj);

    if (doc.cm) {
      signal(doc.cm, "beforeSelectionChange", doc.cm, obj);
    }

    if (obj.ranges != sel.ranges) {
      return normalizeSelection(doc.cm, obj.ranges, obj.ranges.length - 1);
    } else {
      return sel;
    }
  }

  function setSelectionReplaceHistory(doc, sel, options) {
    var done = doc.history.done,
        last = lst(done);

    if (last && last.ranges) {
      done[done.length - 1] = sel;
      setSelectionNoUndo(doc, sel, options);
    } else {
      setSelection(doc, sel, options);
    }
  } // Set a new selection.


  function setSelection(doc, sel, options) {
    setSelectionNoUndo(doc, sel, options);
    addSelectionToHistory(doc, doc.sel, doc.cm ? doc.cm.curOp.id : NaN, options);
  }

  function setSelectionNoUndo(doc, sel, options) {
    if (hasHandler(doc, "beforeSelectionChange") || doc.cm && hasHandler(doc.cm, "beforeSelectionChange")) {
      sel = filterSelectionChange(doc, sel, options);
    }

    var bias = options && options.bias || (cmp(sel.primary().head, doc.sel.primary().head) < 0 ? -1 : 1);
    setSelectionInner(doc, skipAtomicInSelection(doc, sel, bias, true));

    if (!(options && options.scroll === false) && doc.cm) {
      ensureCursorVisible(doc.cm);
    }
  }

  function setSelectionInner(doc, sel) {
    if (sel.equals(doc.sel)) {
      return;
    }

    doc.sel = sel;

    if (doc.cm) {
      doc.cm.curOp.updateInput = 1;
      doc.cm.curOp.selectionChanged = true;
      signalCursorActivity(doc.cm);
    }

    signalLater(doc, "cursorActivity", doc);
  } // Verify that the selection does not partially select any atomic
  // marked ranges.


  function reCheckSelection(doc) {
    setSelectionInner(doc, skipAtomicInSelection(doc, doc.sel, null, false));
  } // Return a selection that does not partially select any atomic
  // ranges.


  function skipAtomicInSelection(doc, sel, bias, mayClear) {
    var out;

    for (var i = 0; i < sel.ranges.length; i++) {
      var range = sel.ranges[i];
      var old = sel.ranges.length == doc.sel.ranges.length && doc.sel.ranges[i];
      var newAnchor = skipAtomic(doc, range.anchor, old && old.anchor, bias, mayClear);
      var newHead = skipAtomic(doc, range.head, old && old.head, bias, mayClear);

      if (out || newAnchor != range.anchor || newHead != range.head) {
        if (!out) {
          out = sel.ranges.slice(0, i);
        }

        out[i] = new Range(newAnchor, newHead);
      }
    }

    return out ? normalizeSelection(doc.cm, out, sel.primIndex) : sel;
  }

  function skipAtomicInner(doc, pos, oldPos, dir, mayClear) {
    var line = getLine(doc, pos.line);

    if (line.markedSpans) {
      for (var i = 0; i < line.markedSpans.length; ++i) {
        var sp = line.markedSpans[i],
            m = sp.marker; // Determine if we should prevent the cursor being placed to the left/right of an atomic marker
        // Historically this was determined using the inclusiveLeft/Right option, but the new way to control it
        // is with selectLeft/Right

        var preventCursorLeft = "selectLeft" in m ? !m.selectLeft : m.inclusiveLeft;
        var preventCursorRight = "selectRight" in m ? !m.selectRight : m.inclusiveRight;

        if ((sp.from == null || (preventCursorLeft ? sp.from <= pos.ch : sp.from < pos.ch)) && (sp.to == null || (preventCursorRight ? sp.to >= pos.ch : sp.to > pos.ch))) {
          if (mayClear) {
            signal(m, "beforeCursorEnter");

            if (m.explicitlyCleared) {
              if (!line.markedSpans) {
                break;
              } else {
                --i;
                continue;
              }
            }
          }

          if (!m.atomic) {
            continue;
          }

          if (oldPos) {
            var near = m.find(dir < 0 ? 1 : -1),
                diff = void 0;

            if (dir < 0 ? preventCursorRight : preventCursorLeft) {
              near = movePos(doc, near, -dir, near && near.line == pos.line ? line : null);
            }

            if (near && near.line == pos.line && (diff = cmp(near, oldPos)) && (dir < 0 ? diff < 0 : diff > 0)) {
              return skipAtomicInner(doc, near, pos, dir, mayClear);
            }
          }

          var far = m.find(dir < 0 ? -1 : 1);

          if (dir < 0 ? preventCursorLeft : preventCursorRight) {
            far = movePos(doc, far, dir, far.line == pos.line ? line : null);
          }

          return far ? skipAtomicInner(doc, far, pos, dir, mayClear) : null;
        }
      }
    }

    return pos;
  } // Ensure a given position is not inside an atomic range.


  function skipAtomic(doc, pos, oldPos, bias, mayClear) {
    var dir = bias || 1;
    var found = skipAtomicInner(doc, pos, oldPos, dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, dir, true) || skipAtomicInner(doc, pos, oldPos, -dir, mayClear) || !mayClear && skipAtomicInner(doc, pos, oldPos, -dir, true);

    if (!found) {
      doc.cantEdit = true;
      return Pos(doc.first, 0);
    }

    return found;
  }

  function movePos(doc, pos, dir, line) {
    if (dir < 0 && pos.ch == 0) {
      if (pos.line > doc.first) {
        return _clipPos(doc, Pos(pos.line - 1));
      } else {
        return null;
      }
    } else if (dir > 0 && pos.ch == (line || getLine(doc, pos.line)).text.length) {
      if (pos.line < doc.first + doc.size - 1) {
        return Pos(pos.line + 1, 0);
      } else {
        return null;
      }
    } else {
      return new Pos(pos.line, pos.ch + dir);
    }
  }

  function selectAll(cm) {
    cm.setSelection(Pos(cm.firstLine(), 0), Pos(cm.lastLine()), sel_dontScroll);
  } // UPDATING
  // Allow "beforeChange" event handlers to influence a change


  function filterChange(doc, change, update) {
    var obj = {
      canceled: false,
      from: change.from,
      to: change.to,
      text: change.text,
      origin: change.origin,
      cancel: function cancel() {
        return obj.canceled = true;
      }
    };

    if (update) {
      obj.update = function (from, to, text, origin) {
        if (from) {
          obj.from = _clipPos(doc, from);
        }

        if (to) {
          obj.to = _clipPos(doc, to);
        }

        if (text) {
          obj.text = text;
        }

        if (origin !== undefined) {
          obj.origin = origin;
        }
      };
    }

    signal(doc, "beforeChange", doc, obj);

    if (doc.cm) {
      signal(doc.cm, "beforeChange", doc.cm, obj);
    }

    if (obj.canceled) {
      if (doc.cm) {
        doc.cm.curOp.updateInput = 2;
      }

      return null;
    }

    return {
      from: obj.from,
      to: obj.to,
      text: obj.text,
      origin: obj.origin
    };
  } // Apply a change to a document, and add it to the document's
  // history, and propagating it to all linked documents.


  function makeChange(doc, change, ignoreReadOnly) {
    if (doc.cm) {
      if (!doc.cm.curOp) {
        return operation(doc.cm, makeChange)(doc, change, ignoreReadOnly);
      }

      if (doc.cm.state.suppressEdits) {
        return;
      }
    }

    if (hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange")) {
      change = filterChange(doc, change, true);

      if (!change) {
        return;
      }
    } // Possibly split or suppress the update based on the presence
    // of read-only spans in its range.


    var split = sawReadOnlySpans && !ignoreReadOnly && removeReadOnlyRanges(doc, change.from, change.to);

    if (split) {
      for (var i = split.length - 1; i >= 0; --i) {
        makeChangeInner(doc, {
          from: split[i].from,
          to: split[i].to,
          text: i ? [""] : change.text,
          origin: change.origin
        });
      }
    } else {
      makeChangeInner(doc, change);
    }
  }

  function makeChangeInner(doc, change) {
    if (change.text.length == 1 && change.text[0] == "" && cmp(change.from, change.to) == 0) {
      return;
    }

    var selAfter = computeSelAfterChange(doc, change);
    addChangeToHistory(doc, change, selAfter, doc.cm ? doc.cm.curOp.id : NaN);
    makeChangeSingleDoc(doc, change, selAfter, stretchSpansOverChange(doc, change));
    var rebased = [];
    linkedDocs(doc, function (doc, sharedHist) {
      if (!sharedHist && indexOf(rebased, doc.history) == -1) {
        rebaseHist(doc.history, change);
        rebased.push(doc.history);
      }

      makeChangeSingleDoc(doc, change, null, stretchSpansOverChange(doc, change));
    });
  } // Revert a change stored in a document's history.


  function makeChangeFromHistory(doc, type, allowSelectionOnly) {
    var suppress = doc.cm && doc.cm.state.suppressEdits;

    if (suppress && !allowSelectionOnly) {
      return;
    }

    var hist = doc.history,
        event,
        selAfter = doc.sel;
    var source = type == "undo" ? hist.done : hist.undone,
        dest = type == "undo" ? hist.undone : hist.done; // Verify that there is a useable event (so that ctrl-z won't
    // needlessly clear selection events)

    var i = 0;

    for (; i < source.length; i++) {
      event = source[i];

      if (allowSelectionOnly ? event.ranges && !event.equals(doc.sel) : !event.ranges) {
        break;
      }
    }

    if (i == source.length) {
      return;
    }

    hist.lastOrigin = hist.lastSelOrigin = null;

    for (;;) {
      event = source.pop();

      if (event.ranges) {
        pushSelectionToHistory(event, dest);

        if (allowSelectionOnly && !event.equals(doc.sel)) {
          setSelection(doc, event, {
            clearRedo: false
          });
          return;
        }

        selAfter = event;
      } else if (suppress) {
        source.push(event);
        return;
      } else {
        break;
      }
    } // Build up a reverse change object to add to the opposite history
    // stack (redo when undoing, and vice versa).


    var antiChanges = [];
    pushSelectionToHistory(selAfter, dest);
    dest.push({
      changes: antiChanges,
      generation: hist.generation
    });
    hist.generation = event.generation || ++hist.maxGeneration;
    var filter = hasHandler(doc, "beforeChange") || doc.cm && hasHandler(doc.cm, "beforeChange");

    var loop = function loop(i) {
      var change = event.changes[i];
      change.origin = type;

      if (filter && !filterChange(doc, change, false)) {
        source.length = 0;
        return {};
      }

      antiChanges.push(historyChangeFromChange(doc, change));
      var after = i ? computeSelAfterChange(doc, change) : lst(source);
      makeChangeSingleDoc(doc, change, after, mergeOldSpans(doc, change));

      if (!i && doc.cm) {
        doc.cm.scrollIntoView({
          from: change.from,
          to: changeEnd(change)
        });
      }

      var rebased = []; // Propagate to the linked documents

      linkedDocs(doc, function (doc, sharedHist) {
        if (!sharedHist && indexOf(rebased, doc.history) == -1) {
          rebaseHist(doc.history, change);
          rebased.push(doc.history);
        }

        makeChangeSingleDoc(doc, change, null, mergeOldSpans(doc, change));
      });
    };

    for (var i$1 = event.changes.length - 1; i$1 >= 0; --i$1) {
      var returned = loop(i$1);
      if (returned) return returned.v;
    }
  } // Sub-views need their line numbers shifted when text is added
  // above or below them in the parent document.


  function shiftDoc(doc, distance) {
    if (distance == 0) {
      return;
    }

    doc.first += distance;
    doc.sel = new Selection(map(doc.sel.ranges, function (range) {
      return new Range(Pos(range.anchor.line + distance, range.anchor.ch), Pos(range.head.line + distance, range.head.ch));
    }), doc.sel.primIndex);

    if (doc.cm) {
      regChange(doc.cm, doc.first, doc.first - distance, distance);

      for (var d = doc.cm.display, l = d.viewFrom; l < d.viewTo; l++) {
        regLineChange(doc.cm, l, "gutter");
      }
    }
  } // More lower-level change function, handling only a single document
  // (not linked ones).


  function makeChangeSingleDoc(doc, change, selAfter, spans) {
    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, makeChangeSingleDoc)(doc, change, selAfter, spans);
    }

    if (change.to.line < doc.first) {
      shiftDoc(doc, change.text.length - 1 - (change.to.line - change.from.line));
      return;
    }

    if (change.from.line > doc.lastLine()) {
      return;
    } // Clip the change to the size of this doc


    if (change.from.line < doc.first) {
      var shift = change.text.length - 1 - (doc.first - change.from.line);
      shiftDoc(doc, shift);
      change = {
        from: Pos(doc.first, 0),
        to: Pos(change.to.line + shift, change.to.ch),
        text: [lst(change.text)],
        origin: change.origin
      };
    }

    var last = doc.lastLine();

    if (change.to.line > last) {
      change = {
        from: change.from,
        to: Pos(last, getLine(doc, last).text.length),
        text: [change.text[0]],
        origin: change.origin
      };
    }

    change.removed = getBetween(doc, change.from, change.to);

    if (!selAfter) {
      selAfter = computeSelAfterChange(doc, change);
    }

    if (doc.cm) {
      makeChangeSingleDocInEditor(doc.cm, change, spans);
    } else {
      updateDoc(doc, change, spans);
    }

    setSelectionNoUndo(doc, selAfter, sel_dontScroll);

    if (doc.cantEdit && skipAtomic(doc, Pos(doc.firstLine(), 0))) {
      doc.cantEdit = false;
    }
  } // Handle the interaction of a change to a document with the editor
  // that this document is part of.


  function makeChangeSingleDocInEditor(cm, change, spans) {
    var doc = cm.doc,
        display = cm.display,
        from = change.from,
        to = change.to;
    var recomputeMaxLength = false,
        checkWidthStart = from.line;

    if (!cm.options.lineWrapping) {
      checkWidthStart = lineNo(visualLine(getLine(doc, from.line)));
      doc.iter(checkWidthStart, to.line + 1, function (line) {
        if (line == display.maxLine) {
          recomputeMaxLength = true;
          return true;
        }
      });
    }

    if (doc.sel.contains(change.from, change.to) > -1) {
      signalCursorActivity(cm);
    }

    updateDoc(doc, change, spans, estimateHeight(cm));

    if (!cm.options.lineWrapping) {
      doc.iter(checkWidthStart, from.line + change.text.length, function (line) {
        var len = lineLength(line);

        if (len > display.maxLineLength) {
          display.maxLine = line;
          display.maxLineLength = len;
          display.maxLineChanged = true;
          recomputeMaxLength = false;
        }
      });

      if (recomputeMaxLength) {
        cm.curOp.updateMaxLine = true;
      }
    }

    retreatFrontier(doc, from.line);
    startWorker(cm, 400);
    var lendiff = change.text.length - (to.line - from.line) - 1; // Remember that these lines changed, for updating the display

    if (change.full) {
      regChange(cm);
    } else if (from.line == to.line && change.text.length == 1 && !isWholeLineUpdate(cm.doc, change)) {
      regLineChange(cm, from.line, "text");
    } else {
      regChange(cm, from.line, to.line + 1, lendiff);
    }

    var changesHandler = hasHandler(cm, "changes"),
        changeHandler = hasHandler(cm, "change");

    if (changeHandler || changesHandler) {
      var obj = {
        from: from,
        to: to,
        text: change.text,
        removed: change.removed,
        origin: change.origin
      };

      if (changeHandler) {
        signalLater(cm, "change", cm, obj);
      }

      if (changesHandler) {
        (cm.curOp.changeObjs || (cm.curOp.changeObjs = [])).push(obj);
      }
    }

    cm.display.selForContextMenu = null;
  }

  function _replaceRange(doc, code, from, to, origin) {
    var assign;

    if (!to) {
      to = from;
    }

    if (cmp(to, from) < 0) {
      assign = [to, from], from = assign[0], to = assign[1];
    }

    if (typeof code == "string") {
      code = doc.splitLines(code);
    }

    makeChange(doc, {
      from: from,
      to: to,
      text: code,
      origin: origin
    });
  } // Rebasing/resetting history to deal with externally-sourced changes


  function rebaseHistSelSingle(pos, from, to, diff) {
    if (to < pos.line) {
      pos.line += diff;
    } else if (from < pos.line) {
      pos.line = from;
      pos.ch = 0;
    }
  } // Tries to rebase an array of history events given a change in the
  // document. If the change touches the same lines as the event, the
  // event, and everything 'behind' it, is discarded. If the change is
  // before the event, the event's positions are updated. Uses a
  // copy-on-write scheme for the positions, to avoid having to
  // reallocate them all on every rebase, but also avoid problems with
  // shared position objects being unsafely updated.


  function rebaseHistArray(array, from, to, diff) {
    for (var i = 0; i < array.length; ++i) {
      var sub = array[i],
          ok = true;

      if (sub.ranges) {
        if (!sub.copied) {
          sub = array[i] = sub.deepCopy();
          sub.copied = true;
        }

        for (var j = 0; j < sub.ranges.length; j++) {
          rebaseHistSelSingle(sub.ranges[j].anchor, from, to, diff);
          rebaseHistSelSingle(sub.ranges[j].head, from, to, diff);
        }

        continue;
      }

      for (var j$1 = 0; j$1 < sub.changes.length; ++j$1) {
        var cur = sub.changes[j$1];

        if (to < cur.from.line) {
          cur.from = Pos(cur.from.line + diff, cur.from.ch);
          cur.to = Pos(cur.to.line + diff, cur.to.ch);
        } else if (from <= cur.to.line) {
          ok = false;
          break;
        }
      }

      if (!ok) {
        array.splice(0, i + 1);
        i = 0;
      }
    }
  }

  function rebaseHist(hist, change) {
    var from = change.from.line,
        to = change.to.line,
        diff = change.text.length - (to - from) - 1;
    rebaseHistArray(hist.done, from, to, diff);
    rebaseHistArray(hist.undone, from, to, diff);
  } // Utility for applying a change to a line by handle or number,
  // returning the number and optionally registering the line as
  // changed.


  function changeLine(doc, handle, changeType, op) {
    var no = handle,
        line = handle;

    if (typeof handle == "number") {
      line = getLine(doc, clipLine(doc, handle));
    } else {
      no = lineNo(handle);
    }

    if (no == null) {
      return null;
    }

    if (op(line, no) && doc.cm) {
      regLineChange(doc.cm, no, changeType);
    }

    return line;
  } // The document is represented as a BTree consisting of leaves, with
  // chunk of lines in them, and branches, with up to ten leaves or
  // other branch nodes below them. The top node is always a branch
  // node, and is the document object itself (meaning it has
  // additional methods and properties).
  //
  // All nodes have parent links. The tree is used both to go from
  // line numbers to line objects, and to go from objects to numbers.
  // It also indexes by height, and is used to convert between height
  // and line object, and to find the total height of the document.
  //
  // See also http://marijnhaverbeke.nl/blog/codemirror-line-tree.html


  function LeafChunk(lines) {
    var this$1 = this;
    this.lines = lines;
    this.parent = null;
    var height = 0;

    for (var i = 0; i < lines.length; ++i) {
      lines[i].parent = this$1;
      height += lines[i].height;
    }

    this.height = height;
  }

  LeafChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.lines.length;
    },
    // Remove the n lines at offset 'at'.
    removeInner: function removeInner(at, n) {
      var this$1 = this;

      for (var i = at, e = at + n; i < e; ++i) {
        var line = this$1.lines[i];
        this$1.height -= line.height;
        cleanUpLine(line);
        signalLater(line, "delete");
      }

      this.lines.splice(at, n);
    },
    // Helper used to collapse a small branch into a single leaf.
    collapse: function collapse(lines) {
      lines.push.apply(lines, this.lines);
    },
    // Insert the given array of lines at offset 'at', count them as
    // having the given height.
    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));

      for (var i = 0; i < lines.length; ++i) {
        lines[i].parent = this$1;
      }
    },
    // Used to iterate over a part of the tree.
    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var e = at + n; at < e; ++at) {
        if (op(this$1.lines[at])) {
          return true;
        }
      }
    }
  };

  function BranchChunk(children) {
    var this$1 = this;
    this.children = children;
    var size = 0,
        height = 0;

    for (var i = 0; i < children.length; ++i) {
      var ch = children[i];
      size += ch.chunkSize();
      height += ch.height;
      ch.parent = this$1;
    }

    this.size = size;
    this.height = height;
    this.parent = null;
  }

  BranchChunk.prototype = {
    chunkSize: function chunkSize() {
      return this.size;
    },
    removeInner: function removeInner(at, n) {
      var this$1 = this;
      this.size -= n;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at < sz) {
          var rm = Math.min(n, sz - at),
              oldHeight = child.height;
          child.removeInner(at, rm);
          this$1.height -= oldHeight - child.height;

          if (sz == rm) {
            this$1.children.splice(i--, 1);
            child.parent = null;
          }

          if ((n -= rm) == 0) {
            break;
          }

          at = 0;
        } else {
          at -= sz;
        }
      } // If the result is smaller than 25 lines, ensure that it is a
      // single leaf node.


      if (this.size - n < 25 && (this.children.length > 1 || !(this.children[0] instanceof LeafChunk))) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function collapse(lines) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        this$1.children[i].collapse(lines);
      }
    },
    insertInner: function insertInner(at, lines, height) {
      var this$1 = this;
      this.size += lines.length;
      this.height += height;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at <= sz) {
          child.insertInner(at, lines, height);

          if (child.lines && child.lines.length > 50) {
            // To avoid memory thrashing when child.lines is huge (e.g. first view of a large file), it's never spliced.
            // Instead, small slices are taken. They're taken in order because sequential memory accesses are fastest.
            var remaining = child.lines.length % 25 + 25;

            for (var pos = remaining; pos < child.lines.length;) {
              var leaf = new LeafChunk(child.lines.slice(pos, pos += 25));
              child.height -= leaf.height;
              this$1.children.splice(++i, 0, leaf);
              leaf.parent = this$1;
            }

            child.lines = child.lines.slice(0, remaining);
            this$1.maybeSpill();
          }

          break;
        }

        at -= sz;
      }
    },
    // When a node has grown, check whether it should be split.
    maybeSpill: function maybeSpill() {
      if (this.children.length <= 10) {
        return;
      }

      var me = this;

      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);

        if (!me.parent) {
          // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }

        sibling.parent = me.parent;
      } while (me.children.length > 10);

      me.parent.maybeSpill();
    },
    iterN: function iterN(at, n, op) {
      var this$1 = this;

      for (var i = 0; i < this.children.length; ++i) {
        var child = this$1.children[i],
            sz = child.chunkSize();

        if (at < sz) {
          var used = Math.min(n, sz - at);

          if (child.iterN(at, used, op)) {
            return true;
          }

          if ((n -= used) == 0) {
            break;
          }

          at = 0;
        } else {
          at -= sz;
        }
      }
    }
  }; // Line widgets are block elements displayed above or below a line.

  var LineWidget = function LineWidget(doc, node, options) {
    var this$1 = this;

    if (options) {
      for (var opt in options) {
        if (options.hasOwnProperty(opt)) {
          this$1[opt] = options[opt];
        }
      }
    }

    this.doc = doc;
    this.node = node;
  };

  LineWidget.prototype.clear = function () {
    var this$1 = this;
    var cm = this.doc.cm,
        ws = this.line.widgets,
        line = this.line,
        no = lineNo(line);

    if (no == null || !ws) {
      return;
    }

    for (var i = 0; i < ws.length; ++i) {
      if (ws[i] == this$1) {
        ws.splice(i--, 1);
      }
    }

    if (!ws.length) {
      line.widgets = null;
    }

    var height = widgetHeight(this);
    updateLineHeight(line, Math.max(0, line.height - height));

    if (cm) {
      runInOp(cm, function () {
        adjustScrollWhenAboveVisible(cm, line, -height);
        regLineChange(cm, no, "widget");
      });
      signalLater(cm, "lineWidgetCleared", cm, this, no);
    }
  };

  LineWidget.prototype.changed = function () {
    var this$1 = this;
    var oldH = this.height,
        cm = this.doc.cm,
        line = this.line;
    this.height = null;
    var diff = widgetHeight(this) - oldH;

    if (!diff) {
      return;
    }

    if (!lineIsHidden(this.doc, line)) {
      updateLineHeight(line, line.height + diff);
    }

    if (cm) {
      runInOp(cm, function () {
        cm.curOp.forceUpdate = true;
        adjustScrollWhenAboveVisible(cm, line, diff);
        signalLater(cm, "lineWidgetChanged", cm, this$1, lineNo(line));
      });
    }
  };

  eventMixin(LineWidget);

  function adjustScrollWhenAboveVisible(cm, line, diff) {
    if (_heightAtLine(line) < (cm.curOp && cm.curOp.scrollTop || cm.doc.scrollTop)) {
      addToScrollTop(cm, diff);
    }
  }

  function addLineWidget(doc, handle, node, options) {
    var widget = new LineWidget(doc, node, options);
    var cm = doc.cm;

    if (cm && widget.noHScroll) {
      cm.display.alignWidgets = true;
    }

    changeLine(doc, handle, "widget", function (line) {
      var widgets = line.widgets || (line.widgets = []);

      if (widget.insertAt == null) {
        widgets.push(widget);
      } else {
        widgets.splice(Math.min(widgets.length - 1, Math.max(0, widget.insertAt)), 0, widget);
      }

      widget.line = line;

      if (cm && !lineIsHidden(doc, line)) {
        var aboveVisible = _heightAtLine(line) < doc.scrollTop;
        updateLineHeight(line, line.height + widgetHeight(widget));

        if (aboveVisible) {
          addToScrollTop(cm, widget.height);
        }

        cm.curOp.forceUpdate = true;
      }

      return true;
    });

    if (cm) {
      signalLater(cm, "lineWidgetAdded", cm, widget, typeof handle == "number" ? handle : lineNo(handle));
    }

    return widget;
  } // TEXTMARKERS
  // Created with markText and setBookmark methods. A TextMarker is a
  // handle that can be used to clear or find a marked position in the
  // document. Line objects hold arrays (markedSpans) containing
  // {from, to, marker} object pointing to such marker objects, and
  // indicating that such a marker is present on that line. Multiple
  // lines may point to the same marker when it spans across lines.
  // The spans will have null for their from/to properties when the
  // marker continues beyond the start/end of the line. Markers have
  // links back to the lines they currently touch.
  // Collapsed markers have unique ids, in order to be able to order
  // them, which is needed for uniquely determining an outer marker
  // when they overlap (they may nest, but not partially overlap).


  var nextMarkerId = 0;

  var TextMarker = function TextMarker(doc, type) {
    this.lines = [];
    this.type = type;
    this.doc = doc;
    this.id = ++nextMarkerId;
  }; // Clear the marker.


  TextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }

    var cm = this.doc.cm,
        withOp = cm && !cm.curOp;

    if (withOp) {
      _startOperation(cm);
    }

    if (hasHandler(this, "clear")) {
      var found = this.find();

      if (found) {
        signalLater(this, "clear", found.from, found.to);
      }
    }

    var min = null,
        max = null;

    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);

      if (cm && !this$1.collapsed) {
        regLineChange(cm, lineNo(line), "text");
      } else if (cm) {
        if (span.to != null) {
          max = lineNo(line);
        }

        if (span.from != null) {
          min = lineNo(line);
        }
      }

      line.markedSpans = removeMarkedSpan(line.markedSpans, span);

      if (span.from == null && this$1.collapsed && !lineIsHidden(this$1.doc, line) && cm) {
        updateLineHeight(line, textHeight(cm.display));
      }
    }

    if (cm && this.collapsed && !cm.options.lineWrapping) {
      for (var i$1 = 0; i$1 < this.lines.length; ++i$1) {
        var visual = visualLine(this$1.lines[i$1]),
            len = lineLength(visual);

        if (len > cm.display.maxLineLength) {
          cm.display.maxLine = visual;
          cm.display.maxLineLength = len;
          cm.display.maxLineChanged = true;
        }
      }
    }

    if (min != null && cm && this.collapsed) {
      regChange(cm, min, max + 1);
    }

    this.lines.length = 0;
    this.explicitlyCleared = true;

    if (this.atomic && this.doc.cantEdit) {
      this.doc.cantEdit = false;

      if (cm) {
        reCheckSelection(cm.doc);
      }
    }

    if (cm) {
      signalLater(cm, "markerCleared", cm, this, min, max);
    }

    if (withOp) {
      _endOperation(cm);
    }

    if (this.parent) {
      this.parent.clear();
    }
  }; // Find the position of the marker in the document. Returns a {from,
  // to} object by default. Side can be passed to get a specific side
  // -- 0 (both), -1 (left), or 1 (right). When lineObj is true, the
  // Pos objects returned contain a line object, rather than a line
  // number (used to prevent looking up the same line twice).


  TextMarker.prototype.find = function (side, lineObj) {
    var this$1 = this;

    if (side == null && this.type == "bookmark") {
      side = 1;
    }

    var from, to;

    for (var i = 0; i < this.lines.length; ++i) {
      var line = this$1.lines[i];
      var span = getMarkedSpanFor(line.markedSpans, this$1);

      if (span.from != null) {
        from = Pos(lineObj ? line : lineNo(line), span.from);

        if (side == -1) {
          return from;
        }
      }

      if (span.to != null) {
        to = Pos(lineObj ? line : lineNo(line), span.to);

        if (side == 1) {
          return to;
        }
      }
    }

    return from && {
      from: from,
      to: to
    };
  }; // Signals that the marker's widget changed, and surrounding layout
  // should be recomputed.


  TextMarker.prototype.changed = function () {
    var this$1 = this;
    var pos = this.find(-1, true),
        widget = this,
        cm = this.doc.cm;

    if (!pos || !cm) {
      return;
    }

    runInOp(cm, function () {
      var line = pos.line,
          lineN = lineNo(pos.line);
      var view = findViewForLine(cm, lineN);

      if (view) {
        clearLineMeasurementCacheFor(view);
        cm.curOp.selectionChanged = cm.curOp.forceUpdate = true;
      }

      cm.curOp.updateMaxLine = true;

      if (!lineIsHidden(widget.doc, line) && widget.height != null) {
        var oldHeight = widget.height;
        widget.height = null;
        var dHeight = widgetHeight(widget) - oldHeight;

        if (dHeight) {
          updateLineHeight(line, line.height + dHeight);
        }
      }

      signalLater(cm, "markerChanged", cm, this$1);
    });
  };

  TextMarker.prototype.attachLine = function (line) {
    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;

      if (!op.maybeHiddenMarkers || indexOf(op.maybeHiddenMarkers, this) == -1) {
        (op.maybeUnhiddenMarkers || (op.maybeUnhiddenMarkers = [])).push(this);
      }
    }

    this.lines.push(line);
  };

  TextMarker.prototype.detachLine = function (line) {
    this.lines.splice(indexOf(this.lines, line), 1);

    if (!this.lines.length && this.doc.cm) {
      var op = this.doc.cm.curOp;
      (op.maybeHiddenMarkers || (op.maybeHiddenMarkers = [])).push(this);
    }
  };

  eventMixin(TextMarker); // Create a marker, wire it up to the right lines, and

  function _markText(doc, from, to, options, type) {
    // Shared markers (across linked documents) are handled separately
    // (markTextShared will call out to this again, once per
    // document).
    if (options && options.shared) {
      return markTextShared(doc, from, to, options, type);
    } // Ensure we are in an operation.


    if (doc.cm && !doc.cm.curOp) {
      return operation(doc.cm, _markText)(doc, from, to, options, type);
    }

    var marker = new TextMarker(doc, type),
        diff = cmp(from, to);

    if (options) {
      copyObj(options, marker, false);
    } // Don't connect empty markers unless clearWhenEmpty is false


    if (diff > 0 || diff == 0 && marker.clearWhenEmpty !== false) {
      return marker;
    }

    if (marker.replacedWith) {
      // Showing up as a widget implies collapsed (widget replaces text)
      marker.collapsed = true;
      marker.widgetNode = eltP("span", [marker.replacedWith], "CodeMirror-widget");

      if (!options.handleMouseEvents) {
        marker.widgetNode.setAttribute("cm-ignore-events", "true");
      }

      if (options.insertLeft) {
        marker.widgetNode.insertLeft = true;
      }
    }

    if (marker.collapsed) {
      if (conflictingCollapsedRange(doc, from.line, from, to, marker) || from.line != to.line && conflictingCollapsedRange(doc, to.line, from, to, marker)) {
        throw new Error("Inserting collapsed marker partially overlapping an existing one");
      }

      seeCollapsedSpans();
    }

    if (marker.addToHistory) {
      addChangeToHistory(doc, {
        from: from,
        to: to,
        origin: "markText"
      }, doc.sel, NaN);
    }

    var curLine = from.line,
        cm = doc.cm,
        updateMaxLine;
    doc.iter(curLine, to.line + 1, function (line) {
      if (cm && marker.collapsed && !cm.options.lineWrapping && visualLine(line) == cm.display.maxLine) {
        updateMaxLine = true;
      }

      if (marker.collapsed && curLine != from.line) {
        updateLineHeight(line, 0);
      }

      addMarkedSpan(line, new MarkedSpan(marker, curLine == from.line ? from.ch : null, curLine == to.line ? to.ch : null));
      ++curLine;
    }); // lineIsHidden depends on the presence of the spans, so needs a second pass

    if (marker.collapsed) {
      doc.iter(from.line, to.line + 1, function (line) {
        if (lineIsHidden(doc, line)) {
          updateLineHeight(line, 0);
        }
      });
    }

    if (marker.clearOnEnter) {
      on(marker, "beforeCursorEnter", function () {
        return marker.clear();
      });
    }

    if (marker.readOnly) {
      seeReadOnlySpans();

      if (doc.history.done.length || doc.history.undone.length) {
        doc.clearHistory();
      }
    }

    if (marker.collapsed) {
      marker.id = ++nextMarkerId;
      marker.atomic = true;
    }

    if (cm) {
      // Sync editor state
      if (updateMaxLine) {
        cm.curOp.updateMaxLine = true;
      }

      if (marker.collapsed) {
        regChange(cm, from.line, to.line + 1);
      } else if (marker.className || marker.startStyle || marker.endStyle || marker.css || marker.attributes || marker.title) {
        for (var i = from.line; i <= to.line; i++) {
          regLineChange(cm, i, "text");
        }
      }

      if (marker.atomic) {
        reCheckSelection(cm.doc);
      }

      signalLater(cm, "markerAdded", cm, marker);
    }

    return marker;
  } // SHARED TEXTMARKERS
  // A shared marker spans multiple linked documents. It is
  // implemented as a meta-marker-object controlling multiple normal
  // markers.


  var SharedTextMarker = function SharedTextMarker(markers, primary) {
    var this$1 = this;
    this.markers = markers;
    this.primary = primary;

    for (var i = 0; i < markers.length; ++i) {
      markers[i].parent = this$1;
    }
  };

  SharedTextMarker.prototype.clear = function () {
    var this$1 = this;

    if (this.explicitlyCleared) {
      return;
    }

    this.explicitlyCleared = true;

    for (var i = 0; i < this.markers.length; ++i) {
      this$1.markers[i].clear();
    }

    signalLater(this, "clear");
  };

  SharedTextMarker.prototype.find = function (side, lineObj) {
    return this.primary.find(side, lineObj);
  };

  eventMixin(SharedTextMarker);

  function markTextShared(doc, from, to, options, type) {
    options = copyObj(options);
    options.shared = false;
    var markers = [_markText(doc, from, to, options, type)],
        primary = markers[0];
    var widget = options.widgetNode;
    linkedDocs(doc, function (doc) {
      if (widget) {
        options.widgetNode = widget.cloneNode(true);
      }

      markers.push(_markText(doc, _clipPos(doc, from), _clipPos(doc, to), options, type));

      for (var i = 0; i < doc.linked.length; ++i) {
        if (doc.linked[i].isParent) {
          return;
        }
      }

      primary = lst(markers);
    });
    return new SharedTextMarker(markers, primary);
  }

  function findSharedMarkers(doc) {
    return doc.findMarks(Pos(doc.first, 0), doc.clipPos(Pos(doc.lastLine())), function (m) {
      return m.parent;
    });
  }

  function copySharedMarkers(doc, markers) {
    for (var i = 0; i < markers.length; i++) {
      var marker = markers[i],
          pos = marker.find();
      var mFrom = doc.clipPos(pos.from),
          mTo = doc.clipPos(pos.to);

      if (cmp(mFrom, mTo)) {
        var subMark = _markText(doc, mFrom, mTo, marker.primary, marker.primary.type);

        marker.markers.push(subMark);
        subMark.parent = marker;
      }
    }
  }

  function detachSharedMarkers(markers) {
    var loop = function loop(i) {
      var marker = markers[i],
          linked = [marker.primary.doc];
      linkedDocs(marker.primary.doc, function (d) {
        return linked.push(d);
      });

      for (var j = 0; j < marker.markers.length; j++) {
        var subMarker = marker.markers[j];

        if (indexOf(linked, subMarker.doc) == -1) {
          subMarker.parent = null;
          marker.markers.splice(j--, 1);
        }
      }
    };

    for (var i = 0; i < markers.length; i++) {
      loop(i);
    }
  }

  var nextDocId = 0;

  var Doc = function Doc(text, mode, firstLine, lineSep, direction) {
    if (!(this instanceof Doc)) {
      return new Doc(text, mode, firstLine, lineSep, direction);
    }

    if (firstLine == null) {
      firstLine = 0;
    }

    BranchChunk.call(this, [new LeafChunk([new Line("", null)])]);
    this.first = firstLine;
    this.scrollTop = this.scrollLeft = 0;
    this.cantEdit = false;
    this.cleanGeneration = 1;
    this.modeFrontier = this.highlightFrontier = firstLine;
    var start = Pos(firstLine, 0);
    this.sel = simpleSelection(start);
    this.history = new History(null);
    this.id = ++nextDocId;
    this.modeOption = mode;
    this.lineSep = lineSep;
    this.direction = direction == "rtl" ? "rtl" : "ltr";
    this.extend = false;

    if (typeof text == "string") {
      text = this.splitLines(text);
    }

    updateDoc(this, {
      from: start,
      to: start,
      text: text
    });
    setSelection(this, simpleSelection(start), sel_dontScroll);
  };

  Doc.prototype = createObj(BranchChunk.prototype, {
    constructor: Doc,
    // Iterate over the document. Supports two forms -- with only one
    // argument, it calls that for each line in the document. With
    // three, it iterates over the range given by the first two (with
    // the second being non-inclusive).
    iter: function iter(from, to, op) {
      if (op) {
        this.iterN(from - this.first, to - from, op);
      } else {
        this.iterN(this.first, this.first + this.size, from);
      }
    },
    // Non-public interface for adding and removing lines.
    insert: function insert(at, lines) {
      var height = 0;

      for (var i = 0; i < lines.length; ++i) {
        height += lines[i].height;
      }

      this.insertInner(at - this.first, lines, height);
    },
    remove: function remove(at, n) {
      this.removeInner(at - this.first, n);
    },
    // From here, the methods are part of the public interface. Most
    // are also available from CodeMirror (editor) instances.
    getValue: function getValue(lineSep) {
      var lines = getLines(this, this.first, this.first + this.size);

      if (lineSep === false) {
        return lines;
      }

      return lines.join(lineSep || this.lineSeparator());
    },
    setValue: docMethodOp(function (code) {
      var top = Pos(this.first, 0),
          last = this.first + this.size - 1;
      makeChange(this, {
        from: top,
        to: Pos(last, getLine(this, last).text.length),
        text: this.splitLines(code),
        origin: "setValue",
        full: true
      }, true);

      if (this.cm) {
        scrollToCoords(this.cm, 0, 0);
      }

      setSelection(this, simpleSelection(top), sel_dontScroll);
    }),
    replaceRange: function replaceRange(code, from, to, origin) {
      from = _clipPos(this, from);
      to = to ? _clipPos(this, to) : from;

      _replaceRange(this, code, from, to, origin);
    },
    getRange: function getRange(from, to, lineSep) {
      var lines = getBetween(this, _clipPos(this, from), _clipPos(this, to));

      if (lineSep === false) {
        return lines;
      }

      return lines.join(lineSep || this.lineSeparator());
    },
    getLine: function getLine(line) {
      var l = this.getLineHandle(line);
      return l && l.text;
    },
    getLineHandle: function getLineHandle(line) {
      if (isLine(this, line)) {
        return getLine(this, line);
      }
    },
    getLineNumber: function getLineNumber(line) {
      return lineNo(line);
    },
    getLineHandleVisualStart: function getLineHandleVisualStart(line) {
      if (typeof line == "number") {
        line = getLine(this, line);
      }

      return visualLine(line);
    },
    lineCount: function lineCount() {
      return this.size;
    },
    firstLine: function firstLine() {
      return this.first;
    },
    lastLine: function lastLine() {
      return this.first + this.size - 1;
    },
    clipPos: function clipPos(pos) {
      return _clipPos(this, pos);
    },
    getCursor: function getCursor(start) {
      var range$$1 = this.sel.primary(),
          pos;

      if (start == null || start == "head") {
        pos = range$$1.head;
      } else if (start == "anchor") {
        pos = range$$1.anchor;
      } else if (start == "end" || start == "to" || start === false) {
        pos = range$$1.to();
      } else {
        pos = range$$1.from();
      }

      return pos;
    },
    listSelections: function listSelections() {
      return this.sel.ranges;
    },
    somethingSelected: function somethingSelected() {
      return this.sel.somethingSelected();
    },
    setCursor: docMethodOp(function (line, ch, options) {
      setSimpleSelection(this, _clipPos(this, typeof line == "number" ? Pos(line, ch || 0) : line), null, options);
    }),
    setSelection: docMethodOp(function (anchor, head, options) {
      setSimpleSelection(this, _clipPos(this, anchor), _clipPos(this, head || anchor), options);
    }),
    extendSelection: docMethodOp(function (head, other, options) {
      extendSelection(this, _clipPos(this, head), other && _clipPos(this, other), options);
    }),
    extendSelections: docMethodOp(function (heads, options) {
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    extendSelectionsBy: docMethodOp(function (f, options) {
      var heads = map(this.sel.ranges, f);
      extendSelections(this, clipPosArray(this, heads), options);
    }),
    setSelections: docMethodOp(function (ranges, primary, options) {
      var this$1 = this;

      if (!ranges.length) {
        return;
      }

      var out = [];

      for (var i = 0; i < ranges.length; i++) {
        out[i] = new Range(_clipPos(this$1, ranges[i].anchor), _clipPos(this$1, ranges[i].head));
      }

      if (primary == null) {
        primary = Math.min(ranges.length - 1, this.sel.primIndex);
      }

      setSelection(this, normalizeSelection(this.cm, out, primary), options);
    }),
    addSelection: docMethodOp(function (anchor, head, options) {
      var ranges = this.sel.ranges.slice(0);
      ranges.push(new Range(_clipPos(this, anchor), _clipPos(this, head || anchor)));
      setSelection(this, normalizeSelection(this.cm, ranges, ranges.length - 1), options);
    }),
    getSelection: function getSelection(lineSep) {
      var this$1 = this;
      var ranges = this.sel.ranges,
          lines;

      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());
        lines = lines ? lines.concat(sel) : sel;
      }

      if (lineSep === false) {
        return lines;
      } else {
        return lines.join(lineSep || this.lineSeparator());
      }
    },
    getSelections: function getSelections(lineSep) {
      var this$1 = this;
      var parts = [],
          ranges = this.sel.ranges;

      for (var i = 0; i < ranges.length; i++) {
        var sel = getBetween(this$1, ranges[i].from(), ranges[i].to());

        if (lineSep !== false) {
          sel = sel.join(lineSep || this$1.lineSeparator());
        }

        parts[i] = sel;
      }

      return parts;
    },
    replaceSelection: function replaceSelection(code, collapse, origin) {
      var dup = [];

      for (var i = 0; i < this.sel.ranges.length; i++) {
        dup[i] = code;
      }

      this.replaceSelections(dup, collapse, origin || "+input");
    },
    replaceSelections: docMethodOp(function (code, collapse, origin) {
      var this$1 = this;
      var changes = [],
          sel = this.sel;

      for (var i = 0; i < sel.ranges.length; i++) {
        var range$$1 = sel.ranges[i];
        changes[i] = {
          from: range$$1.from(),
          to: range$$1.to(),
          text: this$1.splitLines(code[i]),
          origin: origin
        };
      }

      var newSel = collapse && collapse != "end" && computeReplacedSel(this, changes, collapse);

      for (var i$1 = changes.length - 1; i$1 >= 0; i$1--) {
        makeChange(this$1, changes[i$1]);
      }

      if (newSel) {
        setSelectionReplaceHistory(this, newSel);
      } else if (this.cm) {
        ensureCursorVisible(this.cm);
      }
    }),
    undo: docMethodOp(function () {
      makeChangeFromHistory(this, "undo");
    }),
    redo: docMethodOp(function () {
      makeChangeFromHistory(this, "redo");
    }),
    undoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "undo", true);
    }),
    redoSelection: docMethodOp(function () {
      makeChangeFromHistory(this, "redo", true);
    }),
    setExtending: function setExtending(val) {
      this.extend = val;
    },
    getExtending: function getExtending() {
      return this.extend;
    },
    historySize: function historySize() {
      var hist = this.history,
          done = 0,
          undone = 0;

      for (var i = 0; i < hist.done.length; i++) {
        if (!hist.done[i].ranges) {
          ++done;
        }
      }

      for (var i$1 = 0; i$1 < hist.undone.length; i$1++) {
        if (!hist.undone[i$1].ranges) {
          ++undone;
        }
      }

      return {
        undo: done,
        redo: undone
      };
    },
    clearHistory: function clearHistory() {
      this.history = new History(this.history.maxGeneration);
    },
    markClean: function markClean() {
      this.cleanGeneration = this.changeGeneration(true);
    },
    changeGeneration: function changeGeneration(forceSplit) {
      if (forceSplit) {
        this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null;
      }

      return this.history.generation;
    },
    isClean: function isClean(gen) {
      return this.history.generation == (gen || this.cleanGeneration);
    },
    getHistory: function getHistory() {
      return {
        done: copyHistoryArray(this.history.done),
        undone: copyHistoryArray(this.history.undone)
      };
    },
    setHistory: function setHistory(histData) {
      var hist = this.history = new History(this.history.maxGeneration);
      hist.done = copyHistoryArray(histData.done.slice(0), null, true);
      hist.undone = copyHistoryArray(histData.undone.slice(0), null, true);
    },
    setGutterMarker: docMethodOp(function (line, gutterID, value) {
      return changeLine(this, line, "gutter", function (line) {
        var markers = line.gutterMarkers || (line.gutterMarkers = {});
        markers[gutterID] = value;

        if (!value && isEmpty(markers)) {
          line.gutterMarkers = null;
        }

        return true;
      });
    }),
    clearGutter: docMethodOp(function (gutterID) {
      var this$1 = this;
      this.iter(function (line) {
        if (line.gutterMarkers && line.gutterMarkers[gutterID]) {
          changeLine(this$1, line, "gutter", function () {
            line.gutterMarkers[gutterID] = null;

            if (isEmpty(line.gutterMarkers)) {
              line.gutterMarkers = null;
            }

            return true;
          });
        }
      });
    }),
    lineInfo: function lineInfo(line) {
      var n;

      if (typeof line == "number") {
        if (!isLine(this, line)) {
          return null;
        }

        n = line;
        line = getLine(this, line);

        if (!line) {
          return null;
        }
      } else {
        n = lineNo(line);

        if (n == null) {
          return null;
        }
      }

      return {
        line: n,
        handle: line,
        text: line.text,
        gutterMarkers: line.gutterMarkers,
        textClass: line.textClass,
        bgClass: line.bgClass,
        wrapClass: line.wrapClass,
        widgets: line.widgets
      };
    },
    addLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";

        if (!line[prop]) {
          line[prop] = cls;
        } else if (classTest(cls).test(line[prop])) {
          return false;
        } else {
          line[prop] += " " + cls;
        }

        return true;
      });
    }),
    removeLineClass: docMethodOp(function (handle, where, cls) {
      return changeLine(this, handle, where == "gutter" ? "gutter" : "class", function (line) {
        var prop = where == "text" ? "textClass" : where == "background" ? "bgClass" : where == "gutter" ? "gutterClass" : "wrapClass";
        var cur = line[prop];

        if (!cur) {
          return false;
        } else if (cls == null) {
          line[prop] = null;
        } else {
          var found = cur.match(classTest(cls));

          if (!found) {
            return false;
          }

          var end = found.index + found[0].length;
          line[prop] = cur.slice(0, found.index) + (!found.index || end == cur.length ? "" : " ") + cur.slice(end) || null;
        }

        return true;
      });
    }),
    addLineWidget: docMethodOp(function (handle, node, options) {
      return addLineWidget(this, handle, node, options);
    }),
    removeLineWidget: function removeLineWidget(widget) {
      widget.clear();
    },
    markText: function markText(from, to, options) {
      return _markText(this, _clipPos(this, from), _clipPos(this, to), options, options && options.type || "range");
    },
    setBookmark: function setBookmark(pos, options) {
      var realOpts = {
        replacedWith: options && (options.nodeType == null ? options.widget : options),
        insertLeft: options && options.insertLeft,
        clearWhenEmpty: false,
        shared: options && options.shared,
        handleMouseEvents: options && options.handleMouseEvents
      };
      pos = _clipPos(this, pos);
      return _markText(this, pos, pos, realOpts, "bookmark");
    },
    findMarksAt: function findMarksAt(pos) {
      pos = _clipPos(this, pos);
      var markers = [],
          spans = getLine(this, pos.line).markedSpans;

      if (spans) {
        for (var i = 0; i < spans.length; ++i) {
          var span = spans[i];

          if ((span.from == null || span.from <= pos.ch) && (span.to == null || span.to >= pos.ch)) {
            markers.push(span.marker.parent || span.marker);
          }
        }
      }

      return markers;
    },
    findMarks: function findMarks(from, to, filter) {
      from = _clipPos(this, from);
      to = _clipPos(this, to);
      var found = [],
          lineNo$$1 = from.line;
      this.iter(from.line, to.line + 1, function (line) {
        var spans = line.markedSpans;

        if (spans) {
          for (var i = 0; i < spans.length; i++) {
            var span = spans[i];

            if (!(span.to != null && lineNo$$1 == from.line && from.ch >= span.to || span.from == null && lineNo$$1 != from.line || span.from != null && lineNo$$1 == to.line && span.from >= to.ch) && (!filter || filter(span.marker))) {
              found.push(span.marker.parent || span.marker);
            }
          }
        }

        ++lineNo$$1;
      });
      return found;
    },
    getAllMarks: function getAllMarks() {
      var markers = [];
      this.iter(function (line) {
        var sps = line.markedSpans;

        if (sps) {
          for (var i = 0; i < sps.length; ++i) {
            if (sps[i].from != null) {
              markers.push(sps[i].marker);
            }
          }
        }
      });
      return markers;
    },
    posFromIndex: function posFromIndex(off) {
      var ch,
          lineNo$$1 = this.first,
          sepSize = this.lineSeparator().length;
      this.iter(function (line) {
        var sz = line.text.length + sepSize;

        if (sz > off) {
          ch = off;
          return true;
        }

        off -= sz;
        ++lineNo$$1;
      });
      return _clipPos(this, Pos(lineNo$$1, ch));
    },
    indexFromPos: function indexFromPos(coords) {
      coords = _clipPos(this, coords);
      var index = coords.ch;

      if (coords.line < this.first || coords.ch < 0) {
        return 0;
      }

      var sepSize = this.lineSeparator().length;
      this.iter(this.first, coords.line, function (line) {
        // iter aborts when callback returns a truthy value
        index += line.text.length + sepSize;
      });
      return index;
    },
    copy: function copy(copyHistory) {
      var doc = new Doc(getLines(this, this.first, this.first + this.size), this.modeOption, this.first, this.lineSep, this.direction);
      doc.scrollTop = this.scrollTop;
      doc.scrollLeft = this.scrollLeft;
      doc.sel = this.sel;
      doc.extend = false;

      if (copyHistory) {
        doc.history.undoDepth = this.history.undoDepth;
        doc.setHistory(this.getHistory());
      }

      return doc;
    },
    linkedDoc: function linkedDoc(options) {
      if (!options) {
        options = {};
      }

      var from = this.first,
          to = this.first + this.size;

      if (options.from != null && options.from > from) {
        from = options.from;
      }

      if (options.to != null && options.to < to) {
        to = options.to;
      }

      var copy = new Doc(getLines(this, from, to), options.mode || this.modeOption, from, this.lineSep, this.direction);

      if (options.sharedHist) {
        copy.history = this.history;
      }

      (this.linked || (this.linked = [])).push({
        doc: copy,
        sharedHist: options.sharedHist
      });
      copy.linked = [{
        doc: this,
        isParent: true,
        sharedHist: options.sharedHist
      }];
      copySharedMarkers(copy, findSharedMarkers(this));
      return copy;
    },
    unlinkDoc: function unlinkDoc(other) {
      var this$1 = this;

      if (other instanceof CodeMirror) {
        other = other.doc;
      }

      if (this.linked) {
        for (var i = 0; i < this.linked.length; ++i) {
          var link = this$1.linked[i];

          if (link.doc != other) {
            continue;
          }

          this$1.linked.splice(i, 1);
          other.unlinkDoc(this$1);
          detachSharedMarkers(findSharedMarkers(this$1));
          break;
        }
      } // If the histories were shared, split them again


      if (other.history == this.history) {
        var splitIds = [other.id];
        linkedDocs(other, function (doc) {
          return splitIds.push(doc.id);
        }, true);
        other.history = new History(null);
        other.history.done = copyHistoryArray(this.history.done, splitIds);
        other.history.undone = copyHistoryArray(this.history.undone, splitIds);
      }
    },
    iterLinkedDocs: function iterLinkedDocs(f) {
      linkedDocs(this, f);
    },
    getMode: function getMode() {
      return this.mode;
    },
    getEditor: function getEditor() {
      return this.cm;
    },
    splitLines: function splitLines(str) {
      if (this.lineSep) {
        return str.split(this.lineSep);
      }

      return splitLinesAuto(str);
    },
    lineSeparator: function lineSeparator() {
      return this.lineSep || "\n";
    },
    setDirection: docMethodOp(function (dir) {
      if (dir != "rtl") {
        dir = "ltr";
      }

      if (dir == this.direction) {
        return;
      }

      this.direction = dir;
      this.iter(function (line) {
        return line.order = null;
      });

      if (this.cm) {
        directionChanged(this.cm);
      }
    })
  }); // Public alias.

  Doc.prototype.eachLine = Doc.prototype.iter; // Kludge to work around strange IE behavior where it'll sometimes
  // re-fire a series of drag-related events right after the drop (#1551)

  var lastDrop = 0;

  function onDrop(e) {
    var cm = this;
    clearDragCursor(cm);

    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }

    e_preventDefault(e);

    if (ie) {
      lastDrop = +new Date();
    }

    var pos = posFromMouse(cm, e, true),
        files = e.dataTransfer.files;

    if (!pos || cm.isReadOnly()) {
      return;
    } // Might be a file drop, in which case we simply extract the text
    // and insert it.


    if (files && files.length && window.FileReader && window.File) {
      var n = files.length,
          text = Array(n),
          read = 0;

      var loadFile = function loadFile(file, i) {
        if (cm.options.allowDropFileTypes && indexOf(cm.options.allowDropFileTypes, file.type) == -1) {
          return;
        }

        var reader = new FileReader();
        reader.onload = operation(cm, function () {
          var content = reader.result;

          if (/[\x00-\x08\x0e-\x1f]{2}/.test(content)) {
            content = "";
          }

          text[i] = content;

          if (++read == n) {
            pos = _clipPos(cm.doc, pos);
            var change = {
              from: pos,
              to: pos,
              text: cm.doc.splitLines(text.join(cm.doc.lineSeparator())),
              origin: "paste"
            };
            makeChange(cm.doc, change);
            setSelectionReplaceHistory(cm.doc, simpleSelection(pos, changeEnd(change)));
          }
        });
        reader.readAsText(file);
      };

      for (var i = 0; i < n; ++i) {
        loadFile(files[i], i);
      }
    } else {
      // Normal drop
      // Don't do a replace if the drop happened inside of the selected text.
      if (cm.state.draggingText && cm.doc.sel.contains(pos) > -1) {
        cm.state.draggingText(e); // Ensure the editor is re-focused

        setTimeout(function () {
          return cm.display.input.focus();
        }, 20);
        return;
      }

      try {
        var text$1 = e.dataTransfer.getData("Text");

        if (text$1) {
          var selected;

          if (cm.state.draggingText && !cm.state.draggingText.copy) {
            selected = cm.listSelections();
          }

          setSelectionNoUndo(cm.doc, simpleSelection(pos, pos));

          if (selected) {
            for (var i$1 = 0; i$1 < selected.length; ++i$1) {
              _replaceRange(cm.doc, "", selected[i$1].anchor, selected[i$1].head, "drag");
            }
          }

          cm.replaceSelection(text$1, "around", "paste");
          cm.display.input.focus();
        }
      } catch (e) {}
    }
  }

  function onDragStart(cm, e) {
    if (ie && (!cm.state.draggingText || +new Date() - lastDrop < 100)) {
      e_stop(e);
      return;
    }

    if (signalDOMEvent(cm, e) || eventInWidget(cm.display, e)) {
      return;
    }

    e.dataTransfer.setData("Text", cm.getSelection());
    e.dataTransfer.effectAllowed = "copyMove"; // Use dummy image instead of default browsers image.
    // Recent Safari (~6.0.2) have a tendency to segfault when this happens, so we don't do it there.

    if (e.dataTransfer.setDragImage && !safari) {
      var img = elt("img", null, null, "position: fixed; left: 0; top: 0;");
      img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

      if (presto) {
        img.width = img.height = 1;
        cm.display.wrapper.appendChild(img); // Force a relayout, or Opera won't use our image for some obscure reason

        img._top = img.offsetTop;
      }

      e.dataTransfer.setDragImage(img, 0, 0);

      if (presto) {
        img.parentNode.removeChild(img);
      }
    }
  }

  function onDragOver(cm, e) {
    var pos = posFromMouse(cm, e);

    if (!pos) {
      return;
    }

    var frag = document.createDocumentFragment();
    drawSelectionCursor(cm, pos, frag);

    if (!cm.display.dragCursor) {
      cm.display.dragCursor = elt("div", null, "CodeMirror-cursors CodeMirror-dragcursors");
      cm.display.lineSpace.insertBefore(cm.display.dragCursor, cm.display.cursorDiv);
    }

    removeChildrenAndAdd(cm.display.dragCursor, frag);
  }

  function clearDragCursor(cm) {
    if (cm.display.dragCursor) {
      cm.display.lineSpace.removeChild(cm.display.dragCursor);
      cm.display.dragCursor = null;
    }
  } // These must be handled carefully, because naively registering a
  // handler for each editor will cause the editors to never be
  // garbage collected.


  function forEachCodeMirror(f) {
    if (!document.getElementsByClassName) {
      return;
    }

    var byClass = document.getElementsByClassName("CodeMirror"),
        editors = [];

    for (var i = 0; i < byClass.length; i++) {
      var cm = byClass[i].CodeMirror;

      if (cm) {
        editors.push(cm);
      }
    }

    if (editors.length) {
      editors[0].operation(function () {
        for (var i = 0; i < editors.length; i++) {
          f(editors[i]);
        }
      });
    }
  }

  var globalsRegistered = false;

  function ensureGlobalHandlers() {
    if (globalsRegistered) {
      return;
    }

    registerGlobalHandlers();
    globalsRegistered = true;
  }

  function registerGlobalHandlers() {
    // When the window resizes, we need to refresh active editors.
    var resizeTimer;
    on(window, "resize", function () {
      if (resizeTimer == null) {
        resizeTimer = setTimeout(function () {
          resizeTimer = null;
          forEachCodeMirror(onResize);
        }, 100);
      }
    }); // When the window loses focus, we want to show the editor as blurred

    on(window, "blur", function () {
      return forEachCodeMirror(onBlur);
    });
  } // Called when the window resizes


  function onResize(cm) {
    var d = cm.display; // Might be a text scaling operation, clear size caches.

    d.cachedCharWidth = d.cachedTextHeight = d.cachedPaddingH = null;
    d.scrollbarsClipped = false;
    cm.setSize();
  }

  var keyNames = {
    3: "Pause",
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    16: "Shift",
    17: "Ctrl",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Esc",
    32: "Space",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    44: "PrintScrn",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Mod",
    92: "Mod",
    93: "Mod",
    106: "*",
    107: "=",
    109: "-",
    110: ".",
    111: "/",
    145: "ScrollLock",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    63232: "Up",
    63233: "Down",
    63234: "Left",
    63235: "Right",
    63272: "Delete",
    63273: "Home",
    63275: "End",
    63276: "PageUp",
    63277: "PageDown",
    63302: "Insert"
  }; // Number keys

  for (var i = 0; i < 10; i++) {
    keyNames[i + 48] = keyNames[i + 96] = String(i);
  } // Alphabetic keys


  for (var i$1 = 65; i$1 <= 90; i$1++) {
    keyNames[i$1] = String.fromCharCode(i$1);
  } // Function keys


  for (var i$2 = 1; i$2 <= 12; i$2++) {
    keyNames[i$2 + 111] = keyNames[i$2 + 63235] = "F" + i$2;
  }

  var keyMap = {};
  keyMap.basic = {
    "Left": "goCharLeft",
    "Right": "goCharRight",
    "Up": "goLineUp",
    "Down": "goLineDown",
    "End": "goLineEnd",
    "Home": "goLineStartSmart",
    "PageUp": "goPageUp",
    "PageDown": "goPageDown",
    "Delete": "delCharAfter",
    "Backspace": "delCharBefore",
    "Shift-Backspace": "delCharBefore",
    "Tab": "defaultTab",
    "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent",
    "Insert": "toggleOverwrite",
    "Esc": "singleSelection"
  }; // Note that the save and find-related commands aren't defined by
  // default. User code or addons can define them. Unknown commands
  // are simply ignored.

  keyMap.pcDefault = {
    "Ctrl-A": "selectAll",
    "Ctrl-D": "deleteLine",
    "Ctrl-Z": "undo",
    "Shift-Ctrl-Z": "redo",
    "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart",
    "Ctrl-End": "goDocEnd",
    "Ctrl-Up": "goLineUp",
    "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft",
    "Ctrl-Right": "goGroupRight",
    "Alt-Left": "goLineStart",
    "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore",
    "Ctrl-Delete": "delGroupAfter",
    "Ctrl-S": "save",
    "Ctrl-F": "find",
    "Ctrl-G": "findNext",
    "Shift-Ctrl-G": "findPrev",
    "Shift-Ctrl-F": "replace",
    "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess",
    "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection",
    "Shift-Ctrl-U": "redoSelection",
    "Alt-U": "redoSelection",
    "fallthrough": "basic"
  }; // Very basic readline/emacs-style bindings, which are standard on Mac.

  keyMap.emacsy = {
    "Ctrl-F": "goCharRight",
    "Ctrl-B": "goCharLeft",
    "Ctrl-P": "goLineUp",
    "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight",
    "Alt-B": "goWordLeft",
    "Ctrl-A": "goLineStart",
    "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown",
    "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter",
    "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter",
    "Alt-Backspace": "delWordBefore",
    "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars",
    "Ctrl-O": "openLine"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll",
    "Cmd-D": "deleteLine",
    "Cmd-Z": "undo",
    "Shift-Cmd-Z": "redo",
    "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart",
    "Cmd-Up": "goDocStart",
    "Cmd-End": "goDocEnd",
    "Cmd-Down": "goDocEnd",
    "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight",
    "Cmd-Left": "goLineLeft",
    "Cmd-Right": "goLineRight",
    "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter",
    "Alt-Delete": "delGroupAfter",
    "Cmd-S": "save",
    "Cmd-F": "find",
    "Cmd-G": "findNext",
    "Shift-Cmd-G": "findPrev",
    "Cmd-Alt-F": "replace",
    "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess",
    "Cmd-]": "indentMore",
    "Cmd-Backspace": "delWrappedLineLeft",
    "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection",
    "Shift-Cmd-U": "redoSelection",
    "Ctrl-Up": "goDocStart",
    "Ctrl-Down": "goDocEnd",
    "fallthrough": ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault; // KEYMAP DISPATCH

  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/);
    name = parts[parts.length - 1];
    var alt, ctrl, shift, cmd;

    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];

      if (/^(cmd|meta|m)$/i.test(mod)) {
        cmd = true;
      } else if (/^a(lt)?$/i.test(mod)) {
        alt = true;
      } else if (/^(c|ctrl|control)$/i.test(mod)) {
        ctrl = true;
      } else if (/^s(hift)?$/i.test(mod)) {
        shift = true;
      } else {
        throw new Error("Unrecognized modifier name: " + mod);
      }
    }

    if (alt) {
      name = "Alt-" + name;
    }

    if (ctrl) {
      name = "Ctrl-" + name;
    }

    if (cmd) {
      name = "Cmd-" + name;
    }

    if (shift) {
      name = "Shift-" + name;
    }

    return name;
  } // This is a kludge to keep keymaps mostly working as raw objects
  // (backwards compatibility) while at the same time support features
  // like normalization and multi-stroke key bindings. It compiles a
  // new normalized keymap, and then updates the old object to reflect
  // this.


  function normalizeKeyMap(keymap) {
    var copy = {};

    for (var keyname in keymap) {
      if (keymap.hasOwnProperty(keyname)) {
        var value = keymap[keyname];

        if (/^(name|fallthrough|(de|at)tach)$/.test(keyname)) {
          continue;
        }

        if (value == "...") {
          delete keymap[keyname];
          continue;
        }

        var keys = map(keyname.split(" "), normalizeKeyName);

        for (var i = 0; i < keys.length; i++) {
          var val = void 0,
              name = void 0;

          if (i == keys.length - 1) {
            name = keys.join(" ");
            val = value;
          } else {
            name = keys.slice(0, i + 1).join(" ");
            val = "...";
          }

          var prev = copy[name];

          if (!prev) {
            copy[name] = val;
          } else if (prev != val) {
            throw new Error("Inconsistent bindings for " + name);
          }
        }

        delete keymap[keyname];
      }
    }

    for (var prop in copy) {
      keymap[prop] = copy[prop];
    }

    return keymap;
  }

  function lookupKey(key, map$$1, handle, context) {
    map$$1 = getKeyMap(map$$1);
    var found = map$$1.call ? map$$1.call(key, context) : map$$1[key];

    if (found === false) {
      return "nothing";
    }

    if (found === "...") {
      return "multi";
    }

    if (found != null && handle(found)) {
      return "handled";
    }

    if (map$$1.fallthrough) {
      if (Object.prototype.toString.call(map$$1.fallthrough) != "[object Array]") {
        return lookupKey(key, map$$1.fallthrough, handle, context);
      }

      for (var i = 0; i < map$$1.fallthrough.length; i++) {
        var result = lookupKey(key, map$$1.fallthrough[i], handle, context);

        if (result) {
          return result;
        }
      }
    }
  } // Modifier key presses don't count as 'real' key presses for the
  // purpose of keymap fallthrough.


  function isModifierKey(value) {
    var name = typeof value == "string" ? value : keyNames[value.keyCode];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  }

  function addModifierNames(name, event, noShift) {
    var base = name;

    if (event.altKey && base != "Alt") {
      name = "Alt-" + name;
    }

    if ((flipCtrlCmd ? event.metaKey : event.ctrlKey) && base != "Ctrl") {
      name = "Ctrl-" + name;
    }

    if ((flipCtrlCmd ? event.ctrlKey : event.metaKey) && base != "Cmd") {
      name = "Cmd-" + name;
    }

    if (!noShift && event.shiftKey && base != "Shift") {
      name = "Shift-" + name;
    }

    return name;
  } // Look up the name of a key as indicated by an event object.


  function keyName(event, noShift) {
    if (presto && event.keyCode == 34 && event["char"]) {
      return false;
    }

    var name = keyNames[event.keyCode];

    if (name == null || event.altGraphKey) {
      return false;
    } // Ctrl-ScrollLock has keyCode 3, same as Ctrl-Pause,
    // so we'll use event.code when available (Chrome 48+, FF 38+, Safari 10.1+)


    if (event.keyCode == 3 && event.code) {
      name = event.code;
    }

    return addModifierNames(name, event, noShift);
  }

  function getKeyMap(val) {
    return typeof val == "string" ? keyMap[val] : val;
  } // Helper for deleting text near the selection(s), used to implement
  // backspace, delete, and similar functionality.


  function deleteNearSelection(cm, compute) {
    var ranges = cm.doc.sel.ranges,
        kill = []; // Build up a set of ranges to kill first, merging overlapping
    // ranges.

    for (var i = 0; i < ranges.length; i++) {
      var toKill = compute(ranges[i]);

      while (kill.length && cmp(toKill.from, lst(kill).to) <= 0) {
        var replaced = kill.pop();

        if (cmp(replaced.from, toKill.from) < 0) {
          toKill.from = replaced.from;
          break;
        }
      }

      kill.push(toKill);
    } // Next, remove those actual ranges.


    runInOp(cm, function () {
      for (var i = kill.length - 1; i >= 0; i--) {
        _replaceRange(cm.doc, "", kill[i].from, kill[i].to, "+delete");
      }

      ensureCursorVisible(cm);
    });
  }

  function moveCharLogically(line, ch, dir) {
    var target = skipExtendingChars(line.text, ch + dir, dir);
    return target < 0 || target > line.text.length ? null : target;
  }

  function moveLogically(line, start, dir) {
    var ch = moveCharLogically(line, start.ch, dir);
    return ch == null ? null : new Pos(start.line, ch, dir < 0 ? "after" : "before");
  }

  function endOfLine(visually, cm, lineObj, lineNo, dir) {
    if (visually) {
      var order = getOrder(lineObj, cm.doc.direction);

      if (order) {
        var part = dir < 0 ? lst(order) : order[0];
        var moveInStorageOrder = dir < 0 == (part.level == 1);
        var sticky = moveInStorageOrder ? "after" : "before";
        var ch; // With a wrapped rtl chunk (possibly spanning multiple bidi parts),
        // it could be that the last bidi part is not on the last visual line,
        // since visual lines contain content order-consecutive chunks.
        // Thus, in rtl, we are looking for the first (content-order) character
        // in the rtl chunk that is on the last line (that is, the same line
        // as the last (content-order) character).

        if (part.level > 0 || cm.doc.direction == "rtl") {
          var prep = prepareMeasureForLine(cm, lineObj);
          ch = dir < 0 ? lineObj.text.length - 1 : 0;
          var targetTop = measureCharPrepared(cm, prep, ch).top;
          ch = findFirst(function (ch) {
            return measureCharPrepared(cm, prep, ch).top == targetTop;
          }, dir < 0 == (part.level == 1) ? part.from : part.to - 1, ch);

          if (sticky == "before") {
            ch = moveCharLogically(lineObj, ch, 1);
          }
        } else {
          ch = dir < 0 ? part.to : part.from;
        }

        return new Pos(lineNo, ch, sticky);
      }
    }

    return new Pos(lineNo, dir < 0 ? lineObj.text.length : 0, dir < 0 ? "before" : "after");
  }

  function moveVisually(cm, line, start, dir) {
    var bidi = getOrder(line, cm.doc.direction);

    if (!bidi) {
      return moveLogically(line, start, dir);
    }

    if (start.ch >= line.text.length) {
      start.ch = line.text.length;
      start.sticky = "before";
    } else if (start.ch <= 0) {
      start.ch = 0;
      start.sticky = "after";
    }

    var partPos = getBidiPartAt(bidi, start.ch, start.sticky),
        part = bidi[partPos];

    if (cm.doc.direction == "ltr" && part.level % 2 == 0 && (dir > 0 ? part.to > start.ch : part.from < start.ch)) {
      // Case 1: We move within an ltr part in an ltr editor. Even with wrapped lines,
      // nothing interesting happens.
      return moveLogically(line, start, dir);
    }

    var mv = function mv(pos, dir) {
      return moveCharLogically(line, pos instanceof Pos ? pos.ch : pos, dir);
    };

    var prep;

    var getWrappedLineExtent = function getWrappedLineExtent(ch) {
      if (!cm.options.lineWrapping) {
        return {
          begin: 0,
          end: line.text.length
        };
      }

      prep = prep || prepareMeasureForLine(cm, line);
      return wrappedLineExtentChar(cm, line, prep, ch);
    };

    var wrappedLineExtent = getWrappedLineExtent(start.sticky == "before" ? mv(start, -1) : start.ch);

    if (cm.doc.direction == "rtl" || part.level == 1) {
      var moveInStorageOrder = part.level == 1 == dir < 0;
      var ch = mv(start, moveInStorageOrder ? 1 : -1);

      if (ch != null && (!moveInStorageOrder ? ch >= part.from && ch >= wrappedLineExtent.begin : ch <= part.to && ch <= wrappedLineExtent.end)) {
        // Case 2: We move within an rtl part or in an rtl editor on the same visual line
        var sticky = moveInStorageOrder ? "before" : "after";
        return new Pos(start.line, ch, sticky);
      }
    } // Case 3: Could not move within this bidi part in this visual line, so leave
    // the current bidi part


    var searchInVisualLine = function searchInVisualLine(partPos, dir, wrappedLineExtent) {
      var getRes = function getRes(ch, moveInStorageOrder) {
        return moveInStorageOrder ? new Pos(start.line, mv(ch, 1), "before") : new Pos(start.line, ch, "after");
      };

      for (; partPos >= 0 && partPos < bidi.length; partPos += dir) {
        var part = bidi[partPos];
        var moveInStorageOrder = dir > 0 == (part.level != 1);
        var ch = moveInStorageOrder ? wrappedLineExtent.begin : mv(wrappedLineExtent.end, -1);

        if (part.from <= ch && ch < part.to) {
          return getRes(ch, moveInStorageOrder);
        }

        ch = moveInStorageOrder ? part.from : mv(part.to, -1);

        if (wrappedLineExtent.begin <= ch && ch < wrappedLineExtent.end) {
          return getRes(ch, moveInStorageOrder);
        }
      }
    }; // Case 3a: Look for other bidi parts on the same visual line


    var res = searchInVisualLine(partPos + dir, dir, wrappedLineExtent);

    if (res) {
      return res;
    } // Case 3b: Look for other bidi parts on the next visual line


    var nextCh = dir > 0 ? wrappedLineExtent.end : mv(wrappedLineExtent.begin, -1);

    if (nextCh != null && !(dir > 0 && nextCh == line.text.length)) {
      res = searchInVisualLine(dir > 0 ? 0 : bidi.length - 1, dir, getWrappedLineExtent(nextCh));

      if (res) {
        return res;
      }
    } // Case 4: Nowhere to move


    return null;
  } // Commands are parameter-less actions that can be performed on an
  // editor, mostly used for keybindings.


  var commands = {
    selectAll: selectAll,
    singleSelection: function singleSelection(cm) {
      return cm.setSelection(cm.getCursor("anchor"), cm.getCursor("head"), sel_dontScroll);
    },
    killLine: function killLine(cm) {
      return deleteNearSelection(cm, function (range) {
        if (range.empty()) {
          var len = getLine(cm.doc, range.head.line).text.length;

          if (range.head.ch == len && range.head.line < cm.lastLine()) {
            return {
              from: range.head,
              to: Pos(range.head.line + 1, 0)
            };
          } else {
            return {
              from: range.head,
              to: Pos(range.head.line, len)
            };
          }
        } else {
          return {
            from: range.from(),
            to: range.to()
          };
        }
      });
    },
    deleteLine: function deleteLine(cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0),
          to: _clipPos(cm.doc, Pos(range.to().line + 1, 0))
        };
      });
    },
    delLineLeft: function delLineLeft(cm) {
      return deleteNearSelection(cm, function (range) {
        return {
          from: Pos(range.from().line, 0),
          to: range.from()
        };
      });
    },
    delWrappedLineLeft: function delWrappedLineLeft(cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var leftPos = cm.coordsChar({
          left: 0,
          top: top
        }, "div");
        return {
          from: leftPos,
          to: range.from()
        };
      });
    },
    delWrappedLineRight: function delWrappedLineRight(cm) {
      return deleteNearSelection(cm, function (range) {
        var top = cm.charCoords(range.head, "div").top + 5;
        var rightPos = cm.coordsChar({
          left: cm.display.lineDiv.offsetWidth + 100,
          top: top
        }, "div");
        return {
          from: range.from(),
          to: rightPos
        };
      });
    },
    undo: function undo(cm) {
      return cm.undo();
    },
    redo: function redo(cm) {
      return cm.redo();
    },
    undoSelection: function undoSelection(cm) {
      return cm.undoSelection();
    },
    redoSelection: function redoSelection(cm) {
      return cm.redoSelection();
    },
    goDocStart: function goDocStart(cm) {
      return cm.extendSelection(Pos(cm.firstLine(), 0));
    },
    goDocEnd: function goDocEnd(cm) {
      return cm.extendSelection(Pos(cm.lastLine()));
    },
    goLineStart: function goLineStart(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStart(cm, range.head.line);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineStartSmart: function goLineStartSmart(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineStartSmart(cm, range.head);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineEnd: function goLineEnd(cm) {
      return cm.extendSelectionsBy(function (range) {
        return lineEnd(cm, range.head.line);
      }, {
        origin: "+move",
        bias: -1
      });
    },
    goLineRight: function goLineRight(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({
          left: cm.display.lineDiv.offsetWidth + 100,
          top: top
        }, "div");
      }, sel_move);
    },
    goLineLeft: function goLineLeft(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        return cm.coordsChar({
          left: 0,
          top: top
        }, "div");
      }, sel_move);
    },
    goLineLeftSmart: function goLineLeftSmart(cm) {
      return cm.extendSelectionsBy(function (range) {
        var top = cm.cursorCoords(range.head, "div").top + 5;
        var pos = cm.coordsChar({
          left: 0,
          top: top
        }, "div");

        if (pos.ch < cm.getLine(pos.line).search(/\S/)) {
          return lineStartSmart(cm, range.head);
        }

        return pos;
      }, sel_move);
    },
    goLineUp: function goLineUp(cm) {
      return cm.moveV(-1, "line");
    },
    goLineDown: function goLineDown(cm) {
      return cm.moveV(1, "line");
    },
    goPageUp: function goPageUp(cm) {
      return cm.moveV(-1, "page");
    },
    goPageDown: function goPageDown(cm) {
      return cm.moveV(1, "page");
    },
    goCharLeft: function goCharLeft(cm) {
      return cm.moveH(-1, "char");
    },
    goCharRight: function goCharRight(cm) {
      return cm.moveH(1, "char");
    },
    goColumnLeft: function goColumnLeft(cm) {
      return cm.moveH(-1, "column");
    },
    goColumnRight: function goColumnRight(cm) {
      return cm.moveH(1, "column");
    },
    goWordLeft: function goWordLeft(cm) {
      return cm.moveH(-1, "word");
    },
    goGroupRight: function goGroupRight(cm) {
      return cm.moveH(1, "group");
    },
    goGroupLeft: function goGroupLeft(cm) {
      return cm.moveH(-1, "group");
    },
    goWordRight: function goWordRight(cm) {
      return cm.moveH(1, "word");
    },
    delCharBefore: function delCharBefore(cm) {
      return cm.deleteH(-1, "char");
    },
    delCharAfter: function delCharAfter(cm) {
      return cm.deleteH(1, "char");
    },
    delWordBefore: function delWordBefore(cm) {
      return cm.deleteH(-1, "word");
    },
    delWordAfter: function delWordAfter(cm) {
      return cm.deleteH(1, "word");
    },
    delGroupBefore: function delGroupBefore(cm) {
      return cm.deleteH(-1, "group");
    },
    delGroupAfter: function delGroupAfter(cm) {
      return cm.deleteH(1, "group");
    },
    indentAuto: function indentAuto(cm) {
      return cm.indentSelection("smart");
    },
    indentMore: function indentMore(cm) {
      return cm.indentSelection("add");
    },
    indentLess: function indentLess(cm) {
      return cm.indentSelection("subtract");
    },
    insertTab: function insertTab(cm) {
      return cm.replaceSelection("\t");
    },
    insertSoftTab: function insertSoftTab(cm) {
      var spaces = [],
          ranges = cm.listSelections(),
          tabSize = cm.options.tabSize;

      for (var i = 0; i < ranges.length; i++) {
        var pos = ranges[i].from();
        var col = countColumn(cm.getLine(pos.line), pos.ch, tabSize);
        spaces.push(spaceStr(tabSize - col % tabSize));
      }

      cm.replaceSelections(spaces);
    },
    defaultTab: function defaultTab(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        cm.execCommand("insertTab");
      }
    },
    // Swap the two chars left and right of each selection's head.
    // Move cursor behind the two swapped characters afterwards.
    //
    // Doesn't consider line feeds a character.
    // Doesn't scan more than one line above to find a character.
    // Doesn't do anything on an empty line.
    // Doesn't do anything with non-empty selections.
    transposeChars: function transposeChars(cm) {
      return runInOp(cm, function () {
        var ranges = cm.listSelections(),
            newSel = [];

        for (var i = 0; i < ranges.length; i++) {
          if (!ranges[i].empty()) {
            continue;
          }

          var cur = ranges[i].head,
              line = getLine(cm.doc, cur.line).text;

          if (line) {
            if (cur.ch == line.length) {
              cur = new Pos(cur.line, cur.ch - 1);
            }

            if (cur.ch > 0) {
              cur = new Pos(cur.line, cur.ch + 1);
              cm.replaceRange(line.charAt(cur.ch - 1) + line.charAt(cur.ch - 2), Pos(cur.line, cur.ch - 2), cur, "+transpose");
            } else if (cur.line > cm.doc.first) {
              var prev = getLine(cm.doc, cur.line - 1).text;

              if (prev) {
                cur = new Pos(cur.line, 1);
                cm.replaceRange(line.charAt(0) + cm.doc.lineSeparator() + prev.charAt(prev.length - 1), Pos(cur.line - 1, prev.length - 1), cur, "+transpose");
              }
            }
          }

          newSel.push(new Range(cur, cur));
        }

        cm.setSelections(newSel);
      });
    },
    newlineAndIndent: function newlineAndIndent(cm) {
      return runInOp(cm, function () {
        var sels = cm.listSelections();

        for (var i = sels.length - 1; i >= 0; i--) {
          cm.replaceRange(cm.doc.lineSeparator(), sels[i].anchor, sels[i].head, "+input");
        }

        sels = cm.listSelections();

        for (var i$1 = 0; i$1 < sels.length; i$1++) {
          cm.indentLine(sels[i$1].from().line, null, true);
        }

        ensureCursorVisible(cm);
      });
    },
    openLine: function openLine(cm) {
      return cm.replaceSelection("\n", "start");
    },
    toggleOverwrite: function toggleOverwrite(cm) {
      return cm.toggleOverwrite();
    }
  };

  function lineStart(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLine(line);

    if (visual != line) {
      lineN = lineNo(visual);
    }

    return endOfLine(true, cm, visual, lineN, 1);
  }

  function lineEnd(cm, lineN) {
    var line = getLine(cm.doc, lineN);
    var visual = visualLineEnd(line);

    if (visual != line) {
      lineN = lineNo(visual);
    }

    return endOfLine(true, cm, line, lineN, -1);
  }

  function lineStartSmart(cm, pos) {
    var start = lineStart(cm, pos.line);
    var line = getLine(cm.doc, start.line);
    var order = getOrder(line, cm.doc.direction);

    if (!order || order[0].level == 0) {
      var firstNonWS = Math.max(0, line.text.search(/\S/));
      var inWS = pos.line == start.line && pos.ch <= firstNonWS && pos.ch;
      return Pos(start.line, inWS ? 0 : firstNonWS, start.sticky);
    }

    return start;
  } // Run a handler that was bound to a key.


  function doHandleBinding(cm, bound, dropShift) {
    if (typeof bound == "string") {
      bound = commands[bound];

      if (!bound) {
        return false;
      }
    } // Ensure previous input has been read, so that the handler sees a
    // consistent view of the document


    cm.display.input.ensurePolled();
    var prevShift = cm.display.shift,
        done = false;

    try {
      if (cm.isReadOnly()) {
        cm.state.suppressEdits = true;
      }

      if (dropShift) {
        cm.display.shift = false;
      }

      done = bound(cm) != Pass;
    } finally {
      cm.display.shift = prevShift;
      cm.state.suppressEdits = false;
    }

    return done;
  }

  function lookupKeyForEditor(cm, name, handle) {
    for (var i = 0; i < cm.state.keyMaps.length; i++) {
      var result = lookupKey(name, cm.state.keyMaps[i], handle, cm);

      if (result) {
        return result;
      }
    }

    return cm.options.extraKeys && lookupKey(name, cm.options.extraKeys, handle, cm) || lookupKey(name, cm.options.keyMap, handle, cm);
  } // Note that, despite the name, this function is also used to check
  // for bound mouse clicks.


  var stopSeq = new Delayed();

  function dispatchKey(cm, name, e, handle) {
    var seq = cm.state.keySeq;

    if (seq) {
      if (isModifierKey(name)) {
        return "handled";
      }

      if (/\'$/.test(name)) {
        cm.state.keySeq = null;
      } else {
        stopSeq.set(50, function () {
          if (cm.state.keySeq == seq) {
            cm.state.keySeq = null;
            cm.display.input.reset();
          }
        });
      }

      if (dispatchKeyInner(cm, seq + " " + name, e, handle)) {
        return true;
      }
    }

    return dispatchKeyInner(cm, name, e, handle);
  }

  function dispatchKeyInner(cm, name, e, handle) {
    var result = lookupKeyForEditor(cm, name, handle);

    if (result == "multi") {
      cm.state.keySeq = name;
    }

    if (result == "handled") {
      signalLater(cm, "keyHandled", cm, name, e);
    }

    if (result == "handled" || result == "multi") {
      e_preventDefault(e);
      restartBlink(cm);
    }

    return !!result;
  } // Handle a key from the keydown event.


  function handleKeyBinding(cm, e) {
    var name = keyName(e, true);

    if (!name) {
      return false;
    }

    if (e.shiftKey && !cm.state.keySeq) {
      // First try to resolve full name (including 'Shift-'). Failing
      // that, see if there is a cursor-motion command (starting with
      // 'go') bound to the keyname without 'Shift-'.
      return dispatchKey(cm, "Shift-" + name, e, function (b) {
        return doHandleBinding(cm, b, true);
      }) || dispatchKey(cm, name, e, function (b) {
        if (typeof b == "string" ? /^go[A-Z]/.test(b) : b.motion) {
          return doHandleBinding(cm, b);
        }
      });
    } else {
      return dispatchKey(cm, name, e, function (b) {
        return doHandleBinding(cm, b);
      });
    }
  } // Handle a key from the keypress event


  function handleCharBinding(cm, e, ch) {
    return dispatchKey(cm, "'" + ch + "'", e, function (b) {
      return doHandleBinding(cm, b, true);
    });
  }

  var lastStoppedKey = null;

  function onKeyDown(e) {
    var cm = this;
    cm.curOp.focus = activeElt();

    if (signalDOMEvent(cm, e)) {
      return;
    } // IE does strange things with escape.


    if (ie && ie_version < 11 && e.keyCode == 27) {
      e.returnValue = false;
    }

    var code = e.keyCode;
    cm.display.shift = code == 16 || e.shiftKey;
    var handled = handleKeyBinding(cm, e);

    if (presto) {
      lastStoppedKey = handled ? code : null; // Opera has no cut event... we try to at least catch the key combo

      if (!handled && code == 88 && !hasCopyEvent && (mac ? e.metaKey : e.ctrlKey)) {
        cm.replaceSelection("", null, "cut");
      }
    } // Turn mouse into crosshair when Alt is held on Mac.


    if (code == 18 && !/\bCodeMirror-crosshair\b/.test(cm.display.lineDiv.className)) {
      showCrossHair(cm);
    }
  }

  function showCrossHair(cm) {
    var lineDiv = cm.display.lineDiv;
    addClass(lineDiv, "CodeMirror-crosshair");

    function up(e) {
      if (e.keyCode == 18 || !e.altKey) {
        rmClass(lineDiv, "CodeMirror-crosshair");
        off(document, "keyup", up);
        off(document, "mouseover", up);
      }
    }

    on(document, "keyup", up);
    on(document, "mouseover", up);
  }

  function onKeyUp(e) {
    if (e.keyCode == 16) {
      this.doc.sel.shift = false;
    }

    signalDOMEvent(this, e);
  }

  function onKeyPress(e) {
    var cm = this;

    if (eventInWidget(cm.display, e) || signalDOMEvent(cm, e) || e.ctrlKey && !e.altKey || mac && e.metaKey) {
      return;
    }

    var keyCode = e.keyCode,
        charCode = e.charCode;

    if (presto && keyCode == lastStoppedKey) {
      lastStoppedKey = null;
      e_preventDefault(e);
      return;
    }

    if (presto && (!e.which || e.which < 10) && handleKeyBinding(cm, e)) {
      return;
    }

    var ch = String.fromCharCode(charCode == null ? keyCode : charCode); // Some browsers fire keypress events for backspace

    if (ch == "\x08") {
      return;
    }

    if (handleCharBinding(cm, e, ch)) {
      return;
    }

    cm.display.input.onKeyPress(e);
  }

  var DOUBLECLICK_DELAY = 400;

  var PastClick = function PastClick(time, pos, button) {
    this.time = time;
    this.pos = pos;
    this.button = button;
  };

  PastClick.prototype.compare = function (time, pos, button) {
    return this.time + DOUBLECLICK_DELAY > time && cmp(pos, this.pos) == 0 && button == this.button;
  };

  var lastClick, lastDoubleClick;

  function clickRepeat(pos, button) {
    var now = +new Date();

    if (lastDoubleClick && lastDoubleClick.compare(now, pos, button)) {
      lastClick = lastDoubleClick = null;
      return "triple";
    } else if (lastClick && lastClick.compare(now, pos, button)) {
      lastDoubleClick = new PastClick(now, pos, button);
      lastClick = null;
      return "double";
    } else {
      lastClick = new PastClick(now, pos, button);
      lastDoubleClick = null;
      return "single";
    }
  } // A mouse down can be a single click, double click, triple click,
  // start of selection drag, start of text drag, new cursor
  // (ctrl-click), rectangle drag (alt-drag), or xwin
  // middle-click-paste. Or it might be a click on something we should
  // not interfere with, such as a scrollbar or widget.


  function onMouseDown(e) {
    var cm = this,
        display = cm.display;

    if (signalDOMEvent(cm, e) || display.activeTouch && display.input.supportsTouch()) {
      return;
    }

    display.input.ensurePolled();
    display.shift = e.shiftKey;

    if (eventInWidget(display, e)) {
      if (!webkit) {
        // Briefly turn off draggability, to allow widgets to do
        // normal dragging things.
        display.scroller.draggable = false;
        setTimeout(function () {
          return display.scroller.draggable = true;
        }, 100);
      }

      return;
    }

    if (clickInGutter(cm, e)) {
      return;
    }

    var pos = posFromMouse(cm, e),
        button = e_button(e),
        repeat = pos ? clickRepeat(pos, button) : "single";
    window.focus(); // #3261: make sure, that we're not starting a second selection

    if (button == 1 && cm.state.selectingText) {
      cm.state.selectingText(e);
    }

    if (pos && handleMappedButton(cm, button, pos, repeat, e)) {
      return;
    }

    if (button == 1) {
      if (pos) {
        leftButtonDown(cm, pos, repeat, e);
      } else if (e_target(e) == display.scroller) {
        e_preventDefault(e);
      }
    } else if (button == 2) {
      if (pos) {
        extendSelection(cm.doc, pos);
      }

      setTimeout(function () {
        return display.input.focus();
      }, 20);
    } else if (button == 3) {
      if (captureRightClick) {
        cm.display.input.onContextMenu(e);
      } else {
        delayBlurEvent(cm);
      }
    }
  }

  function handleMappedButton(cm, button, pos, repeat, event) {
    var name = "Click";

    if (repeat == "double") {
      name = "Double" + name;
    } else if (repeat == "triple") {
      name = "Triple" + name;
    }

    name = (button == 1 ? "Left" : button == 2 ? "Middle" : "Right") + name;
    return dispatchKey(cm, addModifierNames(name, event), event, function (bound) {
      if (typeof bound == "string") {
        bound = commands[bound];
      }

      if (!bound) {
        return false;
      }

      var done = false;

      try {
        if (cm.isReadOnly()) {
          cm.state.suppressEdits = true;
        }

        done = bound(cm, pos) != Pass;
      } finally {
        cm.state.suppressEdits = false;
      }

      return done;
    });
  }

  function configureMouse(cm, repeat, event) {
    var option = cm.getOption("configureMouse");
    var value = option ? option(cm, repeat, event) : {};

    if (value.unit == null) {
      var rect = chromeOS ? event.shiftKey && event.metaKey : event.altKey;
      value.unit = rect ? "rectangle" : repeat == "single" ? "char" : repeat == "double" ? "word" : "line";
    }

    if (value.extend == null || cm.doc.extend) {
      value.extend = cm.doc.extend || event.shiftKey;
    }

    if (value.addNew == null) {
      value.addNew = mac ? event.metaKey : event.ctrlKey;
    }

    if (value.moveOnDrag == null) {
      value.moveOnDrag = !(mac ? event.altKey : event.ctrlKey);
    }

    return value;
  }

  function leftButtonDown(cm, pos, repeat, event) {
    if (ie) {
      setTimeout(bind(ensureFocus, cm), 0);
    } else {
      cm.curOp.focus = activeElt();
    }

    var behavior = configureMouse(cm, repeat, event);
    var sel = cm.doc.sel,
        contained;

    if (cm.options.dragDrop && dragAndDrop && !cm.isReadOnly() && repeat == "single" && (contained = sel.contains(pos)) > -1 && (cmp((contained = sel.ranges[contained]).from(), pos) < 0 || pos.xRel > 0) && (cmp(contained.to(), pos) > 0 || pos.xRel < 0)) {
      leftButtonStartDrag(cm, event, pos, behavior);
    } else {
      leftButtonSelect(cm, event, pos, behavior);
    }
  } // Start a text drag. When it ends, see if any dragging actually
  // happen, and treat as a click if it didn't.


  function leftButtonStartDrag(cm, event, pos, behavior) {
    var display = cm.display,
        moved = false;
    var dragEnd = operation(cm, function (e) {
      if (webkit) {
        display.scroller.draggable = false;
      }

      cm.state.draggingText = false;
      off(display.wrapper.ownerDocument, "mouseup", dragEnd);
      off(display.wrapper.ownerDocument, "mousemove", mouseMove);
      off(display.scroller, "dragstart", dragStart);
      off(display.scroller, "drop", dragEnd);

      if (!moved) {
        e_preventDefault(e);

        if (!behavior.addNew) {
          extendSelection(cm.doc, pos, null, null, behavior.extend);
        } // Work around unexplainable focus problem in IE9 (#2127) and Chrome (#3081)


        if (webkit || ie && ie_version == 9) {
          setTimeout(function () {
            display.wrapper.ownerDocument.body.focus();
            display.input.focus();
          }, 20);
        } else {
          display.input.focus();
        }
      }
    });

    var mouseMove = function mouseMove(e2) {
      moved = moved || Math.abs(event.clientX - e2.clientX) + Math.abs(event.clientY - e2.clientY) >= 10;
    };

    var dragStart = function dragStart() {
      return moved = true;
    }; // Let the drag handler handle this.


    if (webkit) {
      display.scroller.draggable = true;
    }

    cm.state.draggingText = dragEnd;
    dragEnd.copy = !behavior.moveOnDrag; // IE's approach to draggable

    if (display.scroller.dragDrop) {
      display.scroller.dragDrop();
    }

    on(display.wrapper.ownerDocument, "mouseup", dragEnd);
    on(display.wrapper.ownerDocument, "mousemove", mouseMove);
    on(display.scroller, "dragstart", dragStart);
    on(display.scroller, "drop", dragEnd);
    delayBlurEvent(cm);
    setTimeout(function () {
      return display.input.focus();
    }, 20);
  }

  function rangeForUnit(cm, pos, unit) {
    if (unit == "char") {
      return new Range(pos, pos);
    }

    if (unit == "word") {
      return cm.findWordAt(pos);
    }

    if (unit == "line") {
      return new Range(Pos(pos.line, 0), _clipPos(cm.doc, Pos(pos.line + 1, 0)));
    }

    var result = unit(cm, pos);
    return new Range(result.from, result.to);
  } // Normal selection, as opposed to text dragging.


  function leftButtonSelect(cm, event, start, behavior) {
    var display = cm.display,
        doc = cm.doc;
    e_preventDefault(event);
    var ourRange,
        ourIndex,
        startSel = doc.sel,
        ranges = startSel.ranges;

    if (behavior.addNew && !behavior.extend) {
      ourIndex = doc.sel.contains(start);

      if (ourIndex > -1) {
        ourRange = ranges[ourIndex];
      } else {
        ourRange = new Range(start, start);
      }
    } else {
      ourRange = doc.sel.primary();
      ourIndex = doc.sel.primIndex;
    }

    if (behavior.unit == "rectangle") {
      if (!behavior.addNew) {
        ourRange = new Range(start, start);
      }

      start = posFromMouse(cm, event, true, true);
      ourIndex = -1;
    } else {
      var range$$1 = rangeForUnit(cm, start, behavior.unit);

      if (behavior.extend) {
        ourRange = extendRange(ourRange, range$$1.anchor, range$$1.head, behavior.extend);
      } else {
        ourRange = range$$1;
      }
    }

    if (!behavior.addNew) {
      ourIndex = 0;
      setSelection(doc, new Selection([ourRange], 0), sel_mouse);
      startSel = doc.sel;
    } else if (ourIndex == -1) {
      ourIndex = ranges.length;
      setSelection(doc, normalizeSelection(cm, ranges.concat([ourRange]), ourIndex), {
        scroll: false,
        origin: "*mouse"
      });
    } else if (ranges.length > 1 && ranges[ourIndex].empty() && behavior.unit == "char" && !behavior.extend) {
      setSelection(doc, normalizeSelection(cm, ranges.slice(0, ourIndex).concat(ranges.slice(ourIndex + 1)), 0), {
        scroll: false,
        origin: "*mouse"
      });
      startSel = doc.sel;
    } else {
      replaceOneSelection(doc, ourIndex, ourRange, sel_mouse);
    }

    var lastPos = start;

    function extendTo(pos) {
      if (cmp(lastPos, pos) == 0) {
        return;
      }

      lastPos = pos;

      if (behavior.unit == "rectangle") {
        var ranges = [],
            tabSize = cm.options.tabSize;
        var startCol = countColumn(getLine(doc, start.line).text, start.ch, tabSize);
        var posCol = countColumn(getLine(doc, pos.line).text, pos.ch, tabSize);
        var left = Math.min(startCol, posCol),
            right = Math.max(startCol, posCol);

        for (var line = Math.min(start.line, pos.line), end = Math.min(cm.lastLine(), Math.max(start.line, pos.line)); line <= end; line++) {
          var text = getLine(doc, line).text,
              leftPos = findColumn(text, left, tabSize);

          if (left == right) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, leftPos)));
          } else if (text.length > leftPos) {
            ranges.push(new Range(Pos(line, leftPos), Pos(line, findColumn(text, right, tabSize))));
          }
        }

        if (!ranges.length) {
          ranges.push(new Range(start, start));
        }

        setSelection(doc, normalizeSelection(cm, startSel.ranges.slice(0, ourIndex).concat(ranges), ourIndex), {
          origin: "*mouse",
          scroll: false
        });
        cm.scrollIntoView(pos);
      } else {
        var oldRange = ourRange;
        var range$$1 = rangeForUnit(cm, pos, behavior.unit);
        var anchor = oldRange.anchor,
            head;

        if (cmp(range$$1.anchor, anchor) > 0) {
          head = range$$1.head;
          anchor = minPos(oldRange.from(), range$$1.anchor);
        } else {
          head = range$$1.anchor;
          anchor = maxPos(oldRange.to(), range$$1.head);
        }

        var ranges$1 = startSel.ranges.slice(0);
        ranges$1[ourIndex] = bidiSimplify(cm, new Range(_clipPos(doc, anchor), head));
        setSelection(doc, normalizeSelection(cm, ranges$1, ourIndex), sel_mouse);
      }
    }

    var editorSize = display.wrapper.getBoundingClientRect(); // Used to ensure timeout re-tries don't fire when another extend
    // happened in the meantime (clearTimeout isn't reliable -- at
    // least on Chrome, the timeouts still happen even when cleared,
    // if the clear happens after their scheduled firing time).

    var counter = 0;

    function extend(e) {
      var curCount = ++counter;
      var cur = posFromMouse(cm, e, true, behavior.unit == "rectangle");

      if (!cur) {
        return;
      }

      if (cmp(cur, lastPos) != 0) {
        cm.curOp.focus = activeElt();
        extendTo(cur);
        var visible = visibleLines(display, doc);

        if (cur.line >= visible.to || cur.line < visible.from) {
          setTimeout(operation(cm, function () {
            if (counter == curCount) {
              extend(e);
            }
          }), 150);
        }
      } else {
        var outside = e.clientY < editorSize.top ? -20 : e.clientY > editorSize.bottom ? 20 : 0;

        if (outside) {
          setTimeout(operation(cm, function () {
            if (counter != curCount) {
              return;
            }

            display.scroller.scrollTop += outside;
            extend(e);
          }), 50);
        }
      }
    }

    function done(e) {
      cm.state.selectingText = false;
      counter = Infinity; // If e is null or undefined we interpret this as someone trying
      // to explicitly cancel the selection rather than the user
      // letting go of the mouse button.

      if (e) {
        e_preventDefault(e);
        display.input.focus();
      }

      off(display.wrapper.ownerDocument, "mousemove", move);
      off(display.wrapper.ownerDocument, "mouseup", up);
      doc.history.lastSelOrigin = null;
    }

    var move = operation(cm, function (e) {
      if (e.buttons === 0 || !e_button(e)) {
        done(e);
      } else {
        extend(e);
      }
    });
    var up = operation(cm, done);
    cm.state.selectingText = up;
    on(display.wrapper.ownerDocument, "mousemove", move);
    on(display.wrapper.ownerDocument, "mouseup", up);
  } // Used when mouse-selecting to adjust the anchor to the proper side
  // of a bidi jump depending on the visual position of the head.


  function bidiSimplify(cm, range$$1) {
    var anchor = range$$1.anchor;
    var head = range$$1.head;
    var anchorLine = getLine(cm.doc, anchor.line);

    if (cmp(anchor, head) == 0 && anchor.sticky == head.sticky) {
      return range$$1;
    }

    var order = getOrder(anchorLine);

    if (!order) {
      return range$$1;
    }

    var index = getBidiPartAt(order, anchor.ch, anchor.sticky),
        part = order[index];

    if (part.from != anchor.ch && part.to != anchor.ch) {
      return range$$1;
    }

    var boundary = index + (part.from == anchor.ch == (part.level != 1) ? 0 : 1);

    if (boundary == 0 || boundary == order.length) {
      return range$$1;
    } // Compute the relative visual position of the head compared to the
    // anchor (<0 is to the left, >0 to the right)


    var leftSide;

    if (head.line != anchor.line) {
      leftSide = (head.line - anchor.line) * (cm.doc.direction == "ltr" ? 1 : -1) > 0;
    } else {
      var headIndex = getBidiPartAt(order, head.ch, head.sticky);
      var dir = headIndex - index || (head.ch - anchor.ch) * (part.level == 1 ? -1 : 1);

      if (headIndex == boundary - 1 || headIndex == boundary) {
        leftSide = dir < 0;
      } else {
        leftSide = dir > 0;
      }
    }

    var usePart = order[boundary + (leftSide ? -1 : 0)];
    var from = leftSide == (usePart.level == 1);
    var ch = from ? usePart.from : usePart.to,
        sticky = from ? "after" : "before";
    return anchor.ch == ch && anchor.sticky == sticky ? range$$1 : new Range(new Pos(anchor.line, ch, sticky), head);
  } // Determines whether an event happened in the gutter, and fires the
  // handlers for the corresponding event.


  function gutterEvent(cm, e, type, prevent) {
    var mX, mY;

    if (e.touches) {
      mX = e.touches[0].clientX;
      mY = e.touches[0].clientY;
    } else {
      try {
        mX = e.clientX;
        mY = e.clientY;
      } catch (e) {
        return false;
      }
    }

    if (mX >= Math.floor(cm.display.gutters.getBoundingClientRect().right)) {
      return false;
    }

    if (prevent) {
      e_preventDefault(e);
    }

    var display = cm.display;
    var lineBox = display.lineDiv.getBoundingClientRect();

    if (mY > lineBox.bottom || !hasHandler(cm, type)) {
      return e_defaultPrevented(e);
    }

    mY -= lineBox.top - display.viewOffset;

    for (var i = 0; i < cm.display.gutterSpecs.length; ++i) {
      var g = display.gutters.childNodes[i];

      if (g && g.getBoundingClientRect().right >= mX) {
        var line = _lineAtHeight(cm.doc, mY);

        var gutter = cm.display.gutterSpecs[i];
        signal(cm, type, cm, line, gutter.className, e);
        return e_defaultPrevented(e);
      }
    }
  }

  function clickInGutter(cm, e) {
    return gutterEvent(cm, e, "gutterClick", true);
  } // CONTEXT MENU HANDLING
  // To make the context menu work, we need to briefly unhide the
  // textarea (making it as unobtrusive as possible) to let the
  // right-click take effect on it.


  function onContextMenu(cm, e) {
    if (eventInWidget(cm.display, e) || contextMenuInGutter(cm, e)) {
      return;
    }

    if (signalDOMEvent(cm, e, "contextmenu")) {
      return;
    }

    if (!captureRightClick) {
      cm.display.input.onContextMenu(e);
    }
  }

  function contextMenuInGutter(cm, e) {
    if (!hasHandler(cm, "gutterContextMenu")) {
      return false;
    }

    return gutterEvent(cm, e, "gutterContextMenu", false);
  }

  function themeChanged(cm) {
    cm.display.wrapper.className = cm.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + cm.options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    clearCaches(cm);
  }

  var Init = {
    toString: function toString() {
      return "CodeMirror.Init";
    }
  };
  var defaults = {};
  var optionHandlers = {};

  function defineOptions(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;

    function option(name, deflt, handle, notOnInit) {
      CodeMirror.defaults[name] = deflt;

      if (handle) {
        optionHandlers[name] = notOnInit ? function (cm, val, old) {
          if (old != Init) {
            handle(cm, val, old);
          }
        } : handle;
      }
    }

    CodeMirror.defineOption = option; // Passed to option handlers when there is no old value.

    CodeMirror.Init = Init; // These two are, on init, called from the constructor because they
    // have to be initialized before the editor can start at all.

    option("value", "", function (cm, val) {
      return cm.setValue(val);
    }, true);
    option("mode", null, function (cm, val) {
      cm.doc.modeOption = val;
      loadMode(cm);
    }, true);
    option("indentUnit", 2, loadMode, true);
    option("indentWithTabs", false);
    option("smartIndent", true);
    option("tabSize", 4, function (cm) {
      resetModeState(cm);
      clearCaches(cm);
      regChange(cm);
    }, true);
    option("lineSeparator", null, function (cm, val) {
      cm.doc.lineSep = val;

      if (!val) {
        return;
      }

      var newBreaks = [],
          lineNo = cm.doc.first;
      cm.doc.iter(function (line) {
        for (var pos = 0;;) {
          var found = line.text.indexOf(val, pos);

          if (found == -1) {
            break;
          }

          pos = found + val.length;
          newBreaks.push(Pos(lineNo, found));
        }

        lineNo++;
      });

      for (var i = newBreaks.length - 1; i >= 0; i--) {
        _replaceRange(cm.doc, val, newBreaks[i], Pos(newBreaks[i].line, newBreaks[i].ch + val.length));
      }
    });
    option("specialChars", /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u200b-\u200f\u2028\u2029\ufeff\ufff9-\ufffc]/g, function (cm, val, old) {
      cm.state.specialChars = new RegExp(val.source + (val.test("\t") ? "" : "|\t"), "g");

      if (old != Init) {
        cm.refresh();
      }
    });
    option("specialCharPlaceholder", defaultSpecialCharPlaceholder, function (cm) {
      return cm.refresh();
    }, true);
    option("electricChars", true);
    option("inputStyle", mobile ? "contenteditable" : "textarea", function () {
      throw new Error("inputStyle can not (yet) be changed in a running editor"); // FIXME
    }, true);
    option("spellcheck", false, function (cm, val) {
      return cm.getInputField().spellcheck = val;
    }, true);
    option("autocorrect", false, function (cm, val) {
      return cm.getInputField().autocorrect = val;
    }, true);
    option("autocapitalize", false, function (cm, val) {
      return cm.getInputField().autocapitalize = val;
    }, true);
    option("rtlMoveVisually", !windows);
    option("wholeLineUpdateBefore", true);
    option("theme", "default", function (cm) {
      themeChanged(cm);
      updateGutters(cm);
    }, true);
    option("keyMap", "default", function (cm, val, old) {
      var next = getKeyMap(val);
      var prev = old != Init && getKeyMap(old);

      if (prev && prev.detach) {
        prev.detach(cm, next);
      }

      if (next.attach) {
        next.attach(cm, prev || null);
      }
    });
    option("extraKeys", null);
    option("configureMouse", null);
    option("lineWrapping", false, wrappingChanged, true);
    option("gutters", [], function (cm, val) {
      cm.display.gutterSpecs = getGutters(val, cm.options.lineNumbers);
      updateGutters(cm);
    }, true);
    option("fixedGutter", true, function (cm, val) {
      cm.display.gutters.style.left = val ? compensateForHScroll(cm.display) + "px" : "0";
      cm.refresh();
    }, true);
    option("coverGutterNextToScrollbar", false, function (cm) {
      return updateScrollbars(cm);
    }, true);
    option("scrollbarStyle", "native", function (cm) {
      initScrollbars(cm);
      updateScrollbars(cm);
      cm.display.scrollbars.setScrollTop(cm.doc.scrollTop);
      cm.display.scrollbars.setScrollLeft(cm.doc.scrollLeft);
    }, true);
    option("lineNumbers", false, function (cm, val) {
      cm.display.gutterSpecs = getGutters(cm.options.gutters, val);
      updateGutters(cm);
    }, true);
    option("firstLineNumber", 1, updateGutters, true);
    option("lineNumberFormatter", function (integer) {
      return integer;
    }, updateGutters, true);
    option("showCursorWhenSelecting", false, updateSelection, true);
    option("resetSelectionOnContextMenu", true);
    option("lineWiseCopyCut", true);
    option("pasteLinesPerSelection", true);
    option("selectionsMayTouch", false);
    option("readOnly", false, function (cm, val) {
      if (val == "nocursor") {
        onBlur(cm);
        cm.display.input.blur();
      }

      cm.display.input.readOnlyChanged(val);
    });
    option("disableInput", false, function (cm, val) {
      if (!val) {
        cm.display.input.reset();
      }
    }, true);
    option("dragDrop", true, dragDropChanged);
    option("allowDropFileTypes", null);
    option("cursorBlinkRate", 530);
    option("cursorScrollMargin", 0);
    option("cursorHeight", 1, updateSelection, true);
    option("singleCursorHeightPerLine", true, updateSelection, true);
    option("workTime", 100);
    option("workDelay", 100);
    option("flattenSpans", true, resetModeState, true);
    option("addModeClass", false, resetModeState, true);
    option("pollInterval", 100);
    option("undoDepth", 200, function (cm, val) {
      return cm.doc.history.undoDepth = val;
    });
    option("historyEventDelay", 1250);
    option("viewportMargin", 10, function (cm) {
      return cm.refresh();
    }, true);
    option("maxHighlightLength", 10000, resetModeState, true);
    option("moveInputWithCursor", true, function (cm, val) {
      if (!val) {
        cm.display.input.resetPosition();
      }
    });
    option("tabindex", null, function (cm, val) {
      return cm.display.input.getField().tabIndex = val || "";
    });
    option("autofocus", null);
    option("direction", "ltr", function (cm, val) {
      return cm.doc.setDirection(val);
    }, true);
    option("phrases", null);
  }

  function dragDropChanged(cm, value, old) {
    var wasOn = old && old != Init;

    if (!value != !wasOn) {
      var funcs = cm.display.dragFunctions;
      var toggle = value ? on : off;
      toggle(cm.display.scroller, "dragstart", funcs.start);
      toggle(cm.display.scroller, "dragenter", funcs.enter);
      toggle(cm.display.scroller, "dragover", funcs.over);
      toggle(cm.display.scroller, "dragleave", funcs.leave);
      toggle(cm.display.scroller, "drop", funcs.drop);
    }
  }

  function wrappingChanged(cm) {
    if (cm.options.lineWrapping) {
      addClass(cm.display.wrapper, "CodeMirror-wrap");
      cm.display.sizer.style.minWidth = "";
      cm.display.sizerWidth = null;
    } else {
      rmClass(cm.display.wrapper, "CodeMirror-wrap");
      findMaxLine(cm);
    }

    estimateLineHeights(cm);
    regChange(cm);
    clearCaches(cm);
    setTimeout(function () {
      return updateScrollbars(cm);
    }, 100);
  } // A CodeMirror instance represents an editor. This is the object
  // that user code is usually dealing with.


  function CodeMirror(place, options) {
    var this$1 = this;

    if (!(this instanceof CodeMirror)) {
      return new CodeMirror(place, options);
    }

    this.options = options = options ? copyObj(options) : {}; // Determine effective options based on given values and defaults.

    copyObj(defaults, options, false);
    var doc = options.value;

    if (typeof doc == "string") {
      doc = new Doc(doc, options.mode, null, options.lineSeparator, options.direction);
    } else if (options.mode) {
      doc.modeOption = options.mode;
    }

    this.doc = doc;
    var input = new CodeMirror.inputStyles[options.inputStyle](this);
    var display = this.display = new Display(place, doc, input, options);
    display.wrapper.CodeMirror = this;
    themeChanged(this);

    if (options.lineWrapping) {
      this.display.wrapper.className += " CodeMirror-wrap";
    }

    initScrollbars(this);
    this.state = {
      keyMaps: [],
      // stores maps added by addKeyMap
      overlays: [],
      // highlighting overlays, as added by addOverlay
      modeGen: 0,
      // bumped when mode/overlay changes, used to invalidate highlighting info
      overwrite: false,
      delayingBlurEvent: false,
      focused: false,
      suppressEdits: false,
      // used to disable editing during key handlers when in readOnly mode
      pasteIncoming: -1,
      cutIncoming: -1,
      // help recognize paste/cut edits in input.poll
      selectingText: false,
      draggingText: false,
      highlight: new Delayed(),
      // stores highlight worker timeout
      keySeq: null,
      // Unfinished key sequence
      specialChars: null
    };

    if (options.autofocus && !mobile) {
      display.input.focus();
    } // Override magic textarea content restore that IE sometimes does
    // on our hidden textarea on reload


    if (ie && ie_version < 11) {
      setTimeout(function () {
        return this$1.display.input.reset(true);
      }, 20);
    }

    registerEventHandlers(this);
    ensureGlobalHandlers();

    _startOperation(this);

    this.curOp.forceUpdate = true;
    attachDoc(this, doc);

    if (options.autofocus && !mobile || this.hasFocus()) {
      setTimeout(bind(onFocus, this), 20);
    } else {
      onBlur(this);
    }

    for (var opt in optionHandlers) {
      if (optionHandlers.hasOwnProperty(opt)) {
        optionHandlers[opt](this$1, options[opt], Init);
      }
    }

    maybeUpdateLineNumberWidth(this);

    if (options.finishInit) {
      options.finishInit(this);
    }

    for (var i = 0; i < initHooks.length; ++i) {
      initHooks[i](this$1);
    }

    _endOperation(this); // Suppress optimizelegibility in Webkit, since it breaks text
    // measuring on line wrapping boundaries.


    if (webkit && options.lineWrapping && getComputedStyle(display.lineDiv).textRendering == "optimizelegibility") {
      display.lineDiv.style.textRendering = "auto";
    }
  } // The default configuration options.


  CodeMirror.defaults = defaults; // Functions to run when options are changed.

  CodeMirror.optionHandlers = optionHandlers; // Attach the necessary event handlers when initializing the editor

  function registerEventHandlers(cm) {
    var d = cm.display;
    on(d.scroller, "mousedown", operation(cm, onMouseDown)); // Older IE's will not fire a second mousedown for a double click

    if (ie && ie_version < 11) {
      on(d.scroller, "dblclick", operation(cm, function (e) {
        if (signalDOMEvent(cm, e)) {
          return;
        }

        var pos = posFromMouse(cm, e);

        if (!pos || clickInGutter(cm, e) || eventInWidget(cm.display, e)) {
          return;
        }

        e_preventDefault(e);
        var word = cm.findWordAt(pos);
        extendSelection(cm.doc, word.anchor, word.head);
      }));
    } else {
      on(d.scroller, "dblclick", function (e) {
        return signalDOMEvent(cm, e) || e_preventDefault(e);
      });
    } // Some browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for these browsers.


    on(d.scroller, "contextmenu", function (e) {
      return onContextMenu(cm, e);
    }); // Used to suppress mouse event handling when a touch happens

    var touchFinished,
        prevTouch = {
      end: 0
    };

    function finishTouch() {
      if (d.activeTouch) {
        touchFinished = setTimeout(function () {
          return d.activeTouch = null;
        }, 1000);
        prevTouch = d.activeTouch;
        prevTouch.end = +new Date();
      }
    }

    function isMouseLikeTouchEvent(e) {
      if (e.touches.length != 1) {
        return false;
      }

      var touch = e.touches[0];
      return touch.radiusX <= 1 && touch.radiusY <= 1;
    }

    function farAway(touch, other) {
      if (other.left == null) {
        return true;
      }

      var dx = other.left - touch.left,
          dy = other.top - touch.top;
      return dx * dx + dy * dy > 20 * 20;
    }

    on(d.scroller, "touchstart", function (e) {
      if (!signalDOMEvent(cm, e) && !isMouseLikeTouchEvent(e) && !clickInGutter(cm, e)) {
        d.input.ensurePolled();
        clearTimeout(touchFinished);
        var now = +new Date();
        d.activeTouch = {
          start: now,
          moved: false,
          prev: now - prevTouch.end <= 300 ? prevTouch : null
        };

        if (e.touches.length == 1) {
          d.activeTouch.left = e.touches[0].pageX;
          d.activeTouch.top = e.touches[0].pageY;
        }
      }
    });
    on(d.scroller, "touchmove", function () {
      if (d.activeTouch) {
        d.activeTouch.moved = true;
      }
    });
    on(d.scroller, "touchend", function (e) {
      var touch = d.activeTouch;

      if (touch && !eventInWidget(d, e) && touch.left != null && !touch.moved && new Date() - touch.start < 300) {
        var pos = cm.coordsChar(d.activeTouch, "page"),
            range;

        if (!touch.prev || farAway(touch, touch.prev)) // Single tap
          {
            range = new Range(pos, pos);
          } else if (!touch.prev.prev || farAway(touch, touch.prev.prev)) // Double tap
          {
            range = cm.findWordAt(pos);
          } else // Triple tap
          {
            range = new Range(Pos(pos.line, 0), _clipPos(cm.doc, Pos(pos.line + 1, 0)));
          }

        cm.setSelection(range.anchor, range.head);
        cm.focus();
        e_preventDefault(e);
      }

      finishTouch();
    });
    on(d.scroller, "touchcancel", finishTouch); // Sync scrolling between fake scrollbars and real scrollable
    // area, ensure viewport is updated when scrolling.

    on(d.scroller, "scroll", function () {
      if (d.scroller.clientHeight) {
        updateScrollTop(cm, d.scroller.scrollTop);
        setScrollLeft(cm, d.scroller.scrollLeft, true);
        signal(cm, "scroll", cm);
      }
    }); // Listen to wheel events in order to try and update the viewport on time.

    on(d.scroller, "mousewheel", function (e) {
      return onScrollWheel(cm, e);
    });
    on(d.scroller, "DOMMouseScroll", function (e) {
      return onScrollWheel(cm, e);
    }); // Prevent wrapper from ever scrolling

    on(d.wrapper, "scroll", function () {
      return d.wrapper.scrollTop = d.wrapper.scrollLeft = 0;
    });
    d.dragFunctions = {
      enter: function enter(e) {
        if (!signalDOMEvent(cm, e)) {
          e_stop(e);
        }
      },
      over: function over(e) {
        if (!signalDOMEvent(cm, e)) {
          onDragOver(cm, e);
          e_stop(e);
        }
      },
      start: function start(e) {
        return onDragStart(cm, e);
      },
      drop: operation(cm, onDrop),
      leave: function leave(e) {
        if (!signalDOMEvent(cm, e)) {
          clearDragCursor(cm);
        }
      }
    };
    var inp = d.input.getField();
    on(inp, "keyup", function (e) {
      return onKeyUp.call(cm, e);
    });
    on(inp, "keydown", operation(cm, onKeyDown));
    on(inp, "keypress", operation(cm, onKeyPress));
    on(inp, "focus", function (e) {
      return onFocus(cm, e);
    });
    on(inp, "blur", function (e) {
      return onBlur(cm, e);
    });
  }

  var initHooks = [];

  CodeMirror.defineInitHook = function (f) {
    return initHooks.push(f);
  }; // Indent the given line. The how parameter can be "smart",
  // "add"/null, "subtract", or "prev". When aggressive is false
  // (typically set to true for forced single-line indents), empty
  // lines are not indented, and places where the mode returns Pass
  // are left alone.


  function indentLine(cm, n, how, aggressive) {
    var doc = cm.doc,
        state;

    if (how == null) {
      how = "add";
    }

    if (how == "smart") {
      // Fall back to "prev" when the mode doesn't have an indentation
      // method.
      if (!doc.mode.indent) {
        how = "prev";
      } else {
        state = getContextBefore(cm, n).state;
      }
    }

    var tabSize = cm.options.tabSize;
    var line = getLine(doc, n),
        curSpace = countColumn(line.text, null, tabSize);

    if (line.stateAfter) {
      line.stateAfter = null;
    }

    var curSpaceString = line.text.match(/^\s*/)[0],
        indentation;

    if (!aggressive && !/\S/.test(line.text)) {
      indentation = 0;
      how = "not";
    } else if (how == "smart") {
      indentation = doc.mode.indent(state, line.text.slice(curSpaceString.length), line.text);

      if (indentation == Pass || indentation > 150) {
        if (!aggressive) {
          return;
        }

        how = "prev";
      }
    }

    if (how == "prev") {
      if (n > doc.first) {
        indentation = countColumn(getLine(doc, n - 1).text, null, tabSize);
      } else {
        indentation = 0;
      }
    } else if (how == "add") {
      indentation = curSpace + cm.options.indentUnit;
    } else if (how == "subtract") {
      indentation = curSpace - cm.options.indentUnit;
    } else if (typeof how == "number") {
      indentation = curSpace + how;
    }

    indentation = Math.max(0, indentation);
    var indentString = "",
        pos = 0;

    if (cm.options.indentWithTabs) {
      for (var i = Math.floor(indentation / tabSize); i; --i) {
        pos += tabSize;
        indentString += "\t";
      }
    }

    if (pos < indentation) {
      indentString += spaceStr(indentation - pos);
    }

    if (indentString != curSpaceString) {
      _replaceRange(doc, indentString, Pos(n, 0), Pos(n, curSpaceString.length), "+input");

      line.stateAfter = null;
      return true;
    } else {
      // Ensure that, if the cursor was in the whitespace at the start
      // of the line, it is moved to the end of that space.
      for (var i$1 = 0; i$1 < doc.sel.ranges.length; i$1++) {
        var range = doc.sel.ranges[i$1];

        if (range.head.line == n && range.head.ch < curSpaceString.length) {
          var pos$1 = Pos(n, curSpaceString.length);
          replaceOneSelection(doc, i$1, new Range(pos$1, pos$1));
          break;
        }
      }
    }
  } // This will be set to a {lineWise: bool, text: [string]} object, so
  // that, when pasting, we know what kind of selections the copied
  // text was made out of.


  var lastCopied = null;

  function setLastCopied(newLastCopied) {
    lastCopied = newLastCopied;
  }

  function applyTextInput(cm, inserted, deleted, sel, origin) {
    var doc = cm.doc;
    cm.display.shift = false;

    if (!sel) {
      sel = doc.sel;
    }

    var recent = +new Date() - 200;
    var paste = origin == "paste" || cm.state.pasteIncoming > recent;
    var textLines = splitLinesAuto(inserted),
        multiPaste = null; // When pasting N lines into N selections, insert one line per selection

    if (paste && sel.ranges.length > 1) {
      if (lastCopied && lastCopied.text.join("\n") == inserted) {
        if (sel.ranges.length % lastCopied.text.length == 0) {
          multiPaste = [];

          for (var i = 0; i < lastCopied.text.length; i++) {
            multiPaste.push(doc.splitLines(lastCopied.text[i]));
          }
        }
      } else if (textLines.length == sel.ranges.length && cm.options.pasteLinesPerSelection) {
        multiPaste = map(textLines, function (l) {
          return [l];
        });
      }
    }

    var updateInput = cm.curOp.updateInput; // Normal behavior is to insert the new text into every selection

    for (var i$1 = sel.ranges.length - 1; i$1 >= 0; i$1--) {
      var range$$1 = sel.ranges[i$1];
      var from = range$$1.from(),
          to = range$$1.to();

      if (range$$1.empty()) {
        if (deleted && deleted > 0) // Handle deletion
          {
            from = Pos(from.line, from.ch - deleted);
          } else if (cm.state.overwrite && !paste) // Handle overwrite
          {
            to = Pos(to.line, Math.min(getLine(doc, to.line).text.length, to.ch + lst(textLines).length));
          } else if (paste && lastCopied && lastCopied.lineWise && lastCopied.text.join("\n") == inserted) {
          from = to = Pos(from.line, 0);
        }
      }

      var changeEvent = {
        from: from,
        to: to,
        text: multiPaste ? multiPaste[i$1 % multiPaste.length] : textLines,
        origin: origin || (paste ? "paste" : cm.state.cutIncoming > recent ? "cut" : "+input")
      };
      makeChange(cm.doc, changeEvent);
      signalLater(cm, "inputRead", cm, changeEvent);
    }

    if (inserted && !paste) {
      triggerElectric(cm, inserted);
    }

    ensureCursorVisible(cm);

    if (cm.curOp.updateInput < 2) {
      cm.curOp.updateInput = updateInput;
    }

    cm.curOp.typing = true;
    cm.state.pasteIncoming = cm.state.cutIncoming = -1;
  }

  function handlePaste(e, cm) {
    var pasted = e.clipboardData && e.clipboardData.getData("Text");

    if (pasted) {
      e.preventDefault();

      if (!cm.isReadOnly() && !cm.options.disableInput) {
        runInOp(cm, function () {
          return applyTextInput(cm, pasted, 0, null, "paste");
        });
      }

      return true;
    }
  }

  function triggerElectric(cm, inserted) {
    // When an 'electric' character is inserted, immediately trigger a reindent
    if (!cm.options.electricChars || !cm.options.smartIndent) {
      return;
    }

    var sel = cm.doc.sel;

    for (var i = sel.ranges.length - 1; i >= 0; i--) {
      var range$$1 = sel.ranges[i];

      if (range$$1.head.ch > 100 || i && sel.ranges[i - 1].head.line == range$$1.head.line) {
        continue;
      }

      var mode = cm.getModeAt(range$$1.head);
      var indented = false;

      if (mode.electricChars) {
        for (var j = 0; j < mode.electricChars.length; j++) {
          if (inserted.indexOf(mode.electricChars.charAt(j)) > -1) {
            indented = indentLine(cm, range$$1.head.line, "smart");
            break;
          }
        }
      } else if (mode.electricInput) {
        if (mode.electricInput.test(getLine(cm.doc, range$$1.head.line).text.slice(0, range$$1.head.ch))) {
          indented = indentLine(cm, range$$1.head.line, "smart");
        }
      }

      if (indented) {
        signalLater(cm, "electricInput", cm, range$$1.head.line);
      }
    }
  }

  function copyableRanges(cm) {
    var text = [],
        ranges = [];

    for (var i = 0; i < cm.doc.sel.ranges.length; i++) {
      var line = cm.doc.sel.ranges[i].head.line;
      var lineRange = {
        anchor: Pos(line, 0),
        head: Pos(line + 1, 0)
      };
      ranges.push(lineRange);
      text.push(cm.getRange(lineRange.anchor, lineRange.head));
    }

    return {
      text: text,
      ranges: ranges
    };
  }

  function disableBrowserMagic(field, spellcheck, autocorrect, autocapitalize) {
    field.setAttribute("autocorrect", autocorrect ? "" : "off");
    field.setAttribute("autocapitalize", autocapitalize ? "" : "off");
    field.setAttribute("spellcheck", !!spellcheck);
  }

  function hiddenTextarea() {
    var te = elt("textarea", null, null, "position: absolute; bottom: -1em; padding: 0; width: 1px; height: 1em; outline: none");
    var div = elt("div", [te], null, "overflow: hidden; position: relative; width: 3px; height: 0px;"); // The textarea is kept positioned near the cursor to prevent the
    // fact that it'll be scrolled into view on input from scrolling
    // our fake cursor out of view. On webkit, when wrap=off, paste is
    // very slow. So make the area wide instead.

    if (webkit) {
      te.style.width = "1000px";
    } else {
      te.setAttribute("wrap", "off");
    } // If border: 0; -- iOS fails to open keyboard (issue #1287)


    if (ios) {
      te.style.border = "1px solid black";
    }

    disableBrowserMagic(te);
    return div;
  } // The publicly visible API. Note that methodOp(f) means
  // 'wrap f in an operation, performed on its `this` parameter'.
  // This is not the complete set of editor methods. Most of the
  // methods defined on the Doc type are also injected into
  // CodeMirror.prototype, for backwards compatibility and
  // convenience.


  function addEditorMethods(CodeMirror) {
    var optionHandlers = CodeMirror.optionHandlers;
    var helpers = CodeMirror.helpers = {};
    CodeMirror.prototype = {
      constructor: CodeMirror,
      focus: function focus() {
        window.focus();
        this.display.input.focus();
      },
      setOption: function setOption(option, value) {
        var options = this.options,
            old = options[option];

        if (options[option] == value && option != "mode") {
          return;
        }

        options[option] = value;

        if (optionHandlers.hasOwnProperty(option)) {
          operation(this, optionHandlers[option])(this, value, old);
        }

        signal(this, "optionChange", this, option);
      },
      getOption: function getOption(option) {
        return this.options[option];
      },
      getDoc: function getDoc() {
        return this.doc;
      },
      addKeyMap: function addKeyMap(map$$1, bottom) {
        this.state.keyMaps[bottom ? "push" : "unshift"](getKeyMap(map$$1));
      },
      removeKeyMap: function removeKeyMap(map$$1) {
        var maps = this.state.keyMaps;

        for (var i = 0; i < maps.length; ++i) {
          if (maps[i] == map$$1 || maps[i].name == map$$1) {
            maps.splice(i, 1);
            return true;
          }
        }
      },
      addOverlay: methodOp(function (spec, options) {
        var mode = spec.token ? spec : CodeMirror.getMode(this.options, spec);

        if (mode.startState) {
          throw new Error("Overlays may not be stateful.");
        }

        insertSorted(this.state.overlays, {
          mode: mode,
          modeSpec: spec,
          opaque: options && options.opaque,
          priority: options && options.priority || 0
        }, function (overlay) {
          return overlay.priority;
        });
        this.state.modeGen++;
        regChange(this);
      }),
      removeOverlay: methodOp(function (spec) {
        var this$1 = this;
        var overlays = this.state.overlays;

        for (var i = 0; i < overlays.length; ++i) {
          var cur = overlays[i].modeSpec;

          if (cur == spec || typeof spec == "string" && cur.name == spec) {
            overlays.splice(i, 1);
            this$1.state.modeGen++;
            regChange(this$1);
            return;
          }
        }
      }),
      indentLine: methodOp(function (n, dir, aggressive) {
        if (typeof dir != "string" && typeof dir != "number") {
          if (dir == null) {
            dir = this.options.smartIndent ? "smart" : "prev";
          } else {
            dir = dir ? "add" : "subtract";
          }
        }

        if (isLine(this.doc, n)) {
          indentLine(this, n, dir, aggressive);
        }
      }),
      indentSelection: methodOp(function (how) {
        var this$1 = this;
        var ranges = this.doc.sel.ranges,
            end = -1;

        for (var i = 0; i < ranges.length; i++) {
          var range$$1 = ranges[i];

          if (!range$$1.empty()) {
            var from = range$$1.from(),
                to = range$$1.to();
            var start = Math.max(end, from.line);
            end = Math.min(this$1.lastLine(), to.line - (to.ch ? 0 : 1)) + 1;

            for (var j = start; j < end; ++j) {
              indentLine(this$1, j, how);
            }

            var newRanges = this$1.doc.sel.ranges;

            if (from.ch == 0 && ranges.length == newRanges.length && newRanges[i].from().ch > 0) {
              replaceOneSelection(this$1.doc, i, new Range(from, newRanges[i].to()), sel_dontScroll);
            }
          } else if (range$$1.head.line > end) {
            indentLine(this$1, range$$1.head.line, how, true);
            end = range$$1.head.line;

            if (i == this$1.doc.sel.primIndex) {
              ensureCursorVisible(this$1);
            }
          }
        }
      }),
      // Fetch the parser token for a given character. Useful for hacks
      // that want to inspect the mode state (say, for completion).
      getTokenAt: function getTokenAt(pos, precise) {
        return takeToken(this, pos, precise);
      },
      getLineTokens: function getLineTokens(line, precise) {
        return takeToken(this, Pos(line), precise, true);
      },
      getTokenTypeAt: function getTokenTypeAt(pos) {
        pos = _clipPos(this.doc, pos);
        var styles = getLineStyles(this, getLine(this.doc, pos.line));
        var before = 0,
            after = (styles.length - 1) / 2,
            ch = pos.ch;
        var type;

        if (ch == 0) {
          type = styles[2];
        } else {
          for (;;) {
            var mid = before + after >> 1;

            if ((mid ? styles[mid * 2 - 1] : 0) >= ch) {
              after = mid;
            } else if (styles[mid * 2 + 1] < ch) {
              before = mid + 1;
            } else {
              type = styles[mid * 2 + 2];
              break;
            }
          }
        }

        var cut = type ? type.indexOf("overlay ") : -1;
        return cut < 0 ? type : cut == 0 ? null : type.slice(0, cut - 1);
      },
      getModeAt: function getModeAt(pos) {
        var mode = this.doc.mode;

        if (!mode.innerMode) {
          return mode;
        }

        return CodeMirror.innerMode(mode, this.getTokenAt(pos).state).mode;
      },
      getHelper: function getHelper(pos, type) {
        return this.getHelpers(pos, type)[0];
      },
      getHelpers: function getHelpers(pos, type) {
        var this$1 = this;
        var found = [];

        if (!helpers.hasOwnProperty(type)) {
          return found;
        }

        var help = helpers[type],
            mode = this.getModeAt(pos);

        if (typeof mode[type] == "string") {
          if (help[mode[type]]) {
            found.push(help[mode[type]]);
          }
        } else if (mode[type]) {
          for (var i = 0; i < mode[type].length; i++) {
            var val = help[mode[type][i]];

            if (val) {
              found.push(val);
            }
          }
        } else if (mode.helperType && help[mode.helperType]) {
          found.push(help[mode.helperType]);
        } else if (help[mode.name]) {
          found.push(help[mode.name]);
        }

        for (var i$1 = 0; i$1 < help._global.length; i$1++) {
          var cur = help._global[i$1];

          if (cur.pred(mode, this$1) && indexOf(found, cur.val) == -1) {
            found.push(cur.val);
          }
        }

        return found;
      },
      getStateAfter: function getStateAfter(line, precise) {
        var doc = this.doc;
        line = clipLine(doc, line == null ? doc.first + doc.size - 1 : line);
        return getContextBefore(this, line + 1, precise).state;
      },
      cursorCoords: function cursorCoords(start, mode) {
        var pos,
            range$$1 = this.doc.sel.primary();

        if (start == null) {
          pos = range$$1.head;
        } else if (_typeof(start) == "object") {
          pos = _clipPos(this.doc, start);
        } else {
          pos = start ? range$$1.from() : range$$1.to();
        }

        return _cursorCoords(this, pos, mode || "page");
      },
      charCoords: function charCoords(pos, mode) {
        return _charCoords(this, _clipPos(this.doc, pos), mode || "page");
      },
      coordsChar: function coordsChar(coords, mode) {
        coords = fromCoordSystem(this, coords, mode || "page");
        return _coordsChar(this, coords.left, coords.top);
      },
      lineAtHeight: function lineAtHeight(height, mode) {
        height = fromCoordSystem(this, {
          top: height,
          left: 0
        }, mode || "page").top;
        return _lineAtHeight(this.doc, height + this.display.viewOffset);
      },
      heightAtLine: function heightAtLine(line, mode, includeWidgets) {
        var end = false,
            lineObj;

        if (typeof line == "number") {
          var last = this.doc.first + this.doc.size - 1;

          if (line < this.doc.first) {
            line = this.doc.first;
          } else if (line > last) {
            line = last;
            end = true;
          }

          lineObj = getLine(this.doc, line);
        } else {
          lineObj = line;
        }

        return intoCoordSystem(this, lineObj, {
          top: 0,
          left: 0
        }, mode || "page", includeWidgets || end).top + (end ? this.doc.height - _heightAtLine(lineObj) : 0);
      },
      defaultTextHeight: function defaultTextHeight() {
        return textHeight(this.display);
      },
      defaultCharWidth: function defaultCharWidth() {
        return charWidth(this.display);
      },
      getViewport: function getViewport() {
        return {
          from: this.display.viewFrom,
          to: this.display.viewTo
        };
      },
      addWidget: function addWidget(pos, node, scroll, vert, horiz) {
        var display = this.display;
        pos = _cursorCoords(this, _clipPos(this.doc, pos));
        var top = pos.bottom,
            left = pos.left;
        node.style.position = "absolute";
        node.setAttribute("cm-ignore-events", "true");
        this.display.input.setUneditable(node);
        display.sizer.appendChild(node);

        if (vert == "over") {
          top = pos.top;
        } else if (vert == "above" || vert == "near") {
          var vspace = Math.max(display.wrapper.clientHeight, this.doc.height),
              hspace = Math.max(display.sizer.clientWidth, display.lineSpace.clientWidth); // Default to positioning above (if specified and possible); otherwise default to positioning below

          if ((vert == 'above' || pos.bottom + node.offsetHeight > vspace) && pos.top > node.offsetHeight) {
            top = pos.top - node.offsetHeight;
          } else if (pos.bottom + node.offsetHeight <= vspace) {
            top = pos.bottom;
          }

          if (left + node.offsetWidth > hspace) {
            left = hspace - node.offsetWidth;
          }
        }

        node.style.top = top + "px";
        node.style.left = node.style.right = "";

        if (horiz == "right") {
          left = display.sizer.clientWidth - node.offsetWidth;
          node.style.right = "0px";
        } else {
          if (horiz == "left") {
            left = 0;
          } else if (horiz == "middle") {
            left = (display.sizer.clientWidth - node.offsetWidth) / 2;
          }

          node.style.left = left + "px";
        }

        if (scroll) {
          scrollIntoView(this, {
            left: left,
            top: top,
            right: left + node.offsetWidth,
            bottom: top + node.offsetHeight
          });
        }
      },
      triggerOnKeyDown: methodOp(onKeyDown),
      triggerOnKeyPress: methodOp(onKeyPress),
      triggerOnKeyUp: onKeyUp,
      triggerOnMouseDown: methodOp(onMouseDown),
      execCommand: function execCommand(cmd) {
        if (commands.hasOwnProperty(cmd)) {
          return commands[cmd].call(null, this);
        }
      },
      triggerElectric: methodOp(function (text) {
        triggerElectric(this, text);
      }),
      findPosH: function findPosH(from, amount, unit, visually) {
        var this$1 = this;
        var dir = 1;

        if (amount < 0) {
          dir = -1;
          amount = -amount;
        }

        var cur = _clipPos(this.doc, from);

        for (var i = 0; i < amount; ++i) {
          cur = _findPosH(this$1.doc, cur, dir, unit, visually);

          if (cur.hitSide) {
            break;
          }
        }

        return cur;
      },
      moveH: methodOp(function (dir, unit) {
        var this$1 = this;
        this.extendSelectionsBy(function (range$$1) {
          if (this$1.display.shift || this$1.doc.extend || range$$1.empty()) {
            return _findPosH(this$1.doc, range$$1.head, dir, unit, this$1.options.rtlMoveVisually);
          } else {
            return dir < 0 ? range$$1.from() : range$$1.to();
          }
        }, sel_move);
      }),
      deleteH: methodOp(function (dir, unit) {
        var sel = this.doc.sel,
            doc = this.doc;

        if (sel.somethingSelected()) {
          doc.replaceSelection("", null, "+delete");
        } else {
          deleteNearSelection(this, function (range$$1) {
            var other = _findPosH(doc, range$$1.head, dir, unit, false);

            return dir < 0 ? {
              from: other,
              to: range$$1.head
            } : {
              from: range$$1.head,
              to: other
            };
          });
        }
      }),
      findPosV: function findPosV(from, amount, unit, goalColumn) {
        var this$1 = this;
        var dir = 1,
            x = goalColumn;

        if (amount < 0) {
          dir = -1;
          amount = -amount;
        }

        var cur = _clipPos(this.doc, from);

        for (var i = 0; i < amount; ++i) {
          var coords = _cursorCoords(this$1, cur, "div");

          if (x == null) {
            x = coords.left;
          } else {
            coords.left = x;
          }

          cur = _findPosV(this$1, coords, dir, unit);

          if (cur.hitSide) {
            break;
          }
        }

        return cur;
      },
      moveV: methodOp(function (dir, unit) {
        var this$1 = this;
        var doc = this.doc,
            goals = [];
        var collapse = !this.display.shift && !doc.extend && doc.sel.somethingSelected();
        doc.extendSelectionsBy(function (range$$1) {
          if (collapse) {
            return dir < 0 ? range$$1.from() : range$$1.to();
          }

          var headPos = _cursorCoords(this$1, range$$1.head, "div");

          if (range$$1.goalColumn != null) {
            headPos.left = range$$1.goalColumn;
          }

          goals.push(headPos.left);

          var pos = _findPosV(this$1, headPos, dir, unit);

          if (unit == "page" && range$$1 == doc.sel.primary()) {
            addToScrollTop(this$1, _charCoords(this$1, pos, "div").top - headPos.top);
          }

          return pos;
        }, sel_move);

        if (goals.length) {
          for (var i = 0; i < doc.sel.ranges.length; i++) {
            doc.sel.ranges[i].goalColumn = goals[i];
          }
        }
      }),
      // Find the word at the given position (as returned by coordsChar).
      findWordAt: function findWordAt(pos) {
        var doc = this.doc,
            line = getLine(doc, pos.line).text;
        var start = pos.ch,
            end = pos.ch;

        if (line) {
          var helper = this.getHelper(pos, "wordChars");

          if ((pos.sticky == "before" || end == line.length) && start) {
            --start;
          } else {
            ++end;
          }

          var startChar = line.charAt(start);
          var check = isWordChar(startChar, helper) ? function (ch) {
            return isWordChar(ch, helper);
          } : /\s/.test(startChar) ? function (ch) {
            return /\s/.test(ch);
          } : function (ch) {
            return !/\s/.test(ch) && !isWordChar(ch);
          };

          while (start > 0 && check(line.charAt(start - 1))) {
            --start;
          }

          while (end < line.length && check(line.charAt(end))) {
            ++end;
          }
        }

        return new Range(Pos(pos.line, start), Pos(pos.line, end));
      },
      toggleOverwrite: function toggleOverwrite(value) {
        if (value != null && value == this.state.overwrite) {
          return;
        }

        if (this.state.overwrite = !this.state.overwrite) {
          addClass(this.display.cursorDiv, "CodeMirror-overwrite");
        } else {
          rmClass(this.display.cursorDiv, "CodeMirror-overwrite");
        }

        signal(this, "overwriteToggle", this, this.state.overwrite);
      },
      hasFocus: function hasFocus() {
        return this.display.input.getField() == activeElt();
      },
      isReadOnly: function isReadOnly() {
        return !!(this.options.readOnly || this.doc.cantEdit);
      },
      scrollTo: methodOp(function (x, y) {
        scrollToCoords(this, x, y);
      }),
      getScrollInfo: function getScrollInfo() {
        var scroller = this.display.scroller;
        return {
          left: scroller.scrollLeft,
          top: scroller.scrollTop,
          height: scroller.scrollHeight - scrollGap(this) - this.display.barHeight,
          width: scroller.scrollWidth - scrollGap(this) - this.display.barWidth,
          clientHeight: displayHeight(this),
          clientWidth: displayWidth(this)
        };
      },
      scrollIntoView: methodOp(function (range$$1, margin) {
        if (range$$1 == null) {
          range$$1 = {
            from: this.doc.sel.primary().head,
            to: null
          };

          if (margin == null) {
            margin = this.options.cursorScrollMargin;
          }
        } else if (typeof range$$1 == "number") {
          range$$1 = {
            from: Pos(range$$1, 0),
            to: null
          };
        } else if (range$$1.from == null) {
          range$$1 = {
            from: range$$1,
            to: null
          };
        }

        if (!range$$1.to) {
          range$$1.to = range$$1.from;
        }

        range$$1.margin = margin || 0;

        if (range$$1.from.line != null) {
          scrollToRange(this, range$$1);
        } else {
          scrollToCoordsRange(this, range$$1.from, range$$1.to, range$$1.margin);
        }
      }),
      setSize: methodOp(function (width, height) {
        var this$1 = this;

        var interpret = function interpret(val) {
          return typeof val == "number" || /^\d+$/.test(String(val)) ? val + "px" : val;
        };

        if (width != null) {
          this.display.wrapper.style.width = interpret(width);
        }

        if (height != null) {
          this.display.wrapper.style.height = interpret(height);
        }

        if (this.options.lineWrapping) {
          clearLineMeasurementCache(this);
        }

        var lineNo$$1 = this.display.viewFrom;
        this.doc.iter(lineNo$$1, this.display.viewTo, function (line) {
          if (line.widgets) {
            for (var i = 0; i < line.widgets.length; i++) {
              if (line.widgets[i].noHScroll) {
                regLineChange(this$1, lineNo$$1, "widget");
                break;
              }
            }
          }

          ++lineNo$$1;
        });
        this.curOp.forceUpdate = true;
        signal(this, "refresh", this);
      }),
      operation: function operation(f) {
        return runInOp(this, f);
      },
      startOperation: function startOperation() {
        return _startOperation(this);
      },
      endOperation: function endOperation() {
        return _endOperation(this);
      },
      refresh: methodOp(function () {
        var oldHeight = this.display.cachedTextHeight;
        regChange(this);
        this.curOp.forceUpdate = true;
        clearCaches(this);
        scrollToCoords(this, this.doc.scrollLeft, this.doc.scrollTop);
        updateGutterSpace(this.display);

        if (oldHeight == null || Math.abs(oldHeight - textHeight(this.display)) > .5) {
          estimateLineHeights(this);
        }

        signal(this, "refresh", this);
      }),
      swapDoc: methodOp(function (doc) {
        var old = this.doc;
        old.cm = null; // Cancel the current text selection if any (#5821)

        if (this.state.selectingText) {
          this.state.selectingText();
        }

        attachDoc(this, doc);
        clearCaches(this);
        this.display.input.reset();
        scrollToCoords(this, doc.scrollLeft, doc.scrollTop);
        this.curOp.forceScroll = true;
        signalLater(this, "swapDoc", this, old);
        return old;
      }),
      phrase: function phrase(phraseText) {
        var phrases = this.options.phrases;
        return phrases && Object.prototype.hasOwnProperty.call(phrases, phraseText) ? phrases[phraseText] : phraseText;
      },
      getInputField: function getInputField() {
        return this.display.input.getField();
      },
      getWrapperElement: function getWrapperElement() {
        return this.display.wrapper;
      },
      getScrollerElement: function getScrollerElement() {
        return this.display.scroller;
      },
      getGutterElement: function getGutterElement() {
        return this.display.gutters;
      }
    };
    eventMixin(CodeMirror);

    CodeMirror.registerHelper = function (type, name, value) {
      if (!helpers.hasOwnProperty(type)) {
        helpers[type] = CodeMirror[type] = {
          _global: []
        };
      }

      helpers[type][name] = value;
    };

    CodeMirror.registerGlobalHelper = function (type, name, predicate, value) {
      CodeMirror.registerHelper(type, name, value);

      helpers[type]._global.push({
        pred: predicate,
        val: value
      });
    };
  } // Used for horizontal relative motion. Dir is -1 or 1 (left or
  // right), unit can be "char", "column" (like char, but doesn't
  // cross line boundaries), "word" (across next word), or "group" (to
  // the start of next group of word or non-word-non-whitespace
  // chars). The visually param controls whether, in right-to-left
  // text, direction 1 means to move towards the next index in the
  // string, or towards the character to the right of the current
  // position. The resulting position will have a hitSide=true
  // property if it reached the end of the document.


  function _findPosH(doc, pos, dir, unit, visually) {
    var oldPos = pos;
    var origDir = dir;
    var lineObj = getLine(doc, pos.line);

    function findNextLine() {
      var l = pos.line + dir;

      if (l < doc.first || l >= doc.first + doc.size) {
        return false;
      }

      pos = new Pos(l, pos.ch, pos.sticky);
      return lineObj = getLine(doc, l);
    }

    function moveOnce(boundToLine) {
      var next;

      if (visually) {
        next = moveVisually(doc.cm, lineObj, pos, dir);
      } else {
        next = moveLogically(lineObj, pos, dir);
      }

      if (next == null) {
        if (!boundToLine && findNextLine()) {
          pos = endOfLine(visually, doc.cm, lineObj, pos.line, dir);
        } else {
          return false;
        }
      } else {
        pos = next;
      }

      return true;
    }

    if (unit == "char") {
      moveOnce();
    } else if (unit == "column") {
      moveOnce(true);
    } else if (unit == "word" || unit == "group") {
      var sawType = null,
          group = unit == "group";
      var helper = doc.cm && doc.cm.getHelper(pos, "wordChars");

      for (var first = true;; first = false) {
        if (dir < 0 && !moveOnce(!first)) {
          break;
        }

        var cur = lineObj.text.charAt(pos.ch) || "\n";
        var type = isWordChar(cur, helper) ? "w" : group && cur == "\n" ? "n" : !group || /\s/.test(cur) ? null : "p";

        if (group && !first && !type) {
          type = "s";
        }

        if (sawType && sawType != type) {
          if (dir < 0) {
            dir = 1;
            moveOnce();
            pos.sticky = "after";
          }

          break;
        }

        if (type) {
          sawType = type;
        }

        if (dir > 0 && !moveOnce(!first)) {
          break;
        }
      }
    }

    var result = skipAtomic(doc, pos, oldPos, origDir, true);

    if (equalCursorPos(oldPos, result)) {
      result.hitSide = true;
    }

    return result;
  } // For relative vertical movement. Dir may be -1 or 1. Unit can be
  // "page" or "line". The resulting position will have a hitSide=true
  // property if it reached the end of the document.


  function _findPosV(cm, pos, dir, unit) {
    var doc = cm.doc,
        x = pos.left,
        y;

    if (unit == "page") {
      var pageSize = Math.min(cm.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      var moveAmount = Math.max(pageSize - .5 * textHeight(cm.display), 3);
      y = (dir > 0 ? pos.bottom : pos.top) + dir * moveAmount;
    } else if (unit == "line") {
      y = dir > 0 ? pos.bottom + 3 : pos.top - 3;
    }

    var target;

    for (;;) {
      target = _coordsChar(cm, x, y);

      if (!target.outside) {
        break;
      }

      if (dir < 0 ? y <= 0 : y >= doc.height) {
        target.hitSide = true;
        break;
      }

      y += dir * 5;
    }

    return target;
  } // CONTENTEDITABLE INPUT STYLE


  var ContentEditableInput = function ContentEditableInput(cm) {
    this.cm = cm;
    this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null;
    this.polling = new Delayed();
    this.composing = null;
    this.gracePeriod = false;
    this.readDOMTimeout = null;
  };

  ContentEditableInput.prototype.init = function (display) {
    var this$1 = this;
    var input = this,
        cm = input.cm;
    var div = input.div = display.lineDiv;
    disableBrowserMagic(div, cm.options.spellcheck, cm.options.autocorrect, cm.options.autocapitalize);
    on(div, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      } // IE doesn't fire input events, so we schedule a read for the pasted content in this way


      if (ie_version <= 11) {
        setTimeout(operation(cm, function () {
          return this$1.updateFromDOM();
        }), 20);
      }
    });
    on(div, "compositionstart", function (e) {
      this$1.composing = {
        data: e.data,
        done: false
      };
    });
    on(div, "compositionupdate", function (e) {
      if (!this$1.composing) {
        this$1.composing = {
          data: e.data,
          done: false
        };
      }
    });
    on(div, "compositionend", function (e) {
      if (this$1.composing) {
        if (e.data != this$1.composing.data) {
          this$1.readFromDOMSoon();
        }

        this$1.composing.done = true;
      }
    });
    on(div, "touchstart", function () {
      return input.forceCompositionEnd();
    });
    on(div, "input", function () {
      if (!this$1.composing) {
        this$1.readFromDOMSoon();
      }
    });

    function onCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections()
        });

        if (e.type == "cut") {
          cm.replaceSelection("", null, "cut");
        }
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text
        });

        if (e.type == "cut") {
          cm.operation(function () {
            cm.setSelections(ranges.ranges, 0, sel_dontScroll);
            cm.replaceSelection("", null, "cut");
          });
        }
      }

      if (e.clipboardData) {
        e.clipboardData.clearData();
        var content = lastCopied.text.join("\n"); // iOS exposes the clipboard API, but seems to discard content inserted into it

        e.clipboardData.setData("Text", content);

        if (e.clipboardData.getData("Text") == content) {
          e.preventDefault();
          return;
        }
      } // Old-fashioned briefly-focus-a-textarea hack


      var kludge = hiddenTextarea(),
          te = kludge.firstChild;
      cm.display.lineSpace.insertBefore(kludge, cm.display.lineSpace.firstChild);
      te.value = lastCopied.text.join("\n");
      var hadFocus = document.activeElement;
      selectInput(te);
      setTimeout(function () {
        cm.display.lineSpace.removeChild(kludge);
        hadFocus.focus();

        if (hadFocus == div) {
          input.showPrimarySelection();
        }
      }, 50);
    }

    on(div, "copy", onCopyCut);
    on(div, "cut", onCopyCut);
  };

  ContentEditableInput.prototype.prepareSelection = function () {
    var result = prepareSelection(this.cm, false);
    result.focus = this.cm.state.focused;
    return result;
  };

  ContentEditableInput.prototype.showSelection = function (info, takeFocus) {
    if (!info || !this.cm.display.view.length) {
      return;
    }

    if (info.focus || takeFocus) {
      this.showPrimarySelection();
    }

    this.showMultipleSelections(info);
  };

  ContentEditableInput.prototype.getSelection = function () {
    return this.cm.display.wrapper.ownerDocument.getSelection();
  };

  ContentEditableInput.prototype.showPrimarySelection = function () {
    var sel = this.getSelection(),
        cm = this.cm,
        prim = cm.doc.sel.primary();
    var from = prim.from(),
        to = prim.to();

    if (cm.display.viewTo == cm.display.viewFrom || from.line >= cm.display.viewTo || to.line < cm.display.viewFrom) {
      sel.removeAllRanges();
      return;
    }

    var curAnchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var curFocus = domToPos(cm, sel.focusNode, sel.focusOffset);

    if (curAnchor && !curAnchor.bad && curFocus && !curFocus.bad && cmp(minPos(curAnchor, curFocus), from) == 0 && cmp(maxPos(curAnchor, curFocus), to) == 0) {
      return;
    }

    var view = cm.display.view;
    var start = from.line >= cm.display.viewFrom && posToDOM(cm, from) || {
      node: view[0].measure.map[2],
      offset: 0
    };
    var end = to.line < cm.display.viewTo && posToDOM(cm, to);

    if (!end) {
      var measure = view[view.length - 1].measure;
      var map$$1 = measure.maps ? measure.maps[measure.maps.length - 1] : measure.map;
      end = {
        node: map$$1[map$$1.length - 1],
        offset: map$$1[map$$1.length - 2] - map$$1[map$$1.length - 3]
      };
    }

    if (!start || !end) {
      sel.removeAllRanges();
      return;
    }

    var old = sel.rangeCount && sel.getRangeAt(0),
        rng;

    try {
      rng = range(start.node, start.offset, end.offset, end.node);
    } catch (e) {} // Our model of the DOM might be outdated, in which case the range we try to set can be impossible


    if (rng) {
      if (!gecko && cm.state.focused) {
        sel.collapse(start.node, start.offset);

        if (!rng.collapsed) {
          sel.removeAllRanges();
          sel.addRange(rng);
        }
      } else {
        sel.removeAllRanges();
        sel.addRange(rng);
      }

      if (old && sel.anchorNode == null) {
        sel.addRange(old);
      } else if (gecko) {
        this.startGracePeriod();
      }
    }

    this.rememberSelection();
  };

  ContentEditableInput.prototype.startGracePeriod = function () {
    var this$1 = this;
    clearTimeout(this.gracePeriod);
    this.gracePeriod = setTimeout(function () {
      this$1.gracePeriod = false;

      if (this$1.selectionChanged()) {
        this$1.cm.operation(function () {
          return this$1.cm.curOp.selectionChanged = true;
        });
      }
    }, 20);
  };

  ContentEditableInput.prototype.showMultipleSelections = function (info) {
    removeChildrenAndAdd(this.cm.display.cursorDiv, info.cursors);
    removeChildrenAndAdd(this.cm.display.selectionDiv, info.selection);
  };

  ContentEditableInput.prototype.rememberSelection = function () {
    var sel = this.getSelection();
    this.lastAnchorNode = sel.anchorNode;
    this.lastAnchorOffset = sel.anchorOffset;
    this.lastFocusNode = sel.focusNode;
    this.lastFocusOffset = sel.focusOffset;
  };

  ContentEditableInput.prototype.selectionInEditor = function () {
    var sel = this.getSelection();

    if (!sel.rangeCount) {
      return false;
    }

    var node = sel.getRangeAt(0).commonAncestorContainer;
    return contains(this.div, node);
  };

  ContentEditableInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor") {
      if (!this.selectionInEditor()) {
        this.showSelection(this.prepareSelection(), true);
      }

      this.div.focus();
    }
  };

  ContentEditableInput.prototype.blur = function () {
    this.div.blur();
  };

  ContentEditableInput.prototype.getField = function () {
    return this.div;
  };

  ContentEditableInput.prototype.supportsTouch = function () {
    return true;
  };

  ContentEditableInput.prototype.receivedFocus = function () {
    var input = this;

    if (this.selectionInEditor()) {
      this.pollSelection();
    } else {
      runInOp(this.cm, function () {
        return input.cm.curOp.selectionChanged = true;
      });
    }

    function poll() {
      if (input.cm.state.focused) {
        input.pollSelection();
        input.polling.set(input.cm.options.pollInterval, poll);
      }
    }

    this.polling.set(this.cm.options.pollInterval, poll);
  };

  ContentEditableInput.prototype.selectionChanged = function () {
    var sel = this.getSelection();
    return sel.anchorNode != this.lastAnchorNode || sel.anchorOffset != this.lastAnchorOffset || sel.focusNode != this.lastFocusNode || sel.focusOffset != this.lastFocusOffset;
  };

  ContentEditableInput.prototype.pollSelection = function () {
    if (this.readDOMTimeout != null || this.gracePeriod || !this.selectionChanged()) {
      return;
    }

    var sel = this.getSelection(),
        cm = this.cm; // On Android Chrome (version 56, at least), backspacing into an
    // uneditable block element will put the cursor in that element,
    // and then, because it's not editable, hide the virtual keyboard.
    // Because Android doesn't allow us to actually detect backspace
    // presses in a sane way, this code checks for when that happens
    // and simulates a backspace press in this case.

    if (android && chrome && this.cm.display.gutterSpecs.length && isInGutter(sel.anchorNode)) {
      this.cm.triggerOnKeyDown({
        type: "keydown",
        keyCode: 8,
        preventDefault: Math.abs
      });
      this.blur();
      this.focus();
      return;
    }

    if (this.composing) {
      return;
    }

    this.rememberSelection();
    var anchor = domToPos(cm, sel.anchorNode, sel.anchorOffset);
    var head = domToPos(cm, sel.focusNode, sel.focusOffset);

    if (anchor && head) {
      runInOp(cm, function () {
        setSelection(cm.doc, simpleSelection(anchor, head), sel_dontScroll);

        if (anchor.bad || head.bad) {
          cm.curOp.selectionChanged = true;
        }
      });
    }
  };

  ContentEditableInput.prototype.pollContent = function () {
    if (this.readDOMTimeout != null) {
      clearTimeout(this.readDOMTimeout);
      this.readDOMTimeout = null;
    }

    var cm = this.cm,
        display = cm.display,
        sel = cm.doc.sel.primary();
    var from = sel.from(),
        to = sel.to();

    if (from.ch == 0 && from.line > cm.firstLine()) {
      from = Pos(from.line - 1, getLine(cm.doc, from.line - 1).length);
    }

    if (to.ch == getLine(cm.doc, to.line).text.length && to.line < cm.lastLine()) {
      to = Pos(to.line + 1, 0);
    }

    if (from.line < display.viewFrom || to.line > display.viewTo - 1) {
      return false;
    }

    var fromIndex, fromLine, fromNode;

    if (from.line == display.viewFrom || (fromIndex = findViewIndex(cm, from.line)) == 0) {
      fromLine = lineNo(display.view[0].line);
      fromNode = display.view[0].node;
    } else {
      fromLine = lineNo(display.view[fromIndex].line);
      fromNode = display.view[fromIndex - 1].node.nextSibling;
    }

    var toIndex = findViewIndex(cm, to.line);
    var toLine, toNode;

    if (toIndex == display.view.length - 1) {
      toLine = display.viewTo - 1;
      toNode = display.lineDiv.lastChild;
    } else {
      toLine = lineNo(display.view[toIndex + 1].line) - 1;
      toNode = display.view[toIndex + 1].node.previousSibling;
    }

    if (!fromNode) {
      return false;
    }

    var newText = cm.doc.splitLines(domTextBetween(cm, fromNode, toNode, fromLine, toLine));
    var oldText = getBetween(cm.doc, Pos(fromLine, 0), Pos(toLine, getLine(cm.doc, toLine).text.length));

    while (newText.length > 1 && oldText.length > 1) {
      if (lst(newText) == lst(oldText)) {
        newText.pop();
        oldText.pop();
        toLine--;
      } else if (newText[0] == oldText[0]) {
        newText.shift();
        oldText.shift();
        fromLine++;
      } else {
        break;
      }
    }

    var cutFront = 0,
        cutEnd = 0;
    var newTop = newText[0],
        oldTop = oldText[0],
        maxCutFront = Math.min(newTop.length, oldTop.length);

    while (cutFront < maxCutFront && newTop.charCodeAt(cutFront) == oldTop.charCodeAt(cutFront)) {
      ++cutFront;
    }

    var newBot = lst(newText),
        oldBot = lst(oldText);
    var maxCutEnd = Math.min(newBot.length - (newText.length == 1 ? cutFront : 0), oldBot.length - (oldText.length == 1 ? cutFront : 0));

    while (cutEnd < maxCutEnd && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
      ++cutEnd;
    } // Try to move start of change to start of selection if ambiguous


    if (newText.length == 1 && oldText.length == 1 && fromLine == from.line) {
      while (cutFront && cutFront > from.ch && newBot.charCodeAt(newBot.length - cutEnd - 1) == oldBot.charCodeAt(oldBot.length - cutEnd - 1)) {
        cutFront--;
        cutEnd++;
      }
    }

    newText[newText.length - 1] = newBot.slice(0, newBot.length - cutEnd).replace(/^\u200b+/, "");
    newText[0] = newText[0].slice(cutFront).replace(/\u200b+$/, "");
    var chFrom = Pos(fromLine, cutFront);
    var chTo = Pos(toLine, oldText.length ? lst(oldText).length - cutEnd : 0);

    if (newText.length > 1 || newText[0] || cmp(chFrom, chTo)) {
      _replaceRange(cm.doc, newText, chFrom, chTo, "+input");

      return true;
    }
  };

  ContentEditableInput.prototype.ensurePolled = function () {
    this.forceCompositionEnd();
  };

  ContentEditableInput.prototype.reset = function () {
    this.forceCompositionEnd();
  };

  ContentEditableInput.prototype.forceCompositionEnd = function () {
    if (!this.composing) {
      return;
    }

    clearTimeout(this.readDOMTimeout);
    this.composing = null;
    this.updateFromDOM();
    this.div.blur();
    this.div.focus();
  };

  ContentEditableInput.prototype.readFromDOMSoon = function () {
    var this$1 = this;

    if (this.readDOMTimeout != null) {
      return;
    }

    this.readDOMTimeout = setTimeout(function () {
      this$1.readDOMTimeout = null;

      if (this$1.composing) {
        if (this$1.composing.done) {
          this$1.composing = null;
        } else {
          return;
        }
      }

      this$1.updateFromDOM();
    }, 80);
  };

  ContentEditableInput.prototype.updateFromDOM = function () {
    var this$1 = this;

    if (this.cm.isReadOnly() || !this.pollContent()) {
      runInOp(this.cm, function () {
        return regChange(this$1.cm);
      });
    }
  };

  ContentEditableInput.prototype.setUneditable = function (node) {
    node.contentEditable = "false";
  };

  ContentEditableInput.prototype.onKeyPress = function (e) {
    if (e.charCode == 0 || this.composing) {
      return;
    }

    e.preventDefault();

    if (!this.cm.isReadOnly()) {
      operation(this.cm, applyTextInput)(this.cm, String.fromCharCode(e.charCode == null ? e.keyCode : e.charCode), 0);
    }
  };

  ContentEditableInput.prototype.readOnlyChanged = function (val) {
    this.div.contentEditable = String(val != "nocursor");
  };

  ContentEditableInput.prototype.onContextMenu = function () {};

  ContentEditableInput.prototype.resetPosition = function () {};

  ContentEditableInput.prototype.needsContentAttribute = true;

  function posToDOM(cm, pos) {
    var view = findViewForLine(cm, pos.line);

    if (!view || view.hidden) {
      return null;
    }

    var line = getLine(cm.doc, pos.line);
    var info = mapFromLineView(view, line, pos.line);
    var order = getOrder(line, cm.doc.direction),
        side = "left";

    if (order) {
      var partPos = getBidiPartAt(order, pos.ch);
      side = partPos % 2 ? "right" : "left";
    }

    var result = nodeAndOffsetInLineMap(info.map, pos.ch, side);
    result.offset = result.collapse == "right" ? result.end : result.start;
    return result;
  }

  function isInGutter(node) {
    for (var scan = node; scan; scan = scan.parentNode) {
      if (/CodeMirror-gutter-wrapper/.test(scan.className)) {
        return true;
      }
    }

    return false;
  }

  function badPos(pos, bad) {
    if (bad) {
      pos.bad = true;
    }

    return pos;
  }

  function domTextBetween(cm, from, to, fromLine, toLine) {
    var text = "",
        closing = false,
        lineSep = cm.doc.lineSeparator(),
        extraLinebreak = false;

    function recognizeMarker(id) {
      return function (marker) {
        return marker.id == id;
      };
    }

    function close() {
      if (closing) {
        text += lineSep;

        if (extraLinebreak) {
          text += lineSep;
        }

        closing = extraLinebreak = false;
      }
    }

    function addText(str) {
      if (str) {
        close();
        text += str;
      }
    }

    function walk(node) {
      if (node.nodeType == 1) {
        var cmText = node.getAttribute("cm-text");

        if (cmText) {
          addText(cmText);
          return;
        }

        var markerID = node.getAttribute("cm-marker"),
            range$$1;

        if (markerID) {
          var found = cm.findMarks(Pos(fromLine, 0), Pos(toLine + 1, 0), recognizeMarker(+markerID));

          if (found.length && (range$$1 = found[0].find(0))) {
            addText(getBetween(cm.doc, range$$1.from, range$$1.to).join(lineSep));
          }

          return;
        }

        if (node.getAttribute("contenteditable") == "false") {
          return;
        }

        var isBlock = /^(pre|div|p|li|table|br)$/i.test(node.nodeName);

        if (!/^br$/i.test(node.nodeName) && node.textContent.length == 0) {
          return;
        }

        if (isBlock) {
          close();
        }

        for (var i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
        }

        if (/^(pre|p)$/i.test(node.nodeName)) {
          extraLinebreak = true;
        }

        if (isBlock) {
          closing = true;
        }
      } else if (node.nodeType == 3) {
        addText(node.nodeValue.replace(/\u200b/g, "").replace(/\u00a0/g, " "));
      }
    }

    for (;;) {
      walk(from);

      if (from == to) {
        break;
      }

      from = from.nextSibling;
      extraLinebreak = false;
    }

    return text;
  }

  function domToPos(cm, node, offset) {
    var lineNode;

    if (node == cm.display.lineDiv) {
      lineNode = cm.display.lineDiv.childNodes[offset];

      if (!lineNode) {
        return badPos(cm.clipPos(Pos(cm.display.viewTo - 1)), true);
      }

      node = null;
      offset = 0;
    } else {
      for (lineNode = node;; lineNode = lineNode.parentNode) {
        if (!lineNode || lineNode == cm.display.lineDiv) {
          return null;
        }

        if (lineNode.parentNode && lineNode.parentNode == cm.display.lineDiv) {
          break;
        }
      }
    }

    for (var i = 0; i < cm.display.view.length; i++) {
      var lineView = cm.display.view[i];

      if (lineView.node == lineNode) {
        return locateNodeInLineView(lineView, node, offset);
      }
    }
  }

  function locateNodeInLineView(lineView, node, offset) {
    var wrapper = lineView.text.firstChild,
        bad = false;

    if (!node || !contains(wrapper, node)) {
      return badPos(Pos(lineNo(lineView.line), 0), true);
    }

    if (node == wrapper) {
      bad = true;
      node = wrapper.childNodes[offset];
      offset = 0;

      if (!node) {
        var line = lineView.rest ? lst(lineView.rest) : lineView.line;
        return badPos(Pos(lineNo(line), line.text.length), bad);
      }
    }

    var textNode = node.nodeType == 3 ? node : null,
        topNode = node;

    if (!textNode && node.childNodes.length == 1 && node.firstChild.nodeType == 3) {
      textNode = node.firstChild;

      if (offset) {
        offset = textNode.nodeValue.length;
      }
    }

    while (topNode.parentNode != wrapper) {
      topNode = topNode.parentNode;
    }

    var measure = lineView.measure,
        maps = measure.maps;

    function find(textNode, topNode, offset) {
      for (var i = -1; i < (maps ? maps.length : 0); i++) {
        var map$$1 = i < 0 ? measure.map : maps[i];

        for (var j = 0; j < map$$1.length; j += 3) {
          var curNode = map$$1[j + 2];

          if (curNode == textNode || curNode == topNode) {
            var line = lineNo(i < 0 ? lineView.line : lineView.rest[i]);
            var ch = map$$1[j] + offset;

            if (offset < 0 || curNode != textNode) {
              ch = map$$1[j + (offset ? 1 : 0)];
            }

            return Pos(line, ch);
          }
        }
      }
    }

    var found = find(textNode, topNode, offset);

    if (found) {
      return badPos(found, bad);
    } // FIXME this is all really shaky. might handle the few cases it needs to handle, but likely to cause problems


    for (var after = topNode.nextSibling, dist = textNode ? textNode.nodeValue.length - offset : 0; after; after = after.nextSibling) {
      found = find(after, after.firstChild, 0);

      if (found) {
        return badPos(Pos(found.line, found.ch - dist), bad);
      } else {
        dist += after.textContent.length;
      }
    }

    for (var before = topNode.previousSibling, dist$1 = offset; before; before = before.previousSibling) {
      found = find(before, before.firstChild, -1);

      if (found) {
        return badPos(Pos(found.line, found.ch + dist$1), bad);
      } else {
        dist$1 += before.textContent.length;
      }
    }
  } // TEXTAREA INPUT STYLE


  var TextareaInput = function TextareaInput(cm) {
    this.cm = cm; // See input.poll and input.reset

    this.prevInput = ""; // Flag that indicates whether we expect input to appear real soon
    // now (after some event like 'keypress' or 'input') and are
    // polling intensively.

    this.pollingFast = false; // Self-resetting timeout for the poller

    this.polling = new Delayed(); // Used to work around IE issue with selection being forgotten when focus moves away from textarea

    this.hasSelection = false;
    this.composing = null;
  };

  TextareaInput.prototype.init = function (display) {
    var this$1 = this;
    var input = this,
        cm = this.cm;
    this.createField(display);
    var te = this.textarea;
    display.wrapper.insertBefore(this.wrapper, display.wrapper.firstChild); // Needed to hide big blue blinking cursor on Mobile Safari (doesn't seem to work in iOS 8 anymore)

    if (ios) {
      te.style.width = "0px";
    }

    on(te, "input", function () {
      if (ie && ie_version >= 9 && this$1.hasSelection) {
        this$1.hasSelection = null;
      }

      input.poll();
    });
    on(te, "paste", function (e) {
      if (signalDOMEvent(cm, e) || handlePaste(e, cm)) {
        return;
      }

      cm.state.pasteIncoming = +new Date();
      input.fastPoll();
    });

    function prepareCopyCut(e) {
      if (signalDOMEvent(cm, e)) {
        return;
      }

      if (cm.somethingSelected()) {
        setLastCopied({
          lineWise: false,
          text: cm.getSelections()
        });
      } else if (!cm.options.lineWiseCopyCut) {
        return;
      } else {
        var ranges = copyableRanges(cm);
        setLastCopied({
          lineWise: true,
          text: ranges.text
        });

        if (e.type == "cut") {
          cm.setSelections(ranges.ranges, null, sel_dontScroll);
        } else {
          input.prevInput = "";
          te.value = ranges.text.join("\n");
          selectInput(te);
        }
      }

      if (e.type == "cut") {
        cm.state.cutIncoming = +new Date();
      }
    }

    on(te, "cut", prepareCopyCut);
    on(te, "copy", prepareCopyCut);
    on(display.scroller, "paste", function (e) {
      if (eventInWidget(display, e) || signalDOMEvent(cm, e)) {
        return;
      }

      if (!te.dispatchEvent) {
        cm.state.pasteIncoming = +new Date();
        input.focus();
        return;
      } // Pass the `paste` event to the textarea so it's handled by its event listener.


      var event = new Event("paste");
      event.clipboardData = e.clipboardData;
      te.dispatchEvent(event);
    }); // Prevent normal selection in the editor (we handle our own)

    on(display.lineSpace, "selectstart", function (e) {
      if (!eventInWidget(display, e)) {
        e_preventDefault(e);
      }
    });
    on(te, "compositionstart", function () {
      var start = cm.getCursor("from");

      if (input.composing) {
        input.composing.range.clear();
      }

      input.composing = {
        start: start,
        range: cm.markText(start, cm.getCursor("to"), {
          className: "CodeMirror-composing"
        })
      };
    });
    on(te, "compositionend", function () {
      if (input.composing) {
        input.poll();
        input.composing.range.clear();
        input.composing = null;
      }
    });
  };

  TextareaInput.prototype.createField = function (_display) {
    // Wraps and hides input textarea
    this.wrapper = hiddenTextarea(); // The semihidden textarea that is focused when the editor is
    // focused, and receives input.

    this.textarea = this.wrapper.firstChild;
  };

  TextareaInput.prototype.prepareSelection = function () {
    // Redraw the selection and/or cursor
    var cm = this.cm,
        display = cm.display,
        doc = cm.doc;
    var result = prepareSelection(cm); // Move the hidden textarea near the cursor to prevent scrolling artifacts

    if (cm.options.moveInputWithCursor) {
      var headPos = _cursorCoords(cm, doc.sel.primary().head, "div");

      var wrapOff = display.wrapper.getBoundingClientRect(),
          lineOff = display.lineDiv.getBoundingClientRect();
      result.teTop = Math.max(0, Math.min(display.wrapper.clientHeight - 10, headPos.top + lineOff.top - wrapOff.top));
      result.teLeft = Math.max(0, Math.min(display.wrapper.clientWidth - 10, headPos.left + lineOff.left - wrapOff.left));
    }

    return result;
  };

  TextareaInput.prototype.showSelection = function (drawn) {
    var cm = this.cm,
        display = cm.display;
    removeChildrenAndAdd(display.cursorDiv, drawn.cursors);
    removeChildrenAndAdd(display.selectionDiv, drawn.selection);

    if (drawn.teTop != null) {
      this.wrapper.style.top = drawn.teTop + "px";
      this.wrapper.style.left = drawn.teLeft + "px";
    }
  }; // Reset the input to correspond to the selection (or to be empty,
  // when not typing and nothing is selected)


  TextareaInput.prototype.reset = function (typing) {
    if (this.contextMenuPending || this.composing) {
      return;
    }

    var cm = this.cm;

    if (cm.somethingSelected()) {
      this.prevInput = "";
      var content = cm.getSelection();
      this.textarea.value = content;

      if (cm.state.focused) {
        selectInput(this.textarea);
      }

      if (ie && ie_version >= 9) {
        this.hasSelection = content;
      }
    } else if (!typing) {
      this.prevInput = this.textarea.value = "";

      if (ie && ie_version >= 9) {
        this.hasSelection = null;
      }
    }
  };

  TextareaInput.prototype.getField = function () {
    return this.textarea;
  };

  TextareaInput.prototype.supportsTouch = function () {
    return false;
  };

  TextareaInput.prototype.focus = function () {
    if (this.cm.options.readOnly != "nocursor" && (!mobile || activeElt() != this.textarea)) {
      try {
        this.textarea.focus();
      } catch (e) {} // IE8 will throw if the textarea is display: none or not in DOM

    }
  };

  TextareaInput.prototype.blur = function () {
    this.textarea.blur();
  };

  TextareaInput.prototype.resetPosition = function () {
    this.wrapper.style.top = this.wrapper.style.left = 0;
  };

  TextareaInput.prototype.receivedFocus = function () {
    this.slowPoll();
  }; // Poll for input changes, using the normal rate of polling. This
  // runs as long as the editor is focused.


  TextareaInput.prototype.slowPoll = function () {
    var this$1 = this;

    if (this.pollingFast) {
      return;
    }

    this.polling.set(this.cm.options.pollInterval, function () {
      this$1.poll();

      if (this$1.cm.state.focused) {
        this$1.slowPoll();
      }
    });
  }; // When an event has just come in that is likely to add or change
  // something in the input textarea, we poll faster, to ensure that
  // the change appears on the screen quickly.


  TextareaInput.prototype.fastPoll = function () {
    var missed = false,
        input = this;
    input.pollingFast = true;

    function p() {
      var changed = input.poll();

      if (!changed && !missed) {
        missed = true;
        input.polling.set(60, p);
      } else {
        input.pollingFast = false;
        input.slowPoll();
      }
    }

    input.polling.set(20, p);
  }; // Read input from the textarea, and update the document to match.
  // When something is selected, it is present in the textarea, and
  // selected (unless it is huge, in which case a placeholder is
  // used). When nothing is selected, the cursor sits after previously
  // seen text (can be empty), which is stored in prevInput (we must
  // not reset the textarea when typing, because that breaks IME).


  TextareaInput.prototype.poll = function () {
    var this$1 = this;
    var cm = this.cm,
        input = this.textarea,
        prevInput = this.prevInput; // Since this is called a *lot*, try to bail out as cheaply as
    // possible when it is clear that nothing happened. hasSelection
    // will be the case when there is a lot of text in the textarea,
    // in which case reading its value would be expensive.

    if (this.contextMenuPending || !cm.state.focused || hasSelection(input) && !prevInput && !this.composing || cm.isReadOnly() || cm.options.disableInput || cm.state.keySeq) {
      return false;
    }

    var text = input.value; // If nothing changed, bail.

    if (text == prevInput && !cm.somethingSelected()) {
      return false;
    } // Work around nonsensical selection resetting in IE9/10, and
    // inexplicable appearance of private area unicode characters on
    // some key combos in Mac (#2689).


    if (ie && ie_version >= 9 && this.hasSelection === text || mac && /[\uf700-\uf7ff]/.test(text)) {
      cm.display.input.reset();
      return false;
    }

    if (cm.doc.sel == cm.display.selForContextMenu) {
      var first = text.charCodeAt(0);

      if (first == 0x200b && !prevInput) {
        prevInput = "\u200B";
      }

      if (first == 0x21da) {
        this.reset();
        return this.cm.execCommand("undo");
      }
    } // Find the part of the input that is actually new


    var same = 0,
        l = Math.min(prevInput.length, text.length);

    while (same < l && prevInput.charCodeAt(same) == text.charCodeAt(same)) {
      ++same;
    }

    runInOp(cm, function () {
      applyTextInput(cm, text.slice(same), prevInput.length - same, null, this$1.composing ? "*compose" : null); // Don't leave long text in the textarea, since it makes further polling slow

      if (text.length > 1000 || text.indexOf("\n") > -1) {
        input.value = this$1.prevInput = "";
      } else {
        this$1.prevInput = text;
      }

      if (this$1.composing) {
        this$1.composing.range.clear();
        this$1.composing.range = cm.markText(this$1.composing.start, cm.getCursor("to"), {
          className: "CodeMirror-composing"
        });
      }
    });
    return true;
  };

  TextareaInput.prototype.ensurePolled = function () {
    if (this.pollingFast && this.poll()) {
      this.pollingFast = false;
    }
  };

  TextareaInput.prototype.onKeyPress = function () {
    if (ie && ie_version >= 9) {
      this.hasSelection = null;
    }

    this.fastPoll();
  };

  TextareaInput.prototype.onContextMenu = function (e) {
    var input = this,
        cm = input.cm,
        display = cm.display,
        te = input.textarea;

    if (input.contextMenuPending) {
      input.contextMenuPending();
    }

    var pos = posFromMouse(cm, e),
        scrollPos = display.scroller.scrollTop;

    if (!pos || presto) {
      return;
    } // Opera is difficult.
    // Reset the current text selection only if the click is done outside of the selection
    // and 'resetSelectionOnContextMenu' option is true.


    var reset = cm.options.resetSelectionOnContextMenu;

    if (reset && cm.doc.sel.contains(pos) == -1) {
      operation(cm, setSelection)(cm.doc, simpleSelection(pos), sel_dontScroll);
    }

    var oldCSS = te.style.cssText,
        oldWrapperCSS = input.wrapper.style.cssText;
    var wrapperBox = input.wrapper.offsetParent.getBoundingClientRect();
    input.wrapper.style.cssText = "position: static";
    te.style.cssText = "position: absolute; width: 30px; height: 30px;\n      top: " + (e.clientY - wrapperBox.top - 5) + "px; left: " + (e.clientX - wrapperBox.left - 5) + "px;\n      z-index: 1000; background: " + (ie ? "rgba(255, 255, 255, .05)" : "transparent") + ";\n      outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
    var oldScrollY;

    if (webkit) {
      oldScrollY = window.scrollY;
    } // Work around Chrome issue (#2712)


    display.input.focus();

    if (webkit) {
      window.scrollTo(null, oldScrollY);
    }

    display.input.reset(); // Adds "Select all" to context menu in FF

    if (!cm.somethingSelected()) {
      te.value = input.prevInput = " ";
    }

    input.contextMenuPending = rehide;
    display.selForContextMenu = cm.doc.sel;
    clearTimeout(display.detectingSelectAll); // Select-all will be greyed out if there's nothing to select, so
    // this adds a zero-width space so that we can later check whether
    // it got selected.

    function prepareSelectAllHack() {
      if (te.selectionStart != null) {
        var selected = cm.somethingSelected();
        var extval = "\u200B" + (selected ? te.value : "");
        te.value = "\u21DA"; // Used to catch context-menu undo

        te.value = extval;
        input.prevInput = selected ? "" : "\u200B";
        te.selectionStart = 1;
        te.selectionEnd = extval.length; // Re-set this, in case some other handler touched the
        // selection in the meantime.

        display.selForContextMenu = cm.doc.sel;
      }
    }

    function rehide() {
      if (input.contextMenuPending != rehide) {
        return;
      }

      input.contextMenuPending = false;
      input.wrapper.style.cssText = oldWrapperCSS;
      te.style.cssText = oldCSS;

      if (ie && ie_version < 9) {
        display.scrollbars.setScrollTop(display.scroller.scrollTop = scrollPos);
      } // Try to detect the user choosing select-all


      if (te.selectionStart != null) {
        if (!ie || ie && ie_version < 9) {
          prepareSelectAllHack();
        }

        var i = 0,
            poll = function poll() {
          if (display.selForContextMenu == cm.doc.sel && te.selectionStart == 0 && te.selectionEnd > 0 && input.prevInput == "\u200B") {
            operation(cm, selectAll)(cm);
          } else if (i++ < 10) {
            display.detectingSelectAll = setTimeout(poll, 500);
          } else {
            display.selForContextMenu = null;
            display.input.reset();
          }
        };

        display.detectingSelectAll = setTimeout(poll, 200);
      }
    }

    if (ie && ie_version >= 9) {
      prepareSelectAllHack();
    }

    if (captureRightClick) {
      e_stop(e);

      var mouseup = function mouseup() {
        off(window, "mouseup", mouseup);
        setTimeout(rehide, 20);
      };

      on(window, "mouseup", mouseup);
    } else {
      setTimeout(rehide, 50);
    }
  };

  TextareaInput.prototype.readOnlyChanged = function (val) {
    if (!val) {
      this.reset();
    }

    this.textarea.disabled = val == "nocursor";
  };

  TextareaInput.prototype.setUneditable = function () {};

  TextareaInput.prototype.needsContentAttribute = false;

  function fromTextArea(textarea, options) {
    options = options ? copyObj(options) : {};
    options.value = textarea.value;

    if (!options.tabindex && textarea.tabIndex) {
      options.tabindex = textarea.tabIndex;
    }

    if (!options.placeholder && textarea.placeholder) {
      options.placeholder = textarea.placeholder;
    } // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.


    if (options.autofocus == null) {
      var hasFocus = activeElt();
      options.autofocus = hasFocus == textarea || textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {
      textarea.value = cm.getValue();
    }

    var realSubmit;

    if (textarea.form) {
      on(textarea.form, "submit", save); // Deplorable hack to make the submit method do the right thing.

      if (!options.leaveSubmitMethodAlone) {
        var form = textarea.form;
        realSubmit = form.submit;

        try {
          var wrappedSubmit = form.submit = function () {
            save();
            form.submit = realSubmit;
            form.submit();
            form.submit = wrappedSubmit;
          };
        } catch (e) {}
      }
    }

    options.finishInit = function (cm) {
      cm.save = save;

      cm.getTextArea = function () {
        return textarea;
      };

      cm.toTextArea = function () {
        cm.toTextArea = isNaN; // Prevent this from being ran twice

        save();
        textarea.parentNode.removeChild(cm.getWrapperElement());
        textarea.style.display = "";

        if (textarea.form) {
          off(textarea.form, "submit", save);

          if (!options.leaveSubmitMethodAlone && typeof textarea.form.submit == "function") {
            textarea.form.submit = realSubmit;
          }
        }
      };
    };

    textarea.style.display = "none";
    var cm = CodeMirror(function (node) {
      return textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    return cm;
  }

  function addLegacyProps(CodeMirror) {
    CodeMirror.off = off;
    CodeMirror.on = on;
    CodeMirror.wheelEventPixels = wheelEventPixels;
    CodeMirror.Doc = Doc;
    CodeMirror.splitLines = splitLinesAuto;
    CodeMirror.countColumn = countColumn;
    CodeMirror.findColumn = findColumn;
    CodeMirror.isWordChar = isWordCharBasic;
    CodeMirror.Pass = Pass;
    CodeMirror.signal = signal;
    CodeMirror.Line = Line;
    CodeMirror.changeEnd = changeEnd;
    CodeMirror.scrollbarModel = scrollbarModel;
    CodeMirror.Pos = Pos;
    CodeMirror.cmpPos = cmp;
    CodeMirror.modes = modes;
    CodeMirror.mimeModes = mimeModes;
    CodeMirror.resolveMode = resolveMode;
    CodeMirror.getMode = getMode;
    CodeMirror.modeExtensions = modeExtensions;
    CodeMirror.extendMode = extendMode;
    CodeMirror.copyState = copyState;
    CodeMirror.startState = startState;
    CodeMirror.innerMode = innerMode;
    CodeMirror.commands = commands;
    CodeMirror.keyMap = keyMap;
    CodeMirror.keyName = keyName;
    CodeMirror.isModifierKey = isModifierKey;
    CodeMirror.lookupKey = lookupKey;
    CodeMirror.normalizeKeyMap = normalizeKeyMap;
    CodeMirror.StringStream = StringStream;
    CodeMirror.SharedTextMarker = SharedTextMarker;
    CodeMirror.TextMarker = TextMarker;
    CodeMirror.LineWidget = LineWidget;
    CodeMirror.e_preventDefault = e_preventDefault;
    CodeMirror.e_stopPropagation = e_stopPropagation;
    CodeMirror.e_stop = e_stop;
    CodeMirror.addClass = addClass;
    CodeMirror.contains = contains;
    CodeMirror.rmClass = rmClass;
    CodeMirror.keyNames = keyNames;
  } // EDITOR CONSTRUCTOR


  defineOptions(CodeMirror);
  addEditorMethods(CodeMirror); // Set up methods on CodeMirror's prototype to redirect to the editor's document.

  var dontDelegate = "iter insert remove copy getEditor constructor".split(" ");

  for (var prop in Doc.prototype) {
    if (Doc.prototype.hasOwnProperty(prop) && indexOf(dontDelegate, prop) < 0) {
      CodeMirror.prototype[prop] = function (method) {
        return function () {
          return method.apply(this.doc, arguments);
        };
      }(Doc.prototype[prop]);
    }
  }

  eventMixin(Doc);
  CodeMirror.inputStyles = {
    "textarea": TextareaInput,
    "contenteditable": ContentEditableInput
  }; // Extra arguments are stored as the mode's dependencies, which is
  // used by (legacy) mechanisms like loadmode.js to automatically
  // load a mode. (Preferred mechanism is the require/define calls.)

  CodeMirror.defineMode = function (name
  /*, mode, …*/
  ) {
    if (!CodeMirror.defaults.mode && name != "null") {
      CodeMirror.defaults.mode = name;
    }

    defineMode.apply(this, arguments);
  };

  CodeMirror.defineMIME = defineMIME; // Minimal default mode.

  CodeMirror.defineMode("null", function () {
    return {
      token: function token(stream) {
        return stream.skipToEnd();
      }
    };
  });
  CodeMirror.defineMIME("text/plain", "null"); // EXTENSIONS

  CodeMirror.defineExtension = function (name, func) {
    CodeMirror.prototype[name] = func;
  };

  CodeMirror.defineDocExtension = function (name, func) {
    Doc.prototype[name] = func;
  };

  CodeMirror.fromTextArea = fromTextArea;
  addLegacyProps(CodeMirror);
  CodeMirror.version = "5.49.0";
  return CodeMirror;
});
},{}],"addon/search/searchcursor.js":[function(require,module,exports) {
var define;
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  "use strict";

  var Pos = CodeMirror.Pos;

  function regexpFlags(regexp) {
    var flags = regexp.flags;
    return flags != null ? flags : (regexp.ignoreCase ? "i" : "") + (regexp.global ? "g" : "") + (regexp.multiline ? "m" : "");
  }

  function ensureFlags(regexp, flags) {
    var current = regexpFlags(regexp),
        target = current;

    for (var i = 0; i < flags.length; i++) {
      if (target.indexOf(flags.charAt(i)) == -1) target += flags.charAt(i);
    }

    return current == target ? regexp : new RegExp(regexp.source, target);
  }

  function maybeMultiline(regexp) {
    return /\\s|\\n|\n|\\W|\\D|\[\^/.test(regexp.source);
  }

  function searchRegexpForward(doc, regexp, start) {
    regexp = ensureFlags(regexp, "g");

    for (var line = start.line, ch = start.ch, last = doc.lastLine(); line <= last; line++, ch = 0) {
      regexp.lastIndex = ch;
      var string = doc.getLine(line),
          match = regexp.exec(string);
      if (match) return {
        from: Pos(line, match.index),
        to: Pos(line, match.index + match[0].length),
        match: match
      };
    }
  }

  function searchRegexpForwardMultiline(doc, regexp, start) {
    if (!maybeMultiline(regexp)) return searchRegexpForward(doc, regexp, start);
    regexp = ensureFlags(regexp, "gm");
    var string,
        chunk = 1;

    for (var line = start.line, last = doc.lastLine(); line <= last;) {
      // This grows the search buffer in exponentially-sized chunks
      // between matches, so that nearby matches are fast and don't
      // require concatenating the whole document (in case we're
      // searching for something that has tons of matches), but at the
      // same time, the amount of retries is limited.
      for (var i = 0; i < chunk; i++) {
        if (line > last) break;
        var curLine = doc.getLine(line++);
        string = string == null ? curLine : string + "\n" + curLine;
      }

      chunk = chunk * 2;
      regexp.lastIndex = start.ch;
      var match = regexp.exec(string);

      if (match) {
        var before = string.slice(0, match.index).split("\n"),
            inside = match[0].split("\n");
        var startLine = start.line + before.length - 1,
            startCh = before[before.length - 1].length;
        return {
          from: Pos(startLine, startCh),
          to: Pos(startLine + inside.length - 1, inside.length == 1 ? startCh + inside[0].length : inside[inside.length - 1].length),
          match: match
        };
      }
    }
  }

  function lastMatchIn(string, regexp) {
    var cutOff = 0,
        match;

    for (;;) {
      regexp.lastIndex = cutOff;
      var newMatch = regexp.exec(string);
      if (!newMatch) return match;
      match = newMatch;
      cutOff = match.index + (match[0].length || 1);
      if (cutOff == string.length) return match;
    }
  }

  function searchRegexpBackward(doc, regexp, start) {
    regexp = ensureFlags(regexp, "g");

    for (var line = start.line, ch = start.ch, first = doc.firstLine(); line >= first; line--, ch = -1) {
      var string = doc.getLine(line);
      if (ch > -1) string = string.slice(0, ch);
      var match = lastMatchIn(string, regexp);
      if (match) return {
        from: Pos(line, match.index),
        to: Pos(line, match.index + match[0].length),
        match: match
      };
    }
  }

  function searchRegexpBackwardMultiline(doc, regexp, start) {
    regexp = ensureFlags(regexp, "gm");
    var string,
        chunk = 1;

    for (var line = start.line, first = doc.firstLine(); line >= first;) {
      for (var i = 0; i < chunk; i++) {
        var curLine = doc.getLine(line--);
        string = string == null ? curLine.slice(0, start.ch) : curLine + "\n" + string;
      }

      chunk *= 2;
      var match = lastMatchIn(string, regexp);

      if (match) {
        var before = string.slice(0, match.index).split("\n"),
            inside = match[0].split("\n");
        var startLine = line + before.length,
            startCh = before[before.length - 1].length;
        return {
          from: Pos(startLine, startCh),
          to: Pos(startLine + inside.length - 1, inside.length == 1 ? startCh + inside[0].length : inside[inside.length - 1].length),
          match: match
        };
      }
    }
  }

  var doFold, noFold;

  if (String.prototype.normalize) {
    doFold = function doFold(str) {
      return str.normalize("NFD").toLowerCase();
    };

    noFold = function noFold(str) {
      return str.normalize("NFD");
    };
  } else {
    doFold = function doFold(str) {
      return str.toLowerCase();
    };

    noFold = function noFold(str) {
      return str;
    };
  } // Maps a position in a case-folded line back to a position in the original line
  // (compensating for codepoints increasing in number during folding)


  function adjustPos(orig, folded, pos, foldFunc) {
    if (orig.length == folded.length) return pos;

    for (var min = 0, max = pos + Math.max(0, orig.length - folded.length);;) {
      if (min == max) return min;
      var mid = min + max >> 1;
      var len = foldFunc(orig.slice(0, mid)).length;
      if (len == pos) return mid;else if (len > pos) max = mid;else min = mid + 1;
    }
  }

  function searchStringForward(doc, query, start, caseFold) {
    // Empty string would match anything and never progress, so we
    // define it to match nothing instead.
    if (!query.length) return null;
    var fold = caseFold ? doFold : noFold;
    var lines = fold(query).split(/\r|\n\r?/);

    search: for (var line = start.line, ch = start.ch, last = doc.lastLine() + 1 - lines.length; line <= last; line++, ch = 0) {
      var orig = doc.getLine(line).slice(ch),
          string = fold(orig);

      if (lines.length == 1) {
        var found = string.indexOf(lines[0]);
        if (found == -1) continue search;
        var start = adjustPos(orig, string, found, fold) + ch;
        return {
          from: Pos(line, adjustPos(orig, string, found, fold) + ch),
          to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold) + ch)
        };
      } else {
        var cutFrom = string.length - lines[0].length;
        if (string.slice(cutFrom) != lines[0]) continue search;

        for (var i = 1; i < lines.length - 1; i++) {
          if (fold(doc.getLine(line + i)) != lines[i]) continue search;
        }

        var end = doc.getLine(line + lines.length - 1),
            endString = fold(end),
            lastLine = lines[lines.length - 1];
        if (endString.slice(0, lastLine.length) != lastLine) continue search;
        return {
          from: Pos(line, adjustPos(orig, string, cutFrom, fold) + ch),
          to: Pos(line + lines.length - 1, adjustPos(end, endString, lastLine.length, fold))
        };
      }
    }
  }

  function searchStringBackward(doc, query, start, caseFold) {
    if (!query.length) return null;
    var fold = caseFold ? doFold : noFold;
    var lines = fold(query).split(/\r|\n\r?/);

    search: for (var line = start.line, ch = start.ch, first = doc.firstLine() - 1 + lines.length; line >= first; line--, ch = -1) {
      var orig = doc.getLine(line);
      if (ch > -1) orig = orig.slice(0, ch);
      var string = fold(orig);

      if (lines.length == 1) {
        var found = string.lastIndexOf(lines[0]);
        if (found == -1) continue search;
        return {
          from: Pos(line, adjustPos(orig, string, found, fold)),
          to: Pos(line, adjustPos(orig, string, found + lines[0].length, fold))
        };
      } else {
        var lastLine = lines[lines.length - 1];
        if (string.slice(0, lastLine.length) != lastLine) continue search;

        for (var i = 1, start = line - lines.length + 1; i < lines.length - 1; i++) {
          if (fold(doc.getLine(start + i)) != lines[i]) continue search;
        }

        var top = doc.getLine(line + 1 - lines.length),
            topString = fold(top);
        if (topString.slice(topString.length - lines[0].length) != lines[0]) continue search;
        return {
          from: Pos(line + 1 - lines.length, adjustPos(top, topString, top.length - lines[0].length, fold)),
          to: Pos(line, adjustPos(orig, string, lastLine.length, fold))
        };
      }
    }
  }

  function SearchCursor(doc, query, pos, options) {
    this.atOccurrence = false;
    this.doc = doc;
    pos = pos ? doc.clipPos(pos) : Pos(0, 0);
    this.pos = {
      from: pos,
      to: pos
    };
    var caseFold;

    if (_typeof(options) == "object") {
      caseFold = options.caseFold;
    } else {
      // Backwards compat for when caseFold was the 4th argument
      caseFold = options;
      options = null;
    }

    if (typeof query == "string") {
      if (caseFold == null) caseFold = false;

      this.matches = function (reverse, pos) {
        return (reverse ? searchStringBackward : searchStringForward)(doc, query, pos, caseFold);
      };
    } else {
      query = ensureFlags(query, "gm");
      if (!options || options.multiline !== false) this.matches = function (reverse, pos) {
        return (reverse ? searchRegexpBackwardMultiline : searchRegexpForwardMultiline)(doc, query, pos);
      };else this.matches = function (reverse, pos) {
        return (reverse ? searchRegexpBackward : searchRegexpForward)(doc, query, pos);
      };
    }
  }

  SearchCursor.prototype = {
    findNext: function findNext() {
      return this.find(false);
    },
    findPrevious: function findPrevious() {
      return this.find(true);
    },
    find: function find(reverse) {
      var result = this.matches(reverse, this.doc.clipPos(reverse ? this.pos.from : this.pos.to)); // Implements weird auto-growing behavior on null-matches for
      // backwards-compatiblity with the vim code (unfortunately)

      while (result && CodeMirror.cmpPos(result.from, result.to) == 0) {
        if (reverse) {
          if (result.from.ch) result.from = Pos(result.from.line, result.from.ch - 1);else if (result.from.line == this.doc.firstLine()) result = null;else result = this.matches(reverse, this.doc.clipPos(Pos(result.from.line - 1)));
        } else {
          if (result.to.ch < this.doc.getLine(result.to.line).length) result.to = Pos(result.to.line, result.to.ch + 1);else if (result.to.line == this.doc.lastLine()) result = null;else result = this.matches(reverse, Pos(result.to.line + 1, 0));
        }
      }

      if (result) {
        this.pos = result;
        this.atOccurrence = true;
        return this.pos.match || true;
      } else {
        var end = Pos(reverse ? this.doc.firstLine() : this.doc.lastLine() + 1, 0);
        this.pos = {
          from: end,
          to: end
        };
        return this.atOccurrence = false;
      }
    },
    from: function from() {
      if (this.atOccurrence) return this.pos.from;
    },
    to: function to() {
      if (this.atOccurrence) return this.pos.to;
    },
    replace: function replace(newText, origin) {
      if (!this.atOccurrence) return;
      var lines = CodeMirror.splitLines(newText);
      this.doc.replaceRange(lines, this.pos.from, this.pos.to, origin);
      this.pos.to = Pos(this.pos.from.line + lines.length - 1, lines[lines.length - 1].length + (lines.length == 1 ? this.pos.from.ch : 0));
    }
  };
  CodeMirror.defineExtension("getSearchCursor", function (query, pos, caseFold) {
    return new SearchCursor(this.doc, query, pos, caseFold);
  });
  CodeMirror.defineDocExtension("getSearchCursor", function (query, pos, caseFold) {
    return new SearchCursor(this, query, pos, caseFold);
  });
  CodeMirror.defineExtension("selectMatches", function (query, caseFold) {
    var ranges = [];
    var cur = this.getSearchCursor(query, this.getCursor("from"), caseFold);

    while (cur.findNext()) {
      if (CodeMirror.cmpPos(cur.to(), this.getCursor("to")) > 0) break;
      ranges.push({
        anchor: cur.from(),
        head: cur.to()
      });
    }

    if (ranges.length) this.setSelections(ranges, 0);
  });
});
},{"../../lib/codemirror":"lib/codemirror/lib/codemirror.js"}],"addon/edit/matchbrackets.js":[function(require,module,exports) {
var define;
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
(function (mod) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object" && (typeof module === "undefined" ? "undefined" : _typeof(module)) == "object") // CommonJS
    mod(require("../../lib/codemirror"));else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);else // Plain browser env
    mod(CodeMirror);
})(function (CodeMirror) {
  var ie_lt8 = /MSIE \d/.test(navigator.userAgent) && (document.documentMode == null || document.documentMode < 8);
  var Pos = CodeMirror.Pos;
  var matching = {
    "(": ")>",
    ")": "(<",
    "[": "]>",
    "]": "[<",
    "{": "}>",
    "}": "{<",
    "<": ">>",
    ">": "<<"
  };

  function bracketRegex(config) {
    return config && config.bracketRegex || /[(){}[\]]/;
  }

  function findMatchingBracket(cm, where, config) {
    var line = cm.getLineHandle(where.line),
        pos = where.ch - 1;
    var afterCursor = config && config.afterCursor;
    if (afterCursor == null) afterCursor = /(^| )cm-fat-cursor($| )/.test(cm.getWrapperElement().className);
    var re = bracketRegex(config); // A cursor is defined as between two characters, but in in vim command mode
    // (i.e. not insert mode), the cursor is visually represented as a
    // highlighted box on top of the 2nd character. Otherwise, we allow matches
    // from before or after the cursor.

    var match = !afterCursor && pos >= 0 && re.test(line.text.charAt(pos)) && matching[line.text.charAt(pos)] || re.test(line.text.charAt(pos + 1)) && matching[line.text.charAt(++pos)];
    if (!match) return null;
    var dir = match.charAt(1) == ">" ? 1 : -1;
    if (config && config.strict && dir > 0 != (pos == where.ch)) return null;
    var style = cm.getTokenTypeAt(Pos(where.line, pos + 1));
    var found = scanForBracket(cm, Pos(where.line, pos + (dir > 0 ? 1 : 0)), dir, style || null, config);
    if (found == null) return null;
    return {
      from: Pos(where.line, pos),
      to: found && found.pos,
      match: found && found.ch == match.charAt(0),
      forward: dir > 0
    };
  } // bracketRegex is used to specify which type of bracket to scan
  // should be a regexp, e.g. /[[\]]/
  //
  // Note: If "where" is on an open bracket, then this bracket is ignored.
  //
  // Returns false when no bracket was found, null when it reached
  // maxScanLines and gave up


  function scanForBracket(cm, where, dir, style, config) {
    var maxScanLen = config && config.maxScanLineLength || 10000;
    var maxScanLines = config && config.maxScanLines || 1000;
    var stack = [];
    var re = bracketRegex(config);
    var lineEnd = dir > 0 ? Math.min(where.line + maxScanLines, cm.lastLine() + 1) : Math.max(cm.firstLine() - 1, where.line - maxScanLines);

    for (var lineNo = where.line; lineNo != lineEnd; lineNo += dir) {
      var line = cm.getLine(lineNo);
      if (!line) continue;
      var pos = dir > 0 ? 0 : line.length - 1,
          end = dir > 0 ? line.length : -1;
      if (line.length > maxScanLen) continue;
      if (lineNo == where.line) pos = where.ch - (dir < 0 ? 1 : 0);

      for (; pos != end; pos += dir) {
        var ch = line.charAt(pos);

        if (re.test(ch) && (style === undefined || cm.getTokenTypeAt(Pos(lineNo, pos + 1)) == style)) {
          var match = matching[ch];
          if (match && match.charAt(1) == ">" == dir > 0) stack.push(ch);else if (!stack.length) return {
            pos: Pos(lineNo, pos),
            ch: ch
          };else stack.pop();
        }
      }
    }

    return lineNo - dir == (dir > 0 ? cm.lastLine() : cm.firstLine()) ? false : null;
  }

  function matchBrackets(cm, autoclear, config) {
    // Disable brace matching in long lines, since it'll cause hugely slow updates
    var maxHighlightLen = cm.state.matchBrackets.maxHighlightLineLength || 1000;
    var marks = [],
        ranges = cm.listSelections();

    for (var i = 0; i < ranges.length; i++) {
      var match = ranges[i].empty() && findMatchingBracket(cm, ranges[i].head, config);

      if (match && cm.getLine(match.from.line).length <= maxHighlightLen) {
        var style = match.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        marks.push(cm.markText(match.from, Pos(match.from.line, match.from.ch + 1), {
          className: style
        }));
        if (match.to && cm.getLine(match.to.line).length <= maxHighlightLen) marks.push(cm.markText(match.to, Pos(match.to.line, match.to.ch + 1), {
          className: style
        }));
      }
    }

    if (marks.length) {
      // Kludge to work around the IE bug from issue #1193, where text
      // input stops going to the textare whever this fires.
      if (ie_lt8 && cm.state.focused) cm.focus();

      var clear = function clear() {
        cm.operation(function () {
          for (var i = 0; i < marks.length; i++) {
            marks[i].clear();
          }
        });
      };

      if (autoclear) setTimeout(clear, 800);else return clear;
    }
  }

  function doMatchBrackets(cm) {
    cm.operation(function () {
      if (cm.state.matchBrackets.currentlyHighlighted) {
        cm.state.matchBrackets.currentlyHighlighted();
        cm.state.matchBrackets.currentlyHighlighted = null;
      }

      cm.state.matchBrackets.currentlyHighlighted = matchBrackets(cm, false, cm.state.matchBrackets);
    });
  }

  CodeMirror.defineOption("matchBrackets", false, function (cm, val, old) {
    if (old && old != CodeMirror.Init) {
      cm.off("cursorActivity", doMatchBrackets);

      if (cm.state.matchBrackets && cm.state.matchBrackets.currentlyHighlighted) {
        cm.state.matchBrackets.currentlyHighlighted();
        cm.state.matchBrackets.currentlyHighlighted = null;
      }
    }

    if (val) {
      cm.state.matchBrackets = _typeof(val) == "object" ? val : {};
      cm.on("cursorActivity", doMatchBrackets);
    }
  });
  CodeMirror.defineExtension("matchBrackets", function () {
    matchBrackets(this, true);
  });
  CodeMirror.defineExtension("findMatchingBracket", function (pos, config, oldConfig) {
    // Backwards-compatibility kludge
    if (oldConfig || typeof config == "boolean") {
      if (!oldConfig) {
        config = config ? {
          strict: true
        } : null;
      } else {
        oldConfig.strict = config;
        config = oldConfig;
      }
    }

    return findMatchingBracket(this, pos, config);
  });
  CodeMirror.defineExtension("scanForBracket", function (pos, dir, style, config) {
    return scanForBracket(this, pos, dir, style, config);
  });
});
},{"../../lib/codemirror":"lib/codemirror/lib/codemirror.js"}],"codemirror/codemirror-compressed.js":[function(require,module,exports) {
var define;
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/* CodeMirror - Minified & Bundled
   Generated on 6/8/2015 with http://codemirror.net/doc/compress.html
   Version: HEAD

   CodeMirror Library:
   - codemirror.js
   Add-ons:
   - matchbrackets.js
   Keymaps:
   - sublime.js
 */
!function (a) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module))) module.exports = a();else {
    if ("function" == typeof define && define.amd) return define([], a);
    this.CodeMirror = a();
  }
}(function () {
  "use strict";

  function v(a, b) {
    if (!(this instanceof v)) return new v(a, b);
    this.options = b = b ? eh(b) : {}, eh(xe, b, !1), I(b);
    var c = b.value;
    "string" == typeof c && (c = new $f(c, b.mode)), this.doc = c;
    var g = new v.inputStyles[b.inputStyle](this),
        h = this.display = new w(a, c, g);
    h.wrapper.CodeMirror = this, E(this), C(this), b.lineWrapping && (this.display.wrapper.className += " CodeMirror-wrap"), b.autofocus && !n && h.input.focus(), M(this), this.state = {
      keyMaps: [],
      overlays: [],
      modeGen: 0,
      overwrite: !1,
      delayingBlurEvent: !1,
      focused: !1,
      suppressEdits: !1,
      pasteIncoming: !1,
      cutIncoming: !1,
      draggingText: !1,
      highlight: new Vg(),
      keySeq: null,
      specialChars: null
    };
    var i = this;
    d && 11 > e && setTimeout(function () {
      i.display.input.reset(!0);
    }, 20), od(this), yh(), Uc(this), this.curOp.forceUpdate = !0, cg(this, c), b.autofocus && !n || i.hasFocus() ? setTimeout(fh(Wd, this), 20) : Xd(this);

    for (var j in ye) {
      ye.hasOwnProperty(j) && ye[j](this, b[j], Ae);
    }

    R(this), b.finishInit && b.finishInit(this);

    for (var k = 0; k < Ee.length; ++k) {
      Ee[k](this);
    }

    Wc(this), f && b.lineWrapping && "optimizelegibility" == getComputedStyle(h.lineDiv).textRendering && (h.lineDiv.style.textRendering = "auto");
  }

  function w(b, c, g) {
    var h = this;
    this.input = g, h.scrollbarFiller = mh("div", null, "CodeMirror-scrollbar-filler"), h.scrollbarFiller.setAttribute("cm-not-content", "true"), h.gutterFiller = mh("div", null, "CodeMirror-gutter-filler"), h.gutterFiller.setAttribute("cm-not-content", "true"), h.lineDiv = mh("div", null, "CodeMirror-code"), h.selectionDiv = mh("div", null, null, "position: relative; z-index: 1"), h.cursorDiv = mh("div", null, "CodeMirror-cursors"), h.measure = mh("div", null, "CodeMirror-measure"), h.lineMeasure = mh("div", null, "CodeMirror-measure"), h.lineSpace = mh("div", [h.measure, h.lineMeasure, h.selectionDiv, h.cursorDiv, h.lineDiv], null, "position: relative; outline: none"), h.mover = mh("div", [mh("div", [h.lineSpace], "CodeMirror-lines")], null, "position: relative"), h.sizer = mh("div", [h.mover], "CodeMirror-sizer"), h.sizerWidth = null, h.heightForcer = mh("div", null, null, "position: absolute; height: " + Qg + "px; width: 1px;"), h.gutters = mh("div", null, "CodeMirror-gutters"), h.lineGutter = null, h.scroller = mh("div", [h.sizer, h.heightForcer, h.gutters], "CodeMirror-scroll"), h.scroller.setAttribute("tabIndex", "-1"), h.wrapper = mh("div", [h.scrollbarFiller, h.gutterFiller, h.scroller], "CodeMirror"), d && 8 > e && (h.gutters.style.zIndex = -1, h.scroller.style.paddingRight = 0), f || a && n || (h.scroller.draggable = !0), b && (b.appendChild ? b.appendChild(h.wrapper) : b(h.wrapper)), h.viewFrom = h.viewTo = c.first, h.reportedViewFrom = h.reportedViewTo = c.first, h.view = [], h.renderedView = null, h.externalMeasured = null, h.viewOffset = 0, h.lastWrapHeight = h.lastWrapWidth = 0, h.updateLineNumbers = null, h.nativeBarWidth = h.barHeight = h.barWidth = 0, h.scrollbarsClipped = !1, h.lineNumWidth = h.lineNumInnerWidth = h.lineNumChars = null, h.alignWidgets = !1, h.cachedCharWidth = h.cachedTextHeight = h.cachedPaddingH = null, h.maxLine = null, h.maxLineLength = 0, h.maxLineChanged = !1, h.wheelDX = h.wheelDY = h.wheelStartX = h.wheelStartY = null, h.shift = !1, h.selForContextMenu = null, h.activeTouch = null, g.init(h);
  }

  function x(a) {
    a.doc.mode = v.getMode(a.options, a.doc.modeOption), y(a);
  }

  function y(a) {
    a.doc.iter(function (a) {
      a.stateAfter && (a.stateAfter = null), a.styles && (a.styles = null);
    }), a.doc.frontier = a.doc.first, hc(a, 100), a.state.modeGen++, a.curOp && hd(a);
  }

  function z(a) {
    a.options.lineWrapping ? (uh(a.display.wrapper, "CodeMirror-wrap"), a.display.sizer.style.minWidth = "", a.display.sizerWidth = null) : (th(a.display.wrapper, "CodeMirror-wrap"), H(a)), B(a), hd(a), Ec(a), setTimeout(function () {
      N(a);
    }, 100);
  }

  function A(a) {
    var b = Qc(a.display),
        c = a.options.lineWrapping,
        d = c && Math.max(5, a.display.scroller.clientWidth / Rc(a.display) - 3);
    return function (e) {
      if (uf(a.doc, e)) return 0;
      var f = 0;
      if (e.widgets) for (var g = 0; g < e.widgets.length; g++) {
        e.widgets[g].height && (f += e.widgets[g].height);
      }
      return c ? f + (Math.ceil(e.text.length / d) || 1) * b : f + b;
    };
  }

  function B(a) {
    var b = a.doc,
        c = A(a);
    b.iter(function (a) {
      var b = c(a);
      b != a.height && gg(a, b);
    });
  }

  function C(a) {
    a.display.wrapper.className = a.display.wrapper.className.replace(/\s*cm-s-\S+/g, "") + a.options.theme.replace(/(^|\s)\s*/g, " cm-s-"), Ec(a);
  }

  function D(a) {
    E(a), hd(a), setTimeout(function () {
      Q(a);
    }, 20);
  }

  function E(a) {
    var b = a.display.gutters,
        c = a.options.gutters;
    oh(b);

    for (var d = 0; d < c.length; ++d) {
      var e = c[d],
          f = b.appendChild(mh("div", null, "CodeMirror-gutter " + e));
      "CodeMirror-linenumbers" == e && (a.display.lineGutter = f, f.style.width = (a.display.lineNumWidth || 1) + "px");
    }

    b.style.display = d ? "" : "none", F(a);
  }

  function F(a) {
    var b = a.display.gutters.offsetWidth;
    a.display.sizer.style.marginLeft = b + "px";
  }

  function G(a) {
    if (0 == a.height) return 0;

    for (var c, b = a.text.length, d = a; c = nf(d);) {
      var e = c.find(0, !0);
      d = e.from.line, b += e.from.ch - e.to.ch;
    }

    for (d = a; c = of(d);) {
      var e = c.find(0, !0);
      b -= d.text.length - e.from.ch, d = e.to.line, b += d.text.length - e.to.ch;
    }

    return b;
  }

  function H(a) {
    var b = a.display,
        c = a.doc;
    b.maxLine = dg(c, c.first), b.maxLineLength = G(b.maxLine), b.maxLineChanged = !0, c.iter(function (a) {
      var c = G(a);
      c > b.maxLineLength && (b.maxLineLength = c, b.maxLine = a);
    });
  }

  function I(a) {
    var b = ah(a.gutters, "CodeMirror-linenumbers");
    -1 == b && a.lineNumbers ? a.gutters = a.gutters.concat(["CodeMirror-linenumbers"]) : b > -1 && !a.lineNumbers && (a.gutters = a.gutters.slice(0), a.gutters.splice(b, 1));
  }

  function J(a) {
    var b = a.display,
        c = b.gutters.offsetWidth,
        d = Math.round(a.doc.height + mc(a.display));
    return {
      clientHeight: b.scroller.clientHeight,
      viewHeight: b.wrapper.clientHeight,
      scrollWidth: b.scroller.scrollWidth,
      clientWidth: b.scroller.clientWidth,
      viewWidth: b.wrapper.clientWidth,
      barLeft: a.options.fixedGutter ? c : 0,
      docHeight: d,
      scrollHeight: d + oc(a) + b.barHeight,
      nativeBarWidth: b.nativeBarWidth,
      gutterWidth: c
    };
  }

  function K(a, b, c) {
    this.cm = c;
    var f = this.vert = mh("div", [mh("div", null, null, "min-width: 1px")], "CodeMirror-vscrollbar"),
        g = this.horiz = mh("div", [mh("div", null, null, "height: 100%; min-height: 1px")], "CodeMirror-hscrollbar");
    a(f), a(g), Gg(f, "scroll", function () {
      f.clientHeight && b(f.scrollTop, "vertical");
    }), Gg(g, "scroll", function () {
      g.clientWidth && b(g.scrollLeft, "horizontal");
    }), this.checkedOverlay = !1, d && 8 > e && (this.horiz.style.minHeight = this.vert.style.minWidth = "18px");
  }

  function L() {}

  function M(a) {
    a.display.scrollbars && (a.display.scrollbars.clear(), a.display.scrollbars.addClass && th(a.display.wrapper, a.display.scrollbars.addClass)), a.display.scrollbars = new v.scrollbarModel[a.options.scrollbarStyle](function (b) {
      a.display.wrapper.insertBefore(b, a.display.scrollbarFiller), Gg(b, "mousedown", function () {
        a.state.focused && setTimeout(function () {
          a.display.input.focus();
        }, 0);
      }), b.setAttribute("cm-not-content", "true");
    }, function (b, c) {
      "horizontal" == c ? Fd(a, b) : Ed(a, b);
    }, a), a.display.scrollbars.addClass && uh(a.display.wrapper, a.display.scrollbars.addClass);
  }

  function N(a, b) {
    b || (b = J(a));
    var c = a.display.barWidth,
        d = a.display.barHeight;
    O(a, b);

    for (var e = 0; 4 > e && c != a.display.barWidth || d != a.display.barHeight; e++) {
      c != a.display.barWidth && a.options.lineWrapping && $(a), O(a, J(a)), c = a.display.barWidth, d = a.display.barHeight;
    }
  }

  function O(a, b) {
    var c = a.display,
        d = c.scrollbars.update(b);
    c.sizer.style.paddingRight = (c.barWidth = d.right) + "px", c.sizer.style.paddingBottom = (c.barHeight = d.bottom) + "px", d.right && d.bottom ? (c.scrollbarFiller.style.display = "block", c.scrollbarFiller.style.height = d.bottom + "px", c.scrollbarFiller.style.width = d.right + "px") : c.scrollbarFiller.style.display = "", d.bottom && a.options.coverGutterNextToScrollbar && a.options.fixedGutter ? (c.gutterFiller.style.display = "block", c.gutterFiller.style.height = d.bottom + "px", c.gutterFiller.style.width = b.gutterWidth + "px") : c.gutterFiller.style.display = "";
  }

  function P(a, b, c) {
    var d = c && null != c.top ? Math.max(0, c.top) : a.scroller.scrollTop;
    d = Math.floor(d - lc(a));
    var e = c && null != c.bottom ? c.bottom : d + a.wrapper.clientHeight,
        f = ig(b, d),
        g = ig(b, e);

    if (c && c.ensure) {
      var h = c.ensure.from.line,
          i = c.ensure.to.line;
      f > h ? (f = h, g = ig(b, jg(dg(b, h)) + a.wrapper.clientHeight)) : Math.min(i, b.lastLine()) >= g && (f = ig(b, jg(dg(b, i)) - a.wrapper.clientHeight), g = i);
    }

    return {
      from: f,
      to: Math.max(g, f + 1)
    };
  }

  function Q(a) {
    var b = a.display,
        c = b.view;

    if (b.alignWidgets || b.gutters.firstChild && a.options.fixedGutter) {
      for (var d = T(b) - b.scroller.scrollLeft + a.doc.scrollLeft, e = b.gutters.offsetWidth, f = d + "px", g = 0; g < c.length; g++) {
        if (!c[g].hidden) {
          a.options.fixedGutter && c[g].gutter && (c[g].gutter.style.left = f);
          var h = c[g].alignable;
          if (h) for (var i = 0; i < h.length; i++) {
            h[i].style.left = f;
          }
        }
      }

      a.options.fixedGutter && (b.gutters.style.left = d + e + "px");
    }
  }

  function R(a) {
    if (!a.options.lineNumbers) return !1;
    var b = a.doc,
        c = S(a.options, b.first + b.size - 1),
        d = a.display;

    if (c.length != d.lineNumChars) {
      var e = d.measure.appendChild(mh("div", [mh("div", c)], "CodeMirror-linenumber CodeMirror-gutter-elt")),
          f = e.firstChild.offsetWidth,
          g = e.offsetWidth - f;
      return d.lineGutter.style.width = "", d.lineNumInnerWidth = Math.max(f, d.lineGutter.offsetWidth - g) + 1, d.lineNumWidth = d.lineNumInnerWidth + g, d.lineNumChars = d.lineNumInnerWidth ? c.length : -1, d.lineGutter.style.width = d.lineNumWidth + "px", F(a), !0;
    }

    return !1;
  }

  function S(a, b) {
    return String(a.lineNumberFormatter(b + a.firstLineNumber));
  }

  function T(a) {
    return a.scroller.getBoundingClientRect().left - a.sizer.getBoundingClientRect().left;
  }

  function U(a, b, c) {
    var d = a.display;
    this.viewport = b, this.visible = P(d, a.doc, b), this.editorIsHidden = !d.wrapper.offsetWidth, this.wrapperHeight = d.wrapper.clientHeight, this.wrapperWidth = d.wrapper.clientWidth, this.oldDisplayWidth = pc(a), this.force = c, this.dims = ab(a), this.events = [];
  }

  function V(a) {
    var b = a.display;
    !b.scrollbarsClipped && b.scroller.offsetWidth && (b.nativeBarWidth = b.scroller.offsetWidth - b.scroller.clientWidth, b.heightForcer.style.height = oc(a) + "px", b.sizer.style.marginBottom = -b.nativeBarWidth + "px", b.sizer.style.borderRightWidth = oc(a) + "px", b.scrollbarsClipped = !0);
  }

  function W(a, b) {
    var c = a.display,
        d = a.doc;
    if (b.editorIsHidden) return jd(a), !1;
    if (!b.force && b.visible.from >= c.viewFrom && b.visible.to <= c.viewTo && (null == c.updateLineNumbers || c.updateLineNumbers >= c.viewTo) && c.renderedView == c.view && 0 == nd(a)) return !1;
    R(a) && (jd(a), b.dims = ab(a));
    var e = d.first + d.size,
        f = Math.max(b.visible.from - a.options.viewportMargin, d.first),
        g = Math.min(e, b.visible.to + a.options.viewportMargin);
    c.viewFrom < f && f - c.viewFrom < 20 && (f = Math.max(d.first, c.viewFrom)), c.viewTo > g && c.viewTo - g < 20 && (g = Math.min(e, c.viewTo)), u && (f = sf(a.doc, f), g = tf(a.doc, g));
    var h = f != c.viewFrom || g != c.viewTo || c.lastWrapHeight != b.wrapperHeight || c.lastWrapWidth != b.wrapperWidth;
    md(a, f, g), c.viewOffset = jg(dg(a.doc, c.viewFrom)), a.display.mover.style.top = c.viewOffset + "px";
    var i = nd(a);
    if (!h && 0 == i && !b.force && c.renderedView == c.view && (null == c.updateLineNumbers || c.updateLineNumbers >= c.viewTo)) return !1;
    var j = rh();
    return i > 4 && (c.lineDiv.style.display = "none"), bb(a, c.updateLineNumbers, b.dims), i > 4 && (c.lineDiv.style.display = ""), c.renderedView = c.view, j && rh() != j && j.offsetHeight && j.focus(), oh(c.cursorDiv), oh(c.selectionDiv), c.gutters.style.height = 0, h && (c.lastWrapHeight = b.wrapperHeight, c.lastWrapWidth = b.wrapperWidth, hc(a, 400)), c.updateLineNumbers = null, !0;
  }

  function X(a, b) {
    for (var c = b.viewport, d = !0; (d && a.options.lineWrapping && b.oldDisplayWidth != pc(a) || (c && null != c.top && (c = {
      top: Math.min(a.doc.height + mc(a.display) - qc(a), c.top)
    }), b.visible = P(a.display, a.doc, c), !(b.visible.from >= a.display.viewFrom && b.visible.to <= a.display.viewTo))) && W(a, b); d = !1) {
      $(a);
      var e = J(a);
      cc(a), Z(a, e), N(a, e);
    }

    b.signal(a, "update", a), (a.display.viewFrom != a.display.reportedViewFrom || a.display.viewTo != a.display.reportedViewTo) && (b.signal(a, "viewportChange", a, a.display.viewFrom, a.display.viewTo), a.display.reportedViewFrom = a.display.viewFrom, a.display.reportedViewTo = a.display.viewTo);
  }

  function Y(a, b) {
    var c = new U(a, b);

    if (W(a, c)) {
      $(a), X(a, c);
      var d = J(a);
      cc(a), Z(a, d), N(a, d), c.finish();
    }
  }

  function Z(a, b) {
    a.display.sizer.style.minHeight = b.docHeight + "px";
    var c = b.docHeight + a.display.barHeight;
    a.display.heightForcer.style.top = c + "px", a.display.gutters.style.height = Math.max(c + oc(a), b.clientHeight) + "px";
  }

  function $(a) {
    for (var b = a.display, c = b.lineDiv.offsetTop, f = 0; f < b.view.length; f++) {
      var h,
          g = b.view[f];

      if (!g.hidden) {
        if (d && 8 > e) {
          var i = g.node.offsetTop + g.node.offsetHeight;
          h = i - c, c = i;
        } else {
          var j = g.node.getBoundingClientRect();
          h = j.bottom - j.top;
        }

        var k = g.line.height - h;
        if (2 > h && (h = Qc(b)), (k > .001 || -.001 > k) && (gg(g.line, h), _(g.line), g.rest)) for (var l = 0; l < g.rest.length; l++) {
          _(g.rest[l]);
        }
      }
    }
  }

  function _(a) {
    if (a.widgets) for (var b = 0; b < a.widgets.length; ++b) {
      a.widgets[b].height = a.widgets[b].node.offsetHeight;
    }
  }

  function ab(a) {
    for (var b = a.display, c = {}, d = {}, e = b.gutters.clientLeft, f = b.gutters.firstChild, g = 0; f; f = f.nextSibling, ++g) {
      c[a.options.gutters[g]] = f.offsetLeft + f.clientLeft + e, d[a.options.gutters[g]] = f.clientWidth;
    }

    return {
      fixedPos: T(b),
      gutterTotalWidth: b.gutters.offsetWidth,
      gutterLeft: c,
      gutterWidth: d,
      wrapperWidth: b.wrapper.clientWidth
    };
  }

  function bb(a, b, c) {
    function i(b) {
      var c = b.nextSibling;
      return f && o && a.display.currentWheelTarget == b ? b.style.display = "none" : b.parentNode.removeChild(b), c;
    }

    for (var d = a.display, e = a.options.lineNumbers, g = d.lineDiv, h = g.firstChild, j = d.view, k = d.viewFrom, l = 0; l < j.length; l++) {
      var m = j[l];
      if (m.hidden) ;else if (m.node && m.node.parentNode == g) {
        for (; h != m.node;) {
          h = i(h);
        }

        var p = e && null != b && k >= b && m.lineNumber;
        m.changes && (ah(m.changes, "gutter") > -1 && (p = !1), cb(a, m, k, c)), p && (oh(m.lineNumber), m.lineNumber.appendChild(document.createTextNode(S(a.options, k)))), h = m.node.nextSibling;
      } else {
        var n = kb(a, m, k, c);
        g.insertBefore(n, h);
      }
      k += m.size;
    }

    for (; h;) {
      h = i(h);
    }
  }

  function cb(a, b, c, d) {
    for (var e = 0; e < b.changes.length; e++) {
      var f = b.changes[e];
      "text" == f ? gb(a, b) : "gutter" == f ? ib(a, b, c, d) : "class" == f ? hb(b) : "widget" == f && jb(a, b, d);
    }

    b.changes = null;
  }

  function db(a) {
    return a.node == a.text && (a.node = mh("div", null, null, "position: relative"), a.text.parentNode && a.text.parentNode.replaceChild(a.node, a.text), a.node.appendChild(a.text), d && 8 > e && (a.node.style.zIndex = 2)), a.node;
  }

  function eb(a) {
    var b = a.bgClass ? a.bgClass + " " + (a.line.bgClass || "") : a.line.bgClass;
    if (b && (b += " CodeMirror-linebackground"), a.background) b ? a.background.className = b : (a.background.parentNode.removeChild(a.background), a.background = null);else if (b) {
      var c = db(a);
      a.background = c.insertBefore(mh("div", null, b), c.firstChild);
    }
  }

  function fb(a, b) {
    var c = a.display.externalMeasured;
    return c && c.line == b.line ? (a.display.externalMeasured = null, b.measure = c.measure, c.built) : Of(a, b);
  }

  function gb(a, b) {
    var c = b.text.className,
        d = fb(a, b);
    b.text == b.node && (b.node = d.pre), b.text.parentNode.replaceChild(d.pre, b.text), b.text = d.pre, d.bgClass != b.bgClass || d.textClass != b.textClass ? (b.bgClass = d.bgClass, b.textClass = d.textClass, hb(b)) : c && (b.text.className = c);
  }

  function hb(a) {
    eb(a), a.line.wrapClass ? db(a).className = a.line.wrapClass : a.node != a.text && (a.node.className = "");
    var b = a.textClass ? a.textClass + " " + (a.line.textClass || "") : a.line.textClass;
    a.text.className = b || "";
  }

  function ib(a, b, c, d) {
    b.gutter && (b.node.removeChild(b.gutter), b.gutter = null);
    var e = b.line.gutterMarkers;

    if (a.options.lineNumbers || e) {
      var f = db(b),
          g = b.gutter = mh("div", null, "CodeMirror-gutter-wrapper", "left: " + (a.options.fixedGutter ? d.fixedPos : -d.gutterTotalWidth) + "px; width: " + d.gutterTotalWidth + "px");
      if (a.display.input.setUneditable(g), f.insertBefore(g, b.text), b.line.gutterClass && (g.className += " " + b.line.gutterClass), !a.options.lineNumbers || e && e["CodeMirror-linenumbers"] || (b.lineNumber = g.appendChild(mh("div", S(a.options, c), "CodeMirror-linenumber CodeMirror-gutter-elt", "left: " + d.gutterLeft["CodeMirror-linenumbers"] + "px; width: " + a.display.lineNumInnerWidth + "px"))), e) for (var h = 0; h < a.options.gutters.length; ++h) {
        var i = a.options.gutters[h],
            j = e.hasOwnProperty(i) && e[i];
        j && g.appendChild(mh("div", [j], "CodeMirror-gutter-elt", "left: " + d.gutterLeft[i] + "px; width: " + d.gutterWidth[i] + "px"));
      }
    }
  }

  function jb(a, b, c) {
    b.alignable && (b.alignable = null);

    for (var e, d = b.node.firstChild; d; d = e) {
      var e = d.nextSibling;
      "CodeMirror-linewidget" == d.className && b.node.removeChild(d);
    }

    lb(a, b, c);
  }

  function kb(a, b, c, d) {
    var e = fb(a, b);
    return b.text = b.node = e.pre, e.bgClass && (b.bgClass = e.bgClass), e.textClass && (b.textClass = e.textClass), hb(b), ib(a, b, c, d), lb(a, b, d), b.node;
  }

  function lb(a, b, c) {
    if (mb(a, b.line, b, c, !0), b.rest) for (var d = 0; d < b.rest.length; d++) {
      mb(a, b.rest[d], b, c, !1);
    }
  }

  function mb(a, b, c, d, e) {
    if (b.widgets) for (var f = db(c), g = 0, h = b.widgets; g < h.length; ++g) {
      var i = h[g],
          j = mh("div", [i.node], "CodeMirror-linewidget");
      i.handleMouseEvents || j.setAttribute("cm-ignore-events", "true"), nb(i, j, c, d), a.display.input.setUneditable(j), e && i.above ? f.insertBefore(j, c.gutter || c.text) : f.appendChild(j), Kg(i, "redraw");
    }
  }

  function nb(a, b, c, d) {
    if (a.noHScroll) {
      (c.alignable || (c.alignable = [])).push(b);
      var e = d.wrapperWidth;
      b.style.left = d.fixedPos + "px", a.coverGutter || (e -= d.gutterTotalWidth, b.style.paddingLeft = d.gutterTotalWidth + "px"), b.style.width = e + "px";
    }

    a.coverGutter && (b.style.zIndex = 5, b.style.position = "relative", a.noHScroll || (b.style.marginLeft = -d.gutterTotalWidth + "px"));
  }

  function qb(a) {
    return ob(a.line, a.ch);
  }

  function rb(a, b) {
    return pb(a, b) < 0 ? b : a;
  }

  function sb(a, b) {
    return pb(a, b) < 0 ? a : b;
  }

  function tb(a) {
    a.state.focused || (a.display.input.focus(), Wd(a));
  }

  function ub(a) {
    return a.options.readOnly || a.doc.cantEdit;
  }

  function wb(a, b, c, d, e) {
    var f = a.doc;
    a.display.shift = !1, d || (d = f.sel);
    var g = Fh(b),
        h = null;
    a.state.pasteIncoming && d.ranges.length > 1 && (vb && vb.join("\n") == b ? h = 0 == d.ranges.length % vb.length && bh(vb, Fh) : g.length == d.ranges.length && (h = bh(g, function (a) {
      return [a];
    })));

    for (var i = d.ranges.length - 1; i >= 0; i--) {
      var j = d.ranges[i],
          k = j.from(),
          l = j.to();
      j.empty() && (c && c > 0 ? k = ob(k.line, k.ch - c) : a.state.overwrite && !a.state.pasteIncoming && (l = ob(l.line, Math.min(dg(f, l.line).text.length, l.ch + $g(g).length))));
      var m = a.curOp.updateInput,
          n = {
        from: k,
        to: l,
        text: h ? h[i % h.length] : g,
        origin: e || (a.state.pasteIncoming ? "paste" : a.state.cutIncoming ? "cut" : "+input")
      };
      ee(a.doc, n), Kg(a, "inputRead", a, n);
    }

    b && !a.state.pasteIncoming && xb(a, b), qe(a), a.curOp.updateInput = m, a.curOp.typing = !0, a.state.pasteIncoming = a.state.cutIncoming = !1;
  }

  function xb(a, b) {
    if (a.options.electricChars && a.options.smartIndent) for (var c = a.doc.sel, d = c.ranges.length - 1; d >= 0; d--) {
      var e = c.ranges[d];

      if (!(e.head.ch > 100 || d && c.ranges[d - 1].head.line == e.head.line)) {
        var f = a.getModeAt(e.head),
            g = !1;

        if (f.electricChars) {
          for (var h = 0; h < f.electricChars.length; h++) {
            if (b.indexOf(f.electricChars.charAt(h)) > -1) {
              g = se(a, e.head.line, "smart");
              break;
            }
          }
        } else f.electricInput && f.electricInput.test(dg(a.doc, e.head.line).text.slice(0, e.head.ch)) && (g = se(a, e.head.line, "smart"));

        g && Kg(a, "electricInput", a, e.head.line);
      }
    }
  }

  function yb(a) {
    for (var b = [], c = [], d = 0; d < a.doc.sel.ranges.length; d++) {
      var e = a.doc.sel.ranges[d].head.line,
          f = {
        anchor: ob(e, 0),
        head: ob(e + 1, 0)
      };
      c.push(f), b.push(a.getRange(f.anchor, f.head));
    }

    return {
      text: b,
      ranges: c
    };
  }

  function zb(a) {
    a.setAttribute("autocorrect", "off"), a.setAttribute("autocapitalize", "off"), a.setAttribute("spellcheck", "false");
  }

  function Ab(a) {
    this.cm = a, this.prevInput = "", this.pollingFast = !1, this.polling = new Vg(), this.inaccurateSelection = !1, this.hasSelection = !1, this.composing = null;
  }

  function Bb() {
    var a = mh("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em; outline: none"),
        b = mh("div", [a], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    return f ? a.style.width = "1000px" : a.setAttribute("wrap", "off"), m && (a.style.border = "1px solid black"), zb(a), b;
  }

  function Cb(a) {
    this.cm = a, this.lastAnchorNode = this.lastAnchorOffset = this.lastFocusNode = this.lastFocusOffset = null, this.polling = new Vg(), this.gracePeriod = !1;
  }

  function Db(a, b) {
    var c = vc(a, b.line);
    if (!c || c.hidden) return null;
    var d = dg(a.doc, b.line),
        e = sc(c, d, b.line),
        f = kg(d),
        g = "left";

    if (f) {
      var h = Vh(f, b.ch);
      g = h % 2 ? "right" : "left";
    }

    var i = zc(e.map, b.ch, g);
    return i.offset = "right" == i.collapse ? i.end : i.start, i;
  }

  function Eb(a, b) {
    return b && (a.bad = !0), a;
  }

  function Fb(a, b, c) {
    var d;

    if (b == a.display.lineDiv) {
      if (d = a.display.lineDiv.childNodes[c], !d) return Eb(a.clipPos(ob(a.display.viewTo - 1)), !0);
      b = null, c = 0;
    } else for (d = b;; d = d.parentNode) {
      if (!d || d == a.display.lineDiv) return null;
      if (d.parentNode && d.parentNode == a.display.lineDiv) break;
    }

    for (var e = 0; e < a.display.view.length; e++) {
      var f = a.display.view[e];
      if (f.node == d) return Gb(f, b, c);
    }
  }

  function Gb(a, b, c) {
    function k(b, c, d) {
      for (var e = -1; e < (j ? j.length : 0); e++) {
        for (var f = 0 > e ? i.map : j[e], g = 0; g < f.length; g += 3) {
          var h = f[g + 2];

          if (h == b || h == c) {
            var k = hg(0 > e ? a.line : a.rest[e]),
                l = f[g] + d;
            return (0 > d || h != b) && (l = f[g + (d ? 1 : 0)]), ob(k, l);
          }
        }
      }
    }

    var d = a.text.firstChild,
        e = !1;
    if (!b || !qh(d, b)) return Eb(ob(hg(a.line), 0), !0);

    if (b == d && (e = !0, b = d.childNodes[c], c = 0, !b)) {
      var f = a.rest ? $g(a.rest) : a.line;
      return Eb(ob(hg(f), f.text.length), e);
    }

    var g = 3 == b.nodeType ? b : null,
        h = b;

    for (g || 1 != b.childNodes.length || 3 != b.firstChild.nodeType || (g = b.firstChild, c && (c = g.nodeValue.length)); h.parentNode != d;) {
      h = h.parentNode;
    }

    var i = a.measure,
        j = i.maps,
        l = k(g, h, c);
    if (l) return Eb(l, e);

    for (var m = h.nextSibling, n = g ? g.nodeValue.length - c : 0; m; m = m.nextSibling) {
      if (l = k(m, m.firstChild, 0)) return Eb(ob(l.line, l.ch - n), e);
      n += m.textContent.length;
    }

    for (var o = h.previousSibling, n = c; o; o = o.previousSibling) {
      if (l = k(o, o.firstChild, -1)) return Eb(ob(l.line, l.ch + n), e);
      n += m.textContent.length;
    }
  }

  function Hb(a, b, c, d, e) {
    function h(a) {
      return function (b) {
        return b.id == a;
      };
    }

    function i(b) {
      if (1 == b.nodeType) {
        var c = b.getAttribute("cm-text");
        if (null != c) return "" == c && (c = b.textContent.replace(/\u200b/g, "")), f += c, void 0;
        var k,
            j = b.getAttribute("cm-marker");

        if (j) {
          var l = a.findMarks(ob(d, 0), ob(e + 1, 0), h(+j));
          return l.length && (k = l[0].find()) && (f += eg(a.doc, k.from, k.to).join("\n")), void 0;
        }

        if ("false" == b.getAttribute("contenteditable")) return;

        for (var m = 0; m < b.childNodes.length; m++) {
          i(b.childNodes[m]);
        }

        /^(pre|div|p)$/i.test(b.nodeName) && (g = !0);
      } else if (3 == b.nodeType) {
        var n = b.nodeValue;
        if (!n) return;
        g && (f += "\n", g = !1), f += n;
      }
    }

    for (var f = "", g = !1; i(b), b != c;) {
      b = b.nextSibling;
    }

    return f;
  }

  function Ib(a, b) {
    this.ranges = a, this.primIndex = b;
  }

  function Jb(a, b) {
    this.anchor = a, this.head = b;
  }

  function Kb(a, b) {
    var c = a[b];
    a.sort(function (a, b) {
      return pb(a.from(), b.from());
    }), b = ah(a, c);

    for (var d = 1; d < a.length; d++) {
      var e = a[d],
          f = a[d - 1];

      if (pb(f.to(), e.from()) >= 0) {
        var g = sb(f.from(), e.from()),
            h = rb(f.to(), e.to()),
            i = f.empty() ? e.from() == e.head : f.from() == f.head;
        b >= d && --b, a.splice(--d, 2, new Jb(i ? h : g, i ? g : h));
      }
    }

    return new Ib(a, b);
  }

  function Lb(a, b) {
    return new Ib([new Jb(a, b || a)], 0);
  }

  function Mb(a, b) {
    return Math.max(a.first, Math.min(b, a.first + a.size - 1));
  }

  function Nb(a, b) {
    if (b.line < a.first) return ob(a.first, 0);
    var c = a.first + a.size - 1;
    return b.line > c ? ob(c, dg(a, c).text.length) : Ob(b, dg(a, b.line).text.length);
  }

  function Ob(a, b) {
    var c = a.ch;
    return null == c || c > b ? ob(a.line, b) : 0 > c ? ob(a.line, 0) : a;
  }

  function Pb(a, b) {
    return b >= a.first && b < a.first + a.size;
  }

  function Qb(a, b) {
    for (var c = [], d = 0; d < b.length; d++) {
      c[d] = Nb(a, b[d]);
    }

    return c;
  }

  function Rb(a, b, c, d) {
    if (a.cm && a.cm.display.shift || a.extend) {
      var e = b.anchor;

      if (d) {
        var f = pb(c, e) < 0;
        f != pb(d, e) < 0 ? (e = c, c = d) : f != pb(c, d) < 0 && (c = d);
      }

      return new Jb(e, c);
    }

    return new Jb(d || c, c);
  }

  function Sb(a, b, c, d) {
    Yb(a, new Ib([Rb(a, a.sel.primary(), b, c)], 0), d);
  }

  function Tb(a, b, c) {
    for (var d = [], e = 0; e < a.sel.ranges.length; e++) {
      d[e] = Rb(a, a.sel.ranges[e], b[e], null);
    }

    var f = Kb(d, a.sel.primIndex);
    Yb(a, f, c);
  }

  function Ub(a, b, c, d) {
    var e = a.sel.ranges.slice(0);
    e[b] = c, Yb(a, Kb(e, a.sel.primIndex), d);
  }

  function Vb(a, b, c, d) {
    Yb(a, Lb(b, c), d);
  }

  function Wb(a, b) {
    var c = {
      ranges: b.ranges,
      update: function update(b) {
        this.ranges = [];

        for (var c = 0; c < b.length; c++) {
          this.ranges[c] = new Jb(Nb(a, b[c].anchor), Nb(a, b[c].head));
        }
      }
    };
    return Ig(a, "beforeSelectionChange", a, c), a.cm && Ig(a.cm, "beforeSelectionChange", a.cm, c), c.ranges != b.ranges ? Kb(c.ranges, c.ranges.length - 1) : b;
  }

  function Xb(a, b, c) {
    var d = a.history.done,
        e = $g(d);
    e && e.ranges ? (d[d.length - 1] = b, Zb(a, b, c)) : Yb(a, b, c);
  }

  function Yb(a, b, c) {
    Zb(a, b, c), rg(a, a.sel, a.cm ? a.cm.curOp.id : 0 / 0, c);
  }

  function Zb(a, b, c) {
    (Og(a, "beforeSelectionChange") || a.cm && Og(a.cm, "beforeSelectionChange")) && (b = Wb(a, b));
    var d = c && c.bias || (pb(b.primary().head, a.sel.primary().head) < 0 ? -1 : 1);
    $b(a, ac(a, b, d, !0)), c && c.scroll === !1 || !a.cm || qe(a.cm);
  }

  function $b(a, b) {
    b.equals(a.sel) || (a.sel = b, a.cm && (a.cm.curOp.updateInput = a.cm.curOp.selectionChanged = !0, Ng(a.cm)), Kg(a, "cursorActivity", a));
  }

  function _b(a) {
    $b(a, ac(a, a.sel, null, !1), Sg);
  }

  function ac(a, b, c, d) {
    for (var e, f = 0; f < b.ranges.length; f++) {
      var g = b.ranges[f],
          h = bc(a, g.anchor, c, d),
          i = bc(a, g.head, c, d);
      (e || h != g.anchor || i != g.head) && (e || (e = b.ranges.slice(0, f)), e[f] = new Jb(h, i));
    }

    return e ? Kb(e, b.primIndex) : b;
  }

  function bc(a, b, c, d) {
    var e = !1,
        f = b,
        g = c || 1;
    a.cantEdit = !1;

    a: for (;;) {
      var h = dg(a, f.line);
      if (h.markedSpans) for (var i = 0; i < h.markedSpans.length; ++i) {
        var j = h.markedSpans[i],
            k = j.marker;

        if ((null == j.from || (k.inclusiveLeft ? j.from <= f.ch : j.from < f.ch)) && (null == j.to || (k.inclusiveRight ? j.to >= f.ch : j.to > f.ch))) {
          if (d && (Ig(k, "beforeCursorEnter"), k.explicitlyCleared)) {
            if (h.markedSpans) {
              --i;
              continue;
            }

            break;
          }

          if (!k.atomic) continue;
          var l = k.find(0 > g ? -1 : 1);

          if (0 == pb(l, f) && (l.ch += g, l.ch < 0 ? l = l.line > a.first ? Nb(a, ob(l.line - 1)) : null : l.ch > h.text.length && (l = l.line < a.first + a.size - 1 ? ob(l.line + 1, 0) : null), !l)) {
            if (e) return d ? (a.cantEdit = !0, ob(a.first, 0)) : bc(a, b, c, !0);
            e = !0, l = b, g = -g;
          }

          f = l;
          continue a;
        }
      }
      return f;
    }
  }

  function cc(a) {
    a.display.input.showSelection(a.display.input.prepareSelection());
  }

  function dc(a, b) {
    for (var c = a.doc, d = {}, e = d.cursors = document.createDocumentFragment(), f = d.selection = document.createDocumentFragment(), g = 0; g < c.sel.ranges.length; g++) {
      if (b !== !1 || g != c.sel.primIndex) {
        var h = c.sel.ranges[g],
            i = h.empty();
        (i || a.options.showCursorWhenSelecting) && ec(a, h, e), i || fc(a, h, f);
      }
    }

    return d;
  }

  function ec(a, b, c) {
    var d = Kc(a, b.head, "div", null, null, !a.options.singleCursorHeightPerLine),
        e = c.appendChild(mh("div", "\xa0", "CodeMirror-cursor"));

    if (e.style.left = d.left + "px", e.style.top = d.top + "px", e.style.height = Math.max(0, d.bottom - d.top) * a.options.cursorHeight + "px", d.other) {
      var f = c.appendChild(mh("div", "\xa0", "CodeMirror-cursor CodeMirror-secondarycursor"));
      f.style.display = "", f.style.left = d.other.left + "px", f.style.top = d.other.top + "px", f.style.height = .85 * (d.other.bottom - d.other.top) + "px";
    }
  }

  function fc(a, b, c) {
    function j(a, b, c, d) {
      0 > b && (b = 0), b = Math.round(b), d = Math.round(d), f.appendChild(mh("div", null, "CodeMirror-selected", "position: absolute; left: " + a + "px; top: " + b + "px; width: " + (null == c ? i - a : c) + "px; height: " + (d - b) + "px"));
    }

    function k(b, c, d) {
      function m(c, d) {
        return Jc(a, ob(b, c), "div", f, d);
      }

      var k,
          l,
          f = dg(e, b),
          g = f.text.length;
      return Lh(kg(f), c || 0, null == d ? g : d, function (a, b, e) {
        var n,
            o,
            p,
            f = m(a, "left");
        if (a == b) n = f, o = p = f.left;else {
          if (n = m(b - 1, "right"), "rtl" == e) {
            var q = f;
            f = n, n = q;
          }

          o = f.left, p = n.right;
        }
        null == c && 0 == a && (o = h), n.top - f.top > 3 && (j(o, f.top, null, f.bottom), o = h, f.bottom < n.top && j(o, f.bottom, null, n.top)), null == d && b == g && (p = i), (!k || f.top < k.top || f.top == k.top && f.left < k.left) && (k = f), (!l || n.bottom > l.bottom || n.bottom == l.bottom && n.right > l.right) && (l = n), h + 1 > o && (o = h), j(o, n.top, p - o, n.bottom);
      }), {
        start: k,
        end: l
      };
    }

    var d = a.display,
        e = a.doc,
        f = document.createDocumentFragment(),
        g = nc(a.display),
        h = g.left,
        i = Math.max(d.sizerWidth, pc(a) - d.sizer.offsetLeft) - g.right,
        l = b.from(),
        m = b.to();
    if (l.line == m.line) k(l.line, l.ch, m.ch);else {
      var n = dg(e, l.line),
          o = dg(e, m.line),
          p = qf(n) == qf(o),
          q = k(l.line, l.ch, p ? n.text.length + 1 : null).end,
          r = k(m.line, p ? 0 : null, m.ch).start;
      p && (q.top < r.top - 2 ? (j(q.right, q.top, null, q.bottom), j(h, r.top, r.left, r.bottom)) : j(q.right, q.top, r.left - q.right, q.bottom)), q.bottom < r.top && j(h, q.bottom, null, r.top);
    }
    c.appendChild(f);
  }

  function gc(a) {
    if (a.state.focused) {
      var b = a.display;
      clearInterval(b.blinker);
      var c = !0;
      b.cursorDiv.style.visibility = "", a.options.cursorBlinkRate > 0 ? b.blinker = setInterval(function () {
        b.cursorDiv.style.visibility = (c = !c) ? "" : "hidden";
      }, a.options.cursorBlinkRate) : a.options.cursorBlinkRate < 0 && (b.cursorDiv.style.visibility = "hidden");
    }
  }

  function hc(a, b) {
    a.doc.mode.startState && a.doc.frontier < a.display.viewTo && a.state.highlight.set(b, fh(ic, a));
  }

  function ic(a) {
    var b = a.doc;

    if (b.frontier < b.first && (b.frontier = b.first), !(b.frontier >= a.display.viewTo)) {
      var c = +new Date() + a.options.workTime,
          d = Ge(b.mode, kc(a, b.frontier)),
          e = [];
      b.iter(b.frontier, Math.min(b.first + b.size, a.display.viewTo + 500), function (f) {
        if (b.frontier >= a.display.viewFrom) {
          var g = f.styles,
              h = If(a, f, d, !0);
          f.styles = h.styles;
          var i = f.styleClasses,
              j = h.classes;
          j ? f.styleClasses = j : i && (f.styleClasses = null);

          for (var k = !g || g.length != f.styles.length || i != j && (!i || !j || i.bgClass != j.bgClass || i.textClass != j.textClass), l = 0; !k && l < g.length; ++l) {
            k = g[l] != f.styles[l];
          }

          k && e.push(b.frontier), f.stateAfter = Ge(b.mode, d);
        } else Kf(a, f.text, d), f.stateAfter = 0 == b.frontier % 5 ? Ge(b.mode, d) : null;

        return ++b.frontier, +new Date() > c ? (hc(a, a.options.workDelay), !0) : void 0;
      }), e.length && bd(a, function () {
        for (var b = 0; b < e.length; b++) {
          id(a, e[b], "text");
        }
      });
    }
  }

  function jc(a, b, c) {
    for (var d, e, f = a.doc, g = c ? -1 : b - (a.doc.mode.innerMode ? 1e3 : 100), h = b; h > g; --h) {
      if (h <= f.first) return f.first;
      var i = dg(f, h - 1);
      if (i.stateAfter && (!c || h <= f.frontier)) return h;
      var j = Wg(i.text, null, a.options.tabSize);
      (null == e || d > j) && (e = h - 1, d = j);
    }

    return e;
  }

  function kc(a, b, c) {
    var d = a.doc,
        e = a.display;
    if (!d.mode.startState) return !0;
    var f = jc(a, b, c),
        g = f > d.first && dg(d, f - 1).stateAfter;
    return g = g ? Ge(d.mode, g) : He(d.mode), d.iter(f, b, function (c) {
      Kf(a, c.text, g);
      var h = f == b - 1 || 0 == f % 5 || f >= e.viewFrom && f < e.viewTo;
      c.stateAfter = h ? Ge(d.mode, g) : null, ++f;
    }), c && (d.frontier = f), g;
  }

  function lc(a) {
    return a.lineSpace.offsetTop;
  }

  function mc(a) {
    return a.mover.offsetHeight - a.lineSpace.offsetHeight;
  }

  function nc(a) {
    if (a.cachedPaddingH) return a.cachedPaddingH;
    var b = ph(a.measure, mh("pre", "x")),
        c = window.getComputedStyle ? window.getComputedStyle(b) : b.currentStyle,
        d = {
      left: parseInt(c.paddingLeft),
      right: parseInt(c.paddingRight)
    };
    return isNaN(d.left) || isNaN(d.right) || (a.cachedPaddingH = d), d;
  }

  function oc(a) {
    return Qg - a.display.nativeBarWidth;
  }

  function pc(a) {
    return a.display.scroller.clientWidth - oc(a) - a.display.barWidth;
  }

  function qc(a) {
    return a.display.scroller.clientHeight - oc(a) - a.display.barHeight;
  }

  function rc(a, b, c) {
    var d = a.options.lineWrapping,
        e = d && pc(a);

    if (!b.measure.heights || d && b.measure.width != e) {
      var f = b.measure.heights = [];

      if (d) {
        b.measure.width = e;

        for (var g = b.text.firstChild.getClientRects(), h = 0; h < g.length - 1; h++) {
          var i = g[h],
              j = g[h + 1];
          Math.abs(i.bottom - j.bottom) > 2 && f.push((i.bottom + j.top) / 2 - c.top);
        }
      }

      f.push(c.bottom - c.top);
    }
  }

  function sc(a, b, c) {
    if (a.line == b) return {
      map: a.measure.map,
      cache: a.measure.cache
    };

    for (var d = 0; d < a.rest.length; d++) {
      if (a.rest[d] == b) return {
        map: a.measure.maps[d],
        cache: a.measure.caches[d]
      };
    }

    for (var d = 0; d < a.rest.length; d++) {
      if (hg(a.rest[d]) > c) return {
        map: a.measure.maps[d],
        cache: a.measure.caches[d],
        before: !0
      };
    }
  }

  function tc(a, b) {
    b = qf(b);
    var c = hg(b),
        d = a.display.externalMeasured = new fd(a.doc, b, c);
    d.lineN = c;
    var e = d.built = Of(a, d);
    return d.text = e.pre, ph(a.display.lineMeasure, e.pre), d;
  }

  function uc(a, b, c, d) {
    return xc(a, wc(a, b), c, d);
  }

  function vc(a, b) {
    if (b >= a.display.viewFrom && b < a.display.viewTo) return a.display.view[kd(a, b)];
    var c = a.display.externalMeasured;
    return c && b >= c.lineN && b < c.lineN + c.size ? c : void 0;
  }

  function wc(a, b) {
    var c = hg(b),
        d = vc(a, c);
    d && !d.text ? d = null : d && d.changes && cb(a, d, c, ab(a)), d || (d = tc(a, b));
    var e = sc(d, b, c);
    return {
      line: b,
      view: d,
      rect: null,
      map: e.map,
      cache: e.cache,
      before: e.before,
      hasHeights: !1
    };
  }

  function xc(a, b, c, d, e) {
    b.before && (c = -1);
    var g,
        f = c + (d || "");
    return b.cache.hasOwnProperty(f) ? g = b.cache[f] : (b.rect || (b.rect = b.view.text.getBoundingClientRect()), b.hasHeights || (rc(a, b.view, b.rect), b.hasHeights = !0), g = Ac(a, b, c, d), g.bogus || (b.cache[f] = g)), {
      left: g.left,
      right: g.right,
      top: e ? g.rtop : g.top,
      bottom: e ? g.rbottom : g.bottom
    };
  }

  function zc(a, b, c) {
    for (var d, e, f, g, h = 0; h < a.length; h += 3) {
      var i = a[h],
          j = a[h + 1];

      if (i > b ? (e = 0, f = 1, g = "left") : j > b ? (e = b - i, f = e + 1) : (h == a.length - 3 || b == j && a[h + 3] > b) && (f = j - i, e = f - 1, b >= j && (g = "right")), null != e) {
        if (d = a[h + 2], i == j && c == (d.insertLeft ? "left" : "right") && (g = c), "left" == c && 0 == e) for (; h && a[h - 2] == a[h - 3] && a[h - 1].insertLeft;) {
          d = a[(h -= 3) + 2], g = "left";
        }
        if ("right" == c && e == j - i) for (; h < a.length - 3 && a[h + 3] == a[h + 4] && !a[h + 5].insertLeft;) {
          d = a[(h += 3) + 2], g = "right";
        }
        break;
      }
    }

    return {
      node: d,
      start: e,
      end: f,
      collapse: g,
      coverStart: i,
      coverEnd: j
    };
  }

  function Ac(a, b, c, f) {
    var l,
        g = zc(b.map, c, f),
        h = g.node,
        i = g.start,
        j = g.end,
        k = g.collapse;

    if (3 == h.nodeType) {
      for (var m = 0; 4 > m; m++) {
        for (; i && lh(b.line.text.charAt(g.coverStart + i));) {
          --i;
        }

        for (; g.coverStart + j < g.coverEnd && lh(b.line.text.charAt(g.coverStart + j));) {
          ++j;
        }

        if (d && 9 > e && 0 == i && j == g.coverEnd - g.coverStart) l = h.parentNode.getBoundingClientRect();else if (d && a.options.lineWrapping) {
          var n = nh(h, i, j).getClientRects();
          l = n.length ? n["right" == f ? n.length - 1 : 0] : yc;
        } else l = nh(h, i, j).getBoundingClientRect() || yc;
        if (l.left || l.right || 0 == i) break;
        j = i, i -= 1, k = "right";
      }

      d && 11 > e && (l = Bc(a.display.measure, l));
    } else {
      i > 0 && (k = f = "right");
      var n;
      l = a.options.lineWrapping && (n = h.getClientRects()).length > 1 ? n["right" == f ? n.length - 1 : 0] : h.getBoundingClientRect();
    }

    if (d && 9 > e && !i && (!l || !l.left && !l.right)) {
      var o = h.parentNode.getClientRects()[0];
      l = o ? {
        left: o.left,
        right: o.left + Rc(a.display),
        top: o.top,
        bottom: o.bottom
      } : yc;
    }

    for (var p = l.top - b.rect.top, q = l.bottom - b.rect.top, r = (p + q) / 2, s = b.view.measure.heights, m = 0; m < s.length - 1 && !(r < s[m]); m++) {
      ;
    }

    var t = m ? s[m - 1] : 0,
        u = s[m],
        v = {
      left: ("right" == k ? l.right : l.left) - b.rect.left,
      right: ("left" == k ? l.left : l.right) - b.rect.left,
      top: t,
      bottom: u
    };
    return l.left || l.right || (v.bogus = !0), a.options.singleCursorHeightPerLine || (v.rtop = p, v.rbottom = q), v;
  }

  function Bc(a, b) {
    if (!window.screen || null == screen.logicalXDPI || screen.logicalXDPI == screen.deviceXDPI || !Jh(a)) return b;
    var c = screen.logicalXDPI / screen.deviceXDPI,
        d = screen.logicalYDPI / screen.deviceYDPI;
    return {
      left: b.left * c,
      right: b.right * c,
      top: b.top * d,
      bottom: b.bottom * d
    };
  }

  function Cc(a) {
    if (a.measure && (a.measure.cache = {}, a.measure.heights = null, a.rest)) for (var b = 0; b < a.rest.length; b++) {
      a.measure.caches[b] = {};
    }
  }

  function Dc(a) {
    a.display.externalMeasure = null, oh(a.display.lineMeasure);

    for (var b = 0; b < a.display.view.length; b++) {
      Cc(a.display.view[b]);
    }
  }

  function Ec(a) {
    Dc(a), a.display.cachedCharWidth = a.display.cachedTextHeight = a.display.cachedPaddingH = null, a.options.lineWrapping || (a.display.maxLineChanged = !0), a.display.lineNumChars = null;
  }

  function Fc() {
    return window.pageXOffset || (document.documentElement || document.body).scrollLeft;
  }

  function Gc() {
    return window.pageYOffset || (document.documentElement || document.body).scrollTop;
  }

  function Hc(a, b, c, d) {
    if (b.widgets) for (var e = 0; e < b.widgets.length; ++e) {
      if (b.widgets[e].above) {
        var f = yf(b.widgets[e]);
        c.top += f, c.bottom += f;
      }
    }
    if ("line" == d) return c;
    d || (d = "local");
    var g = jg(b);

    if ("local" == d ? g += lc(a.display) : g -= a.display.viewOffset, "page" == d || "window" == d) {
      var h = a.display.lineSpace.getBoundingClientRect();
      g += h.top + ("window" == d ? 0 : Gc());
      var i = h.left + ("window" == d ? 0 : Fc());
      c.left += i, c.right += i;
    }

    return c.top += g, c.bottom += g, c;
  }

  function Ic(a, b, c) {
    if ("div" == c) return b;
    var d = b.left,
        e = b.top;
    if ("page" == c) d -= Fc(), e -= Gc();else if ("local" == c || !c) {
      var f = a.display.sizer.getBoundingClientRect();
      d += f.left, e += f.top;
    }
    var g = a.display.lineSpace.getBoundingClientRect();
    return {
      left: d - g.left,
      top: e - g.top
    };
  }

  function Jc(a, b, c, d, e) {
    return d || (d = dg(a.doc, b.line)), Hc(a, d, uc(a, d, b.ch, e), c);
  }

  function Kc(a, b, c, d, e, f) {
    function g(b, g) {
      var h = xc(a, e, b, g ? "right" : "left", f);
      return g ? h.left = h.right : h.right = h.left, Hc(a, d, h, c);
    }

    function h(a, b) {
      var c = i[b],
          d = c.level % 2;
      return a == Mh(c) && b && c.level < i[b - 1].level ? (c = i[--b], a = Nh(c) - (c.level % 2 ? 0 : 1), d = !0) : a == Nh(c) && b < i.length - 1 && c.level < i[b + 1].level && (c = i[++b], a = Mh(c) - c.level % 2, d = !1), d && a == c.to && a > c.from ? g(a - 1) : g(a, d);
    }

    d = d || dg(a.doc, b.line), e || (e = wc(a, d));
    var i = kg(d),
        j = b.ch;
    if (!i) return g(j);
    var k = Vh(i, j),
        l = h(j, k);
    return null != Uh && (l.other = h(j, Uh)), l;
  }

  function Lc(a, b) {
    var c = 0,
        b = Nb(a.doc, b);
    a.options.lineWrapping || (c = Rc(a.display) * b.ch);
    var d = dg(a.doc, b.line),
        e = jg(d) + lc(a.display);
    return {
      left: c,
      right: c,
      top: e,
      bottom: e + d.height
    };
  }

  function Mc(a, b, c, d) {
    var e = ob(a, b);
    return e.xRel = d, c && (e.outside = !0), e;
  }

  function Nc(a, b, c) {
    var d = a.doc;
    if (c += a.display.viewOffset, 0 > c) return Mc(d.first, 0, !0, -1);
    var e = ig(d, c),
        f = d.first + d.size - 1;
    if (e > f) return Mc(d.first + d.size - 1, dg(d, f).text.length, !0, 1);
    0 > b && (b = 0);

    for (var g = dg(d, e);;) {
      var h = Oc(a, g, e, b, c),
          i = of(g),
          j = i && i.find(0, !0);
      if (!i || !(h.ch > j.from.ch || h.ch == j.from.ch && h.xRel > 0)) return h;
      e = hg(g = j.to.line);
    }
  }

  function Oc(a, b, c, d, e) {
    function j(d) {
      var e = Kc(a, ob(c, d), "line", b, i);
      return g = !0, f > e.bottom ? e.left - h : f < e.top ? e.left + h : (g = !1, e.left);
    }

    var f = e - jg(b),
        g = !1,
        h = 2 * a.display.wrapper.clientWidth,
        i = wc(a, b),
        k = kg(b),
        l = b.text.length,
        m = Oh(b),
        n = Ph(b),
        o = j(m),
        p = g,
        q = j(n),
        r = g;
    if (d > q) return Mc(c, n, r, 1);

    for (;;) {
      if (k ? n == m || n == Xh(b, m, 1) : 1 >= n - m) {
        for (var s = o > d || q - d >= d - o ? m : n, t = d - (s == m ? o : q); lh(b.text.charAt(s));) {
          ++s;
        }

        var u = Mc(c, s, s == m ? p : r, -1 > t ? -1 : t > 1 ? 1 : 0);
        return u;
      }

      var v = Math.ceil(l / 2),
          w = m + v;

      if (k) {
        w = m;

        for (var x = 0; v > x; ++x) {
          w = Xh(b, w, 1);
        }
      }

      var y = j(w);
      y > d ? (n = w, q = y, (r = g) && (q += 1e3), l = v) : (m = w, o = y, p = g, l -= v);
    }
  }

  function Qc(a) {
    if (null != a.cachedTextHeight) return a.cachedTextHeight;

    if (null == Pc) {
      Pc = mh("pre");

      for (var b = 0; 49 > b; ++b) {
        Pc.appendChild(document.createTextNode("x")), Pc.appendChild(mh("br"));
      }

      Pc.appendChild(document.createTextNode("x"));
    }

    ph(a.measure, Pc);
    var c = Pc.offsetHeight / 50;
    return c > 3 && (a.cachedTextHeight = c), oh(a.measure), c || 1;
  }

  function Rc(a) {
    if (null != a.cachedCharWidth) return a.cachedCharWidth;
    var b = mh("span", "xxxxxxxxxx"),
        c = mh("pre", [b]);
    ph(a.measure, c);
    var d = b.getBoundingClientRect(),
        e = (d.right - d.left) / 10;
    return e > 2 && (a.cachedCharWidth = e), e || 10;
  }

  function Uc(a) {
    a.curOp = {
      cm: a,
      viewChanged: !1,
      startHeight: a.doc.height,
      forceUpdate: !1,
      updateInput: null,
      typing: !1,
      changeObjs: null,
      cursorActivityHandlers: null,
      cursorActivityCalled: 0,
      selectionChanged: !1,
      updateMaxLine: !1,
      scrollLeft: null,
      scrollTop: null,
      scrollToPos: null,
      focus: !1,
      id: ++Tc
    }, Sc ? Sc.ops.push(a.curOp) : a.curOp.ownsGroup = Sc = {
      ops: [a.curOp],
      delayedCallbacks: []
    };
  }

  function Vc(a) {
    var b = a.delayedCallbacks,
        c = 0;

    do {
      for (; c < b.length; c++) {
        b[c]();
      }

      for (var d = 0; d < a.ops.length; d++) {
        var e = a.ops[d];
        if (e.cursorActivityHandlers) for (; e.cursorActivityCalled < e.cursorActivityHandlers.length;) {
          e.cursorActivityHandlers[e.cursorActivityCalled++](e.cm);
        }
      }
    } while (c < b.length);
  }

  function Wc(a) {
    var b = a.curOp,
        c = b.ownsGroup;
    if (c) try {
      Vc(c);
    } finally {
      Sc = null;

      for (var d = 0; d < c.ops.length; d++) {
        c.ops[d].cm.curOp = null;
      }

      Xc(c);
    }
  }

  function Xc(a) {
    for (var b = a.ops, c = 0; c < b.length; c++) {
      Yc(b[c]);
    }

    for (var c = 0; c < b.length; c++) {
      Zc(b[c]);
    }

    for (var c = 0; c < b.length; c++) {
      $c(b[c]);
    }

    for (var c = 0; c < b.length; c++) {
      _c(b[c]);
    }

    for (var c = 0; c < b.length; c++) {
      ad(b[c]);
    }
  }

  function Yc(a) {
    var b = a.cm,
        c = b.display;
    V(b), a.updateMaxLine && H(b), a.mustUpdate = a.viewChanged || a.forceUpdate || null != a.scrollTop || a.scrollToPos && (a.scrollToPos.from.line < c.viewFrom || a.scrollToPos.to.line >= c.viewTo) || c.maxLineChanged && b.options.lineWrapping, a.update = a.mustUpdate && new U(b, a.mustUpdate && {
      top: a.scrollTop,
      ensure: a.scrollToPos
    }, a.forceUpdate);
  }

  function Zc(a) {
    a.updatedDisplay = a.mustUpdate && W(a.cm, a.update);
  }

  function $c(a) {
    var b = a.cm,
        c = b.display;
    a.updatedDisplay && $(b), a.barMeasure = J(b), c.maxLineChanged && !b.options.lineWrapping && (a.adjustWidthTo = uc(b, c.maxLine, c.maxLine.text.length).left + 3, b.display.sizerWidth = a.adjustWidthTo, a.barMeasure.scrollWidth = Math.max(c.scroller.clientWidth, c.sizer.offsetLeft + a.adjustWidthTo + oc(b) + b.display.barWidth), a.maxScrollLeft = Math.max(0, c.sizer.offsetLeft + a.adjustWidthTo - pc(b))), (a.updatedDisplay || a.selectionChanged) && (a.preparedSelection = c.input.prepareSelection());
  }

  function _c(a) {
    var b = a.cm;
    null != a.adjustWidthTo && (b.display.sizer.style.minWidth = a.adjustWidthTo + "px", a.maxScrollLeft < b.doc.scrollLeft && Fd(b, Math.min(b.display.scroller.scrollLeft, a.maxScrollLeft), !0), b.display.maxLineChanged = !1), a.preparedSelection && b.display.input.showSelection(a.preparedSelection), a.updatedDisplay && Z(b, a.barMeasure), (a.updatedDisplay || a.startHeight != b.doc.height) && N(b, a.barMeasure), a.selectionChanged && gc(b), b.state.focused && a.updateInput && b.display.input.reset(a.typing), a.focus && a.focus == rh() && tb(a.cm);
  }

  function ad(a) {
    var b = a.cm,
        c = b.display,
        d = b.doc;

    if (a.updatedDisplay && X(b, a.update), null == c.wheelStartX || null == a.scrollTop && null == a.scrollLeft && !a.scrollToPos || (c.wheelStartX = c.wheelStartY = null), null == a.scrollTop || c.scroller.scrollTop == a.scrollTop && !a.forceScroll || (d.scrollTop = Math.max(0, Math.min(c.scroller.scrollHeight - c.scroller.clientHeight, a.scrollTop)), c.scrollbars.setScrollTop(d.scrollTop), c.scroller.scrollTop = d.scrollTop), null == a.scrollLeft || c.scroller.scrollLeft == a.scrollLeft && !a.forceScroll || (d.scrollLeft = Math.max(0, Math.min(c.scroller.scrollWidth - pc(b), a.scrollLeft)), c.scrollbars.setScrollLeft(d.scrollLeft), c.scroller.scrollLeft = d.scrollLeft, Q(b)), a.scrollToPos) {
      var e = me(b, Nb(d, a.scrollToPos.from), Nb(d, a.scrollToPos.to), a.scrollToPos.margin);
      a.scrollToPos.isCursor && b.state.focused && le(b, e);
    }

    var f = a.maybeHiddenMarkers,
        g = a.maybeUnhiddenMarkers;
    if (f) for (var h = 0; h < f.length; ++h) {
      f[h].lines.length || Ig(f[h], "hide");
    }
    if (g) for (var h = 0; h < g.length; ++h) {
      g[h].lines.length && Ig(g[h], "unhide");
    }
    c.wrapper.offsetHeight && (d.scrollTop = b.display.scroller.scrollTop), a.changeObjs && Ig(b, "changes", b, a.changeObjs), a.update && a.update.finish();
  }

  function bd(a, b) {
    if (a.curOp) return b();
    Uc(a);

    try {
      return b();
    } finally {
      Wc(a);
    }
  }

  function cd(a, b) {
    return function () {
      if (a.curOp) return b.apply(a, arguments);
      Uc(a);

      try {
        return b.apply(a, arguments);
      } finally {
        Wc(a);
      }
    };
  }

  function dd(a) {
    return function () {
      if (this.curOp) return a.apply(this, arguments);
      Uc(this);

      try {
        return a.apply(this, arguments);
      } finally {
        Wc(this);
      }
    };
  }

  function ed(a) {
    return function () {
      var b = this.cm;
      if (!b || b.curOp) return a.apply(this, arguments);
      Uc(b);

      try {
        return a.apply(this, arguments);
      } finally {
        Wc(b);
      }
    };
  }

  function fd(a, b, c) {
    this.line = b, this.rest = rf(b), this.size = this.rest ? hg($g(this.rest)) - c + 1 : 1, this.node = this.text = null, this.hidden = uf(a, b);
  }

  function gd(a, b, c) {
    for (var e, d = [], f = b; c > f; f = e) {
      var g = new fd(a.doc, dg(a.doc, f), f);
      e = f + g.size, d.push(g);
    }

    return d;
  }

  function hd(a, b, c, d) {
    null == b && (b = a.doc.first), null == c && (c = a.doc.first + a.doc.size), d || (d = 0);
    var e = a.display;
    if (d && c < e.viewTo && (null == e.updateLineNumbers || e.updateLineNumbers > b) && (e.updateLineNumbers = b), a.curOp.viewChanged = !0, b >= e.viewTo) u && sf(a.doc, b) < e.viewTo && jd(a);else if (c <= e.viewFrom) u && tf(a.doc, c + d) > e.viewFrom ? jd(a) : (e.viewFrom += d, e.viewTo += d);else if (b <= e.viewFrom && c >= e.viewTo) jd(a);else if (b <= e.viewFrom) {
      var f = ld(a, c, c + d, 1);
      f ? (e.view = e.view.slice(f.index), e.viewFrom = f.lineN, e.viewTo += d) : jd(a);
    } else if (c >= e.viewTo) {
      var f = ld(a, b, b, -1);
      f ? (e.view = e.view.slice(0, f.index), e.viewTo = f.lineN) : jd(a);
    } else {
      var g = ld(a, b, b, -1),
          h = ld(a, c, c + d, 1);
      g && h ? (e.view = e.view.slice(0, g.index).concat(gd(a, g.lineN, h.lineN)).concat(e.view.slice(h.index)), e.viewTo += d) : jd(a);
    }
    var i = e.externalMeasured;
    i && (c < i.lineN ? i.lineN += d : b < i.lineN + i.size && (e.externalMeasured = null));
  }

  function id(a, b, c) {
    a.curOp.viewChanged = !0;
    var d = a.display,
        e = a.display.externalMeasured;

    if (e && b >= e.lineN && b < e.lineN + e.size && (d.externalMeasured = null), !(b < d.viewFrom || b >= d.viewTo)) {
      var f = d.view[kd(a, b)];

      if (null != f.node) {
        var g = f.changes || (f.changes = []);
        -1 == ah(g, c) && g.push(c);
      }
    }
  }

  function jd(a) {
    a.display.viewFrom = a.display.viewTo = a.doc.first, a.display.view = [], a.display.viewOffset = 0;
  }

  function kd(a, b) {
    if (b >= a.display.viewTo) return null;
    if (b -= a.display.viewFrom, 0 > b) return null;

    for (var c = a.display.view, d = 0; d < c.length; d++) {
      if (b -= c[d].size, 0 > b) return d;
    }
  }

  function ld(a, b, c, d) {
    var f,
        e = kd(a, b),
        g = a.display.view;
    if (!u || c == a.doc.first + a.doc.size) return {
      index: e,
      lineN: c
    };

    for (var h = 0, i = a.display.viewFrom; e > h; h++) {
      i += g[h].size;
    }

    if (i != b) {
      if (d > 0) {
        if (e == g.length - 1) return null;
        f = i + g[e].size - b, e++;
      } else f = i - b;

      b += f, c += f;
    }

    for (; sf(a.doc, c) != c;) {
      if (e == (0 > d ? 0 : g.length - 1)) return null;
      c += d * g[e - (0 > d ? 1 : 0)].size, e += d;
    }

    return {
      index: e,
      lineN: c
    };
  }

  function md(a, b, c) {
    var d = a.display,
        e = d.view;
    0 == e.length || b >= d.viewTo || c <= d.viewFrom ? (d.view = gd(a, b, c), d.viewFrom = b) : (d.viewFrom > b ? d.view = gd(a, b, d.viewFrom).concat(d.view) : d.viewFrom < b && (d.view = d.view.slice(kd(a, b))), d.viewFrom = b, d.viewTo < c ? d.view = d.view.concat(gd(a, d.viewTo, c)) : d.viewTo > c && (d.view = d.view.slice(0, kd(a, c)))), d.viewTo = c;
  }

  function nd(a) {
    for (var b = a.display.view, c = 0, d = 0; d < b.length; d++) {
      var e = b[d];
      e.hidden || e.node && !e.changes || ++c;
    }

    return c;
  }

  function od(a) {
    function g() {
      b.activeTouch && (c = setTimeout(function () {
        b.activeTouch = null;
      }, 1e3), f = b.activeTouch, f.end = +new Date());
    }

    function h(a) {
      if (1 != a.touches.length) return !1;
      var b = a.touches[0];
      return b.radiusX <= 1 && b.radiusY <= 1;
    }

    function i(a, b) {
      if (null == b.left) return !0;
      var c = b.left - a.left,
          d = b.top - a.top;
      return c * c + d * d > 400;
    }

    var b = a.display;
    Gg(b.scroller, "mousedown", cd(a, td)), d && 11 > e ? Gg(b.scroller, "dblclick", cd(a, function (b) {
      if (!Mg(a, b)) {
        var c = sd(a, b);

        if (c && !Ad(a, b) && !rd(a.display, b)) {
          Ag(b);
          var d = a.findWordAt(c);
          Sb(a.doc, d.anchor, d.head);
        }
      }
    })) : Gg(b.scroller, "dblclick", function (b) {
      Mg(a, b) || Ag(b);
    }), s || Gg(b.scroller, "contextmenu", function (b) {
      Yd(a, b);
    });
    var c,
        f = {
      end: 0
    };
    Gg(b.scroller, "touchstart", function (a) {
      if (!h(a)) {
        clearTimeout(c);
        var d = +new Date();
        b.activeTouch = {
          start: d,
          moved: !1,
          prev: d - f.end <= 300 ? f : null
        }, 1 == a.touches.length && (b.activeTouch.left = a.touches[0].pageX, b.activeTouch.top = a.touches[0].pageY);
      }
    }), Gg(b.scroller, "touchmove", function () {
      b.activeTouch && (b.activeTouch.moved = !0);
    }), Gg(b.scroller, "touchend", function (c) {
      var d = b.activeTouch;

      if (d && !rd(b, c) && null != d.left && !d.moved && new Date() - d.start < 300) {
        var f,
            e = a.coordsChar(b.activeTouch, "page");
        f = !d.prev || i(d, d.prev) ? new Jb(e, e) : !d.prev.prev || i(d, d.prev.prev) ? a.findWordAt(e) : new Jb(ob(e.line, 0), Nb(a.doc, ob(e.line + 1, 0))), a.setSelection(f.anchor, f.head), a.focus(), Ag(c);
      }

      g();
    }), Gg(b.scroller, "touchcancel", g), Gg(b.scroller, "scroll", function () {
      b.scroller.clientHeight && (Ed(a, b.scroller.scrollTop), Fd(a, b.scroller.scrollLeft, !0), Ig(a, "scroll", a));
    }), Gg(b.scroller, "mousewheel", function (b) {
      Jd(a, b);
    }), Gg(b.scroller, "DOMMouseScroll", function (b) {
      Jd(a, b);
    }), Gg(b.wrapper, "scroll", function () {
      b.wrapper.scrollTop = b.wrapper.scrollLeft = 0;
    }), b.dragFunctions = {
      simple: function simple(b) {
        Mg(a, b) || Dg(b);
      },
      start: function start(b) {
        Dd(a, b);
      },
      drop: cd(a, Cd)
    };
    var j = b.input.getField();
    Gg(j, "keyup", function (b) {
      Td.call(a, b);
    }), Gg(j, "keydown", cd(a, Rd)), Gg(j, "keypress", cd(a, Ud)), Gg(j, "focus", fh(Wd, a)), Gg(j, "blur", fh(Xd, a));
  }

  function pd(a, b, c) {
    var d = c && c != v.Init;

    if (!b != !d) {
      var e = a.display.dragFunctions,
          f = b ? Gg : Hg;
      f(a.display.scroller, "dragstart", e.start), f(a.display.scroller, "dragenter", e.simple), f(a.display.scroller, "dragover", e.simple), f(a.display.scroller, "drop", e.drop);
    }
  }

  function qd(a) {
    var b = a.display;
    (b.lastWrapHeight != b.wrapper.clientHeight || b.lastWrapWidth != b.wrapper.clientWidth) && (b.cachedCharWidth = b.cachedTextHeight = b.cachedPaddingH = null, b.scrollbarsClipped = !1, a.setSize());
  }

  function rd(a, b) {
    for (var c = Eg(b); c != a.wrapper; c = c.parentNode) {
      if (!c || 1 == c.nodeType && "true" == c.getAttribute("cm-ignore-events") || c.parentNode == a.sizer && c != a.mover) return !0;
    }
  }

  function sd(a, b, c, d) {
    var e = a.display;
    if (!c && "true" == Eg(b).getAttribute("cm-not-content")) return null;
    var f,
        g,
        h = e.lineSpace.getBoundingClientRect();

    try {
      f = b.clientX - h.left, g = b.clientY - h.top;
    } catch (b) {
      return null;
    }

    var j,
        i = Nc(a, f, g);

    if (d && 1 == i.xRel && (j = dg(a.doc, i.line).text).length == i.ch) {
      var k = Wg(j, j.length, a.options.tabSize) - j.length;
      i = ob(i.line, Math.max(0, Math.round((f - nc(a.display).left) / Rc(a.display)) - k));
    }

    return i;
  }

  function td(a) {
    var b = this,
        c = b.display;

    if (!(c.activeTouch && c.input.supportsTouch() || Mg(b, a))) {
      if (c.shift = a.shiftKey, rd(c, a)) return f || (c.scroller.draggable = !1, setTimeout(function () {
        c.scroller.draggable = !0;
      }, 100)), void 0;

      if (!Ad(b, a)) {
        var d = sd(b, a);

        switch (window.focus(), Fg(a)) {
          case 1:
            d ? wd(b, a, d) : Eg(a) == c.scroller && Ag(a);
            break;

          case 2:
            f && (b.state.lastMiddleDown = +new Date()), d && Sb(b.doc, d), setTimeout(function () {
              c.input.focus();
            }, 20), Ag(a);
            break;

          case 3:
            s ? Yd(b, a) : Vd(b);
        }
      }
    }
  }

  function wd(a, b, c) {
    d ? setTimeout(fh(tb, a), 0) : a.curOp.focus = rh();
    var f,
        e = +new Date();
    vd && vd.time > e - 400 && 0 == pb(vd.pos, c) ? f = "triple" : ud && ud.time > e - 400 && 0 == pb(ud.pos, c) ? (f = "double", vd = {
      time: e,
      pos: c
    }) : (f = "single", ud = {
      time: e,
      pos: c
    });
    var i,
        g = a.doc.sel,
        h = o ? b.metaKey : b.ctrlKey;
    a.options.dragDrop && Ah && !ub(a) && "single" == f && (i = g.contains(c)) > -1 && !g.ranges[i].empty() ? xd(a, b, c, h) : yd(a, b, c, f, h);
  }

  function xd(a, b, c, g) {
    var h = a.display,
        i = +new Date(),
        j = cd(a, function (k) {
      f && (h.scroller.draggable = !1), a.state.draggingText = !1, Hg(document, "mouseup", j), Hg(h.scroller, "drop", j), Math.abs(b.clientX - k.clientX) + Math.abs(b.clientY - k.clientY) < 10 && (Ag(k), !g && +new Date() - 200 < i && Sb(a.doc, c), f || d && 9 == e ? setTimeout(function () {
        document.body.focus(), h.input.focus();
      }, 20) : h.input.focus());
    });
    f && (h.scroller.draggable = !0), a.state.draggingText = j, h.scroller.dragDrop && h.scroller.dragDrop(), Gg(document, "mouseup", j), Gg(h.scroller, "drop", j);
  }

  function yd(a, b, c, d, e) {
    function o(b) {
      if (0 != pb(n, b)) if (n = b, "rect" == d) {
        for (var e = [], f = a.options.tabSize, k = Wg(dg(g, c.line).text, c.ch, f), l = Wg(dg(g, b.line).text, b.ch, f), m = Math.min(k, l), o = Math.max(k, l), p = Math.min(c.line, b.line), q = Math.min(a.lastLine(), Math.max(c.line, b.line)); q >= p; p++) {
          var r = dg(g, p).text,
              s = Xg(r, m, f);
          m == o ? e.push(new Jb(ob(p, s), ob(p, s))) : r.length > s && e.push(new Jb(ob(p, s), ob(p, Xg(r, o, f))));
        }

        e.length || e.push(new Jb(c, c)), Yb(g, Kb(j.ranges.slice(0, i).concat(e), i), {
          origin: "*mouse",
          scroll: !1
        }), a.scrollIntoView(b);
      } else {
        var t = h,
            u = t.anchor,
            v = b;

        if ("single" != d) {
          if ("double" == d) var w = a.findWordAt(b);else var w = new Jb(ob(b.line, 0), Nb(g, ob(b.line + 1, 0)));
          pb(w.anchor, u) > 0 ? (v = w.head, u = sb(t.from(), w.anchor)) : (v = w.anchor, u = rb(t.to(), w.head));
        }

        var e = j.ranges.slice(0);
        e[i] = new Jb(Nb(g, u), v), Yb(g, Kb(e, i), Tg);
      }
    }

    function r(b) {
      var c = ++q,
          e = sd(a, b, !0, "rect" == d);
      if (e) if (0 != pb(e, n)) {
        a.curOp.focus = rh(), o(e);
        var h = P(f, g);
        (e.line >= h.to || e.line < h.from) && setTimeout(cd(a, function () {
          q == c && r(b);
        }), 150);
      } else {
        var i = b.clientY < p.top ? -20 : b.clientY > p.bottom ? 20 : 0;
        i && setTimeout(cd(a, function () {
          q == c && (f.scroller.scrollTop += i, r(b));
        }), 50);
      }
    }

    function s(a) {
      q = 1 / 0, Ag(a), f.input.focus(), Hg(document, "mousemove", t), Hg(document, "mouseup", u), g.history.lastSelOrigin = null;
    }

    var f = a.display,
        g = a.doc;
    Ag(b);
    var h,
        i,
        j = g.sel,
        k = j.ranges;
    if (e && !b.shiftKey ? (i = g.sel.contains(c), h = i > -1 ? k[i] : new Jb(c, c)) : (h = g.sel.primary(), i = g.sel.primIndex), b.altKey) d = "rect", e || (h = new Jb(c, c)), c = sd(a, b, !0, !0), i = -1;else if ("double" == d) {
      var l = a.findWordAt(c);
      h = a.display.shift || g.extend ? Rb(g, h, l.anchor, l.head) : l;
    } else if ("triple" == d) {
      var m = new Jb(ob(c.line, 0), Nb(g, ob(c.line + 1, 0)));
      h = a.display.shift || g.extend ? Rb(g, h, m.anchor, m.head) : m;
    } else h = Rb(g, h, c);
    e ? -1 == i ? (i = k.length, Yb(g, Kb(k.concat([h]), i), {
      scroll: !1,
      origin: "*mouse"
    })) : k.length > 1 && k[i].empty() && "single" == d && !b.shiftKey ? (Yb(g, Kb(k.slice(0, i).concat(k.slice(i + 1)), 0)), j = g.sel) : Ub(g, i, h, Tg) : (i = 0, Yb(g, new Ib([h], 0), Tg), j = g.sel);
    var n = c,
        p = f.wrapper.getBoundingClientRect(),
        q = 0,
        t = cd(a, function (a) {
      Fg(a) ? r(a) : s(a);
    }),
        u = cd(a, s);
    Gg(document, "mousemove", t), Gg(document, "mouseup", u);
  }

  function zd(a, b, c, d, e) {
    try {
      var f = b.clientX,
          g = b.clientY;
    } catch (b) {
      return !1;
    }

    if (f >= Math.floor(a.display.gutters.getBoundingClientRect().right)) return !1;
    d && Ag(b);
    var h = a.display,
        i = h.lineDiv.getBoundingClientRect();
    if (g > i.bottom || !Og(a, c)) return Cg(b);
    g -= i.top - h.viewOffset;

    for (var j = 0; j < a.options.gutters.length; ++j) {
      var k = h.gutters.childNodes[j];

      if (k && k.getBoundingClientRect().right >= f) {
        var l = ig(a.doc, g),
            m = a.options.gutters[j];
        return e(a, c, a, l, m, b), Cg(b);
      }
    }
  }

  function Ad(a, b) {
    return zd(a, b, "gutterClick", !0, Kg);
  }

  function Cd(a) {
    var b = this;

    if (!Mg(b, a) && !rd(b.display, a)) {
      Ag(a), d && (Bd = +new Date());
      var c = sd(b, a, !0),
          e = a.dataTransfer.files;
      if (c && !ub(b)) if (e && e.length && window.FileReader && window.File) for (var f = e.length, g = Array(f), h = 0, i = function i(a, d) {
        var e = new FileReader();
        e.onload = cd(b, function () {
          if (g[d] = e.result, ++h == f) {
            c = Nb(b.doc, c);
            var a = {
              from: c,
              to: c,
              text: Fh(g.join("\n")),
              origin: "paste"
            };
            ee(b.doc, a), Xb(b.doc, Lb(c, $d(a)));
          }
        }), e.readAsText(a);
      }, j = 0; f > j; ++j) {
        i(e[j], j);
      } else {
        if (b.state.draggingText && b.doc.sel.contains(c) > -1) return b.state.draggingText(a), setTimeout(function () {
          b.display.input.focus();
        }, 20), void 0;

        try {
          var g = a.dataTransfer.getData("Text");

          if (g) {
            if (b.state.draggingText && !(o ? a.altKey : a.ctrlKey)) var k = b.listSelections();
            if (Zb(b.doc, Lb(c, c)), k) for (var j = 0; j < k.length; ++j) {
              ke(b.doc, "", k[j].anchor, k[j].head, "drag");
            }
            b.replaceSelection(g, "around", "paste"), b.display.input.focus();
          }
        } catch (a) {}
      }
    }
  }

  function Dd(a, b) {
    if (d && (!a.state.draggingText || +new Date() - Bd < 100)) return Dg(b), void 0;

    if (!Mg(a, b) && !rd(a.display, b) && (b.dataTransfer.setData("Text", a.getSelection()), b.dataTransfer.setDragImage && !j)) {
      var c = mh("img", null, null, "position: fixed; left: 0; top: 0;");
      c.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", i && (c.width = c.height = 1, a.display.wrapper.appendChild(c), c._top = c.offsetTop), b.dataTransfer.setDragImage(c, 0, 0), i && c.parentNode.removeChild(c);
    }
  }

  function Ed(b, c) {
    Math.abs(b.doc.scrollTop - c) < 2 || (b.doc.scrollTop = c, a || Y(b, {
      top: c
    }), b.display.scroller.scrollTop != c && (b.display.scroller.scrollTop = c), b.display.scrollbars.setScrollTop(c), a && Y(b), hc(b, 100));
  }

  function Fd(a, b, c) {
    (c ? b == a.doc.scrollLeft : Math.abs(a.doc.scrollLeft - b) < 2) || (b = Math.min(b, a.display.scroller.scrollWidth - a.display.scroller.clientWidth), a.doc.scrollLeft = b, Q(a), a.display.scroller.scrollLeft != b && (a.display.scroller.scrollLeft = b), a.display.scrollbars.setScrollLeft(b));
  }

  function Jd(b, c) {
    var d = Id(c),
        e = d.x,
        g = d.y,
        h = b.display,
        j = h.scroller;

    if (e && j.scrollWidth > j.clientWidth || g && j.scrollHeight > j.clientHeight) {
      if (g && o && f) a: for (var k = c.target, l = h.view; k != j; k = k.parentNode) {
        for (var m = 0; m < l.length; m++) {
          if (l[m].node == k) {
            b.display.currentWheelTarget = k;
            break a;
          }
        }
      }
      if (e && !a && !i && null != Hd) return g && Ed(b, Math.max(0, Math.min(j.scrollTop + g * Hd, j.scrollHeight - j.clientHeight))), Fd(b, Math.max(0, Math.min(j.scrollLeft + e * Hd, j.scrollWidth - j.clientWidth))), Ag(c), h.wheelStartX = null, void 0;

      if (g && null != Hd) {
        var n = g * Hd,
            p = b.doc.scrollTop,
            q = p + h.wrapper.clientHeight;
        0 > n ? p = Math.max(0, p + n - 50) : q = Math.min(b.doc.height, q + n + 50), Y(b, {
          top: p,
          bottom: q
        });
      }

      20 > Gd && (null == h.wheelStartX ? (h.wheelStartX = j.scrollLeft, h.wheelStartY = j.scrollTop, h.wheelDX = e, h.wheelDY = g, setTimeout(function () {
        if (null != h.wheelStartX) {
          var a = j.scrollLeft - h.wheelStartX,
              b = j.scrollTop - h.wheelStartY,
              c = b && h.wheelDY && b / h.wheelDY || a && h.wheelDX && a / h.wheelDX;
          h.wheelStartX = h.wheelStartY = null, c && (Hd = (Hd * Gd + c) / (Gd + 1), ++Gd);
        }
      }, 200)) : (h.wheelDX += e, h.wheelDY += g));
    }
  }

  function Kd(a, b, c) {
    if ("string" == typeof b && (b = Ie[b], !b)) return !1;
    a.display.input.ensurePolled();
    var d = a.display.shift,
        e = !1;

    try {
      ub(a) && (a.state.suppressEdits = !0), c && (a.display.shift = !1), e = b(a) != Rg;
    } finally {
      a.display.shift = d, a.state.suppressEdits = !1;
    }

    return e;
  }

  function Ld(a, b, c) {
    for (var d = 0; d < a.state.keyMaps.length; d++) {
      var e = Le(b, a.state.keyMaps[d], c, a);
      if (e) return e;
    }

    return a.options.extraKeys && Le(b, a.options.extraKeys, c, a) || Le(b, a.options.keyMap, c, a);
  }

  function Nd(a, b, c, d) {
    var e = a.state.keySeq;

    if (e) {
      if (Me(b)) return "handled";
      Md.set(50, function () {
        a.state.keySeq == e && (a.state.keySeq = null, a.display.input.reset());
      }), b = e + " " + b;
    }

    var f = Ld(a, b, d);
    return "multi" == f && (a.state.keySeq = b), "handled" == f && Kg(a, "keyHandled", a, b, c), ("handled" == f || "multi" == f) && (Ag(c), gc(a)), e && !f && /\'$/.test(b) ? (Ag(c), !0) : !!f;
  }

  function Od(a, b) {
    var c = Ne(b, !0);
    return c ? b.shiftKey && !a.state.keySeq ? Nd(a, "Shift-" + c, b, function (b) {
      return Kd(a, b, !0);
    }) || Nd(a, c, b, function (b) {
      return ("string" == typeof b ? /^go[A-Z]/.test(b) : b.motion) ? Kd(a, b) : void 0;
    }) : Nd(a, c, b, function (b) {
      return Kd(a, b);
    }) : !1;
  }

  function Pd(a, b, c) {
    return Nd(a, "'" + c + "'", b, function (b) {
      return Kd(a, b, !0);
    });
  }

  function Rd(a) {
    var b = this;

    if (b.curOp.focus = rh(), !Mg(b, a)) {
      d && 11 > e && 27 == a.keyCode && (a.returnValue = !1);
      var c = a.keyCode;
      b.display.shift = 16 == c || a.shiftKey;
      var f = Od(b, a);
      i && (Qd = f ? c : null, !f && 88 == c && !Hh && (o ? a.metaKey : a.ctrlKey) && b.replaceSelection("", null, "cut")), 18 != c || /\bCodeMirror-crosshair\b/.test(b.display.lineDiv.className) || Sd(b);
    }
  }

  function Sd(a) {
    function c(a) {
      18 != a.keyCode && a.altKey || (th(b, "CodeMirror-crosshair"), Hg(document, "keyup", c), Hg(document, "mouseover", c));
    }

    var b = a.display.lineDiv;
    uh(b, "CodeMirror-crosshair"), Gg(document, "keyup", c), Gg(document, "mouseover", c);
  }

  function Td(a) {
    16 == a.keyCode && (this.doc.sel.shift = !1), Mg(this, a);
  }

  function Ud(a) {
    var b = this;

    if (!(rd(b.display, a) || Mg(b, a) || a.ctrlKey && !a.altKey || o && a.metaKey)) {
      var c = a.keyCode,
          d = a.charCode;
      if (i && c == Qd) return Qd = null, Ag(a), void 0;

      if (!i || a.which && !(a.which < 10) || !Od(b, a)) {
        var e = String.fromCharCode(null == d ? c : d);
        Pd(b, a, e) || b.display.input.onKeyPress(a);
      }
    }
  }

  function Vd(a) {
    a.state.delayingBlurEvent = !0, setTimeout(function () {
      a.state.delayingBlurEvent && (a.state.delayingBlurEvent = !1, Xd(a));
    }, 100);
  }

  function Wd(a) {
    a.state.delayingBlurEvent && (a.state.delayingBlurEvent = !1), "nocursor" != a.options.readOnly && (a.state.focused || (Ig(a, "focus", a), a.state.focused = !0, uh(a.display.wrapper, "CodeMirror-focused"), a.curOp || a.display.selForContextMenu == a.doc.sel || (a.display.input.reset(), f && setTimeout(function () {
      a.display.input.reset(!0);
    }, 20)), a.display.input.receivedFocus()), gc(a));
  }

  function Xd(a) {
    a.state.delayingBlurEvent || (a.state.focused && (Ig(a, "blur", a), a.state.focused = !1, th(a.display.wrapper, "CodeMirror-focused")), clearInterval(a.display.blinker), setTimeout(function () {
      a.state.focused || (a.display.shift = !1);
    }, 150));
  }

  function Yd(a, b) {
    rd(a.display, b) || Zd(a, b) || a.display.input.onContextMenu(b);
  }

  function Zd(a, b) {
    return Og(a, "gutterContextMenu") ? zd(a, b, "gutterContextMenu", !1, Ig) : !1;
  }

  function _d(a, b) {
    if (pb(a, b.from) < 0) return a;
    if (pb(a, b.to) <= 0) return $d(b);
    var c = a.line + b.text.length - (b.to.line - b.from.line) - 1,
        d = a.ch;
    return a.line == b.to.line && (d += $d(b).ch - b.to.ch), ob(c, d);
  }

  function ae(a, b) {
    for (var c = [], d = 0; d < a.sel.ranges.length; d++) {
      var e = a.sel.ranges[d];
      c.push(new Jb(_d(e.anchor, b), _d(e.head, b)));
    }

    return Kb(c, a.sel.primIndex);
  }

  function be(a, b, c) {
    return a.line == b.line ? ob(c.line, a.ch - b.ch + c.ch) : ob(c.line + (a.line - b.line), a.ch);
  }

  function ce(a, b, c) {
    for (var d = [], e = ob(a.first, 0), f = e, g = 0; g < b.length; g++) {
      var h = b[g],
          i = be(h.from, e, f),
          j = be($d(h), e, f);

      if (e = h.to, f = j, "around" == c) {
        var k = a.sel.ranges[g],
            l = pb(k.head, k.anchor) < 0;
        d[g] = new Jb(l ? j : i, l ? i : j);
      } else d[g] = new Jb(i, i);
    }

    return new Ib(d, a.sel.primIndex);
  }

  function de(a, b, c) {
    var d = {
      canceled: !1,
      from: b.from,
      to: b.to,
      text: b.text,
      origin: b.origin,
      cancel: function cancel() {
        this.canceled = !0;
      }
    };
    return c && (d.update = function (b, c, d, e) {
      b && (this.from = Nb(a, b)), c && (this.to = Nb(a, c)), d && (this.text = d), void 0 !== e && (this.origin = e);
    }), Ig(a, "beforeChange", a, d), a.cm && Ig(a.cm, "beforeChange", a.cm, d), d.canceled ? null : {
      from: d.from,
      to: d.to,
      text: d.text,
      origin: d.origin
    };
  }

  function ee(a, b, c) {
    if (a.cm) {
      if (!a.cm.curOp) return cd(a.cm, ee)(a, b, c);
      if (a.cm.state.suppressEdits) return;
    }

    if (!(Og(a, "beforeChange") || a.cm && Og(a.cm, "beforeChange")) || (b = de(a, b, !0))) {
      var d = t && !c && ff(a, b.from, b.to);
      if (d) for (var e = d.length - 1; e >= 0; --e) {
        fe(a, {
          from: d[e].from,
          to: d[e].to,
          text: e ? [""] : b.text
        });
      } else fe(a, b);
    }
  }

  function fe(a, b) {
    if (1 != b.text.length || "" != b.text[0] || 0 != pb(b.from, b.to)) {
      var c = ae(a, b);
      pg(a, b, c, a.cm ? a.cm.curOp.id : 0 / 0), ie(a, b, c, cf(a, b));
      var d = [];
      bg(a, function (a, c) {
        c || -1 != ah(d, a.history) || (zg(a.history, b), d.push(a.history)), ie(a, b, null, cf(a, b));
      });
    }
  }

  function ge(a, b, c) {
    if (!a.cm || !a.cm.state.suppressEdits) {
      for (var e, d = a.history, f = a.sel, g = "undo" == b ? d.done : d.undone, h = "undo" == b ? d.undone : d.done, i = 0; i < g.length && (e = g[i], c ? !e.ranges || e.equals(a.sel) : e.ranges); i++) {
        ;
      }

      if (i != g.length) {
        for (d.lastOrigin = d.lastSelOrigin = null; e = g.pop(), e.ranges;) {
          if (sg(e, h), c && !e.equals(a.sel)) return Yb(a, e, {
            clearRedo: !1
          }), void 0;
          f = e;
        }

        var j = [];
        sg(f, h), h.push({
          changes: j,
          generation: d.generation
        }), d.generation = e.generation || ++d.maxGeneration;

        for (var k = Og(a, "beforeChange") || a.cm && Og(a.cm, "beforeChange"), i = e.changes.length - 1; i >= 0; --i) {
          var l = e.changes[i];
          if (l.origin = b, k && !de(a, l, !1)) return g.length = 0, void 0;
          j.push(mg(a, l));
          var m = i ? ae(a, l) : $g(g);
          ie(a, l, m, ef(a, l)), !i && a.cm && a.cm.scrollIntoView({
            from: l.from,
            to: $d(l)
          });
          var n = [];
          bg(a, function (a, b) {
            b || -1 != ah(n, a.history) || (zg(a.history, l), n.push(a.history)), ie(a, l, null, ef(a, l));
          });
        }
      }
    }
  }

  function he(a, b) {
    if (0 != b && (a.first += b, a.sel = new Ib(bh(a.sel.ranges, function (a) {
      return new Jb(ob(a.anchor.line + b, a.anchor.ch), ob(a.head.line + b, a.head.ch));
    }), a.sel.primIndex), a.cm)) {
      hd(a.cm, a.first, a.first - b, b);

      for (var c = a.cm.display, d = c.viewFrom; d < c.viewTo; d++) {
        id(a.cm, d, "gutter");
      }
    }
  }

  function ie(a, b, c, d) {
    if (a.cm && !a.cm.curOp) return cd(a.cm, ie)(a, b, c, d);
    if (b.to.line < a.first) return he(a, b.text.length - 1 - (b.to.line - b.from.line)), void 0;

    if (!(b.from.line > a.lastLine())) {
      if (b.from.line < a.first) {
        var e = b.text.length - 1 - (a.first - b.from.line);
        he(a, e), b = {
          from: ob(a.first, 0),
          to: ob(b.to.line + e, b.to.ch),
          text: [$g(b.text)],
          origin: b.origin
        };
      }

      var f = a.lastLine();
      b.to.line > f && (b = {
        from: b.from,
        to: ob(f, dg(a, f).text.length),
        text: [b.text[0]],
        origin: b.origin
      }), b.removed = eg(a, b.from, b.to), c || (c = ae(a, b)), a.cm ? je(a.cm, b, d) : Wf(a, b, d), Zb(a, c, Sg);
    }
  }

  function je(a, b, c) {
    var d = a.doc,
        e = a.display,
        f = b.from,
        g = b.to,
        h = !1,
        i = f.line;
    a.options.lineWrapping || (i = hg(qf(dg(d, f.line))), d.iter(i, g.line + 1, function (a) {
      return a == e.maxLine ? (h = !0, !0) : void 0;
    })), d.sel.contains(b.from, b.to) > -1 && Ng(a), Wf(d, b, c, A(a)), a.options.lineWrapping || (d.iter(i, f.line + b.text.length, function (a) {
      var b = G(a);
      b > e.maxLineLength && (e.maxLine = a, e.maxLineLength = b, e.maxLineChanged = !0, h = !1);
    }), h && (a.curOp.updateMaxLine = !0)), d.frontier = Math.min(d.frontier, f.line), hc(a, 400);
    var j = b.text.length - (g.line - f.line) - 1;
    b.full ? hd(a) : f.line != g.line || 1 != b.text.length || Vf(a.doc, b) ? hd(a, f.line, g.line + 1, j) : id(a, f.line, "text");
    var k = Og(a, "changes"),
        l = Og(a, "change");

    if (l || k) {
      var m = {
        from: f,
        to: g,
        text: b.text,
        removed: b.removed,
        origin: b.origin
      };
      l && Kg(a, "change", a, m), k && (a.curOp.changeObjs || (a.curOp.changeObjs = [])).push(m);
    }

    a.display.selForContextMenu = null;
  }

  function ke(a, b, c, d, e) {
    if (d || (d = c), pb(d, c) < 0) {
      var f = d;
      d = c, c = f;
    }

    "string" == typeof b && (b = Fh(b)), ee(a, {
      from: c,
      to: d,
      text: b,
      origin: e
    });
  }

  function le(a, b) {
    if (!Mg(a, "scrollCursorIntoView")) {
      var c = a.display,
          d = c.sizer.getBoundingClientRect(),
          e = null;

      if (b.top + d.top < 0 ? e = !0 : b.bottom + d.top > (window.innerHeight || document.documentElement.clientHeight) && (e = !1), null != e && !l) {
        var f = mh("div", "\u200B", null, "position: absolute; top: " + (b.top - c.viewOffset - lc(a.display)) + "px; height: " + (b.bottom - b.top + oc(a) + c.barHeight) + "px; left: " + b.left + "px; width: 2px;");
        a.display.lineSpace.appendChild(f), f.scrollIntoView(e), a.display.lineSpace.removeChild(f);
      }
    }
  }

  function me(a, b, c, d) {
    null == d && (d = 0);

    for (var e = 0; 5 > e; e++) {
      var f = !1,
          g = Kc(a, b),
          h = c && c != b ? Kc(a, c) : g,
          i = oe(a, Math.min(g.left, h.left), Math.min(g.top, h.top) - d, Math.max(g.left, h.left), Math.max(g.bottom, h.bottom) + d),
          j = a.doc.scrollTop,
          k = a.doc.scrollLeft;
      if (null != i.scrollTop && (Ed(a, i.scrollTop), Math.abs(a.doc.scrollTop - j) > 1 && (f = !0)), null != i.scrollLeft && (Fd(a, i.scrollLeft), Math.abs(a.doc.scrollLeft - k) > 1 && (f = !0)), !f) break;
    }

    return g;
  }

  function ne(a, b, c, d, e) {
    var f = oe(a, b, c, d, e);
    null != f.scrollTop && Ed(a, f.scrollTop), null != f.scrollLeft && Fd(a, f.scrollLeft);
  }

  function oe(a, b, c, d, e) {
    var f = a.display,
        g = Qc(a.display);
    0 > c && (c = 0);
    var h = a.curOp && null != a.curOp.scrollTop ? a.curOp.scrollTop : f.scroller.scrollTop,
        i = qc(a),
        j = {};
    e - c > i && (e = c + i);
    var k = a.doc.height + mc(f),
        l = g > c,
        m = e > k - g;
    if (h > c) j.scrollTop = l ? 0 : c;else if (e > h + i) {
      var n = Math.min(c, (m ? k : e) - i);
      n != h && (j.scrollTop = n);
    }
    var o = a.curOp && null != a.curOp.scrollLeft ? a.curOp.scrollLeft : f.scroller.scrollLeft,
        p = pc(a) - (a.options.fixedGutter ? f.gutters.offsetWidth : 0),
        q = d - b > p;
    return q && (d = b + p), 10 > b ? j.scrollLeft = 0 : o > b ? j.scrollLeft = Math.max(0, b - (q ? 0 : 10)) : d > p + o - 3 && (j.scrollLeft = d + (q ? 0 : 10) - p), j;
  }

  function pe(a, b, c) {
    (null != b || null != c) && re(a), null != b && (a.curOp.scrollLeft = (null == a.curOp.scrollLeft ? a.doc.scrollLeft : a.curOp.scrollLeft) + b), null != c && (a.curOp.scrollTop = (null == a.curOp.scrollTop ? a.doc.scrollTop : a.curOp.scrollTop) + c);
  }

  function qe(a) {
    re(a);
    var b = a.getCursor(),
        c = b,
        d = b;
    a.options.lineWrapping || (c = b.ch ? ob(b.line, b.ch - 1) : b, d = ob(b.line, b.ch + 1)), a.curOp.scrollToPos = {
      from: c,
      to: d,
      margin: a.options.cursorScrollMargin,
      isCursor: !0
    };
  }

  function re(a) {
    var b = a.curOp.scrollToPos;

    if (b) {
      a.curOp.scrollToPos = null;
      var c = Lc(a, b.from),
          d = Lc(a, b.to),
          e = oe(a, Math.min(c.left, d.left), Math.min(c.top, d.top) - b.margin, Math.max(c.right, d.right), Math.max(c.bottom, d.bottom) + b.margin);
      a.scrollTo(e.scrollLeft, e.scrollTop);
    }
  }

  function se(a, b, c, d) {
    var f,
        e = a.doc;
    null == c && (c = "add"), "smart" == c && (e.mode.indent ? f = kc(a, b) : c = "prev");
    var g = a.options.tabSize,
        h = dg(e, b),
        i = Wg(h.text, null, g);
    h.stateAfter && (h.stateAfter = null);
    var k,
        j = h.text.match(/^\s*/)[0];

    if (d || /\S/.test(h.text)) {
      if ("smart" == c && (k = e.mode.indent(f, h.text.slice(j.length), h.text), k == Rg || k > 150)) {
        if (!d) return;
        c = "prev";
      }
    } else k = 0, c = "not";

    "prev" == c ? k = b > e.first ? Wg(dg(e, b - 1).text, null, g) : 0 : "add" == c ? k = i + a.options.indentUnit : "subtract" == c ? k = i - a.options.indentUnit : "number" == typeof c && (k = i + c), k = Math.max(0, k);
    var l = "",
        m = 0;
    if (a.options.indentWithTabs) for (var n = Math.floor(k / g); n; --n) {
      m += g, l += "	";
    }
    if (k > m && (l += Zg(k - m)), l != j) return ke(e, l, ob(b, 0), ob(b, j.length), "+input"), h.stateAfter = null, !0;

    for (var n = 0; n < e.sel.ranges.length; n++) {
      var o = e.sel.ranges[n];

      if (o.head.line == b && o.head.ch < j.length) {
        var m = ob(b, j.length);
        Ub(e, n, new Jb(m, m));
        break;
      }
    }
  }

  function te(a, b, c, d) {
    var e = b,
        f = b;
    return "number" == typeof b ? f = dg(a, Mb(a, b)) : e = hg(b), null == e ? null : (d(f, e) && a.cm && id(a.cm, e, c), f);
  }

  function ue(a, b) {
    for (var c = a.doc.sel.ranges, d = [], e = 0; e < c.length; e++) {
      for (var f = b(c[e]); d.length && pb(f.from, $g(d).to) <= 0;) {
        var g = d.pop();

        if (pb(g.from, f.from) < 0) {
          f.from = g.from;
          break;
        }
      }

      d.push(f);
    }

    bd(a, function () {
      for (var b = d.length - 1; b >= 0; b--) {
        ke(a.doc, "", d[b].from, d[b].to, "+delete");
      }

      qe(a);
    });
  }

  function ve(a, b, c, d, e) {
    function k() {
      var b = f + c;
      return b < a.first || b >= a.first + a.size ? j = !1 : (f = b, i = dg(a, b));
    }

    function l(a) {
      var b = (e ? Xh : Yh)(i, g, c, !0);

      if (null == b) {
        if (a || !k()) return j = !1;
        g = e ? (0 > c ? Ph : Oh)(i) : 0 > c ? i.text.length : 0;
      } else g = b;

      return !0;
    }

    var f = b.line,
        g = b.ch,
        h = c,
        i = dg(a, f),
        j = !0;
    if ("char" == d) l();else if ("column" == d) l(!0);else if ("word" == d || "group" == d) for (var m = null, n = "group" == d, o = a.cm && a.cm.getHelper(b, "wordChars"), p = !0; !(0 > c) || l(!p); p = !1) {
      var q = i.text.charAt(g) || "\n",
          r = ih(q, o) ? "w" : n && "\n" == q ? "n" : !n || /\s/.test(q) ? null : "p";

      if (!n || p || r || (r = "s"), m && m != r) {
        0 > c && (c = 1, l());
        break;
      }

      if (r && (m = r), c > 0 && !l(!p)) break;
    }
    var s = bc(a, ob(f, g), h, !0);
    return j || (s.hitSide = !0), s;
  }

  function we(a, b, c, d) {
    var g,
        e = a.doc,
        f = b.left;

    if ("page" == d) {
      var h = Math.min(a.display.wrapper.clientHeight, window.innerHeight || document.documentElement.clientHeight);
      g = b.top + c * (h - (0 > c ? 1.5 : .5) * Qc(a.display));
    } else "line" == d && (g = c > 0 ? b.bottom + 3 : b.top - 3);

    for (;;) {
      var i = Nc(a, f, g);
      if (!i.outside) break;

      if (0 > c ? 0 >= g : g >= e.height) {
        i.hitSide = !0;
        break;
      }

      g += 5 * c;
    }

    return i;
  }

  function ze(a, b, c, d) {
    v.defaults[a] = b, c && (ye[a] = d ? function (a, b, d) {
      d != Ae && c(a, b, d);
    } : c);
  }

  function Ke(a) {
    for (var c, d, e, f, b = a.split(/-(?!$)/), a = b[b.length - 1], g = 0; g < b.length - 1; g++) {
      var h = b[g];
      if (/^(cmd|meta|m)$/i.test(h)) f = !0;else if (/^a(lt)?$/i.test(h)) c = !0;else if (/^(c|ctrl|control)$/i.test(h)) d = !0;else {
        if (!/^s(hift)$/i.test(h)) throw new Error("Unrecognized modifier name: " + h);
        e = !0;
      }
    }

    return c && (a = "Alt-" + a), d && (a = "Ctrl-" + a), f && (a = "Cmd-" + a), e && (a = "Shift-" + a), a;
  }

  function Oe(a) {
    return "string" == typeof a ? Je[a] : a;
  }

  function Se(a, b, c, d, e) {
    if (d && d.shared) return Ue(a, b, c, d, e);
    if (a.cm && !a.cm.curOp) return cd(a.cm, Se)(a, b, c, d, e);
    var f = new Re(a, e),
        g = pb(b, c);
    if (d && eh(d, f, !1), g > 0 || 0 == g && f.clearWhenEmpty !== !1) return f;

    if (f.replacedWith && (f.collapsed = !0, f.widgetNode = mh("span", [f.replacedWith], "CodeMirror-widget"), d.handleMouseEvents || f.widgetNode.setAttribute("cm-ignore-events", "true"), d.insertLeft && (f.widgetNode.insertLeft = !0)), f.collapsed) {
      if (pf(a, b.line, b, c, f) || b.line != c.line && pf(a, c.line, b, c, f)) throw new Error("Inserting collapsed marker partially overlapping an existing one");
      u = !0;
    }

    f.addToHistory && pg(a, {
      from: b,
      to: c,
      origin: "markText"
    }, a.sel, 0 / 0);
    var j,
        h = b.line,
        i = a.cm;

    if (a.iter(h, c.line + 1, function (a) {
      i && f.collapsed && !i.options.lineWrapping && qf(a) == i.display.maxLine && (j = !0), f.collapsed && h != b.line && gg(a, 0), _e(a, new Ye(f, h == b.line ? b.ch : null, h == c.line ? c.ch : null)), ++h;
    }), f.collapsed && a.iter(b.line, c.line + 1, function (b) {
      uf(a, b) && gg(b, 0);
    }), f.clearOnEnter && Gg(f, "beforeCursorEnter", function () {
      f.clear();
    }), f.readOnly && (t = !0, (a.history.done.length || a.history.undone.length) && a.clearHistory()), f.collapsed && (f.id = ++Qe, f.atomic = !0), i) {
      if (j && (i.curOp.updateMaxLine = !0), f.collapsed) hd(i, b.line, c.line + 1);else if (f.className || f.title || f.startStyle || f.endStyle || f.css) for (var k = b.line; k <= c.line; k++) {
        id(i, k, "text");
      }
      f.atomic && _b(i.doc), Kg(i, "markerAdded", i, f);
    }

    return f;
  }

  function Ue(a, b, c, d, e) {
    d = eh(d), d.shared = !1;
    var f = [Se(a, b, c, d, e)],
        g = f[0],
        h = d.widgetNode;
    return bg(a, function (a) {
      h && (d.widgetNode = h.cloneNode(!0)), f.push(Se(a, Nb(a, b), Nb(a, c), d, e));

      for (var i = 0; i < a.linked.length; ++i) {
        if (a.linked[i].isParent) return;
      }

      g = $g(f);
    }), new Te(f, g);
  }

  function Ve(a) {
    return a.findMarks(ob(a.first, 0), a.clipPos(ob(a.lastLine())), function (a) {
      return a.parent;
    });
  }

  function We(a, b) {
    for (var c = 0; c < b.length; c++) {
      var d = b[c],
          e = d.find(),
          f = a.clipPos(e.from),
          g = a.clipPos(e.to);

      if (pb(f, g)) {
        var h = Se(a, f, g, d.primary, d.primary.type);
        d.markers.push(h), h.parent = d;
      }
    }
  }

  function Xe(a) {
    for (var b = 0; b < a.length; b++) {
      var c = a[b],
          d = [c.primary.doc];
      bg(c.primary.doc, function (a) {
        d.push(a);
      });

      for (var e = 0; e < c.markers.length; e++) {
        var f = c.markers[e];
        -1 == ah(d, f.doc) && (f.parent = null, c.markers.splice(e--, 1));
      }
    }
  }

  function Ye(a, b, c) {
    this.marker = a, this.from = b, this.to = c;
  }

  function Ze(a, b) {
    if (a) for (var c = 0; c < a.length; ++c) {
      var d = a[c];
      if (d.marker == b) return d;
    }
  }

  function $e(a, b) {
    for (var c, d = 0; d < a.length; ++d) {
      a[d] != b && (c || (c = [])).push(a[d]);
    }

    return c;
  }

  function _e(a, b) {
    a.markedSpans = a.markedSpans ? a.markedSpans.concat([b]) : [b], b.marker.attachLine(a);
  }

  function af(a, b, c) {
    if (a) for (var e, d = 0; d < a.length; ++d) {
      var f = a[d],
          g = f.marker,
          h = null == f.from || (g.inclusiveLeft ? f.from <= b : f.from < b);

      if (h || f.from == b && "bookmark" == g.type && (!c || !f.marker.insertLeft)) {
        var i = null == f.to || (g.inclusiveRight ? f.to >= b : f.to > b);
        (e || (e = [])).push(new Ye(g, f.from, i ? null : f.to));
      }
    }
    return e;
  }

  function bf(a, b, c) {
    if (a) for (var e, d = 0; d < a.length; ++d) {
      var f = a[d],
          g = f.marker,
          h = null == f.to || (g.inclusiveRight ? f.to >= b : f.to > b);

      if (h || f.from == b && "bookmark" == g.type && (!c || f.marker.insertLeft)) {
        var i = null == f.from || (g.inclusiveLeft ? f.from <= b : f.from < b);
        (e || (e = [])).push(new Ye(g, i ? null : f.from - b, null == f.to ? null : f.to - b));
      }
    }
    return e;
  }

  function cf(a, b) {
    if (b.full) return null;
    var c = Pb(a, b.from.line) && dg(a, b.from.line).markedSpans,
        d = Pb(a, b.to.line) && dg(a, b.to.line).markedSpans;
    if (!c && !d) return null;
    var e = b.from.ch,
        f = b.to.ch,
        g = 0 == pb(b.from, b.to),
        h = af(c, e, g),
        i = bf(d, f, g),
        j = 1 == b.text.length,
        k = $g(b.text).length + (j ? e : 0);
    if (h) for (var l = 0; l < h.length; ++l) {
      var m = h[l];

      if (null == m.to) {
        var n = Ze(i, m.marker);
        n ? j && (m.to = null == n.to ? null : n.to + k) : m.to = e;
      }
    }
    if (i) for (var l = 0; l < i.length; ++l) {
      var m = i[l];

      if (null != m.to && (m.to += k), null == m.from) {
        var n = Ze(h, m.marker);
        n || (m.from = k, j && (h || (h = [])).push(m));
      } else m.from += k, j && (h || (h = [])).push(m);
    }
    h && (h = df(h)), i && i != h && (i = df(i));
    var o = [h];

    if (!j) {
      var q,
          p = b.text.length - 2;
      if (p > 0 && h) for (var l = 0; l < h.length; ++l) {
        null == h[l].to && (q || (q = [])).push(new Ye(h[l].marker, null, null));
      }

      for (var l = 0; p > l; ++l) {
        o.push(q);
      }

      o.push(i);
    }

    return o;
  }

  function df(a) {
    for (var b = 0; b < a.length; ++b) {
      var c = a[b];
      null != c.from && c.from == c.to && c.marker.clearWhenEmpty !== !1 && a.splice(b--, 1);
    }

    return a.length ? a : null;
  }

  function ef(a, b) {
    var c = vg(a, b),
        d = cf(a, b);
    if (!c) return d;
    if (!d) return c;

    for (var e = 0; e < c.length; ++e) {
      var f = c[e],
          g = d[e];
      if (f && g) a: for (var h = 0; h < g.length; ++h) {
        for (var i = g[h], j = 0; j < f.length; ++j) {
          if (f[j].marker == i.marker) continue a;
        }

        f.push(i);
      } else g && (c[e] = g);
    }

    return c;
  }

  function ff(a, b, c) {
    var d = null;
    if (a.iter(b.line, c.line + 1, function (a) {
      if (a.markedSpans) for (var b = 0; b < a.markedSpans.length; ++b) {
        var c = a.markedSpans[b].marker;
        !c.readOnly || d && -1 != ah(d, c) || (d || (d = [])).push(c);
      }
    }), !d) return null;

    for (var e = [{
      from: b,
      to: c
    }], f = 0; f < d.length; ++f) {
      for (var g = d[f], h = g.find(0), i = 0; i < e.length; ++i) {
        var j = e[i];

        if (!(pb(j.to, h.from) < 0 || pb(j.from, h.to) > 0)) {
          var k = [i, 1],
              l = pb(j.from, h.from),
              m = pb(j.to, h.to);
          (0 > l || !g.inclusiveLeft && !l) && k.push({
            from: j.from,
            to: h.from
          }), (m > 0 || !g.inclusiveRight && !m) && k.push({
            from: h.to,
            to: j.to
          }), e.splice.apply(e, k), i += k.length - 1;
        }
      }
    }

    return e;
  }

  function gf(a) {
    var b = a.markedSpans;

    if (b) {
      for (var c = 0; c < b.length; ++c) {
        b[c].marker.detachLine(a);
      }

      a.markedSpans = null;
    }
  }

  function hf(a, b) {
    if (b) {
      for (var c = 0; c < b.length; ++c) {
        b[c].marker.attachLine(a);
      }

      a.markedSpans = b;
    }
  }

  function jf(a) {
    return a.inclusiveLeft ? -1 : 0;
  }

  function kf(a) {
    return a.inclusiveRight ? 1 : 0;
  }

  function lf(a, b) {
    var c = a.lines.length - b.lines.length;
    if (0 != c) return c;
    var d = a.find(),
        e = b.find(),
        f = pb(d.from, e.from) || jf(a) - jf(b);
    if (f) return -f;
    var g = pb(d.to, e.to) || kf(a) - kf(b);
    return g ? g : b.id - a.id;
  }

  function mf(a, b) {
    var d,
        c = u && a.markedSpans;
    if (c) for (var e, f = 0; f < c.length; ++f) {
      e = c[f], e.marker.collapsed && null == (b ? e.from : e.to) && (!d || lf(d, e.marker) < 0) && (d = e.marker);
    }
    return d;
  }

  function nf(a) {
    return mf(a, !0);
  }

  function of(a) {
    return mf(a, !1);
  }

  function pf(a, b, c, d, e) {
    var f = dg(a, b),
        g = u && f.markedSpans;
    if (g) for (var h = 0; h < g.length; ++h) {
      var i = g[h];

      if (i.marker.collapsed) {
        var j = i.marker.find(0),
            k = pb(j.from, c) || jf(i.marker) - jf(e),
            l = pb(j.to, d) || kf(i.marker) - kf(e);
        if (!(k >= 0 && 0 >= l || 0 >= k && l >= 0) && (0 >= k && (pb(j.to, c) > 0 || i.marker.inclusiveRight && e.inclusiveLeft) || k >= 0 && (pb(j.from, d) < 0 || i.marker.inclusiveLeft && e.inclusiveRight))) return !0;
      }
    }
  }

  function qf(a) {
    for (var b; b = nf(a);) {
      a = b.find(-1, !0).line;
    }

    return a;
  }

  function rf(a) {
    for (var b, c; b = of(a);) {
      a = b.find(1, !0).line, (c || (c = [])).push(a);
    }

    return c;
  }

  function sf(a, b) {
    var c = dg(a, b),
        d = qf(c);
    return c == d ? b : hg(d);
  }

  function tf(a, b) {
    if (b > a.lastLine()) return b;
    var d,
        c = dg(a, b);
    if (!uf(a, c)) return b;

    for (; d = of(c);) {
      c = d.find(1, !0).line;
    }

    return hg(c) + 1;
  }

  function uf(a, b) {
    var c = u && b.markedSpans;
    if (c) for (var d, e = 0; e < c.length; ++e) {
      if (d = c[e], d.marker.collapsed) {
        if (null == d.from) return !0;
        if (!d.marker.widgetNode && 0 == d.from && d.marker.inclusiveLeft && vf(a, b, d)) return !0;
      }
    }
  }

  function vf(a, b, c) {
    if (null == c.to) {
      var d = c.marker.find(1, !0);
      return vf(a, d.line, Ze(d.line.markedSpans, c.marker));
    }

    if (c.marker.inclusiveRight && c.to == b.text.length) return !0;

    for (var e, f = 0; f < b.markedSpans.length; ++f) {
      if (e = b.markedSpans[f], e.marker.collapsed && !e.marker.widgetNode && e.from == c.to && (null == e.to || e.to != c.from) && (e.marker.inclusiveLeft || c.marker.inclusiveRight) && vf(a, b, e)) return !0;
    }
  }

  function xf(a, b, c) {
    jg(b) < (a.curOp && a.curOp.scrollTop || a.doc.scrollTop) && pe(a, null, c);
  }

  function yf(a) {
    if (null != a.height) return a.height;
    var b = a.doc.cm;
    if (!b) return 0;

    if (!qh(document.body, a.node)) {
      var c = "position: relative;";
      a.coverGutter && (c += "margin-left: -" + b.display.gutters.offsetWidth + "px;"), a.noHScroll && (c += "width: " + b.display.wrapper.clientWidth + "px;"), ph(b.display.measure, mh("div", [a.node], null, c));
    }

    return a.height = a.node.offsetHeight;
  }

  function zf(a, b, c, d) {
    var e = new wf(a, c, d),
        f = a.cm;
    return f && e.noHScroll && (f.display.alignWidgets = !0), te(a, b, "widget", function (b) {
      var c = b.widgets || (b.widgets = []);

      if (null == e.insertAt ? c.push(e) : c.splice(Math.min(c.length - 1, Math.max(0, e.insertAt)), 0, e), e.line = b, f && !uf(a, b)) {
        var d = jg(b) < a.scrollTop;
        gg(b, b.height + yf(e)), d && pe(f, null, e.height), f.curOp.forceUpdate = !0;
      }

      return !0;
    }), e;
  }

  function Bf(a, b, c, d) {
    a.text = b, a.stateAfter && (a.stateAfter = null), a.styles && (a.styles = null), null != a.order && (a.order = null), gf(a), hf(a, c);
    var e = d ? d(a) : 1;
    e != a.height && gg(a, e);
  }

  function Cf(a) {
    a.parent = null, gf(a);
  }

  function Df(a, b) {
    if (a) for (;;) {
      var c = a.match(/(?:^|\s+)line-(background-)?(\S+)/);
      if (!c) break;
      a = a.slice(0, c.index) + a.slice(c.index + c[0].length);
      var d = c[1] ? "bgClass" : "textClass";
      null == b[d] ? b[d] = c[2] : new RegExp("(?:^|s)" + c[2] + "(?:$|s)").test(b[d]) || (b[d] += " " + c[2]);
    }
    return a;
  }

  function Ef(a, b) {
    if (a.blankLine) return a.blankLine(b);

    if (a.innerMode) {
      var c = v.innerMode(a, b);
      return c.mode.blankLine ? c.mode.blankLine(c.state) : void 0;
    }
  }

  function Ff(a, b, c, d) {
    for (var e = 0; 10 > e; e++) {
      d && (d[0] = v.innerMode(a, c).mode);
      var f = a.token(b, c);
      if (b.pos > b.start) return f;
    }

    throw new Error("Mode " + a.name + " failed to advance stream.");
  }

  function Gf(a, b, c, d) {
    function e(a) {
      return {
        start: k.start,
        end: k.pos,
        string: k.current(),
        type: h || null,
        state: a ? Ge(f.mode, j) : j
      };
    }

    var h,
        f = a.doc,
        g = f.mode;
    b = Nb(f, b);
    var l,
        i = dg(f, b.line),
        j = kc(a, b.line, c),
        k = new Pe(i.text, a.options.tabSize);

    for (d && (l = []); (d || k.pos < b.ch) && !k.eol();) {
      k.start = k.pos, h = Ff(g, k, j), d && l.push(e(!0));
    }

    return d ? l : e();
  }

  function Hf(a, b, c, d, e, f, g) {
    var h = c.flattenSpans;
    null == h && (h = a.options.flattenSpans);
    var l,
        i = 0,
        j = null,
        k = new Pe(b, a.options.tabSize),
        m = a.options.addModeClass && [null];

    for ("" == b && Df(Ef(c, d), f); !k.eol();) {
      if (k.pos > a.options.maxHighlightLength ? (h = !1, g && Kf(a, b, d, k.pos), k.pos = b.length, l = null) : l = Df(Ff(c, k, d, m), f), m) {
        var n = m[0].name;
        n && (l = "m-" + (l ? n + " " + l : n));
      }

      if (!h || j != l) {
        for (; i < k.start;) {
          i = Math.min(k.start, i + 5e4), e(i, j);
        }

        j = l;
      }

      k.start = k.pos;
    }

    for (; i < k.pos;) {
      var o = Math.min(k.pos, i + 5e4);
      e(o, j), i = o;
    }
  }

  function If(a, b, c, d) {
    var e = [a.state.modeGen],
        f = {};
    Hf(a, b.text, a.doc.mode, c, function (a, b) {
      e.push(a, b);
    }, f, d);

    for (var g = 0; g < a.state.overlays.length; ++g) {
      var h = a.state.overlays[g],
          i = 1,
          j = 0;
      Hf(a, b.text, h.mode, !0, function (a, b) {
        for (var c = i; a > j;) {
          var d = e[i];
          d > a && e.splice(i, 1, a, e[i + 1], d), i += 2, j = Math.min(a, d);
        }

        if (b) if (h.opaque) e.splice(c, i - c, a, "cm-overlay " + b), i = c + 2;else for (; i > c; c += 2) {
          var f = e[c + 1];
          e[c + 1] = (f ? f + " " : "") + "cm-overlay " + b;
        }
      }, f);
    }

    return {
      styles: e,
      classes: f.bgClass || f.textClass ? f : null
    };
  }

  function Jf(a, b, c) {
    if (!b.styles || b.styles[0] != a.state.modeGen) {
      var d = If(a, b, b.stateAfter = kc(a, hg(b)));
      b.styles = d.styles, d.classes ? b.styleClasses = d.classes : b.styleClasses && (b.styleClasses = null), c === a.doc.frontier && a.doc.frontier++;
    }

    return b.styles;
  }

  function Kf(a, b, c, d) {
    var e = a.doc.mode,
        f = new Pe(b, a.options.tabSize);

    for (f.start = f.pos = d || 0, "" == b && Ef(e, c); !f.eol() && f.pos <= a.options.maxHighlightLength;) {
      Ff(e, f, c), f.start = f.pos;
    }
  }

  function Nf(a, b) {
    if (!a || /^\s*$/.test(a)) return null;
    var c = b.addModeClass ? Mf : Lf;
    return c[a] || (c[a] = a.replace(/\S+/g, "cm-$&"));
  }

  function Of(a, b) {
    var c = mh("span", null, null, f ? "padding-right: .1px" : null),
        e = {
      pre: mh("pre", [c]),
      content: c,
      col: 0,
      pos: 0,
      cm: a,
      splitSpaces: (d || f) && a.getOption("lineWrapping")
    };
    b.measure = {};

    for (var g = 0; g <= (b.rest ? b.rest.length : 0); g++) {
      var i,
          h = g ? b.rest[g - 1] : b.line;
      e.pos = 0, e.addToken = Qf, Eh(a.display.measure) && (i = kg(h)) && (e.addToken = Sf(e.addToken, i)), e.map = [];
      var j = b != a.display.externalMeasured && hg(h);
      Uf(h, e, Jf(a, h, j)), h.styleClasses && (h.styleClasses.bgClass && (e.bgClass = vh(h.styleClasses.bgClass, e.bgClass || "")), h.styleClasses.textClass && (e.textClass = vh(h.styleClasses.textClass, e.textClass || ""))), 0 == e.map.length && e.map.push(0, 0, e.content.appendChild(Ch(a.display.measure))), 0 == g ? (b.measure.map = e.map, b.measure.cache = {}) : ((b.measure.maps || (b.measure.maps = [])).push(e.map), (b.measure.caches || (b.measure.caches = [])).push({}));
    }

    return f && /\bcm-tab\b/.test(e.content.lastChild.className) && (e.content.className = "cm-tab-wrap-hack"), Ig(a, "renderLine", a, b.line, e.pre), e.pre.className && (e.textClass = vh(e.pre.className, e.textClass || "")), e;
  }

  function Pf(a) {
    var b = mh("span", "\u2022", "cm-invalidchar");
    return b.title = "\\u" + a.charCodeAt(0).toString(16), b.setAttribute("aria-label", b.title), b;
  }

  function Qf(a, b, c, f, g, h, i) {
    if (b) {
      var j = a.splitSpaces ? b.replace(/ {3,}/g, Rf) : b,
          k = a.cm.state.specialChars,
          l = !1;
      if (k.test(b)) for (var m = document.createDocumentFragment(), n = 0;;) {
        k.lastIndex = n;
        var o = k.exec(b),
            p = o ? o.index - n : b.length - n;

        if (p) {
          var q = document.createTextNode(j.slice(n, n + p));
          d && 9 > e ? m.appendChild(mh("span", [q])) : m.appendChild(q), a.map.push(a.pos, a.pos + p, q), a.col += p, a.pos += p;
        }

        if (!o) break;

        if (n += p + 1, "	" == o[0]) {
          var r = a.cm.options.tabSize,
              s = r - a.col % r,
              q = m.appendChild(mh("span", Zg(s), "cm-tab"));
          q.setAttribute("role", "presentation"), q.setAttribute("cm-text", "	"), a.col += s;
        } else {
          var q = a.cm.options.specialCharPlaceholder(o[0]);
          q.setAttribute("cm-text", o[0]), d && 9 > e ? m.appendChild(mh("span", [q])) : m.appendChild(q), a.col += 1;
        }

        a.map.push(a.pos, a.pos + 1, q), a.pos++;
      } else {
        a.col += b.length;
        var m = document.createTextNode(j);
        a.map.push(a.pos, a.pos + b.length, m), d && 9 > e && (l = !0), a.pos += b.length;
      }

      if (c || f || g || l || i) {
        var t = c || "";
        f && (t += f), g && (t += g);
        var u = mh("span", [m], t, i);
        return h && (u.title = h), a.content.appendChild(u);
      }

      a.content.appendChild(m);
    }
  }

  function Rf(a) {
    for (var b = " ", c = 0; c < a.length - 2; ++c) {
      b += c % 2 ? " " : "\xa0";
    }

    return b += " ";
  }

  function Sf(a, b) {
    return function (c, d, e, f, g, h, i) {
      e = e ? e + " cm-force-border" : "cm-force-border";

      for (var j = c.pos, k = j + d.length;;) {
        for (var l = 0; l < b.length; l++) {
          var m = b[l];
          if (m.to > j && m.from <= j) break;
        }

        if (m.to >= k) return a(c, d, e, f, g, h, i);
        a(c, d.slice(0, m.to - j), e, f, null, h, i), f = null, d = d.slice(m.to - j), j = m.to;
      }
    };
  }

  function Tf(a, b, c, d) {
    var e = !d && c.widgetNode;
    e && a.map.push(a.pos, a.pos + b, e), !d && a.cm.display.input.needsContentAttribute && (e || (e = a.content.appendChild(document.createElement("span"))), e.setAttribute("cm-marker", c.id)), e && (a.cm.display.input.setUneditable(e), a.content.appendChild(e)), a.pos += b;
  }

  function Uf(a, b, c) {
    var d = a.markedSpans,
        e = a.text,
        f = 0;
    if (d) for (var k, l, n, o, p, q, r, h = e.length, i = 0, g = 1, j = "", m = 0;;) {
      if (m == i) {
        n = o = p = q = l = "", r = null, m = 1 / 0;

        for (var s = [], t = 0; t < d.length; ++t) {
          var u = d[t],
              v = u.marker;
          "bookmark" == v.type && u.from == i && v.widgetNode ? s.push(v) : u.from <= i && (null == u.to || u.to > i || v.collapsed && u.to == i && u.from == i) ? (null != u.to && u.to != i && m > u.to && (m = u.to, o = ""), v.className && (n += " " + v.className), v.css && (l = v.css), v.startStyle && u.from == i && (p += " " + v.startStyle), v.endStyle && u.to == m && (o += " " + v.endStyle), v.title && !q && (q = v.title), v.collapsed && (!r || lf(r.marker, v) < 0) && (r = u)) : u.from > i && m > u.from && (m = u.from);
        }

        if (r && (r.from || 0) == i) {
          if (Tf(b, (null == r.to ? h + 1 : r.to) - i, r.marker, null == r.from), null == r.to) return;
          r.to == i && (r = !1);
        }

        if (!r && s.length) for (var t = 0; t < s.length; ++t) {
          Tf(b, 0, s[t]);
        }
      }

      if (i >= h) break;

      for (var w = Math.min(h, m);;) {
        if (j) {
          var x = i + j.length;

          if (!r) {
            var y = x > w ? j.slice(0, w - i) : j;
            b.addToken(b, y, k ? k + n : n, p, i + y.length == m ? o : "", q, l);
          }

          if (x >= w) {
            j = j.slice(w - i), i = w;
            break;
          }

          i = x, p = "";
        }

        j = e.slice(f, f = c[g++]), k = Nf(c[g++], b.cm.options);
      }
    } else for (var g = 1; g < c.length; g += 2) {
      b.addToken(b, e.slice(f, f = c[g]), Nf(c[g + 1], b.cm.options));
    }
  }

  function Vf(a, b) {
    return 0 == b.from.ch && 0 == b.to.ch && "" == $g(b.text) && (!a.cm || a.cm.options.wholeLineUpdateBefore);
  }

  function Wf(a, b, c, d) {
    function e(a) {
      return c ? c[a] : null;
    }

    function f(a, c, e) {
      Bf(a, c, e, d), Kg(a, "change", a, b);
    }

    function g(a, b) {
      for (var c = a, f = []; b > c; ++c) {
        f.push(new Af(j[c], e(c), d));
      }

      return f;
    }

    var h = b.from,
        i = b.to,
        j = b.text,
        k = dg(a, h.line),
        l = dg(a, i.line),
        m = $g(j),
        n = e(j.length - 1),
        o = i.line - h.line;
    if (b.full) a.insert(0, g(0, j.length)), a.remove(j.length, a.size - j.length);else if (Vf(a, b)) {
      var p = g(0, j.length - 1);
      f(l, l.text, n), o && a.remove(h.line, o), p.length && a.insert(h.line, p);
    } else if (k == l) {
      if (1 == j.length) f(k, k.text.slice(0, h.ch) + m + k.text.slice(i.ch), n);else {
        var p = g(1, j.length - 1);
        p.push(new Af(m + k.text.slice(i.ch), n, d)), f(k, k.text.slice(0, h.ch) + j[0], e(0)), a.insert(h.line + 1, p);
      }
    } else if (1 == j.length) f(k, k.text.slice(0, h.ch) + j[0] + l.text.slice(i.ch), e(0)), a.remove(h.line + 1, o);else {
      f(k, k.text.slice(0, h.ch) + j[0], e(0)), f(l, m + l.text.slice(i.ch), n);
      var p = g(1, j.length - 1);
      o > 1 && a.remove(h.line + 1, o - 1), a.insert(h.line + 1, p);
    }
    Kg(a, "change", a, b);
  }

  function Xf(a) {
    this.lines = a, this.parent = null;

    for (var b = 0, c = 0; b < a.length; ++b) {
      a[b].parent = this, c += a[b].height;
    }

    this.height = c;
  }

  function Yf(a) {
    this.children = a;

    for (var b = 0, c = 0, d = 0; d < a.length; ++d) {
      var e = a[d];
      b += e.chunkSize(), c += e.height, e.parent = this;
    }

    this.size = b, this.height = c, this.parent = null;
  }

  function bg(a, b, c) {
    function d(a, e, f) {
      if (a.linked) for (var g = 0; g < a.linked.length; ++g) {
        var h = a.linked[g];

        if (h.doc != e) {
          var i = f && h.sharedHist;
          (!c || i) && (b(h.doc, i), d(h.doc, a, i));
        }
      }
    }

    d(a, null, !0);
  }

  function cg(a, b) {
    if (b.cm) throw new Error("This document is already in use.");
    a.doc = b, b.cm = a, B(a), x(a), a.options.lineWrapping || H(a), a.options.mode = b.modeOption, hd(a);
  }

  function dg(a, b) {
    if (b -= a.first, 0 > b || b >= a.size) throw new Error("There is no line " + (b + a.first) + " in the document.");

    for (var c = a; !c.lines;) {
      for (var d = 0;; ++d) {
        var e = c.children[d],
            f = e.chunkSize();

        if (f > b) {
          c = e;
          break;
        }

        b -= f;
      }
    }

    return c.lines[b];
  }

  function eg(a, b, c) {
    var d = [],
        e = b.line;
    return a.iter(b.line, c.line + 1, function (a) {
      var f = a.text;
      e == c.line && (f = f.slice(0, c.ch)), e == b.line && (f = f.slice(b.ch)), d.push(f), ++e;
    }), d;
  }

  function fg(a, b, c) {
    var d = [];
    return a.iter(b, c, function (a) {
      d.push(a.text);
    }), d;
  }

  function gg(a, b) {
    var c = b - a.height;
    if (c) for (var d = a; d; d = d.parent) {
      d.height += c;
    }
  }

  function hg(a) {
    if (null == a.parent) return null;

    for (var b = a.parent, c = ah(b.lines, a), d = b.parent; d; b = d, d = d.parent) {
      for (var e = 0; d.children[e] != b; ++e) {
        c += d.children[e].chunkSize();
      }
    }

    return c + b.first;
  }

  function ig(a, b) {
    var c = a.first;

    a: do {
      for (var d = 0; d < a.children.length; ++d) {
        var e = a.children[d],
            f = e.height;

        if (f > b) {
          a = e;
          continue a;
        }

        b -= f, c += e.chunkSize();
      }

      return c;
    } while (!a.lines);

    for (var d = 0; d < a.lines.length; ++d) {
      var g = a.lines[d],
          h = g.height;
      if (h > b) break;
      b -= h;
    }

    return c + d;
  }

  function jg(a) {
    a = qf(a);

    for (var b = 0, c = a.parent, d = 0; d < c.lines.length; ++d) {
      var e = c.lines[d];
      if (e == a) break;
      b += e.height;
    }

    for (var f = c.parent; f; c = f, f = c.parent) {
      for (var d = 0; d < f.children.length; ++d) {
        var g = f.children[d];
        if (g == c) break;
        b += g.height;
      }
    }

    return b;
  }

  function kg(a) {
    var b = a.order;
    return null == b && (b = a.order = Zh(a.text)), b;
  }

  function lg(a) {
    this.done = [], this.undone = [], this.undoDepth = 1 / 0, this.lastModTime = this.lastSelTime = 0, this.lastOp = this.lastSelOp = null, this.lastOrigin = this.lastSelOrigin = null, this.generation = this.maxGeneration = a || 1;
  }

  function mg(a, b) {
    var c = {
      from: qb(b.from),
      to: $d(b),
      text: eg(a, b.from, b.to)
    };
    return tg(a, c, b.from.line, b.to.line + 1), bg(a, function (a) {
      tg(a, c, b.from.line, b.to.line + 1);
    }, !0), c;
  }

  function ng(a) {
    for (; a.length;) {
      var b = $g(a);
      if (!b.ranges) break;
      a.pop();
    }
  }

  function og(a, b) {
    return b ? (ng(a.done), $g(a.done)) : a.done.length && !$g(a.done).ranges ? $g(a.done) : a.done.length > 1 && !a.done[a.done.length - 2].ranges ? (a.done.pop(), $g(a.done)) : void 0;
  }

  function pg(a, b, c, d) {
    var e = a.history;
    e.undone.length = 0;
    var g,
        f = +new Date();

    if ((e.lastOp == d || e.lastOrigin == b.origin && b.origin && ("+" == b.origin.charAt(0) && a.cm && e.lastModTime > f - a.cm.options.historyEventDelay || "*" == b.origin.charAt(0))) && (g = og(e, e.lastOp == d))) {
      var h = $g(g.changes);
      0 == pb(b.from, b.to) && 0 == pb(b.from, h.to) ? h.to = $d(b) : g.changes.push(mg(a, b));
    } else {
      var i = $g(e.done);

      for (i && i.ranges || sg(a.sel, e.done), g = {
        changes: [mg(a, b)],
        generation: e.generation
      }, e.done.push(g); e.done.length > e.undoDepth;) {
        e.done.shift(), e.done[0].ranges || e.done.shift();
      }
    }

    e.done.push(c), e.generation = ++e.maxGeneration, e.lastModTime = e.lastSelTime = f, e.lastOp = e.lastSelOp = d, e.lastOrigin = e.lastSelOrigin = b.origin, h || Ig(a, "historyAdded");
  }

  function qg(a, b, c, d) {
    var e = b.charAt(0);
    return "*" == e || "+" == e && c.ranges.length == d.ranges.length && c.somethingSelected() == d.somethingSelected() && new Date() - a.history.lastSelTime <= (a.cm ? a.cm.options.historyEventDelay : 500);
  }

  function rg(a, b, c, d) {
    var e = a.history,
        f = d && d.origin;
    c == e.lastSelOp || f && e.lastSelOrigin == f && (e.lastModTime == e.lastSelTime && e.lastOrigin == f || qg(a, f, $g(e.done), b)) ? e.done[e.done.length - 1] = b : sg(b, e.done), e.lastSelTime = +new Date(), e.lastSelOrigin = f, e.lastSelOp = c, d && d.clearRedo !== !1 && ng(e.undone);
  }

  function sg(a, b) {
    var c = $g(b);
    c && c.ranges && c.equals(a) || b.push(a);
  }

  function tg(a, b, c, d) {
    var e = b["spans_" + a.id],
        f = 0;
    a.iter(Math.max(a.first, c), Math.min(a.first + a.size, d), function (c) {
      c.markedSpans && ((e || (e = b["spans_" + a.id] = {}))[f] = c.markedSpans), ++f;
    });
  }

  function ug(a) {
    if (!a) return null;

    for (var c, b = 0; b < a.length; ++b) {
      a[b].marker.explicitlyCleared ? c || (c = a.slice(0, b)) : c && c.push(a[b]);
    }

    return c ? c.length ? c : null : a;
  }

  function vg(a, b) {
    var c = b["spans_" + a.id];
    if (!c) return null;

    for (var d = 0, e = []; d < b.text.length; ++d) {
      e.push(ug(c[d]));
    }

    return e;
  }

  function wg(a, b, c) {
    for (var d = 0, e = []; d < a.length; ++d) {
      var f = a[d];
      if (f.ranges) e.push(c ? Ib.prototype.deepCopy.call(f) : f);else {
        var g = f.changes,
            h = [];
        e.push({
          changes: h
        });

        for (var i = 0; i < g.length; ++i) {
          var k,
              j = g[i];
          if (h.push({
            from: j.from,
            to: j.to,
            text: j.text
          }), b) for (var l in j) {
            (k = l.match(/^spans_(\d+)$/)) && ah(b, Number(k[1])) > -1 && ($g(h)[l] = j[l], delete j[l]);
          }
        }
      }
    }

    return e;
  }

  function xg(a, b, c, d) {
    c < a.line ? a.line += d : b < a.line && (a.line = b, a.ch = 0);
  }

  function yg(a, b, c, d) {
    for (var e = 0; e < a.length; ++e) {
      var f = a[e],
          g = !0;

      if (f.ranges) {
        f.copied || (f = a[e] = f.deepCopy(), f.copied = !0);

        for (var h = 0; h < f.ranges.length; h++) {
          xg(f.ranges[h].anchor, b, c, d), xg(f.ranges[h].head, b, c, d);
        }
      } else {
        for (var h = 0; h < f.changes.length; ++h) {
          var i = f.changes[h];
          if (c < i.from.line) i.from = ob(i.from.line + d, i.from.ch), i.to = ob(i.to.line + d, i.to.ch);else if (b <= i.to.line) {
            g = !1;
            break;
          }
        }

        g || (a.splice(0, e + 1), e = 0);
      }
    }
  }

  function zg(a, b) {
    var c = b.from.line,
        d = b.to.line,
        e = b.text.length - (d - c) - 1;
    yg(a.done, c, d, e), yg(a.undone, c, d, e);
  }

  function Cg(a) {
    return null != a.defaultPrevented ? a.defaultPrevented : 0 == a.returnValue;
  }

  function Eg(a) {
    return a.target || a.srcElement;
  }

  function Fg(a) {
    var b = a.which;
    return null == b && (1 & a.button ? b = 1 : 2 & a.button ? b = 3 : 4 & a.button && (b = 2)), o && a.ctrlKey && 1 == b && (b = 3), b;
  }

  function Kg(a, b) {
    function f(a) {
      return function () {
        a.apply(null, d);
      };
    }

    var c = a._handlers && a._handlers[b];

    if (c) {
      var e,
          d = Array.prototype.slice.call(arguments, 2);
      Sc ? e = Sc.delayedCallbacks : Jg ? e = Jg : (e = Jg = [], setTimeout(Lg, 0));

      for (var g = 0; g < c.length; ++g) {
        e.push(f(c[g]));
      }
    }
  }

  function Lg() {
    var a = Jg;
    Jg = null;

    for (var b = 0; b < a.length; ++b) {
      a[b]();
    }
  }

  function Mg(a, b, c) {
    return "string" == typeof b && (b = {
      type: b,
      preventDefault: function preventDefault() {
        this.defaultPrevented = !0;
      }
    }), Ig(a, c || b.type, a, b), Cg(b) || b.codemirrorIgnore;
  }

  function Ng(a) {
    var b = a._handlers && a._handlers.cursorActivity;
    if (b) for (var c = a.curOp.cursorActivityHandlers || (a.curOp.cursorActivityHandlers = []), d = 0; d < b.length; ++d) {
      -1 == ah(c, b[d]) && c.push(b[d]);
    }
  }

  function Og(a, b) {
    var c = a._handlers && a._handlers[b];
    return c && c.length > 0;
  }

  function Pg(a) {
    a.prototype.on = function (a, b) {
      Gg(this, a, b);
    }, a.prototype.off = function (a, b) {
      Hg(this, a, b);
    };
  }

  function Vg() {
    this.id = null;
  }

  function Xg(a, b, c) {
    for (var d = 0, e = 0;;) {
      var f = a.indexOf("	", d);
      -1 == f && (f = a.length);
      var g = f - d;
      if (f == a.length || e + g >= b) return d + Math.min(g, b - e);
      if (e += f - d, e += c - e % c, d = f + 1, e >= b) return d;
    }
  }

  function Zg(a) {
    for (; Yg.length <= a;) {
      Yg.push($g(Yg) + " ");
    }

    return Yg[a];
  }

  function $g(a) {
    return a[a.length - 1];
  }

  function ah(a, b) {
    for (var c = 0; c < a.length; ++c) {
      if (a[c] == b) return c;
    }

    return -1;
  }

  function bh(a, b) {
    for (var c = [], d = 0; d < a.length; d++) {
      c[d] = b(a[d], d);
    }

    return c;
  }

  function ch() {}

  function dh(a, b) {
    var c;
    return Object.create ? c = Object.create(a) : (ch.prototype = a, c = new ch()), b && eh(b, c), c;
  }

  function eh(a, b, c) {
    b || (b = {});

    for (var d in a) {
      !a.hasOwnProperty(d) || c === !1 && b.hasOwnProperty(d) || (b[d] = a[d]);
    }

    return b;
  }

  function fh(a) {
    var b = Array.prototype.slice.call(arguments, 1);
    return function () {
      return a.apply(null, b);
    };
  }

  function ih(a, b) {
    return b ? b.source.indexOf("\\w") > -1 && hh(a) ? !0 : b.test(a) : hh(a);
  }

  function jh(a) {
    for (var b in a) {
      if (a.hasOwnProperty(b) && a[b]) return !1;
    }

    return !0;
  }

  function lh(a) {
    return a.charCodeAt(0) >= 768 && kh.test(a);
  }

  function mh(a, b, c, d) {
    var e = document.createElement(a);
    if (c && (e.className = c), d && (e.style.cssText = d), "string" == typeof b) e.appendChild(document.createTextNode(b));else if (b) for (var f = 0; f < b.length; ++f) {
      e.appendChild(b[f]);
    }
    return e;
  }

  function oh(a) {
    for (var b = a.childNodes.length; b > 0; --b) {
      a.removeChild(a.firstChild);
    }

    return a;
  }

  function ph(a, b) {
    return oh(a).appendChild(b);
  }

  function rh() {
    return document.activeElement;
  }

  function sh(a) {
    return new RegExp("(^|\\s)" + a + "(?:$|\\s)\\s*");
  }

  function vh(a, b) {
    for (var c = a.split(" "), d = 0; d < c.length; d++) {
      c[d] && !sh(c[d]).test(b) && (b += " " + c[d]);
    }

    return b;
  }

  function wh(a) {
    if (document.body.getElementsByClassName) for (var b = document.body.getElementsByClassName("CodeMirror"), c = 0; c < b.length; c++) {
      var d = b[c].CodeMirror;
      d && a(d);
    }
  }

  function yh() {
    xh || (zh(), xh = !0);
  }

  function zh() {
    var a;
    Gg(window, "resize", function () {
      null == a && (a = setTimeout(function () {
        a = null, wh(qd);
      }, 100));
    }), Gg(window, "blur", function () {
      wh(Xd);
    });
  }

  function Ch(a) {
    if (null == Bh) {
      var b = mh("span", "\u200B");
      ph(a, mh("span", [b, document.createTextNode("x")])), 0 != a.firstChild.offsetHeight && (Bh = b.offsetWidth <= 1 && b.offsetHeight > 2 && !(d && 8 > e));
    }

    var c = Bh ? mh("span", "\u200B") : mh("span", "\xa0", null, "display: inline-block; width: 1px; margin-right: -1px");
    return c.setAttribute("cm-text", ""), c;
  }

  function Eh(a) {
    if (null != Dh) return Dh;
    var b = ph(a, document.createTextNode("A\u062EA")),
        c = nh(b, 0, 1).getBoundingClientRect();
    if (!c || c.left == c.right) return !1;
    var d = nh(b, 1, 2).getBoundingClientRect();
    return Dh = d.right - c.right < 3;
  }

  function Jh(a) {
    if (null != Ih) return Ih;
    var b = ph(a, mh("span", "x")),
        c = b.getBoundingClientRect(),
        d = nh(b, 0, 1).getBoundingClientRect();
    return Ih = Math.abs(c.left - d.left) > 1;
  }

  function Lh(a, b, c, d) {
    if (!a) return d(b, c, "ltr");

    for (var e = !1, f = 0; f < a.length; ++f) {
      var g = a[f];
      (g.from < c && g.to > b || b == c && g.to == b) && (d(Math.max(g.from, b), Math.min(g.to, c), 1 == g.level ? "rtl" : "ltr"), e = !0);
    }

    e || d(b, c, "ltr");
  }

  function Mh(a) {
    return a.level % 2 ? a.to : a.from;
  }

  function Nh(a) {
    return a.level % 2 ? a.from : a.to;
  }

  function Oh(a) {
    var b = kg(a);
    return b ? Mh(b[0]) : 0;
  }

  function Ph(a) {
    var b = kg(a);
    return b ? Nh($g(b)) : a.text.length;
  }

  function Qh(a, b) {
    var c = dg(a.doc, b),
        d = qf(c);
    d != c && (b = hg(d));
    var e = kg(d),
        f = e ? e[0].level % 2 ? Ph(d) : Oh(d) : 0;
    return ob(b, f);
  }

  function Rh(a, b) {
    for (var c, d = dg(a.doc, b); c = of(d);) {
      d = c.find(1, !0).line, b = null;
    }

    var e = kg(d),
        f = e ? e[0].level % 2 ? Oh(d) : Ph(d) : d.text.length;
    return ob(null == b ? hg(d) : b, f);
  }

  function Sh(a, b) {
    var c = Qh(a, b.line),
        d = dg(a.doc, c.line),
        e = kg(d);

    if (!e || 0 == e[0].level) {
      var f = Math.max(0, d.text.search(/\S/)),
          g = b.line == c.line && b.ch <= f && b.ch;
      return ob(c.line, g ? 0 : f);
    }

    return c;
  }

  function Th(a, b, c) {
    var d = a[0].level;
    return b == d ? !0 : c == d ? !1 : c > b;
  }

  function Vh(a, b) {
    Uh = null;

    for (var d, c = 0; c < a.length; ++c) {
      var e = a[c];
      if (e.from < b && e.to > b) return c;

      if (e.from == b || e.to == b) {
        if (null != d) return Th(a, e.level, a[d].level) ? (e.from != e.to && (Uh = d), c) : (e.from != e.to && (Uh = c), d);
        d = c;
      }
    }

    return d;
  }

  function Wh(a, b, c, d) {
    if (!d) return b + c;

    do {
      b += c;
    } while (b > 0 && lh(a.text.charAt(b)));

    return b;
  }

  function Xh(a, b, c, d) {
    var e = kg(a);
    if (!e) return Yh(a, b, c, d);

    for (var f = Vh(e, b), g = e[f], h = Wh(a, b, g.level % 2 ? -c : c, d);;) {
      if (h > g.from && h < g.to) return h;
      if (h == g.from || h == g.to) return Vh(e, h) == f ? h : (g = e[f += c], c > 0 == g.level % 2 ? g.to : g.from);
      if (g = e[f += c], !g) return null;
      h = c > 0 == g.level % 2 ? Wh(a, g.to, -1, d) : Wh(a, g.from, 1, d);
    }
  }

  function Yh(a, b, c, d) {
    var e = b + c;
    if (d) for (; e > 0 && lh(a.text.charAt(e));) {
      e += c;
    }
    return 0 > e || e > a.text.length ? null : e;
  }

  var a = /gecko\/\d/i.test(navigator.userAgent),
      b = /MSIE \d/.test(navigator.userAgent),
      c = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent),
      d = b || c,
      e = d && (b ? document.documentMode || 6 : c[1]),
      f = /WebKit\//.test(navigator.userAgent),
      g = f && /Qt\/\d+\.\d+/.test(navigator.userAgent),
      h = /Chrome\//.test(navigator.userAgent),
      i = /Opera\//.test(navigator.userAgent),
      j = /Apple Computer/.test(navigator.vendor),
      k = /Mac OS X 1\d\D([8-9]|\d\d)\D/.test(navigator.userAgent),
      l = /PhantomJS/.test(navigator.userAgent),
      m = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent),
      n = m || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent),
      o = m || /Mac/.test(navigator.platform),
      p = /win/i.test(navigator.platform),
      q = i && navigator.userAgent.match(/Version\/(\d*\.\d*)/);
  q && (q = Number(q[1])), q && q >= 15 && (i = !1, f = !0);
  var r = o && (g || i && (null == q || 12.11 > q)),
      s = a || d && e >= 9,
      t = !1,
      u = !1;
  K.prototype = eh({
    update: function update(a) {
      var b = a.scrollWidth > a.clientWidth + 1,
          c = a.scrollHeight > a.clientHeight + 1,
          d = a.nativeBarWidth;

      if (c) {
        this.vert.style.display = "block", this.vert.style.bottom = b ? d + "px" : "0";
        var e = a.viewHeight - (b ? d : 0);
        this.vert.firstChild.style.height = Math.max(0, a.scrollHeight - a.clientHeight + e) + "px";
      } else this.vert.style.display = "", this.vert.firstChild.style.height = "0";

      if (b) {
        this.horiz.style.display = "block", this.horiz.style.right = c ? d + "px" : "0", this.horiz.style.left = a.barLeft + "px";
        var f = a.viewWidth - a.barLeft - (c ? d : 0);
        this.horiz.firstChild.style.width = a.scrollWidth - a.clientWidth + f + "px";
      } else this.horiz.style.display = "", this.horiz.firstChild.style.width = "0";

      return !this.checkedOverlay && a.clientHeight > 0 && (0 == d && this.overlayHack(), this.checkedOverlay = !0), {
        right: c ? d : 0,
        bottom: b ? d : 0
      };
    },
    setScrollLeft: function setScrollLeft(a) {
      this.horiz.scrollLeft != a && (this.horiz.scrollLeft = a);
    },
    setScrollTop: function setScrollTop(a) {
      this.vert.scrollTop != a && (this.vert.scrollTop = a);
    },
    overlayHack: function overlayHack() {
      var a = o && !k ? "12px" : "18px";
      this.horiz.style.minHeight = this.vert.style.minWidth = a;

      var b = this,
          c = function c(a) {
        Eg(a) != b.vert && Eg(a) != b.horiz && cd(b.cm, td)(a);
      };

      Gg(this.vert, "mousedown", c), Gg(this.horiz, "mousedown", c);
    },
    clear: function clear() {
      var a = this.horiz.parentNode;
      a.removeChild(this.horiz), a.removeChild(this.vert);
    }
  }, K.prototype), L.prototype = eh({
    update: function update() {
      return {
        bottom: 0,
        right: 0
      };
    },
    setScrollLeft: function setScrollLeft() {},
    setScrollTop: function setScrollTop() {},
    clear: function clear() {}
  }, L.prototype), v.scrollbarModel = {
    "native": K,
    "null": L
  }, U.prototype.signal = function (a, b) {
    Og(a, b) && this.events.push(arguments);
  }, U.prototype.finish = function () {
    for (var a = 0; a < this.events.length; a++) {
      Ig.apply(null, this.events[a]);
    }
  };

  var ob = v.Pos = function (a, b) {
    return this instanceof ob ? (this.line = a, this.ch = b, void 0) : new ob(a, b);
  },
      pb = v.cmpPos = function (a, b) {
    return a.line - b.line || a.ch - b.ch;
  },
      vb = null;

  Ab.prototype = eh({
    init: function init(a) {
      function i(a) {
        if (c.somethingSelected()) vb = c.getSelections(), b.inaccurateSelection && (b.prevInput = "", b.inaccurateSelection = !1, h.value = vb.join("\n"), _g(h));else {
          if (!c.options.lineWiseCopyCut) return;
          var d = yb(c);
          vb = d.text, "cut" == a.type ? c.setSelections(d.ranges, null, Sg) : (b.prevInput = "", h.value = d.text.join("\n"), _g(h));
        }
        "cut" == a.type && (c.state.cutIncoming = !0);
      }

      var b = this,
          c = this.cm,
          g = this.wrapper = Bb(),
          h = this.textarea = g.firstChild;
      a.wrapper.insertBefore(g, a.wrapper.firstChild), m && (h.style.width = "0px"), Gg(h, "input", function () {
        d && e >= 9 && b.hasSelection && (b.hasSelection = null), b.poll();
      }), Gg(h, "paste", function () {
        if (f && !c.state.fakedLastChar && !(new Date() - c.state.lastMiddleDown < 200)) {
          var a = h.selectionStart,
              d = h.selectionEnd;
          h.value += "$", h.selectionEnd = d, h.selectionStart = a, c.state.fakedLastChar = !0;
        }

        c.state.pasteIncoming = !0, b.fastPoll();
      }), Gg(h, "cut", i), Gg(h, "copy", i), Gg(a.scroller, "paste", function (d) {
        rd(a, d) || (c.state.pasteIncoming = !0, b.focus());
      }), Gg(a.lineSpace, "selectstart", function (b) {
        rd(a, b) || Ag(b);
      }), Gg(h, "compositionstart", function () {
        var a = c.getCursor("from");
        b.composing = {
          start: a,
          range: c.markText(a, c.getCursor("to"), {
            className: "CodeMirror-composing"
          })
        };
      }), Gg(h, "compositionend", function () {
        b.composing && (b.poll(), b.composing.range.clear(), b.composing = null);
      });
    },
    prepareSelection: function prepareSelection() {
      var a = this.cm,
          b = a.display,
          c = a.doc,
          d = dc(a);

      if (a.options.moveInputWithCursor) {
        var e = Kc(a, c.sel.primary().head, "div"),
            f = b.wrapper.getBoundingClientRect(),
            g = b.lineDiv.getBoundingClientRect();
        d.teTop = Math.max(0, Math.min(b.wrapper.clientHeight - 10, e.top + g.top - f.top)), d.teLeft = Math.max(0, Math.min(b.wrapper.clientWidth - 10, e.left + g.left - f.left));
      }

      return d;
    },
    showSelection: function showSelection(a) {
      var b = this.cm,
          c = b.display;
      ph(c.cursorDiv, a.cursors), ph(c.selectionDiv, a.selection), null != a.teTop && (this.wrapper.style.top = a.teTop + "px", this.wrapper.style.left = a.teLeft + "px");
    },
    reset: function reset(a) {
      if (!this.contextMenuPending) {
        var b,
            c,
            f = this.cm,
            g = f.doc;

        if (f.somethingSelected()) {
          this.prevInput = "";
          var h = g.sel.primary();
          b = Hh && (h.to().line - h.from().line > 100 || (c = f.getSelection()).length > 1e3);
          var i = b ? "-" : c || f.getSelection();
          this.textarea.value = i, f.state.focused && _g(this.textarea), d && e >= 9 && (this.hasSelection = i);
        } else a || (this.prevInput = this.textarea.value = "", d && e >= 9 && (this.hasSelection = null));

        this.inaccurateSelection = b;
      }
    },
    getField: function getField() {
      return this.textarea;
    },
    supportsTouch: function supportsTouch() {
      return !1;
    },
    focus: function focus() {
      if ("nocursor" != this.cm.options.readOnly && (!n || rh() != this.textarea)) try {
        this.textarea.focus();
      } catch (a) {}
    },
    blur: function blur() {
      this.textarea.blur();
    },
    resetPosition: function resetPosition() {
      this.wrapper.style.top = this.wrapper.style.left = 0;
    },
    receivedFocus: function receivedFocus() {
      this.slowPoll();
    },
    slowPoll: function slowPoll() {
      var a = this;
      a.pollingFast || a.polling.set(this.cm.options.pollInterval, function () {
        a.poll(), a.cm.state.focused && a.slowPoll();
      });
    },
    fastPoll: function fastPoll() {
      function c() {
        var d = b.poll();
        d || a ? (b.pollingFast = !1, b.slowPoll()) : (a = !0, b.polling.set(60, c));
      }

      var a = !1,
          b = this;
      b.pollingFast = !0, b.polling.set(20, c);
    },
    poll: function poll() {
      var a = this.cm,
          b = this.textarea,
          c = this.prevInput;
      if (this.contextMenuPending || !a.state.focused || Gh(b) && !c || ub(a) || a.options.disableInput || a.state.keySeq) return !1;
      a.state.pasteIncoming && a.state.fakedLastChar && (b.value = b.value.substring(0, b.value.length - 1), a.state.fakedLastChar = !1);
      var f = b.value;
      if (f == c && !a.somethingSelected()) return !1;
      if (d && e >= 9 && this.hasSelection === f || o && /[\uf700-\uf7ff]/.test(f)) return a.display.input.reset(), !1;

      if (a.doc.sel == a.display.selForContextMenu) {
        var g = f.charCodeAt(0);
        if (8203 != g || c || (c = "\u200B"), 8666 == g) return this.reset(), this.cm.execCommand("undo");
      }

      for (var h = 0, i = Math.min(c.length, f.length); i > h && c.charCodeAt(h) == f.charCodeAt(h);) {
        ++h;
      }

      var j = this;
      return bd(a, function () {
        wb(a, f.slice(h), c.length - h, null, j.composing ? "*compose" : null), f.length > 1e3 || f.indexOf("\n") > -1 ? b.value = j.prevInput = "" : j.prevInput = f, j.composing && (j.composing.range.clear(), j.composing.range = a.markText(j.composing.start, a.getCursor("to"), {
          className: "CodeMirror-composing"
        }));
      }), !0;
    },
    ensurePolled: function ensurePolled() {
      this.pollingFast && this.poll() && (this.pollingFast = !1);
    },
    onKeyPress: function onKeyPress() {
      d && e >= 9 && (this.hasSelection = null), this.fastPoll();
    },
    onContextMenu: function onContextMenu(a) {
      function o() {
        if (null != h.selectionStart) {
          var a = c.somethingSelected(),
              d = "\u200B" + (a ? h.value : "");
          h.value = "\u21DA", h.value = d, b.prevInput = a ? "" : "\u200B", h.selectionStart = 1, h.selectionEnd = d.length, g.selForContextMenu = c.doc.sel;
        }
      }

      function p() {
        if (b.contextMenuPending = !1, b.wrapper.style.position = "relative", h.style.cssText = m, d && 9 > e && g.scrollbars.setScrollTop(g.scroller.scrollTop = k), null != h.selectionStart) {
          (!d || d && 9 > e) && o();

          var a = 0,
              f = function f() {
            g.selForContextMenu == c.doc.sel && 0 == h.selectionStart && h.selectionEnd > 0 && "\u200B" == b.prevInput ? cd(c, Ie.selectAll)(c) : a++ < 10 ? g.detectingSelectAll = setTimeout(f, 500) : g.input.reset();
          };

          g.detectingSelectAll = setTimeout(f, 200);
        }
      }

      var b = this,
          c = b.cm,
          g = c.display,
          h = b.textarea,
          j = sd(c, a),
          k = g.scroller.scrollTop;

      if (j && !i) {
        var l = c.options.resetSelectionOnContextMenu;
        l && -1 == c.doc.sel.contains(j) && cd(c, Yb)(c.doc, Lb(j), Sg);
        var m = h.style.cssText;
        if (b.wrapper.style.position = "absolute", h.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (a.clientY - 5) + "px; left: " + (a.clientX - 5) + "px; z-index: 1000; background: " + (d ? "rgba(255, 255, 255, .05)" : "transparent") + "; outline: none; border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);", f) var n = window.scrollY;

        if (g.input.focus(), f && window.scrollTo(null, n), g.input.reset(), c.somethingSelected() || (h.value = b.prevInput = " "), b.contextMenuPending = !0, g.selForContextMenu = c.doc.sel, clearTimeout(g.detectingSelectAll), d && e >= 9 && o(), s) {
          Dg(a);

          var q = function q() {
            Hg(window, "mouseup", q), setTimeout(p, 20);
          };

          Gg(window, "mouseup", q);
        } else setTimeout(p, 50);
      }
    },
    setUneditable: ch,
    needsContentAttribute: !1
  }, Ab.prototype), Cb.prototype = eh({
    init: function init(a) {
      function e(a) {
        if (c.somethingSelected()) vb = c.getSelections(), "cut" == a.type && c.replaceSelection("", null, "cut");else {
          if (!c.options.lineWiseCopyCut) return;
          var b = yb(c);
          vb = b.text, "cut" == a.type && c.operation(function () {
            c.setSelections(b.ranges, 0, Sg), c.replaceSelection("", null, "cut");
          });
        }
        if (a.clipboardData && !m) a.preventDefault(), a.clipboardData.clearData(), a.clipboardData.setData("text/plain", vb.join("\n"));else {
          var d = Bb(),
              e = d.firstChild;
          c.display.lineSpace.insertBefore(d, c.display.lineSpace.firstChild), e.value = vb.join("\n");
          var f = document.activeElement;
          _g(e), setTimeout(function () {
            c.display.lineSpace.removeChild(d), f.focus();
          }, 50);
        }
      }

      var b = this,
          c = b.cm,
          d = b.div = a.lineDiv;
      d.contentEditable = "true", zb(d), Gg(d, "paste", function (a) {
        var b = a.clipboardData && a.clipboardData.getData("text/plain");
        b && (a.preventDefault(), c.replaceSelection(b, null, "paste"));
      }), Gg(d, "compositionstart", function (a) {
        var d = a.data;

        if (b.composing = {
          sel: c.doc.sel,
          data: d,
          startData: d
        }, d) {
          var e = c.doc.sel.primary(),
              f = c.getLine(e.head.line),
              g = f.indexOf(d, Math.max(0, e.head.ch - d.length));
          g > -1 && g <= e.head.ch && (b.composing.sel = Lb(ob(e.head.line, g), ob(e.head.line, g + d.length)));
        }
      }), Gg(d, "compositionupdate", function (a) {
        b.composing.data = a.data;
      }), Gg(d, "compositionend", function (a) {
        var c = b.composing;
        c && (a.data == c.startData || /\u200b/.test(a.data) || (c.data = a.data), setTimeout(function () {
          c.handled || b.applyComposition(c), b.composing == c && (b.composing = null);
        }, 50));
      }), Gg(d, "touchstart", function () {
        b.forceCompositionEnd();
      }), Gg(d, "input", function () {
        b.composing || b.pollContent() || bd(b.cm, function () {
          hd(c);
        });
      }), Gg(d, "copy", e), Gg(d, "cut", e);
    },
    prepareSelection: function prepareSelection() {
      var a = dc(this.cm, !1);
      return a.focus = this.cm.state.focused, a;
    },
    showSelection: function showSelection(a) {
      a && this.cm.display.view.length && (a.focus && this.showPrimarySelection(), this.showMultipleSelections(a));
    },
    showPrimarySelection: function showPrimarySelection() {
      var b = window.getSelection(),
          c = this.cm.doc.sel.primary(),
          d = Fb(this.cm, b.anchorNode, b.anchorOffset),
          e = Fb(this.cm, b.focusNode, b.focusOffset);

      if (!d || d.bad || !e || e.bad || 0 != pb(sb(d, e), c.from()) || 0 != pb(rb(d, e), c.to())) {
        var f = Db(this.cm, c.from()),
            g = Db(this.cm, c.to());

        if (f || g) {
          var h = this.cm.display.view,
              i = b.rangeCount && b.getRangeAt(0);

          if (f) {
            if (!g) {
              var j = h[h.length - 1].measure,
                  k = j.maps ? j.maps[j.maps.length - 1] : j.map;
              g = {
                node: k[k.length - 1],
                offset: k[k.length - 2] - k[k.length - 3]
              };
            }
          } else f = {
            node: h[0].measure.map[2],
            offset: 0
          };

          try {
            var l = nh(f.node, f.offset, g.offset, g.node);
          } catch (m) {}

          l && (b.removeAllRanges(), b.addRange(l), i && null == b.anchorNode ? b.addRange(i) : a && this.startGracePeriod()), this.rememberSelection();
        }
      }
    },
    startGracePeriod: function startGracePeriod() {
      var a = this;
      clearTimeout(this.gracePeriod), this.gracePeriod = setTimeout(function () {
        a.gracePeriod = !1, a.selectionChanged() && a.cm.operation(function () {
          a.cm.curOp.selectionChanged = !0;
        });
      }, 20);
    },
    showMultipleSelections: function showMultipleSelections(a) {
      ph(this.cm.display.cursorDiv, a.cursors), ph(this.cm.display.selectionDiv, a.selection);
    },
    rememberSelection: function rememberSelection() {
      var a = window.getSelection();
      this.lastAnchorNode = a.anchorNode, this.lastAnchorOffset = a.anchorOffset, this.lastFocusNode = a.focusNode, this.lastFocusOffset = a.focusOffset;
    },
    selectionInEditor: function selectionInEditor() {
      var a = window.getSelection();
      if (!a.rangeCount) return !1;
      var b = a.getRangeAt(0).commonAncestorContainer;
      return qh(this.div, b);
    },
    focus: function focus() {
      "nocursor" != this.cm.options.readOnly && this.div.focus();
    },
    blur: function blur() {
      this.div.blur();
    },
    getField: function getField() {
      return this.div;
    },
    supportsTouch: function supportsTouch() {
      return !0;
    },
    receivedFocus: function receivedFocus() {
      function b() {
        a.cm.state.focused && (a.pollSelection(), a.polling.set(a.cm.options.pollInterval, b));
      }

      var a = this;
      this.selectionInEditor() ? this.pollSelection() : bd(this.cm, function () {
        a.cm.curOp.selectionChanged = !0;
      }), this.polling.set(this.cm.options.pollInterval, b);
    },
    selectionChanged: function selectionChanged() {
      var a = window.getSelection();
      return a.anchorNode != this.lastAnchorNode || a.anchorOffset != this.lastAnchorOffset || a.focusNode != this.lastFocusNode || a.focusOffset != this.lastFocusOffset;
    },
    pollSelection: function pollSelection() {
      if (!this.composing && !this.gracePeriod && this.selectionChanged()) {
        var a = window.getSelection(),
            b = this.cm;
        this.rememberSelection();
        var c = Fb(b, a.anchorNode, a.anchorOffset),
            d = Fb(b, a.focusNode, a.focusOffset);
        c && d && bd(b, function () {
          Yb(b.doc, Lb(c, d), Sg), (c.bad || d.bad) && (b.curOp.selectionChanged = !0);
        });
      }
    },
    pollContent: function pollContent() {
      var a = this.cm,
          b = a.display,
          c = a.doc.sel.primary(),
          d = c.from(),
          e = c.to();
      if (d.line < b.viewFrom || e.line > b.viewTo - 1) return !1;
      var f;
      if (d.line == b.viewFrom || 0 == (f = kd(a, d.line))) var g = hg(b.view[0].line),
          h = b.view[0].node;else var g = hg(b.view[f].line),
          h = b.view[f - 1].node.nextSibling;
      var i = kd(a, e.line);
      if (i == b.view.length - 1) var j = b.viewTo - 1,
          k = b.view[i].node;else var j = hg(b.view[i + 1].line) - 1,
          k = b.view[i + 1].node.previousSibling;

      for (var l = Fh(Hb(a, h, k, g, j)), m = eg(a.doc, ob(g, 0), ob(j, dg(a.doc, j).text.length)); l.length > 1 && m.length > 1;) {
        if ($g(l) == $g(m)) l.pop(), m.pop(), j--;else {
          if (l[0] != m[0]) break;
          l.shift(), m.shift(), g++;
        }
      }

      for (var n = 0, o = 0, p = l[0], q = m[0], r = Math.min(p.length, q.length); r > n && p.charCodeAt(n) == q.charCodeAt(n);) {
        ++n;
      }

      for (var s = $g(l), t = $g(m), u = Math.min(s.length - (1 == l.length ? n : 0), t.length - (1 == m.length ? n : 0)); u > o && s.charCodeAt(s.length - o - 1) == t.charCodeAt(t.length - o - 1);) {
        ++o;
      }

      l[l.length - 1] = s.slice(0, s.length - o), l[0] = l[0].slice(n);
      var v = ob(g, n),
          w = ob(j, m.length ? $g(m).length - o : 0);
      return l.length > 1 || l[0] || pb(v, w) ? (ke(a.doc, l, v, w, "+input"), !0) : void 0;
    },
    ensurePolled: function ensurePolled() {
      this.forceCompositionEnd();
    },
    reset: function reset() {
      this.forceCompositionEnd();
    },
    forceCompositionEnd: function forceCompositionEnd() {
      this.composing && !this.composing.handled && (this.applyComposition(this.composing), this.composing.handled = !0, this.div.blur(), this.div.focus());
    },
    applyComposition: function applyComposition(a) {
      a.data && a.data != a.startData && cd(this.cm, wb)(this.cm, a.data, 0, a.sel);
    },
    setUneditable: function setUneditable(a) {
      a.setAttribute("contenteditable", "false");
    },
    onKeyPress: function onKeyPress(a) {
      a.preventDefault(), cd(this.cm, wb)(this.cm, String.fromCharCode(null == a.charCode ? a.keyCode : a.charCode), 0);
    },
    onContextMenu: ch,
    resetPosition: ch,
    needsContentAttribute: !0
  }, Cb.prototype), v.inputStyles = {
    textarea: Ab,
    contenteditable: Cb
  }, Ib.prototype = {
    primary: function primary() {
      return this.ranges[this.primIndex];
    },
    equals: function equals(a) {
      if (a == this) return !0;
      if (a.primIndex != this.primIndex || a.ranges.length != this.ranges.length) return !1;

      for (var b = 0; b < this.ranges.length; b++) {
        var c = this.ranges[b],
            d = a.ranges[b];
        if (0 != pb(c.anchor, d.anchor) || 0 != pb(c.head, d.head)) return !1;
      }

      return !0;
    },
    deepCopy: function deepCopy() {
      for (var a = [], b = 0; b < this.ranges.length; b++) {
        a[b] = new Jb(qb(this.ranges[b].anchor), qb(this.ranges[b].head));
      }

      return new Ib(a, this.primIndex);
    },
    somethingSelected: function somethingSelected() {
      for (var a = 0; a < this.ranges.length; a++) {
        if (!this.ranges[a].empty()) return !0;
      }

      return !1;
    },
    contains: function contains(a, b) {
      b || (b = a);

      for (var c = 0; c < this.ranges.length; c++) {
        var d = this.ranges[c];
        if (pb(b, d.from()) >= 0 && pb(a, d.to()) <= 0) return c;
      }

      return -1;
    }
  }, Jb.prototype = {
    from: function from() {
      return sb(this.anchor, this.head);
    },
    to: function to() {
      return rb(this.anchor, this.head);
    },
    empty: function empty() {
      return this.head.line == this.anchor.line && this.head.ch == this.anchor.ch;
    }
  };
  var Pc,
      ud,
      vd,
      yc = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
      Sc = null,
      Tc = 0,
      Bd = 0,
      Gd = 0,
      Hd = null;
  d ? Hd = -.53 : a ? Hd = 15 : h ? Hd = -.7 : j && (Hd = -1 / 3);

  var Id = function Id(a) {
    var b = a.wheelDeltaX,
        c = a.wheelDeltaY;
    return null == b && a.detail && a.axis == a.HORIZONTAL_AXIS && (b = a.detail), null == c && a.detail && a.axis == a.VERTICAL_AXIS ? c = a.detail : null == c && (c = a.wheelDelta), {
      x: b,
      y: c
    };
  };

  v.wheelEventPixels = function (a) {
    var b = Id(a);
    return b.x *= Hd, b.y *= Hd, b;
  };

  var Md = new Vg(),
      Qd = null,
      $d = v.changeEnd = function (a) {
    return a.text ? ob(a.from.line + a.text.length - 1, $g(a.text).length + (1 == a.text.length ? a.from.ch : 0)) : a.to;
  };

  v.prototype = {
    constructor: v,
    focus: function focus() {
      window.focus(), this.display.input.focus();
    },
    setOption: function setOption(a, b) {
      var c = this.options,
          d = c[a];
      (c[a] != b || "mode" == a) && (c[a] = b, ye.hasOwnProperty(a) && cd(this, ye[a])(this, b, d));
    },
    getOption: function getOption(a) {
      return this.options[a];
    },
    getDoc: function getDoc() {
      return this.doc;
    },
    addKeyMap: function addKeyMap(a, b) {
      this.state.keyMaps[b ? "push" : "unshift"](Oe(a));
    },
    removeKeyMap: function removeKeyMap(a) {
      for (var b = this.state.keyMaps, c = 0; c < b.length; ++c) {
        if (b[c] == a || b[c].name == a) return b.splice(c, 1), !0;
      }
    },
    addOverlay: dd(function (a, b) {
      var c = a.token ? a : v.getMode(this.options, a);
      if (c.startState) throw new Error("Overlays may not be stateful.");
      this.state.overlays.push({
        mode: c,
        modeSpec: a,
        opaque: b && b.opaque
      }), this.state.modeGen++, hd(this);
    }),
    removeOverlay: dd(function (a) {
      for (var b = this.state.overlays, c = 0; c < b.length; ++c) {
        var d = b[c].modeSpec;
        if (d == a || "string" == typeof a && d.name == a) return b.splice(c, 1), this.state.modeGen++, hd(this), void 0;
      }
    }),
    indentLine: dd(function (a, b, c) {
      "string" != typeof b && "number" != typeof b && (b = null == b ? this.options.smartIndent ? "smart" : "prev" : b ? "add" : "subtract"), Pb(this.doc, a) && se(this, a, b, c);
    }),
    indentSelection: dd(function (a) {
      for (var b = this.doc.sel.ranges, c = -1, d = 0; d < b.length; d++) {
        var e = b[d];
        if (e.empty()) e.head.line > c && (se(this, e.head.line, a, !0), c = e.head.line, d == this.doc.sel.primIndex && qe(this));else {
          var f = e.from(),
              g = e.to(),
              h = Math.max(c, f.line);
          c = Math.min(this.lastLine(), g.line - (g.ch ? 0 : 1)) + 1;

          for (var i = h; c > i; ++i) {
            se(this, i, a);
          }

          var j = this.doc.sel.ranges;
          0 == f.ch && b.length == j.length && j[d].from().ch > 0 && Ub(this.doc, d, new Jb(f, j[d].to()), Sg);
        }
      }
    }),
    getTokenAt: function getTokenAt(a, b) {
      return Gf(this, a, b);
    },
    getLineTokens: function getLineTokens(a, b) {
      return Gf(this, ob(a), b, !0);
    },
    getTokenTypeAt: function getTokenTypeAt(a) {
      a = Nb(this.doc, a);
      var f,
          b = Jf(this, dg(this.doc, a.line)),
          c = 0,
          d = (b.length - 1) / 2,
          e = a.ch;
      if (0 == e) f = b[2];else for (;;) {
        var g = c + d >> 1;
        if ((g ? b[2 * g - 1] : 0) >= e) d = g;else {
          if (!(b[2 * g + 1] < e)) {
            f = b[2 * g + 2];
            break;
          }

          c = g + 1;
        }
      }
      var h = f ? f.indexOf("cm-overlay ") : -1;
      return 0 > h ? f : 0 == h ? null : f.slice(0, h - 1);
    },
    getModeAt: function getModeAt(a) {
      var b = this.doc.mode;
      return b.innerMode ? v.innerMode(b, this.getTokenAt(a).state).mode : b;
    },
    getHelper: function getHelper(a, b) {
      return this.getHelpers(a, b)[0];
    },
    getHelpers: function getHelpers(a, b) {
      var c = [];
      if (!Fe.hasOwnProperty(b)) return c;
      var d = Fe[b],
          e = this.getModeAt(a);
      if ("string" == typeof e[b]) d[e[b]] && c.push(d[e[b]]);else if (e[b]) for (var f = 0; f < e[b].length; f++) {
        var g = d[e[b][f]];
        g && c.push(g);
      } else e.helperType && d[e.helperType] ? c.push(d[e.helperType]) : d[e.name] && c.push(d[e.name]);

      for (var f = 0; f < d._global.length; f++) {
        var h = d._global[f];
        h.pred(e, this) && -1 == ah(c, h.val) && c.push(h.val);
      }

      return c;
    },
    getStateAfter: function getStateAfter(a, b) {
      var c = this.doc;
      return a = Mb(c, null == a ? c.first + c.size - 1 : a), kc(this, a + 1, b);
    },
    cursorCoords: function cursorCoords(a, b) {
      var c,
          d = this.doc.sel.primary();
      return c = null == a ? d.head : "object" == _typeof(a) ? Nb(this.doc, a) : a ? d.from() : d.to(), Kc(this, c, b || "page");
    },
    charCoords: function charCoords(a, b) {
      return Jc(this, Nb(this.doc, a), b || "page");
    },
    coordsChar: function coordsChar(a, b) {
      return a = Ic(this, a, b || "page"), Nc(this, a.left, a.top);
    },
    lineAtHeight: function lineAtHeight(a, b) {
      return a = Ic(this, {
        top: a,
        left: 0
      }, b || "page").top, ig(this.doc, a + this.display.viewOffset);
    },
    heightAtLine: function heightAtLine(a, b) {
      var d,
          c = !1;

      if ("number" == typeof a) {
        var e = this.doc.first + this.doc.size - 1;
        a < this.doc.first ? a = this.doc.first : a > e && (a = e, c = !0), d = dg(this.doc, a);
      } else d = a;

      return Hc(this, d, {
        top: 0,
        left: 0
      }, b || "page").top + (c ? this.doc.height - jg(d) : 0);
    },
    defaultTextHeight: function defaultTextHeight() {
      return Qc(this.display);
    },
    defaultCharWidth: function defaultCharWidth() {
      return Rc(this.display);
    },
    setGutterMarker: dd(function (a, b, c) {
      return te(this.doc, a, "gutter", function (a) {
        var d = a.gutterMarkers || (a.gutterMarkers = {});
        return d[b] = c, !c && jh(d) && (a.gutterMarkers = null), !0;
      });
    }),
    clearGutter: dd(function (a) {
      var b = this,
          c = b.doc,
          d = c.first;
      c.iter(function (c) {
        c.gutterMarkers && c.gutterMarkers[a] && (c.gutterMarkers[a] = null, id(b, d, "gutter"), jh(c.gutterMarkers) && (c.gutterMarkers = null)), ++d;
      });
    }),
    lineInfo: function lineInfo(a) {
      if ("number" == typeof a) {
        if (!Pb(this.doc, a)) return null;
        var b = a;
        if (a = dg(this.doc, a), !a) return null;
      } else {
        var b = hg(a);
        if (null == b) return null;
      }

      return {
        line: b,
        handle: a,
        text: a.text,
        gutterMarkers: a.gutterMarkers,
        textClass: a.textClass,
        bgClass: a.bgClass,
        wrapClass: a.wrapClass,
        widgets: a.widgets
      };
    },
    getViewport: function getViewport() {
      return {
        from: this.display.viewFrom,
        to: this.display.viewTo
      };
    },
    addWidget: function addWidget(a, b, c, d, e) {
      var f = this.display;
      a = Kc(this, Nb(this.doc, a));
      var g = a.bottom,
          h = a.left;
      if (b.style.position = "absolute", b.setAttribute("cm-ignore-events", "true"), this.display.input.setUneditable(b), f.sizer.appendChild(b), "over" == d) g = a.top;else if ("above" == d || "near" == d) {
        var i = Math.max(f.wrapper.clientHeight, this.doc.height),
            j = Math.max(f.sizer.clientWidth, f.lineSpace.clientWidth);
        ("above" == d || a.bottom + b.offsetHeight > i) && a.top > b.offsetHeight ? g = a.top - b.offsetHeight : a.bottom + b.offsetHeight <= i && (g = a.bottom), h + b.offsetWidth > j && (h = j - b.offsetWidth);
      }
      b.style.top = g + "px", b.style.left = b.style.right = "", "right" == e ? (h = f.sizer.clientWidth - b.offsetWidth, b.style.right = "0px") : ("left" == e ? h = 0 : "middle" == e && (h = (f.sizer.clientWidth - b.offsetWidth) / 2), b.style.left = h + "px"), c && ne(this, h, g, h + b.offsetWidth, g + b.offsetHeight);
    },
    triggerOnKeyDown: dd(Rd),
    triggerOnKeyPress: dd(Ud),
    triggerOnKeyUp: Td,
    execCommand: function execCommand(a) {
      return Ie.hasOwnProperty(a) ? Ie[a](this) : void 0;
    },
    triggerElectric: dd(function (a) {
      xb(this, a);
    }),
    findPosH: function findPosH(a, b, c, d) {
      var e = 1;
      0 > b && (e = -1, b = -b);

      for (var f = 0, g = Nb(this.doc, a); b > f && (g = ve(this.doc, g, e, c, d), !g.hitSide); ++f) {
        ;
      }

      return g;
    },
    moveH: dd(function (a, b) {
      var c = this;
      c.extendSelectionsBy(function (d) {
        return c.display.shift || c.doc.extend || d.empty() ? ve(c.doc, d.head, a, b, c.options.rtlMoveVisually) : 0 > a ? d.from() : d.to();
      }, Ug);
    }),
    deleteH: dd(function (a, b) {
      var c = this.doc.sel,
          d = this.doc;
      c.somethingSelected() ? d.replaceSelection("", null, "+delete") : ue(this, function (c) {
        var e = ve(d, c.head, a, b, !1);
        return 0 > a ? {
          from: e,
          to: c.head
        } : {
          from: c.head,
          to: e
        };
      });
    }),
    findPosV: function findPosV(a, b, c, d) {
      var e = 1,
          f = d;
      0 > b && (e = -1, b = -b);

      for (var g = 0, h = Nb(this.doc, a); b > g; ++g) {
        var i = Kc(this, h, "div");
        if (null == f ? f = i.left : i.left = f, h = we(this, i, e, c), h.hitSide) break;
      }

      return h;
    },
    moveV: dd(function (a, b) {
      var c = this,
          d = this.doc,
          e = [],
          f = !c.display.shift && !d.extend && d.sel.somethingSelected();
      if (d.extendSelectionsBy(function (g) {
        if (f) return 0 > a ? g.from() : g.to();
        var h = Kc(c, g.head, "div");
        null != g.goalColumn && (h.left = g.goalColumn), e.push(h.left);
        var i = we(c, h, a, b);
        return "page" == b && g == d.sel.primary() && pe(c, null, Jc(c, i, "div").top - h.top), i;
      }, Ug), e.length) for (var g = 0; g < d.sel.ranges.length; g++) {
        d.sel.ranges[g].goalColumn = e[g];
      }
    }),
    findWordAt: function findWordAt(a) {
      var b = this.doc,
          c = dg(b, a.line).text,
          d = a.ch,
          e = a.ch;

      if (c) {
        var f = this.getHelper(a, "wordChars");
        (a.xRel < 0 || e == c.length) && d ? --d : ++e;

        for (var g = c.charAt(d), h = ih(g, f) ? function (a) {
          return ih(a, f);
        } : /\s/.test(g) ? function (a) {
          return /\s/.test(a);
        } : function (a) {
          return !/\s/.test(a) && !ih(a);
        }; d > 0 && h(c.charAt(d - 1));) {
          --d;
        }

        for (; e < c.length && h(c.charAt(e));) {
          ++e;
        }
      }

      return new Jb(ob(a.line, d), ob(a.line, e));
    },
    toggleOverwrite: function toggleOverwrite(a) {
      (null == a || a != this.state.overwrite) && ((this.state.overwrite = !this.state.overwrite) ? uh(this.display.cursorDiv, "CodeMirror-overwrite") : th(this.display.cursorDiv, "CodeMirror-overwrite"), Ig(this, "overwriteToggle", this, this.state.overwrite));
    },
    hasFocus: function hasFocus() {
      return this.display.input.getField() == rh();
    },
    scrollTo: dd(function (a, b) {
      (null != a || null != b) && re(this), null != a && (this.curOp.scrollLeft = a), null != b && (this.curOp.scrollTop = b);
    }),
    getScrollInfo: function getScrollInfo() {
      var a = this.display.scroller;
      return {
        left: a.scrollLeft,
        top: a.scrollTop,
        height: a.scrollHeight - oc(this) - this.display.barHeight,
        width: a.scrollWidth - oc(this) - this.display.barWidth,
        clientHeight: qc(this),
        clientWidth: pc(this)
      };
    },
    scrollIntoView: dd(function (a, b) {
      if (null == a ? (a = {
        from: this.doc.sel.primary().head,
        to: null
      }, null == b && (b = this.options.cursorScrollMargin)) : "number" == typeof a ? a = {
        from: ob(a, 0),
        to: null
      } : null == a.from && (a = {
        from: a,
        to: null
      }), a.to || (a.to = a.from), a.margin = b || 0, null != a.from.line) re(this), this.curOp.scrollToPos = a;else {
        var c = oe(this, Math.min(a.from.left, a.to.left), Math.min(a.from.top, a.to.top) - a.margin, Math.max(a.from.right, a.to.right), Math.max(a.from.bottom, a.to.bottom) + a.margin);
        this.scrollTo(c.scrollLeft, c.scrollTop);
      }
    }),
    setSize: dd(function (a, b) {
      function d(a) {
        return "number" == typeof a || /^\d+$/.test(String(a)) ? a + "px" : a;
      }

      var c = this;
      null != a && (c.display.wrapper.style.width = d(a)), null != b && (c.display.wrapper.style.height = d(b)), c.options.lineWrapping && Dc(this);
      var e = c.display.viewFrom;
      c.doc.iter(e, c.display.viewTo, function (a) {
        if (a.widgets) for (var b = 0; b < a.widgets.length; b++) {
          if (a.widgets[b].noHScroll) {
            id(c, e, "widget");
            break;
          }
        }
        ++e;
      }), c.curOp.forceUpdate = !0, Ig(c, "refresh", this);
    }),
    operation: function operation(a) {
      return bd(this, a);
    },
    refresh: dd(function () {
      var a = this.display.cachedTextHeight;
      hd(this), this.curOp.forceUpdate = !0, Ec(this), this.scrollTo(this.doc.scrollLeft, this.doc.scrollTop), F(this), (null == a || Math.abs(a - Qc(this.display)) > .5) && B(this), Ig(this, "refresh", this);
    }),
    swapDoc: dd(function (a) {
      var b = this.doc;
      return b.cm = null, cg(this, a), Ec(this), this.display.input.reset(), this.scrollTo(a.scrollLeft, a.scrollTop), this.curOp.forceScroll = !0, Kg(this, "swapDoc", this, b), b;
    }),
    getInputField: function getInputField() {
      return this.display.input.getField();
    },
    getWrapperElement: function getWrapperElement() {
      return this.display.wrapper;
    },
    getScrollerElement: function getScrollerElement() {
      return this.display.scroller;
    },
    getGutterElement: function getGutterElement() {
      return this.display.gutters;
    }
  }, Pg(v);
  var xe = v.defaults = {},
      ye = v.optionHandlers = {},
      Ae = v.Init = {
    toString: function toString() {
      return "CodeMirror.Init";
    }
  };
  ze("value", "", function (a, b) {
    a.setValue(b);
  }, !0), ze("mode", null, function (a, b) {
    a.doc.modeOption = b, x(a);
  }, !0), ze("indentUnit", 2, x, !0), ze("indentWithTabs", !1), ze("smartIndent", !0), ze("tabSize", 4, function (a) {
    y(a), Ec(a), hd(a);
  }, !0), ze("specialChars", /[\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, function (a, b, c) {
    a.state.specialChars = new RegExp(b.source + (b.test("	") ? "" : "|	"), "g"), c != v.Init && a.refresh();
  }), ze("specialCharPlaceholder", Pf, function (a) {
    a.refresh();
  }, !0), ze("electricChars", !0), ze("inputStyle", n ? "contenteditable" : "textarea", function () {
    throw new Error("inputStyle can not (yet) be changed in a running editor");
  }, !0), ze("rtlMoveVisually", !p), ze("wholeLineUpdateBefore", !0), ze("theme", "default", function (a) {
    C(a), D(a);
  }, !0), ze("keyMap", "default", function (a, b, c) {
    var d = Oe(b),
        e = c != v.Init && Oe(c);
    e && e.detach && e.detach(a, d), d.attach && d.attach(a, e || null);
  }), ze("extraKeys", null), ze("lineWrapping", !1, z, !0), ze("gutters", [], function (a) {
    I(a.options), D(a);
  }, !0), ze("fixedGutter", !0, function (a, b) {
    a.display.gutters.style.left = b ? T(a.display) + "px" : "0", a.refresh();
  }, !0), ze("coverGutterNextToScrollbar", !1, function (a) {
    N(a);
  }, !0), ze("scrollbarStyle", "native", function (a) {
    M(a), N(a), a.display.scrollbars.setScrollTop(a.doc.scrollTop), a.display.scrollbars.setScrollLeft(a.doc.scrollLeft);
  }, !0), ze("lineNumbers", !1, function (a) {
    I(a.options), D(a);
  }, !0), ze("firstLineNumber", 1, D, !0), ze("lineNumberFormatter", function (a) {
    return a;
  }, D, !0), ze("showCursorWhenSelecting", !1, cc, !0), ze("resetSelectionOnContextMenu", !0), ze("lineWiseCopyCut", !0), ze("readOnly", !1, function (a, b) {
    "nocursor" == b ? (Xd(a), a.display.input.blur(), a.display.disabled = !0) : (a.display.disabled = !1, b || a.display.input.reset());
  }), ze("disableInput", !1, function (a, b) {
    b || a.display.input.reset();
  }, !0), ze("dragDrop", !0, pd), ze("cursorBlinkRate", 530), ze("cursorScrollMargin", 0), ze("cursorHeight", 1, cc, !0), ze("singleCursorHeightPerLine", !0, cc, !0), ze("workTime", 100), ze("workDelay", 100), ze("flattenSpans", !0, y, !0), ze("addModeClass", !1, y, !0), ze("pollInterval", 100), ze("undoDepth", 200, function (a, b) {
    a.doc.history.undoDepth = b;
  }), ze("historyEventDelay", 1250), ze("viewportMargin", 10, function (a) {
    a.refresh();
  }, !0), ze("maxHighlightLength", 1e4, y, !0), ze("moveInputWithCursor", !0, function (a, b) {
    b || a.display.input.resetPosition();
  }), ze("tabindex", null, function (a, b) {
    a.display.input.getField().tabIndex = b || "";
  }), ze("autofocus", null);
  var Be = v.modes = {},
      Ce = v.mimeModes = {};
  v.defineMode = function (a, b) {
    v.defaults.mode || "null" == a || (v.defaults.mode = a), arguments.length > 2 && (b.dependencies = Array.prototype.slice.call(arguments, 2)), Be[a] = b;
  }, v.defineMIME = function (a, b) {
    Ce[a] = b;
  }, v.resolveMode = function (a) {
    if ("string" == typeof a && Ce.hasOwnProperty(a)) a = Ce[a];else if (a && "string" == typeof a.name && Ce.hasOwnProperty(a.name)) {
      var b = Ce[a.name];
      "string" == typeof b && (b = {
        name: b
      }), a = dh(b, a), a.name = b.name;
    } else if ("string" == typeof a && /^[\w\-]+\/[\w\-]+\+xml$/.test(a)) return v.resolveMode("application/xml");
    return "string" == typeof a ? {
      name: a
    } : a || {
      name: "null"
    };
  }, v.getMode = function (a, b) {
    var b = v.resolveMode(b),
        c = Be[b.name];
    if (!c) return v.getMode(a, "text/plain");
    var d = c(a, b);

    if (De.hasOwnProperty(b.name)) {
      var e = De[b.name];

      for (var f in e) {
        e.hasOwnProperty(f) && (d.hasOwnProperty(f) && (d["_" + f] = d[f]), d[f] = e[f]);
      }
    }

    if (d.name = b.name, b.helperType && (d.helperType = b.helperType), b.modeProps) for (var f in b.modeProps) {
      d[f] = b.modeProps[f];
    }
    return d;
  }, v.defineMode("null", function () {
    return {
      token: function token(a) {
        a.skipToEnd();
      }
    };
  }), v.defineMIME("text/plain", "null");
  var De = v.modeExtensions = {};
  v.extendMode = function (a, b) {
    var c = De.hasOwnProperty(a) ? De[a] : De[a] = {};
    eh(b, c);
  }, v.defineExtension = function (a, b) {
    v.prototype[a] = b;
  }, v.defineDocExtension = function (a, b) {
    $f.prototype[a] = b;
  }, v.defineOption = ze;
  var Ee = [];

  v.defineInitHook = function (a) {
    Ee.push(a);
  };

  var Fe = v.helpers = {};
  v.registerHelper = function (a, b, c) {
    Fe.hasOwnProperty(a) || (Fe[a] = v[a] = {
      _global: []
    }), Fe[a][b] = c;
  }, v.registerGlobalHelper = function (a, b, c, d) {
    v.registerHelper(a, b, d), Fe[a]._global.push({
      pred: c,
      val: d
    });
  };

  var Ge = v.copyState = function (a, b) {
    if (b === !0) return b;
    if (a.copyState) return a.copyState(b);
    var c = {};

    for (var d in b) {
      var e = b[d];
      e instanceof Array && (e = e.concat([])), c[d] = e;
    }

    return c;
  },
      He = v.startState = function (a, b, c) {
    return a.startState ? a.startState(b, c) : !0;
  };

  v.innerMode = function (a, b) {
    for (; a.innerMode;) {
      var c = a.innerMode(b);
      if (!c || c.mode == a) break;
      b = c.state, a = c.mode;
    }

    return c || {
      mode: a,
      state: b
    };
  };

  var Ie = v.commands = {
    selectAll: function selectAll(a) {
      a.setSelection(ob(a.firstLine(), 0), ob(a.lastLine()), Sg);
    },
    singleSelection: function singleSelection(a) {
      a.setSelection(a.getCursor("anchor"), a.getCursor("head"), Sg);
    },
    killLine: function killLine(a) {
      ue(a, function (b) {
        if (b.empty()) {
          var c = dg(a.doc, b.head.line).text.length;
          return b.head.ch == c && b.head.line < a.lastLine() ? {
            from: b.head,
            to: ob(b.head.line + 1, 0)
          } : {
            from: b.head,
            to: ob(b.head.line, c)
          };
        }

        return {
          from: b.from(),
          to: b.to()
        };
      });
    },
    deleteLine: function deleteLine(a) {
      ue(a, function (b) {
        return {
          from: ob(b.from().line, 0),
          to: Nb(a.doc, ob(b.to().line + 1, 0))
        };
      });
    },
    delLineLeft: function delLineLeft(a) {
      ue(a, function (a) {
        return {
          from: ob(a.from().line, 0),
          to: a.from()
        };
      });
    },
    delWrappedLineLeft: function delWrappedLineLeft(a) {
      ue(a, function (b) {
        var c = a.charCoords(b.head, "div").top + 5,
            d = a.coordsChar({
          left: 0,
          top: c
        }, "div");
        return {
          from: d,
          to: b.from()
        };
      });
    },
    delWrappedLineRight: function delWrappedLineRight(a) {
      ue(a, function (b) {
        var c = a.charCoords(b.head, "div").top + 5,
            d = a.coordsChar({
          left: a.display.lineDiv.offsetWidth + 100,
          top: c
        }, "div");
        return {
          from: b.from(),
          to: d
        };
      });
    },
    undo: function undo(a) {
      a.undo();
    },
    redo: function redo(a) {
      a.redo();
    },
    undoSelection: function undoSelection(a) {
      a.undoSelection();
    },
    redoSelection: function redoSelection(a) {
      a.redoSelection();
    },
    goDocStart: function goDocStart(a) {
      a.extendSelection(ob(a.firstLine(), 0));
    },
    goDocEnd: function goDocEnd(a) {
      a.extendSelection(ob(a.lastLine()));
    },
    goLineStart: function goLineStart(a) {
      a.extendSelectionsBy(function (b) {
        return Qh(a, b.head.line);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineStartSmart: function goLineStartSmart(a) {
      a.extendSelectionsBy(function (b) {
        return Sh(a, b.head);
      }, {
        origin: "+move",
        bias: 1
      });
    },
    goLineEnd: function goLineEnd(a) {
      a.extendSelectionsBy(function (b) {
        return Rh(a, b.head.line);
      }, {
        origin: "+move",
        bias: -1
      });
    },
    goLineRight: function goLineRight(a) {
      a.extendSelectionsBy(function (b) {
        var c = a.charCoords(b.head, "div").top + 5;
        return a.coordsChar({
          left: a.display.lineDiv.offsetWidth + 100,
          top: c
        }, "div");
      }, Ug);
    },
    goLineLeft: function goLineLeft(a) {
      a.extendSelectionsBy(function (b) {
        var c = a.charCoords(b.head, "div").top + 5;
        return a.coordsChar({
          left: 0,
          top: c
        }, "div");
      }, Ug);
    },
    goLineLeftSmart: function goLineLeftSmart(a) {
      a.extendSelectionsBy(function (b) {
        var c = a.charCoords(b.head, "div").top + 5,
            d = a.coordsChar({
          left: 0,
          top: c
        }, "div");
        return d.ch < a.getLine(d.line).search(/\S/) ? Sh(a, b.head) : d;
      }, Ug);
    },
    goLineUp: function goLineUp(a) {
      a.moveV(-1, "line");
    },
    goLineDown: function goLineDown(a) {
      a.moveV(1, "line");
    },
    goPageUp: function goPageUp(a) {
      a.moveV(-1, "page");
    },
    goPageDown: function goPageDown(a) {
      a.moveV(1, "page");
    },
    goCharLeft: function goCharLeft(a) {
      a.moveH(-1, "char");
    },
    goCharRight: function goCharRight(a) {
      a.moveH(1, "char");
    },
    goColumnLeft: function goColumnLeft(a) {
      a.moveH(-1, "column");
    },
    goColumnRight: function goColumnRight(a) {
      a.moveH(1, "column");
    },
    goWordLeft: function goWordLeft(a) {
      a.moveH(-1, "word");
    },
    goGroupRight: function goGroupRight(a) {
      a.moveH(1, "group");
    },
    goGroupLeft: function goGroupLeft(a) {
      a.moveH(-1, "group");
    },
    goWordRight: function goWordRight(a) {
      a.moveH(1, "word");
    },
    delCharBefore: function delCharBefore(a) {
      a.deleteH(-1, "char");
    },
    delCharAfter: function delCharAfter(a) {
      a.deleteH(1, "char");
    },
    delWordBefore: function delWordBefore(a) {
      a.deleteH(-1, "word");
    },
    delWordAfter: function delWordAfter(a) {
      a.deleteH(1, "word");
    },
    delGroupBefore: function delGroupBefore(a) {
      a.deleteH(-1, "group");
    },
    delGroupAfter: function delGroupAfter(a) {
      a.deleteH(1, "group");
    },
    indentAuto: function indentAuto(a) {
      a.indentSelection("smart");
    },
    indentMore: function indentMore(a) {
      a.indentSelection("add");
    },
    indentLess: function indentLess(a) {
      a.indentSelection("subtract");
    },
    insertTab: function insertTab(a) {
      a.replaceSelection("	");
    },
    insertSoftTab: function insertSoftTab(a) {
      for (var b = [], c = a.listSelections(), d = a.options.tabSize, e = 0; e < c.length; e++) {
        var f = c[e].from(),
            g = Wg(a.getLine(f.line), f.ch, d);
        b.push(new Array(d - g % d + 1).join(" "));
      }

      a.replaceSelections(b);
    },
    defaultTab: function defaultTab(a) {
      a.somethingSelected() ? a.indentSelection("add") : a.execCommand("insertTab");
    },
    transposeChars: function transposeChars(a) {
      bd(a, function () {
        for (var b = a.listSelections(), c = [], d = 0; d < b.length; d++) {
          var e = b[d].head,
              f = dg(a.doc, e.line).text;
          if (f) if (e.ch == f.length && (e = new ob(e.line, e.ch - 1)), e.ch > 0) e = new ob(e.line, e.ch + 1), a.replaceRange(f.charAt(e.ch - 1) + f.charAt(e.ch - 2), ob(e.line, e.ch - 2), e, "+transpose");else if (e.line > a.doc.first) {
            var g = dg(a.doc, e.line - 1).text;
            g && a.replaceRange(f.charAt(0) + "\n" + g.charAt(g.length - 1), ob(e.line - 1, g.length - 1), ob(e.line, 1), "+transpose");
          }
          c.push(new Jb(e, e));
        }

        a.setSelections(c);
      });
    },
    newlineAndIndent: function newlineAndIndent(a) {
      bd(a, function () {
        for (var b = a.listSelections().length, c = 0; b > c; c++) {
          var d = a.listSelections()[c];
          a.replaceRange("\n", d.anchor, d.head, "+input"), a.indentLine(d.from().line + 1, null, !0), qe(a);
        }
      });
    },
    toggleOverwrite: function toggleOverwrite(a) {
      a.toggleOverwrite();
    }
  },
      Je = v.keyMap = {};
  Je.basic = {
    Left: "goCharLeft",
    Right: "goCharRight",
    Up: "goLineUp",
    Down: "goLineDown",
    End: "goLineEnd",
    Home: "goLineStartSmart",
    PageUp: "goPageUp",
    PageDown: "goPageDown",
    Delete: "delCharAfter",
    Backspace: "delCharBefore",
    "Shift-Backspace": "delCharBefore",
    Tab: "defaultTab",
    "Shift-Tab": "indentAuto",
    Enter: "newlineAndIndent",
    Insert: "toggleOverwrite",
    Esc: "singleSelection"
  }, Je.pcDefault = {
    "Ctrl-A": "selectAll",
    "Ctrl-D": "deleteLine",
    "Ctrl-Z": "undo",
    "Shift-Ctrl-Z": "redo",
    "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart",
    "Ctrl-End": "goDocEnd",
    "Ctrl-Up": "goLineUp",
    "Ctrl-Down": "goLineDown",
    "Ctrl-Left": "goGroupLeft",
    "Ctrl-Right": "goGroupRight",
    "Alt-Left": "goLineStart",
    "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delGroupBefore",
    "Ctrl-Delete": "delGroupAfter",
    "Ctrl-S": "save",
    "Ctrl-F": "find",
    "Ctrl-G": "findNext",
    "Shift-Ctrl-G": "findPrev",
    "Shift-Ctrl-F": "replace",
    "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess",
    "Ctrl-]": "indentMore",
    "Ctrl-U": "undoSelection",
    "Shift-Ctrl-U": "redoSelection",
    "Alt-U": "redoSelection",
    fallthrough: "basic"
  }, Je.emacsy = {
    "Ctrl-F": "goCharRight",
    "Ctrl-B": "goCharLeft",
    "Ctrl-P": "goLineUp",
    "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight",
    "Alt-B": "goWordLeft",
    "Ctrl-A": "goLineStart",
    "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown",
    "Shift-Ctrl-V": "goPageUp",
    "Ctrl-D": "delCharAfter",
    "Ctrl-H": "delCharBefore",
    "Alt-D": "delWordAfter",
    "Alt-Backspace": "delWordBefore",
    "Ctrl-K": "killLine",
    "Ctrl-T": "transposeChars"
  }, Je.macDefault = {
    "Cmd-A": "selectAll",
    "Cmd-D": "deleteLine",
    "Cmd-Z": "undo",
    "Shift-Cmd-Z": "redo",
    "Cmd-Y": "redo",
    "Cmd-Home": "goDocStart",
    "Cmd-Up": "goDocStart",
    "Cmd-End": "goDocEnd",
    "Cmd-Down": "goDocEnd",
    "Alt-Left": "goGroupLeft",
    "Alt-Right": "goGroupRight",
    "Cmd-Left": "goLineLeft",
    "Cmd-Right": "goLineRight",
    "Alt-Backspace": "delGroupBefore",
    "Ctrl-Alt-Backspace": "delGroupAfter",
    "Alt-Delete": "delGroupAfter",
    "Cmd-S": "save",
    "Cmd-F": "find",
    "Cmd-G": "findNext",
    "Shift-Cmd-G": "findPrev",
    "Cmd-Alt-F": "replace",
    "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess",
    "Cmd-]": "indentMore",
    "Cmd-Backspace": "delWrappedLineLeft",
    "Cmd-Delete": "delWrappedLineRight",
    "Cmd-U": "undoSelection",
    "Shift-Cmd-U": "redoSelection",
    "Ctrl-Up": "goDocStart",
    "Ctrl-Down": "goDocEnd",
    fallthrough: ["basic", "emacsy"]
  }, Je["default"] = o ? Je.macDefault : Je.pcDefault, v.normalizeKeyMap = function (a) {
    var b = {};

    for (var c in a) {
      if (a.hasOwnProperty(c)) {
        var d = a[c];
        if (/^(name|fallthrough|(de|at)tach)$/.test(c)) continue;

        if ("..." == d) {
          delete a[c];
          continue;
        }

        for (var e = bh(c.split(" "), Ke), f = 0; f < e.length; f++) {
          var g, h;
          f == e.length - 1 ? (h = e.join(" "), g = d) : (h = e.slice(0, f + 1).join(" "), g = "...");
          var i = b[h];

          if (i) {
            if (i != g) throw new Error("Inconsistent bindings for " + h);
          } else b[h] = g;
        }

        delete a[c];
      }
    }

    for (var j in b) {
      a[j] = b[j];
    }

    return a;
  };

  var Le = v.lookupKey = function (a, b, c, d) {
    b = Oe(b);
    var e = b.call ? b.call(a, d) : b[a];
    if (e === !1) return "nothing";
    if ("..." === e) return "multi";
    if (null != e && c(e)) return "handled";

    if (b.fallthrough) {
      if ("[object Array]" != Object.prototype.toString.call(b.fallthrough)) return Le(a, b.fallthrough, c, d);

      for (var f = 0; f < b.fallthrough.length; f++) {
        var g = Le(a, b.fallthrough[f], c, d);
        if (g) return g;
      }
    }
  },
      Me = v.isModifierKey = function (a) {
    var b = "string" == typeof a ? a : Kh[a.keyCode];
    return "Ctrl" == b || "Alt" == b || "Shift" == b || "Mod" == b;
  },
      Ne = v.keyName = function (a, b) {
    if (i && 34 == a.keyCode && a["char"]) return !1;
    var c = Kh[a.keyCode],
        d = c;
    return null == d || a.altGraphKey ? !1 : (a.altKey && "Alt" != c && (d = "Alt-" + d), (r ? a.metaKey : a.ctrlKey) && "Ctrl" != c && (d = "Ctrl-" + d), (r ? a.ctrlKey : a.metaKey) && "Cmd" != c && (d = "Cmd-" + d), !b && a.shiftKey && "Shift" != c && (d = "Shift-" + d), d);
  };

  v.fromTextArea = function (a, b) {
    function d() {
      a.value = i.getValue();
    }

    if (b = b ? eh(b) : {}, b.value = a.value, !b.tabindex && a.tabIndex && (b.tabindex = a.tabIndex), !b.placeholder && a.placeholder && (b.placeholder = a.placeholder), null == b.autofocus) {
      var c = rh();
      b.autofocus = c == a || null != a.getAttribute("autofocus") && c == document.body;
    }

    if (a.form && (Gg(a.form, "submit", d), !b.leaveSubmitMethodAlone)) {
      var e = a.form,
          f = e.submit;

      try {
        var g = e.submit = function () {
          d(), e.submit = f, e.submit(), e.submit = g;
        };
      } catch (h) {}
    }

    b.finishInit = function (b) {
      b.save = d, b.getTextArea = function () {
        return a;
      }, b.toTextArea = function () {
        b.toTextArea = isNaN, d(), a.parentNode.removeChild(b.getWrapperElement()), a.style.display = "", a.form && (Hg(a.form, "submit", d), "function" == typeof a.form.submit && (a.form.submit = f));
      };
    }, a.style.display = "none";
    var i = v(function (b) {
      a.parentNode.insertBefore(b, a.nextSibling);
    }, b);
    return i;
  };

  var Pe = v.StringStream = function (a, b) {
    this.pos = this.start = 0, this.string = a, this.tabSize = b || 8, this.lastColumnPos = this.lastColumnValue = 0, this.lineStart = 0;
  };

  Pe.prototype = {
    eol: function eol() {
      return this.pos >= this.string.length;
    },
    sol: function sol() {
      return this.pos == this.lineStart;
    },
    peek: function peek() {
      return this.string.charAt(this.pos) || void 0;
    },
    next: function next() {
      return this.pos < this.string.length ? this.string.charAt(this.pos++) : void 0;
    },
    eat: function eat(a) {
      var b = this.string.charAt(this.pos);
      if ("string" == typeof a) var c = b == a;else var c = b && (a.test ? a.test(b) : a(b));
      return c ? (++this.pos, b) : void 0;
    },
    eatWhile: function eatWhile(a) {
      for (var b = this.pos; this.eat(a);) {
        ;
      }

      return this.pos > b;
    },
    eatSpace: function eatSpace() {
      for (var a = this.pos; /[\s\u00a0]/.test(this.string.charAt(this.pos));) {
        ++this.pos;
      }

      return this.pos > a;
    },
    skipToEnd: function skipToEnd() {
      this.pos = this.string.length;
    },
    skipTo: function skipTo(a) {
      var b = this.string.indexOf(a, this.pos);
      return b > -1 ? (this.pos = b, !0) : void 0;
    },
    backUp: function backUp(a) {
      this.pos -= a;
    },
    column: function column() {
      return this.lastColumnPos < this.start && (this.lastColumnValue = Wg(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue - (this.lineStart ? Wg(this.string, this.lineStart, this.tabSize) : 0);
    },
    indentation: function indentation() {
      return Wg(this.string, null, this.tabSize) - (this.lineStart ? Wg(this.string, this.lineStart, this.tabSize) : 0);
    },
    match: function match(a, b, c) {
      if ("string" != typeof a) {
        var f = this.string.slice(this.pos).match(a);
        return f && f.index > 0 ? null : (f && b !== !1 && (this.pos += f[0].length), f);
      }

      var d = function d(a) {
        return c ? a.toLowerCase() : a;
      },
          e = this.string.substr(this.pos, a.length);

      return d(e) == d(a) ? (b !== !1 && (this.pos += a.length), !0) : void 0;
    },
    current: function current() {
      return this.string.slice(this.start, this.pos);
    },
    hideFirstChars: function hideFirstChars(a, b) {
      this.lineStart += a;

      try {
        return b();
      } finally {
        this.lineStart -= a;
      }
    }
  };

  var Qe = 0,
      Re = v.TextMarker = function (a, b) {
    this.lines = [], this.type = b, this.doc = a, this.id = ++Qe;
  };

  Pg(Re), Re.prototype.clear = function () {
    if (!this.explicitlyCleared) {
      var a = this.doc.cm,
          b = a && !a.curOp;

      if (b && Uc(a), Og(this, "clear")) {
        var c = this.find();
        c && Kg(this, "clear", c.from, c.to);
      }

      for (var d = null, e = null, f = 0; f < this.lines.length; ++f) {
        var g = this.lines[f],
            h = Ze(g.markedSpans, this);
        a && !this.collapsed ? id(a, hg(g), "text") : a && (null != h.to && (e = hg(g)), null != h.from && (d = hg(g))), g.markedSpans = $e(g.markedSpans, h), null == h.from && this.collapsed && !uf(this.doc, g) && a && gg(g, Qc(a.display));
      }

      if (a && this.collapsed && !a.options.lineWrapping) for (var f = 0; f < this.lines.length; ++f) {
        var i = qf(this.lines[f]),
            j = G(i);
        j > a.display.maxLineLength && (a.display.maxLine = i, a.display.maxLineLength = j, a.display.maxLineChanged = !0);
      }
      null != d && a && this.collapsed && hd(a, d, e + 1), this.lines.length = 0, this.explicitlyCleared = !0, this.atomic && this.doc.cantEdit && (this.doc.cantEdit = !1, a && _b(a.doc)), a && Kg(a, "markerCleared", a, this), b && Wc(a), this.parent && this.parent.clear();
    }
  }, Re.prototype.find = function (a, b) {
    null == a && "bookmark" == this.type && (a = 1);

    for (var c, d, e = 0; e < this.lines.length; ++e) {
      var f = this.lines[e],
          g = Ze(f.markedSpans, this);
      if (null != g.from && (c = ob(b ? f : hg(f), g.from), -1 == a)) return c;
      if (null != g.to && (d = ob(b ? f : hg(f), g.to), 1 == a)) return d;
    }

    return c && {
      from: c,
      to: d
    };
  }, Re.prototype.changed = function () {
    var a = this.find(-1, !0),
        b = this,
        c = this.doc.cm;
    a && c && bd(c, function () {
      var d = a.line,
          e = hg(a.line),
          f = vc(c, e);

      if (f && (Cc(f), c.curOp.selectionChanged = c.curOp.forceUpdate = !0), c.curOp.updateMaxLine = !0, !uf(b.doc, d) && null != b.height) {
        var g = b.height;
        b.height = null;
        var h = yf(b) - g;
        h && gg(d, d.height + h);
      }
    });
  }, Re.prototype.attachLine = function (a) {
    if (!this.lines.length && this.doc.cm) {
      var b = this.doc.cm.curOp;
      b.maybeHiddenMarkers && -1 != ah(b.maybeHiddenMarkers, this) || (b.maybeUnhiddenMarkers || (b.maybeUnhiddenMarkers = [])).push(this);
    }

    this.lines.push(a);
  }, Re.prototype.detachLine = function (a) {
    if (this.lines.splice(ah(this.lines, a), 1), !this.lines.length && this.doc.cm) {
      var b = this.doc.cm.curOp;
      (b.maybeHiddenMarkers || (b.maybeHiddenMarkers = [])).push(this);
    }
  };

  var Qe = 0,
      Te = v.SharedTextMarker = function (a, b) {
    this.markers = a, this.primary = b;

    for (var c = 0; c < a.length; ++c) {
      a[c].parent = this;
    }
  };

  Pg(Te), Te.prototype.clear = function () {
    if (!this.explicitlyCleared) {
      this.explicitlyCleared = !0;

      for (var a = 0; a < this.markers.length; ++a) {
        this.markers[a].clear();
      }

      Kg(this, "clear");
    }
  }, Te.prototype.find = function (a, b) {
    return this.primary.find(a, b);
  };

  var wf = v.LineWidget = function (a, b, c) {
    if (c) for (var d in c) {
      c.hasOwnProperty(d) && (this[d] = c[d]);
    }
    this.doc = a, this.node = b;
  };

  Pg(wf), wf.prototype.clear = function () {
    var a = this.doc.cm,
        b = this.line.widgets,
        c = this.line,
        d = hg(c);

    if (null != d && b) {
      for (var e = 0; e < b.length; ++e) {
        b[e] == this && b.splice(e--, 1);
      }

      b.length || (c.widgets = null);
      var f = yf(this);
      gg(c, Math.max(0, c.height - f)), a && bd(a, function () {
        xf(a, c, -f), id(a, d, "widget");
      });
    }
  }, wf.prototype.changed = function () {
    var a = this.height,
        b = this.doc.cm,
        c = this.line;
    this.height = null;
    var d = yf(this) - a;
    d && (gg(c, c.height + d), b && bd(b, function () {
      b.curOp.forceUpdate = !0, xf(b, c, d);
    }));
  };

  var Af = v.Line = function (a, b, c) {
    this.text = a, hf(this, b), this.height = c ? c(this) : 1;
  };

  Pg(Af), Af.prototype.lineNo = function () {
    return hg(this);
  };
  var Lf = {},
      Mf = {};
  Xf.prototype = {
    chunkSize: function chunkSize() {
      return this.lines.length;
    },
    removeInner: function removeInner(a, b) {
      for (var c = a, d = a + b; d > c; ++c) {
        var e = this.lines[c];
        this.height -= e.height, Cf(e), Kg(e, "delete");
      }

      this.lines.splice(a, b);
    },
    collapse: function collapse(a) {
      a.push.apply(a, this.lines);
    },
    insertInner: function insertInner(a, b, c) {
      this.height += c, this.lines = this.lines.slice(0, a).concat(b).concat(this.lines.slice(a));

      for (var d = 0; d < b.length; ++d) {
        b[d].parent = this;
      }
    },
    iterN: function iterN(a, b, c) {
      for (var d = a + b; d > a; ++a) {
        if (c(this.lines[a])) return !0;
      }
    }
  }, Yf.prototype = {
    chunkSize: function chunkSize() {
      return this.size;
    },
    removeInner: function removeInner(a, b) {
      this.size -= b;

      for (var c = 0; c < this.children.length; ++c) {
        var d = this.children[c],
            e = d.chunkSize();

        if (e > a) {
          var f = Math.min(b, e - a),
              g = d.height;
          if (d.removeInner(a, f), this.height -= g - d.height, e == f && (this.children.splice(c--, 1), d.parent = null), 0 == (b -= f)) break;
          a = 0;
        } else a -= e;
      }

      if (this.size - b < 25 && (this.children.length > 1 || !(this.children[0] instanceof Xf))) {
        var h = [];
        this.collapse(h), this.children = [new Xf(h)], this.children[0].parent = this;
      }
    },
    collapse: function collapse(a) {
      for (var b = 0; b < this.children.length; ++b) {
        this.children[b].collapse(a);
      }
    },
    insertInner: function insertInner(a, b, c) {
      this.size += b.length, this.height += c;

      for (var d = 0; d < this.children.length; ++d) {
        var e = this.children[d],
            f = e.chunkSize();

        if (f >= a) {
          if (e.insertInner(a, b, c), e.lines && e.lines.length > 50) {
            for (; e.lines.length > 50;) {
              var g = e.lines.splice(e.lines.length - 25, 25),
                  h = new Xf(g);
              e.height -= h.height, this.children.splice(d + 1, 0, h), h.parent = this;
            }

            this.maybeSpill();
          }

          break;
        }

        a -= f;
      }
    },
    maybeSpill: function maybeSpill() {
      if (!(this.children.length <= 10)) {
        var a = this;

        do {
          var b = a.children.splice(a.children.length - 5, 5),
              c = new Yf(b);

          if (a.parent) {
            a.size -= c.size, a.height -= c.height;
            var e = ah(a.parent.children, a);
            a.parent.children.splice(e + 1, 0, c);
          } else {
            var d = new Yf(a.children);
            d.parent = a, a.children = [d, c], a = d;
          }

          c.parent = a.parent;
        } while (a.children.length > 10);

        a.parent.maybeSpill();
      }
    },
    iterN: function iterN(a, b, c) {
      for (var d = 0; d < this.children.length; ++d) {
        var e = this.children[d],
            f = e.chunkSize();

        if (f > a) {
          var g = Math.min(b, f - a);
          if (e.iterN(a, g, c)) return !0;
          if (0 == (b -= g)) break;
          a = 0;
        } else a -= f;
      }
    }
  };

  var Zf = 0,
      $f = v.Doc = function (a, b, c) {
    if (!(this instanceof $f)) return new $f(a, b, c);
    null == c && (c = 0), Yf.call(this, [new Xf([new Af("", null)])]), this.first = c, this.scrollTop = this.scrollLeft = 0, this.cantEdit = !1, this.cleanGeneration = 1, this.frontier = c;
    var d = ob(c, 0);
    this.sel = Lb(d), this.history = new lg(null), this.id = ++Zf, this.modeOption = b, "string" == typeof a && (a = Fh(a)), Wf(this, {
      from: d,
      to: d,
      text: a
    }), Yb(this, Lb(d), Sg);
  };

  $f.prototype = dh(Yf.prototype, {
    constructor: $f,
    iter: function iter(a, b, c) {
      c ? this.iterN(a - this.first, b - a, c) : this.iterN(this.first, this.first + this.size, a);
    },
    insert: function insert(a, b) {
      for (var c = 0, d = 0; d < b.length; ++d) {
        c += b[d].height;
      }

      this.insertInner(a - this.first, b, c);
    },
    remove: function remove(a, b) {
      this.removeInner(a - this.first, b);
    },
    getValue: function getValue(a) {
      var b = fg(this, this.first, this.first + this.size);
      return a === !1 ? b : b.join(a || "\n");
    },
    setValue: ed(function (a) {
      var b = ob(this.first, 0),
          c = this.first + this.size - 1;
      ee(this, {
        from: b,
        to: ob(c, dg(this, c).text.length),
        text: Fh(a),
        origin: "setValue",
        full: !0
      }, !0), Yb(this, Lb(b));
    }),
    replaceRange: function replaceRange(a, b, c, d) {
      b = Nb(this, b), c = c ? Nb(this, c) : b, ke(this, a, b, c, d);
    },
    getRange: function getRange(a, b, c) {
      var d = eg(this, Nb(this, a), Nb(this, b));
      return c === !1 ? d : d.join(c || "\n");
    },
    getLine: function getLine(a) {
      var b = this.getLineHandle(a);
      return b && b.text;
    },
    getLineHandle: function getLineHandle(a) {
      return Pb(this, a) ? dg(this, a) : void 0;
    },
    getLineNumber: function getLineNumber(a) {
      return hg(a);
    },
    getLineHandleVisualStart: function getLineHandleVisualStart(a) {
      return "number" == typeof a && (a = dg(this, a)), qf(a);
    },
    lineCount: function lineCount() {
      return this.size;
    },
    firstLine: function firstLine() {
      return this.first;
    },
    lastLine: function lastLine() {
      return this.first + this.size - 1;
    },
    clipPos: function clipPos(a) {
      return Nb(this, a);
    },
    getCursor: function getCursor(a) {
      var c,
          b = this.sel.primary();
      return c = null == a || "head" == a ? b.head : "anchor" == a ? b.anchor : "end" == a || "to" == a || a === !1 ? b.to() : b.from();
    },
    listSelections: function listSelections() {
      return this.sel.ranges;
    },
    somethingSelected: function somethingSelected() {
      return this.sel.somethingSelected();
    },
    setCursor: ed(function (a, b, c) {
      Vb(this, Nb(this, "number" == typeof a ? ob(a, b || 0) : a), null, c);
    }),
    setSelection: ed(function (a, b, c) {
      Vb(this, Nb(this, a), Nb(this, b || a), c);
    }),
    extendSelection: ed(function (a, b, c) {
      Sb(this, Nb(this, a), b && Nb(this, b), c);
    }),
    extendSelections: ed(function (a, b) {
      Tb(this, Qb(this, a, b));
    }),
    extendSelectionsBy: ed(function (a, b) {
      Tb(this, bh(this.sel.ranges, a), b);
    }),
    setSelections: ed(function (a, b, c) {
      if (a.length) {
        for (var d = 0, e = []; d < a.length; d++) {
          e[d] = new Jb(Nb(this, a[d].anchor), Nb(this, a[d].head));
        }

        null == b && (b = Math.min(a.length - 1, this.sel.primIndex)), Yb(this, Kb(e, b), c);
      }
    }),
    addSelection: ed(function (a, b, c) {
      var d = this.sel.ranges.slice(0);
      d.push(new Jb(Nb(this, a), Nb(this, b || a))), Yb(this, Kb(d, d.length - 1), c);
    }),
    getSelection: function getSelection(a) {
      for (var c, b = this.sel.ranges, d = 0; d < b.length; d++) {
        var e = eg(this, b[d].from(), b[d].to());
        c = c ? c.concat(e) : e;
      }

      return a === !1 ? c : c.join(a || "\n");
    },
    getSelections: function getSelections(a) {
      for (var b = [], c = this.sel.ranges, d = 0; d < c.length; d++) {
        var e = eg(this, c[d].from(), c[d].to());
        a !== !1 && (e = e.join(a || "\n")), b[d] = e;
      }

      return b;
    },
    replaceSelection: function replaceSelection(a, b, c) {
      for (var d = [], e = 0; e < this.sel.ranges.length; e++) {
        d[e] = a;
      }

      this.replaceSelections(d, b, c || "+input");
    },
    replaceSelections: ed(function (a, b, c) {
      for (var d = [], e = this.sel, f = 0; f < e.ranges.length; f++) {
        var g = e.ranges[f];
        d[f] = {
          from: g.from(),
          to: g.to(),
          text: Fh(a[f]),
          origin: c
        };
      }

      for (var h = b && "end" != b && ce(this, d, b), f = d.length - 1; f >= 0; f--) {
        ee(this, d[f]);
      }

      h ? Xb(this, h) : this.cm && qe(this.cm);
    }),
    undo: ed(function () {
      ge(this, "undo");
    }),
    redo: ed(function () {
      ge(this, "redo");
    }),
    undoSelection: ed(function () {
      ge(this, "undo", !0);
    }),
    redoSelection: ed(function () {
      ge(this, "redo", !0);
    }),
    setExtending: function setExtending(a) {
      this.extend = a;
    },
    getExtending: function getExtending() {
      return this.extend;
    },
    historySize: function historySize() {
      for (var a = this.history, b = 0, c = 0, d = 0; d < a.done.length; d++) {
        a.done[d].ranges || ++b;
      }

      for (var d = 0; d < a.undone.length; d++) {
        a.undone[d].ranges || ++c;
      }

      return {
        undo: b,
        redo: c
      };
    },
    clearHistory: function clearHistory() {
      this.history = new lg(this.history.maxGeneration);
    },
    markClean: function markClean() {
      this.cleanGeneration = this.changeGeneration(!0);
    },
    changeGeneration: function changeGeneration(a) {
      return a && (this.history.lastOp = this.history.lastSelOp = this.history.lastOrigin = null), this.history.generation;
    },
    isClean: function isClean(a) {
      return this.history.generation == (a || this.cleanGeneration);
    },
    getHistory: function getHistory() {
      return {
        done: wg(this.history.done),
        undone: wg(this.history.undone)
      };
    },
    setHistory: function setHistory(a) {
      var b = this.history = new lg(this.history.maxGeneration);
      b.done = wg(a.done.slice(0), null, !0), b.undone = wg(a.undone.slice(0), null, !0);
    },
    addLineClass: ed(function (a, b, c) {
      return te(this, a, "gutter" == b ? "gutter" : "class", function (a) {
        var d = "text" == b ? "textClass" : "background" == b ? "bgClass" : "gutter" == b ? "gutterClass" : "wrapClass";

        if (a[d]) {
          if (sh(c).test(a[d])) return !1;
          a[d] += " " + c;
        } else a[d] = c;

        return !0;
      });
    }),
    removeLineClass: ed(function (a, b, c) {
      return te(this, a, "gutter" == b ? "gutter" : "class", function (a) {
        var d = "text" == b ? "textClass" : "background" == b ? "bgClass" : "gutter" == b ? "gutterClass" : "wrapClass",
            e = a[d];
        if (!e) return !1;
        if (null == c) a[d] = null;else {
          var f = e.match(sh(c));
          if (!f) return !1;
          var g = f.index + f[0].length;
          a[d] = e.slice(0, f.index) + (f.index && g != e.length ? " " : "") + e.slice(g) || null;
        }
        return !0;
      });
    }),
    addLineWidget: ed(function (a, b, c) {
      return zf(this, a, b, c);
    }),
    removeLineWidget: function removeLineWidget(a) {
      a.clear();
    },
    markText: function markText(a, b, c) {
      return Se(this, Nb(this, a), Nb(this, b), c, "range");
    },
    setBookmark: function setBookmark(a, b) {
      var c = {
        replacedWith: b && (null == b.nodeType ? b.widget : b),
        insertLeft: b && b.insertLeft,
        clearWhenEmpty: !1,
        shared: b && b.shared,
        handleMouseEvents: b && b.handleMouseEvents
      };
      return a = Nb(this, a), Se(this, a, a, c, "bookmark");
    },
    findMarksAt: function findMarksAt(a) {
      a = Nb(this, a);
      var b = [],
          c = dg(this, a.line).markedSpans;
      if (c) for (var d = 0; d < c.length; ++d) {
        var e = c[d];
        (null == e.from || e.from <= a.ch) && (null == e.to || e.to >= a.ch) && b.push(e.marker.parent || e.marker);
      }
      return b;
    },
    findMarks: function findMarks(a, b, c) {
      a = Nb(this, a), b = Nb(this, b);
      var d = [],
          e = a.line;
      return this.iter(a.line, b.line + 1, function (f) {
        var g = f.markedSpans;
        if (g) for (var h = 0; h < g.length; h++) {
          var i = g[h];
          e == a.line && a.ch > i.to || null == i.from && e != a.line || e == b.line && i.from > b.ch || c && !c(i.marker) || d.push(i.marker.parent || i.marker);
        }
        ++e;
      }), d;
    },
    getAllMarks: function getAllMarks() {
      var a = [];
      return this.iter(function (b) {
        var c = b.markedSpans;
        if (c) for (var d = 0; d < c.length; ++d) {
          null != c[d].from && a.push(c[d].marker);
        }
      }), a;
    },
    posFromIndex: function posFromIndex(a) {
      var b,
          c = this.first;
      return this.iter(function (d) {
        var e = d.text.length + 1;
        return e > a ? (b = a, !0) : (a -= e, ++c, void 0);
      }), Nb(this, ob(c, b));
    },
    indexFromPos: function indexFromPos(a) {
      a = Nb(this, a);
      var b = a.ch;
      return a.line < this.first || a.ch < 0 ? 0 : (this.iter(this.first, a.line, function (a) {
        b += a.text.length + 1;
      }), b);
    },
    copy: function copy(a) {
      var b = new $f(fg(this, this.first, this.first + this.size), this.modeOption, this.first);
      return b.scrollTop = this.scrollTop, b.scrollLeft = this.scrollLeft, b.sel = this.sel, b.extend = !1, a && (b.history.undoDepth = this.history.undoDepth, b.setHistory(this.getHistory())), b;
    },
    linkedDoc: function linkedDoc(a) {
      a || (a = {});
      var b = this.first,
          c = this.first + this.size;
      null != a.from && a.from > b && (b = a.from), null != a.to && a.to < c && (c = a.to);
      var d = new $f(fg(this, b, c), a.mode || this.modeOption, b);
      return a.sharedHist && (d.history = this.history), (this.linked || (this.linked = [])).push({
        doc: d,
        sharedHist: a.sharedHist
      }), d.linked = [{
        doc: this,
        isParent: !0,
        sharedHist: a.sharedHist
      }], We(d, Ve(this)), d;
    },
    unlinkDoc: function unlinkDoc(a) {
      if (a instanceof v && (a = a.doc), this.linked) for (var b = 0; b < this.linked.length; ++b) {
        var c = this.linked[b];

        if (c.doc == a) {
          this.linked.splice(b, 1), a.unlinkDoc(this), Xe(Ve(this));
          break;
        }
      }

      if (a.history == this.history) {
        var d = [a.id];
        bg(a, function (a) {
          d.push(a.id);
        }, !0), a.history = new lg(null), a.history.done = wg(this.history.done, d), a.history.undone = wg(this.history.undone, d);
      }
    },
    iterLinkedDocs: function iterLinkedDocs(a) {
      bg(this, a);
    },
    getMode: function getMode() {
      return this.mode;
    },
    getEditor: function getEditor() {
      return this.cm;
    }
  }), $f.prototype.eachLine = $f.prototype.iter;

  var _f = "iter insert remove copy getEditor".split(" ");

  for (var ag in $f.prototype) {
    $f.prototype.hasOwnProperty(ag) && ah(_f, ag) < 0 && (v.prototype[ag] = function (a) {
      return function () {
        return a.apply(this.doc, arguments);
      };
    }($f.prototype[ag]));
  }

  Pg($f);

  var Ag = v.e_preventDefault = function (a) {
    a.preventDefault ? a.preventDefault() : a.returnValue = !1;
  },
      Bg = v.e_stopPropagation = function (a) {
    a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0;
  },
      Dg = v.e_stop = function (a) {
    Ag(a), Bg(a);
  },
      Gg = v.on = function (a, b, c) {
    if (a.addEventListener) a.addEventListener(b, c, !1);else if (a.attachEvent) a.attachEvent("on" + b, c);else {
      var d = a._handlers || (a._handlers = {}),
          e = d[b] || (d[b] = []);
      e.push(c);
    }
  },
      Hg = v.off = function (a, b, c) {
    if (a.removeEventListener) a.removeEventListener(b, c, !1);else if (a.detachEvent) a.detachEvent("on" + b, c);else {
      var d = a._handlers && a._handlers[b];
      if (!d) return;

      for (var e = 0; e < d.length; ++e) {
        if (d[e] == c) {
          d.splice(e, 1);
          break;
        }
      }
    }
  },
      Ig = v.signal = function (a, b) {
    var c = a._handlers && a._handlers[b];
    if (c) for (var d = Array.prototype.slice.call(arguments, 2), e = 0; e < c.length; ++e) {
      c[e].apply(null, d);
    }
  },
      Jg = null,
      Qg = 30,
      Rg = v.Pass = {
    toString: function toString() {
      return "CodeMirror.Pass";
    }
  },
      Sg = {
    scroll: !1
  },
      Tg = {
    origin: "*mouse"
  },
      Ug = {
    origin: "+move"
  };

  Vg.prototype.set = function (a, b) {
    clearTimeout(this.id), this.id = setTimeout(b, a);
  };

  var Wg = v.countColumn = function (a, b, c, d, e) {
    null == b && (b = a.search(/[^\s\u00a0]/), -1 == b && (b = a.length));

    for (var f = d || 0, g = e || 0;;) {
      var h = a.indexOf("	", f);
      if (0 > h || h >= b) return g + (b - f);
      g += h - f, g += c - g % c, f = h + 1;
    }
  },
      Yg = [""],
      _g = function _g(a) {
    a.select();
  };

  m ? _g = function _g(a) {
    a.selectionStart = 0, a.selectionEnd = a.value.length;
  } : d && (_g = function _g(a) {
    try {
      a.select();
    } catch (b) {}
  });

  var nh,
      gh = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/,
      hh = v.isWordChar = function (a) {
    return /\w/.test(a) || a > "\x80" && (a.toUpperCase() != a.toLowerCase() || gh.test(a));
  },
      kh = /[\u0300-\u036f\u0483-\u0489\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u065e\u0670\u06d6-\u06dc\u06de-\u06e4\u06e7\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0900-\u0902\u093c\u0941-\u0948\u094d\u0951-\u0955\u0962\u0963\u0981\u09bc\u09be\u09c1-\u09c4\u09cd\u09d7\u09e2\u09e3\u0a01\u0a02\u0a3c\u0a41\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a70\u0a71\u0a75\u0a81\u0a82\u0abc\u0ac1-\u0ac5\u0ac7\u0ac8\u0acd\u0ae2\u0ae3\u0b01\u0b3c\u0b3e\u0b3f\u0b41-\u0b44\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b82\u0bbe\u0bc0\u0bcd\u0bd7\u0c3e-\u0c40\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0cbc\u0cbf\u0cc2\u0cc6\u0ccc\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0d3e\u0d41-\u0d44\u0d4d\u0d57\u0d62\u0d63\u0dca\u0dcf\u0dd2-\u0dd4\u0dd6\u0ddf\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0f18\u0f19\u0f35\u0f37\u0f39\u0f71-\u0f7e\u0f80-\u0f84\u0f86\u0f87\u0f90-\u0f97\u0f99-\u0fbc\u0fc6\u102d-\u1030\u1032-\u1037\u1039\u103a\u103d\u103e\u1058\u1059\u105e-\u1060\u1071-\u1074\u1082\u1085\u1086\u108d\u109d\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b7-\u17bd\u17c6\u17c9-\u17d3\u17dd\u180b-\u180d\u18a9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193b\u1a17\u1a18\u1a56\u1a58-\u1a5e\u1a60\u1a62\u1a65-\u1a6c\u1a73-\u1a7c\u1a7f\u1b00-\u1b03\u1b34\u1b36-\u1b3a\u1b3c\u1b42\u1b6b-\u1b73\u1b80\u1b81\u1ba2-\u1ba5\u1ba8\u1ba9\u1c2c-\u1c33\u1c36\u1c37\u1cd0-\u1cd2\u1cd4-\u1ce0\u1ce2-\u1ce8\u1ced\u1dc0-\u1de6\u1dfd-\u1dff\u200c\u200d\u20d0-\u20f0\u2cef-\u2cf1\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua66f-\ua672\ua67c\ua67d\ua6f0\ua6f1\ua802\ua806\ua80b\ua825\ua826\ua8c4\ua8e0-\ua8f1\ua926-\ua92d\ua947-\ua951\ua980-\ua982\ua9b3\ua9b6-\ua9b9\ua9bc\uaa29-\uaa2e\uaa31\uaa32\uaa35\uaa36\uaa43\uaa4c\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uabe5\uabe8\uabed\udc00-\udfff\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\uff9e\uff9f]/;

  nh = document.createRange ? function (a, b, c, d) {
    var e = document.createRange();
    return e.setEnd(d || a, c), e.setStart(a, b), e;
  } : function (a, b, c) {
    var d = document.body.createTextRange();

    try {
      d.moveToElementText(a.parentNode);
    } catch (e) {
      return d;
    }

    return d.collapse(!0), d.moveEnd("character", c), d.moveStart("character", b), d;
  };

  var qh = v.contains = function (a, b) {
    if (3 == b.nodeType && (b = b.parentNode), a.contains) return a.contains(b);

    do {
      if (11 == b.nodeType && (b = b.host), b == a) return !0;
    } while (b = b.parentNode);
  };

  d && 11 > e && (rh = function rh() {
    try {
      return document.activeElement;
    } catch (a) {
      return document.body;
    }
  });

  var Bh,
      Dh,
      th = v.rmClass = function (a, b) {
    var c = a.className,
        d = sh(b).exec(c);

    if (d) {
      var e = c.slice(d.index + d[0].length);
      a.className = c.slice(0, d.index) + (e ? d[1] + e : "");
    }
  },
      uh = v.addClass = function (a, b) {
    var c = a.className;
    sh(b).test(c) || (a.className += (c ? " " : "") + b);
  },
      xh = !1,
      Ah = function () {
    if (d && 9 > e) return !1;
    var a = mh("div");
    return "draggable" in a || "dragDrop" in a;
  }(),
      Fh = v.splitLines = 3 != "\n\nb".split(/\n/).length ? function (a) {
    for (var b = 0, c = [], d = a.length; d >= b;) {
      var e = a.indexOf("\n", b);
      -1 == e && (e = a.length);
      var f = a.slice(b, "\r" == a.charAt(e - 1) ? e - 1 : e),
          g = f.indexOf("\r");
      -1 != g ? (c.push(f.slice(0, g)), b += g + 1) : (c.push(f), b = e + 1);
    }

    return c;
  } : function (a) {
    return a.split(/\r\n?|\n/);
  },
      Gh = window.getSelection ? function (a) {
    try {
      return a.selectionStart != a.selectionEnd;
    } catch (b) {
      return !1;
    }
  } : function (a) {
    try {
      var b = a.ownerDocument.selection.createRange();
    } catch (c) {}

    return b && b.parentElement() == a ? 0 != b.compareEndPoints("StartToEnd", b) : !1;
  },
      Hh = function () {
    var a = mh("div");
    return "oncopy" in a ? !0 : (a.setAttribute("oncopy", "return;"), "function" == typeof a.oncopy);
  }(),
      Ih = null,
      Kh = {
    3: "Enter",
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    16: "Shift",
    17: "Ctrl",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Esc",
    32: "Space",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    44: "PrintScrn",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Mod",
    92: "Mod",
    93: "Mod",
    107: "=",
    109: "-",
    127: "Delete",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    63232: "Up",
    63233: "Down",
    63234: "Left",
    63235: "Right",
    63272: "Delete",
    63273: "Home",
    63275: "End",
    63276: "PageUp",
    63277: "PageDown",
    63302: "Insert"
  };

  v.keyNames = Kh, function () {
    for (var a = 0; 10 > a; a++) {
      Kh[a + 48] = Kh[a + 96] = String(a);
    }

    for (var a = 65; 90 >= a; a++) {
      Kh[a] = String.fromCharCode(a);
    }

    for (var a = 1; 12 >= a; a++) {
      Kh[a + 111] = Kh[a + 63235] = "F" + a;
    }
  }();

  var Uh,
      Zh = function () {
    function c(c) {
      return 247 >= c ? a.charAt(c) : c >= 1424 && 1524 >= c ? "R" : c >= 1536 && 1773 >= c ? b.charAt(c - 1536) : c >= 1774 && 2220 >= c ? "r" : c >= 8192 && 8203 >= c ? "w" : 8204 == c ? "b" : "L";
    }

    function j(a, b, c) {
      this.level = a, this.from = b, this.to = c;
    }

    var a = "bbbbbbbbbtstwsbbbbbbbbbbbbbbssstwNN%%%NNNNNN,N,N1111111111NNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNNNLLLLLLLLLLLLLLLLLLLLLLLLLLNNNNbbbbbbsbbbbbbbbbbbbbbbbbbbbbbbbbb,N%%%%NNNNLNNNNN%%11NLNNN1LNNNNNLLLLLLLLLLLLLLLLLLLLLLLNLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLN",
        b = "rrrrrrrrrrrr,rNNmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmrrrrrrrnnnnnnnnnn%nnrrrmrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrmmmmmmmmmmmmmmmmmmmNmmmm",
        d = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,
        e = /[stwN]/,
        f = /[LRr]/,
        g = /[Lb1n]/,
        h = /[1n]/,
        i = "L";
    return function (a) {
      if (!d.test(a)) return !1;

      for (var m, b = a.length, k = [], l = 0; b > l; ++l) {
        k.push(m = c(a.charCodeAt(l)));
      }

      for (var l = 0, n = i; b > l; ++l) {
        var m = k[l];
        "m" == m ? k[l] = n : n = m;
      }

      for (var l = 0, o = i; b > l; ++l) {
        var m = k[l];
        "1" == m && "r" == o ? k[l] = "n" : f.test(m) && (o = m, "r" == m && (k[l] = "R"));
      }

      for (var l = 1, n = k[0]; b - 1 > l; ++l) {
        var m = k[l];
        "+" == m && "1" == n && "1" == k[l + 1] ? k[l] = "1" : "," != m || n != k[l + 1] || "1" != n && "n" != n || (k[l] = n), n = m;
      }

      for (var l = 0; b > l; ++l) {
        var m = k[l];
        if ("," == m) k[l] = "N";else if ("%" == m) {
          for (var p = l + 1; b > p && "%" == k[p]; ++p) {
            ;
          }

          for (var q = l && "!" == k[l - 1] || b > p && "1" == k[p] ? "1" : "N", r = l; p > r; ++r) {
            k[r] = q;
          }

          l = p - 1;
        }
      }

      for (var l = 0, o = i; b > l; ++l) {
        var m = k[l];
        "L" == o && "1" == m ? k[l] = "L" : f.test(m) && (o = m);
      }

      for (var l = 0; b > l; ++l) {
        if (e.test(k[l])) {
          for (var p = l + 1; b > p && e.test(k[p]); ++p) {
            ;
          }

          for (var s = "L" == (l ? k[l - 1] : i), t = "L" == (b > p ? k[p] : i), q = s || t ? "L" : "R", r = l; p > r; ++r) {
            k[r] = q;
          }

          l = p - 1;
        }
      }

      for (var v, u = [], l = 0; b > l;) {
        if (g.test(k[l])) {
          var w = l;

          for (++l; b > l && g.test(k[l]); ++l) {
            ;
          }

          u.push(new j(0, w, l));
        } else {
          var x = l,
              y = u.length;

          for (++l; b > l && "L" != k[l]; ++l) {
            ;
          }

          for (var r = x; l > r;) {
            if (h.test(k[r])) {
              r > x && u.splice(y, 0, new j(1, x, r));
              var z = r;

              for (++r; l > r && h.test(k[r]); ++r) {
                ;
              }

              u.splice(y, 0, new j(2, z, r)), x = r;
            } else ++r;
          }

          l > x && u.splice(y, 0, new j(1, x, l));
        }
      }

      return 1 == u[0].level && (v = a.match(/^\s+/)) && (u[0].from = v[0].length, u.unshift(new j(0, 0, v[0].length))), 1 == $g(u).level && (v = a.match(/\s+$/)) && ($g(u).to -= v[0].length, u.push(new j(0, b - v[0].length, b))), 2 == u[0].level && u.unshift(new j(1, u[0].to, u[0].to)), u[0].level != $g(u).level && u.push(new j(u[0].level, b, b)), u;
    };
  }();

  return v.version = "5.3.1", v;
}), function (a) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? a(require("../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../lib/codemirror"], a) : a(CodeMirror);
}(function (a) {
  function e(a, b, e, g) {
    var h = a.getLineHandle(b.line),
        i = b.ch - 1,
        j = i >= 0 && d[h.text.charAt(i)] || d[h.text.charAt(++i)];
    if (!j) return null;
    var k = ">" == j.charAt(1) ? 1 : -1;
    if (e && k > 0 != (i == b.ch)) return null;
    var l = a.getTokenTypeAt(c(b.line, i + 1)),
        m = f(a, c(b.line, i + (k > 0 ? 1 : 0)), k, l || null, g);
    return null == m ? null : {
      from: c(b.line, i),
      to: m && m.pos,
      match: m && m.ch == j.charAt(0),
      forward: k > 0
    };
  }

  function f(a, b, e, f, g) {
    for (var h = g && g.maxScanLineLength || 1e4, i = g && g.maxScanLines || 1e3, j = [], k = g && g.bracketRegex ? g.bracketRegex : /[(){}[\]]/, l = e > 0 ? Math.min(b.line + i, a.lastLine() + 1) : Math.max(a.firstLine() - 1, b.line - i), m = b.line; m != l; m += e) {
      var n = a.getLine(m);

      if (n) {
        var o = e > 0 ? 0 : n.length - 1,
            p = e > 0 ? n.length : -1;
        if (!(n.length > h)) for (m == b.line && (o = b.ch - (0 > e ? 1 : 0)); o != p; o += e) {
          var q = n.charAt(o);

          if (k.test(q) && (void 0 === f || a.getTokenTypeAt(c(m, o + 1)) == f)) {
            var r = d[q];
            if (">" == r.charAt(1) == e > 0) j.push(q);else {
              if (!j.length) return {
                pos: c(m, o),
                ch: q
              };
              j.pop();
            }
          }
        }
      }
    }

    return m - e == (e > 0 ? a.lastLine() : a.firstLine()) ? !1 : null;
  }

  function g(a, d, f) {
    for (var g = a.state.matchBrackets.maxHighlightLineLength || 1e3, h = [], i = a.listSelections(), j = 0; j < i.length; j++) {
      var k = i[j].empty() && e(a, i[j].head, !1, f);

      if (k && a.getLine(k.from.line).length <= g) {
        var l = k.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
        h.push(a.markText(k.from, c(k.from.line, k.from.ch + 1), {
          className: l
        })), k.to && a.getLine(k.to.line).length <= g && h.push(a.markText(k.to, c(k.to.line, k.to.ch + 1), {
          className: l
        }));
      }
    }

    if (h.length) {
      b && a.state.focused && a.focus();

      var m = function m() {
        a.operation(function () {
          for (var a = 0; a < h.length; a++) {
            h[a].clear();
          }
        });
      };

      if (!d) return m;
      setTimeout(m, 800);
    }
  }

  function i(a) {
    a.operation(function () {
      h && (h(), h = null), h = g(a, !1, a.state.matchBrackets);
    });
  }

  var b = /MSIE \d/.test(navigator.userAgent) && (null == document.documentMode || document.documentMode < 8),
      c = a.Pos,
      d = {
    "(": ")>",
    ")": "(<",
    "[": "]>",
    "]": "[<",
    "{": "}>",
    "}": "{<"
  },
      h = null;
  a.defineOption("matchBrackets", !1, function (b, c, d) {
    d && d != a.Init && b.off("cursorActivity", i), c && (b.state.matchBrackets = "object" == _typeof(c) ? c : {}, b.on("cursorActivity", i));
  }), a.defineExtension("matchBrackets", function () {
    g(this, !0);
  }), a.defineExtension("findMatchingBracket", function (a, b, c) {
    return e(this, a, b, c);
  }), a.defineExtension("scanForBracket", function (a, b, c, d) {
    return f(this, a, b, c, d);
  });
}), function (a) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? a(require("../lib/codemirror"), require("../addon/search/searchcursor"), require("../addon/edit/matchbrackets")) : "function" == typeof define && define.amd ? define(["../lib/codemirror", "../addon/search/searchcursor", "../addon/edit/matchbrackets"], a) : a(CodeMirror);
}(function (a) {
  "use strict";

  function g(b, c, e) {
    if (0 > e && 0 == c.ch) return b.clipPos(d(c.line - 1));
    var f = b.getLine(c.line);
    if (e > 0 && c.ch >= f.length) return b.clipPos(d(c.line + 1, 0));

    for (var h, g = "start", i = c.ch, j = 0 > e ? 0 : f.length, k = 0; i != j; i += e, k++) {
      var l = f.charAt(0 > e ? i - 1 : i),
          m = "_" != l && a.isWordChar(l) ? "w" : "o";
      if ("w" == m && l.toUpperCase() == l && (m = "W"), "start" == g) "o" != m && (g = "in", h = m);else if ("in" == g && h != m) {
        if ("w" == h && "W" == m && 0 > e && i--, "W" == h && "w" == m && e > 0) {
          h = "w";
          continue;
        }

        break;
      }
    }

    return d(c.line, i);
  }

  function h(a, b) {
    a.extendSelectionsBy(function (c) {
      return a.display.shift || a.doc.extend || c.empty() ? g(a.doc, c.head, b) : 0 > b ? c.from() : c.to();
    });
  }

  function i(a, b) {
    a.operation(function () {
      for (var c = a.listSelections().length, e = [], f = -1, g = 0; c > g; g++) {
        var h = a.listSelections()[g].head;

        if (!(h.line <= f)) {
          var i = d(h.line + (b ? 0 : 1), 0);
          a.replaceRange("\n", i, null, "+insertLine"), a.indentLine(i.line, null, !0), e.push({
            head: i,
            anchor: i
          }), f = h.line + 1;
        }
      }

      a.setSelections(e);
    });
  }

  function j(b, c) {
    for (var e = c.ch, f = e, g = b.getLine(c.line); e && a.isWordChar(g.charAt(e - 1));) {
      --e;
    }

    for (; f < g.length && a.isWordChar(g.charAt(f));) {
      ++f;
    }

    return {
      from: d(c.line, e),
      to: d(c.line, f),
      word: g.slice(e, f)
    };
  }

  function l(a) {
    var b = a.getCursor(),
        c = a.scanForBracket(b, -1);
    if (c) for (;;) {
      var e = a.scanForBracket(b, 1);
      if (!e) return;
      if (e.ch == k.charAt(k.indexOf(c.ch) + 1)) return a.setSelection(d(c.pos.line, c.pos.ch + 1), e.pos, !1), !0;
      b = d(e.pos.line, e.pos.ch + 1);
    }
  }

  function n(a, b) {
    for (var f, c = a.listSelections(), e = [], g = 0; g < c.length; g++) {
      var h = c[g];

      if (!h.empty()) {
        for (var i = h.from().line, j = h.to().line; g < c.length - 1 && c[g + 1].from().line == j;) {
          j = h[++g].to().line;
        }

        e.push(i, j);
      }
    }

    e.length ? f = !0 : e.push(a.firstLine(), a.lastLine()), a.operation(function () {
      for (var c = [], g = 0; g < e.length; g += 2) {
        var h = e[g],
            i = e[g + 1],
            j = d(h, 0),
            k = d(i),
            l = a.getRange(j, k, !1);
        b ? l.sort() : l.sort(function (a, b) {
          var c = a.toUpperCase(),
              d = b.toUpperCase();
          return c != d && (a = c, b = d), b > a ? -1 : a == b ? 0 : 1;
        }), a.replaceRange(l, j, k), f && c.push({
          anchor: j,
          head: k
        });
      }

      f && a.setSelections(c, 0);
    });
  }

  function p(b, c) {
    b.operation(function () {
      for (var d = b.listSelections(), e = [], f = [], g = 0; g < d.length; g++) {
        var h = d[g];
        h.empty() ? (e.push(g), f.push("")) : f.push(c(b.getRange(h.from(), h.to())));
      }

      b.replaceSelections(f, "around", "case");

      for (var i, g = e.length - 1; g >= 0; g--) {
        var h = d[e[g]];

        if (!(i && a.cmpPos(h.head, i) > 0)) {
          var k = j(b, h.head);
          i = k.from, b.replaceRange(c(k.word), k.from, k.to);
        }
      }
    });
  }

  function q(b) {
    var c = b.getCursor("from"),
        d = b.getCursor("to");

    if (0 == a.cmpPos(c, d)) {
      var e = j(b, c);
      if (!e.word) return;
      c = e.from, d = e.to;
    }

    return {
      from: c,
      to: d,
      query: b.getRange(c, d),
      word: e
    };
  }

  function r(a, b) {
    var c = q(a);

    if (c) {
      var e = c.query,
          f = a.getSearchCursor(e, b ? c.to : c.from);
      (b ? f.findNext() : f.findPrevious()) ? a.setSelection(f.from(), f.to()) : (f = a.getSearchCursor(e, b ? d(a.firstLine(), 0) : a.clipPos(d(a.lastLine()))), (b ? f.findNext() : f.findPrevious()) ? a.setSelection(f.from(), f.to()) : c.word && a.setSelection(c.from, c.to));
    }
  }

  var b = a.keyMap.sublime = {
    fallthrough: "default"
  },
      c = a.commands,
      d = a.Pos,
      e = a.keyMap["default"] == a.keyMap.macDefault,
      f = e ? "Cmd-" : "Ctrl-";
  c[b["Alt-Left"] = "goSubwordLeft"] = function (a) {
    h(a, -1);
  }, c[b["Alt-Right"] = "goSubwordRight"] = function (a) {
    h(a, 1);
  }, c[b[f + "Up"] = "scrollLineUp"] = function (a) {
    var b = a.getScrollInfo();

    if (!a.somethingSelected()) {
      var c = a.lineAtHeight(b.top + b.clientHeight, "local");
      a.getCursor().line >= c && a.execCommand("goLineUp");
    }

    a.scrollTo(null, b.top - a.defaultTextHeight());
  }, c[b[f + "Down"] = "scrollLineDown"] = function (a) {
    var b = a.getScrollInfo();

    if (!a.somethingSelected()) {
      var c = a.lineAtHeight(b.top, "local") + 1;
      a.getCursor().line <= c && a.execCommand("goLineDown");
    }

    a.scrollTo(null, b.top + a.defaultTextHeight());
  }, c[b["Shift-" + f + "L"] = "splitSelectionByLine"] = function (a) {
    for (var b = a.listSelections(), c = [], e = 0; e < b.length; e++) {
      for (var f = b[e].from(), g = b[e].to(), h = f.line; h <= g.line; ++h) {
        g.line > f.line && h == g.line && 0 == g.ch || c.push({
          anchor: h == f.line ? f : d(h, 0),
          head: h == g.line ? g : d(h)
        });
      }
    }

    a.setSelections(c, 0);
  }, b["Shift-Tab"] = "indentLess", c[b.Esc = "singleSelectionTop"] = function (a) {
    var b = a.listSelections()[0];
    a.setSelection(b.anchor, b.head, {
      scroll: !1
    });
  }, c[b[f + "L"] = "selectLine"] = function (a) {
    for (var b = a.listSelections(), c = [], e = 0; e < b.length; e++) {
      var f = b[e];
      c.push({
        anchor: d(f.from().line, 0),
        head: d(f.to().line + 1, 0)
      });
    }

    a.setSelections(c);
  }, b["Shift-" + f + "K"] = "deleteLine", c[b[f + "Enter"] = "insertLineAfter"] = function (a) {
    i(a, !1);
  }, c[b["Shift-" + f + "Enter"] = "insertLineBefore"] = function (a) {
    i(a, !0);
  }, c[b[f + "D"] = "selectNextOccurrence"] = function (b) {
    var c = b.getCursor("from"),
        e = b.getCursor("to"),
        f = b.state.sublimeFindFullWord == b.doc.sel;

    if (0 == a.cmpPos(c, e)) {
      var g = j(b, c);
      if (!g.word) return;
      b.setSelection(g.from, g.to), f = !0;
    } else {
      var h = b.getRange(c, e),
          i = f ? new RegExp("\\b" + h + "\\b") : h,
          k = b.getSearchCursor(i, e);
      k.findNext() ? b.addSelection(k.from(), k.to()) : (k = b.getSearchCursor(i, d(b.firstLine(), 0)), k.findNext() && b.addSelection(k.from(), k.to()));
    }

    f && (b.state.sublimeFindFullWord = b.doc.sel);
  };
  var k = "(){}[]";
  c[b["Shift-" + f + "Space"] = "selectScope"] = function (a) {
    l(a) || a.execCommand("selectAll");
  }, c[b["Shift-" + f + "M"] = "selectBetweenBrackets"] = function (b) {
    return l(b) ? void 0 : a.Pass;
  }, c[b[f + "M"] = "goToBracket"] = function (b) {
    b.extendSelectionsBy(function (c) {
      var e = b.scanForBracket(c.head, 1);
      if (e && 0 != a.cmpPos(e.pos, c.head)) return e.pos;
      var f = b.scanForBracket(c.head, -1);
      return f && d(f.pos.line, f.pos.ch + 1) || c.head;
    });
  };
  var m = e ? "Cmd-Ctrl-" : "Shift-Ctrl-";
  c[b[m + "Up"] = "swapLineUp"] = function (a) {
    for (var b = a.listSelections(), c = [], e = a.firstLine() - 1, f = [], g = 0; g < b.length; g++) {
      var h = b[g],
          i = h.from().line - 1,
          j = h.to().line;
      f.push({
        anchor: d(h.anchor.line - 1, h.anchor.ch),
        head: d(h.head.line - 1, h.head.ch)
      }), 0 != h.to().ch || h.empty() || --j, i > e ? c.push(i, j) : c.length && (c[c.length - 1] = j), e = j;
    }

    a.operation(function () {
      for (var b = 0; b < c.length; b += 2) {
        var e = c[b],
            g = c[b + 1],
            h = a.getLine(e);
        a.replaceRange("", d(e, 0), d(e + 1, 0), "+swapLine"), g > a.lastLine() ? a.replaceRange("\n" + h, d(a.lastLine()), null, "+swapLine") : a.replaceRange(h + "\n", d(g, 0), null, "+swapLine");
      }

      a.setSelections(f), a.scrollIntoView();
    });
  }, c[b[m + "Down"] = "swapLineDown"] = function (a) {
    for (var b = a.listSelections(), c = [], e = a.lastLine() + 1, f = b.length - 1; f >= 0; f--) {
      var g = b[f],
          h = g.to().line + 1,
          i = g.from().line;
      0 != g.to().ch || g.empty() || h--, e > h ? c.push(h, i) : c.length && (c[c.length - 1] = i), e = i;
    }

    a.operation(function () {
      for (var b = c.length - 2; b >= 0; b -= 2) {
        var e = c[b],
            f = c[b + 1],
            g = a.getLine(e);
        e == a.lastLine() ? a.replaceRange("", d(e - 1), d(e), "+swapLine") : a.replaceRange("", d(e, 0), d(e + 1, 0), "+swapLine"), a.replaceRange(g + "\n", d(f, 0), null, "+swapLine");
      }

      a.scrollIntoView();
    });
  }, b[f + "/"] = "toggleComment", c[b[f + "J"] = "joinLines"] = function (a) {
    for (var b = a.listSelections(), c = [], e = 0; e < b.length; e++) {
      for (var f = b[e], g = f.from(), h = g.line, i = f.to().line; e < b.length - 1 && b[e + 1].from().line == i;) {
        i = b[++e].to().line;
      }

      c.push({
        start: h,
        end: i,
        anchor: !f.empty() && g
      });
    }

    a.operation(function () {
      for (var b = 0, e = [], f = 0; f < c.length; f++) {
        for (var i, g = c[f], h = g.anchor && d(g.anchor.line - b, g.anchor.ch), j = g.start; j <= g.end; j++) {
          var k = j - b;
          j == g.end && (i = d(k, a.getLine(k).length + 1)), k < a.lastLine() && (a.replaceRange(" ", d(k), d(k + 1, /^\s*/.exec(a.getLine(k + 1))[0].length)), ++b);
        }

        e.push({
          anchor: h || i,
          head: i
        });
      }

      a.setSelections(e, 0);
    });
  }, c[b["Shift-" + f + "D"] = "duplicateLine"] = function (a) {
    a.operation(function () {
      for (var b = a.listSelections().length, c = 0; b > c; c++) {
        var e = a.listSelections()[c];
        e.empty() ? a.replaceRange(a.getLine(e.head.line) + "\n", d(e.head.line, 0)) : a.replaceRange(a.getRange(e.from(), e.to()), e.from());
      }

      a.scrollIntoView();
    });
  }, b[f + "T"] = "transposeChars", c[b.F9 = "sortLines"] = function (a) {
    n(a, !0);
  }, c[b[f + "F9"] = "sortLinesInsensitive"] = function (a) {
    n(a, !1);
  }, c[b.F2 = "nextBookmark"] = function (a) {
    var b = a.state.sublimeBookmarks;
    if (b) for (; b.length;) {
      var c = b.shift(),
          d = c.find();
      if (d) return b.push(c), a.setSelection(d.from, d.to);
    }
  }, c[b["Shift-F2"] = "prevBookmark"] = function (a) {
    var b = a.state.sublimeBookmarks;
    if (b) for (; b.length;) {
      b.unshift(b.pop());
      var c = b[b.length - 1].find();
      if (c) return a.setSelection(c.from, c.to);
      b.pop();
    }
  }, c[b[f + "F2"] = "toggleBookmark"] = function (a) {
    for (var b = a.listSelections(), c = a.state.sublimeBookmarks || (a.state.sublimeBookmarks = []), d = 0; d < b.length; d++) {
      for (var e = b[d].from(), f = b[d].to(), g = a.findMarks(e, f), h = 0; h < g.length; h++) {
        if (g[h].sublimeBookmark) {
          g[h].clear();

          for (var i = 0; i < c.length; i++) {
            c[i] == g[h] && c.splice(i--, 1);
          }

          break;
        }
      }

      h == g.length && c.push(a.markText(e, f, {
        sublimeBookmark: !0,
        clearWhenEmpty: !1
      }));
    }
  }, c[b["Shift-" + f + "F2"] = "clearBookmarks"] = function (a) {
    var b = a.state.sublimeBookmarks;
    if (b) for (var c = 0; c < b.length; c++) {
      b[c].clear();
    }
    b.length = 0;
  }, c[b["Alt-F2"] = "selectBookmarks"] = function (a) {
    var b = a.state.sublimeBookmarks,
        c = [];
    if (b) for (var d = 0; d < b.length; d++) {
      var e = b[d].find();
      e ? c.push({
        anchor: e.from,
        head: e.to
      }) : b.splice(d--, 0);
    }
    c.length && a.setSelections(c, 0);
  }, b["Alt-Q"] = "wrapLines";
  var o = f + "K ";
  b[o + f + "Backspace"] = "delLineLeft", c[b.Backspace = "smartBackspace"] = function (b) {
    if (b.somethingSelected()) return a.Pass;
    var c = b.getCursor(),
        d = b.getRange({
      line: c.line,
      ch: 0
    }, c),
        e = a.countColumn(d, null, b.getOption("tabSize"));
    return d && !/\S/.test(d) && 0 == e % b.getOption("indentUnit") ? b.indentSelection("subtract") : a.Pass;
  }, c[b[o + f + "K"] = "delLineRight"] = function (a) {
    a.operation(function () {
      for (var b = a.listSelections(), c = b.length - 1; c >= 0; c--) {
        a.replaceRange("", b[c].anchor, d(b[c].to().line), "+delete");
      }

      a.scrollIntoView();
    });
  }, c[b[o + f + "U"] = "upcaseAtCursor"] = function (a) {
    p(a, function (a) {
      return a.toUpperCase();
    });
  }, c[b[o + f + "L"] = "downcaseAtCursor"] = function (a) {
    p(a, function (a) {
      return a.toLowerCase();
    });
  }, c[b[o + f + "Space"] = "setSublimeMark"] = function (a) {
    a.state.sublimeMark && a.state.sublimeMark.clear(), a.state.sublimeMark = a.setBookmark(a.getCursor());
  }, c[b[o + f + "A"] = "selectToSublimeMark"] = function (a) {
    var b = a.state.sublimeMark && a.state.sublimeMark.find();
    b && a.setSelection(a.getCursor(), b);
  }, c[b[o + f + "W"] = "deleteToSublimeMark"] = function (b) {
    var c = b.state.sublimeMark && b.state.sublimeMark.find();

    if (c) {
      var d = b.getCursor(),
          e = c;

      if (a.cmpPos(d, e) > 0) {
        var f = e;
        e = d, d = f;
      }

      b.state.sublimeKilled = b.getRange(d, e), b.replaceRange("", d, e);
    }
  }, c[b[o + f + "X"] = "swapWithSublimeMark"] = function (a) {
    var b = a.state.sublimeMark && a.state.sublimeMark.find();
    b && (a.state.sublimeMark.clear(), a.state.sublimeMark = a.setBookmark(a.getCursor()), a.setCursor(b));
  }, c[b[o + f + "Y"] = "sublimeYank"] = function (a) {
    null != a.state.sublimeKilled && a.replaceSelection(a.state.sublimeKilled, null, "paste");
  }, b[o + f + "G"] = "clearBookmarks", c[b[o + f + "C"] = "showInCenter"] = function (a) {
    var b = a.cursorCoords(null, "local");
    a.scrollTo(null, (b.top + b.bottom) / 2 - a.getScrollInfo().clientHeight / 2);
  }, c[b["Shift-Alt-Up"] = "selectLinesUpward"] = function (a) {
    a.operation(function () {
      for (var b = a.listSelections(), c = 0; c < b.length; c++) {
        var e = b[c];
        e.head.line > a.firstLine() && a.addSelection(d(e.head.line - 1, e.head.ch));
      }
    });
  }, c[b["Shift-Alt-Down"] = "selectLinesDownward"] = function (a) {
    a.operation(function () {
      for (var b = a.listSelections(), c = 0; c < b.length; c++) {
        var e = b[c];
        e.head.line < a.lastLine() && a.addSelection(d(e.head.line + 1, e.head.ch));
      }
    });
  }, c[b[f + "F3"] = "findUnder"] = function (a) {
    r(a, !0);
  }, c[b["Shift-" + f + "F3"] = "findUnderPrevious"] = function (a) {
    r(a, !1);
  }, c[b["Alt-F3"] = "findAllUnder"] = function (a) {
    var b = q(a);

    if (b) {
      for (var c = a.getSearchCursor(b.query), d = [], e = -1; c.findNext();) {
        d.push({
          anchor: c.from(),
          head: c.to()
        }), c.from().line <= b.from.line && c.from().ch <= b.from.ch && e++;
      }

      a.setSelections(d, e);
    }
  }, b["Shift-" + f + "["] = "fold", b["Shift-" + f + "]"] = "unfold", b[o + f + "0"] = b[o + f + "j"] = "unfoldAll", b[f + "I"] = "findIncremental", b["Shift-" + f + "I"] = "findIncrementalReverse", b[f + "H"] = "replace", b.F3 = "findNext", b["Shift-F3"] = "findPrev", a.normalizeKeyMap(b);
});
},{"../lib/codemirror":"lib/codemirror/lib/codemirror.js","../addon/search/searchcursor":"addon/search/searchcursor.js","../addon/edit/matchbrackets":"addon/edit/matchbrackets.js"}],"../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "8136" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../AppData/Roaming/npm/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","codemirror/codemirror-compressed.js"], null)
//# sourceMappingURL=/codemirror-compressed.a880349b.js.map