export type JsonPrimitive = string | number | boolean | null | undefined;
export type JsonObject = {
    [key: string]: JsonValue;
};
export type JsonArray = JsonValue[];
export type JsonValue = JsonObject | JsonArray | JsonPrimitive;