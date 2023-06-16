import {
    AnyValue,
    Evaluable,
    GenericValueArray,
    GenericValueRecord,
    GenericValueTree,
    ValueArray,
    ValueFunction,
    ValueKey,
    ValuePrimitive,
    ValueRecord,
    ValueTree
} from "./value.interface.js";
import {TypeState} from "./type-state.js";

const PrimitiveClassNames = ["Boolean", "Number", "String"]

export abstract class CompareUtils {
    static isEvaluable(value: AnyValue): value is Evaluable {
        return value !== null && value !== undefined;
    }

    static isBoolean(value: AnyValue): value is boolean {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "boolean"
                || Object.getPrototypeOf(value).constructor === Boolean
            );
    }

    static isKey(value: AnyValue): value is ValueKey {
        return CompareUtils.isEvaluable(value)
            && (CompareUtils.isNumber(value)
                || CompareUtils.isString(value))
    }

    static isNumber(value: AnyValue): value is number {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "number"
                || Object.getPrototypeOf(value).constructor === Number
            )
            && !isNaN(+CompareUtils.stringify(value));
    }

    static isSymbol(value: AnyValue): value is symbol {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "symbol"
                || Object.getPrototypeOf(value).constructor === Symbol
            );
    }

    static isString(value: AnyValue): value is string {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "string"
                || Object.getPrototypeOf(value).constructor === String
            );
    }

    static isArray<T = AnyValue>(value: AnyValue): value is GenericValueArray<T> {
        return CompareUtils.isEvaluable(value)
            && Array.isArray(value);
    }

    static isRecord<T = AnyValue>(value: AnyValue): value is GenericValueRecord<T> {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && Object.getPrototypeOf(value).constructor.name === "Object";
    }

    static isObject<T = AnyValue>(value: AnyValue): value is GenericValueRecord<T> {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array", "Object"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static hasStringIndex<T = AnyValue>(value: AnyValue): value is GenericValueRecord<T> {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static isTree<T = AnyValue>(value: AnyValue): value is GenericValueTree<T> {
        return CompareUtils.isArray(value)
            || CompareUtils.hasStringIndex(value);
    }

    static isFunction(value: AnyValue): value is ValueFunction {
        return CompareUtils.isEvaluable(value) &&
            (
                typeof value === 'function'
                || (value instanceof Function)
                || CompareUtils.stringify(value) === '[object Function]'
            );
    }

    static isPrimitive(value: AnyValue): value is ValuePrimitive {
        return CompareUtils.isEvaluable(value)
            && !CompareUtils.isTree(value)
            && !CompareUtils.isFunction(value);
    }

    static isEqual(sideValue: AnyValue, otherSideValue: AnyValue): boolean {
        const typeStateSideValue = new TypeState(sideValue);
        let typeStateOtherSideValue = new TypeState(otherSideValue);

        const valueCompareState = Object.is(
            CompareUtils.serialize(sideValue),
            CompareUtils.serialize(otherSideValue)
        );

        if (valueCompareState) {
            const typeCompareState = Object.is(typeStateSideValue.type, typeStateOtherSideValue.type);
            if (typeCompareState && typeStateSideValue.isObject && typeStateOtherSideValue.isObject) {
                return Object.is(
                    Object.getPrototypeOf(sideValue).constructor.name,
                    Object.getPrototypeOf(otherSideValue).constructor.name
                );
            }
            return typeCompareState;
        }

        return valueCompareState;
    }

    static keys<T extends ValueTree, R extends ValueKey = T extends GenericValueArray ? string : number>(tree: T): R[] {
        return CompareUtils.isArray(tree)
            ? Object.keys(tree).map(index => parseInt(index)) as R[]
            : Object.getOwnPropertyNames(tree) as R[];
    }

    static deepClone<T extends AnyValue>(source: T): T {
        if (CompareUtils.isArray(source)) {
            return source.map((item): AnyValue => CompareUtils.deepClone(item)) as T;
        } else if (CompareUtils.hasStringIndex(source)) {
            return CompareUtils.keys(source).reduce((object: ValueRecord, property: ValueKey) => {
                const propDesc = Object.getOwnPropertyDescriptor(source, property);
                if (propDesc !== undefined) {
                    Object.defineProperty(object, property, propDesc);
                }
                object[property] = CompareUtils.deepClone(source[property]);
                return object;
            }, Object.create(Object.getPrototypeOf(source)) as ValueRecord) as T;
        }
        return source;
    }

    /**
     * Retrieves an element from a tree
     * @param object
     * @param path
     */
    static getIn(object: AnyValue, path: ValueKey[]): AnyValue {
        let value: AnyValue | undefined = object
        let i = 0

        if (value) {
            while (i < path.length) {
                const nextPath = path[i];
                if (CompareUtils.hasStringIndex(value)) {
                    value = value[nextPath]
                } else if (CompareUtils.isArray<AnyValue>(value)) {
                    value = value[CompareUtils.parseInt(nextPath)]
                } else {
                    value = undefined
                }

                i++
            }
        }

        return value
    }

    static parseInt(value: ValueKey): number {
        if (CompareUtils.isNumber(value)) {
            return value;
        }
        return parseInt(value);
    }

    static hasOwn(tree: ValueTree, property: ValueKey): boolean {
        if (CompareUtils.isArray(tree) && CompareUtils.isNumber(property)) {
            return property < tree.length;
        }
        return Object.hasOwn(tree, property)
    }

    static hasProperty(value: AnyValue, path: ValueKey[] | ValueKey): boolean {
        if (CompareUtils.isKey(path)) {
            path = [path]
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
            ? (value as ValueArray)[currentProperty]
            : (value as ValueRecord)[currentProperty];


        return CompareUtils.isTree(subValue)
            ? CompareUtils.hasProperty(subValue, path.slice(1))
            : false;
    }

    static serialize(value: AnyValue): string {
        const flat = CompareUtils.flat(value);
        if (CompareUtils.isString(flat)) {
            return flat;
        }

        return JSON.stringify(flat);
    }

    static stringify(value: AnyValue): string {
        if (CompareUtils.isEvaluable(value)) {
            if (typeof value.toString !== undefined
                || CompareUtils.isSymbol(value)
            ) {
                return value.toString();
            }
            return value + "";
        }
        return value === null ? "null" : "undefined";
    }

    private static flat(value: AnyValue): AnyValue {
        const typeState = new TypeState(value);

        if (!typeState.isValuable || typeState.isPrimitive || typeState.isFunction) {
            if (CompareUtils.isString(value)) {
                return `"${value}"`;
            }

            return CompareUtils.stringify(value);
        } else if (CompareUtils.isTree(value)) {
            const flat: Record<string | number, AnyValue> = typeState.isArray ?
                [] as Record<number, AnyValue> : {} as ValueRecord;


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