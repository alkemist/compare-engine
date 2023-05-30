import {JsonObject, JsonPrimitive, JsonValue} from "./json-value.interface";

export abstract class CompareUtils {
    static isNumber(num: JsonPrimitive): num is number {
        return num !== null && !isNaN(+num);
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

    static getIn(object: JsonValue, path: string[]): JsonValue | undefined {
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
}