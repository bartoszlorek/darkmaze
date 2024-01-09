import { depthFirstSearchAll } from "./dfs";

export type Vertex = [x: number, y: number];

export type CornerType = "none" | "convex" | "concave";

export class Edge {
  public a: Vertex;
  public b: Vertex;
  public vector: Vertex;

  // https://en.wikipedia.org/wiki/Rectilinear_polygon
  public cornerA: CornerType = "none";
  public cornerB: CornerType = "none";

  constructor(a: Vertex, b: Vertex) {
    this.a = a;
    this.b = b;
    this.vector = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  }

  connects(other: Edge) {
    return (
      (this.a[0] === other.b[0] && this.a[1] === other.b[1]) ||
      (this.b[0] === other.a[0] && this.b[1] === other.a[1])
    );
  }

  toString() {
    return `${this.a[0]},${this.a[1]},${this.b[0]},${this.b[1]}`;
  }
}

export class Tile {
  public x: number;
  public y: number;

  public up: Edge;
  public right: Edge;
  public down: Edge;
  public left: Edge;

  constructor(x: number, y: number, size: number) {
    this.x = x;
    this.y = y;

    const sx = x * size;
    const sy = y * size;

    this.up = new Edge([sx, sy], [sx + size, sy]);
    this.right = new Edge([sx + size, sy], [sx + size, sy + size]);
    this.down = new Edge([sx + size, sy + size], [sx, sy + size]);
    this.left = new Edge([sx, sy + size], [sx, sy]);
  }

  toString() {
    return `${this.x},${this.y}`;
  }
}

export class TilesOutline {
  public tiles: Map<string, Tile> = new Map();
  public vertices: Map<string, number> = new Map();
  public edges: Edge[][] = [];

  addTile(x: number, y: number, size: number) {
    const tile = new Tile(x, y, size);
    this.tiles.set(`${x},${y}`, tile);

    const upKey = `${tile.up.a[0]},${tile.up.a[1]}`;
    const rightKey = `${tile.right.a[0]},${tile.right.a[1]}`;
    const downKey = `${tile.down.a[0]},${tile.down.a[1]}`;
    const leftKey = `${tile.left.a[0]},${tile.left.a[1]}`;

    // the number of vertex connections
    // determines the type of angle
    this.vertices.set(upKey, (this.vertices.get(upKey) ?? 0) + 1);
    this.vertices.set(rightKey, (this.vertices.get(rightKey) ?? 0) + 1);
    this.vertices.set(downKey, (this.vertices.get(downKey) ?? 0) + 1);
    this.vertices.set(leftKey, (this.vertices.get(leftKey) ?? 0) + 1);
  }

  getTile(x: number, y: number) {
    return this.tiles.get(`${x},${y}`);
  }

  parse() {
    const edges: Edge[] = [];
    const graph = new Map<Edge, Edge[]>();

    for (const t of this.tiles.values()) {
      if (!this.getTile(t.x, t.y - 1)) edges.push(t.up);
      if (!this.getTile(t.x + 1, t.y)) edges.push(t.right);
      if (!this.getTile(t.x, t.y + 1)) edges.push(t.down);
      if (!this.getTile(t.x - 1, t.y)) edges.push(t.left);
    }

    for (const edge of edges) {
      graph.set(
        edge,
        edges.filter((other) => edge !== other && edge.connects(other))
      );

      // updates corner types of the edge
      const a = this.vertices.get(`${edge.a[0]},${edge.a[1]}`);
      const b = this.vertices.get(`${edge.b[0]},${edge.b[1]}`);
      edge.cornerA = a === 1 ? "convex" : a === 3 ? "concave" : "none";
      edge.cornerB = b === 1 ? "convex" : b === 3 ? "concave" : "none";
    }

    const cycles = depthFirstSearchAll(graph);
    for (const cycle of cycles) {
      if (!isClockwise(cycle)) {
        cycle.reverse();
      }
    }

    this.edges = cycles;
  }
}

/**
 * @see https://github.com/mattdesl/is-clockwise
 * @see https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
 */
function isClockwise(edges: Edge[]) {
  let sum = 0;
  for (const edge of edges) {
    sum += (edge.b[0] - edge.a[0]) * (edge.b[1] + edge.a[1]);
  }
  return sum > 0;
}
