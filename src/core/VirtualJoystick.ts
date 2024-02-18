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
    let lastClientX = 0;
    let lastClientY = 0;

    const handleStart = (e: TouchEvent) => {
      lastClientX = e.touches[0].clientX;
      lastClientY = e.touches[0].clientY;
      this.onStart();
    };

    const handleMove = (e: TouchEvent) => {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const diffX = Math.abs(lastClientX - clientX);
      const diffY = Math.abs(lastClientY - clientY);

      if (diffX >= this.thresholdX) {
        if (lastClientX > clientX) {
          this.onChangeLeft();
        } else {
          this.onChangeRight();
        }

        lastClientX = clientX;
      }

      if (diffY >= this.thresholdY) {
        if (lastClientY > clientY) {
          this.onChangeUp();
        } else {
          this.onChangeDown();
        }

        lastClientY = clientY;
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
