import { EventEmitter } from "./EventEmitter";

type PanEvent = "panUp" | "panDown";

export type VirtualJoystickEvents = {
  /**
   * horizontal actions
   */
  swipeLeft: undefined;
  swipeRight: undefined;
  /**
   * vertical actions
   */
  panUp: boolean;
  panDown: boolean;
};

export class VirtualJoystick extends EventEmitter<VirtualJoystickEvents> {
  protected threshold: number;
  protected velocity: number;

  protected currentPanEvent: PanEvent | null = null;
  protected handleStart?: (event: TouchEvent) => void;
  protected handleMove?: (event: TouchEvent) => void;
  protected handleEnd?: (event: TouchEvent) => void;

  constructor(threshold: number = 10, velocity: number = 0.3) {
    super();
    this.threshold = threshold;
    this.velocity = velocity;
  }

  bind() {
    let startClientX: number;
    let startClientY: number;
    let lastClientX: number;
    let lastClientY: number;
    let lastTimeStamp: number;

    const handleStart = (event: TouchEvent) => {
      event.preventDefault();

      // ignores multi-touch interactions
      if (event.touches.length > 1) {
        return;
      }

      startClientX = lastClientX = event.touches[0].clientX;
      startClientY = lastClientY = event.touches[0].clientY;
      lastTimeStamp = performance.now();
      this.currentPanEvent = null;
    };

    const handleMove = (event: TouchEvent) => {
      event.preventDefault();

      const clientX = event.touches[0].clientX;
      const clientY = event.touches[0].clientY;
      lastClientX = clientX;

      // skip horizontal interactions
      if (distance(startClientX, clientX) > distance(startClientY, clientY)) {
        return;
      }

      // required distance for recognition
      if (distance(lastClientY, clientY) < this.threshold) {
        return;
      }

      if (lastClientY > clientY) {
        this.startPanEvent("panUp");
      } else {
        this.startPanEvent("panDown");
      }

      lastClientY = clientY;
    };

    const handleEnd = (event: TouchEvent) => {
      event.preventDefault();

      // ignores multi-touch interactions
      const touches = event ? event.touches.length : 0;
      if (touches > 0) {
        return;
      }

      this.endCurrentPanEvent();
      const dist = distance(startClientX, lastClientX);
      const velocity = dist / (performance.now() - lastTimeStamp);

      // required distance and velocity for recognition
      if (dist < this.threshold || velocity < this.velocity) {
        return;
      }

      if (startClientX > lastClientX) {
        this.emit("swipeLeft", undefined);
      } else {
        this.emit("swipeRight", undefined);
      }
    };

    document.addEventListener("touchstart", handleStart, false);
    document.addEventListener("touchmove", handleMove, false);
    document.addEventListener("touchcancel", handleEnd, false);
    document.addEventListener("touchend", handleEnd, false);

    this.handleStart = handleStart;
    this.handleMove = handleMove;
    this.handleEnd = handleEnd;
    return this;
  }

  startPanEvent(type: PanEvent) {
    if (type !== this.currentPanEvent) {
      this.endCurrentPanEvent();
      this.currentPanEvent = type;
      this.emit(type, true);
    }
  }

  endCurrentPanEvent() {
    if (this.currentPanEvent !== null) {
      this.emit(this.currentPanEvent, false);
      this.currentPanEvent = null;
    }
  }

  destroy() {
    this.endCurrentPanEvent();

    if (this.handleStart !== undefined) {
      document.removeEventListener("touchstart", this.handleStart);
      this.handleStart = undefined;
    }

    if (this.handleMove !== undefined) {
      document.removeEventListener("touchmove", this.handleMove);
      this.handleMove = undefined;
    }

    if (this.handleEnd !== undefined) {
      document.removeEventListener("touchend", this.handleEnd);
      document.removeEventListener("touchcancel", this.handleEnd);
      this.handleEnd = undefined;
    }
  }
}

function distance(a: number, b: number) {
  return Math.abs(a - b);
}
