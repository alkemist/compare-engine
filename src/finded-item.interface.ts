import {AnyValue} from "./value.interface";

export interface FindedItemInterface {
    index: number,
    value: Record<string, AnyValue> | undefined
}