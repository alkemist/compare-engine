import {describe, expect, it} from "@jest/globals";
import {testValues, ValueTest} from "./test-data";
import {AnyValue, CompareUtils} from "../src";

describe("CompareUtils", () => {
    describe("serialize", () => {
        it.each(testValues)(
            "Value '$name' should serialize",
            (serializeTest) => {
                expect(CompareUtils.serialize(serializeTest.value))
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
    ] as { function: keyof CompareUtils & keyof ValueTest }[])(
        "$function",
        (test) => {
            const method: (value: AnyValue) => boolean
                = CompareUtils[test.function];
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
});

