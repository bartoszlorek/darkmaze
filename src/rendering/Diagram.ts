import * as PIXI from "pixi.js";

export class Diagram extends PIXI.Graphics {
  length: number;
  points: number[];
  viewWidth: number = 250;
  viewHeight: number = 100;

  lineStyleOptions: Partial<PIXI.ILineStyleOptions> = {
    width: 2,
    color: 0xd4e2cc,
  };

  constructor(length: number, initialValue: number) {
    super();
    this.length = length;
    this.points = Array.from({ length }, () => initialValue);
    this.redraw();
  }

  add(point: number) {
    for (let i = 1; i < this.length; i++) {
      this.points[i - 1] = this.points[i];
    }
    this.points[this.length - 1] = point;
    this.redraw();
  }

  protected redraw() {
    const width = this.viewWidth / this.length;

    this.clear();
    this.lineStyle(this.lineStyleOptions);
    this.moveTo(0, (1 - this.points[0]) * this.viewHeight);

    for (let i = 0; i < this.length; i++) {
      this.lineTo(width * i, (1 - this.points[i]) * this.viewHeight);
    }
  }
}
