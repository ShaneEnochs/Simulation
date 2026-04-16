import { CONFIG } from '../config';

export class Camera {
  x = 0;
  y = 0;
  zoom = 1;

  private readonly minZoom = 0.25;
  private readonly maxZoom = 8;

  worldToScreen(wx: number, wy: number): [number, number] {
    const cellSize = CONFIG.CELL_RENDER_SIZE * this.zoom;
    return [wx * cellSize - this.x, wy * cellSize - this.y];
  }

  screenToWorld(sx: number, sy: number): [number, number] {
    const cellSize = CONFIG.CELL_RENDER_SIZE * this.zoom;
    return [(sx + this.x) / cellSize, (sy + this.y) / cellSize];
  }

  pan(dx: number, dy: number): void {
    this.x -= dx;
    this.y -= dy;
  }

  zoomAt(sx: number, sy: number, factor: number): void {
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * factor));
    const ratio = newZoom / this.zoom;
    this.x = sx + (this.x - sx) * ratio;
    this.y = sy + (this.y - sy) * ratio;
    this.zoom = newZoom;
  }

  centerOn(worldX: number, worldY: number, canvasW: number, canvasH: number): void {
    const cellSize = CONFIG.CELL_RENDER_SIZE * this.zoom;
    this.x = worldX * cellSize - canvasW / 2;
    this.y = worldY * cellSize - canvasH / 2;
  }
}
