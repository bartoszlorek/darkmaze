// based on https://github.com/sindresorhus/parse-ms

import { EventEmitter } from "./EventEmitter";

export type TimerEvents = {
  start: Timer;
  stop: Timer;
  tick: Timer;
};

export class Timer extends EventEmitter<TimerEvents> {
  public running: boolean = false;

  protected durationMs: number = 0;
  protected startTimeMs: number = 0;
  protected stopTimeMs: number = 0;
  protected tickTimeout: NodeJS.Timeout | null = null;
  protected tickTimeMs: number = 1000;

  constructor(initialDurationMs: number = 0) {
    super();
    this.durationMs = initialDurationMs;
  }

  start() {
    this.running = true;
    this.startTimeMs = Date.now();
    this.emit("start", this);

    const tick = () => {
      this.tickTimeout = setTimeout(() => {
        this.emit("tick", this);
        tick();
      }, this.tickTimeMs);
    };
    tick();
  }

  stop() {
    this.running = false;
    this.durationMs += Date.now() - this.startTimeMs;
    this.emit("stop", this);

    if (this.tickTimeout !== null) {
      clearTimeout(this.tickTimeout);
    }
  }

  getDuration() {
    return this.running
      ? this.durationMs + Date.now() - this.startTimeMs
      : this.durationMs;
  }

  toTime() {
    const duration = this.getDuration();
    const h = Math.trunc((duration / 3_600_000) % 24);
    const m = Math.trunc((duration / 60_000) % 60);
    const s = Math.trunc((duration / 1000) % 60);

    let output = "";
    if (h > 0) output += pad(h) + ":";
    return output + pad(m) + ":" + pad(s);
  }

  toPreciseTime() {
    const duration = this.getDuration();
    const h = Math.trunc((duration / 3_600_000) % 24);
    const m = Math.trunc((duration / 60_000) % 60);
    const s = Math.trunc((duration / 1000) % 60);
    const ms = Math.trunc(duration % 1000);

    let output = "";
    if (h > 0) output += pad(h) + ":";
    return output + pad(m) + ":" + pad(s) + "." + pad(ms, 3);
  }

  destroy() {
    super.destroy();
    this.running = false;
    this.durationMs = NaN;

    if (this.tickTimeout !== null) {
      clearTimeout(this.tickTimeout);
    }
  }
}

function pad(n: number, length: number = 2) {
  return String(n).padStart(length, "0");
}
