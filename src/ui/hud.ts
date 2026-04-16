import type { Colony } from '../colony/colony';
import type { AgentPool } from '../agents/agentPool';
import { CONFIG } from '../config';

export class HUD {
  private energyFill: HTMLElement;
  private genEl: HTMLElement;
  private popEl: HTMLElement;
  private foodEl: HTMLElement;
  private timeEl: HTMLElement;

  constructor(container: HTMLElement) {
    container.innerHTML += `
      <div id="hud">
        <div class="hud-label">Colony Energy</div>
        <div id="energy-bar"><div id="energy-fill"></div></div>
        <div class="hud-row"><span class="hud-label">Generation</span><span id="hud-gen">0</span></div>
        <div class="hud-row"><span class="hud-label">Population</span><span id="hud-pop">0</span></div>
        <div class="hud-row"><span class="hud-label">Food Collected</span><span id="hud-food">0</span></div>
        <div class="hud-row"><span class="hud-label">Time</span><span id="hud-time">0:00</span></div>
      </div>
    `;
    this.energyFill = document.getElementById('energy-fill')!;
    this.genEl = document.getElementById('hud-gen')!;
    this.popEl = document.getElementById('hud-pop')!;
    this.foodEl = document.getElementById('hud-food')!;
    this.timeEl = document.getElementById('hud-time')!;
  }

  update(colony: Colony, pool: AgentPool, tick: number): void {
    const ratio = Math.max(0, Math.min(1, colony.energy / (CONFIG.REPRODUCTION_THRESHOLD * 4)));
    const pct = (ratio * 100).toFixed(0) + '%';
    this.energyFill.style.width = pct;

    const lowRatio = colony.energy / CONFIG.REPRODUCTION_THRESHOLD;
    if (lowRatio < 1) {
      this.energyFill.style.backgroundColor = `hsl(${lowRatio * 60},80%,45%)`;
    } else {
      this.energyFill.style.backgroundColor = '#4caf50';
    }

    this.genEl.textContent = String(colony.maxGeneration);
    this.popEl.textContent = `${pool.count()} / ${CONFIG.MAX_AGENTS}`;
    this.foodEl.textContent = String(colony.totalFoodCollected);

    const totalSec = Math.floor(tick / 60);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    this.timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
