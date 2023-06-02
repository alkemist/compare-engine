import {TypeStateEnum} from "./type-state";

export declare const testValues: ValueTest[];

export interface ValueTest {
    name: string;
    value: any;
    expectedType: TypeStateEnum;
    expectedSerialize: any;
}

//# sourceMappingURL=test-data.d.ts.map