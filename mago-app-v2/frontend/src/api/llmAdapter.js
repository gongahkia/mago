const API_BASE_URL = 'http://localhost:8000';

export const fetchLLMDecision = async (context) => {
    try {
        const response = await fetch(`${API_BASE_URL}/game/decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context_type: 'enemy_decision',
                game_state: context
            }),
            signal: AbortSignal.timeout(2000) 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.decision;
    } catch (error) {
        console.error('LLM request failed:', error);
        return {
            action: 'move',
            dx: Math.floor(Math.random() * 3) - 1,
            dy: Math.floor(Math.random() * 3) - 1
        };
    }
};

export const generateNewEntity = async (entityType) => {
    const response = await fetch(`${API_BASE_URL}/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType })
    });
    return await response.json();
};