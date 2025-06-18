export const basePrompt = `You are a helpful AI assistant in a roguelike dungeon crawler game. Respond with JSON actions only.`;

export const actionSchemaDescription = `
Generate a JSON object with the following schema:
{
  "intent": "attack|explore|trade|flee",
  "target?": "string",
  "dialog?": "string",
  "intensity?": 0-10
}`;

export function buildPrompt(gameState: string): string {
  return `${basePrompt}
Current game state: ${gameState}
${actionSchemaDescription}
Respond ONLY with valid JSON.`;
}

// You can add more specialized prompt templates below as needed, e.g.:
// export function buildNPCPrompt(npcState: string, context: string) { ... }