import HllBinding, { IHllBinding } from './bindings';

export default class HLL{
    private _bits:number;
    private _hll: IHllBinding;
    constructor(arg: Buffer | number) {
        if (Buffer.isBuffer(arg)) {
            const bits = Math.log2(arg.length);
            if (bits === Math.round(bits) && 4 <= bits && bits <= 20) {
                this._bits = bits;
                this._hll = new HllBinding(arg);
            } else {
                throw new Error('[HLL ctor] Invalid args.');
            }
        } else if (4 <= arg && arg <= 20) {
            this._bits = arg;
            this._hll = new HllBinding(arg);
        } else {
            throw new Error('[HLL ctor] Invalid args.');
        }
    }

    get bits() {
        return this._bits;
    }

    toBuffer() {
        return this._hll.toBuffer();
    }

    add(item: string | Buffer) {
        if (typeof item === 'string' || Buffer.isBuffer(item)) {
            this._hll.add(item);
        } else {
            throw new Error('[HLL add] Invalid args.');
        }

        return this;
    }

    count() {
        return this._hll.count();
    }

    /*
     * In place merge.
     */
    merge(hll: HLL) {
        if (hll instanceof HLL) {
            if (hll.bits !== this.bits) {
                throw new Error('[HLL merge] Hlls should have same bits.');
            }

            this._hll.merge(hll._hll);
        } else {
            throw new Error('[HLL merge] Invalid args.');
        }

        return this;
    }

    clone() {
        const r = new HLL(this.bits);
        return r.merge(this);
    }

    /*
     * Returns a new hll that is h1 u h2.
     */
    static merge(h1: HLL, h2: HLL) {
        return h1.clone().merge(h2);
    }

    /*
     * |A n B| = |A| + |B| - |A u B|
     * in the below, we set A = head, and B = tail.
     * then note that A u (B0 n B1 n ...) = (B0 u A) n (B1 u A) n ...
     * the latter we can compute with tail.map { _ + A } using the HLLInstance +
     * since + on HLLInstance creates the instance for the union.
     */
    static intersectionSize(hlls:HLL[]): number {
        if (hlls.length === 0) throw new Error('[HLL intersectionSize] Invalid args.');
        if (hlls.length === 1) return hlls[0].count();

        const head = hlls[0];
        const tail = hlls.slice(1);

        const ret = head.count() +
            HLL.intersectionSize(tail) -
            HLL.intersectionSize(tail.map(h => h.clone().merge(head)));

        return Math.max(ret, 0);
    }
};