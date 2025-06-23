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
        """Create a new game state with default values"""
        return {
            "dungeon": [],
            "player": {
                "position": (10, 10),
                "health": 20,
                "max_health": 20,
                "attack_power": 5,
                "inventory": []
            },
            "enemies": [],
            "items": [],
            "current_level": 1,
            "message_log": ["Welcome to Mago!"]
        }
    
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