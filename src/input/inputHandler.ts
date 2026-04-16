import { Camera } from './camera';
import { Grid } from '../world/grid';
import { FoodManager } from '../environment/food';
import { Colony } from '../colony/colony';
import { Toolbar } from '../ui/toolbar';
import { Inspector } from '../ui/inspector';
import { AgentPool } from '../agents/agentPool';
import { setCellType, CELL_ROCK, CELL_WATER, CELL_EMPTY } from '../world/terrain';

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private grid: Grid;
  private foodManager: FoodManager;
  private colony: Colony;
  private toolbar: Toolbar;
  private inspector: Inspector;
  private pool: AgentPool;

  private isPanning = false;
  private lastMouse = { x: 0, y: 0 };
  private spaceHeld = false;

  constructor(
    canvas: HTMLCanvasElement,
    camera: Camera,
    grid: Grid,
    foodManager: FoodManager,
    colony: Colony,
    toolbar: Toolbar,
    inspector: Inspector,
    pool: AgentPool
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.grid = grid;
    this.foodManager = foodManager;
    this.colony = colony;
    this.toolbar = toolbar;
    this.inspector = inspector;
    this.pool = pool;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', () => { this.isPanning = false; });
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { this.spaceHeld = true; e.preventDefault(); }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.spaceHeld = false;
    });
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 1 || this.spaceHeld) {
      this.isPanning = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button === 0) {
      this.handleToolClick(e.clientX, e.clientY, e.shiftKey);
    }
    if (e.button === 2) {
      this.handleToolClick(e.clientX, e.clientY, true);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    if (this.isPanning) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.camera.pan(dx, dy);
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.camera.zoomAt(e.clientX, e.clientY, factor);
  }

  private handleToolClick(sx: number, sy: number, shift: boolean): void {
    const [wx, wy] = this.camera.screenToWorld(sx, sy);
    const gx = Math.floor(wx);
    const gy = Math.floor(wy);
    if (!this.grid.inBounds(gx, gy)) return;

    const tool = this.toolbar.activeTool;

    if (tool === 'food') {
      const type = (shift || this.toolbar.richFood) ? 'rich' : 'basic';
      this.foodManager.placeFood(gx, gy, type, this.grid);
    } else if (tool === 'rock') {
      setCellType(this.grid, gx, gy, CELL_ROCK);
    } else if (tool === 'water') {
      setCellType(this.grid, gx, gy, CELL_WATER);
    } else if (tool === 'erase') {
      setCellType(this.grid, gx, gy, CELL_EMPTY);
      this.foodManager.removeFood(gx, gy);
    } else if (tool === 'feed') {
      this.colony.energy += 100;
    } else if (tool === 'inspect') {
      let closest: { dist: number; idx: number } | null = null;
      this.pool.forEachActive((agent, i) => {
        const d = Math.hypot(agent.x - wx, agent.y - wy);
        if (!closest || d < closest.dist) closest = { dist: d, idx: i };
      });
      if (closest && (closest as { dist: number; idx: number }).dist < 3) {
        const idx = (closest as { dist: number; idx: number }).idx;
        this.inspector.inspect(this.pool.agents[idx], idx);
      } else {
        this.inspector.dismiss();
      }
    }
  }
}
