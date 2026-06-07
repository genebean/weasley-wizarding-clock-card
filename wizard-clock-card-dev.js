var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e6, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e6;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e6 = void 0 !== s4 && 1 === s4.length;
      e6 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e6 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e6) => {
  const o6 = 1 === t4.length ? t4[0] : e6.reduce((e7, s4, o7) => e7 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e6 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e6.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e6 = "";
  for (const s4 of t5.cssRules) e6 += s4.cssText;
  return r(e6);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e6, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e6, set(s5) {
      const h3 = e6?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e6 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e6) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e6 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e6 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e6) : this.setAttribute(e6, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e6 = i5._$Eh.get(t4);
    if (void 0 !== e6 && this._$Em !== e6) {
      const t5 = i5.getPropertyOptions(e6), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e6;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e6] = r6 ?? this._$Ej?.get(e6) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e6 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e6 && (h3 = this[t4]), i5 ??= r6.getPropertyOptions(t4), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e6, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e6 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e6 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e6 || this.C(s5, void 0, i5, e6);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e6 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e6.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e6];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e6) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e6), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e7 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e7[2], strings: s4, ctor: "." === e7[1] ? I : "?" === e7[1] ? L : "@" === e7[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e6) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e6 ? s4._$Co?.[e6] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e6)), void 0 !== e6 ? (s4._$Co ??= [])[e6] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e6)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e6 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e6;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e6;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e6) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e6, this._$Cv = e6?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e6 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e6) this._$AH.p(i5);
    else {
      const t5 = new R(e6, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e6 = 0;
    for (const h3 of t4) e6 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e6], s4._$AI(h3), e6++;
    e6 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e6), i5.length = e6);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e6, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e6, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e6) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e7 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e7[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 ||= !a2(r6) || r6 !== this._$AH[n5], r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e6 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e6, h3) {
    super(t4, i5, s4, e6, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e6 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e6);
    e6 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t4, i5, s4) => {
  const e6 = s4?.renderBefore ?? i5;
  let h3 = e6._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e6._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e6, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e6);
  }) : customElements.define(t4, e6);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e6, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e6.get.call(this);
      e6.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e7) {
      return void 0 !== e7 && this.C(o6, void 0, t4, e7), e7;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e6.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e6, o6) => "object" == typeof o6 ? r4(t4, e6, o6) : ((t5, e7, o7) => {
    const r6 = e7.hasOwnProperty(o7);
    return e7.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e7, o7) : void 0;
  })(t4, e6, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/base.js
var e4 = (e6, t4, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t4 && Object.defineProperty(e6, t4, c4), c4);

// node_modules/@lit/reactive-element/decorators/query.js
function e5(e6, r6) {
  return (n5, s4, i5) => {
    const o6 = (t4) => t4.renderRoot?.querySelector(e6) ?? null;
    if (r6) {
      const { get: e7, set: r7 } = "object" == typeof s4 ? n5 : i5 ?? (() => {
        const t4 = Symbol();
        return { get() {
          return this[t4];
        }, set(e8) {
          this[t4] = e8;
        } };
      })();
      return e4(n5, s4, { get() {
        let t4 = e7.call(this);
        return void 0 === t4 && (t4 = o6(this), (null !== t4 || this.hasUpdated) && r7.call(this, t4)), t4;
      } });
    }
    return e4(n5, s4, { get() {
      return o6(this);
    } });
  };
}

// src/wizard-clock-card.ts
var VERSION = "0.9.0";
var DEBUG = false;
var WizardClockCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._radius = 0;
    // Animation state
    this._lastframe = 0;
    this._boundDrawClock = () => this._drawClock();
    // Entity IDs this card watches. Rebuilt when config changes. Only a change
    // to one of these entities justifies a redraw — HA fires hass updates for
    // every entity on the system, so we must not redraw on unrelated changes.
    this._trackedEntities = [];
    // Zone and wizard state, rebuilt on every hass update.
    this._zones = [];
    this._wizardStates = {};
    this._targetstate = [];
    this._currentstate = [];
    // Cached theme colours, read once per update so drawing functions do not
    // call getComputedStyle on every animation frame.
    // CSS custom properties cascade through shadow DOM boundaries by spec, so
    // reading from `this` (the shadow host) gives HA's theme values correctly.
    this._colours = {
      primary: "",
      primaryText: "",
      secondaryBackground: "",
      primaryBackground: ""
    };
    // Resolved config values — extracted once in setConfig() and after migration.
    this._lostState = "Lost";
    this._travellingState = "Travelling";
    this._minLocationSlots = 0;
    this._selectedFont = "Palatino Linotype, Palatino, Book Antiqua, serif";
    this._fontScale = 1.1;
    this._shaftColour = "";
    this._exclude = [];
  }
  // ── HA lifecycle ─────────────────────────────────────────────────────────────
  // Called by HA before the element is connected. Throw to show an error card.
  setConfig(rawConfig) {
    console.info(
      "%c %s %c %s",
      "color: white; background: forestgreen; font-weight: 700;",
      "wizard-clock-card-dev".toUpperCase(),
      "color: forestgreen; background: white; font-weight: 700;",
      VERSION
    );
    if (!rawConfig.wizards) throw new Error("You need to define some wizards");
    this._config = WizardClockCard.migrateConfig(rawConfig);
    this._lostState = this._config.lost ?? "Lost";
    this._travellingState = this._config.travelling ?? "Travelling";
    this._minLocationSlots = this._config.min_location_slots ?? 0;
    this._selectedFont = this._config.fontName ?? "Palatino Linotype, Palatino, Book Antiqua, serif";
    this._shaftColour = this._config.shaft_colour ?? "";
    this._exclude = [...this._config.exclude ?? []];
    this._trackedEntities = this._buildTrackedEntityList();
    if (this._config.fontface) {
      const style = document.createElement("style");
      style.innerText = `@font-face { ${this._config.fontface} }`;
      document.body.appendChild(style);
    }
  }
  // Tells HA how many 50px rows the card occupies (used by masonry layout).
  getCardSize() {
    return 6;
  }
  // Tells HA's sections layout the default and minimum grid dimensions.
  // columns: 12 spans the full section width.
  // rows: 8 at the default HA row height (~56px) gives ~448px — roughly square
  // for sections in the 400–500px wide range. The user can drag-resize freely;
  // CSS aspect-ratio keeps the clock round at any card dimensions.
  getGridOptions() {
    return {
      columns: 12,
      rows: 8,
      min_columns: 2,
      min_rows: 2
    };
  }
  // ── Lit lifecycle ─────────────────────────────────────────────────────────────
  render() {
    return b2`
      <ha-card .header=${this._config?.header}>
        <div class="clock-container">
          <canvas></canvas>
        </div>
      </ha-card>
    `;
  }
  // Runs once after the first render, when shadow DOM is populated.
  // Safe to query elements and set up observers here.
  firstUpdated() {
    const ctx = this._canvas.getContext("2d");
    if (!ctx) throw new Error(`Browser does not support ${"wizard-clock-card-dev"} canvas.`);
    this._ctx = ctx;
    this._resizeObserver = new ResizeObserver(() => {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        if (this.hass) this._updateAndDraw();
      }, 100);
    });
    this._resizeObserver.observe(this);
  }
  // Called after every reactive update (hass change, _config change).
  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("_config") || changedProps.has("layout")) {
      if (changedProps.has("_config")) {
        this._trackedEntities = this._buildTrackedEntityList();
      }
      this._updateAndDraw();
      return;
    }
    if (changedProps.has("hass")) {
      const prev = changedProps.get("hass");
      if (!prev) {
        this._updateAndDraw();
        return;
      }
      const relevant = this._trackedEntities.some(
        (id) => prev.states[id] !== this.hass.states[id]
      );
      if (relevant) this._updateAndDraw();
    }
  }
  // Clean up when the card is removed from the dashboard.
  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    if (this._lastframe) {
      cancelAnimationFrame(this._lastframe);
      this._lastframe = 0;
    }
    clearTimeout(this._resizeTimeout);
  }
  // ── Drawing ───────────────────────────────────────────────────────────────────
  // Rebuilds zone/wizard state and kicks off the animation frame.
  // Called on every relevant hass update and on resize.
  _updateAndDraw() {
    if (!this._haCard || !this._canvas || !this._ctx) return;
    const pad = 16;
    const availW = this.offsetWidth - pad;
    const availH = this.offsetHeight - pad;
    const size = availH > 50 && availH < availW ? availH : availW;
    if (size <= 0) {
      if (DEBUG) console.log(`${this._tag()}size=0, retrying after layout`);
      requestAnimationFrame(() => this._updateAndDraw());
      return;
    }
    this._canvas.width = size;
    this._canvas.height = size;
    this._canvas.style.width = `${size}px`;
    this._canvas.style.height = `${size}px`;
    this._radius = size / 2;
    this._ctx.translate(this._radius, this._radius);
    this._radius = this._radius * 0.9;
    const cs = getComputedStyle(this);
    this._colours = {
      primary: cs.getPropertyValue("--primary-color").trim(),
      primaryText: cs.getPropertyValue("--primary-text-color").trim(),
      secondaryBackground: cs.getPropertyValue("--secondary-background-color").trim(),
      primaryBackground: cs.getPropertyValue("--primary-background-color").trim()
    };
    if (!this._shaftColour) {
      this._shaftColour = this._colours.primary;
    }
    this._zones = [];
    for (const loc of this._config.locations ?? []) {
      if (!this._zones.includes(loc)) this._zones.push(loc);
    }
    this._wizardStates = {};
    for (const wizard of this._config.wizards) {
      const stateStr = this._getWizardState(wizard);
      this._wizardStates[wizard.entity] = stateStr;
      if (DEBUG) console.log(`${this._tag()}(${wizard.name}) state: ${stateStr}`);
      if (!this._zones.includes(stateStr)) {
        if (typeof stateStr !== "string")
          throw new Error(`Unable to add state for ${wizard.entity}: expected string, got ${typeof stateStr}`);
        this._zones.push(stateStr);
      }
    }
    while (this._zones.length < this._minLocationSlots) {
      this._zones.push(" ");
    }
    if (this._lastframe) {
      cancelAnimationFrame(this._lastframe);
      this._lastframe = 0;
    }
    this._lastframe = requestAnimationFrame(this._boundDrawClock);
    if (DEBUG) console.log(`${this._tag()}update complete, zones: ${this._zones.join(", ")}`);
  }
  // Single source of truth for a wizard's current state string.
  // Accepts a full WizardConfig (or a plain entity string for internal calls).
  _getWizardState(wizard) {
    const entity = typeof wizard === "string" ? wizard : wizard.entity;
    const state = this.hass.states[entity];
    if (!state) {
      console.log(`${this._tag()}Wizard ${entity} does not exist.`);
      return this._lostState;
    }
    const attrs = state.attributes;
    const stateVelo = attrs.velocity ?? attrs.speed ?? (attrs.moving ? 16 : 0);
    const proxSensor = typeof wizard === "string" ? null : wizard.proximity_sensor;
    const proxState = proxSensor ? this.hass.states[proxSensor] : void 0;
    const isMovingByProximity = proxState && ["towards", "away_from"].includes(proxState.state);
    let stateStr = "not_home";
    if (state.state && state.state !== "off" && state.state !== "unknown") {
      if (["home", "Home", "Just Arrived", "Just Left"].includes(state.state) && !this._exclude.includes(state.state)) {
        stateStr = state.state;
      } else if (attrs.message) {
        stateStr = attrs.message;
      } else if (attrs.zone) {
        stateStr = attrs.zone;
      } else {
        stateStr = state.state;
      }
    }
    if (this._exclude.includes(stateStr)) stateStr = "not_home";
    const zoneEntity = this.hass.states[`zone.${stateStr}`];
    if (zoneEntity?.attributes) {
      const friendly = zoneEntity.attributes.friendly_name;
      if (friendly) stateStr = friendly;
    }
    if (stateStr.toLowerCase() === "away" || stateStr === "not_home") {
      stateStr = stateVelo > 15 || isMovingByProximity ? this._travellingState : this._lostState;
      const locality = attrs.locality;
      if (locality && !this._exclude.includes(locality)) {
        stateStr = locality;
      }
    } else if (stateStr === "unavailable") {
      stateStr = this._lostState;
    }
    return stateStr;
  }
  _drawClock() {
    this._lastframe = 0;
    this._ctx.clearRect(
      -this._canvas.width / 2,
      -this._canvas.height / 2,
      this._canvas.width,
      this._canvas.height
    );
    this._drawFace();
    this._drawNumbers();
    this._drawTime();
    this._drawHinge();
    const needsRedraw = this._currentstate.some(
      (cur, i5) => Math.round(cur.pos * 100) !== Math.round(this._targetstate[i5]?.pos * 100)
    );
    if (needsRedraw) {
      this._lastframe = requestAnimationFrame(this._boundDrawClock);
    }
  }
  _drawFace() {
    const ctx = this._ctx;
    ctx.save();
    ctx.shadowColor = "";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.arc(0, 0, this._radius, 0, 2 * Math.PI);
    ctx.fillStyle = this._colours.secondaryBackground;
    ctx.fill();
    ctx.strokeStyle = this._colours.primaryBackground;
    ctx.lineWidth = this._radius * 0.02;
    ctx.stroke();
    ctx.restore();
  }
  _drawHinge() {
    const ctx = this._ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this._radius * 0.05, 0, 2 * Math.PI);
    ctx.fillStyle = this._shaftColour;
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore();
  }
  _drawNumbers() {
    const ctx = this._ctx;
    const r6 = this._radius;
    ctx.font = `${r6 * 0.15 * this._fontScale}px ${this._selectedFont}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = this._colours.primaryText;
    const m2 = ctx.measureText("Mg");
    const textHeight = m2.actualBoundingBoxAscent + m2.actualBoundingBoxDescent;
    for (let num = 0; num < this._zones.length; num++) {
      ctx.save();
      const ang = num * Math.PI / this._zones.length * 2;
      ctx.rotate(ang);
      let startAngle = 0;
      let inwardFacing = true;
      const kerning = 0;
      let text = this._zones[num].split("").reverse().join("");
      if (ang > Math.PI / 2 && ang < Math.PI * 2 - Math.PI / 2) {
        startAngle = Math.PI;
        inwardFacing = false;
        text = this._zones[num];
      }
      if (this._isRtlLanguage(text)) text = text.split("").reverse().join("");
      for (let j = 0; j < text.length; j++) {
        const charWid = ctx.measureText(text[j]).width;
        startAngle += (charWid + (j === text.length - 1 ? 0 : kerning)) / (r6 - textHeight) / 2;
      }
      ctx.rotate(startAngle);
      for (let j = 0; j < text.length; j++) {
        const charWid = ctx.measureText(text[j]).width;
        ctx.rotate(charWid / 2 / (r6 - textHeight) * -1);
        ctx.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - r6 + textHeight));
        ctx.rotate((charWid / 2 + kerning) / (r6 - textHeight) * -1);
      }
      ctx.restore();
    }
  }
  _drawTime() {
    this._targetstate = [];
    for (let num = 0; num < this._config.wizards.length; num++) {
      const wizard = this._config.wizards[num];
      const stateStr = this._wizardStates[wizard.entity] ?? this._lostState;
      const wizardOffset = (num - (this._config.wizards.length - 1) / 2) / this._config.wizards.length * 0.3;
      let location = wizardOffset;
      for (let locnum = 0; locnum < this._zones.length; locnum++) {
        if (this._zones[locnum].toLowerCase() === stateStr.toLowerCase()) {
          location = locnum + wizardOffset;
          break;
        }
      }
      const pos = location * Math.PI / this._zones.length * 2;
      this._targetstate.push({
        pos,
        length: this._radius * 0.7,
        width: this._radius * 0.1,
        wizard: wizard.name,
        colour: wizard.colour,
        textcolour: wizard.textcolour
      });
    }
    for (let num = 0; num < this._config.wizards.length; num++) {
      if (this._currentstate[num]) {
        this._currentstate[num].pos += (this._targetstate[num].pos - this._currentstate[num].pos) / 60;
      } else {
        this._currentstate.push({ ...this._targetstate[num], pos: 0 });
      }
    }
    for (const hand of this._currentstate) {
      this._drawHand(hand);
    }
  }
  _drawHand(hand) {
    const ctx = this._ctx;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = hand.width;
    ctx.fillStyle = hand.colour ?? this._colours.primary;
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.moveTo(0, 0);
    ctx.rotate(hand.pos);
    ctx.quadraticCurveTo(hand.width, -hand.length * 0.5, hand.width, -hand.length * 0.75);
    ctx.quadraticCurveTo(hand.width * 0.2, -hand.length * 0.8, 0, -hand.length);
    ctx.quadraticCurveTo(-hand.width * 0.2, -hand.length * 0.8, -hand.width, -hand.length * 0.75);
    ctx.quadraticCurveTo(-hand.width, -hand.length * 0.5, 0, 0);
    ctx.fill();
    ctx.font = `${hand.width * this._fontScale}px ${this._selectedFont}`;
    ctx.fillStyle = hand.textcolour ?? this._colours.primaryText;
    ctx.translate(0, -hand.length / 2);
    ctx.rotate(Math.PI / 2);
    if (hand.pos >= 0 && hand.pos < Math.PI) ctx.rotate(Math.PI);
    ctx.fillText(hand.wizard, 0, 0);
    ctx.restore();
  }
  // ── Utilities ─────────────────────────────────────────────────────────────────
  // Returns the entity IDs this card needs to watch: each wizard's entity and
  // any configured proximity sensor. Zone entities are intentionally excluded —
  // zone state (friendly_name, boundary) changes are extremely rare and will be
  // picked up on the next wizard entity update anyway.
  _buildTrackedEntityList() {
    if (!this._config?.wizards) return [];
    const ids = [];
    for (const w2 of this._config.wizards) {
      ids.push(w2.entity);
      if (w2.proximity_sensor) ids.push(w2.proximity_sensor);
    }
    return ids;
  }
  _isRtlLanguage(text) {
    return /[֐-׿؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
  }
  _tag() {
    return this._config?.header ? `(${this._config.header}) ` : "";
  }
  // Maps old/alternate property names to canonical ones before any other code
  // sees the config. Keeps all normalisation in one place.
  //
  // Canonical forms:
  //   travelling  (British English) — was: traveling
  //   fontName    (camelCase)       — was: fontname
  static migrateConfig(raw) {
    const c4 = { ...raw };
    if ("traveling" in c4 && !("travelling" in c4)) {
      c4.travelling = c4.traveling;
      delete c4.traveling;
    }
    if ("fontname" in c4 && !("fontName" in c4)) {
      c4.fontName = c4.fontname;
      delete c4.fontname;
    }
    return c4;
  }
};
// ── Styles ──────────────────────────────────────────────────────────────────
// Scoped styles apply to this shadow root only.
//
// ha-card { height: 100% } fills the CSS Grid cell in sections layout.
// In masonry, :host has no definite height so 100% resolves to auto,
// making ha-card content-size to the canvas — same as before.
// .clock-container { height: 100% } ensures ha-card's full interior is
// covered by the card background (no white gap outside ha-card).
// Canvas display size is driven by JS in _updateAndDraw().
WizardClockCard.styles = i`
    :host {
      display: block;
      /* In sections layout hui-grid-section gives the .card wrapper an explicit
         height. height: 100% here propagates that into our shadow DOM so that
         ha-card { height: 100% } can resolve to a definite value. In masonry
         the wrapper has no explicit height so this resolves to auto, which
         content-sizes to the canvas — the same as before. */
      height: 100%;
    }
    ha-card {
      height: 100%;
      overflow: hidden;
    }
    .clock-container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      box-sizing: border-box;
      overflow: hidden;
    }
    canvas {
      display: block;
      /* Start at 0 so masonry offsetHeight stays near 0 before JS runs.
         JS overrides these via canvas.style.width/height. */
      width: 0;
      height: 0;
    }
  `;
__decorateClass([
  n4({ attribute: false })
], WizardClockCard.prototype, "hass", 2);
__decorateClass([
  n4({ type: String })
], WizardClockCard.prototype, "layout", 2);
__decorateClass([
  r5()
], WizardClockCard.prototype, "_config", 2);
__decorateClass([
  e5("ha-card")
], WizardClockCard.prototype, "_haCard", 2);
__decorateClass([
  e5("canvas")
], WizardClockCard.prototype, "_canvas", 2);
WizardClockCard = __decorateClass([
  t3("wizard-clock-card-dev")
], WizardClockCard);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
