export type NotEvaluable = null | undefined;
export type ValuePrimitive = string | number | boolean;
export type ValueFunction = Function;
export type ValueArray = AnyValue[];
export type ValueObject = object;
export type ValueRecord = {
    [key: string]: AnyValue;
};
export type ValueTree = ValueArray | ValueObject | ValueRecord;
export type Evaluable = ValuePrimitive | ValueFunction | ValueTree;
export type AnyValue = Evaluable | NotEvaluable;
//# sourceMappingURL=value.interface.d.ts.map