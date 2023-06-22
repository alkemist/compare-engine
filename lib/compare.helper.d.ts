import { AnyValue, Evaluable, GenericValueArray, GenericValueRecord, GenericValueTree, ValueFunction, ValueKey, ValuePrimitive, ValueTree } from "./value.type.js";
export declare abstract class CompareHelper {
    static isEvaluable(value: AnyValue): value is Evaluable;
    static isBoolean(value: AnyValue): value is boolean;
    static isKey(value: AnyValue): value is ValueKey;
    static isNumber(value: AnyValue): value is number;
    static isSymbol(value: AnyValue): value is symbol;
    static isString(value: AnyValue): value is string;
    static isArray<T extends AnyValue = AnyValue>(value: AnyValue): value is GenericValueArray<T>;
    static isRecord<T extends AnyValue = AnyValue>(value: AnyValue): value is GenericValueRecord<T>;
    static isObject<T extends AnyValue = AnyValue>(value: AnyValue): value is GenericValueRecord<T>;
    static hasStringIndex<T extends AnyValue = AnyValue>(value: AnyValue): value is GenericValueRecord<T>;
    static isTree<T extends AnyValue = AnyValue>(value: AnyValue): value is GenericValueTree<T>;
    static isFunction(value: AnyValue): value is ValueFunction;
    static isPrimitive(value: AnyValue): value is ValuePrimitive;
    static isEqual(sideValue: AnyValue, otherSideValue: AnyValue): boolean;
    static keys<D extends AnyValue, T extends GenericValueTree<D>, R extends ValueKey = T extends GenericValueArray<D> ? string : number>(tree: T): R[];
    static deepClone<T extends AnyValue>(source: T): T;
    static getIn(object: AnyValue, path: ValueKey[]): AnyValue;
    static parseInt(value: ValueKey): number;
    static hasOwn(tree: ValueTree, property: ValueKey): boolean;
    static hasProperty(value: AnyValue, path: ValueKey[] | ValueKey): boolean;
    static serialize(value: AnyValue): string;
    static stringify(value: AnyValue): string;
    private static flat;
}
//# sourceMappingURL=compare.helper.d.ts.map