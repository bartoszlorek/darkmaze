import { Direction8Neighbors, createEmptyNeighbors8 } from "./direction";

export interface GridCell<T> {
  x: number;
  y: number;
  value: T;
}

export class GridMap<T> extends Map<string, GridCell<T>> {
  public width: number;
  public height: number;
  public minX: number = Infinity;
  public minY: number = Infinity;
  public maxX: number = -Infinity;
  public maxY: number = -Infinity;

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }

  setValue(x: number, y: number, value: T) {
    this.set(`${x},${y}`, { x, y, value });

    if (x < this.minX) this.minX = x;
    if (x > this.maxX) this.maxX = x;
    if (y < this.minY) this.minY = y;
    if (y > this.maxY) this.maxY = y;
  }

  setIfNotValue(x: number, y: number, value: T) {
    if (!this.has(`${x},${y}`)) this.setValue(x, y, value);
  }

  getValue(x: number, y: number) {
    return this.get(`${x},${y}`);
  }

  neighbors(
    x: number,
    y: number,
    output: Direction8Neighbors<GridCell<T>> = createEmptyNeighbors8()
  ) {
    output.upLeft = this.getValue(x - 1, y - 1) ?? null;
    output.up = this.getValue(x, y - 1) ?? null;
    output.upRight = this.getValue(x + 1, y - 1) ?? null;
    output.left = this.getValue(x - 1, y) ?? null;
    output.right = this.getValue(x + 1, y) ?? null;
    output.downLeft = this.getValue(x - 1, y + 1) ?? null;
    output.down = this.getValue(x, y + 1) ?? null;
    output.downRight = this.getValue(x + 1, y + 1) ?? null;
    return output;
  }

  isEdgeCell(neighbors: Direction8Neighbors<GridCell<T>>) {
    return (
      neighbors.upLeft === null ||
      neighbors.up === null ||
      neighbors.upRight === null ||
      neighbors.left === null ||
      neighbors.right === null ||
      neighbors.downLeft === null ||
      neighbors.down === null ||
      neighbors.downRight === null
    );
  }

  transformX<K>(otherGridX: number, otherGrid: GridMap<K>) {
    return Math.floor((otherGridX / otherGrid.width) * this.width);
  }

  transformY<K>(otherGridY: number, otherGrid: GridMap<K>) {
    return Math.floor((otherGridY / otherGrid.height) * this.height);
  }
}
