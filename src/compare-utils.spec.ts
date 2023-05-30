import {describe, expect, it} from "@jest/globals";
import {testValues} from "./test-data";
import {CompareUtils} from "./compare-utils";

describe("CompareUtils", () => {
    describe("serialize", () => {
        it.each(testValues)(
            "Value '$name' should serialize",
            (serializeTest) => {
                console.log("-----------------------");
                console.log("- test : ", serializeTest.name)
                expect(CompareUtils.serialize(serializeTest.value))
                    .toStrictEqual(serializeTest.expectedSerialize);
            }
        );
    });
});