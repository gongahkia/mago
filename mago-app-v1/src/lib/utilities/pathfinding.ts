import { Position, Direction } from './geometry';

export interface PathNode {
  position: Position;
  gCost: number;
  hCost: number;
  parent?: PathNode;
}

export const aStarPathfind = (
  start: Position,
  end: Position,
  isWalkable: (pos: Position) => boolean
): Direction | null => {
  const openSet: PathNode[] = [{
    position: start,
    gCost: 0,
    hCost: manhattanDistance(start, end)
  }];
  const closedSet = new Set<string>();

  while (openSet.length > 0) {
    const current = openSet.reduce((min, node) => 
      node.gCost + node.hCost < min.gCost + min.hCost ? node : min, openSet[0]);
    
    if (positionsEqual(current.position, end)) {
      return reconstructPath(current);
    }

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(`${current.position[0]},${current.position[1]}`);

    for (const dir of allDirections) {
      const neighbor: Position = [
        current.position[0] + dir.x,
        current.position[1] + dir.y
      ];
      
      if (!isWalkable(neighbor) || closedSet.has(`${neighbor[0]},${neighbor[1]}`)) {
        continue;
      }

      const gCost = current.gCost + 1;
      const existing = openSet.find(n => positionsEqual(n.position, neighbor));
      
      if (!existing || gCost < existing.gCost) {
        const newNode = {
          position: neighbor,
          gCost,
          hCost: manhattanDistance(neighbor, end),
          parent: current
        };
        
        if (!existing) openSet.push(newNode);
        else Object.assign(existing, newNode);
      }
    }
  }
  return null;
};

const reconstructPath = (node: PathNode): Direction => {
  let current: PathNode | undefined = node;
  const path: Position[] = [];
  
  while (current?.parent) {
    path.unshift(current.position);
    current = current.parent;
  }
  
  return path[0] ? {
    x: path[0][0] - current.position[0],
    y: path[0][1] - current.position[1]
  } : { x: 0, y: 0 };
};