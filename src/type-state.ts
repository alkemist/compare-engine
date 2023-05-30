import {CompareUtils} from "./compare-utils";

export enum TypeStateEnum {
    PRIMITIVE = "primitive",
    OBJECT = "object",
    RECORD = "record",
    ARRAY = "array",
    FUNCTION = "function",
}

export class TypeState {
    private readonly _type: TypeStateEnum;

    constructor(private _value: any) {
        if (_value === undefined || _value === null) {
            this._type = TypeStateEnum.PRIMITIVE;
        } else if (CompareUtils.isArray(_value)) {
            this._type = TypeStateEnum.ARRAY
        } else if (CompareUtils.isObject(_value)) {
            this._type = _value.constructor.name === "Object"
                ? TypeStateEnum.RECORD
                : TypeStateEnum.OBJECT;
        } else if (CompareUtils.isFunction(_value)) {
            this._type = TypeStateEnum.FUNCTION
        } else {
            this._type = TypeStateEnum.PRIMITIVE
        }
    }

    get value(): any | any[] | object {
        return this._value;
    }

    get type(): TypeStateEnum {
        return this._type;
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
