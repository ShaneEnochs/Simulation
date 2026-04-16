import { Grid } from '../world/grid';
import { FoodManager } from '../environment/food';
import { PredatorManager } from '../environment/predator';
import { Camera } from '../input/camera';
import { Colony } from '../colony/colony';
import { CONFIG } from '../config';

export class OverlayRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    grid: Grid,
    foodManager: FoodManager,
    predators: PredatorManager,
    colony: Colony,
    camera: Camera,
    canvasW: number,
    canvasH: number,
    tick: number
  ): void {
    const cellSize = CONFIG.CELL_RENDER_SIZE * camera.zoom;

    const [wx0, wy0] = camera.screenToWorld(0, 0);
    const [wx1, wy1] = camera.screenToWorld(canvasW, canvasH);
    const x0 = Math.max(0, Math.floor(wx0));
    const y0 = Math.max(0, Math.floor(wy0));
    const x1 = Math.min(grid.width - 1, Math.ceil(wx1));
    const y1 = Math.min(grid.height - 1, Math.ceil(wy1));

    // Terrain
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const t = grid.cellType[grid.index(cx, cy)];
        if (t === 0) continue;
        const [sx, sy] = camera.worldToScreen(cx, cy);
        if (t === 1) {
          ctx.fillStyle = '#333';
        } else {
          ctx.fillStyle = 'rgba(30,80,180,0.55)';
        }
        ctx.fillRect(sx, sy, cellSize + 0.5, cellSize + 0.5);
      }
    }

    // Food sources
    for (const food of foodManager.sources) {
      const [sx, sy] = camera.worldToScreen(food.x + 0.5, food.y + 0.5);
      const ratio = food.amount / food.maxAmount;
      const r = Math.max(2, cellSize * 0.6 * ratio);
      if (food.type === 'basic') {
        ctx.fillStyle = `rgba(50,220,80,0.9)`;
      } else if (food.type === 'rich') {
        ctx.fillStyle = `rgba(255,200,0,0.9)`;
      } else {
        ctx.fillStyle = `rgba(160,40,200,0.9)`;
      }
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nest with pulse glow
    const [nx, ny] = camera.worldToScreen(colony.nestX + 0.5, colony.nestY + 0.5);
    const nestEnergy = Math.min(1, colony.energy / (CONFIG.REPRODUCTION_THRESHOLD * 2));
    const pulse = 0.6 + 0.4 * Math.sin(tick * 0.05);
    const glowR = cellSize * 1.5 * nestEnergy * pulse + cellSize * 0.5;

    ctx.save();
    const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR * 2);
    grd.addColorStop(0, `rgba(255,220,100,${0.5 * nestEnergy * pulse})`);
    grd.addColorStop(1, 'rgba(255,220,100,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(nx, ny, glowR * 2, 0, Math.PI * 2);
    ctx.fill();

    const ns = cellSize * 0.7;
    ctx.fillStyle = '#ffd060';
    ctx.fillRect(nx - ns / 2, ny - ns / 2, ns, ns);
    ctx.strokeStyle = '#fff8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(nx - ns, ny - ns, ns * 2, ns * 2);
    ctx.restore();

    // Predators
    for (const pred of predators.predators) {
      if (!pred.active) continue;
      const [px, py] = camera.worldToScreen(pred.x, pred.y);
      const pr = Math.max(4, cellSize * 0.8);
      ctx.fillStyle = '#c02020';
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, CONFIG.PREDATOR_RADIUS * cellSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
