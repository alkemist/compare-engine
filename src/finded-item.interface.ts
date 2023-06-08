import {AnyValue} from "./value.interface.js";

export interface FindedItemInterface {
    index: number,
    value: Record<string, AnyValue> | undefined
}