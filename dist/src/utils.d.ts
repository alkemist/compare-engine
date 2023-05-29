import { JsonObject, JsonValue } from "./json-value.interface";
export declare abstract class Utils {
    static isNumber(num: string | number): num is number;
    static isArray<T>(arr: unknown): arr is T[];
    static isString(obj: unknown): obj is string;
    static isObject(obj: unknown): obj is JsonObject;
    static isEqual(sideValue: unknown, otherSideValue: unknown): boolean;
    static deepClone<T, I>(source: T): T;
    static getIn(object: JsonValue, path: string[]): JsonValue | undefined;
}
//# sourceMappingURL=utils.d.ts.map