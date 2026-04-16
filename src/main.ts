import './style.css';
import { Game } from './game';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLDivElement;

let game: Game;
try {
  game = new Game(canvas, ui);
} catch (err) {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Failed to start: ' + String(err), canvas.width / 2, canvas.height / 2);
  }
  throw err;
}

function resize(): void {
  canvas.width = window.innerWidth - ui.offsetWidth;
  canvas.height = window.innerHeight;
  game.handleResize(canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();
game.start();
