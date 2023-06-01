import {
    AnyValue,
    Evaluable,
    ValueArray,
    ValueFunction,
    ValuePrimitive,
    ValueRecord,
    ValueTree
} from "./value.interface";
import {TypeState} from "./type-state";

export abstract class CompareUtils {
    static isEvaluable(value: AnyValue): value is Evaluable {
        return value !== null && value !== undefined;
    }

    static isNumber(value: AnyValue): value is number {
        return CompareUtils.isEvaluable(value) && !isNaN(+value);
    }

    static isArray<T = AnyValue>(value: AnyValue): value is T[] {
        return CompareUtils.isEvaluable(value) && Array.isArray(value);
    }

    static isString(value: AnyValue): value is string {
        return CompareUtils.isEvaluable(value) && typeof value === "string";
    }

    static isRecord(value: AnyValue): value is ValueRecord {
        return CompareUtils.isEvaluable(value) && typeof value === "object";
    }

    static isTree(value: AnyValue): value is ValueTree {
        return CompareUtils.isArray(value) || CompareUtils.isRecord(value);
    }

    static isFunction(value: AnyValue): value is ValueFunction {
        return CompareUtils.isEvaluable(value) &&
            (typeof value === 'function')
            || (value instanceof Function)
            || {}.toString.call(value) === '[object Function]';
    }

    static isPrimitive(value: AnyValue): value is ValuePrimitive {
        return !CompareUtils.isRecord(value)
            && !CompareUtils.isArray(value)
            && !CompareUtils.isFunction(value);
    }

    static isEqual(sideValue: AnyValue, otherSideValue: AnyValue): boolean {
        const typeStateSideValue = new TypeState(sideValue);
        let typeStateOtherSideValue = new TypeState(sideValue);

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
                if (CompareUtils.isRecord(value)) {
                    value = value[path[i]]
                } else if (CompareUtils.isArray(value)) {
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
            (value as ValueArray)[propertyPath] : (value as ValueRecord)[propertyPath];

        return CompareUtils.isRecord(subValue) || CompareUtils.isArray(subValue)
            ? CompareUtils.hasProperty(subValue, path.slice(1))
            : false;
    }

    static flat(value: AnyValue): AnyValue {
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
            ? value.map((_, index) => index)
            : Object.keys(value);

        items.forEach((index) => {
            const child = CompareUtils.isNumber(index) ?
                (value as ValueArray)[index] : (value as ValueRecord)[index];
            flat[index] = CompareUtils.flat(child);
        });

        return flat;
    }

    static serialize(value: AnyValue): string {
        const flat = CompareUtils.flat(value);
        if (CompareUtils.isString(flat)) {
            return flat;
        }

        return JSON.stringify(flat);
    }
}