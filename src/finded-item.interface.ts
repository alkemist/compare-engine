import {JsonValue} from "./json-value.interface";

export interface FindedItemInterface {
    index: number,
    value: Record<string, JsonValue> | undefined
}