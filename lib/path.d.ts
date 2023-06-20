import { ValueKey } from "./value.interface.js";
export declare class Path extends Array<ValueKey> {
    add(el: ValueKey): Path;
    clone(): Path;
    slice(start?: number, end?: number): Path;
    toString(): string;
    last(): ValueKey | undefined;
}
//# sourceMappingURL=path.d.ts.map