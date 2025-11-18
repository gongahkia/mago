"""Advanced procedural dungeon generator"""
import random
from typing import List, Tuple, Set
from enum import Enum

class TileType(Enum):
    WALL = "#"
    FLOOR = "."
    DOOR = "+"
    STAIRS_DOWN = ">"
    STAIRS_UP = "<"
    WATER = "~"
    LAVA = "^"
    CHEST = "C"

class Room:
    def __init__(self, x: int, y: int, width: int, height: int):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.center = (x + width // 2, y + height // 2)
    
    def intersects(self, other: 'Room') -> bool:
        """Check if this room intersects another (with 1-tile buffer)"""
        return (
            self.x <= other.x + other.width + 1 and
            self.x + self.width + 1 >= other.x and
            self.y <= other.y + other.height + 1 and
            self.y + self.height + 1 >= other.y
        )

class DungeonGenerator:
    """
    Advanced procedural dungeon generator
    
    Combines multiple algorithms:
    - BSP (Binary Space Partitioning) for large structures
    - Cellular Automata for organic caves
    - Wave Function Collapse for themed rooms (future)
    """
    
    def __init__(self, width: int = 80, height: int = 40, seed: int = None):
        self.width = width
        self.height = height
        self.seed = seed or random.randint(0, 999999)
        random.seed(self.seed)
        
        self.dungeon: List[List[str]] = []
        self.rooms: List[Room] = []
        self.corridors: List[Tuple[int, int]] = []
    
    def generate(self, level: int = 1, theme: str = "dungeon") -> List[List[str]]:
        """
        Generate dungeon based on level and theme
        
        Themes:
        - dungeon: Classic stone dungeon (BSP + rooms)
        - cave: Organic caves (Cellular Automata)
        - fortress: Regular, structured (Grid-based)
        - mixed: Combination of above
        """
        # Initialize empty dungeon (all walls)
        self.dungeon = [[TileType.WALL.value for _ in range(self.width)] 
                        for _ in range(self.height)]
        
        if theme == "cave":
            self._generate_cave(level)
        elif theme == "fortress":
            self._generate_fortress(level)
        else:
            self._generate_dungeon(level)
        
        # Add special features
        self._add_doors()
        self._add_water_pools(level)
        self._add_chests(level)
        
        return self.dungeon
    
    def _generate_dungeon(self, level: int):
        """Generate classic dungeon using BSP"""
        # Number of rooms increases with level
        num_rooms = min(8 + level * 2, 30)
        
        attempts = 0
        max_attempts = num_rooms * 10
        
        while len(self.rooms) < num_rooms and attempts < max_attempts:
            attempts += 1
            
            # Room size varies
            room_width = random.randint(4, 12)
            room_height = random.randint(4, 8)
            room_x = random.randint(1, self.width - room_width - 1)
            room_y = random.randint(1, self.height - room_height - 1)
            
            new_room = Room(room_x, room_y, room_width, room_height)
            
            # Check for intersections
            if not any(new_room.intersects(other) for other in self.rooms):
                self._create_room(new_room)
                
                # Connect to previous room
                if self.rooms:
                    self._create_corridor(new_room.center, self.rooms[-1].center)
                
                self.rooms.append(new_room)
        
        # Add stairs
        if self.rooms:
            self.dungeon[self.rooms[0].center[1]][self.rooms[0].center[0]] = TileType.STAIRS_UP.value
            self.dungeon[self.rooms[-1].center[1]][self.rooms[-1].center[0]] = TileType.STAIRS_DOWN.value
    
    def _generate_cave(self, level: int):
        """Generate organic cave using Cellular Automata"""
        # Initialize with random noise
        for y in range(1, self.height - 1):
            for x in range(1, self.width - 1):
                if random.random() < 0.45:
                    self.dungeon[y][x] = TileType.FLOOR.value
        
        # Run cellular automata iterations
        iterations = 4 + min(level // 2, 3)
        for _ in range(iterations):
            new_dungeon = [row[:] for row in self.dungeon]
            
            for y in range(1, self.height - 1):
                for x in range(1, self.width - 1):
                    wall_count = self._count_adjacent_walls(x, y)
                    
                    # Rules: If 5+ walls nearby, become wall. If 3- walls, become floor
                    if wall_count >= 5:
                        new_dungeon[y][x] = TileType.WALL.value
                    elif wall_count <= 3:
                        new_dungeon[y][x] = TileType.FLOOR.value
            
            self.dungeon = new_dungeon
        
        # Ensure connectivity
        self._connect_cave_regions()
    
    def _generate_fortress(self, level: int):
        """Generate regular fortress with grid pattern"""
        room_size = 6
        corridor_width = 2
        
        for y in range(1, self.height - room_size - 1, room_size + corridor_width):
            for x in range(1, self.width - room_size - 1, room_size + corridor_width):
                room = Room(x, y, room_size, room_size)
                self._create_room(room)
                self.rooms.append(room)
        
        # Connect rooms in grid
        for i, room in enumerate(self.rooms):
            # Connect to right neighbor
            if (i + 1) % ((self.width - 2) // (room_size + corridor_width)) != 0:
                if i + 1 < len(self.rooms):
                    self._create_horizontal_corridor(
                        room.x + room.width, self.rooms[i + 1].x, room.center[1]
                    )
            
            # Connect to bottom neighbor
            row_size = (self.width - 2) // (room_size + corridor_width)
            if i + row_size < len(self.rooms):
                self._create_vertical_corridor(
                    room.center[0], room.y + room.height, self.rooms[i + row_size].y
                )
    
    def _create_room(self, room: Room):
        """Carve out a rectangular room"""
        for y in range(room.y, min(room.y + room.height, self.height - 1)):
            for x in range(room.x, min(room.x + room.width, self.width - 1)):
                self.dungeon[y][x] = TileType.FLOOR.value
    
    def _create_corridor(self, start: Tuple[int, int], end: Tuple[int, int]):
        """Create L-shaped corridor between two points"""
        x1, y1 = start
        x2, y2 = end
        
        # 50% chance to go horizontal first or vertical first
        if random.random() < 0.5:
            # Horizontal then vertical
            self._create_horizontal_corridor(x1, x2, y1)
            self._create_vertical_corridor(x2, y1, y2)
        else:
            # Vertical then horizontal
            self._create_vertical_corridor(x1, y1, y2)
            self._create_horizontal_corridor(x1, x2, y2)
    
    def _create_horizontal_corridor(self, x1: int, x2: int, y: int):
        """Create horizontal corridor"""
        for x in range(min(x1, x2), max(x1, x2) + 1):
            if 0 < x < self.width - 1 and 0 < y < self.height - 1:
                self.dungeon[y][x] = TileType.FLOOR.value
    
    def _create_vertical_corridor(self, x: int, y1: int, y2: int):
        """Create vertical corridor"""
        for y in range(min(y1, y2), max(y1, y2) + 1):
            if 0 < x < self.width - 1 and 0 < y < self.height - 1:
                self.dungeon[y][x] = TileType.FLOOR.value
    
    def _count_adjacent_walls(self, x: int, y: int) -> int:
        """Count walls in 3x3 area (for cellular automata)"""
        count = 0
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                nx, ny = x + dx, y + dy
                if nx == x and ny == y:
                    continue
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    if self.dungeon[ny][nx] == TileType.WALL.value:
                        count += 1
                else:
                    count += 1  # Out of bounds counts as wall
        return count
    
    def _connect_cave_regions(self):
        """Ensure all cave regions are connected"""
        # Find all floor regions using flood fill
        regions = self._find_regions()
        
        if len(regions) <= 1:
            return
        
        # Connect each region to the next largest
        regions.sort(key=len, reverse=True)
        for i in range(1, len(regions)):
            # Pick random tiles from each region
            point1 = random.choice(list(regions[0]))
            point2 = random.choice(list(regions[i]))
            self._create_corridor(point1, point2)
            
            # Merge regions
            regions[0].update(regions[i])
    
    def _find_regions(self) -> List[Set[Tuple[int, int]]]:
        """Find all disconnected floor regions"""
        visited = set()
        regions = []
        
        for y in range(self.height):
            for x in range(self.width):
                if (x, y) not in visited and self.dungeon[y][x] == TileType.FLOOR.value:
                    region = self._flood_fill(x, y, visited)
                    if region:
                        regions.append(region)
        
        return regions
    
    def _flood_fill(self, x: int, y: int, visited: Set[Tuple[int, int]]) -> Set[Tuple[int, int]]:
        """Flood fill to find connected region"""
        if (x, y) in visited or self.dungeon[y][x] != TileType.FLOOR.value:
            return set()
        
        region = set()
        stack = [(x, y)]
        
        while stack:
            cx, cy = stack.pop()
            if (cx, cy) in visited:
                continue
            if self.dungeon[cy][cx] != TileType.FLOOR.value:
                continue
            
            visited.add((cx, cy))
            region.add((cx, cy))
            
            # Check 4 adjacent tiles
            for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    stack.append((nx, ny))
        
        return region
    
    def _add_doors(self):
        """Add doors at room entrances"""
        for room in self.rooms:
            # Check room edges for corridor connections
            for x in range(room.x, room.x + room.width):
                # Top edge
                if (room.y > 0 and 
                    self.dungeon[room.y][x] == TileType.FLOOR.value and
                    self.dungeon[room.y - 1][x] == TileType.FLOOR.value and
                    random.random() < 0.3):
                    self.dungeon[room.y][x] = TileType.DOOR.value
                
                # Bottom edge
                if (room.y + room.height < self.height - 1 and
                    self.dungeon[room.y + room.height - 1][x] == TileType.FLOOR.value and
                    self.dungeon[room.y + room.height][x] == TileType.FLOOR.value and
                    random.random() < 0.3):
                    self.dungeon[room.y + room.height - 1][x] = TileType.DOOR.value
    
    def _add_water_pools(self, level: int):
        """Add water/lava pools based on level"""
        num_pools = random.randint(0, 2 + level // 3)
        
        for _ in range(num_pools):
            pool_size = random.randint(2, 5)
            x = random.randint(1, self.width - pool_size - 1)
            y = random.randint(1, self.height - pool_size - 1)
            
            tile_type = TileType.LAVA if level > 5 and random.random() < 0.3 else TileType.WATER
            
            for dy in range(pool_size):
                for dx in range(pool_size):
                    if self.dungeon[y + dy][x + dx] == TileType.FLOOR.value:
                        self.dungeon[y + dy][x + dx] = tile_type.value
    
    def _add_chests(self, level: int):
        """Add treasure chests in rooms"""
        num_chests = min(len(self.rooms) // 3, 5)
        
        for _ in range(num_chests):
            room = random.choice(self.rooms)
            chest_x = room.x + random.randint(1, room.width - 2)
            chest_y = room.y + random.randint(1, room.height - 2)
            
            if self.dungeon[chest_y][chest_x] == TileType.FLOOR.value:
                self.dungeon[chest_y][chest_x] = TileType.CHEST.value
    
    def get_spawn_point(self) -> Tuple[int, int]:
        """Get valid spawn point (center of first room or random floor)"""
        if self.rooms:
            return self.rooms[0].center
        
        # Find random floor tile
        for _ in range(100):
            x = random.randint(1, self.width - 2)
            y = random.randint(1, self.height - 2)
            if self.dungeon[y][x] == TileType.FLOOR.value:
                return (x, y)
        
        return (self.width // 2, self.height // 2)
