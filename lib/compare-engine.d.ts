import {CompareState} from "./compare-state.js";
import {PanelEnum} from "./panel.enum.js";
import {AnyValue, ValueKey, ValueRecord} from "./value.interface.js";
import {FindedItemInterface} from "./finded-item.interface.js";
import {Path} from "./path.js";

export declare class CompareEngine {
    protected determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined;
    private readonly compareStateIndex;
    private readonly arrayIndex;
    private readonly panels;

    constructor(determineArrayIndexFn?: ((paths: ValueKey[]) => ValueKey) | undefined, leftValue?: AnyValue, rightValue?: AnyValue);

    private _logsEnabled;
    set logsEnabled(logsEnabled: boolean);

    get leftValue(): AnyValue;

    get rightValue(): AnyValue;

    updateLeft(value: AnyValue): void;

    updateRight(value: AnyValue): void;

    leftToRight(): void;

    rightToLeft(): void;

    updateCompareIndex(): void;

    hasChange(): boolean;

    getLeftState(path: ValueKey[] | ValueKey): CompareState;

    getRightState(path: ValueKey[] | ValueKey): CompareState;

    protected getState(panel: PanelEnum, paths: ValueKey[] | ValueKey): CompareState;

    protected update(panel: PanelEnum, value: AnyValue): void;

    protected findArrayDiffLevels(panel: PanelEnum, path: Path, level?: number, diffs?: number[], logsEnabled?: boolean): number[];

    protected findCompareItem(sideValue: AnyValue, otherSideItems: ValueRecord[], searchKey: ValueKey): FindedItemInterface;

    protected comparePropertyValues(panel: PanelEnum, sideValue: AnyValue, otherSideObject: AnyValue, propertyPath: Path, logsEnabled?: boolean): CompareState;

    protected getIncomparableState(panel: PanelEnum): CompareState;

    protected compareValues(sideValue: AnyValue, otherSideValue: AnyValue): CompareState;

    protected compare(panel: PanelEnum, sideValue: AnyValue | undefined, path?: Path): void;
}

//# sourceMappingURL=compare-engine.d.ts.map