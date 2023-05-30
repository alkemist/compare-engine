import {CompareState} from "./compare-state";
import {PanelEnum} from "./panel.enum";
import {JsonArray, JsonObject, JsonValue} from "./json-value.interface";
import {CompareUtils} from "./compare-utils";
import {FindedItemInterface} from "./finded-item.interface";
import {JsonPath} from "./json-path";


export class CompareEngine {
    private readonly compareStateIndex: Record<PanelEnum, Map<string, CompareState>>;
    private readonly arrayIndex: Record<PanelEnum, Map<string, boolean>>;
    private readonly jsonPanels: Record<PanelEnum, JsonValue>;

    constructor(protected determineArrayIndexFn?: (paths: string[]) => string) {
        this.compareStateIndex = {
            left: new Map<string, CompareState>(),
            right: new Map<string, CompareState>()
        };

        this.arrayIndex = {
            left: new Map<string, boolean>(),
            right: new Map<string, boolean>()
        };

        this.jsonPanels = {
            left: null,
            right: null
        };
    }

    updateLeft(json: JsonValue) {
        this.update(PanelEnum.LEFT, json);
    }

    updateRight(json: JsonValue) {
        this.update(PanelEnum.RIGHT, json);
    }

    updateCompareIndex(): void {
        this.compare(PanelEnum.LEFT, this.jsonPanels[PanelEnum.LEFT], this.jsonPanels[PanelEnum.RIGHT]);
        this.compare(PanelEnum.RIGHT, this.jsonPanels[PanelEnum.RIGHT], this.jsonPanels[PanelEnum.LEFT]);
    }

    hasChange(): boolean {
        return this.compareStateIndex.right.get("")?.isChanged ?? false;
    }

    getLeftState(path: string[] | string): CompareState {
        return this.getState(PanelEnum.LEFT, path);
    }

    getRightState(path: string[] | string): CompareState {
        return this.getState(PanelEnum.RIGHT, path);
    }

    protected getState(panel: PanelEnum, path: string[] | string): CompareState {
        return this.compareStateIndex[panel].get(
            CompareUtils.isArray(path) ? path.join("/") : path
        ) ?? CompareState.NONE;
    }

    protected update(panel: PanelEnum, json: JsonValue): void {
        this.jsonPanels[panel] = json;
        this.compareStateIndex[panel].clear();
        this.arrayIndex[panel].clear();
    }

    // We retrieve the level difference between each array
    protected findArrayDiffLevels(panel: PanelEnum, path: JsonPath, level = 1, diffs: number[] = []): number[] {
        const currentPath = path.slice(0, level);
        const isArray = this.arrayIndex[panel].get(currentPath.toString()) ?? false;


        // We increment the previous level differences
        if (diffs.length > 0) {
            diffs = diffs.map(value => value + 1);
        }

        if (isArray) {
            diffs.push(0);
        }

        if (level < path.length) {
            return this.findArrayDiffLevels(panel, path, level + 1, diffs);
        }

        return diffs;
    }

    protected findCompareItem(
        sideValue: JsonValue,
        otherSideItems: JsonObject[],
        searchKey: string
    ): FindedItemInterface {
        let itemIndex;

        if (searchKey && CompareUtils.isObject(sideValue) && sideValue[searchKey] !== undefined) {
            itemIndex = otherSideItems
                .findIndex((item) => item[searchKey] === sideValue[searchKey]);
        } else {
            const flattenItems = otherSideItems.map(item => JSON.stringify(item));
            itemIndex = flattenItems.indexOf(JSON.stringify(sideValue));

        }
        return {
            index: itemIndex,
            value: otherSideItems[itemIndex]
        };
    }

    protected compareValues(panel: PanelEnum, sideValue?: JsonValue, otherSideValue?: JsonValue): CompareState {
        if (panel === PanelEnum.LEFT && otherSideValue === undefined) {
            return CompareState.REMOVED;
        }
        if (panel === PanelEnum.RIGHT && otherSideValue === undefined) {
            return CompareState.ADDED;
        }

        return CompareUtils.isEqual(sideValue, otherSideValue)
            ? CompareState.EQUAL
            : CompareState.UPDATED;
    }

    protected compare(panel: PanelEnum, sideValue: JsonValue | undefined, otherSideValue: JsonValue | undefined, path: JsonPath = new JsonPath())
        : void {
        const otherPanel = panel === PanelEnum.LEFT ? PanelEnum.RIGHT : PanelEnum.LEFT;

        const isArray = CompareUtils.isArray(sideValue);
        const isObject = !isArray && CompareUtils.isObject(sideValue);
        const isPrimitive = !isArray && !isObject;

        if (!isPrimitive) {
            this.arrayIndex[panel].set(path.toString(), isArray);
        }

        const arrayDiffLevels = this.findArrayDiffLevels(panel, path);

        let compareState = this.compareValues(panel, sideValue, otherSideValue);

        let currentRoot = this.jsonPanels[panel];
        let currentOtherRoot = this.jsonPanels[otherPanel];
        let currentPath = CompareUtils.deepClone(path);
        let currentSideValue = CompareUtils.deepClone(sideValue);
        let currentOtherSideValue = CompareUtils.deepClone(otherSideValue);

        arrayDiffLevels.forEach((arrayDiffLevel) => {

            const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);

            const otherSideItems =
                CompareUtils.getIn(currentOtherRoot, arrayPath);

            if (otherSideItems && CompareUtils.isArray<JsonObject>(otherSideItems)) {
                if (arrayDiffLevel === 0) {
                    compareState = this.compareValues(panel, currentSideValue, currentOtherSideValue);
                } else {
                    const searchKey = this.determineArrayIndexFn ? this.determineArrayIndexFn(currentPath) : "";
                    const objectPath = currentPath.slice(0, arrayPath.length + 1);

                    const sideObject = CompareUtils.getIn(currentRoot, objectPath) as JsonValue;

                    //if (sideObject) {
                    const itemFinded = this.findCompareItem(sideObject, otherSideItems, searchKey);
                    const otherSideObject = itemFinded.value;

                    if (otherSideObject) {
                        const propertyPath = currentPath.slice(objectPath.length);

                        if (arrayDiffLevel === 1) {
                            const index = parseInt([...currentPath].pop() as string, 10);
                            currentSideValue = CompareUtils.getIn(sideObject, propertyPath);

                            const compareIndex = this.compareValues(panel, index, itemFinded.index);
                            const compareValue = this.compareValues(panel, currentSideValue, itemFinded.value);

                            compareState = compareIndex.isUpdated || compareValue.isUpdated
                                ? CompareState.UPDATED : CompareState.EQUAL;
                        } else {
                            currentSideValue = CompareUtils.getIn(sideObject, propertyPath);
                            currentOtherSideValue = CompareUtils.getIn(otherSideObject, propertyPath);

                            compareState = this.compareValues(panel, currentSideValue, currentOtherSideValue);
                        }

                        currentPath = CompareUtils.deepClone(propertyPath);
                        currentRoot = CompareUtils.deepClone(sideObject);
                        currentSideValue = CompareUtils.deepClone(sideObject);
                        currentOtherRoot = CompareUtils.deepClone(otherSideObject);
                        currentOtherSideValue = CompareUtils.deepClone(otherSideObject);
                    } else {
                        compareState = this.compareValues(panel);
                    }
                    /*} else {
                        compareState = this.compareValues(panel);
                    }*/
                }
            } else {
                compareState = this.compareValues(panel);
            }
        });

        this.compareStateIndex[panel].set(path.toString(), compareState);

        if (compareState.isUpdated && !isPrimitive) {
            const items = isArray
                ? sideValue.map((_, index) => index)
                : Object.keys(sideValue);

            items.forEach((index) => {
                let subSideValue;
                let subOtherSideValue;

                if (sideValue !== undefined) {
                    subSideValue = CompareUtils.isNumber(index) ?
                        (sideValue as JsonArray)[index] : (sideValue as JsonObject)[index];
                }

                if (otherSideValue !== undefined) {
                    subOtherSideValue = CompareUtils.isNumber(index) ?
                        (otherSideValue as JsonArray)[index] : (otherSideValue as JsonObject)[index];
                }

                this.compare(
                    panel, subSideValue, subOtherSideValue, path.clone().add(index)
                )
            });
        }
    }
}
