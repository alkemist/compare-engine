import { CompareState } from "./compare-state.js";
import { PanelEnum } from "./panel.enum.js";
import { FindedItemInterface } from "./finded-item.interface.js";
import {
  AnyValue,
  MathHelper,
  ObjectHelper,
  Path,
  TreeHelper,
  TypeHelper,
  ValueKey,
  ValueRecord
} from '@alkemist/smart-tools';

export class CompareEngine<DATA_TYPE> {
  private readonly compareStateIndex: Record<PanelEnum, Map<string, CompareState>>;
  private readonly arrayIndex: Record<PanelEnum, Map<string, boolean>>;
  private readonly panels: Record<PanelEnum, DATA_TYPE | undefined>;

  constructor(
    protected determineArrayIndexFn?: (paths: ValueKey[]) => ValueKey,
    leftValue?: DATA_TYPE,
    rightValue?: DATA_TYPE
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

  get leftValue(): DATA_TYPE | undefined {
    return TypeHelper.deepClone(this.panels[PanelEnum.LEFT]);
  }

  get rightValue(): DATA_TYPE | undefined {
    return TypeHelper.deepClone(this.panels[PanelEnum.RIGHT]);
  }

  updateLeft(value: DATA_TYPE | undefined) {
    this.update(PanelEnum.LEFT, value);
  }

  updateInLeft(value: unknown, paths: ValueKey[] | ValueKey) {
    this.updateIn(PanelEnum.LEFT, value, paths);
  }

  updateRight(value: DATA_TYPE | undefined) {
    this.update(PanelEnum.RIGHT, value);
  }

  updateInRight(value: unknown, paths: ValueKey[] | ValueKey) {
    this.updateIn(PanelEnum.RIGHT, value, paths);
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

  getInLeft(paths: ValueKey[] | ValueKey): unknown {
    return TreeHelper.getIn(
      this.panels.left,
      TypeHelper.isArray(paths) ? paths : [ paths ]
    );
  }

  getLeftState(paths: ValueKey[] | ValueKey): CompareState {
    return this.getState(PanelEnum.LEFT, paths);
  }

  getInRight<T = unknown>(paths: ValueKey[] | ValueKey): T {
    return TreeHelper.getIn(
      this.panels.right,
      TypeHelper.isArray(paths) ? paths : [ paths ]
    ) as T;
  }

  getRightState(paths: ValueKey[] | ValueKey): CompareState {
    return this.getState(PanelEnum.RIGHT, paths);
  }

  protected getState(panel: PanelEnum, paths: ValueKey[] | ValueKey): CompareState {
    const path = Path.from(TypeHelper.isArray(paths) ? paths : [ paths ]);

    if (this._logsEnabled) {
      console.log(`- [${ panel }] Get state :`, paths, path)
    }

    return this.compareStateIndex[panel].get(
      path.toString()
    ) ?? CompareState.NONE;
  }

  protected update(panel: PanelEnum, value: DATA_TYPE | undefined): void {
    this.panels[panel] = TypeHelper.deepClone(value);
    this.arrayIndex[panel].clear();
  }

  protected updateIn(panel: PanelEnum, value: unknown, paths: ValueKey[] | ValueKey): void {
    TreeHelper.setIn(this.panels[panel], paths, TypeHelper.deepClone(value));
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

    if (searchKey && TreeHelper.hasProperty(sideValue, [ searchKey ]) &&
      ObjectHelper.hasStringIndex(sideValue)
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
    sideValue: unknown,
    otherSideObject: unknown,
    propertyPath: Path,
    logsEnabled = false,
  ): CompareState {
    if (logsEnabled) {
      console.log('--- Compare property value', propertyPath.toString(), TreeHelper.hasProperty(otherSideObject, propertyPath) ? "exist" : "not exist");
      console.log('--- in object', otherSideObject)
    }

    if (!TreeHelper.hasProperty(otherSideObject, propertyPath)) {
      return this.getIncomparableState(panel);
    }

    const currentOtherSideValue = TreeHelper.getIn(otherSideObject, propertyPath);

    if (logsEnabled) {
      console.log('--- Is equal ?', TypeHelper.isEqual(sideValue, currentOtherSideValue));
      console.log('--- Other side value', currentOtherSideValue);
    }

    return TypeHelper.isEqual(sideValue, currentOtherSideValue)
      ? CompareState.EQUAL
      : CompareState.UPDATED;
  }

  protected getIncomparableState(panel: PanelEnum) {
    return panel === PanelEnum.LEFT ? CompareState.REMOVED : CompareState.ADDED;
  }

  protected compareValues(sideValue: unknown, otherSideValue: AnyValue): CompareState {
    return TypeHelper.isEqual(sideValue, otherSideValue)
      ? CompareState.EQUAL
      : CompareState.UPDATED;
  }

  protected compare(panel: PanelEnum, sideValue: unknown, path: Path = new Path())
    : void {
    let otherSideValue: unknown, logsEnabled = this._logsEnabled;
    let compareState = CompareState.NONE;

    const otherPanel = panel === PanelEnum.LEFT ? PanelEnum.RIGHT : PanelEnum.LEFT;

    if (TypeHelper.isEvaluable(sideValue) && !TypeHelper.isPrimitive(sideValue)) {
      this.arrayIndex[panel].set(path.toString(), TypeHelper.isArray(sideValue));
    }

    if (logsEnabled) {
      console.log(`- [${ panel }] ${ path }`)
      console.log('-- Side value : ', sideValue);
    }

    const arrayDiffLevels = this.findArrayDiffLevels(panel, path, 0, [], logsEnabled);

    if (logsEnabled) {
      console.log('-- Array diffs : ', arrayDiffLevels);
    }

    let currentRoot: unknown | undefined = this.panels[panel];
    let currentOtherRoot: unknown | undefined = this.panels[otherPanel];
    let currentPath = path.clone();
    let currentSideValue = TypeHelper.deepClone(sideValue);

    if (arrayDiffLevels.length > 0) {
      arrayDiffLevels.forEach((arrayDiffLevel) => {
        const arrayPath = currentPath.slice(0, currentPath.length - arrayDiffLevel);
        const otherSideItems = TreeHelper.getIn(currentOtherRoot, arrayPath);

        if (logsEnabled) {
          console.log('--- Current array diff : ', arrayDiffLevel)
          console.log('--- Current root : ', currentRoot)
          console.log('--- Current side value : ', currentSideValue)
          console.log('--- Array path : ', arrayPath)
          console.log('--- Other side items : ', otherSideItems)
          console.log('--- Other side is array ?', TypeHelper.isArray<ValueRecord>(otherSideItems))
        }

        if (TypeHelper.isArray<ValueRecord>(otherSideItems)) {
          if (arrayDiffLevel === 0) {
            currentSideValue = TreeHelper.getIn(currentRoot, arrayPath);

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

            const sideObject = TreeHelper.getIn(currentRoot, objectPath) as AnyValue;

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
                  currentSideValue = TreeHelper.getIn(sideObject, propertyPath);
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

                  if (compareIndex.isUpdated && compareValue.isEqual) {
                    compareState = CompareState.MOVED;
                  } else if (compareValue.isUpdated) {
                    compareState = CompareState.UPDATED
                  } else {
                    compareState = CompareState.EQUAL;
                  }
                }
              } else {
                currentSideValue = TreeHelper.getIn(sideObject, propertyPath);

                if (logsEnabled) {
                  otherSideValue = TreeHelper.getIn(otherSideObject, propertyPath);

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
              currentRoot = TypeHelper.deepClone(sideObject);
              currentSideValue = TypeHelper.deepClone(sideObject);
              currentOtherRoot = TypeHelper.deepClone(otherSideObject);

              if (logsEnabled) {
                otherSideValue = TypeHelper.deepClone(otherSideObject);
              }
            } else {
              compareState = this.getIncomparableState(panel);
            }
          }
        } else {
          currentSideValue = TreeHelper.getIn(currentRoot, arrayPath);

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
        otherSideValue = TreeHelper.getIn(this.panels[otherPanel], path);
        console.log('-- No array upside');
        console.log('-- Other side value : ', otherSideValue);
      }
    }

    if (logsEnabled) {
      console.log('-- Update state with : ', compareState.value);
    }
    this.compareStateIndex[panel].set(path.toString(), compareState);

    if (compareState.isUpdated && TypeHelper.isTree(sideValue)) {
      const keys = TreeHelper.keys(sideValue);

      if (logsEnabled) {
        console.log('-- Sub keys : ', keys);
      }

      keys.forEach((index) => {
        const subPath = path.clone().add(index);

        if (this._logsEnabled) {
          console.log(`-- Sub path :`, path, '+', index, '=>', subPath)
        }

        const subSideValue = TypeHelper.isArray(sideValue) ?
          sideValue[MathHelper.parseInt(index)] : (sideValue as ValueRecord)[index];

        this.compare(panel, subSideValue, subPath)
      });
    }
  }
}
