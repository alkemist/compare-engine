export class Path extends Array<string> {

    add(el: string | number): Path {
        super.push(el.toString());
        return this;
    }

    clone(): Path {
        return this.slice();
    }

    override slice(start?: number, end?: number): Path {
        return new Path(...super.slice(start, end));
    }

    override toString(): string {
        return this.join('/');
    }
}