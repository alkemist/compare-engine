export type NotEvaluable = null | undefined;
export type ValueKey = string | number;
export type ValuePrimitive = ValueKey | boolean | symbol;
export type ValueFunction = Function;
export type ValueArray = AnyValue[];
export type ValueRecord = {
    [key: ValueKey]: AnyValue;
};
export type GenericValueArray<T = AnyValue> = T[];
export type GenericValueRecord<T> = {
    [key: ValueKey]: T;
};
export type ValueTree = ValueArray | ValueRecord;
export type GenericValueTree<T> = GenericValueArray<T> | GenericValueRecord<T>;
export type Evaluable = ValuePrimitive | ValueFunction | ValueTree | object;
export type AnyValue = Evaluable | NotEvaluable;
//# sourceMappingURL=value.interface.d.ts.map