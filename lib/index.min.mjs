/******/
var __webpack_modules__ = ([
    /* 0 */,
    /* 1 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   CompareEngine: () => (/* binding */ CompareEngine)
            /* harmony export */
        });
        /* harmony import */
        var _compare_state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
        /* harmony import */
        var _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
        /* harmony import */
        var _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
        /* harmony import */
        var _path_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);


        class CompareEngine {
            determineArrayIndexFn;
            compareStateIndex;
            arrayIndex;
            panels;

            constructor(determineArrayIndexFn, leftValue = null, rightValue = null) {
                this.determineArrayIndexFn = determineArrayIndexFn;
                this.compareStateIndex = {
                    left: new Map(),
                    right: new Map()
                };
                this.arrayIndex = {
                    left: new Map(),
                    right: new Map()
                };
                this.panels = {
                    left: leftValue,
                    right: rightValue
                };
            }

            get leftValue() {
                return _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT]);
            }

            get rightValue() {
                return _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT]);
            }

            updateLeft(value) {
                this.update(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT, value);
            }

            updateRight(value) {
                this.update(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT, value);
            }

            leftToRight() {
                this.updateRight(this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT]);
            }

            rightToLeft() {
                this.updateLeft(this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT]);
            }

            updateCompareIndex() {
                this.compareStateIndex[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT].clear();
                this.compareStateIndex[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT].clear();
                this.compare(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT, this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT]);
                this.compare(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT, this.panels[_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT]);
            }

            hasChange() {
                return this.compareStateIndex.right.get("")?.isChanged ?? false;
            }

            getLeftState(path) {
                return this.getState(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT, path);
            }

            getRightState(path) {
                return this.getState(_panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT, path);
            }

            getState(panel, path) {
                return this.compareStateIndex[panel].get(_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(path) ? path.join("/") : path) ?? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.NONE;
            }

            update(panel, value) {
                this.panels[panel] = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(value);
                this.arrayIndex[panel].clear();
            }

            findArrayDiffLevels(panel, path, level = 1, diffs = []) {
                const currentPath = path.slice(0, level);
                const isArray = this.arrayIndex[panel].get(currentPath.toString()) ?? false;
                if (diffs.length > 0) {
                    diffs = diffs.map(value => value + 1);
                }
                if (isArray) {
                    diffs.push(0);
                }
                if (level < path.length) {
                    return this.findArrayDiffLevels(panel, path, level + 1, diffs);
                }
                return diffs;
            }

            findCompareItem(sideValue, otherSideItems, searchKey) {
                let itemIndex;
                if (searchKey && _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isRecord(sideValue) && _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(sideValue, [searchKey])) {
                    itemIndex = otherSideItems
                        .findIndex((item) => item[searchKey] === sideValue[searchKey]);
                } else {
                    const flattenItems = otherSideItems.map(item => JSON.stringify(item));
                    itemIndex = flattenItems.indexOf(JSON.stringify(sideValue));
                }
                return {
                    index: itemIndex,
                    value: otherSideItems[itemIndex]
                };
            }

            comparePropertyValues(panel, sideValue, otherSideObject, propertyPath, showLog = false) {
                if (showLog) {
                    console.log('--- Compare property value', propertyPath, _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(otherSideObject, propertyPath) ? "exist" : "not exist");
                    console.log('--- in object', otherSideObject);
                }
                if (!_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(otherSideObject, propertyPath)) {
                    return this.getIncomparableState(panel);
                }
                const currentOtherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(otherSideObject, propertyPath);
                if (showLog) {
                    console.log('--- Is equal ?', _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isEqual(sideValue, currentOtherSideValue));
                    console.log('--- Other side value', currentOtherSideValue);
                }
                return _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isEqual(sideValue, currentOtherSideValue)
                    ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.EQUAL
                    : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.UPDATED;
            }

            getIncomparableState(panel) {
                return panel === _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.REMOVED : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.ADDED;
            }

            compareValues(panel, sideValue, otherSideValue) {
                return _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isEqual(sideValue, otherSideValue)
                    ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.EQUAL
                    : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.UPDATED;
            }

            compare(panel, sideValue, path = new _path_js__WEBPACK_IMPORTED_MODULE_3__.Path()) {
                let showLog = false;
                let otherSideValue, compareState = _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.NONE;
                const otherPanel = panel === _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT ? _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT : _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT;
                if (!_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isPrimitive(sideValue)) {
                    this.arrayIndex[panel].set(path.toString(), _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(sideValue));
                }
                const arrayDiffLevels = this.findArrayDiffLevels(panel, path);
                if (showLog) {
                    console.log(`- [${panel}] ${path.toString()}`);
                    console.log('-- Side value : ', sideValue);
                    console.log('-- Array diffs : ', arrayDiffLevels);
                }
                let currentRoot = this.panels[panel];
                let currentOtherRoot = this.panels[otherPanel];
                let currentPath = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(path);
                let currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideValue);
                if (arrayDiffLevels.length > 0) {
                    arrayDiffLevels.forEach((arrayDiffLevel) => {
                        const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);
                        const otherSideItems = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentOtherRoot, arrayPath);
                        if (showLog) {
                            console.log('--- Current array diff : ', arrayDiffLevel);
                            console.log('--- Current root : ', currentRoot);
                            console.log('--- Current side value : ', currentSideValue);
                            console.log('--- Array path : ', arrayPath);
                            console.log('--- Other side items : ', otherSideItems);
                            console.log('--- Other side is array ?', _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(otherSideItems));
                        }
                        if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(otherSideItems)) {
                            if (arrayDiffLevel === 0) {
                                currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentRoot, arrayPath);
                                if (showLog) {
                                    console.log('-- Array diff 0');
                                    console.log('-- Property path : ', arrayPath);
                                    console.log('-- Compare : ', currentSideValue);
                                    console.log('-- With : ', otherSideItems);
                                }
                                compareState = this.comparePropertyValues(panel, currentSideValue, currentOtherRoot, arrayPath, showLog);
                            } else {
                                const searchKey = this.determineArrayIndexFn ? this.determineArrayIndexFn(currentPath) : "";
                                const objectPath = currentPath.slice(0, arrayPath.length + 1);
                                const sideObject = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentRoot, objectPath);
                                const itemFinded = this.findCompareItem(sideObject, otherSideItems, searchKey);
                                const otherSideObject = itemFinded.value;
                                if (otherSideObject) {
                                    const propertyPath = currentPath.slice(objectPath.length);
                                    if (arrayDiffLevel === 1) {
                                        const index = parseInt([...currentPath].pop(), 10);
                                        currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(sideObject, propertyPath);
                                        if (showLog) {
                                            console.log('-- Array diff 1', propertyPath);
                                            console.log('-- Other side value : ', itemFinded.value);
                                        }
                                        const compareIndex = this.compareValues(panel, index, itemFinded.index);
                                        const compareValue = this.compareValues(panel, currentSideValue, itemFinded.value);
                                        compareState = compareIndex.isUpdated || compareValue.isUpdated
                                            ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.UPDATED : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.EQUAL;
                                    } else {
                                        currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(sideObject, propertyPath);
                                        otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(otherSideObject, propertyPath);
                                        if (showLog) {
                                            console.log('-- Array diff > 1', propertyPath);
                                            console.log('-- Other side object : ', otherSideObject);
                                            console.log('-- Other side value : ', otherSideValue);
                                        }
                                        compareState = this.comparePropertyValues(panel, currentSideValue, otherSideObject, propertyPath, showLog);
                                    }
                                    currentPath = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(propertyPath);
                                    currentRoot = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideObject);
                                    currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideObject);
                                    currentOtherRoot = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(otherSideObject);
                                    otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(otherSideObject);
                                } else {
                                    compareState = this.getIncomparableState(panel);
                                }
                            }
                        } else {
                            currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentRoot, arrayPath);
                            if (showLog) {
                                console.log('-- No other side array');
                                console.log('-- Compare', currentSideValue);
                                console.log('-- With', otherSideItems);
                            }
                            compareState = this.comparePropertyValues(panel, currentSideValue, currentOtherRoot, arrayPath, showLog);
                        }
                    });
                } else {
                    otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(this.panels[otherPanel], path);
                    compareState = this.comparePropertyValues(panel, currentSideValue, this.panels[otherPanel], path);
                    if (showLog) {
                        console.log('-- No array upside');
                        console.log('-- Other side value : ', otherSideValue);
                    }
                }
                if (showLog) {
                    console.log('-- Update state with : ', compareState);
                }
                this.compareStateIndex[panel].set(path.toString(), compareState);
                if (compareState.isUpdated && _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isTree(sideValue)) {
                    const items = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(sideValue)
                        ? sideValue.map((_, index) => index.toString())
                        : Object.keys(sideValue);
                    items.forEach((index) => {
                        const subPath = path.clone().add(index);
                        const subSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(sideValue) ?
                            sideValue[parseInt(index, 10)] : sideValue[index];
                        this.compare(panel, subSideValue, subPath);
                    });
                }
            }
        }


        /***/
    }),
    /* 2 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   CompareState: () => (/* binding */ CompareState)
            /* harmony export */
        });
        /* harmony import */
        var _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

        class CompareState {
            constructor(_value = _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.NONE) {
                this._value = _value;
            }

            static get NONE() {
                return new CompareState();
            }

            static get ADDED() {
                return new CompareState(_compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.ADDED);
            }

            static get UPDATED() {
                return new CompareState(_compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.UPDATED);
            }

            static get REMOVED() {
                return new CompareState(_compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.REMOVED);
            }

            static get EQUAL() {
                return new CompareState(_compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.EQUAL);
            }

            _value;

            get value() {
                return this._value;
            }

            get isNone() {
                return this._value === _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.NONE;
            }

            get isAdded() {
                return this._value === _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.ADDED;
            }

            get isUpdated() {
                return this._value === _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.UPDATED;
            }

            get isRemoved() {
                return this._value === _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.REMOVED;
            }

            get isEqual() {
                return this._value === _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.EQUAL;
            }

            get isChanged() {
                return this._value !== _compare_state_enum_js__WEBPACK_IMPORTED_MODULE_0__.CompareStateEnum.EQUAL;
            }

            toString() {
                return this.value;
            }
        }


        /***/
    }),
    /* 3 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   CompareStateEnum: () => (/* binding */ CompareStateEnum)
            /* harmony export */
        });
        var CompareStateEnum;
        (function (CompareStateEnum) {
            CompareStateEnum["NONE"] = "";
            CompareStateEnum["ADDED"] = "added";
            CompareStateEnum["UPDATED"] = "updated";
            CompareStateEnum["REMOVED"] = "removed";
            CompareStateEnum["EQUAL"] = "equal";
        })(CompareStateEnum || (CompareStateEnum = {}));


        /***/
    }),
    /* 4 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   PanelEnum: () => (/* binding */ PanelEnum)
            /* harmony export */
        });
        var PanelEnum;
        (function (PanelEnum) {
            PanelEnum["LEFT"] = "left";
            PanelEnum["RIGHT"] = "right";
        })(PanelEnum || (PanelEnum = {}));


        /***/
    }),
    /* 5 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   CompareUtils: () => (/* binding */ CompareUtils)
            /* harmony export */
        });
        /* harmony import */
        var _type_state_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);

        class CompareUtils {
            static isEvaluable(value) {
                return value !== null && value !== undefined;
            }

            static isNumber(value) {
                return CompareUtils.isEvaluable(value) && !isNaN(+value);
            }

            static isArray(value) {
                return CompareUtils.isEvaluable(value) && Array.isArray(value);
            }

            static isString(value) {
                return CompareUtils.isEvaluable(value) && typeof value === "string";
            }

            static isRecord(value) {
                return CompareUtils.isEvaluable(value) && typeof value === "object";
            }

            static isTree(value) {
                return CompareUtils.isArray(value) || CompareUtils.isRecord(value);
            }

            static isFunction(value) {
                return CompareUtils.isEvaluable(value) &&
                    (typeof value === 'function')
                    || (value instanceof Function)
                    || {}.toString.call(value) === '[object Function]';
            }

            static isPrimitive(value) {
                return !CompareUtils.isRecord(value)
                    && !CompareUtils.isArray(value)
                    && !CompareUtils.isFunction(value);
            }

            static isEqual(sideValue, otherSideValue) {
                const typeStateSideValue = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(sideValue);
                let typeStateOtherSideValue = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(sideValue);
                const valueCompareState = Object.is(CompareUtils.serialize(sideValue), CompareUtils.serialize(otherSideValue));
                if (valueCompareState) {
                    const typeCompareState = Object.is(typeStateSideValue.type, typeStateOtherSideValue.type);
                    if (typeCompareState && CompareUtils.isRecord(sideValue) && CompareUtils.isRecord(otherSideValue)) {
                        return sideValue.constructor.name === otherSideValue.constructor.name;
                    }
                    return typeCompareState;
                }
                return valueCompareState;
            }

            static deepClone(source) {
                if (Array.isArray(source)) {
                    return source.map((item) => CompareUtils.deepClone(item));
                }
                if (source instanceof Date) {
                    return new Date(source.getTime());
                }
                if (source && typeof source === "object") {
                    const sourceObj = source;
                    return Object.getOwnPropertyNames(source).reduce((o, prop) => {
                        const propDesc = Object.getOwnPropertyDescriptor(source, prop);
                        if (propDesc !== undefined) {
                            Object.defineProperty(o, prop, propDesc);
                        }
                        o[prop] = CompareUtils.deepClone(sourceObj[prop]);
                        return o;
                    }, Object.create(Object.getPrototypeOf(source)));
                }
                return source;
            }

            static getIn(object, path) {
                let value = object;
                let i = 0;
                if (value) {
                    while (i < path.length) {
                        if (CompareUtils.isRecord(value)) {
                            value = value[path[i]];
                        } else if (CompareUtils.isArray(value)) {
                            value = value[parseInt(path[i])];
                        } else {
                            value = undefined;
                        }
                        i++;
                    }
                }
                return value;
            }

            static hasProperty(value, path) {
                if (path.length === 0) {
                    return true;
                }
                if (!CompareUtils.isTree(value)) {
                    return path.length > 0;
                }
                const propertyPath = CompareUtils.isArray(value) ? parseInt(path[0]) : path[0];
                if (path.length === 1) {
                    return value.hasOwnProperty(propertyPath);
                } else if (!value.hasOwnProperty(propertyPath)) {
                    return false;
                }
                const subValue = CompareUtils.isNumber(propertyPath) ?
                    value[propertyPath] : value[propertyPath];
                return CompareUtils.isRecord(subValue) || CompareUtils.isArray(subValue)
                    ? CompareUtils.hasProperty(subValue, path.slice(1))
                    : false;
            }

            static serialize(value) {
                const flat = CompareUtils.flat(value);
                if (CompareUtils.isString(flat)) {
                    return flat;
                }
                return JSON.stringify(flat);
            }

            static flat(value) {
                const typeState = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(value);
                if (!CompareUtils.isEvaluable(value)) {
                    return value === null ? "null" : "undefined";
                }
                if (typeState.isPrimitive) {
                    if (CompareUtils.isString(value)) {
                        return `"${value}"`;
                    }
                    return value.toString();
                }
                if (typeState.isFunction) {
                    return value.toString();
                }
                const flat = typeState.isArray ?
                    [] : {};
                const items = CompareUtils.isArray(value)
                    ? value.map((_, index) => index.toString())
                    : Object.keys(value);
                items.forEach((index) => {
                    const child = CompareUtils.isArray(value) ?
                        value[parseInt(index, 10)] : value[index];
                    flat[index] = CompareUtils.flat(child);
                });
                return flat;
            }
        }


        /***/
    }),
    /* 6 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   TypeState: () => (/* binding */ TypeState),
            /* harmony export */   TypeStateEnum: () => (/* binding */ TypeStateEnum)
            /* harmony export */
        });
        /* harmony import */
        var _compare_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);

        var TypeStateEnum;
        (function (TypeStateEnum) {
            TypeStateEnum["NO_EVALUABLE"] = "no_evaluable";
            TypeStateEnum["PRIMITIVE"] = "primitive";
            TypeStateEnum["OBJECT"] = "object";
            TypeStateEnum["RECORD"] = "record";
            TypeStateEnum["ARRAY"] = "array";
            TypeStateEnum["FUNCTION"] = "function";
        })(TypeStateEnum || (TypeStateEnum = {}));

        class TypeState {
            constructor(_value) {
                if (_value === undefined || _value === null) {
                    this._type = TypeStateEnum.NO_EVALUABLE;
                } else if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_0__.CompareUtils.isArray(_value)) {
                    this._type = TypeStateEnum.ARRAY;
                } else if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_0__.CompareUtils.isRecord(_value)) {
                    this._type = _value.constructor.name === "Object"
                        ? TypeStateEnum.RECORD
                        : TypeStateEnum.OBJECT;
                } else if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_0__.CompareUtils.isFunction(_value)) {
                    this._type = TypeStateEnum.FUNCTION;
                } else {
                    this._type = TypeStateEnum.PRIMITIVE;
                }
            }

            _type;

            get type() {
                return this._type;
            }

            get isValuable() {
                return this._type !== TypeStateEnum.NO_EVALUABLE;
            }

            get isPrimitive() {
                return this._type === TypeStateEnum.PRIMITIVE;
            }

            get isArray() {
                return this._type === TypeStateEnum.ARRAY;
            }

            get isObject() {
                return this._type === TypeStateEnum.OBJECT;
            }

            get isRecord() {
                return this._type === TypeStateEnum.RECORD;
            }

            get isFunction() {
                return this._type === TypeStateEnum.FUNCTION;
            }
        }


        /***/
    }),
    /* 7 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);
        /* harmony export */
        __webpack_require__.d(__webpack_exports__, {
            /* harmony export */   Path: () => (/* binding */ Path)
            /* harmony export */
        });

        class Path extends Array {
            add(el) {
                super.push(el.toString());
                return this;
            }

            clone() {
                return this.slice();
            }

            slice(start, end) {
                return new Path(...super.slice(start, end));
            }

            toString() {
                return this.join('/');
            }
        }


        /***/
    }),
    /* 8 */
    /***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

        __webpack_require__.r(__webpack_exports__);


        /***/
    })
    /******/]);
/************************************************************************/
/******/ // The module cache
/******/
var __webpack_module_cache__ = {};
/******/
/******/ // The require function
/******/
function __webpack_require__(moduleId) {
    /******/ 	// Check if module is in cache
    /******/
    var cachedModule = __webpack_module_cache__[moduleId];
    /******/
    if (cachedModule !== undefined) {
        /******/
        return cachedModule.exports;
        /******/
    }
    /******/ 	// Create a new module (and put it into the cache)
    /******/
    var module = __webpack_module_cache__[moduleId] = {
        /******/ 		// no module.id needed
        /******/ 		// no module.loaded needed
        /******/        exports: {}
        /******/
    };
    /******/
    /******/ 	// Execute the module function
    /******/
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/
    /******/ 	// Return the exports of the module
    /******/
    return module.exports;
    /******/
}

/******/
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/
(() => {
    /******/ 	// define getter functions for harmony exports
    /******/
    __webpack_require__.d = (exports, definition) => {
        /******/
        for (var key in definition) {
            /******/
            if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                /******/
                Object.defineProperty(exports, key, {enumerable: true, get: definition[key]});
                /******/
            }
            /******/
        }
        /******/
    };
    /******/
})();
/******/
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/
(() => {
    /******/
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
    /******/
})();
/******/
/******/ /* webpack/runtime/make namespace object */
/******/
(() => {
    /******/ 	// define __esModule on exports
    /******/
    __webpack_require__.r = (exports) => {
        /******/
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            /******/
            Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
            /******/
        }
        /******/
        Object.defineProperty(exports, '__esModule', {value: true});
        /******/
    };
    /******/
})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
    __webpack_require__.r(__webpack_exports__);
    /* harmony export */
    __webpack_require__.d(__webpack_exports__, {
        /* harmony export */
        CompareEngine: () => (/* reexport safe */ _compare_engine_js__WEBPACK_IMPORTED_MODULE_0__.CompareEngine),
        /* harmony export */
        CompareState: () => (/* reexport safe */ _compare_state_js__WEBPACK_IMPORTED_MODULE_1__.CompareState),
        /* harmony export */
        CompareUtils: () => (/* reexport safe */ _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils)
        /* harmony export */
    });
    /* harmony import */
    var _compare_engine_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
    /* harmony import */
    var _compare_state_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
    /* harmony import */
    var _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
    /* harmony import */
    var _value_interface_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8);


})();

var __webpack_exports__CompareEngine = __webpack_exports__.CompareEngine;
var __webpack_exports__CompareState = __webpack_exports__.CompareState;
var __webpack_exports__CompareUtils = __webpack_exports__.CompareUtils;
export {
    __webpack_exports__CompareEngine as CompareEngine,
    __webpack_exports__CompareState as CompareState,
    __webpack_exports__CompareUtils as CompareUtils
};
