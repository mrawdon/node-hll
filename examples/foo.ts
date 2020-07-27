import HLL from "../src";

const hll = new HLL(5);

// Add item to hll counter.
hll.add('1');
hll.add(Buffer.from('2'));

console.log(hll.bits);
console.log(hll.count());
console.log(hll.toBuffer());

// Create HLL from buffer.
console.log(new HLL(hll.toBuffer()).count());

const hll2 = new HLL(5);
hll2.add('3');

console.log('HLL.merge', HLL.merge(hll2, hll).count(), hll2.count());

hll2.merge(hll);
console.log(hll2.count());

const hll3 = new HLL(5);
hll3.add('8');
hll3.add('1');

console.log(HLL.intersectionSize([hll, hll2]));
console.log(HLL.intersectionSize([hll, hll2, hll3]));