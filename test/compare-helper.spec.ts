import {describe, expect, it} from "@jest/globals";
import {testValues, ValueTest} from "./test-data";
import {AnyValue, CompareHelper} from "../src";

describe("CompareHelper", () => {
    describe("serialize", () => {
        it.each(testValues)(
            "Value '$name' should serialize",
            (serializeTest) => {
                expect(CompareHelper.serialize(serializeTest.value))
                    .toStrictEqual(serializeTest.expectedSerialize);
            }
        );
    });

    describe.each([
        {function: "isEvaluable"},
        {function: "isNumber"},
        {function: "isArray"},
        {function: "isString"},
        {function: "isRecord"},
        {function: "isObject"},
        {function: "isFunction"},
        {function: "isDate"},
    ] as { function: keyof CompareHelper & keyof ValueTest }[])(
        "$function",
        (test) => {
            const method: (value: AnyValue) => boolean
                = CompareHelper[test.function];
            const testSequence = `${test.function} with value '$name' should return '$${test.function}'`;

            it.each(testValues)(
                testSequence,
                (typeStateTest) => {
                    const expected = typeStateTest[test.function]

                    expect(method(typeStateTest.value))
                        .toBe(expected)
                    ;
                }
            );
        }
    );

    describe("Get cycles", () => {
        const x = {
            cycle: null as any,
        };
        x.cycle = x;
        const objWithCycles = {
            prop: {},
            test: "test",
            prop2: [1, 2, [{subArray: x}]]
        };

        it("Should detect circular references", () => {
            expect(CompareHelper.getCycles(objWithCycles)).toEqual([
                "prop2[2][0].subArray.cycle"
            ]);
        })

        it("Should deep clone without circular references", () => {
            expect(CompareHelper.deepClone(objWithCycles)).toEqual({
                prop: {},
                test: "test",
                prop2: [1, 2, [{subArray: {}}]]
            });
        });
    })
});

