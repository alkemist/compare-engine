export class JsonPath extends Array<string> {
    override toString(): string {
        return this.join('/');
    }

    slice(start?: number, end?: number): JsonPath {
        return new JsonPath(...super.slice(start, end));
    }

    add(el: string | number): JsonPath {
        super.push(el.toString());
        return this;
    }

    clone(): JsonPath {
        return this.slice();
    }
}