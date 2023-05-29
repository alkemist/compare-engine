import { CompareState } from "./compare-state";
import { PanelEnum } from "./panel.enum";
import { JsonObject, JsonValue } from "./json-value.interface";
import { FindedItemInterface } from "./finded-item.interface";
import { JsonPath } from "./json-path";
export declare class CompareEngine {
    protected determineArrayIndexFn?: ((paths: string[]) => string) | undefined;
    protected compareStateIndex: Record<PanelEnum, Map<string, CompareState>>;
    protected arrayIndex: Record<PanelEnum, Map<string, boolean>>;
    protected jsonPanels: Record<PanelEnum, JsonValue>;
    constructor(determineArrayIndexFn?: ((paths: string[]) => string) | undefined);
    updateLeft(json: JsonValue): void;
    updateRight(json: JsonValue): void;
    updateCompareIndex(): void;
    hasChange(): boolean;
    getLeftState(path: string[] | string): CompareState;
    getRightState(path: string[] | string): CompareState;
    protected getState(panel: PanelEnum, path: string[] | string): CompareState;
    protected update(panel: PanelEnum, json: JsonValue): void;
    protected findArrayDiffLevels(panel: PanelEnum, path: JsonPath, level?: number, diffs?: number[]): number[];
    protected findCompareItem(sideValue: JsonValue, otherSideItems: JsonObject[], searchKey: string): FindedItemInterface;
    protected compareValues(panel: PanelEnum, sideValue?: JsonValue, otherSideValue?: JsonValue): CompareState;
    protected compare(panel: PanelEnum, sideValue: JsonValue | undefined, otherSideValue: JsonValue | undefined, path?: JsonPath): void;
}
//# sourceMappingURL=compare-engine.d.ts.map