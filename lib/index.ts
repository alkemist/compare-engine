(() => {
    "use strict";
    var e = [, (e, t, r) => {
        r.r(t), r.d(t, {CompareEngine: () => o});
        var a = r(2), n = r(4), i = r(5), s = r(7);

        class o {
            determineArrayIndexFn;
            compareStateIndex;
            arrayIndex;
            panels;

            constructor(e, t = null, r = null) {
                this.determineArrayIndexFn = e, this.compareStateIndex = {
                    left: new Map,
                    right: new Map
                }, this.arrayIndex = {left: new Map, right: new Map}, this.panels = {left: t, right: r}
            }

            updateLeft(e) {
                this.update(n.PanelEnum.LEFT, e)
            }

            updateRight(e) {
                this.update(n.PanelEnum.RIGHT, e)
            }

            updateCompareIndex() {
                this.compareStateIndex[n.PanelEnum.LEFT].clear(), this.compareStateIndex[n.PanelEnum.RIGHT].clear(), this.compare(n.PanelEnum.LEFT, this.panels[n.PanelEnum.LEFT]), this.compare(n.PanelEnum.RIGHT, this.panels[n.PanelEnum.RIGHT])
            }

            hasChange() {
                return this.compareStateIndex.right.get("")?.isChanged ?? !1
            }

            getLeftState(e) {
                return this.getState(n.PanelEnum.LEFT, e)
            }

            getRightState(e) {
                return this.getState(n.PanelEnum.RIGHT, e)
            }

            getState(e, t) {
                return this.compareStateIndex[e].get(i.CompareUtils.isArray(t) ? t.join("/") : t) ?? a.CompareState.NONE
            }

            update(e, t) {
                this.panels[e] = t, this.arrayIndex[e].clear()
            }

            findArrayDiffLevels(e, t, r = 1, a = []) {
                const n = t.slice(0, r), i = this.arrayIndex[e].get(n.toString()) ?? !1;
                return a.length > 0 && (a = a.map((e => e + 1))), i && a.push(0), r < t.length ? this.findArrayDiffLevels(e, t, r + 1, a) : a
            }

            findCompareItem(e, t, r) {
                let a;
                if (r && i.CompareUtils.isRecord(e) && i.CompareUtils.hasProperty(e, [r])) a = t.findIndex((t => t[r] === e[r])); else {
                    a = t.map((e => JSON.stringify(e))).indexOf(JSON.stringify(e))
                }
                return {index: a, value: t[a]}
            }

            comparePropertyValues(e, t, r, n, s = !1) {
                if (s && (console.log("--- Compare property value", n, i.CompareUtils.hasProperty(r, n) ? "exist" : "not exist"), console.log("--- in object", r)), !i.CompareUtils.hasProperty(r, n)) return this.getIncomparableState(e);
                const o = i.CompareUtils.getIn(r, n);
                return s && (console.log("--- Is equal ?", i.CompareUtils.isEqual(t, o)), console.log("--- Other side value", o)), i.CompareUtils.isEqual(t, o) ? a.CompareState.EQUAL : a.CompareState.UPDATED
            }

            getIncomparableState(e) {
                return e === n.PanelEnum.LEFT ? a.CompareState.REMOVED : a.CompareState.ADDED
            }

            compareValues(e, t, r) {
                return i.CompareUtils.isEqual(t, r) ? a.CompareState.EQUAL : a.CompareState.UPDATED
            }

            compare(e, t, r = new s.Path) {
                let o, l = !1, p = a.CompareState.NONE;
                const u = e === n.PanelEnum.LEFT ? n.PanelEnum.RIGHT : n.PanelEnum.LEFT;
                i.CompareUtils.isPrimitive(t) || this.arrayIndex[e].set(r.toString(), i.CompareUtils.isArray(t));
                const c = this.findArrayDiffLevels(e, r);
                let m = this.panels[e], d = this.panels[u], E = i.CompareUtils.deepClone(r),
                    h = i.CompareUtils.deepClone(t);
                if (c.length > 0 ? c.forEach((t => {
                    const r = E.slice(0, E.length - t), n = i.CompareUtils.getIn(d, r);
                    if (i.CompareUtils.isArray(n)) if (0 === t) h = i.CompareUtils.getIn(m, r), p = this.comparePropertyValues(e, h, d, r, l); else {
                        const s = this.determineArrayIndexFn ? this.determineArrayIndexFn(E) : "",
                            u = E.slice(0, r.length + 1), c = i.CompareUtils.getIn(m, u),
                            g = this.findCompareItem(c, n, s), y = g.value;
                        if (y) {
                            const r = E.slice(u.length);
                            if (1 === t) {
                                const t = parseInt([...E].pop(), 10);
                                h = i.CompareUtils.getIn(c, r);
                                const n = this.compareValues(e, t, g.index), s = this.compareValues(e, h, g.value);
                                p = n.isUpdated || s.isUpdated ? a.CompareState.UPDATED : a.CompareState.EQUAL
                            } else h = i.CompareUtils.getIn(c, r), o = i.CompareUtils.getIn(y, r), p = this.comparePropertyValues(e, h, y, r, l);
                            E = i.CompareUtils.deepClone(r), m = i.CompareUtils.deepClone(c), h = i.CompareUtils.deepClone(c), d = i.CompareUtils.deepClone(y), o = i.CompareUtils.deepClone(y)
                        } else p = this.getIncomparableState(e)
                    } else h = i.CompareUtils.getIn(m, r), p = this.comparePropertyValues(e, h, d, r, l)
                })) : (o = i.CompareUtils.getIn(this.panels[u], r), p = this.comparePropertyValues(e, h, this.panels[u], r)), this.compareStateIndex[e].set(r.toString(), p), p.isUpdated && i.CompareUtils.isTree(t)) {
                    (i.CompareUtils.isArray(t) ? t.map(((e, t) => t.toString())) : Object.keys(t)).forEach((a => {
                        const n = r.clone().add(a), s = i.CompareUtils.isArray(t) ? t[parseInt(a, 10)] : t[a];
                        this.compare(e, s, n)
                    }))
                }
            }
        }
    }, (e, t, r) => {
        r.r(t), r.d(t, {CompareState: () => n});
        var a = r(3);

        class n {
            constructor(e = a.CompareStateEnum.NONE) {
                this._value = e
            }

            static get NONE() {
                return new n
            }

            static get ADDED() {
                return new n(a.CompareStateEnum.ADDED)
            }

            static get UPDATED() {
                return new n(a.CompareStateEnum.UPDATED)
            }

            static get REMOVED() {
                return new n(a.CompareStateEnum.REMOVED)
            }

            static get EQUAL() {
                return new n(a.CompareStateEnum.EQUAL)
            }

            _value;

            get value() {
                return this._value
            }

            get isNone() {
                return this._value === a.CompareStateEnum.NONE
            }

            get isAdded() {
                return this._value === a.CompareStateEnum.ADDED
            }

            get isUpdated() {
                return this._value === a.CompareStateEnum.UPDATED
            }

            get isRemoved() {
                return this._value === a.CompareStateEnum.REMOVED
            }

            get isEqual() {
                return this._value === a.CompareStateEnum.EQUAL
            }

            get isChanged() {
                return this._value !== a.CompareStateEnum.EQUAL
            }

            toString() {
                return this.value
            }
        }
    }, (e, t, r) => {
        var a;
        r.r(t), r.d(t, {CompareStateEnum: () => a}), function (e) {
            e.NONE = "", e.ADDED = "added", e.UPDATED = "updated", e.REMOVED = "removed", e.EQUAL = "equal"
        }(a || (a = {}))
    }, (e, t, r) => {
        var a;
        r.r(t), r.d(t, {PanelEnum: () => a}), function (e) {
            e.LEFT = "left", e.RIGHT = "right"
        }(a || (a = {}))
    }, (e, t, r) => {
        r.r(t), r.d(t, {CompareUtils: () => n});
        var a = r(6);

        class n {
            static isEvaluable(e) {
                return null != e
            }

            static isNumber(e) {
                return n.isEvaluable(e) && !isNaN(+e)
            }

            static isArray(e) {
                return n.isEvaluable(e) && Array.isArray(e)
            }

            static isString(e) {
                return n.isEvaluable(e) && "string" == typeof e
            }

            static isRecord(e) {
                return n.isEvaluable(e) && "object" == typeof e
            }

            static isTree(e) {
                return n.isArray(e) || n.isRecord(e)
            }

            static isFunction(e) {
                return n.isEvaluable(e) && "function" == typeof e || e instanceof Function || "[object Function]" === {}.toString.call(e)
            }

            static isPrimitive(e) {
                return !n.isRecord(e) && !n.isArray(e) && !n.isFunction(e)
            }

            static isEqual(e, t) {
                const r = new a.TypeState(e);
                let i = new a.TypeState(e);
                const s = Object.is(n.serialize(e), n.serialize(t));
                if (s) {
                    const a = Object.is(r.type, i.type);
                    return a && n.isRecord(e) && n.isRecord(t) ? e.constructor.name === t.constructor.name : a
                }
                return s
            }

            static deepClone(e) {
                if (Array.isArray(e)) return e.map((e => n.deepClone(e)));
                if (e instanceof Date) return new Date(e.getTime());
                if (e && "object" == typeof e) {
                    const t = e;
                    return Object.getOwnPropertyNames(e).reduce(((r, a) => {
                        const i = Object.getOwnPropertyDescriptor(e, a);
                        return void 0 !== i && Object.defineProperty(r, a, i), r[a] = n.deepClone(t[a]), r
                    }), Object.create(Object.getPrototypeOf(e)))
                }
                return e
            }

            static getIn(e, t) {
                let r = e, a = 0;
                if (r) for (; a < t.length;) r = n.isRecord(r) ? r[t[a]] : n.isArray(r) ? r[parseInt(t[a])] : void 0, a++;
                return r
            }

            static hasProperty(e, t) {
                if (0 === t.length) return !0;
                if (!n.isTree(e)) return t.length > 0;
                const r = n.isArray(e) ? parseInt(t[0]) : t[0];
                if (1 === t.length) return e.hasOwnProperty(r);
                if (!e.hasOwnProperty(r)) return !1;
                const a = (n.isNumber(r), e[r]);
                return !(!n.isRecord(a) && !n.isArray(a)) && n.hasProperty(a, t.slice(1))
            }

            static flat(e) {
                const t = new a.TypeState(e);
                if (!n.isEvaluable(e)) return null === e ? "null" : "undefined";
                if (t.isPrimitive) return n.isString(e) ? `"${e}"` : e.toString();
                if (t.isFunction) return e.toString();
                const r = t.isArray ? [] : {};
                return (n.isArray(e) ? e.map(((e, t) => t.toString())) : Object.keys(e)).forEach((t => {
                    const a = n.isArray(e) ? e[parseInt(t, 10)] : e[t];
                    r[t] = n.flat(a)
                })), r
            }

            static serialize(e) {
                const t = n.flat(e);
                return n.isString(t) ? t : JSON.stringify(t)
            }
        }
    }, (e, t, r) => {
        r.r(t), r.d(t, {TypeState: () => i, TypeStateEnum: () => a});
        var a, n = r(5);
        !function (e) {
            e.NO_EVALUABLE = "no_evaluable", e.PRIMITIVE = "primitive", e.OBJECT = "object", e.RECORD = "record", e.ARRAY = "array", e.FUNCTION = "function"
        }(a || (a = {}));

        class i {
            constructor(e) {
                null == e ? this._type = a.NO_EVALUABLE : n.CompareUtils.isArray(e) ? this._type = a.ARRAY : n.CompareUtils.isRecord(e) ? this._type = "Object" === e.constructor.name ? a.RECORD : a.OBJECT : n.CompareUtils.isFunction(e) ? this._type = a.FUNCTION : this._type = a.PRIMITIVE
            }

            _type;

            get type() {
                return this._type
            }

            get isValuable() {
                return this._type !== a.NO_EVALUABLE
            }

            get isPrimitive() {
                return this._type === a.PRIMITIVE
            }

            get isArray() {
                return this._type === a.ARRAY
            }

            get isObject() {
                return this._type === a.OBJECT
            }

            get isRecord() {
                return this._type === a.RECORD
            }

            get isFunction() {
                return this._type === a.FUNCTION
            }
        }
    }, (e, t, r) => {
        r.r(t), r.d(t, {Path: () => a});

        class a extends Array {
            add(e) {
                return super.push(e.toString()), this
            }

            clone() {
                return this.slice()
            }

            slice(e, t) {
                return new a(...super.slice(e, t))
            }

            toString() {
                return this.join("/")
            }
        }
    }, (e, t, r) => {
        r.r(t)
    }], t = {};

    function r(a) {
        var n = t[a];
        if (void 0 !== n) return n.exports;
        var i = t[a] = {exports: {}};
        return e[a](i, i.exports, r), i.exports
    }

    r.d = (e, t) => {
        for (var a in t) r.o(t, a) && !r.o(e, a) && Object.defineProperty(e, a, {enumerable: !0, get: t[a]})
    }, r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), r.r = e => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    };
    var a = {};
    (() => {
        r.r(a), r.d(a, {
            CompareEngine: () => e.CompareEngine,
            CompareState: () => t.CompareState,
            CompareUtils: () => n.CompareUtils
        });
        var e = r(1), t = r(2), n = r(5);
        r(8)
    })()
})();