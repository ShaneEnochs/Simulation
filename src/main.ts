import './style.css';
import { Game } from './game';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

function resize(): void {
  const sidebarW = ui.offsetWidth;
  canvas.width = window.innerWidth - sidebarW;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const game = new Game(canvas, ui);
game.start();
