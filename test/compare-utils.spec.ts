import {describe, expect, it} from "@jest/globals";
import {testValues} from "../src/test-data";
import {CompareUtils} from "../src/compare-utils";

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
});