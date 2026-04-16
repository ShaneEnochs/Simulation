import { AgentPool } from '../agents/agentPool';
import { Camera } from '../input/camera';
import { CONFIG } from '../config';

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export class AgentRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    pool: AgentPool,
    camera: Camera,
    inspectedIndex: number | null
  ): void {
    const cellSize = CONFIG.CELL_RENDER_SIZE * camera.zoom;
    const radius = Math.max(1.5, cellSize * 0.35);

    pool.forEachActive((agent, i) => {
      const [sx, sy] = camera.worldToScreen(agent.x, agent.y);
      const hue = agent.genes.hue * 360;
      const [r, g, b] = hslToRgb(hue, 0.9, agent.carryingFood ? 0.75 : 0.55);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();

      if (i === inspectedIndex) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
}
