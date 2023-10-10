import { CompareState } from "./compare-state.js";
import { PanelEnum } from "./panel.enum.js";
import { FindedItemInterface } from "./finded-item.interface.js";
import { AnyValue, Path, ValueKey, ValueRecord } from '@alkemist/smart-tools';
export declare class CompareEngine<DATA_TYPE> {
    protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined;
    private readonly compareStateIndex;
    private readonly arrayIndex;
    private readonly panels;
    constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, leftValue?: DATA_TYPE, rightValue?: DATA_TYPE);
    private _logsEnabled;
    set logsEnabled(logsEnabled: boolean);
    get leftValue(): DATA_TYPE | undefined;
    get rightValue(): DATA_TYPE | undefined;
    updateLeft(value: DATA_TYPE | undefined): void;
    updateInLeft(value: unknown, paths: ValueKey[] | ValueKey): void;
    updateRight(value: DATA_TYPE | undefined): void;
    updateInRight(value: unknown, paths: ValueKey[] | ValueKey): void;
    leftToRight(): void;
    rightToLeft(): void;
    updateCompareIndex(): void;
    hasChange(): boolean;
    getInLeft(paths: ValueKey[] | ValueKey): unknown;
    getLeftState(paths: ValueKey[] | ValueKey): CompareState;
    getInRight<T = unknown>(paths: ValueKey[] | ValueKey): T;
    getRightState(paths: ValueKey[] | ValueKey): CompareState;
    protected getState(panel: PanelEnum, paths: ValueKey[] | ValueKey): CompareState;
    protected update(panel: PanelEnum, value: DATA_TYPE | undefined): void;
    protected updateIn(panel: PanelEnum, value: unknown, paths: ValueKey[] | ValueKey): void;
    protected findArrayDiffLevels(panel: PanelEnum, path: Path, level?: number, diffs?: number[], logsEnabled?: boolean): number[];
    protected findCompareItem(sideValue: AnyValue, otherSideItems: ValueRecord[], searchKey: ValueKey): FindedItemInterface;
    protected comparePropertyValues(panel: PanelEnum, sideValue: unknown, otherSideObject: unknown, propertyPath: Path, logsEnabled?: boolean): CompareState;
    protected getIncomparableState(panel: PanelEnum): CompareState;
    protected compareValues(sideValue: unknown, otherSideValue: AnyValue): CompareState;
    protected compare(panel: PanelEnum, sideValue: unknown, path?: Path): void;
}
//# sourceMappingURL=compare-engine.d.ts.map