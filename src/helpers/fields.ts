export type Vector = [x: number, y: number];

export class ScalarField {
  public values: number[];
  public vectors: Vector[];
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    const length = width * height;
    this.values = Array.from({ length }, () => 0);
    this.vectors = Array.from({ length }, () => [0, 0]);
    this.width = width;
    this.height = height;
  }

  getX(index: number) {
    return index % this.width;
  }

  getY(index: number) {
    return Math.floor(index / this.width);
  }

  getIndex(x: number, y: number) {
    return x + this.width * y;
  }

  setValue(x: number, y: number, value: number) {
    this.values[this.getIndex(x, y)] = value;
  }

  forEachValue(fn: (value: number, x: number, y: number, i: number) => void) {
    for (let i = 0; i < this.values.length; i++) {
      fn(this.values[i], this.getX(i), this.getY(i), i);
    }
  }

  /**
   * https://bartwronski.com/2021/02/28/computing-gradients-on-grids-forward-central-and-diagonal-differences/
   */
  parseVectors() {
    for (let i = 0; i < this.values.length; i++) {
      const x = this.getX(i);
      const y = this.getY(i);

      const n = this.values[this.getIndex(x, y - 1)] ?? 0;
      const s = this.values[this.getIndex(x, y + 1)] ?? 0;
      const w = this.values[this.getIndex(x - 1, y)] ?? 0;
      const e = this.values[this.getIndex(x + 1, y)] ?? 0;

      /**
       * the central difference
       * |   | n |   |
       * | w |   | e |
       * |   | s |   |
       */
      const dx = w - e;
      const dy = n - s;

      if (dx || dy) {
        this.vectors[i][0] = dx;
        this.vectors[i][1] = dy;
      } else {
        const nw = this.values[this.getIndex(x - 1, y - 1)] ?? 0;
        const ne = this.values[this.getIndex(x + 1, y - 1)] ?? 0;
        const sw = this.values[this.getIndex(x - 1, y + 1)] ?? 0;
        const se = this.values[this.getIndex(x + 1, y + 1)] ?? 0;

        /**
         * the central difference but for diagonal mean
         * | nw |    | ne |
         * |    |    |    |
         * | sw |    | se |
         */
        this.vectors[i][0] = (nw + sw) / 2 - (ne + se) / 2;
        this.vectors[i][1] = (nw + ne) / 2 - (sw + se) / 2;
      }
    }
  }
}
