export interface Genes {
  sensorAngle: number;
  sensorDistance: number;
  rotationSpeed: number;
  speed: number;
  depositRate: number;
  hue: number;
}

export interface Agent {
  active: boolean;
  x: number;
  y: number;
  heading: number;
  carryingFood: boolean;
  energy: number;
  age: number;
  genes: Genes;
  generation: number;
}

export type CellType = 'empty' | 'rock' | 'water';

export interface FoodSource {
  x: number;
  y: number;
  amount: number;
  maxAmount: number;
  type: 'basic' | 'rich' | 'poison';
}

export type Tool = 'food' | 'rock' | 'water' | 'erase' | 'inspect' | 'feed';

export type EventType = 'rain' | 'predator';
