import { AnyValue, Evaluable, GenericValueArray, GenericValueRecord, GenericValueTree, ValueDate, ValueFunction, ValueKey, ValuePrimitive, ValueRecord, ValueTree } from "./value.type.js";
export declare abstract class CompareHelper {
    static isEvaluable(value: unknown): value is Evaluable;
    static getPrototypeOf(value: unknown): {};
    static isBoolean(value: unknown): value is boolean;
    static isKey(value: unknown): value is ValueKey;
    static isNumber(value: unknown): value is number;
    static isSymbol(value: unknown): value is symbol;
    static isString(value: unknown): value is string;
    static isArray<T>(value: unknown): value is GenericValueArray<T>;
    static isRecord<T = AnyValue>(value: unknown): value is GenericValueRecord<T>;
    static isObject<T = AnyValue>(value: unknown): value is GenericValueRecord<T>;
    static hasStringIndex<T = AnyValue>(value: unknown): value is GenericValueRecord<T>;
    static isTree<T = AnyValue>(value: unknown): value is GenericValueTree<T>;
    static isFunction(value: unknown): value is ValueFunction;
    static isDate(value: unknown): value is ValueDate;
    static isT<T>(value: T): T;
    static isPrimitive(value: unknown): value is ValuePrimitive;
    static isEqual(sideValue: unknown, otherSideValue: unknown): boolean;
    static keys<D, T extends GenericValueTree<D>, R extends ValueKey = T extends GenericValueArray<D> ? string : number>(tree: T): R[];
    static deepClone<T>(source: T): T;
    static getCycles(object: ValueRecord): string[];
    static getIn(object: unknown, path: ValueKey[]): unknown;
    static parseInt(value: ValueKey): number;
    static hasOwn(tree: ValueTree, property: ValueKey): boolean;
    static hasProperty(value: unknown, path: ValueKey[] | ValueKey): boolean;
    static serialize(value: unknown): string;
    static stringify(value: unknown): string;
    private static flat;
}
//# sourceMappingURL=compare.helper.d.ts.map