"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a3, b2) => {
  for (var prop in b2 || (b2 = {}))
    if (__hasOwnProp.call(b2, prop))
      __defNormalProp(a3, prop, b2[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b2)) {
      if (__propIsEnum.call(b2, prop))
        __defNormalProp(a3, prop, b2[prop]);
    }
  return a3;
};
var __spreadProps = (a3, b2) => __defProps(a3, __getOwnPropDescs(b2));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui.tsx
var ui_exports = {};
__export(ui_exports, {
  default: () => ui_default
});
module.exports = __toCommonJS(ui_exports);

// node_modules/preact/dist/preact.module.js
var n;
var l;
var t;
var u;
var i;
var r;
var o;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var v = [];
var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var d = Array.isArray;
function w(n2, l3) {
  for (var t3 in l3) n2[t3] = l3[t3];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l3, t3, u3) {
  var i3, r3, o3, e3 = {};
  for (o3 in t3) "key" == o3 ? i3 = t3[o3] : "ref" == o3 ? r3 = t3[o3] : e3[o3] = t3[o3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : u3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);
  return m(l3, e3, i3, r3, null);
}
function m(n2, u3, i3, r3, o3) {
  var e3 = { type: n2, props: u3, key: i3, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++t : o3, __i: -1, __u: 0 };
  return null == o3 && null != l.vnode && l.vnode(e3), e3;
}
function k(n2) {
  return n2.children;
}
function x(n2, l3) {
  this.props = n2, this.context = l3;
}
function S(n2, l3) {
  if (null == l3) return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var t3; l3 < n2.__k.length; l3++) if (null != (t3 = n2.__k[l3]) && null != t3.__e) return t3.__e;
  return "function" == typeof n2.type ? S(n2) : null;
}
function C(n2) {
  var l3, t3;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++) if (null != (t3 = n2.__k[l3]) && null != t3.__e) {
      n2.__e = n2.__c.base = t3.__e;
      break;
    }
    return C(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || r !== l.debounceRendering) && ((r = l.debounceRendering) || o)($);
}
function $() {
  for (var n2, t3, u3, r3, o3, f3, c3, s3 = 1; i.length; ) i.length > s3 && i.sort(e), n2 = i.shift(), s3 = i.length, n2.__d && (u3 = void 0, o3 = (r3 = (t3 = n2).__v).__e, f3 = [], c3 = [], t3.__P && ((u3 = w({}, r3)).__v = r3.__v + 1, l.vnode && l.vnode(u3), O(t3.__P, u3, r3, t3.__n, t3.__P.namespaceURI, 32 & r3.__u ? [o3] : null, f3, null == o3 ? S(r3) : o3, !!(32 & r3.__u), c3), u3.__v = r3.__v, u3.__.__k[u3.__i] = u3, z(f3, u3, c3), u3.__e != o3 && C(u3)));
  $.__r = 0;
}
function I(n2, l3, t3, u3, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, y3, d3, w3, g4, _3 = u3 && u3.__k || v, m3 = l3.length;
  for (f3 = P(t3, l3, _3, f3, m3), a3 = 0; a3 < m3; a3++) null != (y3 = t3.__k[a3]) && (h3 = -1 === y3.__i ? p : _3[y3.__i] || p, y3.__i = a3, g4 = O(n2, y3, h3, i3, r3, o3, e3, f3, c3, s3), d3 = y3.__e, y3.ref && h3.ref != y3.ref && (h3.ref && q(h3.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w3 && null != d3 && (w3 = d3), 4 & y3.__u || h3.__k === y3.__k ? f3 = A(y3, f3, n2) : "function" == typeof y3.type && void 0 !== g4 ? f3 = g4 : d3 && (f3 = d3.nextSibling), y3.__u &= -7);
  return t3.__e = w3, f3;
}
function P(n2, l3, t3, u3, i3) {
  var r3, o3, e3, f3, c3, s3 = t3.length, a3 = s3, h3 = 0;
  for (n2.__k = new Array(i3), r3 = 0; r3 < i3; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? (f3 = r3 + h3, (o3 = n2.__k[r3] = "string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? m(null, o3, null, null, null) : d(o3) ? m(k, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? m(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : o3).__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 !== (c3 = o3.__i = L(o3, t3, f3, a3)) && (a3--, (e3 = t3[c3]) && (e3.__u |= 2)), null == e3 || null === e3.__v ? (-1 == c3 && (i3 > s3 ? h3-- : i3 < s3 && h3++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f3 && (c3 == f3 - 1 ? h3-- : c3 == f3 + 1 ? h3++ : (c3 > f3 ? h3-- : h3++, o3.__u |= 4))) : n2.__k[r3] = null;
  if (a3) for (r3 = 0; r3 < s3; r3++) null != (e3 = t3[r3]) && 0 == (2 & e3.__u) && (e3.__e == u3 && (u3 = S(e3)), B(e3, e3));
  return u3;
}
function A(n2, l3, t3) {
  var u3, i3;
  if ("function" == typeof n2.type) {
    for (u3 = n2.__k, i3 = 0; u3 && i3 < u3.length; i3++) u3[i3] && (u3[i3].__ = n2, l3 = A(u3[i3], l3, t3));
    return l3;
  }
  n2.__e != l3 && (l3 && n2.type && !t3.contains(l3) && (l3 = S(n2)), t3.insertBefore(n2.__e, l3 || null), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function H(n2, l3) {
  return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (d(n2) ? n2.some(function(n3) {
    H(n3, l3);
  }) : l3.push(n2)), l3;
}
function L(n2, l3, t3, u3) {
  var i3, r3, o3 = n2.key, e3 = n2.type, f3 = l3[t3];
  if (null === f3 && null == n2.key || f3 && o3 == f3.key && e3 === f3.type && 0 == (2 & f3.__u)) return t3;
  if (u3 > (null != f3 && 0 == (2 & f3.__u) ? 1 : 0)) for (i3 = t3 - 1, r3 = t3 + 1; i3 >= 0 || r3 < l3.length; ) {
    if (i3 >= 0) {
      if ((f3 = l3[i3]) && 0 == (2 & f3.__u) && o3 == f3.key && e3 === f3.type) return i3;
      i3--;
    }
    if (r3 < l3.length) {
      if ((f3 = l3[r3]) && 0 == (2 & f3.__u) && o3 == f3.key && e3 === f3.type) return r3;
      r3++;
    }
  }
  return -1;
}
function T(n2, l3, t3) {
  "-" == l3[0] ? n2.setProperty(l3, null == t3 ? "" : t3) : n2[l3] = null == t3 ? "" : "number" != typeof t3 || y.test(l3) ? t3 : t3 + "px";
}
function j(n2, l3, t3, u3, i3) {
  var r3;
  n: if ("style" == l3) if ("string" == typeof t3) n2.style.cssText = t3;
  else {
    if ("string" == typeof u3 && (n2.style.cssText = u3 = ""), u3) for (l3 in u3) t3 && l3 in t3 || T(n2.style, l3, "");
    if (t3) for (l3 in t3) u3 && t3[l3] === u3[l3] || T(n2.style, l3, t3[l3]);
  }
  else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(f, "$1")), l3 = l3.toLowerCase() in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = t3, t3 ? u3 ? t3.t = u3.t : (t3.t = c, n2.addEventListener(l3, r3 ? a : s, r3)) : n2.removeEventListener(l3, r3 ? a : s, r3);
  else {
    if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
      n2[l3] = null == t3 ? "" : t3;
      break n;
    } catch (n3) {
    }
    "function" == typeof t3 || (null == t3 || false === t3 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == t3 ? "" : t3));
  }
}
function F(n2) {
  return function(t3) {
    if (this.l) {
      var u3 = this.l[t3.type + n2];
      if (null == t3.u) t3.u = c++;
      else if (t3.u < u3.t) return;
      return u3(l.event ? l.event(t3) : t3);
    }
  };
}
function O(n2, t3, u3, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, p3, v3, y3, _3, m3, b2, S2, C3, M2, $2, P4, A4, H3, L2, T4, j4 = t3.type;
  if (void 0 !== t3.constructor) return null;
  128 & u3.__u && (c3 = !!(32 & u3.__u), o3 = [f3 = t3.__e = u3.__e]), (a3 = l.__b) && a3(t3);
  n: if ("function" == typeof j4) try {
    if (b2 = t3.props, S2 = "prototype" in j4 && j4.prototype.render, C3 = (a3 = j4.contextType) && i3[a3.__c], M2 = a3 ? C3 ? C3.props.value : a3.__ : i3, u3.__c ? m3 = (h3 = t3.__c = u3.__c).__ = h3.__E : (S2 ? t3.__c = h3 = new j4(b2, M2) : (t3.__c = h3 = new x(b2, M2), h3.constructor = j4, h3.render = D), C3 && C3.sub(h3), h3.props = b2, h3.state || (h3.state = {}), h3.context = M2, h3.__n = i3, p3 = h3.__d = true, h3.__h = [], h3._sb = []), S2 && null == h3.__s && (h3.__s = h3.state), S2 && null != j4.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = w({}, h3.__s)), w(h3.__s, j4.getDerivedStateFromProps(b2, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = t3, p3) S2 && null == j4.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), S2 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
    else {
      if (S2 && null == j4.getDerivedStateFromProps && b2 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(b2, M2), !h3.__e && (null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(b2, h3.__s, M2) || t3.__v == u3.__v)) {
        for (t3.__v != u3.__v && (h3.props = b2, h3.state = h3.__s, h3.__d = false), t3.__e = u3.__e, t3.__k = u3.__k, t3.__k.some(function(n3) {
          n3 && (n3.__ = t3);
        }), $2 = 0; $2 < h3._sb.length; $2++) h3.__h.push(h3._sb[$2]);
        h3._sb = [], h3.__h.length && e3.push(h3);
        break n;
      }
      null != h3.componentWillUpdate && h3.componentWillUpdate(b2, h3.__s, M2), S2 && null != h3.componentDidUpdate && h3.__h.push(function() {
        h3.componentDidUpdate(v3, y3, _3);
      });
    }
    if (h3.context = M2, h3.props = b2, h3.__P = n2, h3.__e = false, P4 = l.__r, A4 = 0, S2) {
      for (h3.state = h3.__s, h3.__d = false, P4 && P4(t3), a3 = h3.render(h3.props, h3.state, h3.context), H3 = 0; H3 < h3._sb.length; H3++) h3.__h.push(h3._sb[H3]);
      h3._sb = [];
    } else do {
      h3.__d = false, P4 && P4(t3), a3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
    } while (h3.__d && ++A4 < 25);
    h3.state = h3.__s, null != h3.getChildContext && (i3 = w(w({}, i3), h3.getChildContext())), S2 && !p3 && null != h3.getSnapshotBeforeUpdate && (_3 = h3.getSnapshotBeforeUpdate(v3, y3)), L2 = a3, null != a3 && a3.type === k && null == a3.key && (L2 = N(a3.props.children)), f3 = I(n2, d(L2) ? L2 : [L2], t3, u3, i3, r3, o3, e3, f3, c3, s3), h3.base = t3.__e, t3.__u &= -161, h3.__h.length && e3.push(h3), m3 && (h3.__E = h3.__ = null);
  } catch (n3) {
    if (t3.__v = null, c3 || null != o3) if (n3.then) {
      for (t3.__u |= c3 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
      o3[o3.indexOf(f3)] = null, t3.__e = f3;
    } else for (T4 = o3.length; T4--; ) g(o3[T4]);
    else t3.__e = u3.__e, t3.__k = u3.__k;
    l.__e(n3, t3, u3);
  }
  else null == o3 && t3.__v == u3.__v ? (t3.__k = u3.__k, t3.__e = u3.__e) : f3 = t3.__e = V(u3.__e, t3, u3, i3, r3, o3, e3, c3, s3);
  return (a3 = l.diffed) && a3(t3), 128 & t3.__u ? void 0 : f3;
}
function z(n2, t3, u3) {
  for (var i3 = 0; i3 < u3.length; i3++) q(u3[i3], u3[++i3], u3[++i3]);
  l.__c && l.__c(t3, n2), n2.some(function(t4) {
    try {
      n2 = t4.__h, t4.__h = [], n2.some(function(n3) {
        n3.call(t4);
      });
    } catch (n3) {
      l.__e(n3, t4.__v);
    }
  });
}
function N(n2) {
  return "object" != typeof n2 || null == n2 ? n2 : d(n2) ? n2.map(N) : w({}, n2);
}
function V(t3, u3, i3, r3, o3, e3, f3, c3, s3) {
  var a3, h3, v3, y3, w3, _3, m3, b2 = i3.props, k3 = u3.props, x3 = u3.type;
  if ("svg" == x3 ? o3 = "http://www.w3.org/2000/svg" : "math" == x3 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (a3 = 0; a3 < e3.length; a3++) if ((w3 = e3[a3]) && "setAttribute" in w3 == !!x3 && (x3 ? w3.localName == x3 : 3 == w3.nodeType)) {
      t3 = w3, e3[a3] = null;
      break;
    }
  }
  if (null == t3) {
    if (null == x3) return document.createTextNode(k3);
    t3 = document.createElementNS(o3, x3, k3.is && k3), c3 && (l.__m && l.__m(u3, e3), c3 = false), e3 = null;
  }
  if (null === x3) b2 === k3 || c3 && t3.data === k3 || (t3.data = k3);
  else {
    if (e3 = e3 && n.call(t3.childNodes), b2 = i3.props || p, !c3 && null != e3) for (b2 = {}, a3 = 0; a3 < t3.attributes.length; a3++) b2[(w3 = t3.attributes[a3]).name] = w3.value;
    for (a3 in b2) if (w3 = b2[a3], "children" == a3) ;
    else if ("dangerouslySetInnerHTML" == a3) v3 = w3;
    else if (!(a3 in k3)) {
      if ("value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3) continue;
      j(t3, a3, null, w3, o3);
    }
    for (a3 in k3) w3 = k3[a3], "children" == a3 ? y3 = w3 : "dangerouslySetInnerHTML" == a3 ? h3 = w3 : "value" == a3 ? _3 = w3 : "checked" == a3 ? m3 = w3 : c3 && "function" != typeof w3 || b2[a3] === w3 || j(t3, a3, w3, b2[a3], o3);
    if (h3) c3 || v3 && (h3.__html === v3.__html || h3.__html === t3.innerHTML) || (t3.innerHTML = h3.__html), u3.__k = [];
    else if (v3 && (t3.innerHTML = ""), I("template" === u3.type ? t3.content : t3, d(y3) ? y3 : [y3], u3, i3, r3, "foreignObject" == x3 ? "http://www.w3.org/1999/xhtml" : o3, e3, f3, e3 ? e3[0] : i3.__k && S(i3, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) g(e3[a3]);
    c3 || (a3 = "value", "progress" == x3 && null == _3 ? t3.removeAttribute("value") : void 0 !== _3 && (_3 !== t3[a3] || "progress" == x3 && !_3 || "option" == x3 && _3 !== b2[a3]) && j(t3, a3, _3, b2[a3], o3), a3 = "checked", void 0 !== m3 && m3 !== t3[a3] && j(t3, a3, m3, b2[a3], o3));
  }
  return t3;
}
function q(n2, t3, u3) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == t3 || (n2.__u = n2(t3));
    } else n2.current = t3;
  } catch (n3) {
    l.__e(n3, u3);
  }
}
function B(n2, t3, u3) {
  var i3, r3;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current !== n2.__e || q(i3, null, t3)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount) try {
      i3.componentWillUnmount();
    } catch (n3) {
      l.__e(n3, t3);
    }
    i3.base = i3.__P = null;
  }
  if (i3 = n2.__k) for (r3 = 0; r3 < i3.length; r3++) i3[r3] && B(i3[r3], t3, u3 || "function" != typeof n2.type);
  u3 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function D(n2, l3, t3) {
  return this.constructor(n2, t3);
}
function E(t3, u3, i3) {
  var r3, o3, e3, f3;
  u3 == document && (u3 = document.documentElement), l.__ && l.__(t3, u3), o3 = (r3 = "function" == typeof i3) ? null : i3 && i3.__k || u3.__k, e3 = [], f3 = [], O(u3, t3 = (!r3 && i3 || u3).__k = _(k, null, [t3]), o3 || p, p, u3.namespaceURI, !r3 && i3 ? [i3] : o3 ? null : u3.firstChild ? n.call(u3.childNodes) : null, e3, !r3 && i3 ? i3 : o3 ? o3.__e : u3.firstChild, r3, f3), z(e3, t3, f3);
}
n = v.slice, l = { __e: function(n2, l3, t3, u3) {
  for (var i3, r3, o3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
    if ((r3 = i3.constructor) && null != r3.getDerivedStateFromError && (i3.setState(r3.getDerivedStateFromError(n2)), o3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, u3 || {}), o3 = i3.__d), o3) return i3.__E = i3;
  } catch (l4) {
    n2 = l4;
  }
  throw n2;
} }, t = 0, u = function(n2) {
  return null != n2 && null == n2.constructor;
}, x.prototype.setState = function(n2, l3) {
  var t3;
  t3 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, t3), this.props)), n2 && w(t3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

// node_modules/@create-figma-plugin/ui/lib/utilities/create-class-name.js
function createClassName(classNames) {
  return classNames.filter(function(className) {
    return className !== null;
  }).join(" ");
}

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
}
function d2(n2) {
  return o2 = 1, h2(D2, n2);
}
function h2(n2, u3, i3) {
  var o3 = p2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f3 = function(n3, t3, r3) {
      if (!o3.__c.__H) return true;
      var u4 = o3.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u4.every(function(n4) {
        return !n4.__N;
      })) return !c3 || c3.call(this, n3, t3, r3);
      var i4 = o3.__c.props !== n3;
      return u4.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
        }
      }), c3 && c3.call(this, n3, t3, r3) || i4;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u4 = c3;
        c3 = void 0, f3(n3, t3, r3), c3 = u4;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f3;
  }
  return o3.__N || o3.__;
}
function y2(n2, u3) {
  var i3 = p2(t2++, 3);
  !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__H.__h.push(i3));
}
function T2(n2, r3) {
  var u3 = p2(t2++, 7);
  return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
}
function q2(n2, t3) {
  return o2 = 8, T2(function() {
    return n2;
  }, t3);
}
function j2() {
  for (var n2; n2 = f2.shift(); ) if (n2.__P && n2.__H) try {
    n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
  } catch (t3) {
    n2.__H.__h = [], c2.__e(t3, n2.__v);
  }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u3 = setTimeout(r3, 100);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u3 = n2.__c;
  "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function D2(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// node_modules/preact/compat/dist/compat.module.js
function g3(n2, t3) {
  for (var e3 in t3) n2[e3] = t3[e3];
  return n2;
}
function E2(n2, t3) {
  for (var e3 in n2) if ("__source" !== e3 && !(e3 in t3)) return true;
  for (var r3 in t3) if ("__source" !== r3 && n2[r3] !== t3[r3]) return true;
  return false;
}
function N2(n2, t3) {
  this.props = n2, this.context = t3;
}
(N2.prototype = new x()).isPureReactComponent = true, N2.prototype.shouldComponentUpdate = function(n2, t3) {
  return E2(this.props, n2) || E2(this.state, t3);
};
var T3 = l.__b;
l.__b = function(n2) {
  n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T3 && T3(n2);
};
var A3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
function D3(n2) {
  function t3(t4) {
    var e3 = g3({}, t4);
    return delete e3.ref, n2(e3, t4.ref || null);
  }
  return t3.$$typeof = A3, t3.render = t3, t3.prototype.isReactComponent = t3.__f = true, t3.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t3;
}
var F3 = l.__e;
l.__e = function(n2, t3, e3, r3) {
  if (n2.then) {
    for (var u3, o3 = t3; o3 = o3.__; ) if ((u3 = o3.__c) && u3.__c) return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u3.__c(n2, t3);
  }
  F3(n2, t3, e3, r3);
};
var U = l.unmount;
function V2(n2, t3, e3) {
  return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
    "function" == typeof n3.__c && n3.__c();
  }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t3), n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
    return V2(n3, t3, e3);
  })), n2;
}
function W(n2, t3, e3) {
  return n2 && e3 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
    return W(n3, t3, e3);
  }), n2.__c && n2.__c.__P === t3 && (n2.__e && e3.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e3)), n2;
}
function P3() {
  this.__u = 0, this.o = null, this.__b = null;
}
function j3(n2) {
  var t3 = n2.__.__c;
  return t3 && t3.__a && t3.__a(n2);
}
function B3() {
  this.i = null, this.l = null;
}
l.unmount = function(n2) {
  var t3 = n2.__c;
  t3 && t3.__R && t3.__R(), t3 && 32 & n2.__u && (n2.type = null), U && U(n2);
}, (P3.prototype = new x()).__c = function(n2, t3) {
  var e3 = t3.__c, r3 = this;
  null == r3.o && (r3.o = []), r3.o.push(e3);
  var u3 = j3(r3.__v), o3 = false, i3 = function() {
    o3 || (o3 = true, e3.__R = null, u3 ? u3(c3) : c3());
  };
  e3.__R = i3;
  var c3 = function() {
    if (!--r3.__u) {
      if (r3.state.__a) {
        var n3 = r3.state.__a;
        r3.__v.__k[0] = W(n3, n3.__c.__P, n3.__c.__O);
      }
      var t4;
      for (r3.setState({ __a: r3.__b = null }); t4 = r3.o.pop(); ) t4.forceUpdate();
    }
  };
  r3.__u++ || 32 & t3.__u || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i3, i3);
}, P3.prototype.componentWillUnmount = function() {
  this.o = [];
}, P3.prototype.render = function(n2, e3) {
  if (this.__b) {
    if (this.__v.__k) {
      var r3 = document.createElement("div"), o3 = this.__v.__k[0].__c;
      this.__v.__k[0] = V2(this.__b, r3, o3.__O = o3.__P);
    }
    this.__b = null;
  }
  var i3 = e3.__a && _(k, null, n2.fallback);
  return i3 && (i3.__u &= -33), [_(k, null, e3.__a ? null : n2.children), i3];
};
var H2 = function(n2, t3, e3) {
  if (++e3[1] === e3[0] && n2.l.delete(t3), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e3 = n2.i; e3; ) {
    for (; e3.length > 3; ) e3.pop()();
    if (e3[1] < e3[0]) break;
    n2.i = e3 = e3[2];
  }
};
(B3.prototype = new x()).__a = function(n2) {
  var t3 = this, e3 = j3(t3.__v), r3 = t3.l.get(n2);
  return r3[0]++, function(u3) {
    var o3 = function() {
      t3.props.revealOrder ? (r3.push(u3), H2(t3, n2, r3)) : u3();
    };
    e3 ? e3(o3) : o3();
  };
}, B3.prototype.render = function(n2) {
  this.i = null, this.l = /* @__PURE__ */ new Map();
  var t3 = H(n2.children);
  n2.revealOrder && "b" === n2.revealOrder[0] && t3.reverse();
  for (var e3 = t3.length; e3--; ) this.l.set(t3[e3], this.i = [1, 0, this.i]);
  return n2.children;
}, B3.prototype.componentDidUpdate = B3.prototype.componentDidMount = function() {
  var n2 = this;
  this.l.forEach(function(t3, e3) {
    H2(n2, e3, t3);
  });
};
var q3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
var G2 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var J2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/;
var K2 = /[A-Z0-9]/g;
var Q = "undefined" != typeof document;
var X = function(n2) {
  return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
};
x.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
  Object.defineProperty(x.prototype, t3, { configurable: true, get: function() {
    return this["UNSAFE_" + t3];
  }, set: function(n2) {
    Object.defineProperty(this, t3, { configurable: true, writable: true, value: n2 });
  } });
});
var en = l.event;
function rn() {
}
function un() {
  return this.cancelBubble;
}
function on() {
  return this.defaultPrevented;
}
l.event = function(n2) {
  return en && (n2 = en(n2)), n2.persist = rn, n2.isPropagationStopped = un, n2.isDefaultPrevented = on, n2.nativeEvent = n2;
};
var cn;
var ln = { enumerable: false, configurable: true, get: function() {
  return this.class;
} };
var fn = l.vnode;
l.vnode = function(n2) {
  "string" == typeof n2.type && function(n3) {
    var t3 = n3.props, e3 = n3.type, u3 = {}, o3 = -1 === e3.indexOf("-");
    for (var i3 in t3) {
      var c3 = t3[i3];
      if (!("value" === i3 && "defaultValue" in t3 && null == c3 || Q && "children" === i3 && "noscript" === e3 || "class" === i3 || "className" === i3)) {
        var l3 = i3.toLowerCase();
        "defaultValue" === i3 && "value" in t3 && null == t3.value ? i3 = "value" : "download" === i3 && true === c3 ? c3 = "" : "translate" === l3 && "no" === c3 ? c3 = false : "o" === l3[0] && "n" === l3[1] ? "ondoubleclick" === l3 ? i3 = "ondblclick" : "onchange" !== l3 || "input" !== e3 && "textarea" !== e3 || X(t3.type) ? "onfocus" === l3 ? i3 = "onfocusin" : "onblur" === l3 ? i3 = "onfocusout" : J2.test(i3) && (i3 = l3) : l3 = i3 = "oninput" : o3 && G2.test(i3) ? i3 = i3.replace(K2, "-$&").toLowerCase() : null === c3 && (c3 = void 0), "oninput" === l3 && u3[i3 = l3] && (i3 = "oninputCapture"), u3[i3] = c3;
      }
    }
    "select" == e3 && u3.multiple && Array.isArray(u3.value) && (u3.value = H(t3.children).forEach(function(n4) {
      n4.props.selected = -1 != u3.value.indexOf(n4.props.value);
    })), "select" == e3 && null != u3.defaultValue && (u3.value = H(t3.children).forEach(function(n4) {
      n4.props.selected = u3.multiple ? -1 != u3.defaultValue.indexOf(n4.props.value) : u3.defaultValue == n4.props.value;
    })), t3.class && !t3.className ? (u3.class = t3.class, Object.defineProperty(u3, "className", ln)) : (t3.className && !t3.class || t3.class && t3.className) && (u3.class = u3.className = t3.className), n3.props = u3;
  }(n2), n2.$$typeof = q3, fn && fn(n2);
};
var an = l.__r;
l.__r = function(n2) {
  an && an(n2), cn = n2.__c;
};
var sn = l.diffed;
l.diffed = function(n2) {
  sn && sn(n2);
  var t3 = n2.props, e3 = n2.__e;
  null != e3 && "textarea" === n2.type && "value" in t3 && t3.value !== e3.value && (e3.value = null == t3.value ? "" : t3.value), cn = null;
};

// node_modules/@create-figma-plugin/ui/lib/utilities/create-component.js
function createComponent(fn2) {
  return D3(fn2);
}

// node_modules/@create-figma-plugin/ui/lib/utilities/no-op.js
function noop() {
}

// node_modules/@create-figma-plugin/ui/lib/components/loading-indicator/loading-indicator.js
var import_loading_indicator = __toESM(require("./loading-indicator.module.css"), 1);
var LoadingIndicator = createComponent(function(_a, ref) {
  var _b = _a, { color } = _b, rest = __objRest(_b, ["color"]);
  return _(
    "div",
    __spreadProps(__spreadValues({}, rest), { ref, class: import_loading_indicator.default.loadingIndicator }),
    _(
      "svg",
      { class: import_loading_indicator.default.svg, style: typeof color === "undefined" ? void 0 : {
        fill: `var(--figma-color-icon-${color})`
      } },
      _("path", { d: "M8 1c-1.384 0-2.738.41-3.889 1.18-1.151.769-2.048 1.862-2.578 3.141-.53 1.28-.669 2.687-.398 4.045.27 1.357.936 2.605 1.915 3.584.98.979 2.227 1.645 3.584 1.916 1.358.27 2.766.131 4.045-.399 1.279-.53 2.372-1.427 3.141-2.578C14.59 10.738 15 9.384 15 8h1c0 1.582-.47 3.129-1.348 4.445-.88 1.315-2.129 2.34-3.59 2.946-1.462.606-3.07.764-4.623.455-1.552-.308-2.977-1.07-4.096-2.19-1.119-1.118-1.88-2.543-2.19-4.095C-.154 8.009.004 6.4.61 4.939c.605-1.462 1.63-2.712 2.946-3.59C4.871.468 6.418 0 8 0z" })
    )
  );
});

// node_modules/@create-figma-plugin/ui/lib/components/button/button.js
var import_button = __toESM(require("./button.module.css"), 1);
var Button = createComponent(function(_a, ref) {
  var _b = _a, { children, danger = false, disabled = false, fullWidth = false, loading = false, onClick = noop, onKeyDown = noop, propagateEscapeKeyDown = true, secondary = false } = _b, rest = __objRest(_b, ["children", "danger", "disabled", "fullWidth", "loading", "onClick", "onKeyDown", "propagateEscapeKeyDown", "secondary"]);
  const handleKeyDown = q2(function(event) {
    onKeyDown(event);
    if (event.key === "Escape") {
      if (propagateEscapeKeyDown === false) {
        event.stopPropagation();
      }
      event.currentTarget.blur();
    }
  }, [onKeyDown, propagateEscapeKeyDown]);
  return _(
    "div",
    { class: createClassName([
      import_button.default.button,
      secondary === true ? import_button.default.secondary : import_button.default.default,
      danger === true ? import_button.default.danger : null,
      fullWidth === true ? import_button.default.fullWidth : null,
      disabled === true ? import_button.default.disabled : null,
      loading === true ? import_button.default.loading : null
    ]) },
    _(
      "button",
      __spreadProps(__spreadValues({}, rest), { ref, disabled: disabled === true, onClick: loading === true ? void 0 : onClick, onKeyDown: handleKeyDown, tabIndex: 0 }),
      _("div", { class: import_button.default.children }, children)
    ),
    loading === true ? _(
      "div",
      { class: import_button.default.loadingIndicator },
      _(LoadingIndicator, null)
    ) : null
  );
});

// node_modules/@create-figma-plugin/ui/lib/components/text/text.js
var import_text = __toESM(require("./text.module.css"), 1);
var Text = createComponent(function(_a) {
  var _b = _a, { align = "left", children, numeric = false } = _b, rest = __objRest(_b, ["align", "children", "numeric"]);
  return _("div", __spreadProps(__spreadValues({}, rest), { class: createClassName([
    import_text.default.text,
    import_text.default[align],
    numeric === true ? import_text.default.numeric : null
  ]) }), children);
});

// node_modules/@create-figma-plugin/ui/lib/layout/stack/stack.js
var import_stack = __toESM(require("./stack.module.css"), 1);
var Stack = createComponent(function(_a, ref) {
  var _b = _a, { children, space } = _b, rest = __objRest(_b, ["children", "space"]);
  return _("div", __spreadProps(__spreadValues({}, rest), { ref, class: import_stack.default[space] }), H(children).map(function(element, index) {
    return _("div", { key: index, class: import_stack.default.child }, element);
  }));
});

// node_modules/@create-figma-plugin/utilities/lib/events.js
var eventHandlers = {};
var currentId = 0;
function on2(name, handler) {
  const id = `${currentId}`;
  currentId += 1;
  eventHandlers[id] = { handler, name };
  return function() {
    delete eventHandlers[id];
  };
}
var emit = typeof window === "undefined" ? function(name, ...args) {
  figma.ui.postMessage([name, ...args]);
} : function(name, ...args) {
  window.parent.postMessage({
    pluginMessage: [name, ...args]
  }, "*");
};
function invokeEventHandler(name, args) {
  let invoked = false;
  for (const id in eventHandlers) {
    if (eventHandlers[id].name === name) {
      eventHandlers[id].handler.apply(null, args);
      invoked = true;
    }
  }
  if (invoked === false) {
    throw new Error(`No event handler with name \`${name}\``);
  }
}
if (typeof window === "undefined") {
  figma.ui.onmessage = function(args) {
    if (!Array.isArray(args)) {
      return;
    }
    const [name, ...rest] = args;
    if (typeof name !== "string") {
      return;
    }
    invokeEventHandler(name, rest);
  };
} else {
  window.onmessage = function(event) {
    if (typeof event.data.pluginMessage === "undefined") {
      return;
    }
    const args = event.data.pluginMessage;
    if (!Array.isArray(args)) {
      return;
    }
    const [name, ...rest] = event.data.pluginMessage;
    if (typeof name !== "string") {
      return;
    }
    invokeEventHandler(name, rest);
  };
}

// node_modules/@create-figma-plugin/ui/lib/layout/container/container.js
var import_container = __toESM(require("./container.module.css"), 1);
var Container = createComponent(function(_a, ref) {
  var _b = _a, { space } = _b, rest = __objRest(_b, ["space"]);
  return _("div", __spreadProps(__spreadValues({}, rest), { ref, class: import_container.default[space] }));
});

// node_modules/@create-figma-plugin/ui/lib/layout/vertical-space/vertical-space.js
var import_vertical_space = __toESM(require("./vertical-space.module.css"), 1);
var VerticalSpace = createComponent(function(_a, ref) {
  var _b = _a, { space } = _b, rest = __objRest(_b, ["space"]);
  return _("div", __spreadProps(__spreadValues({}, rest), { ref, class: import_vertical_space.default[space] }));
});

// node_modules/@create-figma-plugin/ui/lib/utilities/render.js
var import_base = require("!../css/base.css");
function render(Plugin) {
  return function(rootNode, props) {
    E(_(Plugin, __spreadValues({}, props)), rootNode);
  };
}

// src/components/ComponentInfo.tsx
function ComponentInfo({
  name = "Select a component",
  type = "",
  description = "No component selected",
  hasDescription = false
}) {
  return /* @__PURE__ */ _("div", { class: "component-info" }, /* @__PURE__ */ _(Stack, { space: "small" }, /* @__PURE__ */ _(Text, null, /* @__PURE__ */ _("strong", null, name)), type && /* @__PURE__ */ _(Text, null, /* @__PURE__ */ _("small", null, type)), /* @__PURE__ */ _(VerticalSpace, { space: "small" }), /* @__PURE__ */ _(Text, null, hasDescription ? description : /* @__PURE__ */ _("em", null, "No description"))));
}

// src/components/SynonymGroups.tsx
function SynonymGroups({
  groups = [],
  loading = false
}) {
  const [selectedSynonyms, setSelectedSynonyms] = d2(/* @__PURE__ */ new Set());
  const toggleSynonym = (synonym) => {
    const newSelected = new Set(selectedSynonyms);
    if (newSelected.has(synonym)) {
      newSelected.delete(synonym);
    } else {
      newSelected.add(synonym);
    }
    setSelectedSynonyms(newSelected);
  };
  const handleApply = () => {
    emit("UPDATE_DESCRIPTION", Array.from(selectedSynonyms));
  };
  if (loading) {
    return /* @__PURE__ */ _("div", { class: "loading" }, /* @__PURE__ */ _(Text, null, "Generating synonyms..."));
  }
  if (groups.length === 0) {
    return null;
  }
  return /* @__PURE__ */ _(Stack, { space: "medium" }, /* @__PURE__ */ _(Text, null, /* @__PURE__ */ _("strong", null, "Generated Synonyms")), /* @__PURE__ */ _(Text, null, "Click on synonyms to select/deselect them"), groups.map((group) => /* @__PURE__ */ _("div", { class: "synonyms-group", key: group.title }, /* @__PURE__ */ _(Text, null, /* @__PURE__ */ _("strong", null, group.title)), /* @__PURE__ */ _(VerticalSpace, { space: "small" }), /* @__PURE__ */ _("div", { class: "synonyms-list" }, group.synonyms.map((synonym) => /* @__PURE__ */ _(
    "div",
    {
      key: synonym,
      class: `synonym-tag ${selectedSynonyms.has(synonym) ? "selected" : ""}`,
      onClick: () => toggleSynonym(synonym)
    },
    /* @__PURE__ */ _(Text, null, synonym)
  ))))), /* @__PURE__ */ _(VerticalSpace, { space: "medium" }), /* @__PURE__ */ _(
    Button,
    {
      fullWidth: true,
      onClick: handleApply,
      disabled: selectedSynonyms.size === 0
    },
    "Apply to Description"
  ));
}

// src/components/App.tsx
function App() {
  const [componentInfo, setComponentInfo] = d2({
    name: "Select a component",
    type: "",
    description: "No component selected",
    hasDescription: false
  });
  const [synonymGroups, setSynonymGroups] = d2([]);
  const [loading, setLoading] = d2(false);
  const [error, setError] = d2(null);
  y2(() => {
    const handlers = [
      {
        name: "SELECTION_CHANGE",
        handler: (message) => {
          if (message.type === "SELECTION_CHANGE") {
            setComponentInfo(message.component);
            setSynonymGroups([]);
            setError(null);
          }
        }
      },
      {
        name: "SYNONYMS_GENERATED",
        handler: (message) => {
          if (message.type === "SYNONYMS_GENERATED") {
            setSynonymGroups(message.groups);
            setLoading(false);
            setError(null);
          }
        }
      },
      {
        name: "GENERATE_ERROR",
        handler: (message) => {
          if (message.type === "GENERATE_ERROR") {
            setError(message.error);
            setLoading(false);
          }
        }
      }
    ];
    handlers.forEach(({ name, handler }) => {
      on2(name, handler);
    });
    return () => {
      handlers.forEach(({ name, handler }) => {
      });
    };
  }, []);
  const handleGenerate = () => {
    setLoading(true);
    setError(null);
    emit("GENERATE_SYNONYMS");
  };
  return /* @__PURE__ */ _(Container, { space: "medium" }, /* @__PURE__ */ _(VerticalSpace, { space: "large" }), /* @__PURE__ */ _(ComponentInfo, __spreadValues({}, componentInfo)), /* @__PURE__ */ _(VerticalSpace, { space: "medium" }), /* @__PURE__ */ _(
    Button,
    {
      fullWidth: true,
      onClick: handleGenerate,
      disabled: loading || !componentInfo.name || componentInfo.name === "Select a component"
    },
    loading ? "Generating..." : "Generate Synonyms"
  ), error && /* @__PURE__ */ _(k, null, /* @__PURE__ */ _(VerticalSpace, { space: "small" }), /* @__PURE__ */ _(Text, { style: { color: "var(--figma-color-text-danger)" } }, error)), /* @__PURE__ */ _(VerticalSpace, { space: "medium" }), /* @__PURE__ */ _(
    SynonymGroups,
    {
      groups: synonymGroups,
      loading
    }
  ), /* @__PURE__ */ _(VerticalSpace, { space: "medium" }));
}

// src/ui.tsx
var ui_default = render(App);
//# sourceMappingURL=ui.js.map
