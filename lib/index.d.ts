declare module "compare-state.enum" {
    export enum CompareStateEnum {
        NONE = "",
        ADDED = "added",
        UPDATED = "updated",
        REMOVED = "removed",
        EQUAL = "equal"
    }
}
declare module "compare-state" {
    import {CompareStateEnum} from "compare-state.enum";

    export class CompareState {
        protected constructor(_value?: CompareStateEnum);

        static get NONE(): CompareState;

        static get ADDED(): CompareState;

        static get UPDATED(): CompareState;

        static get REMOVED(): CompareState;

        static get EQUAL(): CompareState;

        private _value;

        get value(): CompareStateEnum;

        get isNone(): boolean;

        get isAdded(): boolean;

        get isUpdated(): boolean;

        get isRemoved(): boolean;

        get isEqual(): boolean;

        get isChanged(): boolean;

        toString(): string;
    }
}
declare module "panel.enum" {
    export enum PanelEnum {
        LEFT = "left",
        RIGHT = "right"
    }
}
declare module "value.interface" {
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
}
declare module "type-state" {
    export enum TypeStateEnum {
        NO_EVALUABLE = "no_evaluable",
        PRIMITIVE = "primitive",
        OBJECT = "object",
        RECORD = "record",
        ARRAY = "array",
        FUNCTION = "function"
    }

    export class TypeState {
        private readonly _type;

        constructor(_value: any);

        get type(): TypeStateEnum;

        get isValuable(): boolean;

        get isPrimitive(): boolean;

        get isArray(): boolean;

        get isObject(): boolean;

        get isRecord(): boolean;

        get isFunction(): boolean;
    }
}
declare module "compare-utils" {
    import {AnyValue, Evaluable, ValueFunction, ValuePrimitive, ValueRecord, ValueTree} from "value.interface";

    export abstract class CompareUtils {
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
}
declare module "finded-item.interface" {
    import {AnyValue} from "value.interface";

    export interface FindedItemInterface {
        index: number;
        value: Record<string, AnyValue> | undefined;
    }
}
declare module "path" {
    export class Path extends Array<string> {
        add(el: string | number): Path;

        clone(): Path;

        slice(start?: number, end?: number): Path;

        toString(): string;
    }
}
declare module "compare-engine" {
    import {CompareState} from "compare-state";
    import {PanelEnum} from "panel.enum";
    import {AnyValue, ValueRecord} from "value.interface";
    import {FindedItemInterface} from "finded-item.interface";
    import {Path} from "path";

    export class CompareEngine {
        protected determineArrayIndexFn?: ((paths: string[]) => string) | undefined;
        private readonly compareStateIndex;
        private readonly arrayIndex;
        private readonly panels;

        constructor(determineArrayIndexFn?: ((paths: string[]) => string) | undefined, leftValue?: AnyValue, rightValue?: AnyValue);

        updateLeft(value: AnyValue): void;

        updateRight(value: AnyValue): void;

        updateCompareIndex(): void;

        hasChange(): boolean;

        getLeftState(path: string[] | string): CompareState;

        getRightState(path: string[] | string): CompareState;

        protected getState(panel: PanelEnum, path: string[] | string): CompareState;

        protected update(panel: PanelEnum, value: AnyValue): void;

        protected findArrayDiffLevels(panel: PanelEnum, path: Path, level?: number, diffs?: number[]): number[];

        protected findCompareItem(sideValue: AnyValue, otherSideItems: ValueRecord[], searchKey: string): FindedItemInterface;

        protected comparePropertyValues(panel: PanelEnum, sideValue: AnyValue, otherSideObject: AnyValue, propertyPath: Path, showLog?: boolean): CompareState;

        protected getIncomparableState(panel: PanelEnum): CompareState;

        protected compareValues(panel: PanelEnum, sideValue: AnyValue, otherSideValue: AnyValue): CompareState;

        protected compare(panel: PanelEnum, sideValue: AnyValue | undefined, path?: Path): void;
    }
}
declare module "test-data" {
    import {TypeStateEnum} from "type-state";
    export const testValues: ValueTest[];

    export interface ValueTest {
        name: string;
        value: any;
        expectedType: TypeStateEnum;
        expectedSerialize: any;
    }
}
//# sourceMappingURL=index.d.ts.map