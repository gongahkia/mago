import { pipeline, AutoTokenizer, env } from '@xenova/transformers';
import * as Comlink from 'comlink';

env.allowLocalModels = false;
env.useBrowserCache = false;
env.backends.onnx.wasm.wasmPaths = '/assets/wasm/'; 

const MODEL_ID = 'Xenova/LaMini-GPT-774m';

export async function loadLaMiniGPT() {
  try {
    console.log('[Loading] LaMini-GPT model and tokenizer...');
    
    if (!env.backends.onnx.wasm.init) {
      throw new Error('ONNX WASM backend not initialized');
    }

    const generator = await pipeline('text-generation', MODEL_ID, {
      quantized: true,
    });

    const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);

    console.log('[Success] LaMini-GPT model and tokenizer loaded');
    
    return {
      generator: {
        generate: Comlink.proxy(generator.generate.bind(generator)),
        dispose: Comlink.proxy(generator.dispose.bind(generator))
      },
      tokenizer: {
        encode: Comlink.proxy(tokenizer.encode.bind(tokenizer)),
        decode: Comlink.proxy(tokenizer.decode.bind(tokenizer))
      }
    };
  } catch (error) {
    console.error('[Error] Model loading failed:', error);
    throw new Error(`AI model initialization failed: ${error}`);
  }
}

// import { AutoModelForCausalLM, AutoTokenizer, env } from '@xenova/transformers';

// env.verbose = true;
// env.remoteHost = 'https://huggingface.co';
// env.allowLocalModels = false;

// export async function loadPhi3Mini(updateProgress?: (progress: number) => void) {
//   console.log('[MODEL] Starting Phi-3-mini-4k-instruct load');

//   try {
//     const model = await AutoModelForCausalLM.from_pretrained('Xenova/Phi-3-mini-4k-instruct', {
//       quantized: true,
//       progress_callback: (progress) => {
//         if (typeof progress === 'number') {
//           console.log(`[MODEL] Loading model: ${(progress * 100).toFixed(1)}%`);
//           updateProgress?.(progress);
//         }
//       }
//     });

//     const tokenizer = await AutoTokenizer.from_pretrained('Xenova/Phi-3-mini-4k-instruct', {
//       progress_callback: (progress) => {
//         if (typeof progress === 'number') {
//           console.log(`[TOKENIZER] Loading: ${(progress * 100).toFixed(1)}%`);
//         }
//       }
//     });

//     console.log('[SUCCESS] Model & tokenizer loaded');
//     return { model, tokenizer };
//   } catch (error) {
//     console.error('[FATAL] Model load failed:', error);
//     throw error;
//   }
// }