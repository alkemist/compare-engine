import {JsonArray, JsonObject, JsonPrimitive, JsonValue} from "./json-value.interface";
import {TypeState} from "./type-state";

export abstract class CompareUtils {
    static isNumber(num: JsonPrimitive): num is number {
        return num !== null && num !== undefined && !isNaN(+num);
    }

    static isArray<T>(arr: unknown): arr is T[] {
        return arr !== null && Array.isArray(arr);
    }

    static isString(str: unknown): str is string {
        return str !== null && typeof str === "string";
    }

    static isObject(obj: unknown): obj is JsonObject {
        return obj !== null && typeof obj === "object";
    }

    static isFunction(func: unknown): func is Function {
        return (typeof func === 'function')
            || (func instanceof Function)
            || {}.toString.call(func) === '[object Function]';
    }

    static isPrimitive(value: unknown): value is JsonPrimitive {
        return !CompareUtils.isObject(value)
            && !CompareUtils.isArray(value)
            && !CompareUtils.isFunction(value);
    }

    static isEqual(sideValue: unknown, otherSideValue: unknown): boolean {
        return Object.is(JSON.stringify(sideValue), JSON.stringify(otherSideValue));
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
    static getIn(object: JsonValue, path: string[]): JsonValue {
        let value: JsonValue | undefined = object
        let i = 0

        if (value) {
            while (i < path.length) {
                if (CompareUtils.isObject(value)) {
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

    static serialize(value: any): JsonValue {
        const typeState = new TypeState(value);

        console.log("--- value", value);
        console.log("--- type", typeState.type);

        if (typeState.isPrimitive) {
            return value;
        }

        const serialize: Record<string | number, JsonValue> = typeState.isArray ?
            [] as Record<number, JsonValue> : {} as JsonObject;

        const items = CompareUtils.isArray(value)
            ? value.map((_, index) => index)
            : Object.keys(value);

        console.log("--- items", items);

        items.forEach((index) => {
            const child = CompareUtils.isNumber(index) ?
                (value as JsonArray)[index] : (value as JsonObject)[index];
            serialize[index] = CompareUtils.serialize(child);
        });

        return serialize;
    }
}