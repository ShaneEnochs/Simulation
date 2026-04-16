import { CONFIG } from '../config';

export class Grid {
  readonly width: number;
  readonly height: number;
  readonly homePheromone: Float32Array;
  readonly foodPheromone: Float32Array;
  readonly alarmPheromone: Float32Array;
  readonly cellType: Uint8Array;

  constructor(width = CONFIG.GRID_WIDTH, height = CONFIG.GRID_HEIGHT) {
    this.width = width;
    this.height = height;
    const size = width * height;
    this.homePheromone = new Float32Array(size);
    this.foodPheromone = new Float32Array(size);
    this.alarmPheromone = new Float32Array(size);
    this.cellType = new Uint8Array(size);
  }

  index(x: number, y: number): number {
    return y * this.width + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getCellType(x: number, y: number): number {
    if (!this.inBounds(x, y)) return 1;
    return this.cellType[this.index(x, y)];
  }
}
