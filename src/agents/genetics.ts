import type { Genes } from '../types';
import { CONFIG } from '../config';
import { rand, randRange } from '../utils/rng';

export function decodeGene(value: number, min: number, max: number): number {
  return min + value * (max - min);
}

export function randomGenes(): Genes {
  return {
    sensorAngle: rand(),
    sensorDistance: rand(),
    rotationSpeed: rand(),
    speed: rand(),
    depositRate: rand(),
    hue: rand(),
  };
}

export function mutate(genes: Genes): Genes {
  const mutateGene = (v: number): number => {
    if (rand() < CONFIG.MUTATION_RATE) {
      v += randRange(-CONFIG.MUTATION_AMOUNT, CONFIG.MUTATION_AMOUNT);
    }
    return Math.min(1, Math.max(0, v));
  };
  return {
    sensorAngle: mutateGene(genes.sensorAngle),
    sensorDistance: mutateGene(genes.sensorDistance),
    rotationSpeed: mutateGene(genes.rotationSpeed),
    speed: mutateGene(genes.speed),
    depositRate: mutateGene(genes.depositRate),
    hue: mutateGene(genes.hue),
  };
}

export function crossover(a: Genes, b: Genes): Genes {
  const pick = (av: number, bv: number) => rand() < 0.5 ? av : bv;
  return {
    sensorAngle: pick(a.sensorAngle, b.sensorAngle),
    sensorDistance: pick(a.sensorDistance, b.sensorDistance),
    rotationSpeed: pick(a.rotationSpeed, b.rotationSpeed),
    speed: pick(a.speed, b.speed),
    depositRate: pick(a.depositRate, b.depositRate),
    hue: pick(a.hue, b.hue),
  };
}
