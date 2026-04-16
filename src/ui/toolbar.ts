import type { Tool } from '../types';

export class Toolbar {
  activeTool: Tool = 'food';
  richFood = false;
  speedMultiplier = 1;
  paused = false;

  private buttons: Map<Tool, HTMLElement> = new Map();
  private speedButtons: Map<string, HTMLElement> = new Map();
  private onFeedNest: (() => void) | null = null;

  constructor(container: HTMLElement, onFeedNest: () => void) {
    this.onFeedNest = onFeedNest;
    const tools: [Tool, string][] = [
      ['food', 'Place Food'],
      ['rock', 'Place Rock'],
      ['water', 'Place Water'],
      ['erase', 'Erase'],
      ['inspect', 'Inspect'],
      ['feed', 'Feed (click)'],
    ];

    let html = '<div id="toolbar"><div class="section-title">Tools</div>';
    for (const [id, label] of tools) {
      html += `<button class="tool-btn" id="tool-${id}">${label}</button>`;
    }
    html += '<div class="separator"></div>';
    html += '<label><input type="checkbox" id="rich-food"> Rich food</label>';
    html += '<div class="separator"></div><div class="section-title">Speed</div>';
    html += '<div class="speed-row">';
    html += '<button class="speed-btn" id="speed-pause">⏸</button>';
    html += '<button class="speed-btn active" id="speed-1x">▶ 1x</button>';
    html += '<button class="speed-btn" id="speed-4x">⏩ 4x</button>';
    html += '<button class="speed-btn" id="speed-16x">⏩⏩ 16x</button>';
    html += '</div>';
    html += '<div class="separator"></div>';
    html += '<button id="feed-nest-btn">Inject Energy (nest)</button>';
    html += '</div>';
    container.innerHTML += html;

    for (const [id] of tools) {
      const btn = document.getElementById(`tool-${id}`)!;
      this.buttons.set(id, btn);
      btn.addEventListener('click', () => this.setTool(id));
    }

    document.getElementById('rich-food')!.addEventListener('change', (e) => {
      this.richFood = (e.target as HTMLInputElement).checked;
    });

    const speedMap: [string, number, boolean][] = [
      ['pause', 0, false],
      ['1x', 1, true],
      ['4x', 4, false],
      ['16x', 16, false],
    ];
    for (const [id, mult, def] of speedMap) {
      const btn = document.getElementById(`speed-${id}`)!;
      this.speedButtons.set(id, btn);
      if (def) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.paused = mult === 0;
        this.speedMultiplier = mult;
        this.speedButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }

    document.getElementById('feed-nest-btn')!.addEventListener('click', () => {
      this.onFeedNest?.();
    });

    this.setTool('food');
  }

  setTool(tool: Tool): void {
    this.activeTool = tool;
    this.buttons.forEach((btn, id) => {
      btn.classList.toggle('active', id === tool);
    });
  }
}
