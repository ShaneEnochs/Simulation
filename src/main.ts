import './style.css';
import { Game } from './game';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

// Game must be constructed first so the sidebar has its content and offsetWidth is correct.
const game = new Game(canvas, ui);

function resize(): void {
  canvas.width = window.innerWidth - ui.offsetWidth;
  canvas.height = window.innerHeight;
  game.handleResize(canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();

game.start();
