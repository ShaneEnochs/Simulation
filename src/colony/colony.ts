import { CONFIG } from '../config';
import type { Genes } from '../types';
import { AgentPool } from '../agents/agentPool';
import { crossover, mutate } from '../agents/genetics';
import { rand } from '../utils/rng';

export class Colony {
  energy: number;
  maxGeneration: number;
  totalFoodCollected: number;
  readonly nestX: number;
  readonly nestY: number;
  avgGenes: Genes;
  isGameOver: boolean;
  ticksSinceLastRepro: number;
  ticksSinceAvgUpdate: number;
  private gen1Genes: Genes | null = null;

  constructor(nestX: number, nestY: number) {
    this.nestX = nestX;
    this.nestY = nestY;
    this.energy = CONFIG.INITIAL_COLONY_ENERGY;
    this.maxGeneration = 0;
    this.totalFoodCollected = 0;
    this.isGameOver = false;
    this.ticksSinceLastRepro = 0;
    this.ticksSinceAvgUpdate = 0;
    this.avgGenes = {
      sensorAngle: 0.5, sensorDistance: 0.5, rotationSpeed: 0.5,
      speed: 0.5, depositRate: 0.5, hue: 0.5,
    };
  }

  addFood(amount: number): void {
    this.energy += amount;
    this.totalFoodCollected += amount;
  }

  tick(pool: AgentPool, onLog: (msg: string) => void): void {
    if (this.isGameOver) return;
    const pop = pool.count();
    this.energy -= CONFIG.COLONY_DRAIN_PER_AGENT * pop;

    // Game over if no agents AND not enough energy for reproduction to matter
    if (pop === 0 && this.energy < CONFIG.REPRODUCTION_THRESHOLD) {
      this.isGameOver = true;
      onLog('Colony has died. All agents lost.');
      return;
    }

    this.ticksSinceLastRepro++;
    this.ticksSinceAvgUpdate++;

    // Reproduce up to 3 per second (every ~20 ticks)
    if (
      this.energy > CONFIG.REPRODUCTION_THRESHOLD + CONFIG.REPRODUCTION_COST &&
      this.ticksSinceLastRepro >= 20 &&
      pop < CONFIG.MAX_AGENTS
    ) {
      this.reproduce(pool, onLog);
    }

    // Update avg genes every 30 ticks
    if (this.ticksSinceAvgUpdate >= 30) {
      this.updateAvgGenes(pool);
      this.ticksSinceAvgUpdate = 0;
    }
  }

  private reproduce(pool: AgentPool, onLog: (msg: string) => void): void {
    const candidates: { genes: Genes; age: number; generation: number }[] = [];
    pool.forEachActive(a => candidates.push({ genes: a.genes, age: a.age, generation: a.generation }));
    if (candidates.length < 2) return;

    // Weight by age
    const totalWeight = candidates.reduce((s, c) => s + c.age + 1, 0);
    const pickParent = (): typeof candidates[0] => {
      let r = rand() * totalWeight;
      for (const c of candidates) {
        r -= c.age + 1;
        if (r <= 0) return c;
      }
      return candidates[candidates.length - 1];
    };

    const parentA = pickParent();
    const parentB = pickParent();
    const childGenes = mutate(crossover(parentA.genes, parentB.genes));
    const newGen = Math.max(parentA.generation, parentB.generation) + 1;

    pool.spawn(this.nestX, this.nestY, childGenes, newGen);
    this.energy -= CONFIG.REPRODUCTION_COST;
    this.ticksSinceLastRepro = 0;

    if (newGen > this.maxGeneration) {
      this.maxGeneration = newGen;
      onLog(`Generation ${newGen} reached`);
      if (newGen === 1) {
        this.gen1Genes = { ...childGenes };
      }
      if (newGen === 30) {
        onLog('Your colony has thrived.');
      }
    }
  }

  getGen1Genes(): Genes | null {
    return this.gen1Genes;
  }

  private updateAvgGenes(pool: AgentPool): void {
    let count = 0;
    const sum: Genes = { sensorAngle: 0, sensorDistance: 0, rotationSpeed: 0, speed: 0, depositRate: 0, hue: 0 };
    pool.forEachActive(a => {
      count++;
      sum.sensorAngle += a.genes.sensorAngle;
      sum.sensorDistance += a.genes.sensorDistance;
      sum.rotationSpeed += a.genes.rotationSpeed;
      sum.speed += a.genes.speed;
      sum.depositRate += a.genes.depositRate;
      sum.hue += a.genes.hue;
    });
    if (count === 0) return;
    this.avgGenes = {
      sensorAngle: sum.sensorAngle / count,
      sensorDistance: sum.sensorDistance / count,
      rotationSpeed: sum.rotationSpeed / count,
      speed: sum.speed / count,
      depositRate: sum.depositRate / count,
      hue: sum.hue / count,
    };
  }
}
