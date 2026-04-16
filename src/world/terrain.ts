import { Grid } from './grid';

// Cell type constants
export const CELL_EMPTY = 0;
export const CELL_ROCK = 1;
export const CELL_WATER = 2;

export function setCellType(grid: Grid, x: number, y: number, type: number): void {
  if (!grid.inBounds(x, y)) return;
  grid.cellType[grid.index(x, y)] = type;
}

export function paintTerrain(
  grid: Grid,
  cx: number,
  cy: number,
  radius: number,
  type: number
): void {
  const r = Math.ceil(radius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        setCellType(grid, cx + dx, cy + dy, type);
      }
    }
  }
}
