import {CompareState} from "./compare-state.js";
import {PanelEnum} from "./panel.enum.js";
import {AnyValue, ValueKey, ValueRecord} from "./value.interface.js";
import {CompareUtils} from "./compare-utils.js";
import {FindedItemInterface} from "./finded-item.interface.js";
import {Path} from "./path.js";

export class CompareEngine {
    private readonly compareStateIndex: Record<PanelEnum, Map<string, CompareState>>;
    private readonly arrayIndex: Record<PanelEnum, Map<string, boolean>>;
    private readonly panels: Record<PanelEnum, AnyValue>;

    constructor(
        protected determineArrayIndexFn?: (paths: ValueKey[]) => ValueKey,
        leftValue: AnyValue = null,
        rightValue: AnyValue = null
    ) {
        this.compareStateIndex = {
            left: new Map<string, CompareState>(),
            right: new Map<string, CompareState>()
        };

        this.arrayIndex = {
            left: new Map<string, boolean>(),
            right: new Map<string, boolean>()
        };

        this.panels = {
            left: leftValue,
            right: rightValue
        };
    }

    private _logsEnabled = false;

    set logsEnabled(logsEnabled: boolean) {
        this._logsEnabled = logsEnabled;
    }

    get leftValue() {
        return CompareUtils.deepClone(this.panels[PanelEnum.LEFT]);
    }

    get rightValue() {
        return CompareUtils.deepClone(this.panels[PanelEnum.RIGHT]);
    }

    updateLeft(value: AnyValue) {
        this.update(PanelEnum.LEFT, value);
    }

    updateRight(value: AnyValue) {
        this.update(PanelEnum.RIGHT, value);
    }

    leftToRight() {
        this.updateRight(this.panels[PanelEnum.LEFT]);
    }

    rightToLeft() {
        this.updateLeft(this.panels[PanelEnum.RIGHT]);
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

    getLeftState(path: ValueKey[] | ValueKey): CompareState {
        return this.getState(PanelEnum.LEFT, path);
    }

    getRightState(path: ValueKey[] | ValueKey): CompareState {
        return this.getState(PanelEnum.RIGHT, path);
    }

    protected getState(panel: PanelEnum, paths: ValueKey[] | ValueKey): CompareState {
        const path = Path.from(CompareUtils.isArray(paths) ? paths : [paths]);

        if (this._logsEnabled) {
            console.log(`- [${panel}] Get state :`, paths, path)
        }

        return this.compareStateIndex[panel].get(
            path.toString()
        ) ?? CompareState.NONE;
    }

    protected update(panel: PanelEnum, value: AnyValue): void {
        this.panels[panel] = CompareUtils.deepClone(value);
        this.arrayIndex[panel].clear();
    }

    // We retrieve the level difference between each array
    protected findArrayDiffLevels(panel: PanelEnum, path: Path, level = 0, diffs: number[] = [], logsEnabled = false): number[] {
        const currentPath = path.slice(0, level);
        const isArray = this.arrayIndex[panel].get(currentPath.toString()) ?? false;

        if (logsEnabled) {
            console.log("--- findArrayDiffLevels : level ", level, " with path ", path)
            console.log("--- findArrayDiffLevels : currentPath '", currentPath, "' is array ? ", isArray)
        }

        // We increment the previous level differences
        if (diffs.length > 0) {
            diffs = diffs.map(value => value + 1);
        }

        if (isArray) {
            diffs.push(0);
        }

        if (level < path.length) {
            return this.findArrayDiffLevels(panel, path, level + 1, diffs, logsEnabled);
        }

        return diffs;
    }

    protected findCompareItem(
        sideValue: AnyValue,
        otherSideItems: ValueRecord[],
        searchKey: ValueKey
    ): FindedItemInterface {
        let itemIndex;

        if (searchKey && CompareUtils.hasProperty(sideValue, [searchKey]) &&
            CompareUtils.hasStringIndex(sideValue)
        ) {
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
        logsEnabled = false,
    ): CompareState {
        if (logsEnabled) {
            console.log('--- Compare property value', propertyPath.toString(), CompareUtils.hasProperty(otherSideObject, propertyPath) ? "exist" : "not exist");
            console.log('--- in object', otherSideObject)
        }

        if (!CompareUtils.hasProperty(otherSideObject, propertyPath)) {
            return this.getIncomparableState(panel);
        }

        const currentOtherSideValue = CompareUtils.getIn(otherSideObject, propertyPath);

        if (logsEnabled) {
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

    protected compareValues(sideValue: AnyValue, otherSideValue: AnyValue): CompareState {
        return CompareUtils.isEqual(sideValue, otherSideValue)
            ? CompareState.EQUAL
            : CompareState.UPDATED;
    }

    protected compare(panel: PanelEnum, sideValue: AnyValue | undefined, path: Path = new Path())
        : void {
        let otherSideValue: AnyValue, logsEnabled = this._logsEnabled;
        let compareState = CompareState.NONE;

        const otherPanel = panel === PanelEnum.LEFT ? PanelEnum.RIGHT : PanelEnum.LEFT;

        if (CompareUtils.isEvaluable(sideValue) && !CompareUtils.isPrimitive(sideValue)) {
            this.arrayIndex[panel].set(path.toString(), CompareUtils.isArray(sideValue));
        }

        if (logsEnabled) {
            console.log(`- [${panel}] ${path}`)
            console.log('-- Side value : ', sideValue);
        }

        const arrayDiffLevels = this.findArrayDiffLevels(panel, path, 0, [], logsEnabled);

        if (logsEnabled) {
            console.log('-- Array diffs : ', arrayDiffLevels);
        }

        let currentRoot = this.panels[panel];
        let currentOtherRoot = this.panels[otherPanel];
        let currentPath = path.clone();
        let currentSideValue = CompareUtils.deepClone(sideValue);

        if (arrayDiffLevels.length > 0) {
            arrayDiffLevels.forEach((arrayDiffLevel) => {
                const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);
                const otherSideItems = CompareUtils.getIn(currentOtherRoot, arrayPath);

                if (logsEnabled) {
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

                        if (logsEnabled) {
                            console.log('-- Array diff 0');
                            console.log('-- Property path : ', arrayPath);
                            console.log('-- Compare : ', currentSideValue);
                            console.log('-- With : ', otherSideItems);
                        }

                        compareState = this.comparePropertyValues(panel,
                            currentSideValue, currentOtherRoot, arrayPath, logsEnabled)
                    } else {
                        const searchKey = this.determineArrayIndexFn ? this.determineArrayIndexFn(currentPath) : "";
                        const objectPath = currentPath.slice(0, arrayPath.length + 1);

                        const sideObject = CompareUtils.getIn(currentRoot, objectPath) as AnyValue;

                        const itemFinded = this.findCompareItem(sideObject, otherSideItems, searchKey);
                        const otherSideObject = itemFinded.value;

                        if (logsEnabled) {
                            console.log('-- Object path : ', objectPath);
                            console.log('-- Side object : ', sideObject);
                            console.log('-- Item finded ? ', itemFinded);
                        }

                        if (otherSideObject) {
                            const propertyPath = currentPath.slice(objectPath.length);

                            if (arrayDiffLevel === 1) {
                                const index = currentPath.last();
                                if (index !== undefined) {
                                    currentSideValue = CompareUtils.getIn(sideObject, propertyPath);
                                    if (logsEnabled) {
                                        console.log('-- Array diff 1', propertyPath);
                                        console.log('-- Other side value : ', itemFinded.value);
                                        console.log('-- Indexes : ', index, itemFinded.index);
                                    }

                                    const compareIndex = this.compareValues(index, itemFinded.index);
                                    const compareValue = this.compareValues(currentSideValue, itemFinded.value);

                                    if (logsEnabled) {
                                        console.log('-- compare index : ', compareIndex.value);
                                        console.log('-- compare value : ', compareValue.value);
                                    }

                                    compareState = compareIndex.isUpdated || compareValue.isUpdated
                                        ? CompareState.UPDATED : CompareState.EQUAL;
                                }
                            } else {
                                currentSideValue = CompareUtils.getIn(sideObject, propertyPath);

                                if (logsEnabled) {
                                    otherSideValue = CompareUtils.getIn(otherSideObject, propertyPath);

                                    console.log('-- Array diff > 1', propertyPath);
                                    console.log('-- Other side object : ', otherSideObject);
                                    console.log('-- Other side value : ', otherSideValue);
                                }

                                compareState = this.comparePropertyValues(
                                    panel,
                                    currentSideValue,
                                    otherSideObject,
                                    propertyPath,
                                    logsEnabled
                                );
                            }

                            currentPath = propertyPath.clone();
                            currentRoot = CompareUtils.deepClone(sideObject);
                            currentSideValue = CompareUtils.deepClone(sideObject);
                            currentOtherRoot = CompareUtils.deepClone(otherSideObject);

                            if (logsEnabled) {
                                otherSideValue = CompareUtils.deepClone(otherSideObject);
                            }
                        } else {
                            compareState = this.getIncomparableState(panel);
                        }
                    }
                } else {
                    currentSideValue = CompareUtils.getIn(currentRoot, arrayPath);

                    if (logsEnabled) {
                        console.log('-- No other side array')
                        console.log('-- Compare', currentSideValue)
                        console.log('-- With', otherSideItems)
                    }

                    compareState = this.comparePropertyValues(panel,
                        currentSideValue, currentOtherRoot, arrayPath, logsEnabled)
                }
            });
        } else {
            compareState = this.comparePropertyValues(
                panel,
                currentSideValue,
                this.panels[otherPanel],
                path
            );

            if (logsEnabled) {
                otherSideValue = CompareUtils.getIn(this.panels[otherPanel], path);
                console.log('-- No array upside');
                console.log('-- Other side value : ', otherSideValue);
            }
        }

        if (logsEnabled) {
            console.log('-- Update state with : ', compareState.value);
        }
        this.compareStateIndex[panel].set(path.toString(), compareState);

        if (compareState.isUpdated && CompareUtils.isTree(sideValue)) {
            const keys = CompareUtils.keys(sideValue);

            if (logsEnabled) {
                console.log('-- Sub keys : ', keys);
            }

            keys.forEach((index) => {
                const subPath = path.clone().add(index);

                if (this._logsEnabled) {
                    console.log(`-- Sub path :`, path, '+', index, '=>', subPath)
                }

                const subSideValue = CompareUtils.isArray(sideValue) ?
                    sideValue[CompareUtils.parseInt(index)] : (sideValue as ValueRecord)[index];

                this.compare(panel, subSideValue, subPath)
            });
        }
    }
}
