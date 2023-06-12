import {CompareState} from "./compare-state.js";
import {PanelEnum} from "./panel.enum.js";
import {AnyValue, ValueRecord} from "./value.interface.js";
import {FindedItemInterface} from "./finded-item.interface.js";
import {Path} from "./path.js";

export declare class CompareEngine {
    protected determineArrayIndexFn?: ((paths: string[]) => string) | undefined;
    private readonly compareStateIndex;
    private readonly arrayIndex;
    private readonly panels;

    constructor(determineArrayIndexFn?: ((paths: string[]) => string) | undefined, leftValue?: AnyValue, rightValue?: AnyValue);

    get leftValue(): AnyValue;

    get rightValue(): AnyValue;

    updateLeft(value: AnyValue): void;

    updateRight(value: AnyValue): void;

    leftToRight(): void;

    rightToLeft(): void;

    updateCompareIndex(): void;

    hasChange(): boolean;

    getLeftState(path: string[] | string): CompareState;

    getRightState(path: string[] | string): CompareState;

    protected getState(panel: PanelEnum, path: string[] | string): CompareState;

    protected update(panel: PanelEnum, value: AnyValue): void;

    protected findArrayDiffLevels(panel: PanelEnum, path: Path, level?: number, diffs?: number[]): number[];

    protected findCompareItem(sideValue: AnyValue, otherSideItems: ValueRecord[], searchKey: string): FindedItemInterface;

    protected comparePropertyValues(panel: PanelEnum, sideValue: AnyValue, otherSideObject: AnyValue, propertyPath: Path, showLog?: boolean): CompareState;

    protected getIncomparableState(panel: PanelEnum): CompareState;

    protected compareValues(panel: PanelEnum, sideValue: AnyValue, otherSideValue: AnyValue): CompareState;

    protected compare(panel: PanelEnum, sideValue: AnyValue | undefined, path?: Path): void;
}

//# sourceMappingURL=compare-engine.d.ts.map