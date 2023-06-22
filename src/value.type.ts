export type NotEvaluable = null | undefined;
export type ValueKey = string | number
export type ValuePrimitive = ValueKey | boolean | symbol
export type ValueFunction = Function;
export type ValueArray = AnyValue[];
export type GenericValueArray<T extends AnyValue> = T[];
export type ValueRecord = {
    [key: ValueKey]: AnyValue;
};
export type GenericValueRecord<T extends AnyValue> = {
    [key: ValueKey]: T;
};
export type ValueTree = ValueArray | ValueRecord;
export type GenericValueTree<T extends AnyValue> = GenericValueArray<T> | GenericValueRecord<T>;
export type Evaluable = ValuePrimitive | ValueFunction | ValueTree | object;
export type AnyValue = Evaluable | NotEvaluable;
