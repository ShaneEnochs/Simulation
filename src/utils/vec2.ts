export function vec2Add(ax: number, ay: number, bx: number, by: number): [number, number] {
  return [ax + bx, ay + by];
}

export function vec2Scale(x: number, y: number, s: number): [number, number] {
  return [x * s, y * s];
}

export function vec2Length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function vec2Normalize(x: number, y: number): [number, number] {
  const len = vec2Length(x, y);
  if (len === 0) return [0, 0];
  return [x / len, y / len];
}

export function vec2FromAngle(angle: number): [number, number] {
  return [Math.cos(angle), Math.sin(angle)];
}
