export default class SectionNumber {

    n: number;
    a: Array<number>;

    constructor(n = 3) {
        this.n = n;
        this.a = Array(n).fill(0) as Array<number>;
    }

    asString(source: string) {
        const numbers = source.split('-');
        if(!numbers || numbers.length != this.n) return;

        for(let i = 0; i < numbers.length; i++) {
            this.a[i] = +numbers[i]!;
        }
    }

    next(depth: number = this.n - 1) {
        if(depth < 0 || depth >= this.n) return;

        this.a[depth]!++;
        for(let i = depth + 1; i < this.n; i++) {
            this.a[i] = 0;
        }
    }

    safeNext(depth: number = this.n - 1) : boolean {
        if(depth < 0 || depth >= this.n) return false;
        if(this.a[depth - 1] == 0) return false;

        return true;
    }

    toString() : string {
        let result = this.a[0]?.toString() || '';
        for(let i = 1; i < this.n; i++) {
            result = result + '-' + this.a[i];
        }
        return result;
    }

}