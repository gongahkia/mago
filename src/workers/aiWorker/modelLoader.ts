import { AutoModelForCausalLM } from '@xenova/transformers';

export const loadPhi3Mini = async () => {
  return AutoModelForCausalLM.from_pretrained('microsoft/phi-3-mini-4k-instruct', {
    quantized: true,
    progress_callback: (progress) => {
      console.log(`Model load progress: ${(progress * 100).toFixed(1)}%`);
    }
  });
};