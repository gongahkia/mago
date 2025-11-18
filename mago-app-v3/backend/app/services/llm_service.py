"""Hybrid LLM service - routes between local and remote models"""
import asyncio
import logging
from typing import Dict, Any, Optional
from enum import Enum
import ollama

from app.core.config import settings
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

class DecisionComplexity(Enum):
    """Classification of AI decision complexity"""
    SIMPLE = "simple"      # Basic pathfinding, simple combat
    MODERATE = "moderate"  # Tactical combat, simple dialogue
    COMPLEX = "complex"    # Quest generation, story, complex reasoning

class HybridLLMService:
    """
    Intelligent LLM routing service
    
    Routes decisions to:
    - Client WebLLM: Simple, latency-sensitive decisions
    - Server Ollama: Complex reasoning, content generation
    - Redis Cache: Previously seen scenarios
    """
    
    def __init__(self):
        self.ollama_available = True
        self._check_ollama()
    
    def _check_ollama(self):
        """Check if Ollama is available"""
        try:
            ollama.list()
            logger.info("Ollama service available")
        except Exception as e:
            logger.warning(f"Ollama unavailable: {e}")
            self.ollama_available = False
    
    def classify_decision(self, context: Dict[str, Any]) -> DecisionComplexity:
        """
        Classify decision complexity based on context
        
        Simple: Enemy movement, basic actions
        Moderate: Combat tactics, dialogue options
        Complex: Quest generation, world events, story
        """
        decision_type = context.get("type", "")
        
        if decision_type in ["enemy_movement", "pathfinding", "basic_attack"]:
            return DecisionComplexity.SIMPLE
        elif decision_type in ["combat_tactic", "dialogue_choice", "item_use"]:
            return DecisionComplexity.MODERATE
        else:
            return DecisionComplexity.COMPLEX
    
    async def get_decision(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get AI decision with intelligent routing
        
        Flow:
        1. Check cache
        2. Classify complexity
        3. Route to appropriate model
        4. Cache result
        """
        # Generate cache key
        cache_key = self._generate_cache_key(context)
        
        # Check cache
        if settings.ENABLE_LLM_CACHE:
            cached = await redis_client.get(cache_key)
            if cached:
                logger.debug(f"Cache hit for {cache_key}")
                return cached
        
        # Classify and route
        complexity = self.classify_decision(context)
        
        if complexity == DecisionComplexity.SIMPLE:
            # Use client-side LLM (signal to frontend)
            decision = {
                "route": "client",
                "action": "delegate_to_client",
                "context": context
            }
        elif complexity == DecisionComplexity.MODERATE and self.ollama_available:
            # Use server Ollama with short prompt
            decision = await self._get_ollama_decision(context, max_tokens=100)
        elif complexity == DecisionComplexity.COMPLEX and self.ollama_available:
            # Use server Ollama with full reasoning
            decision = await self._get_ollama_decision(context, max_tokens=500)
        else:
            # Fallback to rule-based
            decision = self._get_fallback_decision(context)
        
        # Cache result
        if settings.ENABLE_LLM_CACHE:
            await redis_client.set(cache_key, decision, ttl=settings.LLM_CACHE_TTL)
        
        return decision
    
    async def _get_ollama_decision(self, context: Dict[str, Any], max_tokens: int = 200) -> Dict[str, Any]:
        """Get decision from Ollama"""
        prompt = self._build_prompt(context)
        
        try:
            response = ollama.chat(
                model=settings.OLLAMA_MODEL,
                messages=[
                    {"role": "system", "content": "You are a tactical AI for a roguelike game. Respond with JSON only."},
                    {"role": "user", "content": prompt}
                ],
                options={
                    "temperature": 0.7,
                    "num_predict": max_tokens,
                }
            )
            
            # Parse JSON response
            import json
            decision = json.loads(response['message']['content'])
            decision['route'] = 'server'
            return decision
            
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return self._get_fallback_decision(context)
    
    def _build_prompt(self, context: Dict[str, Any]) -> str:
        """Build prompt based on context type"""
        decision_type = context.get("type", "")
        
        if decision_type == "enemy_movement":
            return f"""
Given:
- Enemy: {context.get('enemy_type')} at {context.get('enemy_pos')}
- Player: at {context.get('player_pos')}
- Surroundings: {context.get('nearby_tiles', 'unknown')}

Decide enemy action. Respond with JSON:
{{"action": "move"|"attack"|"ability", "dx": -1/0/1, "dy": -1/0/1}}
"""
        elif decision_type == "generate_quest":
            return f"""
Generate a quest for a level {context.get('player_level', 1)} player in a {context.get('dungeon_theme', 'dark')} dungeon.

Respond with JSON:
{{
    "title": "Quest Name",
    "description": "Quest description",
    "objectives": ["objective1", "objective2"],
    "rewards": {{"experience": 100, "gold": 50}},
    "difficulty": "easy"|"medium"|"hard"
}}
"""
        else:
            return f"Context: {context}\nDecide action (JSON format):"
    
    def _get_fallback_decision(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based fallback when LLM unavailable"""
        decision_type = context.get("type", "")
        
        if decision_type == "enemy_movement":
            # Simple pathfinding toward player
            enemy_pos = context.get("enemy_pos", (0, 0))
            player_pos = context.get("player_pos", (0, 0))
            
            dx = 0 if enemy_pos[0] == player_pos[0] else (1 if player_pos[0] > enemy_pos[0] else -1)
            dy = 0 if enemy_pos[1] == player_pos[1] else (1 if player_pos[1] > enemy_pos[1] else -1)
            
            return {
                "route": "fallback",
                "action": "move",
                "dx": dx,
                "dy": dy
            }
        
        return {
            "route": "fallback",
            "action": "wait"
        }
    
    def _generate_cache_key(self, context: Dict[str, Any]) -> str:
        """Generate cache key from context"""
        import hashlib
        import json
        
        # Sort keys for consistent hashing
        sorted_context = json.dumps(context, sort_keys=True)
        hash_val = hashlib.md5(sorted_context.encode()).hexdigest()
        return f"llm:decision:{hash_val}"

llm_service = HybridLLMService()
