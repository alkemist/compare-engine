import {
    AnyValue,
    Evaluable,
    GenericValueArray,
    GenericValueRecord,
    GenericValueTree,
    ValueArray,
    ValueDate,
    ValueFunction,
    ValueKey,
    ValuePrimitive,
    ValueRecord,
    ValueTree
} from "./value.type.js";
import {TypeState} from "./type-state.js";
import {Path} from "./path.js";

const PrimitiveClassNames = ["Boolean", "Number", "String"]

export abstract class CompareHelper {
    static isEvaluable(value: unknown): value is Evaluable {
        return value !== null && value !== undefined;
    }

    static isBoolean(value: unknown): value is boolean {
        return CompareHelper.isEvaluable(value)
            && (
                typeof value === "boolean"
                || Object.getPrototypeOf(value).constructor === Boolean
            );
    }

    static isKey(value: unknown): value is ValueKey {
        return CompareHelper.isEvaluable(value)
            && (CompareHelper.isNumber(value)
                || CompareHelper.isString(value))
    }

    static isNumber(value: unknown): value is number {
        return CompareHelper.isEvaluable(value)
            && (
                typeof value === "number"
                || Object.getPrototypeOf(value).constructor === Number
            )
            && !isNaN(+CompareHelper.stringify(value));
    }

    static isSymbol(value: unknown): value is symbol {
        return CompareHelper.isEvaluable(value)
            && (
                typeof value === "symbol"
                || Object.getPrototypeOf(value).constructor === Symbol
            );
    }

    static isString(value: unknown): value is string {
        return CompareHelper.isEvaluable(value)
            && (
                typeof value === "string"
                || Object.getPrototypeOf(value).constructor === String
            );
    }

    static isArray<T>(value: unknown): value is GenericValueArray<T> {
        return CompareHelper.isEvaluable(value)
            && Array.isArray(value);
    }

    static isRecord<T = AnyValue>(value: unknown): value is GenericValueRecord<T> {
        return CompareHelper.isEvaluable(value)
            && typeof value === "object"
            && Object.getPrototypeOf(value).constructor.name === "Object";
    }

    static isObject<T = AnyValue>(value: unknown): value is GenericValueRecord<T> {
        return CompareHelper.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array", "Object"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static hasStringIndex<T = AnyValue>(value: unknown): value is GenericValueRecord<T> {
        return CompareHelper.isEvaluable(value)
            && typeof value === "object"
            && [...PrimitiveClassNames, "Array"]
                .indexOf(Object.getPrototypeOf(value).constructor.name) === -1;
    }

    static isTree<T = AnyValue>(value: unknown): value is GenericValueTree<T> {
        return CompareHelper.isArray<T>(value)
            || CompareHelper.hasStringIndex<T>(value);
    }

    static isFunction(value: unknown): value is ValueFunction {
        return CompareHelper.isEvaluable(value) &&
            (
                typeof value === 'function'
                || (value instanceof Function)
                || CompareHelper.stringify(value) === '[object Function]'
            );
    }

    static isDate(value: unknown): value is ValueDate {
        return CompareHelper.isObject(value) && Object.getPrototypeOf(value).constructor.name === "Date";
    }

    static isT<T>(value: T): T {
        return value as T;
    }

    static isPrimitive(value: unknown): value is ValuePrimitive {
        return CompareHelper.isEvaluable(value)
            && !CompareHelper.isTree(value)
            && !CompareHelper.isFunction(value);
    }

    static isEqual(sideValue: unknown, otherSideValue: unknown): boolean {
        const typeStateSideValue = new TypeState(sideValue);
        let typeStateOtherSideValue = new TypeState(otherSideValue);

        const valueCompareState = Object.is(
            CompareHelper.serialize(sideValue),
            CompareHelper.serialize(otherSideValue)
        );

        if (valueCompareState) {
            const typeCompareState = Object.is(typeStateSideValue.type, typeStateOtherSideValue.type);
            if (typeCompareState && typeStateSideValue.isObject && typeStateOtherSideValue.isObject) {
                return Object.is(
                    Object.getPrototypeOf(sideValue).constructor.name,
                    Object.getPrototypeOf(otherSideValue).constructor.name
                );
            }
            return typeCompareState;
        }

        return valueCompareState;
    }

    static keys<
        D,
        T extends GenericValueTree<D>,
        R extends ValueKey = T extends GenericValueArray<D> ? string : number
    >(tree: T): R[] {
        if (!CompareHelper.isEvaluable(tree)) return [];

        return CompareHelper.isArray(tree)
            ? Object.keys(tree).map(index => parseInt(index)) as R[]
            : Object.getOwnPropertyNames(tree) as R[];
    }

    static deepClone<T>(source: T): T {
        if (CompareHelper.isArray(source)) {
            return source.map((item): unknown => CompareHelper.deepClone(
                    item,
                )
            ) as T;
        } else if (CompareHelper.isDate(source)) {
            return new Date(source) as T;
        } else if (CompareHelper.hasStringIndex(source)) {
            const cycles = CompareHelper.getCycles(source);
            const prototype = Object.getPrototypeOf(source);

            return (CompareHelper.keys(source) as string[])
                .filter(key => cycles.indexOf(key) === -1)
                .reduce((object: ValueRecord, property) => {
                    const propDesc = Object.getOwnPropertyDescriptor(source, property);
                    if (propDesc !== undefined) {
                        Object.defineProperty(object, property, propDesc);
                    }

                    object[property] = CompareHelper.deepClone(source[property]);
                    return object;
                }, (prototype ? Object.create(prototype) : {}) as ValueRecord) as T;
        }
        return source;
    }

    static getCycles(object: ValueRecord) {
        if (!CompareHelper.isEvaluable(object)) {
            return [];
        }

        const traversedProps = new Set();
        const cycles: Path[] = [];

        // Recursive function to go over objects/arrays
        const traverse = function (currentObj: GenericValueTree<unknown>, path = new Path()) {
            if (traversedProps.has(currentObj)) {
                cycles.push(path);
                return;
            }

            traversedProps.add(currentObj);

            CompareHelper.keys(currentObj).forEach((key) => {
                const newPath = path.clone();
                newPath.push(key);

                const child = CompareHelper.isArray(currentObj) ?
                    currentObj[CompareHelper.parseInt(key)] : (currentObj as ValueRecord)[key];

                if (CompareHelper.isTree(child)) {
                    traverse(child as GenericValueTree<unknown>, newPath);
                }
            })
        }

        traverse(object);
        return cycles.map(cycle => cycle.toString());
    };

    /**
     * Retrieves an element from a tree
     * @param object
     * @param path
     */
    static getIn(object: unknown, path: ValueKey[]): unknown {
        let value: unknown | undefined = object
        let i = 0

        if (value) {
            while (i < path.length) {
                const nextPath = path[i];
                if (CompareHelper.hasStringIndex(value)) {
                    value = value[nextPath]
                } else if (CompareHelper.isArray<AnyValue>(value)) {
                    value = value[CompareHelper.parseInt(nextPath)]
                } else {
                    value = undefined
                }

                i++
            }
        }

        return value
    }

    static parseInt(value: ValueKey): number {
        if (CompareHelper.isNumber(value)) {
            return value;
        }
        return parseInt(value);
    }

    static hasOwn(tree: ValueTree, property: ValueKey): boolean {
        if (CompareHelper.isArray(tree) && CompareHelper.isNumber(property)) {
            return property < tree.length;
        }
        return Object.hasOwn(tree, property)
    }

    static hasProperty(value: unknown, path: ValueKey[] | ValueKey): boolean {
        if (CompareHelper.isKey(path)) {
            path = [path]
        }

        if (path.length === 0) {
            return true;
        } else if (!CompareHelper.isEvaluable(value) || !CompareHelper.isTree(value)) {
            return false;
        }

        let currentProperty = path[0];

        if (path.length === 1) {
            return CompareHelper.hasOwn(value, currentProperty);
        } else if (!CompareHelper.hasOwn(value, currentProperty)) {
            return false;
        }

        const subValue = CompareHelper.isNumber(currentProperty)
            ? (value as ValueArray)[currentProperty]
            : (value as ValueRecord)[currentProperty];


        return CompareHelper.isTree(subValue)
            ? CompareHelper.hasProperty(subValue, path.slice(1))
            : false;
    }

    static serialize(value: unknown): string {
        const flat = CompareHelper.flat(value);
        if (CompareHelper.isString(flat)) {
            return flat;
        }

        return JSON.stringify(flat);
    }

    static stringify(value: unknown): string {
        if (CompareHelper.isEvaluable(value)) {
            if (typeof value.toString !== undefined
                || CompareHelper.isSymbol(value)
            ) {
                return value.toString();
            }
            return value + "";
        }
        return value === null ? "null" : "undefined";
    }

    private static flat(value: unknown): unknown {
        const typeState = new TypeState(value);

        if (!typeState.isValuable || typeState.isPrimitive || typeState.isFunction) {
            if (CompareHelper.isString(value)) {
                return `"${value}"`;
            }

            return CompareHelper.stringify(value);
        } else if (CompareHelper.isDate(value)) {
            return value;
        } else if (CompareHelper.isTree(value)) {
            const flat: Record<string | number, unknown> = typeState.isArray ?
                [] as Record<number, AnyValue> : {} as ValueRecord;


            const keys = CompareHelper.keys(value);

            keys.forEach((index) => {
                if (CompareHelper.isArray(value)) {
                    flat[index] = CompareHelper.flat(value[CompareHelper.parseInt(index)]);
                } else if (CompareHelper.hasStringIndex(value)) {
                    flat[index] = CompareHelper.flat(value[index]);
                }
            });
            return flat;
        }
        return value;
    }
}