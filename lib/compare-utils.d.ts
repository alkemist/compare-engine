import {AnyValue, Evaluable, ValueFunction, ValuePrimitive, ValueRecord, ValueTree} from "./value.interface";

export declare abstract class CompareUtils {
    static isEvaluable(value: AnyValue): value is Evaluable;

    static isNumber(value: AnyValue): value is number;

    static isArray<T = AnyValue>(value: AnyValue): value is T[];

    static isString(value: AnyValue): value is string;

    static isRecord(value: AnyValue): value is ValueRecord;

    static isTree(value: AnyValue): value is ValueTree;

    static isFunction(value: AnyValue): value is ValueFunction;

    static isPrimitive(value: AnyValue): value is ValuePrimitive;

    static isEqual(sideValue: AnyValue, otherSideValue: AnyValue): boolean;

    static deepClone<T, I>(source: T): T;

    static getIn(object: AnyValue, path: string[]): AnyValue;

    static hasProperty(value: AnyValue, path: string[]): boolean;

    static flat(value: AnyValue): AnyValue;

    static serialize(value: AnyValue): string;
}

//# sourceMappingURL=compare-utils.d.ts.map