import {TypeStateEnum} from "../src/type-state";


const voidFunction: () => void = () => {
};
const voidFunctionSerialized = "() => {\n" +
    "}";

const paramsFunction: (param: string, callback: () => boolean) => boolean
    = (param: string, callback: () => boolean) => true;
const paramsFunctionSerialized = "(param, callback) => true";

const classicFunction: () => { param: string }
    = function () {
    return {
        param: "string"
    }
}
const classicFunctionSerialized = "function () {\n" +
    "    return {\n" +
    "        param: \"string\"\n" +
    "    };\n" +
    "}";

const asyncFunction: () => Promise<number>
    = async () => {
    return Promise.resolve(1)
}
const asyncFunctionSerialized = "async () => {\n" +
    "    return Promise.resolve(1);\n" +
    "}";

class ParentTest {
    static staticVar = 'staticVar'

    constructor(
        public propertyOverride?: string,
        public propertyUndefined = undefined,
        public propertyNull = null,
        public propertyZero = 0,
        private propertyOne = 1,
        private propertyTwo = 2,
        private propertyTwoPointOne = 2.1,
        private propertyTrue = true,
        private propertyRecord?: { property: string },
        private voidFn?: () => void,
        private paramsFn?: (param: string, callback: () => boolean) => boolean,
        private classicFn?: () => { param: string },
        private asyncFn?: () => Promise<number>,
    ) {
        this.propertyRecord = {property: "value"};
        this.voidFn = voidFunction;
        this.paramsFn = paramsFunction;
        this.classicFn = classicFunction;
        this.asyncFn = asyncFunction;
    }

    static staticFunc() {
        return 'staticFunc';
    }
}

const objectFunction = (promiseCallback: () => Promise<boolean>) => ParentTest;
const objectFunctionSerialized = "(promiseCallback) => ParentTest";

const commonObjectTestSerialized = {
    propertyOverride: '"1"',
    propertyUndefined: "undefined",
    propertyNull: "null",
    propertyZero: "0",
}

const privateObjectTestSerialized = {
    propertyOne: "1",
    propertyTwo: "2",
    propertyTwoPointOne: "2.1",
    propertyTrue: "true",
    propertyRecord: {"property": '"value"'},
    voidFn: voidFunctionSerialized,
    paramsFn: paramsFunctionSerialized,
    classicFn: classicFunctionSerialized,
    asyncFn: asyncFunctionSerialized,
}

const parentTestSerialized = {
    ...commonObjectTestSerialized,
    ...privateObjectTestSerialized
}

const anyArray = [
    "1",
    undefined,
    null,
    0,
    1,
    2,
    2.1,
    true,
    {property: "value"},
    voidFunction,
    paramsFunction,
    classicFunction,
    asyncFunction,
    objectFunction
];

const anyArraySerialized = [
    ...Object.values(commonObjectTestSerialized),
    ...Object.values(privateObjectTestSerialized),
    objectFunctionSerialized
]

class ChildTest extends ParentTest {
    constructor(
        public override propertyOverride?: string,
        public propertyObject = new ParentTest("x"),
    ) {
        super(propertyOverride);
    }

    // @TODO To improve with definition functions
    definitionFunction() {
        return true;
    }
}

const childTestSerialized = {
    ...parentTestSerialized,
    propertyOverride: '"2"',
    propertyObject: {
        ...parentTestSerialized,
        propertyOverride: '"x"',
    },
}

export const testValues = [
    {name: "undefined", value: undefined, expectedType: TypeStateEnum.NO_EVALUABLE, expectedSerialize: "undefined"},
    {name: "null", value: null, expectedType: TypeStateEnum.NO_EVALUABLE, expectedSerialize: "null"},
    {name: "true", value: true, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "true"},
    {name: "false", value: false, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "false"},
    {name: "0", value: 0, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "0"},
    {name: "1", value: 1, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "1"},
    {name: "2", value: 2, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "2"},
    {name: "2.1", value: 2.1, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "2.1"},
    {name: "", value: "", expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: '""'},
    {name: "string", value: "string", expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: '"string"'},
    {name: "[]", value: [], expectedType: TypeStateEnum.ARRAY, expectedSerialize: "[]"},
    {
        name: '[{property: "value"}]',
        value: [{property: "value"}],
        expectedType: TypeStateEnum.ARRAY,
        expectedSerialize: '[{"property":"\\\"value\\\""}]'
    },
    {
        name: '{property: "value"}',
        value: {property: "value"},
        expectedType: TypeStateEnum.RECORD,
        expectedSerialize: '{"property":"\\\"value\\\""}'
    },
    {
        name: "voidFunction",
        value: voidFunction,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: voidFunctionSerialized
    },
    {
        name: "paramsFunction",
        value: paramsFunction,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: paramsFunctionSerialized
    },
    {
        name: "classicFunction",
        value: classicFunction,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: classicFunctionSerialized
    },
    {
        name: "asyncFunction",
        value: asyncFunction,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: asyncFunctionSerialized
    },
    {
        name: "objectFunction",
        value: objectFunction,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: objectFunctionSerialized
    },
    {
        name: "object parent",
        value: new ParentTest("1"),
        expectedType: TypeStateEnum.OBJECT,
        expectedSerialize: JSON.stringify(parentTestSerialized)
    },
    {
        name: "object child",
        value: new ChildTest("2"),
        expectedType: TypeStateEnum.OBJECT,
        expectedSerialize: JSON.stringify(childTestSerialized)
    },
    {
        name: "any array",
        value: anyArray,
        expectedType: TypeStateEnum.ARRAY,
        expectedSerialize: JSON.stringify(anyArraySerialized)
    },
] as ValueTest[]

export interface ValueTest {
    name: string,
    value: any,
    expectedType: TypeStateEnum,
    expectedSerialize: any,
}