export class VirtualJoystick {
  protected thresholdX: number;
  protected thresholdY: number;

  protected handleStart?: (event: TouchEvent) => void;
  protected handleMove?: (event: TouchEvent) => void;
  protected handleEnd?: (event: TouchEvent) => void;

  constructor(thresholdX: number = 20, thresholdY: number = 20) {
    this.thresholdX = thresholdX;
    this.thresholdY = thresholdY;
  }

  bind() {
    let startClientX = 0;
    let startClientY = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const handleStart = (e: TouchEvent) => {
      startClientX = lastClientX = e.touches[0].clientX;
      startClientY = lastClientY = e.touches[0].clientY;
      this.onStart();
    };

    const handleMove = (e: TouchEvent) => {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;

      if (Math.abs(startClientX - clientX) > Math.abs(startClientY - clientY)) {
        if (Math.abs(lastClientX - clientX) >= this.thresholdX) {
          if (lastClientX > clientX) {
            this.onChangeLeft();
          } else {
            this.onChangeRight();
          }

          lastClientX = clientX;
        }
      } else {
        if (Math.abs(lastClientY - clientY) >= this.thresholdY) {
          if (lastClientY > clientY) {
            this.onChangeUp();
          } else {
            this.onChangeDown();
          }

          lastClientY = clientY;
        }
      }
    };

    const handleEnd = () => {
      this.onEnd();
    };

    document.addEventListener("touchstart", handleStart, false);
    document.addEventListener("touchmove", handleMove, false);
    document.addEventListener("touchend", handleEnd, false);
    document.addEventListener("touchcancel", handleEnd, false);

    this.handleStart = handleStart;
    this.handleMove = handleMove;
    this.handleEnd = handleEnd;
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
      this.handleEnd = undefined;
    }

    this.onEnd();
  }

  // methods to implement
  onStart() {}
  onEnd() {}
  onChangeUp() {}
  onChangeDown() {}
  onChangeLeft() {}
  onChangeRight() {}
}
