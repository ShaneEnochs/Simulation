import type { FoodSource } from '../types';
import { CONFIG } from '../config';
import { Grid } from '../world/grid';

export class FoodManager {
  readonly sources: FoodSource[] = [];

  placeFood(x: number, y: number, type: FoodSource['type'], grid: Grid): void {
    const existing = this.sources.find(f => f.x === x && f.y === y);
    if (existing) return;

    const maxAmount = type === 'rich'
      ? CONFIG.RICH_FOOD_AMOUNT
      : CONFIG.DEFAULT_FOOD_AMOUNT;

    this.sources.push({ x, y, amount: maxAmount, maxAmount, type });

    // Pulse food pheromone in a radius to make discovery feel responsive
    const radius = 3;
    const pulse = CONFIG.MAX_PHEROMONE / 2;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          const px = x + dx;
          const py = y + dy;
          if (grid.inBounds(px, py)) {
            const idx = grid.index(px, py);
            grid.foodPheromone[idx] = Math.min(CONFIG.MAX_PHEROMONE, grid.foodPheromone[idx] + pulse);
          }
        }
      }
    }
  }

  removeFood(x: number, y: number): void {
    const idx = this.sources.findIndex(f => f.x === x && f.y === y);
    if (idx !== -1) this.sources.splice(idx, 1);
  }

  consumeAt(x: number, y: number): FoodSource['type'] | null {
    for (let i = 0; i < this.sources.length; i++) {
      const f = this.sources[i];
      if (f.x === x && f.y === y) {
        if (f.type === 'poison') return 'poison';
        f.amount -= CONFIG.FOOD_PICKUP_AMOUNT;
        if (f.amount <= 0) {
          this.sources.splice(i, 1);
        }
        return f.type;
      }
    }
    return null;
  }

  hasFood(x: number, y: number): boolean {
    return this.sources.some(f => f.x === x && f.y === y);
  }
}
