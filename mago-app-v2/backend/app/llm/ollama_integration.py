"""
Handles communication with local Ollama server for LLM interactions
"""
import aiohttp
import json
import logging
from .prompt_engine import get_decision_prompt, get_entity_prompt
from typing import Dict, Any, List, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434/api/generate"

async def get_ollama_response(prompt: str, model: str = "llama3") -> str:
    """Get response from Ollama API with error handling"""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.7, "max_tokens": 150}
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(OLLAMA_BASE_URL, json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("response", "").strip()
                logger.error(f"Ollama error: {response.status}")
                return ""
    except aiohttp.ClientError as e:
        logger.error(f"HTTP error: {str(e)}")
        return ""

async def get_decision(context: Dict[str, Any]) -> Dict[str, Any]:
    """Get enemy decision from LLM with fallback to random"""
    prompt = get_decision_prompt(context)
    response = await get_ollama_response(prompt)
    
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        logger.warning("LLM returned invalid JSON, using fallback")
        return {
            "action": "move",
            "dx": random.randint(-1, 1),
            "dy": random.randint(-1, 1)
        }

async def generate_entity(entity_type: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate new entity using LLM"""
    prompt = get_entity_prompt(entity_type, context)
    response = await get_ollama_response(prompt)
    
    try:
        entity = json.loads(response)
        # Add required fields if missing
        entity.setdefault("symbol", "?")
        entity.setdefault("color", "#FF00FF")
        return entity
    except json.JSONDecodeError:
        logger.error("Failed to parse entity JSON")
        return {
            "type": entity_type,
            "name": "Unknown",
            "health": 10,
            "attack_power": 3,
            "symbol": "?",
            "color": "#FF00FF"
        }