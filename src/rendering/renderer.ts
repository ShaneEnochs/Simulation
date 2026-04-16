import { TrailRenderer } from './trailRenderer';
import { AgentRenderer } from './agentRenderer';
import { OverlayRenderer } from './overlayRenderer';
import { Grid } from '../world/grid';
import { AgentPool } from '../agents/agentPool';
import { FoodManager } from '../environment/food';
import { PredatorManager } from '../environment/predator';
import { Colony } from '../colony/colony';
import { Camera } from '../input/camera';

export class Renderer {
  private readonly trail = new TrailRenderer();
  private readonly agents = new AgentRenderer();
  private readonly overlay = new OverlayRenderer();

  render(
    ctx: CanvasRenderingContext2D,
    grid: Grid,
    pool: AgentPool,
    foodManager: FoodManager,
    predators: PredatorManager,
    colony: Colony,
    camera: Camera,
    canvasW: number,
    canvasH: number,
    tick: number,
    isRaining: boolean,
    inspectedAgent: number | null
  ): void {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasW, canvasH);

    this.trail.render(ctx, grid, camera, canvasW, canvasH, isRaining);
    this.overlay.render(ctx, grid, foodManager, predators, colony, camera, canvasW, canvasH, tick);
    this.agents.render(ctx, pool, camera, inspectedAgent);
  }
}
