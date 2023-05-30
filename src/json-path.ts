export class JsonPath extends Array<string> {

    add(el: string | number): JsonPath {
        super.push(el.toString());
        return this;
    }

    clone(): JsonPath {
        return this.slice();
    }

    override slice(start?: number, end?: number): JsonPath {
        return new JsonPath(...super.slice(start, end));
    }

    override toString(): string {
        return this.join('/');
    }
}