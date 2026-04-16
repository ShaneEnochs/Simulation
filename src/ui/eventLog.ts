export class EventLog {
  private entries: { msg: string; tick: number }[] = [];
  private el: HTMLElement;

  constructor(container: HTMLElement) {
    container.innerHTML += `<div id="event-log">
      <div class="section-title">Events</div>
      <div id="event-log-entries"></div>
    </div>`;
    this.el = document.getElementById('event-log-entries')!;
  }

  log(msg: string, tick: number): void {
    this.entries.unshift({ msg, tick });
    if (this.entries.length > 30) this.entries.length = 30;
    this.render();
  }

  private render(): void {
    this.el.innerHTML = this.entries.map((e, i) => {
      const opacity = Math.max(0.3, 1 - i * 0.03);
      return `<div class="event-entry" style="opacity:${opacity}">${e.msg}</div>`;
    }).join('');
  }
}
