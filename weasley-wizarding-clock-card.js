var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t, e, s, o, n, r, i, S, c;
var init_css_tag = __esm({
  "node_modules/@lit/reactive-element/css-tag.js"() {
    t = globalThis;
    e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
    s = /* @__PURE__ */ Symbol();
    o = /* @__PURE__ */ new WeakMap();
    n = class {
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
    r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
    i = (t4, ...e6) => {
      const o6 = 1 === t4.length ? t4[0] : e6.reduce((e7, s4, o7) => e7 + ((t5) => {
        if (true === t5._$cssResult$) return t5.cssText;
        if ("number" == typeof t5) return t5;
        throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
      })(s4) + t4[o7 + 1], t4[0]);
      return new n(o6, t4, s);
    };
    S = (s4, o6) => {
      if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
      else for (const e6 of o6) {
        const o7 = document.createElement("style"), n5 = t.litNonce;
        void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e6.cssText, s4.appendChild(o7);
      }
    };
    c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
      let e6 = "";
      for (const s4 of t5.cssRules) e6 += s4.cssText;
      return r(e6);
    })(t4) : t4;
  }
});

// node_modules/@lit/reactive-element/reactive-element.js
var i2, e2, h, r2, o2, n2, a, c2, l, p, d, u, f, b, y;
var init_reactive_element = __esm({
  "node_modules/@lit/reactive-element/reactive-element.js"() {
    init_css_tag();
    init_css_tag();
    ({ is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object);
    a = globalThis;
    c2 = a.trustedTypes;
    l = c2 ? c2.emptyScript : "";
    p = a.reactiveElementPolyfillSupport;
    d = (t4, s4) => t4;
    u = { toAttribute(t4, s4) {
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
    f = (t4, s4) => !i2(t4, s4);
    b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
    Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
    y = class extends HTMLElement {
      static addInitializer(t4) {
        this._$Ei(), (this.l ??= []).push(t4);
      }
      static get observedAttributes() {
        return this.finalize(), this._$Eh && [...this._$Eh.keys()];
      }
      static createProperty(t4, s4 = b) {
        if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
          const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
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
  }
});

// node_modules/lit-html/lit-html.js
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
function M(t4, i5, s4 = t4, e6) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e6 ? s4._$Co?.[e6] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e6)), void 0 !== e6 ? (s4._$Co ??= [])[e6] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e6)), i5;
}
var t2, i3, s2, e3, h2, o3, n3, r3, l2, c3, a2, u2, d2, f2, v, _, m, p2, g, $, y2, x, b2, w, T, E, A, C, P, N, S2, R, k, H, I, L, z, Z, B, D;
var init_lit_html = __esm({
  "node_modules/lit-html/lit-html.js"() {
    t2 = globalThis;
    i3 = (t4) => t4;
    s2 = t2.trustedTypes;
    e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
    h2 = "$lit$";
    o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
    n3 = "?" + o3;
    r3 = `<${n3}>`;
    l2 = document;
    c3 = () => l2.createComment("");
    a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
    u2 = Array.isArray;
    d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
    f2 = "[ 	\n\f\r]";
    v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
    _ = /-->/g;
    m = />/g;
    p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^
\f\r"'\`<>=]|("|')|))|$)`, "g");
    g = /'/g;
    $ = /"/g;
    y2 = /^(?:script|style|textarea|title)$/i;
    x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
    b2 = x(1);
    w = x(2);
    T = x(3);
    E = /* @__PURE__ */ Symbol.for("lit-noChange");
    A = /* @__PURE__ */ Symbol.for("lit-nothing");
    C = /* @__PURE__ */ new WeakMap();
    P = l2.createTreeWalker(l2, 129);
    N = (t4, i5) => {
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
    S2 = class _S {
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
    R = class {
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
    k = class _k {
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
    H = class {
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
    I = class extends H {
      constructor() {
        super(...arguments), this.type = 3;
      }
      j(t4) {
        this.element[this.name] = t4 === A ? void 0 : t4;
      }
    };
    L = class extends H {
      constructor() {
        super(...arguments), this.type = 4;
      }
      j(t4) {
        this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
      }
    };
    z = class extends H {
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
    Z = class {
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
    B = t2.litHtmlPolyfillSupport;
    B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
    D = (t4, i5, s4) => {
      const e6 = s4?.renderBefore ?? i5;
      let h3 = e6._$litPart$;
      if (void 0 === h3) {
        const t5 = s4?.renderBefore ?? null;
        e6._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
      }
      return h3._$AI(t4), h3;
    };
  }
});

// node_modules/lit-element/lit-element.js
var s3, i4, o4;
var init_lit_element = __esm({
  "node_modules/lit-element/lit-element.js"() {
    init_reactive_element();
    init_reactive_element();
    init_lit_html();
    init_lit_html();
    s3 = globalThis;
    i4 = class extends y {
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
    o4 = s3.litElementPolyfillSupport;
    o4?.({ LitElement: i4 });
    (s3.litElementVersions ??= []).push("4.2.2");
  }
});

// node_modules/lit-html/is-server.js
var init_is_server = __esm({
  "node_modules/lit-html/is-server.js"() {
  }
});

// node_modules/lit/index.js
var init_lit = __esm({
  "node_modules/lit/index.js"() {
    init_reactive_element();
    init_lit_html();
    init_lit_element();
    init_is_server();
  }
});

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3;
var init_custom_element = __esm({
  "node_modules/@lit/reactive-element/decorators/custom-element.js"() {
    t3 = (t4) => (e6, o6) => {
      void 0 !== o6 ? o6.addInitializer(() => {
        customElements.define(t4, e6);
      }) : customElements.define(t4, e6);
    };
  }
});

// node_modules/@lit/reactive-element/decorators/property.js
function n4(t4) {
  return (e6, o6) => "object" == typeof o6 ? r4(t4, e6, o6) : ((t5, e7, o7) => {
    const r6 = e7.hasOwnProperty(o7);
    return e7.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e7, o7) : void 0;
  })(t4, e6, o6);
}
var o5, r4;
var init_property = __esm({
  "node_modules/@lit/reactive-element/decorators/property.js"() {
    init_reactive_element();
    o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
    r4 = (t4 = o5, e6, r6) => {
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
  }
});

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}
var init_state = __esm({
  "node_modules/@lit/reactive-element/decorators/state.js"() {
    init_property();
  }
});

// node_modules/@lit/reactive-element/decorators/event-options.js
var init_event_options = __esm({
  "node_modules/@lit/reactive-element/decorators/event-options.js"() {
  }
});

// node_modules/@lit/reactive-element/decorators/base.js
var e4;
var init_base = __esm({
  "node_modules/@lit/reactive-element/decorators/base.js"() {
    e4 = (e6, t4, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t4 && Object.defineProperty(e6, t4, c4), c4);
  }
});

// node_modules/@lit/reactive-element/decorators/query.js
function e5(e6, r6) {
  return (n5, s4, i5) => {
    const o6 = (t4) => t4.renderRoot?.querySelector(e6) ?? null;
    if (r6) {
      const { get: e7, set: r7 } = "object" == typeof s4 ? n5 : i5 ?? /* @__PURE__ */ (() => {
        const t4 = /* @__PURE__ */ Symbol();
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
var init_query = __esm({
  "node_modules/@lit/reactive-element/decorators/query.js"() {
    init_base();
  }
});

// node_modules/@lit/reactive-element/decorators/query-all.js
var init_query_all = __esm({
  "node_modules/@lit/reactive-element/decorators/query-all.js"() {
    init_base();
  }
});

// node_modules/@lit/reactive-element/decorators/query-async.js
var init_query_async = __esm({
  "node_modules/@lit/reactive-element/decorators/query-async.js"() {
    init_base();
  }
});

// node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
var init_query_assigned_elements = __esm({
  "node_modules/@lit/reactive-element/decorators/query-assigned-elements.js"() {
    init_base();
  }
});

// node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js
var init_query_assigned_nodes = __esm({
  "node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js"() {
    init_base();
  }
});

// node_modules/lit/decorators.js
var init_decorators = __esm({
  "node_modules/lit/decorators.js"() {
    init_custom_element();
    init_property();
    init_state();
    init_event_options();
    init_query();
    init_query_all();
    init_query_async();
    init_query_assigned_elements();
    init_query_assigned_nodes();
  }
});

// src/weasley-wizarding-clock-card-editor.ts
var weasley_wizarding_clock_card_editor_exports = {};
function loadHaComponents() {
  if (!customElements.get("ha-form") || !customElements.get("hui-card-features-editor")) {
    customElements.get("hui-tile-card")?.getConfigElement();
  }
  if (!customElements.get("ha-entity-picker")) {
    customElements.get("hui-entities-card")?.getConfigElement();
  }
}
var WIZARD_SCHEMA, WIZARD_LABELS, WIZARD_HELPERS, ZONE_ENTITY_SELECTOR, ADVANCED_SCHEMA, ADVANCED_LABELS, ADVANCED_HELPERS, WizardClockCardEditor;
var init_weasley_wizarding_clock_card_editor = __esm({
  "src/weasley-wizarding-clock-card-editor.ts"() {
    "use strict";
    init_lit();
    init_decorators();
    WIZARD_SCHEMA = [
      { name: "entity", selector: { entity: { filter: { domain: ["person", "device_tracker", "calendar"] } } } },
      { name: "name", selector: { text: {} } },
      { name: "colour", selector: { ui_color: {} } },
      { name: "textcolour", selector: { ui_color: {} } },
      { name: "proximity_sensor", selector: { entity: { filter: { integration: "proximity" } } } }
    ];
    WIZARD_LABELS = {
      entity: "Entity",
      name: "Display name",
      colour: "Hand colour",
      textcolour: "Name colour",
      proximity_sensor: "Proximity sensor"
    };
    WIZARD_HELPERS = {
      name: "Short name shown on the clock hand",
      proximity_sensor: "Optional \u2014 direction-of-travel sensor from the Proximity integration"
    };
    ZONE_ENTITY_SELECTOR = {
      entity: { filter: { domain: "zone" } }
    };
    ADVANCED_SCHEMA = [
      { name: "header", selector: { text: {} } },
      { name: "lost", selector: { text: {} } },
      { name: "travelling", selector: { text: {} } },
      { name: "min_location_slots", selector: { number: { min: 1, max: 20, mode: "box" } } },
      { name: "face_colour", selector: { ui_color: {} } },
      { name: "location_colour", selector: { ui_color: {} } },
      { name: "border_colour", selector: { ui_color: {} } },
      { name: "shaft_colour", selector: { ui_color: {} } },
      { name: "fontName", selector: { text: {} } },
      { name: "fontface", selector: { text: { multiline: true } } }
    ];
    ADVANCED_LABELS = {
      _advanced: "Advanced",
      header: "Card header",
      lost: 'Label for "Lost"',
      travelling: 'Label for "Travelling"',
      min_location_slots: "Minimum location slots",
      face_colour: "Clock face colour",
      location_colour: "Location text colour",
      border_colour: "Border colour",
      shaft_colour: "Shaft colour",
      fontName: "Font name",
      fontface: "@font-face CSS"
    };
    ADVANCED_HELPERS = {
      fontName: 'CSS font-family value, e.g. "Harry P"',
      fontface: "Expert use only \u2014 raw @font-face CSS block"
    };
    WizardClockCardEditor = class extends i4 {
      constructor() {
        super(...arguments);
        this._wizardsExpanded = true;
        // ── computeLabel / computeHelper (class-property arrow fns avoid rebind) ────
        this._computeWizardLabel = (schema) => WIZARD_LABELS[schema.name] ?? schema.name;
        this._computeWizardHelper = (schema) => WIZARD_HELPERS[schema.name] ?? "";
        this._computeAdvancedLabel = (schema) => ADVANCED_LABELS[schema.name] ?? schema.name;
        this._computeAdvancedHelper = (schema) => ADVANCED_HELPERS[schema.name] ?? "";
      }
      connectedCallback() {
        super.connectedCallback();
        loadHaComponents();
      }
      setConfig(config) {
        this._config = config;
      }
      _fire(config) {
        this.dispatchEvent(new CustomEvent("config-changed", {
          bubbles: true,
          composed: true,
          detail: { config }
        }));
      }
      // ── Proximity validation ─────────────────────────────────────────────────────
      _isDirectionOfTravelSensor(entityId) {
        const s4 = this.hass?.states[entityId];
        if (!s4) return true;
        const attrs = s4.attributes;
        const options = attrs.options;
        return attrs.device_class === "enum" && Array.isArray(options) && options.includes("towards") && options.includes("away_from");
      }
      // ── Wizard helpers ───────────────────────────────────────────────────────────
      _addWizard() {
        const wizards = [...this._config?.wizards ?? [], { entity: "", name: "" }];
        this._fire({ ...this._config, wizards });
      }
      _removeWizard(i5) {
        const wizards = (this._config?.wizards ?? []).filter((_2, idx) => idx !== i5);
        this._fire({ ...this._config, wizards });
      }
      _wizardFormChanged(i5, data) {
        const prev = this._config?.wizards[i5];
        let name = data.name ?? "";
        if (data.entity !== prev?.entity && data.entity) {
          const attrs = this.hass?.states[data.entity]?.attributes;
          name = attrs?.friendly_name ?? "";
        }
        const w2 = { entity: data.entity ?? "", name };
        if (data.colour) w2.colour = data.colour;
        if (data.textcolour) w2.textcolour = data.textcolour;
        if (data.proximity_sensor) w2.proximity_sensor = data.proximity_sensor;
        const wizards = [...this._config?.wizards ?? []];
        wizards[i5] = w2;
        this._fire({ ...this._config, wizards });
      }
      // ── Location helpers ─────────────────────────────────────────────────────────
      _addLocationFromZone(e6) {
        const entityId = e6.detail.value;
        if (!entityId) return;
        const attrs = this.hass?.states[entityId]?.attributes;
        const name = attrs?.friendly_name ?? entityId.replace(/^zone\./, "").replace(/_/g, " ");
        const locations = [...this._config?.locations ?? []];
        if (!locations.includes(name)) {
          locations.push(name);
          this._fire({ ...this._config, locations });
        }
        this.requestUpdate();
      }
      _removeLocation(i5) {
        const locations = (this._config?.locations ?? []).filter((_2, idx) => idx !== i5);
        const cfg = { ...this._config };
        if (locations.length === 0) delete cfg.locations;
        else cfg.locations = locations;
        this._fire(cfg);
      }
      // ── Migration banner handlers ────────────────────────────────────────────────
      // Shaft colour default changed to #1a1a1a. These handlers let the user lock in
      // their preference so the banner only appears until they decide.
      _migrateShaftToTheme() {
        const primary = getComputedStyle(this).getPropertyValue("--primary-color").trim();
        this._fire({ ...this._config, shaft_colour: primary || "#6750A4" });
      }
      _migrateShaftToDark() {
        this._fire({ ...this._config, shaft_colour: "#1a1a1a" });
      }
      // ── Advanced helper ──────────────────────────────────────────────────────────
      _advancedChanged(e6) {
        const data = e6.detail.value;
        const cfg = { ...this._config, ...data };
        for (const k2 of [
          "header",
          "lost",
          "travelling",
          "shaft_colour",
          "face_colour",
          "location_colour",
          "border_colour",
          "fontName",
          "fontface"
        ]) {
          if (!cfg[k2]) delete cfg[k2];
        }
        if (cfg.min_location_slots == null) delete cfg.min_location_slots;
        this._fire(cfg);
      }
      // ── Render helpers ───────────────────────────────────────────────────────────
      _renderWizard(w2, i5) {
        const proxOk = !w2.proximity_sensor || this._isDirectionOfTravelSensor(w2.proximity_sensor);
        const wizardData = {
          entity: w2.entity || null,
          name: w2.name,
          colour: w2.colour ?? null,
          textcolour: w2.textcolour ?? null,
          proximity_sensor: w2.proximity_sensor || null
        };
        return b2`
      <ha-expansion-panel outlined
        @expanded-changed=${(e6) => e6.stopPropagation()}
      >
        <span slot="header">${w2.name || w2.entity || `Wizard ${i5 + 1}`}</span>
        <ha-icon-button
          slot="icons"
          .label=${"Remove wizard"}
          @click=${(e6) => {
          e6.preventDefault();
          this._removeWizard(i5);
        }}
        >
          <ha-icon icon="mdi:delete"></ha-icon>
        </ha-icon-button>
        <div class="content">
          <ha-form
            .hass=${this.hass}
            .data=${wizardData}
            .schema=${WIZARD_SCHEMA}
            .computeLabel=${this._computeWizardLabel}
            .computeHelper=${this._computeWizardHelper}
            @value-changed=${(e6) => this._wizardFormChanged(i5, e6.detail.value)}
          ></ha-form>
          ${!proxOk ? b2`
            <ha-alert alert-type="warning">
              This entity doesn't look like a direction-of-travel sensor.
              Expected <code>device_class: enum</code> with
              <code>towards</code> and <code>away_from</code> options.
            </ha-alert>
          ` : A}
        </div>
      </ha-expansion-panel>
    `;
      }
      render() {
        if (!this._config) return A;
        const locations = this._config.locations ?? [];
        const advancedData = {
          header: this._config.header,
          lost: this._config.lost,
          travelling: this._config.travelling,
          min_location_slots: this._config.min_location_slots ?? null,
          face_colour: this._config.face_colour ?? null,
          location_colour: this._config.location_colour ?? null,
          border_colour: this._config.border_colour ?? null,
          shaft_colour: this._config.shaft_colour ?? null,
          fontName: this._config.fontName,
          fontface: this._config.fontface
        };
        return b2`
      <div class="card-config">

        <!-- ── Migration banner: shaft_colour default changed ── -->
        ${!this._config.shaft_colour ? b2`
          <ha-alert alert-type="info" title="Default hand colour changed">
            Hand and hinge colour now defaults to dark (<code>#1a1a1a</code>),
            matching the classic clock look. Previously it used your theme's
            primary colour. Choose how to proceed:
            <div class="migration-actions">
              <ha-button @click=${this._migrateShaftToTheme}>
                Restore theme colour
              </ha-button>
              <ha-button @click=${this._migrateShaftToDark}>
                Keep dark default
              </ha-button>
            </div>
          </ha-alert>
        ` : A}

        <!-- ── Wizards ── -->
        <ha-expansion-panel outlined
          .expanded=${this._wizardsExpanded}
          @expanded-changed=${(e6) => {
          this._wizardsExpanded = e6.detail.expanded;
        }}
        >
          <ha-icon slot="leading-icon" icon="mdi:account-group"></ha-icon>
          <h3 slot="header">Wizards</h3>
          <div class="content">
            <div class="wizards-list">
              ${(this._config.wizards ?? []).map((w2, i5) => this._renderWizard(w2, i5))}
            </div>
            <ha-button @click=${this._addWizard}>Add wizard</ha-button>
          </div>
        </ha-expansion-panel>

        <!-- ── Locations ── -->
        <ha-expansion-panel outlined>
          <ha-icon slot="leading-icon" icon="mdi:map-marker-multiple"></ha-icon>
          <h3 slot="header">Locations</h3>
          <div class="content">
            <p class="hint" style="margin: 0 0 8px;">
              Select zones to display on the clock face.
              The zone's name becomes the location label.
            </p>
            ${locations.length > 0 ? b2`
              <div class="location-list">
                ${locations.map((loc, i5) => b2`
                  <div class="location-chip">
                    <span>${loc}</span>
                    <ha-icon-button
                      .label=${"Remove"}
                      @click=${() => this._removeLocation(i5)}
                    >
                      <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                  </div>
                `)}
              </div>
            ` : A}
            <ha-selector
              .hass=${this.hass}
              .selector=${ZONE_ENTITY_SELECTOR}
              .value=${null}
              placeholder="Add location from zone…"
              @value-changed=${this._addLocationFromZone}
            ></ha-selector>
          </div>
        </ha-expansion-panel>

        <!-- ── Advanced — ha-expansion-panel pattern from lovelace-mushroom ── -->
        <ha-expansion-panel outlined>
          <ha-icon slot="leading-icon" icon="mdi:cog"></ha-icon>
          <h3 slot="header">Advanced</h3>
          <div class="content">
            <ha-form
              .hass=${this.hass}
              .data=${advancedData}
              .schema=${ADVANCED_SCHEMA}
              .computeLabel=${this._computeAdvancedLabel}
              .computeHelper=${this._computeAdvancedHelper}
              @value-changed=${this._advancedChanged}
            ></ha-form>
          </div>
        </ha-expansion-panel>

      </div>
    `;
      }
    };
    WizardClockCardEditor.styles = i`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .hint {
      margin: 0;
      font-size: var(--ha-font-size-s, 0.875rem);
      color: var(--secondary-text-color);
    }

    .wizards-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    ha-alert {
      display: block;
      margin-top: 8px;
    }

    .migration-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .location-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .location-chip {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px 4px 4px 12px;
      background: var(--secondary-background-color);
      border-radius: 16px;
      font-size: var(--ha-font-size-s, 0.875rem);
    }

    .location-chip ha-icon-button {
      --mdc-icon-button-size: 28px;
      --mdc-icon-size: 16px;
    }

    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: 6px;
      --ha-card-border-radius: 6px;
    }

    ha-expansion-panel .content {
      padding: 12px;
    }

    ha-expansion-panel > *[slot='header'] {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
    }

    ha-expansion-panel ha-icon {
      color: var(--secondary-text-color);
    }
  `;
    __decorateClass([
      n4({ attribute: false })
    ], WizardClockCardEditor.prototype, "hass", 2);
    __decorateClass([
      r5()
    ], WizardClockCardEditor.prototype, "_config", 2);
    __decorateClass([
      r5()
    ], WizardClockCardEditor.prototype, "_wizardsExpanded", 2);
    WizardClockCardEditor = __decorateClass([
      t3(`${"weasley-wizarding-clock-card"}-editor`)
    ], WizardClockCardEditor);
  }
});

// src/weasley-wizarding-clock-card.ts
init_lit();
init_decorators();
var VERSION = "0.11.1";
var DEBUG = false;
var FONT_SCALE = 1.1;
var _injectedFontFaces = /* @__PURE__ */ new Set();
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
      primaryText: ""
    };
    // Resolved config values — extracted once in setConfig() and after migration.
    this._lostState = "Lost";
    this._travellingState = "Travelling";
    this._minLocationSlots = 0;
    this._selectedFont = "Palatino Linotype, Palatino, Book Antiqua, serif";
    this._shaftColour = "";
    this._faceColour = "";
    this._locationColour = "";
    this._borderColour = "";
    this._exclude = [];
    // Text metrics cache — rebuilt in _updateAndDraw() when zones or radius change.
    // Avoids measureText() calls on every animation frame in _drawNumbers().
    this._charWidthCache = /* @__PURE__ */ new Map();
    this._labelFontSize = 0;
    // Inward offset from r to the label text anchor (centre of glyph row).
    // = ascent (scales with font) + fixed border clearance (r × 0.06).
    // Used for both the text y-position and the arc-radius in _drawNumbers().
    this._labelOffset = 0;
  }
  // ── HA lifecycle ─────────────────────────────────────────────────────────────
  // Called by HA before the element is connected. Throw to show an error card.
  setConfig(rawConfig) {
    console.info(
      "%c %s %c %s",
      "color: white; background: forestgreen; font-weight: 700;",
      "weasley-wizarding-clock-card".toUpperCase(),
      "color: forestgreen; background: white; font-weight: 700;",
      VERSION
    );
    if (!rawConfig.wizards) throw new Error("You need to define some wizards");
    this._config = WizardClockCard.migrateConfig(rawConfig);
    this._lostState = this._config.lost ?? "Lost";
    this._travellingState = this._config.travelling ?? "Travelling";
    this._minLocationSlots = this._config.min_location_slots ?? 0;
    this._selectedFont = this._config.fontName ?? "Palatino Linotype, Palatino, Book Antiqua, serif";
    this._exclude = [...this._config.exclude ?? []];
    this._trackedEntities = this._buildTrackedEntityList();
    if (this._config.fontface && !_injectedFontFaces.has(this._config.fontface)) {
      _injectedFontFaces.add(this._config.fontface);
      const style = document.createElement("style");
      style.textContent = `@font-face { ${this._config.fontface} }`;
      document.body.appendChild(style);
    }
  }
  // Returns the editor element HA shows in the card editor dialog.
  // Dynamic import keeps editor code out of the critical render path —
  // it is only parsed when someone actually opens the card editor.
  static async getConfigElement() {
    await Promise.resolve().then(() => (init_weasley_wizarding_clock_card_editor(), weasley_wizarding_clock_card_editor_exports));
    return document.createElement(`${"weasley-wizarding-clock-card"}-editor`);
  }
  // Minimal valid config shown in the "Add Card" dialog preview.
  // HA always provides hass when calling this for custom cards.
  static getStubConfig(hass) {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("person.")) ?? "";
    const name = entity ? hass.states[entity].attributes.friendly_name ?? "Wizard" : "Wizard";
    return { wizards: [{ entity, name }] };
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
      rows: 7,
      min_columns: 2,
      min_rows: 2,
      max_rows: 8
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
    if (!ctx) throw new Error(`Browser does not support ${"weasley-wizarding-clock-card"} canvas.`);
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
  // Converts a ui_color value (hex string, CSS colour name, or HA colour token)
  // to a string canvas fillStyle/strokeStyle can consume.
  _resolveColour(token, cs, fallback) {
    if (!token) return fallback;
    if (token.startsWith("#") || /^rgba?|^hsla?/.test(token)) return token;
    const cssVar = WizardClockCard._COLOR_TOKENS[token];
    if (cssVar) return cs.getPropertyValue(cssVar).trim() || fallback;
    return token;
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
      primaryText: cs.getPropertyValue("--primary-text-color").trim()
    };
    const rc = (v2, def) => this._resolveColour(v2 ?? "", cs, def);
    this._faceColour = rc(this._config.face_colour, "#EDE0C4");
    this._locationColour = rc(this._config.location_colour, "#1a1a1a");
    this._borderColour = rc(this._config.border_colour, "#1a1a1a");
    this._shaftColour = rc(this._config.shaft_colour, "#1a1a1a");
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
    this._targetstate = this._buildTargetState(cs);
    for (let i5 = 0; i5 < this._targetstate.length; i5++) {
      if (this._currentstate[i5]) {
        const t4 = this._targetstate[i5];
        this._currentstate[i5].length = t4.length;
        this._currentstate[i5].width = t4.width;
        this._currentstate[i5].wizard = t4.wizard;
        this._currentstate[i5].colour = t4.colour;
        this._currentstate[i5].textcolour = t4.textcolour;
      }
    }
    this._ctx.save();
    const nominalSize = this._radius * 0.15 * FONT_SCALE;
    this._ctx.font = `${nominalSize}px ${this._selectedFont}`;
    const m2 = this._ctx.measureText("Mg");
    const nominalAscent = m2.actualBoundingBoxAscent;
    this._charWidthCache.clear();
    for (const zone of this._zones) {
      for (const char of zone) {
        if (!this._charWidthCache.has(char)) {
          this._charWidthCache.set(char, this._ctx.measureText(char).width);
        }
      }
    }
    const nominalOffset = nominalAscent + this._radius * 0.06;
    const n5 = this._zones.length || 1;
    const arcPerLabel = 2 * Math.PI * (this._radius - nominalOffset) / n5;
    let maxLabelWidth = 0;
    for (const zone of this._zones) {
      const w2 = [...zone].reduce((s4, ch) => s4 + (this._charWidthCache.get(ch) ?? 0), 0);
      maxLabelWidth = Math.max(maxLabelWidth, w2);
    }
    const scale = maxLabelWidth > arcPerLabel * 0.9 ? arcPerLabel * 0.9 / maxLabelWidth : 1;
    this._labelFontSize = nominalSize * scale;
    this._labelOffset = nominalAscent * scale + this._radius * 0.06;
    if (scale < 1) {
      for (const [ch, w2] of this._charWidthCache) {
        this._charWidthCache.set(ch, w2 * scale);
      }
    }
    this._ctx.restore();
    if (this._lastframe) {
      cancelAnimationFrame(this._lastframe);
      this._lastframe = 0;
    }
    this._lastframe = requestAnimationFrame(this._boundDrawClock);
    if (DEBUG) console.log(`${this._tag()}update complete, zones: ${this._zones.join(", ")}`);
  }
  // Single source of truth for a wizard's current state string.
  _getWizardState(wizard) {
    const state = this.hass.states[wizard.entity];
    if (!state) {
      console.log(`${this._tag()}Wizard ${wizard.entity} does not exist.`);
      return this._lostState;
    }
    const attrs = state.attributes;
    const stateVelo = attrs.velocity ?? attrs.speed ?? (attrs.moving ? 16 : 0);
    const proxState = wizard.proximity_sensor ? this.hass.states[wizard.proximity_sensor] : void 0;
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
    ctx.fillStyle = this._faceColour;
    ctx.fill();
    ctx.strokeStyle = this._borderColour;
    ctx.lineWidth = this._radius * 0.08;
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
    const offset = this._labelOffset;
    ctx.font = `${this._labelFontSize}px ${this._selectedFont}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = this._locationColour;
    for (let num = 0; num < this._zones.length; num++) {
      ctx.save();
      const ang = num * Math.PI / this._zones.length * 2;
      ctx.rotate(ang);
      let startAngle = 0;
      let inwardFacing = true;
      let text = this._zones[num].split("").reverse().join("");
      if (ang > Math.PI / 2 && ang < Math.PI * 2 - Math.PI / 2) {
        startAngle = Math.PI;
        inwardFacing = false;
        text = this._zones[num];
      }
      if (this._isRtlLanguage(text)) text = text.split("").reverse().join("");
      for (let j = 0; j < text.length; j++) {
        const charWid = this._charWidthCache.get(text[j]) ?? ctx.measureText(text[j]).width;
        startAngle += charWid / (r6 - offset) / 2;
      }
      ctx.rotate(startAngle);
      for (let j = 0; j < text.length; j++) {
        const charWid = this._charWidthCache.get(text[j]) ?? ctx.measureText(text[j]).width;
        ctx.rotate(charWid / 2 / (r6 - offset) * -1);
        ctx.fillText(text[j], 0, (inwardFacing ? 1 : -1) * (0 - r6 + offset));
        ctx.rotate(charWid / 2 / (r6 - offset) * -1);
      }
      ctx.restore();
    }
  }
  // _targetstate is computed once in _updateAndDraw() when entity state or
  // config changes. Here we only interpolate and draw — no per-frame allocations.
  _drawTime() {
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
  _buildTargetState(cs) {
    const targets = [];
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
      const displayName = wizard.name || this.hass.states[wizard.entity]?.attributes?.friendly_name || wizard.entity;
      const colour = wizard.colour ? this._resolveColour(wizard.colour, cs, this._colours.primary) : void 0;
      const textcolour = wizard.textcolour ? this._resolveColour(wizard.textcolour, cs, this._colours.primaryText) : void 0;
      targets.push({
        pos: location * Math.PI / this._zones.length * 2,
        length: this._radius * 0.7,
        width: this._radius * 0.1,
        wizard: displayName,
        colour,
        textcolour
      });
    }
    return targets;
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
    ctx.font = `${hand.width * FONT_SCALE}px ${this._selectedFont}`;
    ctx.fillStyle = hand.textcolour ?? this._colours.primaryText;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.translate(0, -hand.length * 0.75);
    ctx.rotate(Math.PI / 2);
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
// ── Colour resolution ────────────────────────────────────────────────────────
// Maps HA ui_color token names to their CSS custom properties so canvas can
// use them. Users pick these from the ui_color picker in the editor.
WizardClockCard._COLOR_TOKENS = {
  "primary": "--primary-color",
  "accent": "--accent-color",
  "primary-background": "--primary-background-color",
  "secondary-background": "--secondary-background-color",
  "primary-text": "--primary-text-color",
  "secondary-text": "--secondary-text-color",
  "disabled": "--disabled-color",
  "error": "--error-color",
  "warning": "--warning-color",
  "success": "--success-color",
  "info": "--info-color"
};
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
  t3("weasley-wizarding-clock-card")
], WizardClockCard);
window.customCards ??= [];
window.customCards.push({
  type: "weasley-wizarding-clock-card",
  name: "Weasley Wizarding Clock",
  description: "Harry Potter-style location clock for Home Assistant",
  preview: true
});
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
