import type { Agent, Genes } from '../types';
import { Grid } from '../world/grid';
import { CONFIG } from '../config';
import { decodeGene } from './genetics';
import { rand } from '../utils/rng';
import { Colony } from '../colony/colony';
import { FoodManager } from '../environment/food';

export function createAgent(
  x: number,
  y: number,
  genes: Genes,
  generation: number
): Agent {
  return {
    active: true,
    x,
    y,
    heading: rand() * Math.PI * 2,
    carryingFood: false,
    energy: CONFIG.AGENT_INITIAL_ENERGY,
    age: 0,
    genes,
    generation,
  };
}

function samplePheromone(
  layer: Float32Array,
  grid: Grid,
  x: number,
  y: number,
  heading: number,
  angleOffset: number,
  distance: number
): number {
  const angle = heading + angleOffset;
  const sx = Math.round(x + Math.cos(angle) * distance);
  const sy = Math.round(y + Math.sin(angle) * distance);
  if (!grid.inBounds(sx, sy)) return 0;
  return layer[grid.index(sx, sy)];
}

export function updateAgent(
  agent: Agent,
  grid: Grid,
  colony: Colony,
  foodManager: FoodManager
): void {
  agent.age++;
  agent.energy -= CONFIG.AGENT_ENERGY_DRAIN;

  if (agent.energy <= 0 || agent.age > CONFIG.AGENT_MAX_AGE) {
    agent.active = false;
    return;
  }

  const g = agent.genes;
  const sensorAngle = decodeGene(g.sensorAngle, 0.17, 1.05);
  const sensorDist = decodeGene(g.sensorDistance, 3, 15);
  const rotSpeed = decodeGene(g.rotationSpeed, 0.1, 1.5);
  const speed = decodeGene(g.speed, 0.3, 1.5);
  const depositRate = decodeGene(g.depositRate, 0.5, 5.0);

  // Sense pheromones
  const followLayer = agent.carryingFood ? grid.homePheromone : grid.foodPheromone;
  const left   = samplePheromone(followLayer, grid, agent.x, agent.y, agent.heading, -sensorAngle, sensorDist);
  const center = samplePheromone(followLayer, grid, agent.x, agent.y, agent.heading, 0, sensorDist);
  const right  = samplePheromone(followLayer, grid, agent.x, agent.y, agent.heading, sensorAngle, sensorDist);

  // Alarm sense — negative (flee)
  const alarmL = samplePheromone(grid.alarmPheromone, grid, agent.x, agent.y, agent.heading, -sensorAngle, sensorDist);
  const alarmC = samplePheromone(grid.alarmPheromone, grid, agent.x, agent.y, agent.heading, 0, sensorDist);
  const alarmR = samplePheromone(grid.alarmPheromone, grid, agent.x, agent.y, agent.heading, sensorAngle, sensorDist);

  // Combine: follow pheromone positively, alarm negatively
  const effLeft   = left   - alarmL * 2;
  const effCenter = center - alarmC * 2;
  const effRight  = right  - alarmR * 2;

  // Rotate toward best direction
  if (effCenter > effLeft && effCenter > effRight) {
    // keep heading, small random jitter
    agent.heading += (rand() - 0.5) * 0.2;
  } else if (effLeft > effRight) {
    agent.heading -= rotSpeed * (0.5 + rand() * 0.5);
  } else if (effRight > effLeft) {
    agent.heading += rotSpeed * (0.5 + rand() * 0.5);
  } else {
    agent.heading += (rand() - 0.5) * rotSpeed;
  }

  // Move forward
  const nx = agent.x + Math.cos(agent.heading) * speed;
  const ny = agent.y + Math.sin(agent.heading) * speed;
  const gx = Math.floor(nx);
  const gy = Math.floor(ny);

  if (!grid.inBounds(gx, gy)) {
    // Bounce off world edge
    agent.heading = Math.atan2(-Math.sin(agent.heading), -Math.cos(agent.heading)) + (rand() - 0.5) * 0.5;
  } else {
    const cellT = grid.cellType[grid.index(gx, gy)];
    if (cellT === 1) {
      // Rock — reflect
      agent.heading = agent.heading + Math.PI + (rand() - 0.5) * 0.5;
    } else {
      const effectiveSpeed = cellT === 2 ? speed * 0.5 : speed;
      agent.x += Math.cos(agent.heading) * effectiveSpeed;
      agent.y += Math.sin(agent.heading) * effectiveSpeed;
      agent.x = Math.max(0, Math.min(grid.width - 0.01, agent.x));
      agent.y = Math.max(0, Math.min(grid.height - 0.01, agent.y));
    }
  }

  const cx = Math.floor(agent.x);
  const cy = Math.floor(agent.y);

  // Deposit pheromone
  if (grid.inBounds(cx, cy)) {
    const idx = grid.index(cx, cy);
    if (agent.carryingFood) {
      grid.foodPheromone[idx] = Math.min(CONFIG.MAX_PHEROMONE, grid.foodPheromone[idx] + depositRate);
    } else {
      grid.homePheromone[idx] = Math.min(CONFIG.MAX_PHEROMONE, grid.homePheromone[idx] + depositRate);
    }
  }

  // Check nest
  const distToNest = Math.hypot(agent.x - colony.nestX, agent.y - colony.nestY);
  if (distToNest < 2.5 && agent.carryingFood) {
    agent.carryingFood = false;
    colony.addFood(CONFIG.COLONY_ENERGY_PER_FOOD);
    agent.heading = agent.heading + Math.PI + (rand() - 0.5) * 0.5;
    agent.energy = Math.min(CONFIG.AGENT_INITIAL_ENERGY, agent.energy + 20);
    return;
  }

  // Check food
  if (!agent.carryingFood) {
    const result = foodManager.consumeAt(cx, cy);
    if (result !== null) {
      if (result === 'poison') {
        agent.energy -= CONFIG.POISON_DAMAGE;
        // deposit alarm at current position
        if (grid.inBounds(cx, cy)) {
          const idx = grid.index(cx, cy);
          grid.alarmPheromone[idx] = Math.min(CONFIG.MAX_PHEROMONE, grid.alarmPheromone[idx] + 20);
        }
      } else {
        agent.carryingFood = true;
        agent.heading = agent.heading + Math.PI + (rand() - 0.5) * 0.3;
        agent.energy = Math.min(CONFIG.AGENT_INITIAL_ENERGY, agent.energy + 30);
      }
    }
  }
}
