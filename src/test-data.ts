import {TypeStateEnum} from "./type-state";


export class ParentTest {
    constructor(
        public propertyOveride?: string,
        public propertyOptional?: string,
        public propertyUndefined = undefined,
        public propertyNull = null,
        public propertyZero = 0,
        private propertyOne = 1,
        private propertyTwo = 2,
        private propertyTwoPointOne = 2.1,
        private propertyFunction1 = () => {
        },
        private propertyFunction2 = () => 2,
        private propertyFunction3 = () => "",
        private propertyFunction4 = () => "string",
        private propertyFunction5 = function () {
        },
        private propertyRecord = {property: "value"},
    ) {
    }
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
    () => false,
    () => 2,
    () => "",
    () => "string",
    function () {
    },
    new ParentTest("1"),
];

export class ChildTest extends ParentTest {
    constructor(
        public override propertyOveride?: string,
        public propertyObject = new ParentTest("x"),
        private propertyAnyArray: any[] = anyArray
    ) {
        super(propertyOveride);
    }
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
    {name: "object parent", value: new ParentTest("1"), expectedType: TypeStateEnum.OBJECT, expectedSerialize: {}},
    {name: "object child", value: new ChildTest("1"), expectedType: TypeStateEnum.OBJECT, expectedSerialize: {}},
    {
        name: "()=>{}", value: () => {
        }, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}
    },
    {name: "()=>true", value: () => true, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {name: "()=>false", value: () => false, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {name: "()=>2", value: () => 2, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {name: "()=>''", value: () => "", expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {name: "()=>'string'", value: () => "string", expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {name: "()=>ParentTest", value: () => ParentTest, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}},
    {
        name: "function(){}", value: function () {
        }, expectedType: TypeStateEnum.FUNCTION, expectedSerialize: {}
    },
    {name: "any array", value: new ParentTest("1"), expectedType: TypeStateEnum.OBJECT, expectedSerialize: {}},
    {name: "any array", value: new ChildTest("1"), expectedType: TypeStateEnum.OBJECT, expectedSerialize: {}},
    {name: "any array", value: anyArray, expectedType: TypeStateEnum.ARRAY, expectedSerialize: {}},
] as ValueTest[]

export interface ValueTest {
    name: string,
    value: any,
    expectedType: TypeStateEnum,
    expectedSerialize: any,
}