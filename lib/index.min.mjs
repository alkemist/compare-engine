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

            _logsEnabled = false;
            set logsEnabled(logsEnabled) {
                this._logsEnabled = logsEnabled;
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

            getState(panel, paths) {
                const path = _path_js__WEBPACK_IMPORTED_MODULE_3__.Path.from(_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(paths) ? paths : [paths]);
                if (this._logsEnabled) {
                    console.log(`- [${panel}] Get state :`, paths, path);
                }
                return this.compareStateIndex[panel].get(path.toString()) ?? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.NONE;
            }

            update(panel, value) {
                this.panels[panel] = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(value);
                this.arrayIndex[panel].clear();
            }

            findArrayDiffLevels(panel, path, level = 0, diffs = [], logsEnabled = false) {
                const currentPath = path.slice(0, level);
                const isArray = this.arrayIndex[panel].get(currentPath.toString()) ?? false;
                if (logsEnabled) {
                    console.log("--- findArrayDiffLevels : level ", level, " with path ", path);
                    console.log("--- findArrayDiffLevels : currentPath '", currentPath, "' is array ? ", isArray);
                }
                if (diffs.length > 0) {
                    diffs = diffs.map(value => value + 1);
                }
                if (isArray) {
                    diffs.push(0);
                }
                if (level < path.length) {
                    return this.findArrayDiffLevels(panel, path, level + 1, diffs, logsEnabled);
                }
                return diffs;
            }

            findCompareItem(sideValue, otherSideItems, searchKey) {
                let itemIndex;
                if (searchKey && _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(sideValue, [searchKey]) &&
                    _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasStringIndex(sideValue)) {
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

            comparePropertyValues(panel, sideValue, otherSideObject, propertyPath, logsEnabled = false) {
                if (logsEnabled) {
                    console.log('--- Compare property value', propertyPath.toString(), _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(otherSideObject, propertyPath) ? "exist" : "not exist");
                    console.log('--- in object', otherSideObject);
                }
                if (!_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.hasProperty(otherSideObject, propertyPath)) {
                    return this.getIncomparableState(panel);
                }
                const currentOtherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(otherSideObject, propertyPath);
                if (logsEnabled) {
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

            compareValues(sideValue, otherSideValue) {
                return _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isEqual(sideValue, otherSideValue)
                    ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.EQUAL
                    : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.UPDATED;
            }

            compare(panel, sideValue, path = new _path_js__WEBPACK_IMPORTED_MODULE_3__.Path()) {
                let otherSideValue, logsEnabled = this._logsEnabled;
                let compareState = _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.NONE;
                const otherPanel = panel === _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT ? _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.RIGHT : _panel_enum_js__WEBPACK_IMPORTED_MODULE_1__.PanelEnum.LEFT;
                if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isEvaluable(sideValue) && !_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isPrimitive(sideValue)) {
                    this.arrayIndex[panel].set(path.toString(), _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(sideValue));
                }
                if (logsEnabled) {
                    console.log(`- [${panel}] ${path}`);
                    console.log('-- Side value : ', sideValue);
                }
                const arrayDiffLevels = this.findArrayDiffLevels(panel, path, 0, [], logsEnabled);
                if (logsEnabled) {
                    console.log('-- Array diffs : ', arrayDiffLevels);
                }
                let currentRoot = this.panels[panel];
                let currentOtherRoot = this.panels[otherPanel];
                let currentPath = path.clone();
                let currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideValue);
                if (arrayDiffLevels.length > 0) {
                    arrayDiffLevels.forEach((arrayDiffLevel) => {
                        const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);
                        const otherSideItems = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentOtherRoot, arrayPath);
                        if (logsEnabled) {
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
                                if (logsEnabled) {
                                    console.log('-- Array diff 0');
                                    console.log('-- Property path : ', arrayPath);
                                    console.log('-- Compare : ', currentSideValue);
                                    console.log('-- With : ', otherSideItems);
                                }
                                compareState = this.comparePropertyValues(panel, currentSideValue, currentOtherRoot, arrayPath, logsEnabled);
                            } else {
                                const searchKey = this.determineArrayIndexFn ? this.determineArrayIndexFn(currentPath) : "";
                                const objectPath = currentPath.slice(0, arrayPath.length + 1);
                                const sideObject = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentRoot, objectPath);
                                const itemFinded = this.findCompareItem(sideObject, otherSideItems, searchKey);
                                const otherSideObject = itemFinded.value;
                                if (logsEnabled) {
                                    console.log('-- Object path : ', objectPath);
                                    console.log('-- Side object : ', sideObject);
                                    console.log('-- Item finded ? ', itemFinded);
                                }
                                if (otherSideObject) {
                                    const propertyPath = currentPath.slice(objectPath.length);
                                    if (arrayDiffLevel === 1) {
                                        const index = currentPath.last();
                                        if (index !== undefined) {
                                            currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(sideObject, propertyPath);
                                            if (logsEnabled) {
                                                console.log('-- Array diff 1', propertyPath);
                                                console.log('-- Other side value : ', itemFinded.value);
                                                console.log('-- Indexes : ', index, itemFinded.index);
                                            }
                                            const compareIndex = this.compareValues(index, itemFinded.index);
                                            const compareValue = this.compareValues(currentSideValue, itemFinded.value);
                                            if (logsEnabled) {
                                                console.log('-- compare index : ', compareIndex.value);
                                                console.log('-- compare value : ', compareValue.value);
                                            }
                                            compareState = compareIndex.isUpdated || compareValue.isUpdated
                                                ? _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.UPDATED : _compare_state_js__WEBPACK_IMPORTED_MODULE_0__.CompareState.EQUAL;
                                        }
                                    } else {
                                        currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(sideObject, propertyPath);
                                        if (logsEnabled) {
                                            otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(otherSideObject, propertyPath);
                                            console.log('-- Array diff > 1', propertyPath);
                                            console.log('-- Other side object : ', otherSideObject);
                                            console.log('-- Other side value : ', otherSideValue);
                                        }
                                        compareState = this.comparePropertyValues(panel, currentSideValue, otherSideObject, propertyPath, logsEnabled);
                                    }
                                    currentPath = propertyPath.clone();
                                    currentRoot = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideObject);
                                    currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(sideObject);
                                    currentOtherRoot = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(otherSideObject);
                                    if (logsEnabled) {
                                        otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.deepClone(otherSideObject);
                                    }
                                } else {
                                    compareState = this.getIncomparableState(panel);
                                }
                            }
                        } else {
                            currentSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(currentRoot, arrayPath);
                            if (logsEnabled) {
                                console.log('-- No other side array');
                                console.log('-- Compare', currentSideValue);
                                console.log('-- With', otherSideItems);
                            }
                            compareState = this.comparePropertyValues(panel, currentSideValue, currentOtherRoot, arrayPath, logsEnabled);
                        }
                    });
                } else {
                    compareState = this.comparePropertyValues(panel, currentSideValue, this.panels[otherPanel], path);
                    if (logsEnabled) {
                        otherSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.getIn(this.panels[otherPanel], path);
                        console.log('-- No array upside');
                        console.log('-- Other side value : ', otherSideValue);
                    }
                }
                if (logsEnabled) {
                    console.log('-- Update state with : ', compareState.value);
                }
                this.compareStateIndex[panel].set(path.toString(), compareState);
                if (compareState.isUpdated && _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isTree(sideValue)) {
                    const keys = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.keys(sideValue);
                    if (logsEnabled) {
                        console.log('-- Sub keys : ', keys);
                    }
                    keys.forEach((index) => {
                        const subPath = path.clone().add(index);
                        if (this._logsEnabled) {
                            console.log(`-- Sub path :`, path, '+', index, '=>', subPath);
                        }
                        const subSideValue = _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.isArray(sideValue) ?
                            sideValue[_compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils.parseInt(index)] : sideValue[index];
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

        const PrimitiveClassNames = ["Boolean", "Number", "String"];

        class CompareUtils {
            static isEvaluable(value) {
                return value !== null && value !== undefined;
            }

            static isBoolean(value) {
                return CompareUtils.isEvaluable(value)
                    && (typeof value === "boolean"
                        || Object.getPrototypeOf(value).constructor === Boolean);
            }

            static isKey(value) {
                return CompareUtils.isEvaluable(value)
                    && (CompareUtils.isNumber(value)
                        || CompareUtils.isString(value));
            }

            static isNumber(value) {
                return CompareUtils.isEvaluable(value)
                    && (typeof value === "number"
                        || Object.getPrototypeOf(value).constructor === Number)
                    && !isNaN(+CompareUtils.stringify(value));
            }

            static isSymbol(value) {
                return CompareUtils.isEvaluable(value)
                    && (typeof value === "symbol"
                        || Object.getPrototypeOf(value).constructor === Symbol);
            }

            static isString(value) {
                return CompareUtils.isEvaluable(value)
                    && (typeof value === "string"
                        || Object.getPrototypeOf(value).constructor === String);
            }

            static isArray(value) {
                return CompareUtils.isEvaluable(value)
                    && Array.isArray(value);
            }

            static isRecord(value) {
                return CompareUtils.isEvaluable(value)
                    && typeof value === "object"
                    && Object.getPrototypeOf(value).constructor.name === "Object";
            }

            static isObject(value) {
                return CompareUtils.isEvaluable(value)
                    && typeof value === "object"
                    && [...PrimitiveClassNames, "Array", "Object"]
                        .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
            }

            static hasStringIndex(value) {
                return CompareUtils.isEvaluable(value)
                    && typeof value === "object"
                    && [...PrimitiveClassNames, "Array"]
                        .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
            }

            static isTree(value) {
                return CompareUtils.isArray(value)
                    || CompareUtils.hasStringIndex(value);
            }

            static isFunction(value) {
                return CompareUtils.isEvaluable(value) &&
                    (typeof value === 'function'
                        || (value instanceof Function)
                        || CompareUtils.stringify(value) === '[object Function]');
            }

            static isPrimitive(value) {
                return CompareUtils.isEvaluable(value)
                    && !CompareUtils.isTree(value)
                    && !CompareUtils.isFunction(value);
            }

            static isEqual(sideValue, otherSideValue) {
                const typeStateSideValue = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(sideValue);
                let typeStateOtherSideValue = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(otherSideValue);
                const valueCompareState = Object.is(CompareUtils.serialize(sideValue), CompareUtils.serialize(otherSideValue));
                if (valueCompareState) {
                    const typeCompareState = Object.is(typeStateSideValue.type, typeStateOtherSideValue.type);
                    if (typeCompareState && typeStateSideValue.isObject && typeStateOtherSideValue.isObject) {
                        return Object.is(Object.getPrototypeOf(sideValue).constructor.name, Object.getPrototypeOf(otherSideValue).constructor.name);
                    }
                    return typeCompareState;
                }
                return valueCompareState;
            }

            static keys(tree) {
                return CompareUtils.isArray(tree)
                    ? Object.keys(tree).map(index => parseInt(index))
                    : Object.getOwnPropertyNames(tree);
            }

            static deepClone(source) {
                if (CompareUtils.isArray(source)) {
                    return source.map((item) => CompareUtils.deepClone(item));
                } else if (CompareUtils.hasStringIndex(source)) {
                    return CompareUtils.keys(source).reduce((object, property) => {
                        const propDesc = Object.getOwnPropertyDescriptor(source, property);
                        if (propDesc !== undefined) {
                            Object.defineProperty(object, property, propDesc);
                        }
                        object[property] = CompareUtils.deepClone(source[property]);
                        return object;
                    }, Object.create(Object.getPrototypeOf(source)));
                }
                return source;
            }

            static getIn(object, path) {
                let value = object;
                let i = 0;
                if (value) {
                    while (i < path.length) {
                        const nextPath = path[i];
                        if (CompareUtils.hasStringIndex(value)) {
                            value = value[nextPath];
                        } else if (CompareUtils.isArray(value)) {
                            value = value[CompareUtils.parseInt(nextPath)];
                        } else {
                            value = undefined;
                        }
                        i++;
                    }
                }
                return value;
            }

            static parseInt(value) {
                if (CompareUtils.isNumber(value)) {
                    return value;
                }
                return parseInt(value);
            }

            static hasOwn(tree, property) {
                if (CompareUtils.isArray(tree) && CompareUtils.isNumber(property)) {
                    return property < tree.length;
                }
                return Object.hasOwn(tree, property);
            }

            static hasProperty(value, path) {
                if (CompareUtils.isKey(path)) {
                    path = [path];
                }
                if (path.length === 0) {
                    return true;
                } else if (!CompareUtils.isEvaluable(value) || !CompareUtils.isTree(value)) {
                    return false;
                }
                let currentProperty = path[0];
                if (path.length === 1) {
                    return CompareUtils.hasOwn(value, currentProperty);
                } else if (!CompareUtils.hasOwn(value, currentProperty)) {
                    return false;
                }
                const subValue = CompareUtils.isNumber(currentProperty)
                    ? value[currentProperty]
                    : value[currentProperty];
                return CompareUtils.isTree(subValue)
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

            static stringify(value) {
                if (CompareUtils.isEvaluable(value)) {
                    if (typeof value.toString !== undefined
                        || CompareUtils.isSymbol(value)) {
                        return value.toString();
                    }
                    return value + "";
                }
                return value === null ? "null" : "undefined";
            }

            static flat(value) {
                const typeState = new _type_state_js__WEBPACK_IMPORTED_MODULE_0__.TypeState(value);
                if (!typeState.isValuable || typeState.isPrimitive || typeState.isFunction) {
                    if (CompareUtils.isString(value)) {
                        return `"${value}"`;
                    }
                    return CompareUtils.stringify(value);
                } else if (CompareUtils.isTree(value)) {
                    const flat = typeState.isArray ?
                        [] : {};
                    const keys = CompareUtils.keys(value);
                    keys.forEach((index) => {
                        if (CompareUtils.isArray(value)) {
                            flat[index] = CompareUtils.flat(value[CompareUtils.parseInt(index)]);
                        } else if (CompareUtils.hasStringIndex(value)) {
                            flat[index] = CompareUtils.flat(value[index]);
                        }
                    });
                    return flat;
                }
                return value;
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
                    this._type = TypeStateEnum.RECORD;
                } else if (_compare_utils_js__WEBPACK_IMPORTED_MODULE_0__.CompareUtils.isObject(_value)) {
                    this._type = TypeStateEnum.OBJECT;
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
                super.push(el);
                return this;
            }

            clone() {
                return this.slice();
            }

            slice(start, end) {
                const path = new Path();
                path.push(...super.slice(start, end));
                return path;
            }

            toString() {
                return this.join('/');
            }

            last() {
                return this.length > 0 ? this[this.length - 1] : undefined;
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
        CompareUtils: () => (/* reexport safe */ _compare_utils_js__WEBPACK_IMPORTED_MODULE_2__.CompareUtils),
        /* harmony export */
        Path: () => (/* reexport safe */ _path_js__WEBPACK_IMPORTED_MODULE_4__.Path),
        /* harmony export */
        TypeState: () => (/* reexport safe */ _type_state_js__WEBPACK_IMPORTED_MODULE_5__.TypeState),
        /* harmony export */
        TypeStateEnum: () => (/* reexport safe */ _type_state_js__WEBPACK_IMPORTED_MODULE_5__.TypeStateEnum)
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
    /* harmony import */
    var _path_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7);
    /* harmony import */
    var _type_state_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(6);


})();

var __webpack_exports__CompareEngine = __webpack_exports__.CompareEngine;
var __webpack_exports__CompareState = __webpack_exports__.CompareState;
var __webpack_exports__CompareUtils = __webpack_exports__.CompareUtils;
var __webpack_exports__Path = __webpack_exports__.Path;
var __webpack_exports__TypeState = __webpack_exports__.TypeState;
var __webpack_exports__TypeStateEnum = __webpack_exports__.TypeStateEnum;
export {
    __webpack_exports__CompareEngine as CompareEngine,
    __webpack_exports__CompareState as CompareState,
    __webpack_exports__CompareUtils as CompareUtils,
    __webpack_exports__Path as Path,
    __webpack_exports__TypeState as TypeState,
    __webpack_exports__TypeStateEnum as TypeStateEnum
};
