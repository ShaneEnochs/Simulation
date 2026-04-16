import type { Agent, Genes } from '../types';
import { CONFIG } from '../config';
import { createAgent } from './agent';

export class AgentPool {
  readonly agents: Agent[];
  private _count = 0;

  constructor() {
    this.agents = new Array(CONFIG.MAX_AGENTS);
    for (let i = 0; i < CONFIG.MAX_AGENTS; i++) {
      this.agents[i] = {
        active: false,
        x: 0, y: 0,
        heading: 0,
        carryingFood: false,
        energy: 0,
        age: 0,
        genes: { sensorAngle: 0.5, sensorDistance: 0.5, rotationSpeed: 0.5, speed: 0.5, depositRate: 0.5, hue: 0.5 },
        generation: 0,
      };
    }
  }

  spawn(x: number, y: number, genes: Genes, generation: number): boolean {
    for (let i = 0; i < CONFIG.MAX_AGENTS; i++) {
      if (!this.agents[i].active) {
        const a = createAgent(x, y, genes, generation);
        Object.assign(this.agents[i], a);
        this._count++;
        return true;
      }
    }
    return false;
  }

  forEachActive(callback: (agent: Agent, index: number) => void): void {
    for (let i = 0; i < CONFIG.MAX_AGENTS; i++) {
      if (this.agents[i].active) callback(this.agents[i], i);
    }
  }

  count(): number {
    let n = 0;
    for (let i = 0; i < CONFIG.MAX_AGENTS; i++) {
      if (this.agents[i].active) n++;
    }
    return n;
  }
}
