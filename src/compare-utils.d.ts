import { JsonObject, JsonPrimitive, JsonValue } from "./json-value.interface";
export declare abstract class CompareUtils {
    static isNumber(num: JsonPrimitive): num is number;
    static isArray<T>(arr: unknown): arr is T[];
    static isString(str: unknown): str is string;
    static isObject(obj: unknown): obj is JsonObject;
    static isEqual(sideValue: unknown, otherSideValue: unknown): boolean;
    static deepClone<T, I>(source: T): T;
    /**
     * Retrieves an element from a tree
     * @author @josdejong/svelte-jsoneditor
     * @param object
     * @param path
     */
    static getIn(object: JsonValue, path: string[]): JsonValue | undefined;
}
//# sourceMappingURL=compare-utils.d.ts.map