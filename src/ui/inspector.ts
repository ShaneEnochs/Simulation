import type { Agent, Genes } from '../types';

const GENE_NAMES: (keyof Genes)[] = [
  'sensorAngle', 'sensorDistance', 'rotationSpeed', 'speed', 'depositRate', 'hue'
];
const GENE_LABELS = ['Sensor Angle', 'Sensor Dist', 'Rotation', 'Speed', 'Deposit', 'Hue'];

export class Inspector {
  private panel: HTMLElement;
  private content: HTMLElement;
  inspectedIndex: number | null = null;

  constructor(container: HTMLElement) {
    container.insertAdjacentHTML('beforeend', `<div id="inspector" style="display:none">
      <div class="section-title">Agent Inspector</div>
      <div id="inspector-content"></div>
    </div>`);
    this.panel = document.getElementById('inspector')!;
    this.content = document.getElementById('inspector-content')!;
  }

  inspect(agent: Agent | null, index: number | null): void {
    this.inspectedIndex = index;
    if (!agent || index === null) {
      this.panel.style.display = 'none';
      return;
    }
    this.panel.style.display = 'block';
    const g = agent.genes;
    let html = `<div>Gen: ${agent.generation} | Age: ${agent.age} | ${agent.carryingFood ? 'Carrying' : 'Searching'}</div>`;
    html += '<div class="gene-inspector">';
    for (let i = 0; i < GENE_NAMES.length; i++) {
      const key = GENE_NAMES[i];
      const val = g[key];
      const barColor = key === 'hue' ? `hsl(${val * 360},70%,55%)` : `hsl(200,60%,50%)`;
      html += `<div class="gene-row">
        <span class="gene-label">${GENE_LABELS[i]}</span>
        <div class="gene-bar-bg"><div class="gene-bar-fill" style="width:${(val * 100).toFixed(1)}%;background:${barColor}"></div></div>
        <span class="gene-val">${val.toFixed(2)}</span>
      </div>`;
    }
    html += '</div>';
    this.content.innerHTML = html;
  }

  dismiss(): void {
    this.inspect(null, null);
  }
}
