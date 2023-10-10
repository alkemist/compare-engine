import { AnyValue } from '@alkemist/smart-tools';

export interface FindedItemInterface {
    index: number,
    value: Record<string, AnyValue> | undefined
}