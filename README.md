## Todo

1. Debug why modelLoader.ts runs for every other turn that the player takes
2. Move model initialisation within modelLoader.ts to run only once at the beginning of the client intialisation
3. Debug this error that occurs from failing to get a response from models

```txt
useGameLoop.ts:43 AI decision failed for npc-0: DataCloneError: Failed to execute 'postMessage' on 'Worker': (ready) => set({ modelReady: ready }) could not be cloned.
    at useGameLoop.ts:37:46
    at Array.map (<anonymous>)
    at processAITurn (useGameLoop.ts:35:22)

useGameLoop.ts:43 AI decision failed for npc-1: DataCloneError: Failed to execute 'postMessage' on 'Worker': (ready) => set({ modelReady: ready }) could not be cloned.
    at useGameLoop.ts:37:46
    at Array.map (<anonymous>)
    at processAITurn (useGameLoop.ts:35:22)
```

4. Add a credits and about page
5. Add explanation and controls 
6. See if I can make it similar to https://github.com/munificent/hauberk

[![](https://img.shields.io/badge/mago_1.0.0-passing-green)](https://github.com/gongahkia/mago/releases/tag/1.0.0) 

# `Mago` 🪧

Browser [Rougelike](https://en.wikipedia.org/wiki/Roguelike) with [LLM](#stack)-orchestrated randomisation.

## Stack

* *Frontend*: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
* *Backend*: [Node.js](https://nodejs.org/en), [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
* *Graphics*: [WebGL2](https://get.webgl.org/webgl2/enable.html), [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
* *Package*: [Docker](https://www.docker.com/)
* *Routing*: [Nginx](https://nginx.org/)
* *Model*: [WebLLM](https://webllm.mlc.ai/), [microsoft/Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct), [Xenova/Phi-3-mini-4k-instruct](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct), [Xenova/LaMini-GPT-774M](https://huggingface.co/Xenova/LaMini-GPT-774M)
* *Testing*: [Vitest](https://vitest.dev/)

## Screenshots

...

## Usage

The below instructions are for locally hosting `Mago`.

1. Execute the following to build and start Mago in production or development *(with optional hot reloading)*.

```console
$ git clone https://github.com/gongahkia/mago && cd mago
$ make
$ make build
```

## Architecture

...

## Other notes

...

## Reference

The name `Mago` is in reference to [Mago](https://yokwe-yokai-of-korea.fandom.com/de/wiki/Mago) (마고), the primordial goddess of creation within the [Korean Mythos](https://en.wikipedia.org/wiki/Korean_mythology) who later became the island of [Jeju](https://en.wikipedia.org/wiki/Jeju_Island). She is also known by other names, such as [Magu](https://en.wikipedia.org/wiki/Magu_(deity)) (麻姑) in Chinese and Mako (マコ) in Japanese.

<div align="center">
    <img src="./asset/logo/mago.png" width="25%">
</div>