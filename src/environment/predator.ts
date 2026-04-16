import { CONFIG } from '../config';
import { Grid } from '../world/grid';
import { AgentPool } from '../agents/agentPool';
import { rand } from '../utils/rng';

export interface Predator {
  active: boolean;
  x: number;
  y: number;
  heading: number;
  lifetime: number;
}

export class PredatorManager {
  readonly predators: Predator[] = [];

  spawn(gridW: number, gridH: number): void {
    const side = Math.floor(rand() * 4);
    let x = 0, y = 0;
    if (side === 0) { x = rand() * gridW; y = 0; }
    else if (side === 1) { x = rand() * gridW; y = gridH - 1; }
    else if (side === 2) { x = 0; y = rand() * gridH; }
    else { x = gridW - 1; y = rand() * gridH; }

    this.predators.push({
      active: true,
      x, y,
      heading: rand() * Math.PI * 2,
      lifetime: CONFIG.PREDATOR_LIFETIME,
    });
  }

  update(grid: Grid, pool: AgentPool): void {
    for (const pred of this.predators) {
      if (!pred.active) continue;
      pred.lifetime--;
      if (pred.lifetime <= 0) { pred.active = false; continue; }

      // Bias toward high pheromone areas
      const samplePh = (ox: number, oy: number): number => {
        const sx = Math.round(pred.x + ox);
        const sy = Math.round(pred.y + oy);
        if (!grid.inBounds(sx, sy)) return 0;
        const i = grid.index(sx, sy);
        return grid.homePheromone[i] + grid.foodPheromone[i];
      };

      const fwd = CONFIG.PREDATOR_SPEED * 3;
      const fl = samplePh(Math.cos(pred.heading - 0.4) * fwd, Math.sin(pred.heading - 0.4) * fwd);
      const fc = samplePh(Math.cos(pred.heading) * fwd, Math.sin(pred.heading) * fwd);
      const fr = samplePh(Math.cos(pred.heading + 0.4) * fwd, Math.sin(pred.heading + 0.4) * fwd);

      if (fc >= fl && fc >= fr) {
        pred.heading += (rand() - 0.5) * 0.3;
      } else if (fl > fr) {
        pred.heading -= 0.3 + rand() * 0.2;
      } else {
        pred.heading += 0.3 + rand() * 0.2;
      }

      pred.x += Math.cos(pred.heading) * CONFIG.PREDATOR_SPEED;
      pred.y += Math.sin(pred.heading) * CONFIG.PREDATOR_SPEED;
      pred.x = Math.max(0, Math.min(grid.width - 0.01, pred.x));
      pred.y = Math.max(0, Math.min(grid.height - 0.01, pred.y));

      // Kill nearby agents and emit alarm pheromone
      const r2 = CONFIG.PREDATOR_RADIUS * CONFIG.PREDATOR_RADIUS;
      pool.forEachActive(agent => {
        const dx = agent.x - pred.x;
        const dy = agent.y - pred.y;
        if (dx * dx + dy * dy <= r2) {
          // Burst of alarm pheromone at agent position
          const ax = Math.floor(agent.x);
          const ay = Math.floor(agent.y);
          if (grid.inBounds(ax, ay)) {
            const idx = grid.index(ax, ay);
            grid.alarmPheromone[idx] = Math.min(CONFIG.MAX_PHEROMONE, grid.alarmPheromone[idx] + 30);
          }
          agent.active = false;
        }
      });
    }

    // Compact inactive predators
    for (let i = this.predators.length - 1; i >= 0; i--) {
      if (!this.predators[i].active) this.predators.splice(i, 1);
    }
  }

  count(): number {
    return this.predators.filter(p => p.active).length;
  }
}
