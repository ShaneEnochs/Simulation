import { CONFIG } from './config';
import { Grid } from './world/grid';
import { evaporate, diffuse } from './world/pheromone';
import { AgentPool } from './agents/agentPool';
import { updateAgent } from './agents/agent';
import { randomGenes, mutate } from './agents/genetics';
import { Colony } from './colony/colony';
import { FoodManager } from './environment/food';
import { PredatorManager } from './environment/predator';
import { EventManager } from './environment/events';
import { Renderer } from './rendering/renderer';
import { Camera } from './input/camera';
import { InputHandler } from './input/inputHandler';
import { HUD } from './ui/hud';
import { GeneChart } from './ui/geneChart';
import { Toolbar } from './ui/toolbar';
import { Inspector } from './ui/inspector';
import { EventLog } from './ui/eventLog';
import { seedRng } from './utils/rng';

const BEST_LINEAGE_KEY = 'slime-colony:best-lineage';
const ONBOARDING_KEY = 'slime-colony:onboarded';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: Grid;
  private pool: AgentPool;
  private colony: Colony;
  private foodManager: FoodManager;
  private predators: PredatorManager;
  private events: EventManager;
  private renderer: Renderer;
  private camera: Camera;
  private hud: HUD;
  private geneChart: GeneChart;
  private toolbar: Toolbar;
  private inspector: Inspector;
  private eventLog: EventLog;

  private tick = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly tickMs = 1000 / 60;

  private milestoneFlags = new Set<number>();
  private popMilestones = new Set<number>([50, 100, 200, 500, 1000]);
  private bestLineageSaved = false;

  constructor(canvas: HTMLCanvasElement, uiContainer: HTMLElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No canvas context');
    this.ctx = ctx;

    seedRng(CONFIG.DEFAULT_SEED);

    this.grid = new Grid();
    this.pool = new AgentPool();

    const nestX = Math.floor(CONFIG.GRID_WIDTH / 2);
    const nestY = Math.floor(CONFIG.GRID_HEIGHT / 2);
    this.colony = new Colony(nestX, nestY);
    this.foodManager = new FoodManager();
    this.predators = new PredatorManager();
    this.events = new EventManager();
    this.renderer = new Renderer();
    this.camera = new Camera();

    this.eventLog = new EventLog(uiContainer);
    this.hud = new HUD(uiContainer);
    this.geneChart = new GeneChart(uiContainer);
    this.toolbar = new Toolbar(uiContainer, () => {
      this.colony.energy += 100;
      this.eventLog.log('Energy injected at nest.', this.tick);
    });
    this.inspector = new Inspector(uiContainer);

    new InputHandler(
      canvas, this.camera, this.grid, this.foodManager,
      this.colony, this.toolbar, this.inspector, this.pool
    );

    // camera.centerOn is called after resize() in main.ts via handleResize()
    this.spawnInitialAgents();
    this.showOnboarding();
    this.restoreBestLineage();

    this.eventLog.log('Colony founded. Place food to help them survive.', 0);
  }

  private spawnInitialAgents(): void {
    const nestX = this.colony.nestX;
    const nestY = this.colony.nestY;
    for (let i = 0; i < CONFIG.INITIAL_AGENTS; i++) {
      this.pool.spawn(nestX, nestY, randomGenes(), 0);
    }
  }

  private restoreBestLineage(): void {
    try {
      const saved = localStorage.getItem(BEST_LINEAGE_KEY);
      if (!saved) return;
      const genes = JSON.parse(saved);
      const count = Math.floor(CONFIG.INITIAL_AGENTS / 2);
      for (let i = 0; i < count; i++) {
        this.pool.spawn(this.colony.nestX, this.colony.nestY, mutate(genes), 0);
      }
      this.eventLog.log('Inherited memory from previous colony.', 0);
    } catch {
      // ignore
    }
  }

  private showOnboarding(): void {
    let seen = false;
    try { seen = !!localStorage.getItem(ONBOARDING_KEY); } catch { /* blocked */ }
    if (seen) return;
    const overlay = document.createElement('div');
    overlay.id = 'onboarding';
    overlay.textContent = 'Click to place food. Watch your colony find it.';
    document.body.appendChild(overlay);
    const dismiss = () => {
      overlay.remove();
      try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* blocked */ }
      this.canvas.removeEventListener('click', dismiss);
    };
    this.canvas.addEventListener('click', dismiss);
    setTimeout(() => {
      overlay.remove();
      try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* blocked */ }
    }, 5000);
  }

  handleResize(w: number, h: number): void {
    this.camera.centerOn(this.colony.nestX, this.colony.nestY, w, h);
  }

  private readonly boundLoop = (now: number) => this.loop(now);

  start(): void {
    requestAnimationFrame(this.boundLoop);
  }

  private loop(now: number): void {
    requestAnimationFrame(this.boundLoop);

    const dt = Math.min(now - this.lastTime, 50);
    this.lastTime = now;

    if (!this.toolbar.paused) {
      this.accumulator += dt;
      const speed = this.toolbar.speedMultiplier;
      const ticksPerFrame = speed <= 1 ? 1 : speed;

      if (speed > 1) {
        for (let t = 0; t < ticksPerFrame; t++) {
          this.simTick();
        }
        this.accumulator = 0;
      } else {
        while (this.accumulator >= this.tickMs) {
          this.simTick();
          this.accumulator -= this.tickMs;
        }
      }
    }

    this.render();
    this.hud.update(this.colony, this.pool, this.tick);
    this.geneChart.update(this.colony.avgGenes, now);
  }

  private simTick(): void {
    this.tick++;

    // Update agents
    this.pool.forEachActive(agent => {
      updateAgent(agent, this.grid, this.colony, this.foodManager);
    });

    // Colony tick
    this.colony.tick(this.pool, (msg) => this.eventLog.log(msg, this.tick));

    // Predators
    this.predators.update(this.grid, this.pool);

    // Events
    this.events.update(this.grid, this.predators, this.colony.maxGeneration,
      (msg) => this.eventLog.log(msg, this.tick));

    // Pheromone physics
    evaporate(this.grid, this.events.state.currentEvaporationMultiplier);
    diffuse(this.grid);

    // Population milestones
    const pop = this.pool.count();
    for (const milestone of this.popMilestones) {
      if (pop >= milestone && !this.milestoneFlags.has(milestone)) {
        this.milestoneFlags.add(milestone);
        this.eventLog.log(`Colony reached ${milestone} agents!`, this.tick);
      }
    }

    // Save best lineage once when game ends
    if (this.colony.isGameOver && !this.bestLineageSaved) {
      this.bestLineageSaved = true;
      this.saveBestLineage();
    }
  }

  private saveBestLineage(): void {
    let best: { age: number; genes: object } | null = null;
    this.pool.forEachActive(agent => {
      if (!best || agent.age > best.age) {
        best = { age: agent.age, genes: agent.genes };
      }
    });
    if (best) {
      try {
        localStorage.setItem(BEST_LINEAGE_KEY, JSON.stringify((best as { genes: object }).genes));
      } catch { /* ignore */ }
    }
  }

  private render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.renderer.render(
      this.ctx, this.grid, this.pool, this.foodManager,
      this.predators, this.colony, this.camera,
      w, h, this.tick,
      this.events.state.isRaining,
      this.inspector.inspectedIndex
    );

    if (this.colony.isGameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Colony Extinct', w / 2, h / 2);
      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '18px monospace';
      this.ctx.fillText('Refresh to restart', w / 2, h / 2 + 40);
    }
  }
}
