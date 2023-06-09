import {describe, expect, it} from "@jest/globals";
import {TypeState} from "../src";
import {testValues} from "./test-data";

describe("TypeState", () => {
    it.each(testValues)(
        "Type state '$name' should return '$expectedType'",
        (typeStateTest) => {
            expect(new TypeState(typeStateTest.value).type).toBe(typeStateTest.expectedType);
        }
    );
});