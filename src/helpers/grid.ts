import { Maybe } from "./types";

export type Cell<T> = [x: number, y: number, value: T];
export type Iterate<T> = (x: number, y: number, value: T) => void;

// prettier-ignore
export type Neighbors<T> = [
  Maybe<T>, Maybe<T>, Maybe<T>,
  Maybe<T>,           Maybe<T>,
  Maybe<T>, Maybe<T>, Maybe<T>
];

export enum NeighborIndex {
  upLeft = 0,
  up = 1,
  upRight = 2,
  left = 3,
  right = 4,
  downLeft = 5,
  down = 6,
  downRight = 7,
}

export class Grid<T> {
  public width: number;
  public height: number;
  public cells: Map<string, Cell<T>> = new Map();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setValue(x: number, y: number, value: T) {
    this.cells.set(`${x},${y}`, [x, y, value]);
  }

  getValue(x: number, y: number) {
    const payload = this.cells.get(`${x},${y}`);
    return payload ? payload[2] : undefined;
  }

  forEach(fn: Iterate<T>) {
    for (const payload of this.cells.values()) {
      fn(...payload);
    }
  }

  neighbors(
    x: number,
    y: number,
    arr: Neighbors<T> = [null, null, null, null, null, null, null, null]
  ): Neighbors<T> {
    // previous row
    arr[NeighborIndex.upLeft] = this.getValue(x - 1, y - 1) ?? null;
    arr[NeighborIndex.up] = this.getValue(x, y - 1) ?? null;
    arr[NeighborIndex.upRight] = this.getValue(x + 1, y - 1) ?? null;

    // current row
    arr[NeighborIndex.left] = this.getValue(x - 1, y) ?? null;
    arr[NeighborIndex.right] = this.getValue(x + 1, y) ?? null;

    // next row
    arr[NeighborIndex.downLeft] = this.getValue(x - 1, y + 1) ?? null;
    arr[NeighborIndex.down] = this.getValue(x, y + 1) ?? null;
    arr[NeighborIndex.downRight] = this.getValue(x + 1, y + 1) ?? null;

    return arr;
  }

  transformX<K>(otherGridX: number, otherGrid: Grid<K>) {
    return Math.floor((otherGridX / otherGrid.width) * this.width);
  }

  transformY<K>(otherGridY: number, otherGrid: Grid<K>) {
    return Math.floor((otherGridY / otherGrid.height) * this.height);
  }
}
