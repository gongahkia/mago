import { AutoModelForCausalLM, LlamaModel, LlamaContext } from 'llama-node';

export const loadPhi3Mini = async () => {
  const modelPath = new URL('/models/phi-3-mini', import.meta.url).pathname;
  
  const model = new LlamaModel({
    modelPath,
    nGpuLayers: 0, 
    seed: 42, 
  });

  const context = new LlamaContext({ model });
  return {
    model,
    context,
    config: {
      maxTokens: 50,
      temperature: 0.3, 
      topP: 0.95,
    }
  };
};