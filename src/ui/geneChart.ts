import type { Genes } from '../types';

const GENE_NAMES: (keyof Genes)[] = [
  'sensorAngle', 'sensorDistance', 'rotationSpeed', 'speed', 'depositRate', 'hue'
];
const GENE_LABELS = ['Sensor Angle', 'Sensor Dist', 'Rotation', 'Speed', 'Deposit', 'Hue'];

export class GeneChart {
  private fills: HTMLElement[] = [];
  private vals: HTMLElement[] = [];
  private lastUpdate = 0;

  constructor(container: HTMLElement) {
    let html = '<div id="gene-chart"><div class="section-title">Gene Averages</div>';
    for (let i = 0; i < GENE_NAMES.length; i++) {
      html += `
        <div class="gene-row">
          <span class="gene-label">${GENE_LABELS[i]}</span>
          <div class="gene-bar-bg"><div class="gene-bar-fill" id="gene-fill-${i}"></div></div>
          <span class="gene-val" id="gene-val-${i}">0.50</span>
        </div>`;
    }
    html += '</div>';
    container.insertAdjacentHTML('beforeend', html);

    for (let i = 0; i < GENE_NAMES.length; i++) {
      this.fills.push(document.getElementById(`gene-fill-${i}`)!);
      this.vals.push(document.getElementById(`gene-val-${i}`)!);
    }
  }

  update(avgGenes: Genes, now: number): void {
    if (now - this.lastUpdate < 500) return;
    this.lastUpdate = now;

    for (let i = 0; i < GENE_NAMES.length; i++) {
      const key = GENE_NAMES[i];
      const val = avgGenes[key];

      this.fills[i].style.width = (val * 100).toFixed(1) + '%';
      if (key === 'hue') {
        this.fills[i].style.backgroundColor = `hsl(${val * 360},70%,55%)`;
      } else {
        const lightness = 35 + val * 30;
        this.fills[i].style.backgroundColor = `hsl(200,60%,${lightness}%)`;
      }
      this.vals[i].textContent = val.toFixed(2);
    }
  }
}
