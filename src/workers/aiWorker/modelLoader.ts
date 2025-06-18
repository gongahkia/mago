import { pipeline } from '@xenova/transformers';

export async function loadPhi3Mini(updateProgress?: (progress: number) => void) {
  const modelName = 'Xenova/Phi-3-mini-4k-instruct';
  const generator = await pipeline('text-generation', modelName, {
    quantized: true,
    progress_callback: updateProgress
      ? (progress) => {
          if (typeof progress === 'number' && !isNaN(progress)) {
            updateProgress(progress);
            console.log(`Model load progress: ${(progress * 100).toFixed(1)}%`);
          }
        }
      : undefined,
  });
  return { generator };
}