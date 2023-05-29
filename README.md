# Compare Engine

## Installation

* From npm: `npm install compare-engine`
* From yarn: `yarn add compare-engine`

## Test

* From npm: `npm test`
* From yarn: `yarn test`

## About

Compares 2 json, considering array object movement :

- Either with a signature (identical object)
- Or with a key defined by the method passed to the constructor
- The search is recursive: if an object has been moved within a moved object, it will be detected as moved

## Examples

    import {CompareEngine} from 'compare-engine';

    const jsonLeft = {
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
    const jsonright = {
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

    const compareEngine = new CompareEngine((paths: string[]) => {
      return "id";
    });

    compareEngine.updateLeft(jsonLeft);
    compareEngine.updateRight(jsonRight);

    compareEngine.updateCompareIndex();

    compareEngine.getLeftState("") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/0/property") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/otherObjectArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/otherObjectArray/0") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/otherObjectArray/0/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/0/otherObjectArray/1") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/otherObjectArray/1/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/0/otherArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0/otherArray/0") // return REMOVED CompareState
    compareEngine.getLeftState("objectArray/0/otherArray/1") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/0/otherArray/2") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1") // return REMOVED CompareState
    compareEngine.getLeftState("objectArray/1/id") // return NONE CompareState
    compareEngine.getLeftState("objectArray/2") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/2/id") // return NONE CompareState

    compareEngine.getLeftState("") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/0") // return ADDED CompareState
    compareEngine.getLeftState("objectArray/0/id") // return NONE CompareState
    compareEngine.getLeftState("objectArray/1") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/1/property") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherObjectArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherObjectArray/0") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherObjectArray/0/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/1/otherObjectArray/1") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherObjectArray/1/id") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/1/otherArray") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherArray/0") // return UPDATED CompareState
    compareEngine.getLeftState("objectArray/1/otherArray/1") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/1/otherArray/2") // return ADDED CompareState
    compareEngine.getLeftState("objectArray/2") // return EQUAL CompareState
    compareEngine.getLeftState("objectArray/2/id") // return NONE CompareState

## Exposed interfaces

    CompareEngine {
        constructor(protected determineArrayIndexFn?: (paths: string[]) => string)

        updateLeft(json: any): void
        updateRight(json: any): void

        updateCompareIndex(): void

        hasChange(): boolean

        getLeftState(paths: string[] | string): CompareState
        getRightState(paths: string[] | string): CompareState
    }

    CompareState {
        value: CompareStateEnum

        isNone(): boolean
        isAdded(): boolean
        isUpdated(): boolean
        isRemoved(): boolean
        isEqual(): boolean
        isChanged(): boolean

        toString(): string
    }

    enum CompareStateEnum {
        NONE = "",
        ADDED = "added",
        UPDATED = "updated",
        REMOVED = "removed",
        EQUAL = "equal",
    }

## License

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)