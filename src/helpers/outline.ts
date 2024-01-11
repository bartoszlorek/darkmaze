import { depthFirstSearchAll } from "./dfs";

export class Point {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  isEqual(other: Point) {
    return this.x === other.x && this.y === other.y;
  }

  toString() {
    return `${this.x},${this.y}`;
  }
}

export class Vertex extends Point {
  /**
   * ```
   *  A--B--C
   *  |     |
   *  H  E--D
   *  |  |
   *  G--F
   *
   * ```
   * - `straight` - no corners, just a straight line connection, e.g. B, H.
   * - `convex` - corner in which the smaller angle (90°) is interior, e.g. A, C, D, F, G.
   * - `concave` - corner in which the larger angle (270°) is interior, e.g. E.
   *
   * @see https://en.wikipedia.org/wiki/Rectilinear_polygon
   */
  public type: "straight" | "convex" | "concave" = "straight";

  constructor(x: number, y: number) {
    super(x, y);
  }

  setType(connections: number) {
    if (connections === 1) {
      this.type = "convex";
    } else if (connections === 3) {
      this.type = "concave";
    } else {
      this.type = "straight";
    }
  }
}

export class Edge {
  public a: Vertex;
  public b: Vertex;
  public vector: Point;

  constructor(a: Vertex, b: Vertex) {
    this.a = a;
    this.b = b;
    this.vector = new Point(Math.sign(b.x - a.x), Math.sign(b.y - a.y));
  }

  isEqual(other: Edge) {
    return (
      (this.a.isEqual(other.a) && this.b.isEqual(other.b)) ||
      (this.a.isEqual(other.b) && this.b.isEqual(other.a))
    );
  }

  isConnected(other: Edge) {
    return this.a.isEqual(other.b) || this.b.isEqual(other.a);
  }

  toString() {
    return `${this.a.x},${this.a.y},${this.b.x},${this.b.y}`;
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
    const a = new Vertex(sx, sy);
    const b = new Vertex(sx + size, sy);
    const c = new Vertex(sx + size, sy + size);
    const d = new Vertex(sx, sy + size);

    this.up = new Edge(a, b);
    this.right = new Edge(b, c);
    this.down = new Edge(c, d);
    this.left = new Edge(d, a);
  }

  toString() {
    return Tile.toString(this.x, this.y);
  }

  static toString(x: number, y: number) {
    return `${x},${y}`;
  }
}

export class TilesOutline {
  public tiles: Map<string, Tile> = new Map();
  public vertices: Map<string, number> = new Map();
  public edges: Edge[][] = [];

  addTile(x: number, y: number, size: number) {
    const tile = new Tile(x, y, size);
    this.tiles.set(tile.toString(), tile);

    const upKey = tile.up.a.toString();
    const rightKey = tile.right.a.toString();
    const downKey = tile.down.a.toString();
    const leftKey = tile.left.a.toString();

    // the number of vertex connections
    // determines the type of angle
    this.vertices.set(upKey, (this.vertices.get(upKey) ?? 0) + 1);
    this.vertices.set(rightKey, (this.vertices.get(rightKey) ?? 0) + 1);
    this.vertices.set(downKey, (this.vertices.get(downKey) ?? 0) + 1);
    this.vertices.set(leftKey, (this.vertices.get(leftKey) ?? 0) + 1);

    return tile;
  }

  getTile(x: number, y: number) {
    return this.tiles.get(Tile.toString(x, y));
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
        edges.filter((other) => edge !== other && edge.isConnected(other))
      );

      // updates vertex types of the edge
      edge.a.setType(this.vertices.get(edge.a.toString()) || 0);
      edge.b.setType(this.vertices.get(edge.b.toString()) || 0);
    }

    const cycles = depthFirstSearchAll(graph);
    for (const cycle of cycles) {
      if (cycle.length > 1 && !cycle[0].b.isEqual(cycle[1].a)) {
        cycle.reverse();
      }
    }

    this.edges = cycles;
  }
}
