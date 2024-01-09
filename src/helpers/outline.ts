import { depthFirstSearchAll } from "./dfs";

export type Vertex = [x: number, y: number];

export class Edge {
  public a: Vertex;
  public b: Vertex;
  public vector: Vertex;

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
}

export class TilesOutline {
  public tiles: Map<string, Vertex> = new Map();
  public edges: Edge[][] = [];

  addTile(x: number, y: number) {
    this.tiles.set(`${x},${y}`, [x, y]);
  }

  getTile(x: number, y: number) {
    return this.tiles.get(`${x},${y}`);
  }

  buildEdges(size: number) {
    const edges: Edge[] = [];
    const graph = new Map<Edge, Edge[]>();

    for (const [x, y] of this.tiles.values()) {
      const sx = x * size;
      const sy = y * size;

      // up
      if (!this.getTile(x, y - 1)) {
        edges.push(new Edge([sx, sy], [sx + size, sy]));
      }

      // right
      if (!this.getTile(x + 1, y)) {
        edges.push(new Edge([sx + size, sy], [sx + size, sy + size]));
      }

      // down
      if (!this.getTile(x, y + 1)) {
        edges.push(new Edge([sx + size, sy + size], [sx, sy + size]));
      }

      // left
      if (!this.getTile(x - 1, y)) {
        edges.push(new Edge([sx, sy + size], [sx, sy]));
      }
    }

    for (let i = 0; i < edges.length; i++) {
      const connectedEdges: Edge[] = [];

      for (let j = 0; j < edges.length; j++) {
        if (i !== j && edges[i].connects(edges[j])) {
          connectedEdges.push(edges[j]);
        }
      }

      graph.set(edges[i], connectedEdges);
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
