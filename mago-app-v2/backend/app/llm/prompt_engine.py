"""
Creates structured prompts for LLM interactions
"""
import json
from typing import Dict, Any, List, Tuple

def get_decision_prompt(context: Dict[str, Any]) -> str:
    """Generate prompt for enemy decision-making"""
    return f"""
You are a {context['enemy_type']} in a roguelike dungeon. Your goal is to act according to your monster type.

Game Context:
- Player position: {context['player_position']}
- Your position: {context['enemy_position']}
- Current dungeon level: 1

Available Actions:
1. Move: Change your position (dx/dy between -1 and 1)
2. Attack: If player is adjacent (distance <= 1)
3. Use special ability: If available

Rules:
- Stay within dungeon boundaries
- Don't walk through walls
- Act according to your monster type

Output Format (JSON ONLY):
{{
  "action": "move" | "attack" | "ability",
  "dx": [if moving, integer -1/0/1],
  "dy": [if moving, integer -1/0/1],
  "target": [if attacking, "player"]
}}

Current Situation:
The player is at {context['player_position']} and you are at {context['enemy_position']}.
The dungeon layout around you:
{_get_dungeon_snippet(context['dungeon'], context['enemy_position'], 3)}

Decision (JSON ONLY):
""".strip()

def get_entity_prompt(entity_type: str, context: Dict[str, Any] = None) -> str:
    """Generate prompt for entity creation"""
    return f"""
Create a new {entity_type} for a roguelike game. Follow these guidelines:

Output Format (JSON ONLY):
{{
  "type": "{entity_type}",
  "name": "Creative name",
  "description": "Brief description",
  "health": [number],
  "attack_power": [number],
  "abilities": ["list", "of", "abilities"],
  "symbol": "ASCII character",
  "color": "HEX color code"
}}

Examples:
Goblin: {{
  "type": "goblin",
  "name": "Grubnash",
  "description": "Small green creature with sharp teeth",
  "health": 8,
  "attack_power": 3,
  "abilities": ["stealth"],
  "symbol": "g",
  "color": "#55FF55"
}}

Dragon: {{
  "type": "dragon",
  "name": "Ignis",
  "description": "Ancient fire dragon",
  "health": 100,
  "attack_power": 15,
  "abilities": ["fire_breath", "fly"],
  "symbol": "D",
  "color": "#FF5555"
}}

Create a new {entity_type}:
""".strip()

def _get_dungeon_snippet(dungeon: List[List[str]], center: Tuple[int, int], radius: int) -> str:
    """Get a small area of the dungeon for context"""
    cx, cy = center
    snippet = []
    for y in range(cy-radius, cy+radius+1):
        row = []
        for x in range(cx-radius, cx+radius+1):
            if 0 <= y < len(dungeon) and 0 <= x < len(dungeon[0]):
                row.append(dungeon[y][x])
            else:
                row.append(' ')
        snippet.append(''.join(row))
    return '\n'.join(snippet)