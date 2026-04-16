export function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

let _rng = mulberry32(0xC0FFEE);

export function seedRng(seed: number): void {
  _rng = mulberry32(seed);
}

export function rand(): number {
  return _rng();
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randRange(min: number, max: number): number {
  return rand() * (max - min) + min;
}
