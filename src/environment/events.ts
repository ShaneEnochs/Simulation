import { CONFIG } from '../config';
import { randInt, rand } from '../utils/rng';
import { PredatorManager } from './predator';
import { Grid } from '../world/grid';

export interface EventState {
  isRaining: boolean;
  rainTicksLeft: number;
  currentEvaporationMultiplier: number;
}

export class EventManager {
  private ticksUntilNext: number;
  readonly state: EventState = {
    isRaining: false,
    rainTicksLeft: 0,
    currentEvaporationMultiplier: CONFIG.EVAPORATION_RATE,
  };

  constructor() {
    this.ticksUntilNext = randInt(CONFIG.EVENT_INTERVAL_MIN, CONFIG.EVENT_INTERVAL_MAX);
  }

  update(
    grid: Grid,
    predators: PredatorManager,
    maxGeneration: number,
    onLog: (msg: string) => void
  ): void {
    if (this.state.isRaining) {
      this.state.rainTicksLeft--;
      if (this.state.rainTicksLeft <= 0) {
        this.state.isRaining = false;
        this.state.currentEvaporationMultiplier = CONFIG.EVAPORATION_RATE;
        onLog('The rain has stopped.');
      }
    }

    this.ticksUntilNext--;
    if (this.ticksUntilNext <= 0) {
      this.ticksUntilNext = randInt(CONFIG.EVENT_INTERVAL_MIN, CONFIG.EVENT_INTERVAL_MAX);
      this.triggerEvent(grid, predators, maxGeneration, onLog);
    }
  }

  private triggerEvent(
    grid: Grid,
    predators: PredatorManager,
    maxGeneration: number,
    onLog: (msg: string) => void
  ): void {
    const canSpawnPredator = maxGeneration >= 5;
    const maxActive = maxGeneration >= 20 ? 2 : 1;

    if (canSpawnPredator && rand() < 0.5 && predators.count() < maxActive) {
      predators.spawn(grid.width, grid.height);
      onLog('A predator has appeared!');
      if (maxGeneration >= 20) {
        onLog('The world grows harsher...');
      }
      return;
    }

    if (!this.state.isRaining) {
      this.state.isRaining = true;
      this.state.rainTicksLeft = CONFIG.RAIN_DURATION;
      this.state.currentEvaporationMultiplier = CONFIG.RAIN_EVAPORATION_MULTIPLIER;
      onLog('It begins to rain. Trails fade faster.');
    }

    if (maxGeneration >= 20 && rand() < 0.3 && predators.count() < maxActive) {
      predators.spawn(grid.width, grid.height);
      onLog('A predator prowls during the rain...');
    }
  }
}
