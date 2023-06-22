import {CompareHelper} from "./compare.helper.js";

export enum TypeStateEnum {
    NO_EVALUABLE = "no_evaluable",
    PRIMITIVE = "primitive",
    OBJECT = "object",
    RECORD = "record",
    ARRAY = "array",
    FUNCTION = "function",
}

export class TypeState {
    private readonly _type: TypeStateEnum;

    constructor(_value: any) {
        if (_value === undefined || _value === null) {
            this._type = TypeStateEnum.NO_EVALUABLE;
        } else if (CompareHelper.isArray(_value)) {
            this._type = TypeStateEnum.ARRAY
        } else if (CompareHelper.isRecord(_value)) {
            this._type = TypeStateEnum.RECORD;
        } else if (CompareHelper.isObject(_value)) {
            this._type = TypeStateEnum.OBJECT;
        } else if (CompareHelper.isFunction(_value)) {
            this._type = TypeStateEnum.FUNCTION
        } else {
            this._type = TypeStateEnum.PRIMITIVE
        }
    }

    get type(): TypeStateEnum {
        return this._type;
    }

    get isValuable() {
        return this._type !== TypeStateEnum.NO_EVALUABLE;
    }

    get isPrimitive() {
        return this._type === TypeStateEnum.PRIMITIVE;
    }

    get isArray() {
        return this._type === TypeStateEnum.ARRAY;
    }

    get isObject() {
        return this._type === TypeStateEnum.OBJECT;
    }

    get isRecord() {
        return this._type === TypeStateEnum.RECORD;
    }

    get isFunction() {
        return this._type === TypeStateEnum.FUNCTION;
    }
}
