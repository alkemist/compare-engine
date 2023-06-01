import {CompareState} from "./compare-state";
import {PanelEnum} from "./panel.enum";
import {AnyValue, ValueRecord} from "./value.interface";
import {CompareUtils} from "./compare-utils";
import {FindedItemInterface} from "./finded-item.interface";
import {Path} from "./path";


export class CompareEngine {
    private readonly compareStateIndex: Record<PanelEnum, Map<string, CompareState>>;
    private readonly arrayIndex: Record<PanelEnum, Map<string, boolean>>;
    private readonly panels: Record<PanelEnum, AnyValue>;

    constructor(protected determineArrayIndexFn?: (paths: string[]) => string) {
        this.compareStateIndex = {
            left: new Map<string, CompareState>(),
            right: new Map<string, CompareState>()
        };

        this.arrayIndex = {
            left: new Map<string, boolean>(),
            right: new Map<string, boolean>()
        };

        this.panels = {
            left: null,
            right: null
        };
    }

    updateLeft(value: AnyValue) {
        this.update(PanelEnum.LEFT, value);
    }

    updateRight(value: AnyValue) {
        this.update(PanelEnum.RIGHT, value);
    }

    updateCompareIndex(): void {
        this.compareStateIndex[PanelEnum.LEFT].clear();
        this.compareStateIndex[PanelEnum.RIGHT].clear();

        this.compare(PanelEnum.LEFT, this.panels[PanelEnum.LEFT]);
        this.compare(PanelEnum.RIGHT, this.panels[PanelEnum.RIGHT]);
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

    protected update(panel: PanelEnum, value: AnyValue): void {
        this.panels[panel] = value;
        this.arrayIndex[panel].clear();
    }

    // We retrieve the level difference between each array
    protected findArrayDiffLevels(panel: PanelEnum, path: Path, level = 1, diffs: number[] = []): number[] {
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
        sideValue: AnyValue,
        otherSideItems: ValueRecord[],
        searchKey: string
    ): FindedItemInterface {
        let itemIndex;

        if (searchKey && CompareUtils.isRecord(sideValue) && CompareUtils.hasProperty(sideValue, [searchKey])) {
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

    protected comparePropertyValues(
        panel: PanelEnum,
        sideValue: AnyValue,
        otherSideObject: AnyValue,
        propertyPath: Path,
        showLog = false,
    ): CompareState {
        if (showLog) {
            console.log('--- Compare property value', propertyPath, CompareUtils.hasProperty(otherSideObject, propertyPath) ? "exist" : "not exist");
            console.log('--- in object', otherSideObject)
        }

        if (!CompareUtils.hasProperty(otherSideObject, propertyPath)) {
            return this.getIncomparableState(panel);
        }

        const currentOtherSideValue = CompareUtils.getIn(otherSideObject, propertyPath);

        if (showLog) {
            console.log('--- Is equal ?', CompareUtils.isEqual(sideValue, currentOtherSideValue));
            console.log('--- Other side value', currentOtherSideValue);
        }

        return CompareUtils.isEqual(sideValue, currentOtherSideValue)
            ? CompareState.EQUAL
            : CompareState.UPDATED;
    }

    protected getIncomparableState(panel: PanelEnum) {
        return panel === PanelEnum.LEFT ? CompareState.REMOVED : CompareState.ADDED;
    }

    protected compareValues(panel: PanelEnum, sideValue: AnyValue, otherSideValue: AnyValue): CompareState {
        return CompareUtils.isEqual(sideValue, otherSideValue)
            ? CompareState.EQUAL
            : CompareState.UPDATED;
    }

    protected compare(panel: PanelEnum, sideValue: AnyValue | undefined, path: Path = new Path())
        : void {
        let showLog = false;
        let otherSideValue: AnyValue, compareState = CompareState.NONE;

        const otherPanel = panel === PanelEnum.LEFT ? PanelEnum.RIGHT : PanelEnum.LEFT;


        if (!CompareUtils.isPrimitive(sideValue)) {
            this.arrayIndex[panel].set(path.toString(), CompareUtils.isArray(sideValue));
        }

        const arrayDiffLevels = this.findArrayDiffLevels(panel, path);

        if (showLog) {
            console.log(`- [${panel}] ${path.toString()}`)
            console.log('-- Side value : ', sideValue);
            console.log('-- Array diffs : ', arrayDiffLevels);
        }

        let currentRoot = this.panels[panel];
        let currentOtherRoot = this.panels[otherPanel];
        let currentPath = CompareUtils.deepClone(path);
        let currentSideValue = CompareUtils.deepClone(sideValue);

        if (arrayDiffLevels.length > 0) {
            arrayDiffLevels.forEach((arrayDiffLevel) => {
                const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);
                const otherSideItems = CompareUtils.getIn(currentOtherRoot, arrayPath);

                if (showLog) {
                    console.log('--- Current array diff : ', arrayDiffLevel)
                    console.log('--- Current root : ', currentRoot)
                    console.log('--- Current side value : ', currentSideValue)
                    console.log('--- Array path : ', arrayPath)
                    console.log('--- Other side items : ', otherSideItems)
                    console.log('--- Other side is array ?', CompareUtils.isArray<ValueRecord>(otherSideItems))
                }

                if (CompareUtils.isArray<ValueRecord>(otherSideItems)) {
                    if (arrayDiffLevel === 0) {
                        currentSideValue = CompareUtils.getIn(currentRoot, arrayPath);

                        if (showLog) {
                            console.log('-- Array diff 0');
                            console.log('-- Property path : ', arrayPath);
                            console.log('-- Compare : ', currentSideValue);
                            console.log('-- With : ', otherSideItems);
                        }

                        compareState = this.comparePropertyValues(panel,
                            currentSideValue, currentOtherRoot, arrayPath, showLog)
                    } else {
                        const searchKey = this.determineArrayIndexFn ? this.determineArrayIndexFn(currentPath) : "";
                        const objectPath = currentPath.slice(0, arrayPath.length + 1);

                        const sideObject = CompareUtils.getIn(currentRoot, objectPath) as AnyValue;

                        //if (sideObject) {
                        const itemFinded = this.findCompareItem(sideObject, otherSideItems, searchKey);
                        const otherSideObject = itemFinded.value;

                        if (otherSideObject) {
                            const propertyPath = currentPath.slice(objectPath.length);

                            if (arrayDiffLevel === 1) {
                                const index = parseInt([...currentPath].pop() as string, 10);
                                currentSideValue = CompareUtils.getIn(sideObject, propertyPath);
                                if (showLog) {
                                    console.log('-- Array diff 1', propertyPath);
                                    console.log('-- Other side value : ', itemFinded.value);
                                }

                                const compareIndex = this.compareValues(panel, index, itemFinded.index);
                                const compareValue = this.compareValues(panel, currentSideValue, itemFinded.value);

                                compareState = compareIndex.isUpdated || compareValue.isUpdated
                                    ? CompareState.UPDATED : CompareState.EQUAL;
                            } else {
                                currentSideValue = CompareUtils.getIn(sideObject, propertyPath);
                                otherSideValue = CompareUtils.getIn(otherSideObject, propertyPath);
                                if (showLog) {
                                    console.log('-- Array diff > 1', propertyPath);
                                    console.log('-- Other side object : ', otherSideObject);
                                    console.log('-- Other side value : ', otherSideValue);
                                }

                                compareState = this.comparePropertyValues(
                                    panel,
                                    currentSideValue,
                                    otherSideObject,
                                    propertyPath,
                                    showLog
                                );
                            }

                            currentPath = CompareUtils.deepClone(propertyPath);
                            currentRoot = CompareUtils.deepClone(sideObject);
                            currentSideValue = CompareUtils.deepClone(sideObject);
                            currentOtherRoot = CompareUtils.deepClone(otherSideObject);
                            otherSideValue = CompareUtils.deepClone(otherSideObject);
                        } else {
                            compareState = this.getIncomparableState(panel);
                        }
                    }
                } else {
                    currentSideValue = CompareUtils.getIn(currentRoot, arrayPath);

                    if (showLog) {
                        console.log('-- No other side array')
                        console.log('-- Compare', currentSideValue)
                        console.log('-- With', otherSideItems)
                    }

                    compareState = this.comparePropertyValues(panel,
                        currentSideValue, currentOtherRoot, arrayPath, showLog)
                }
            });
        } else {
            otherSideValue = CompareUtils.getIn(this.panels[otherPanel], path);

            compareState = this.comparePropertyValues(
                panel,
                currentSideValue,
                this.panels[otherPanel],
                path
            );

            if (showLog) {
                console.log('-- No array upside');
                console.log('-- Other side value : ', otherSideValue);
            }
        }

        if (showLog) {
            console.log('-- Update state with : ', compareState);
        }
        this.compareStateIndex[panel].set(path.toString(), compareState);

        if (compareState.isUpdated && CompareUtils.hasChild(sideValue)) {
            const items = CompareUtils.isArray(sideValue)
                ? sideValue.map((_, index) => index.toString())
                : Object.keys(sideValue);

            items.forEach((index) => {
                const subPath = path.clone().add(index);
                const subSideValue = CompareUtils.isArray(sideValue) ?
                    sideValue[parseInt(index, 10)] : (sideValue as ValueRecord)[index];

                this.compare(panel, subSideValue, subPath)
            });
        }
    }
}
