import {CompareStateEnum} from "./compare-state.enum.js";

export declare class CompareState {
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

//# sourceMappingURL=compare-state.d.ts.map