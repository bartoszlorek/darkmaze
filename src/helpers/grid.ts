import { Maybe } from "./types";

export interface GridCell<T> {
  x: number;
  y: number;
  value: T;
}

export type GridNeighbors<T> = [
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>,
  Maybe<GridCell<T>>
];

export enum GridNeighborIndex {
  upLeft = 0,
  up = 1,
  upRight = 2,
  left = 3,
  right = 4,
  downLeft = 5,
  down = 6,
  downRight = 7,
}

export class GridMap<T> extends Map<string, GridCell<T>> {
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }

  setValue(x: number, y: number, value: T) {
    this.set(`${x},${y}`, { x, y, value });
  }

  getValue(x: number, y: number) {
    return this.get(`${x},${y}`);
  }

  neighbors(
    x: number,
    y: number,
    arr: GridNeighbors<T> = [null, null, null, null, null, null, null, null]
  ): GridNeighbors<T> {
    // previous row
    arr[GridNeighborIndex.upLeft] = this.getValue(x - 1, y - 1) ?? null;
    arr[GridNeighborIndex.up] = this.getValue(x, y - 1) ?? null;
    arr[GridNeighborIndex.upRight] = this.getValue(x + 1, y - 1) ?? null;

    // current row
    arr[GridNeighborIndex.left] = this.getValue(x - 1, y) ?? null;
    arr[GridNeighborIndex.right] = this.getValue(x + 1, y) ?? null;

    // next row
    arr[GridNeighborIndex.downLeft] = this.getValue(x - 1, y + 1) ?? null;
    arr[GridNeighborIndex.down] = this.getValue(x, y + 1) ?? null;
    arr[GridNeighborIndex.downRight] = this.getValue(x + 1, y + 1) ?? null;

    return arr;
  }

  transformX<K>(otherGridX: number, otherGrid: GridMap<K>) {
    return Math.floor((otherGridX / otherGrid.width) * this.width);
  }

  transformY<K>(otherGridY: number, otherGrid: GridMap<K>) {
    return Math.floor((otherGridY / otherGrid.height) * this.height);
  }
}
