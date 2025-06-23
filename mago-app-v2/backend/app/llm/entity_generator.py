from .ollama_integration import generate_entity
import random
import string
from typing import Dict, Any, List, Tuple

class EntityGenerator:
    def __init__(self):
        self.entity_cache = {}
    
    async def create_enemy(self, enemy_type: str, position: Tuple[int, int]) -> Dict[str, Any]:
        if enemy_type in self.entity_cache:
            base = self.entity_cache[enemy_type].copy()
        else:
            base = await generate_entity(enemy_type)
            self.entity_cache[enemy_type] = base
        
        enemy = base.copy()
        enemy["id"] = self._generate_id()
        enemy["position"] = position
        return enemy
    
    async def create_item(self, item_type: str, position: Tuple[int, int]) -> Dict[str, Any]:
        item = await generate_entity(item_type)
        item["id"] = self._generate_id()
        item["position"] = position
        return item
    
    def _generate_id(self, length: int = 8) -> str:
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

entity_generator = EntityGenerator()