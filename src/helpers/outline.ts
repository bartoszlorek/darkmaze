import { depthFirstSearchAll } from "./dfs";

export type Vertex = [x: number, y: number];

export class Edge {
  public a: Vertex;
  public b: Vertex;

  constructor(a: Vertex, b: Vertex) {
    this.a = a;
    this.b = b;
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

  parse(size: number) {
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

        graph.set(edges[i], connectedEdges);
      }
    }

    this.edges = depthFirstSearchAll(graph);
  }
}
