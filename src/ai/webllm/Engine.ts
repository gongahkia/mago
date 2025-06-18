import { ChatWorkerClient } from '@mlc-ai/web-llm';
import { AIAction } from '../action-parser/schema';

export class AIEngine {
  private worker: Worker;
  private llmClient: ChatWorkerClient;
  private modelLoaded = false;

  public onStatusUpdate: ((status: string, progress?: number) => void) | null = null;

  constructor() {
    this.worker = new Worker(new URL('../../workers/ai.worker.ts', import.meta.url));
    this.llmClient = new ChatWorkerClient(this.worker);
    
    this.llmClient.setInitProgressCallback((report) => {
      this.onStatusUpdate?.('loading', report.progress);
      if (report.progress === 1) this.modelLoaded = true;
    });
  }

  async initialize() {
    try {
      await this.llmClient.reload('Phi-3-mini-4k-instruct-q4f16_1', {
        modelUrl: '/models/phi-3-mini',
        wasmUrl: '/models/phi-3-mini/model.wasm'
      });
    } catch (error) {
      this.onStatusUpdate?.('error');
      throw new Error(`LLM initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateAction(context: string): Promise<AIAction> {
    if (!this.modelLoaded) throw new Error('Model not initialized');
    
    const prompt = this.buildPrompt(context);
    const rawResponse = await this.llmClient.generate(prompt);
    
    return this.parseResponse(rawResponse);
  }

  private buildPrompt(context: string): string {
    return `[INST] Current game state: ${context}
Generate JSON action following this schema:
{
  "intent": "attack|explore|trade|flee",
  "target?": "string",
  "dialog?": "string",
  "intensity?": 0-10
}
Respond ONLY with valid JSON. [/INST]`;
  }

  private parseResponse(response: string): AIAction {
    try {
      const startIdx = response.indexOf('{');
      const endIdx = response.lastIndexOf('}');
      const jsonString = response.slice(startIdx, endIdx + 1);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${response.substring(0, 50)}...`);
    }
  }
}