// https://www.geeksforgeeks.org/difference-between-bfs-and-dfs/
// https://hackernoon.com/a-beginners-guide-to-bfs-and-dfs-in-javascript

/**
 * @see https://stackoverflow.com/a/62315179
 * @see https://en.wikipedia.org/wiki/Breadth-first_search
 */
export function findFarthestNode<T>(start: T, neighbors: (node: T) => T[]) {
  const queue = [start];
  const visited = new Set<T>();

  while (queue.length > 0) {
    const node = queue.shift() as T;

    if (!visited.has(node)) {
      visited.add(node);

      for (const neighbor of neighbors(node)) {
        queue.push(neighbor);
      }
    }
  }

  const array = Array.from(visited);
  return array[array.length - 1];
}

/**
 * @see https://medium.com/swlh/solving-mazes-with-depth-first-search-e315771317ae
 * @see https://en.wikipedia.org/wiki/Depth-first_search
 */
export function findPathUntil<T>(
  start: T,
  neighbors: (node: T) => T[],
  predicate: (node: T) => boolean
) {
  const stack = [[start]];
  const visited = new Set<T>();

  while (stack.length > 0) {
    const path = stack.pop() as T[];

    const leadingNode = path[path.length - 1];
    if (predicate(leadingNode)) {
      return path;
    }

    if (!visited.has(leadingNode)) {
      visited.add(leadingNode);

      for (const neighbor of neighbors(leadingNode)) {
        stack.push([...path, neighbor]);
      }
    }
  }

  return [];
}
