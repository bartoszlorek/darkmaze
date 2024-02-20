import { EventEmitter } from "./EventEmitter";

type PanState = "up" | "down" | "none";

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

  protected handleStart?: (event: TouchEvent) => void;
  protected handleMove?: (event: TouchEvent) => void;
  protected handleEnd?: () => void;

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
    let lastPanState: PanState;

    const handleStart = (e: TouchEvent) => {
      startClientX = lastClientX = e.touches[0].clientX;
      startClientY = lastClientY = e.touches[0].clientY;
      lastTimeStamp = performance.now();
      lastPanState = "none";
    };

    const handleMove = (e: TouchEvent) => {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      lastClientX = clientX;

      // skip horizontal interactions
      if (distance(startClientX, clientX) > distance(startClientY, clientY)) {
        return;
      }

      // required distance for recognition
      if (distance(lastClientY, clientY) < this.threshold) {
        return;
      }

      // should end the previous state
      // before emitting the next one
      if (lastClientY > clientY) {
        if (lastPanState === "down") {
          this.emit("panDown", false);
        }
        if (lastPanState !== "up") {
          lastPanState = "up";
          this.emit("panUp", true);
        }
      } else {
        if (lastPanState === "up") {
          this.emit("panUp", false);
        }
        if (lastPanState !== "down") {
          lastPanState = "down";
          this.emit("panDown", true);
        }
      }

      lastClientY = clientY;
    };

    const handleEnd = () => {
      if (lastPanState === "up") {
        this.emit("panUp", false);
      }
      if (lastPanState === "down") {
        this.emit("panDown", false);
      }

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
    document.addEventListener("touchend", handleEnd, false);
    document.addEventListener("touchcancel", handleEnd, false);

    this.handleStart = handleStart;
    this.handleMove = handleMove;
    this.handleEnd = handleEnd;
    return this;
  }

  destroy() {
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
      this.handleEnd();
      this.handleEnd = undefined;
    }
  }
}

function distance(a: number, b: number) {
  return Math.abs(a - b);
}
