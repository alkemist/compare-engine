import {describe, expect, it} from "@jest/globals";
import {CompareEngine} from "../src/compare-engine";
import {AnyValue} from "../src/value.interface";
import {CompareStateEnum} from "../src/compare-state.enum";

class Parent<T extends boolean | string = string> {
    constructor(protected property = "value") {
    }

    aFunction(value: T): T {
        return value;
    }
}

class Child extends Parent<boolean> {
    constructor(protected override property = "value") {
        super();
    }
}

describe("CompareEngine", () => {
    describe("Readme example", () => {
        describe("Compare two JSON", () => {
            const jsonLeft: AnyValue = {
                objectArray: [
                    {
                        id: "movedIndex",
                        property: "old property",
                        otherObjectArray: [
                            {id: "1"},
                            {id: "2"},
                        ],
                        otherArray: [
                            0, 1, 2
                        ]
                    },
                    {
                        id: "removedObject",
                    },
                    {
                        id: "equal"
                    }
                ]
            };
            const jsonRight: AnyValue = {
                objectArray: [
                    {
                        id: "newObject",
                    },
                    {
                        id: "movedIndex",
                        property: "updated property",
                        otherObjectArray: [
                            {id: "2"},
                            {id: "1"},
                        ],
                        otherArray: [
                            2, 1, 3
                        ]
                    },
                    {
                        id: "equal"
                    }
                ]
            };

            let compareEngine = new CompareEngine((_: string[]) => {
                return "id";
            });

            compareEngine.updateLeft(jsonLeft);
            compareEngine.updateRight(jsonRight);
            compareEngine.updateCompareIndex();

            it.each([
                {path: "", expected: CompareStateEnum.UPDATED},
                {path: "objectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/property", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/otherObjectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/otherObjectArray/0", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/otherObjectArray/0/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/otherObjectArray/1", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/otherObjectArray/1/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/otherArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0/otherArray/0", expected: CompareStateEnum.REMOVED},
                {path: "objectArray/0/otherArray/1", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/otherArray/2", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1", expected: CompareStateEnum.REMOVED},
                {path: "objectArray/1/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/2", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/2/id", expected: CompareStateEnum.NONE},
            ] as CompareEngineTest[])(
                "Get left compare state '$path' should return '$expected'",
                (compareTest) => {
                    expect(
                        compareEngine.getLeftState(
                            compareTest.path
                        ).toString()
                    ).toEqual(compareTest.expected);
                }
            );

            it.each([
                {path: "", expected: CompareStateEnum.UPDATED},
                {path: "objectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0", expected: CompareStateEnum.ADDED},
                {path: "objectArray/0/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/1", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/property", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherObjectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherObjectArray/0", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherObjectArray/0/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/otherObjectArray/1", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherObjectArray/1/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/otherArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherArray/0", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/otherArray/1", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/otherArray/2", expected: CompareStateEnum.ADDED},
                {path: "objectArray/2", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/2/id", expected: CompareStateEnum.NONE},
            ] as CompareEngineTest[])(
                "Get right compare state '$path' should return '$expected'",
                (compareTest) => {
                    expect(
                        compareEngine.getRightState(
                            compareTest.path
                        ).toString()
                    ).toEqual(compareTest.expected);
                }
            );
        });

        describe("Compare two objects", () => {
            describe.each([
                {
                    name: "Two parents", leftValue: new Parent(), rightValue: new Parent(),
                    tests: [
                        {path: "", expected: CompareStateEnum.EQUAL},
                        {path: "property", expected: CompareStateEnum.NONE},
                    ]
                },
                {
                    // @TODO To improve with T type
                    name: "Two parents with different T type",
                    leftValue: new Parent<string>(),
                    rightValue: new Parent<boolean>(),
                    tests: [
                        {path: "", expected: CompareStateEnum.EQUAL},
                        {path: "property", expected: CompareStateEnum.NONE},
                    ]
                },
                {
                    name: "Parent and child", leftValue: new Parent(), rightValue: new Child(),
                    tests: [
                        {path: "", expected: CompareStateEnum.UPDATED},
                    ]
                },
                {
                    name: "Two child with differents values",
                    leftValue: new Child(),
                    rightValue: new Child("otherValue"),
                    tests: [
                        {path: "", expected: CompareStateEnum.UPDATED},
                        {path: "property", expected: CompareStateEnum.UPDATED},
                    ]
                },
            ] as CompareEngineExample[])(
                "$name",
                (compareExample) => {
                    const compareEngine = new CompareEngine((_: string[]) => {
                        return "id";
                    }, compareExample.leftValue, compareExample.rightValue);
                    compareEngine.updateCompareIndex();

                    it.each(compareExample.tests)(
                        "Get left compare state '$path' should return '$expected'",
                        (compareTest) => {
                            expect(
                                compareEngine.getRightState(
                                    compareTest.path
                                ).toString()
                            ).toEqual(compareTest.expected);
                        }
                    );
                });
        })
    })

    describe("Configurations", () => {
        const jsonLeft: AnyValue = {
            longTree: {
                1: {
                    2: [
                        {
                            id: "3",
                            4: {
                                5: {
                                    6: [
                                        {
                                            id: "7",
                                            8: [
                                                901
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            findTheBall: [
                {
                    id: "1",
                    objects: [
                        {
                            id: "1-1",
                            objects: [
                                {
                                    id: "1-1-1"
                                }
                            ]
                        },
                        {
                            id: "1-2",
                            objects: [
                                {
                                    id: "1-2-1"
                                },
                                {
                                    id: "1-2-2"
                                }
                            ]
                        },
                        {
                            id: "1-3",
                            objects: []
                        }
                    ]
                },
                {
                    id: "2",
                    objects: [
                        {
                            id: "2-1",
                            objects: [
                                {
                                    id: "2-1-1"
                                }
                            ]
                        },
                        {
                            id: "2-2",
                            objects: [
                                {
                                    id: "2-2-1",
                                    undefined1: undefined,
                                    undefined2: "value"
                                },
                                {
                                    id: "2-2-2",
                                },
                                {
                                    id: "2-2-3"
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "3",
                    objects: []
                }
            ],
            objectArray: [
                {
                    id: 1,
                    label: "identique",
                    func: () => {
                    },
                    object: new Child()
                },
                {
                    id: 2,
                    label: "index moved",
                    array: [{value: 1}]
                },
                {
                    id: 4,
                    label: "removed"
                },
                {
                    id: 5,
                    label: "updated -",
                    func: () => true,
                    object: new Parent(),
                },
                {
                    id: 6,
                    label: "updated",
                    func: (param: boolean) => {
                        return param;
                    },
                    object: new Parent("otherValue")
                },
                {
                    id: 7,
                    label: "index moved and updated",
                    array: [{value: 2}, {value: 3}],
                    func: (param1: boolean) => {
                        return true;
                    },
                    object: new Parent("1")
                },
                {
                    id: 8,
                    label: "index moved and updated",
                    oldValue: false
                },
                {
                    id: "9",
                    undefined: undefined,
                    undefined2: "undefined",
                    null: null,
                    boolean: true,
                    number: 1,
                    emptyArray: [],
                    record: {property: true},
                    object: new Parent(),
                    array1: [undefined, null, true, 1, [], {property: true}, new Parent()],
                    array2: [undefined, null, true, 1, [], {property: true}, new Parent()],
                },
                {
                    id: 10
                }
            ],
            objectWithArray: {
                identiqueArray: [{value: 1, valueArray: [1, 2]}],
                indexMoved: [{value: 1, valueArray: [1, 2]}, {value: 2, valueArray: [3, 4]}],
                elementsAddedOrRemoved: [{value: 1, valueArray: [1, 2]}, {value: 2, valueArray: [3, 4]}]
            }
        };

        const jsonRight: AnyValue = {
            longTree: {
                1: {
                    2: [
                        {
                            id: "3",
                            4: {
                                5: {
                                    6: [
                                        {
                                            id: "7",
                                            8: [
                                                902
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            },
            findTheBall: [
                {
                    id: "3",
                    objects: []
                },
                {
                    id: "4",
                    objects: [
                        {
                            id: "4-1"
                        }
                    ]
                },
                {
                    id: "1",
                    objects: [
                        {
                            id: "1-3",
                            objects: [
                                {
                                    id: "1-3-1"
                                }
                            ]
                        },
                        {
                            id: "1-2",
                            objects: [
                                {
                                    id: "1-2-1"
                                },
                                {
                                    id: "1-2-2"
                                }
                            ]
                        },
                        {
                            id: "1-1",
                            objects: [
                                {
                                    id: "1-1-1"
                                }
                            ]
                        }
                    ]
                },
                {
                    id: "2",
                    objects: [
                        {
                            id: "2-2",
                            objects: [
                                {
                                    id: "2-2-3"
                                },
                                {
                                    id: "2-2-1",
                                    undefined1: undefined,
                                    undefined2: undefined
                                }
                            ]
                        }
                    ]
                }
            ],
            objectArray: [
                {
                    id: 1,
                    label: "identique",
                    func: () => {
                    },
                    object: new Child()
                },
                {
                    id: 3,
                    label: "added"
                },
                {
                    id: 2,
                    label: "index moved",
                    array: [{value: 1}]
                },
                {
                    id: 5,
                    label: "updated",
                    func: () => false,
                    object: new Child(),
                    array: "[]"
                },
                {
                    id: 6,
                    label: "updated -",
                    func: (param: string) => {
                        return param;
                    },
                    object: new Parent("otherValue")
                },
                {
                    id: 8,
                    label: "index moved and updated",
                    array: [3, 4]
                },
                {
                    id: 7,
                    label: "index moved and updated",
                    array: [{value: 3}, {value: 4}],
                    func: (param2: boolean) => {
                        return true;
                    },
                    object: new Parent("2")
                },
                {
                    id: "9",
                    undefined: "undefined",
                    undefined2: undefined,
                    null: "null",
                    boolean: "true",
                    number: "1",
                    emptyArray: "[]",
                    record: "{property: true}",
                    object: '{property: "value"}',
                    array1: '[undefined, null, true, 1, [], {property: true}, {property: "value"}]',
                    array2: '["undefined", "null", "true", "1", "[]", "{property: true}", "{property: "value"}"]',
                },
                {
                    id: "10"
                }
            ],
            objectWithArray: {
                identiqueArray: [{value: 1, valueArray: [1, 2]}],
                indexMoved: [{value: 2, valueArray: [3, 4]}, {value: 1, valueArray: [1, 2]}],
                elementsAddedOrRemoved: [{value: 3, valueArray: [1, 2]}, {value: 2, valueArray: [3, 4]}]
            }
        };

        describe("Not same structure", () => {
            const compareEngine = new CompareEngine();

            it('should work if right structure is not the same', function () {
                compareEngine.updateLeft(jsonLeft);
                compareEngine.updateRight({});
                compareEngine.updateCompareIndex();

                expect(compareEngine.hasChange()).toBeTruthy();
                expect(compareEngine.getLeftState([]).value).toEqual(CompareStateEnum.UPDATED);
                expect(compareEngine.getRightState([]).value).toEqual(CompareStateEnum.UPDATED);
                expect(compareEngine.getLeftState(["longTree"]).value).toEqual(CompareStateEnum.REMOVED);
                expect(compareEngine.getRightState(["longTree"]).value).toEqual(CompareStateEnum.NONE);
            });

            it('should work if left structure is not the same', function () {
                compareEngine.updateLeft({});
                compareEngine.updateRight(jsonRight);
                compareEngine.updateCompareIndex();

                expect(compareEngine.hasChange()).toBeTruthy();
                expect(compareEngine.getLeftState([]).value).toEqual(CompareStateEnum.UPDATED);
                expect(compareEngine.getRightState([]).value).toEqual(CompareStateEnum.UPDATED);
                expect(compareEngine.getLeftState(["longTree"]).value).toEqual(CompareStateEnum.NONE);
                expect(compareEngine.getRightState(["longTree"]).value).toEqual(CompareStateEnum.ADDED);
            });
        });

        describe("All configurations", () => {
            const compareEngine = new CompareEngine((_: string[]) => {
                return "id";
            });

            compareEngine.updateLeft(jsonLeft);
            compareEngine.updateRight(jsonRight);

            compareEngine.updateCompareIndex();

            it.each([
                {path: "", expected: CompareStateEnum.UPDATED},

                {path: "longTree", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/id", expected: CompareStateEnum.EQUAL},
                {path: "longTree/1/2/0/4", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5/6", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5/6/0", expected: CompareStateEnum.UPDATED},
                {
                    path: "longTree/1/2/0/4/5/6/0/id",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "longTree/1/2/0/4/5/6/0/8",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "longTree/1/2/0/4/5/6/0/8/0",
                    expected: CompareStateEnum.REMOVED
                },

                {path: "findTheBall", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0/objects/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0/objects/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects/0/objects", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects/0/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/0/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1/objects", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1/objects/1", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/1/objects/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/0/objects/2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0/objects/2/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects/2/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/1/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/0", expected: CompareStateEnum.REMOVED},
                {path: "findTheBall/1/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/0/objects", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/0/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/0/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/1", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/1/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/1/objects/1/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/1/objects/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/1/objects/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/1/objects/1/objects/0/undefined1", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/1/objects/1/objects/0/undefined2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/1/objects/1", expected: CompareStateEnum.REMOVED},
                {path: "findTheBall/1/objects/1/objects/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/1/objects/2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/1/objects/1/objects/2/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects", expected: CompareStateEnum.EQUAL},

                {path: "objectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/label", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/func", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/object", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/object/property", expected: CompareStateEnum.NONE},
                {path: "objectArray/1", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/1/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/label", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/array", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/1/array/0", expected: CompareStateEnum.NONE},
                {
                    path: "objectArray/1/array/0/value",
                    expected: CompareStateEnum.NONE
                },
                {path: "objectArray/2", expected: CompareStateEnum.REMOVED},
                {path: "objectArray/2/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/2/label", expected: CompareStateEnum.NONE},
                {path: "objectArray/3", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/3/label", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/func", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/object", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/object/property", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/4/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/label", expected: CompareStateEnum.UPDATED},
                // @TODO To imrove with parameter type
                {path: "objectArray/4/func", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/object", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/object/property", expected: CompareStateEnum.NONE},
                {path: "objectArray/5", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/5/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/5/label", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/5/func", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/5/object", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/5/object/property", expected: CompareStateEnum.UPDATED},
                {
                    path: "objectArray/5/array",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/5/array/0",
                    expected: CompareStateEnum.REMOVED
                },
                {
                    path: "objectArray/5/array/0/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectArray/5/array/1",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/5/array/1/value",
                    expected: CompareStateEnum.EQUAL
                },
                {path: "objectArray/6", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/6/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/6/label", expected: CompareStateEnum.EQUAL},
                {
                    path: "objectArray/6/oldValue",
                    expected: CompareStateEnum.REMOVED
                },
                {
                    path: "objectArray/7",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/undefined",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/undefined2",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/null",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/boolean",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/number",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/emptyArray",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/record",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/object",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/array1",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/array2",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/8",
                    expected: CompareStateEnum.REMOVED
                },

                {path: "objectWithArray", expected: CompareStateEnum.UPDATED},
                {
                    path: "objectWithArray/identiqueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/identiqueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/0",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/0/value",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/1",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/1/value",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0",
                    expected: CompareStateEnum.REMOVED
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray/1",
                    expected: CompareStateEnum.NONE
                }
            ] as CompareEngineTest[])(
                "Get left compare state should return '$expected' for path '$path'",
                (compareTest) => {
                    expect(
                        compareEngine.getLeftState(
                            compareTest.path
                        ).toString()
                    ).toEqual(compareTest.expected);
                }
            );

            it.each([
                {path: "", expected: CompareStateEnum.UPDATED},

                {path: "longTree/1", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/id", expected: CompareStateEnum.EQUAL},
                {path: "longTree/1/2/0/4", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5/6", expected: CompareStateEnum.UPDATED},
                {path: "longTree/1/2/0/4/5/6/0", expected: CompareStateEnum.UPDATED},
                {
                    path: "longTree/1/2/0/4/5/6/0/id",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "longTree/1/2/0/4/5/6/0/8",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "longTree/1/2/0/4/5/6/0/8/0",
                    expected: CompareStateEnum.ADDED
                },

                {path: "findTheBall", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/0/objects", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/1", expected: CompareStateEnum.ADDED},
                {path: "findTheBall/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/1/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/objects/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/objects/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects/0/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/objects/0/objects/0", expected: CompareStateEnum.ADDED},
                {path: "findTheBall/2/objects/0/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1/objects", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1/objects/1", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/1/objects/1/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/2", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/2/objects/2/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects/2/objects", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/2/objects/2/objects/0", expected: CompareStateEnum.NONE},
                {path: "findTheBall/2/objects/2/objects/0/id", expected: CompareStateEnum.NONE},
                {path: "findTheBall/3", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/3/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/objects/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/objects/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/3/objects/0/objects", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/objects/0/objects/0", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/objects/0/objects/0/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/3/objects/0/objects/1", expected: CompareStateEnum.UPDATED},
                {path: "findTheBall/3/objects/0/objects/1/id", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/3/objects/0/objects/1/undefined1", expected: CompareStateEnum.EQUAL},
                {path: "findTheBall/3/objects/0/objects/1/undefined2", expected: CompareStateEnum.UPDATED},

                {path: "objectArray", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/0", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/0/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/label", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/func", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/object", expected: CompareStateEnum.NONE},
                {path: "objectArray/0/object/property", expected: CompareStateEnum.NONE},
                {path: "objectArray/1", expected: CompareStateEnum.ADDED},
                {path: "objectArray/1/id", expected: CompareStateEnum.NONE},
                {path: "objectArray/1/label", expected: CompareStateEnum.NONE},
                {path: "objectArray/2", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/2/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/2/label", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/2/array", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/2/array/0", expected: CompareStateEnum.NONE},
                {
                    path: "objectArray/2/array/0/value",
                    expected: CompareStateEnum.NONE
                },
                {path: "objectArray/3", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/3/label", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/func", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/object", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/3/object/property", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/4/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/label", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/4/func", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/object", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/4/object/property", expected: CompareStateEnum.NONE},
                {path: "objectArray/5", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/5/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/5/label", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/5/array", expected: CompareStateEnum.ADDED},
                {path: "objectArray/5/array/0", expected: CompareStateEnum.NONE},
                {path: "objectArray/5/array/1", expected: CompareStateEnum.NONE},
                {path: "objectArray/6", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/6/id", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/6/label", expected: CompareStateEnum.EQUAL},
                {path: "objectArray/6/func", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/6/object", expected: CompareStateEnum.UPDATED},
                {path: "objectArray/6/object/property", expected: CompareStateEnum.UPDATED},
                {
                    path: "objectArray/6/array",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/6/array/0",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/6/array/0/value",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectArray/6/array/1",
                    expected: CompareStateEnum.ADDED
                },
                {
                    path: "objectArray/6/array/1/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectArray/7",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/undefined",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/undefined2",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/null",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/boolean",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/number",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/emptyArray",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/record",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/object",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/array1",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/7/array2",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectArray/8",
                    expected: CompareStateEnum.ADDED
                },

                {path: "objectWithArray", expected: CompareStateEnum.UPDATED},
                {
                    path: "objectWithArray/identiqueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/identiqueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/identiqueArray/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/0",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/0/value",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/1",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/indexMoved/1/value",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/indexMoved/1/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved",
                    expected: CompareStateEnum.UPDATED
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0",
                    expected: CompareStateEnum.ADDED
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/0/valueArray/1",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1",
                    expected: CompareStateEnum.EQUAL
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/value",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray/0",
                    expected: CompareStateEnum.NONE
                },
                {
                    path: "objectWithArray/elementsAddedOrRemoved/1/valueArray/1",
                    expected: CompareStateEnum.NONE
                }
            ] as CompareEngineTest[])(
                "Get right compare state should return '$expected' for path '$path'",
                (compareEngineTest) => {
                    expect(
                        compareEngine.getRightState(
                            compareEngineTest.path
                        ).toString()
                    ).toBe(compareEngineTest.expected);
                }
            );
        })
    })
});

interface CompareEngineTest {
    path: string,
    expected: CompareStateEnum,
}

interface CompareEngineExample {
    name: string,
    leftValue: AnyValue,
    rightValue: AnyValue,
    tests: CompareEngineTest[]
}
