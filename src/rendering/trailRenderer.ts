import { Grid } from '../world/grid';
import { Camera } from '../input/camera';
import { CONFIG } from '../config';

export class TrailRenderer {
  private imageData: ImageData | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    const ctx = this.offscreenCanvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    this.offCtx = ctx;
  }

  render(
    ctx: CanvasRenderingContext2D,
    grid: Grid,
    camera: Camera,
    canvasW: number,
    canvasH: number,
    isRaining: boolean
  ): void {
    const cellSize = CONFIG.CELL_RENDER_SIZE * camera.zoom;
    const brightness = CONFIG.PHEROMONE_BRIGHTNESS;

    // Compute visible cell range
    const [wx0, wy0] = camera.screenToWorld(0, 0);
    const [wx1, wy1] = camera.screenToWorld(canvasW, canvasH);

    const x0 = Math.max(0, Math.floor(wx0));
    const y0 = Math.max(0, Math.floor(wy0));
    const x1 = Math.min(grid.width - 1, Math.ceil(wx1));
    const y1 = Math.min(grid.height - 1, Math.ceil(wy1));

    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    if (w <= 0 || h <= 0) return;

    if (
      !this.imageData ||
      this.imageData.width !== w ||
      this.imageData.height !== h
    ) {
      this.imageData = new ImageData(w, h);
    }

    const data = this.imageData.data;
    let p = 0;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const idx = grid.index(cx, cy);
        let r = Math.min(255, grid.alarmPheromone[idx] * brightness);
        let g = Math.min(255, grid.foodPheromone[idx] * brightness);
        let b = Math.min(255, grid.homePheromone[idx] * brightness);
        if (isRaining) b = Math.min(255, b + 20);
        data[p]     = r;
        data[p + 1] = g;
        data[p + 2] = b;
        data[p + 3] = 255;
        p += 4;
      }
    }

    if (this.offscreenCanvas.width !== w || this.offscreenCanvas.height !== h) {
      this.offscreenCanvas.width = w;
      this.offscreenCanvas.height = h;
    }

    this.offCtx.putImageData(this.imageData, 0, 0);

    const [sx, sy] = camera.worldToScreen(x0, y0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.offscreenCanvas, sx, sy, w * cellSize, h * cellSize);
  }
}
