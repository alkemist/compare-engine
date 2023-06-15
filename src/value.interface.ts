export type NotEvaluable = null | undefined;
export type ValuePrimitive = string | number | boolean
export type ValueFunction = Function;
export type ValueArray = AnyValue[];
export type ValueRecord = {
    [key: string]: AnyValue;
};
export type ValueTree = ValueArray | ValueRecord;
export type Evaluable = ValuePrimitive | ValueFunction | ValueTree | object;
export type AnyValue = Evaluable | NotEvaluable;