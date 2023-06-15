import {
    AnyValue,
    Evaluable,
    ValueArray,
    ValueFunction,
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

    static isNumber(value: AnyValue): value is number {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "number"
                || Object.getPrototypeOf(value).constructor === Number
            )
            && !isNaN(+value);
    }

    static isString(value: AnyValue): value is string {
        return CompareUtils.isEvaluable(value)
            && (
                typeof value === "string"
                || Object.getPrototypeOf(value).constructor === String
            );
    }

    static isArray<T>(value: AnyValue): value is T[] {
        return CompareUtils.isEvaluable(value)
            && Object.getPrototypeOf(value).constructor === Array
            && Array.isArray(value);
    }

    static isRecord(value: AnyValue): value is ValueRecord {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && Object.getPrototypeOf(value).constructor.name === "Object";
    }

    static isObject(value: AnyValue): value is ValueRecord {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array", "Object"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static hasStringIndex(value: AnyValue): value is ValueRecord {
        return CompareUtils.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static isTree(value: AnyValue): value is ValueTree {
        return CompareUtils.isArray(value)
            || CompareUtils.hasStringIndex(value);
    }

    static isFunction(value: AnyValue): value is ValueFunction {
        return CompareUtils.isEvaluable(value) &&
            (
                typeof value === 'function'
                || (value instanceof Function)
                || {}.toString.call(value) === '[object Function]'
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

    static deepClone<T, I>(source: T): T {
        if (Array.isArray(source)) {
            return (source as unknown as I[]).map((item: I): I => CompareUtils.deepClone(item)) as unknown as T;
        }
        if (source instanceof Date) {
            return new Date(source.getTime()) as unknown as T;
        }
        if (source && typeof source === "object") {
            const sourceObj = source as unknown as Record<string, unknown>;
            return Object.getOwnPropertyNames(source).reduce((o, prop) => {
                const propDesc = Object.getOwnPropertyDescriptor(source, prop);
                if (propDesc !== undefined) {
                    Object.defineProperty(o, prop, propDesc);
                }
                o[prop] = CompareUtils.deepClone(sourceObj[prop]);
                return o;
            }, Object.create(Object.getPrototypeOf(source) as object) as Record<string, unknown>) as unknown as T;
        }
        return source;
    }

    /**
     * Retrieves an element from a tree
     * @author @josdejong/svelte-jsoneditor
     * @param object
     * @param path
     */
    static getIn(object: AnyValue, path: string[]): AnyValue {
        let value: AnyValue | undefined = object
        let i = 0

        if (value) {
            while (i < path.length) {
                if (CompareUtils.hasStringIndex(value)) {
                    value = value[path[i]]
                } else if (CompareUtils.isArray<AnyValue>(value)) {
                    value = value[parseInt(path[i])]
                } else {
                    value = undefined
                }

                i++
            }
        }

        return value
    }

    static hasProperty(value: AnyValue, path: string[]): boolean {
        if (!CompareUtils.isEvaluable(value)) {
            return false;
        }

        if (path.length === 0) {
            return true;
        }

        if (!CompareUtils.isTree(value)) {
            return path.length > 0;
        }

        const propertyPath = CompareUtils.isArray(value) ? parseInt(path[0]) : path[0];

        if (path.length === 1) {
            return Object.hasOwn(value, propertyPath);
        } else if (!Object.hasOwn(value, propertyPath)) {
            return false;
        }

        const subValue = CompareUtils.isNumber(propertyPath) ?
            (value as ValueArray)[propertyPath] : (value as ValueRecord)[propertyPath];

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

    private static flat(value: AnyValue): AnyValue {
        const typeState = new TypeState(value);

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

        const flat: Record<string | number, AnyValue> = typeState.isArray ?
            [] as Record<number, AnyValue> : {} as ValueRecord;

        const items = CompareUtils.isArray(value)
            ? value.map((_, index) => index.toString())
            : Object.keys(value);

        items.forEach((index) => {
            if (CompareUtils.isArray(value)) {
                flat[index] = CompareUtils.flat(value[parseInt(index, 10)] as AnyValue);
            } else if (CompareUtils.hasStringIndex(value)) {
                flat[index] = CompareUtils.flat(value[index] as AnyValue);
            }
        });

        return flat;
    }
}