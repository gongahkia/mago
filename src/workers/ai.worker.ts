import { ChatWorkerHandler } from '@mlc-ai/web-llm';

const chatHandler = new ChatWorkerHandler(self);

self.onmessage = (event) => {
  chatHandler.onmessage(event);
};

chatHandler.setTask(async (model, chat) => {
  await chat.reload('Phi-3-mini-4k-instruct-q4f16_1', {
    modelUrl: '/models/phi-3-mini',
    wasmUrl: '/models/phi-3-mini/model.wasm'
  });
});

chatHandler.onerror = (error) => {
  self.postMessage({
    type: 'error',
    content: error.message
  });
};