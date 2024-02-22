// based on https://github.com/sindresorhus/parse-ms

import { EventEmitter } from "./EventEmitter";

export type TimerEvents = {
  tick: Timer;
  finish: Timer;
};

export class Timer extends EventEmitter<TimerEvents> {
  private tickTimeout: NodeJS.Timeout | null = null;

  readonly startTimeMs: number = 0;
  public finishTimeMs: number | null = null;
  public finished: boolean = false;

  constructor(startTimeMs: number = Date.now(), tickTimeMs: number = 1000) {
    super();
    this.startTimeMs = startTimeMs;

    const tick = () => {
      this.tickTimeout = setTimeout(() => {
        this.emit("tick", this);
        tick();
      }, tickTimeMs);
    };

    tick();
  }

  get elapsedTimeMs() {
    return (this.finishTimeMs ?? Date.now()) - this.startTimeMs;
  }

  toTime() {
    const diff = this.elapsedTimeMs;
    const h = Math.trunc((diff / 3_600_000) % 24);
    const m = Math.trunc((diff / 60_000) % 60);
    const s = Math.trunc((diff / 1000) % 60);

    let output = "";
    if (h > 0) output += pad(h) + ":";
    return output + pad(m) + ":" + pad(s);
  }

  toPreciseTime() {
    const diff = this.elapsedTimeMs;
    const h = Math.trunc((diff / 3_600_000) % 24);
    const m = Math.trunc((diff / 60_000) % 60);
    const s = Math.trunc((diff / 1000) % 60);
    const ms = Math.trunc(diff % 1000);

    let output = "";
    if (h > 0) output += pad(h) + ":";
    return output + pad(m) + ":" + pad(s) + "." + pad(ms, 3);
  }

  destroy() {
    super.destroy();
    if (this.tickTimeout !== null) {
      clearTimeout(this.tickTimeout);
    }
  }

  finish() {
    this.emit("finish", this);
    this.destroy();
  }
}

function pad(n: number, length: number = 2) {
  return String(n).padStart(length, "0");
}
