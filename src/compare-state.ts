import {CompareStateEnum} from "./compare-state.enum.js";

export class CompareState {
    protected constructor(private _value: CompareStateEnum = CompareStateEnum.NONE) {
    }

    static get NONE() {
        return new CompareState();
    }

    static get ADDED() {
        return new CompareState(CompareStateEnum.ADDED);
    }

    static get MOVED() {
        return new CompareState(CompareStateEnum.MOVED);
    }

    static get UPDATED() {
        return new CompareState(CompareStateEnum.UPDATED);
    }

    static get REMOVED() {
        return new CompareState(CompareStateEnum.REMOVED);
    }

    static get EQUAL() {
        return new CompareState(CompareStateEnum.EQUAL);
    }

    get value(): CompareStateEnum {
        return this._value;
    }

    get isNone() {
        return this._value === CompareStateEnum.NONE;
    }

    get isAdded() {
        return this._value === CompareStateEnum.ADDED;
    }

    get isMoved() {
        return this._value === CompareStateEnum.MOVED;
    }

    get isUpdated() {
        return this._value === CompareStateEnum.UPDATED;
    }

    get isRemoved() {
        return this._value === CompareStateEnum.REMOVED;
    }

    get isEqual() {
        return this._value === CompareStateEnum.EQUAL;
    }

    get isChanged() {
        return this._value !== CompareStateEnum.EQUAL;
    }

    toString(): string {
        return this.value;
    }
}
