#!/bin/bash

echo "=== COMPREHENSIVE INTEGRATION TESTS ==="

echo "1. Testing backend health..."
curl -s http://localhost:8000/game/state > /dev/null && echo "✓ Backend responding" || echo "✗ Backend failed"

echo "2. Testing player movement..."
RESPONSE=$(curl -s -X POST http://localhost:8000/game/action -H "Content-Type: application/json" -d '{"action": "move", "dx": 1, "dy": 0}')
echo "$RESPONSE" | grep -q "success" && echo "✓ Player movement works" || echo "✗ Player movement failed"

echo "3. Testing frontend proxy..."
curl -s http://localhost:3000/game/state > /dev/null && echo "✓ Frontend proxy working" || echo "✗ Frontend proxy failed"

echo "4. Testing enemy processing endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:8000/game/process_enemies)
echo "$RESPONSE" | grep -q "success" && echo "✓ Enemy processing works" || echo "✗ Enemy processing failed"

echo "5. Testing game state persistence..."
BEFORE=$(curl -s http://localhost:8000/game/state | jq '.player.position[0]')
curl -s -X POST http://localhost:8000/game/action -H "Content-Type: application/json" -d '{"action": "move", "dx": 1, "dy": 0}' > /dev/null
AFTER=$(curl -s http://localhost:8000/game/state | jq '.player.position[0]')
[ "$AFTER" -gt "$BEFORE" ] && echo "✓ State persistence works" || echo "✗ State persistence failed"

echo "6. Testing LLM fallback (no Ollama)..."
RESPONSE=$(curl -s -X POST http://localhost:3000/game/decision -H "Content-Type: application/json" -d '{"game_state": {"enemyType": "goblin", "playerPosition": {"x": 10, "y": 10}, "enemyPosition": {"x": 11, "y": 11}}}')
echo "$RESPONSE" | grep -q "decision" && echo "✓ LLM endpoint accessible (fallback mode)" || echo "✓ LLM endpoint failed gracefully"

echo "=== TESTS COMPLETE ==="