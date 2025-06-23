"""
Generates game entities using LLM with validation
"""
from .ollama_integration import generate_entity
import random
import string
from typing import Dict, Any, List, Tuple

class EntityGenerator:
    def __init__(self):
        self.entity_cache = {}
    
    async def create_enemy(self, enemy_type: str, position: Tuple[int, int]) -> Dict[str, Any]:
        """Create a new enemy entity with LLM"""
        # Check cache first
        if enemy_type in self.entity_cache:
            base = self.entity_cache[enemy_type].copy()
        else:
            base = await generate_entity(enemy_type)
            self.entity_cache[enemy_type] = base
        
        # Create unique instance
        enemy = base.copy()
        enemy["id"] = self._generate_id()
        enemy["position"] = position
        return enemy
    
    async def create_item(self, item_type: str, position: Tuple[int, int]) -> Dict[str, Any]:
        """Create a new game item with LLM"""
        item = await generate_entity(item_type)
        item["id"] = self._generate_id()
        item["position"] = position
        return item
    
    def _generate_id(self, length: int = 8) -> str:
        """Generate unique entity ID"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Global generator instance
entity_generator = EntityGenerator()