export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = {
    [key: string]: JsonValue;
};
export type JsonArray = JsonValue[];
export type JsonValue = JsonObject | JsonArray | JsonPrimitive;
//# sourceMappingURL=json-value.interface.d.ts.map