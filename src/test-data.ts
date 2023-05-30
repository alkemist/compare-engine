import {TypeStateEnum} from "./type-state";


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
        private voidFunction = () => {
        },
        private booleanFunction = () => true,
        private numberFunction = () => 2,
        private funcParamFunction = (func: () => {}) => "",
        private propertyParamFunction = (str: string) => "string",
        private parentFunction = (param1: string, param2: boolean) => ParentTest,
        private emptyClassicFunction = function () {
        },
        private propertyRecord = {property: "value"},
    ) {
    }

    static staticFunc() {
        return 'staticFunc';
    }
}

const voidFunction = "() => {\n    }"
const voidFunction2 = "() => {\n        }"
const booleanFunction = "() => true";
const numberFunction = "() => 2";
const funcParamFunction = '(func) => ""';
const propertyParamFunction = '(str) => "string"';
const parentFunction = "(param1, param2) => ParentTest";
const emptyClassicFunction = "function () {\n    }";
const emptyClassicFunction2 = "function () {\n        }";

const privateObjectTestSerialized = {
    voidFunction,
    booleanFunction,
    numberFunction,
    funcParamFunction,
    propertyParamFunction,
    emptyClassicFunction,
    parentFunction,
    propertyOne: 1,
    propertyTwo: 2,
    propertyTwoPointOne: 2.1,
    propertyTrue: true,
    propertyRecord: {property: "value"},
}

const commonObjectTestSerialized = {
    propertyUndefined: undefined,
    propertyNull: null,
    propertyZero: 0,
}

const parentTestSerialized = {
    propertyOverride: "1",
    ...commonObjectTestSerialized,
    ...privateObjectTestSerialized
}

const anyArray = [
    undefined,
    null,
    0,
    1,
    "",
    "string",
    [],
    [{property: "value"}],
    {property: "value"},
    () => {
    },
    () => true,
    () => 2,
    () => "",
    () => "string",
    function () {
    },
    new ParentTest("1"),
];

const anyArraySerialized = [
    ...Object.values(commonObjectTestSerialized),
    ...Object.values(privateObjectTestSerialized),
    [],
    [{property: "value"}],
    1,
    "",
    "string"
]

class ChildTest extends ParentTest {
    constructor(
        public override propertyOverride?: string,
        public propertyObject = new ParentTest("x"),
    ) {
        super(propertyOverride);
    }
}

const childTestSerialized = {
    ...commonObjectTestSerialized,
    propertyObject: {
        ...parentTestSerialized,
        propertyOverride: "x",
    },
    propertyOverride: "2",
    propertyAnyArray: anyArraySerialized
}

export const testValues = [
    {name: "undefined", value: undefined, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: undefined},
    {name: "null", value: null, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: null},
    {name: "true", value: true, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: true},
    {name: "false", value: false, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: false},
    {name: "0", value: 0, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: 0},
    {name: "1", value: 1, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: 1},
    {name: "2", value: 2, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: 2},
    {name: "2.1", value: 2.1, expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: 2.1},
    {name: "", value: "", expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: ""},
    {name: "string", value: "string", expectedType: TypeStateEnum.PRIMITIVE, expectedSerialize: "string"},
    {name: "[]", value: [], expectedType: TypeStateEnum.ARRAY, expectedSerialize: []},
    {
        name: "[{property: \"value\"}]",
        value: [{property: "value"}],
        expectedType: TypeStateEnum.ARRAY,
        expectedSerialize: [{property: "value"}]
    },
    {
        name: "{property: \"value\"}",
        value: {property: "value"},
        expectedType: TypeStateEnum.RECORD,
        expectedSerialize: {property: "value"}
    },
    {
        name: "object parent",
        value: new ParentTest("1"),
        expectedType: TypeStateEnum.OBJECT,
        expectedSerialize: parentTestSerialized
    },
    {
        name: "object child",
        value: new ChildTest("2"),
        expectedType: TypeStateEnum.OBJECT,
        expectedSerialize: childTestSerialized
    },
    {
        name: "()=>{}", value: () => {
        }, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: voidFunction2
    },
    {name: "()=>true", value: () => true, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: booleanFunction},
    {name: "()=>2", value: () => 2, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: numberFunction},
    {
        name: "()=>''",
        value: (func: () => {}) => "",
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: funcParamFunction
    },
    {
        name: "()=>'string'",
        value: (str: string) => "string",
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: propertyParamFunction
    },
    {
        name: "(param1: string, param2: boolean)=>ParentTest",
        value: (param1: string, param2: boolean) => ParentTest,
        expectedType: TypeStateEnum.FUNCTION,
        expectedSerialize: parentFunction
    },
    {
        name: "function(){}", value: function () {
        }, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: emptyClassicFunction2
    },
    {name: "any array", value: anyArray, expectedType: TypeStateEnum.ARRAY, expectedSerialize: anyArraySerialized},
] as ValueTest[]

export interface ValueTest {
    name: string,
    value: any,
    expectedType: TypeStateEnum,
    expectedSerialize: any,
}