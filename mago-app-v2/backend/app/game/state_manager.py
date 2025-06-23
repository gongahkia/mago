"""
Manages persistent game state including dungeon layout, entities, and player status
Uses JSON file storage for persistence between sessions
"""
import json
import os
from typing import Dict, Any, List, Tuple

class GameStateManager:
    def __init__(self, save_file: str = "game_state.json"):
        self.save_file = save_file
        self.current_state: Dict[str, Any] = self._initialize_default_state()
        
def _initialize_default_state(self) -> Dict[str, Any]:
    """Create a new game state with varied entities and AI-driven elements"""
    width, height = 50, 50
    # Generate dungeon layout
    dungeon = []
    for y in range(height):
        row = []
        for x in range(width):
            if x == 0 or y == 0 or x == width-1 or y == height-1:
                row.append('#')  # Border walls
            else:
                # More complex terrain generation
                if (x * y) % 7 == 0:
                    row.append('+')  # Doors
                elif (x + y) % 5 == 0:
                    row.append('>')  # Stairs
                elif random.random() < 0.25:
                    row.append('#')  # Random walls
                else:
                    row.append('.')  # Floor
        dungeon.append(row)

    # Helper to find valid positions
    def find_valid_position():
        while True:
            x, y = random.randint(1, width-2), random.randint(1, height-2)
            if dungeon[y][x] == '.':
                return (x, y)

    # Initialize player at center
    player_pos = (width // 2, height // 2)
    if dungeon[player_pos[1]][player_pos[0]] != '.':
        player_pos = find_valid_position()  # Fallback if center is blocked

    # Initialize enemies with varied AI personalities
    enemy_types = [
        {'type': 'goblin', 'symbol': 'g', 'color': '#00FF00', 
         'ai_trait': 'cowardly', 'health': 8, 'attack': 3},
        {'type': 'orc', 'symbol': 'O', 'color': '#FFA500', 
         'ai_trait': 'aggressive', 'health': 15, 'attack': 5},
        {'type': 'dragon', 'symbol': 'D', 'color': '#FF5555', 
         'ai_trait': 'strategic', 'health': 30, 'attack': 8},
        {'type': 'ghost', 'symbol': 'G', 'color': '#ADD8E6', 
         'ai_trait': 'ambusher', 'health': 12, 'attack': 4}
    ]
    
    enemies = []
    for _ in range(10):  # More enemies
        pos = find_valid_position()
        enemy_type = random.choice(enemy_types)
        enemies.append({
            'id': f'enemy_{random.randint(1000,9999)}',
            'type': enemy_type['type'],
            'position': pos,
            'health': enemy_type['health'],
            'attack_power': enemy_type['attack'],
            'symbol': enemy_type['symbol'],
            'color': enemy_type['color'],
            'ai_trait': enemy_type['ai_trait'],  # AI personality trait
            'last_action': None  # For tracking AI decisions
        })

    # Initialize items with potential AI-generated events
    item_types = [
        {'type': 'health_potion', 'symbol': '!', 'color': '#FF0000', 'effect': 10},
        {'type': 'scroll_of_confusion', 'symbol': '?', 'color': '#800080', 'effect': 'confuse'},
        {'type': 'sword', 'symbol': '/', 'color': '#CCCCCC', 'effect': 3},
        {'type': 'ai_artifact', 'symbol': '*', 'color': '#FFFF00', 'effect': 'summon'}
    ]
    
    items = []
    for _ in range(8):  # More items
        pos = find_valid_position()
        item_type = random.choice(item_types)
        items.append({
            'id': f'item_{random.randint(1000,9999)}',
            'type': item_type['type'],
            'position': pos,
            'symbol': item_type['symbol'],
            'color': item_type['color'],
            'effect': item_type['effect']
        })

    # Add AI-generated events
    events = []
    for _ in range(3):  # Random events
        event_type = random.choice(['earthquake', 'treasure_hoard', 'monster_nest'])
        pos = find_valid_position()
        events.append({
            'type': event_type,
            'position': pos,
            'triggered': False,
            'description': f"{event_type.replace('_', ' ').title()} awaits discovery"
        })

    return {
        'dungeon': dungeon,
        'player': {
            'position': player_pos,
            'health': 20,
            'max_health': 20,
            'attack_power': 5,
            'inventory': [],
            'effects': []
        },
        'enemies': enemies,
        'items': items,
        'events': events,  # New AI-driven events
        'current_level': 1,
        'message_log': [
            "Welcome to Mago!",
            "The dungeon whispers with ancient magic...",
            "AI entities watch your every move"
        ]
    }

    # def _initialize_default_state(self) -> Dict[str, Any]:
    #     """Create a new game state with default values"""
    #     return {
    #         "dungeon": [],
    #         "player": {
    #             "position": (10, 10),
    #             "health": 20,
    #             "max_health": 20,
    #             "attack_power": 5,
    #             "inventory": []
    #         },
    #         "enemies": [],
    #         "items": [],
    #         "current_level": 1,
    #         "message_log": ["Welcome to Mago!"]
    #     }
    
    def generate_new_dungeon(self, width: int = 50, height: int = 50) -> None:
        """Generate a simple dungeon layout"""
        dungeon = []
        for y in range(height):
            row = []
            for x in range(width):
                if x == 0 or y == 0 or x == width-1 or y == height-1:
                    row.append('#')  # Border walls
                else:
                    # 70% floor, 30% wall
                    row.append('.' if (x + y) % 3 != 0 else '#')
            dungeon.append(row)
        self.current_state["dungeon"] = dungeon
    
    def save_state(self) -> None:
        """Persist game state to disk"""
        with open(self.save_file, 'w') as f:
            json.dump(self.current_state, f, indent=2)
    
    def load_state(self) -> bool:
        """Load game state from disk"""
        if not os.path.exists(self.save_file):
            return False
            
        try:
            with open(self.save_file, 'r') as f:
                self.current_state = json.load(f)
            return True
        except json.JSONDecodeError:
            return False
    
    def update_entity_position(self, entity_id: str, new_position: Tuple[int, int]) -> None:
        """Update position of player or enemy"""
        if entity_id == "player":
            self.current_state["player"]["position"] = new_position
        else:
            for enemy in self.current_state["enemies"]:
                if enemy["id"] == entity_id:
                    enemy["position"] = new_position
                    break
    
    def add_enemy(self, enemy_data: Dict[str, Any]) -> None:
        """Add a new enemy to the game state"""
        self.current_state["enemies"].append(enemy_data)
    
    def add_message(self, message: str) -> None:
        """Add message to game log"""
        self.current_state["message_log"].append(message)
        # Keep only last 10 messages
        if len(self.current_state["message_log"]) > 10:
            self.current_state["message_log"] = self.current_state["message_log"][-10:]
    
    def get_player_position(self) -> Tuple[int, int]:
        """Get current player position"""
        return tuple(self.current_state["player"]["position"])
    
    def get_enemy_positions(self) -> List[Tuple[int, int]]:
        """Get positions of all enemies"""
        return [tuple(enemy["position"]) for enemy in self.current_state["enemies"]]
    
    def get_dungeon(self) -> List[List[str]]:
        """Get current dungeon layout"""
        return self.current_state["dungeon"]

# Singleton instance for global access
game_state_manager = GameStateManager()