/**
 * Returns fragments of the traversed tree
 * supporting a disconnected graph.
 *
 * @see https://stackoverflow.com/questions/41844408/dfs-on-disconnected-graphs
 * @see https://math.stackexchange.com/questions/3146925/how-to-apply-dfs-on-a-disconnected-graph
 */
export function depthFirstSearchAll<T>(graph: Map<T, T[]>) {
  const visited = new Set();
  const results = [];

  for (const startNode of graph.keys()) {
    if (visited.has(startNode)) {
      continue;
    }

    const fragment = depthFirstSearch<T>(graph, startNode);
    for (const node of fragment) {
      visited.add(node);
    }

    results.push(fragment);
  }

  return results;
}

/**
 * https://en.wikipedia.org/wiki/Depth-first_search
 * https://hackernoon.com/a-beginners-guide-to-bfs-and-dfs-in-javascript
 */
export function depthFirstSearch<T>(graph: Map<T, T[]>, start: T) {
  const stack = [start];
  const visited = new Set();
  const results = [];

  while (stack.length) {
    const vertex = stack.pop() as T;

    if (!visited.has(vertex)) {
      visited.add(vertex);
      results.push(vertex);

      for (const neighbor of graph.get(vertex) as T[]) {
        stack.push(neighbor);
      }
    }
  }

  return results;
}
