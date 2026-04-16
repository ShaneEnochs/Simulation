import { Grid } from './grid';
import { CONFIG } from '../config';

const scratch = new Float32Array(CONFIG.GRID_WIDTH * CONFIG.GRID_HEIGHT);

function diffuseLayer(layer: Float32Array, width: number, height: number): void {
  const rate = CONFIG.DIFFUSION_RATE;
  const keep = 1 - rate;
  const share = rate / 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let sum = 0;
      if (x > 0)          sum += layer[i - 1];
      if (x < width - 1)  sum += layer[i + 1];
      if (y > 0)          sum += layer[i - width];
      if (y < height - 1) sum += layer[i + width];
      scratch[i] = layer[i] * keep + sum * share;
    }
  }

  layer.set(scratch);
}

export function evaporate(grid: Grid, multiplier: number): void {
  const { homePheromone, foodPheromone, alarmPheromone } = grid;
  for (let i = 0; i < homePheromone.length; i++) {
    homePheromone[i] *= multiplier;
    foodPheromone[i] *= multiplier;
    alarmPheromone[i] *= multiplier;
  }
}

export function diffuse(grid: Grid): void {
  diffuseLayer(grid.homePheromone, grid.width, grid.height);
  diffuseLayer(grid.foodPheromone, grid.width, grid.height);
  diffuseLayer(grid.alarmPheromone, grid.width, grid.height);
}
