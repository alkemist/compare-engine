import { CompareStateEnum } from "./compare-state.enum";
export declare class CompareState {
    private _value;
    protected constructor(_value?: CompareStateEnum);
    static get NONE(): CompareState;
    static get ADDED(): CompareState;
    static get UPDATED(): CompareState;
    static get REMOVED(): CompareState;
    static get EQUAL(): CompareState;
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