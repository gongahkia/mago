import { getNeighbors, manhattanDistance } from '../utils/grid-math';

interface PathfinderRequest {
  start: { x: number; y: number };
  goal: { x: number; y: number };
  grid: number[][];
  maxIterations?: number;
}

interface PathfinderResponse {
  path: { x: number; y: number }[] | null;
  error?: string;
}

function aStar({
  start,
  goal,
  grid,
  maxIterations = 2000
}: PathfinderRequest): PathfinderResponse {
  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  let iterations = 0;

  const nodeKey = (pos: { x: number; y: number }) => `${pos.x},${pos.y}`;

  try {
    const startKey = nodeKey(start);
    const goalKey = nodeKey(goal);
    const gScore = new Map<string, number>([[startKey, 0]]);
    const fScore = new Map<string, number>([
      [startKey, manhattanDistance(start.x, start.y, goal.x, goal.y)]
    ]);

    openSet.add(startKey);

    while (openSet.size > 0 && iterations++ < maxIterations) {
      let current: string | null = null;
      let lowestF = Infinity;
      
      for (const node of openSet) {
        const score = fScore.get(node) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          current = node;
        }
      }

      if (!current) break;

      if (current === goalKey) {
        return {
          path: reconstructPath(cameFrom, current)
        };
      }

      openSet.delete(current);
      closedSet.add(current);

      const [x, y] = current.split(',').map(Number);
      
      for (const neighbor of getNeighbors(x, y)) {
        const key = nodeKey(neighbor);
        if (closedSet.has(key)) continue;
        
        if (
          neighbor.y < 0 || neighbor.y >= grid.length ||
          neighbor.x < 0 || neighbor.x >= grid[0].length ||
          grid[neighbor.y][neighbor.x] === 0
        ) continue;

        const tentativeG = (gScore.get(current) ?? Infinity) + 1;
        
        if (tentativeG < (gScore.get(key) ?? Infinity)) {
          cameFrom.set(key, current);
          gScore.set(key, tentativeG);
          fScore.set(key, tentativeG + manhattanDistance(
            neighbor.x, neighbor.y, goal.x, goal.y
          ));
          
          if (!openSet.has(key)) {
            openSet.add(key);
          }
        }
      }
    }

    return { path: null };
  } catch (error) {
    return {
      path: null,
      error: error instanceof Error ? error.message : 'Pathfinding failed'
    };
  }
}

function reconstructPath(
  cameFrom: Map<string, string>,
  current: string
): { x: number; y: number }[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(current);
  }
  return path.map(node => {
    const [x, y] = node.split(',').map(Number);
    return { x, y };
  });
}

self.onmessage = (event: MessageEvent<PathfinderRequest>) => {
  const result = aStar(event.data);
  self.postMessage(result);
};