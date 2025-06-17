## Todo

1. Debug docker issues and make sure shit actually runs locally, continue from [this chat](https://www.perplexity.ai/search/i-have-a-project-called-mago-w-Q6.r_XUqQ2qodKKWlqLTtA)
2. Put sound effects at `./public/assets/sfx`
3. Put spritesheets and environment pngs at `./public/assets/sprites`
4. Put tilemaps at `./public/assets/tilesets`
5. Add .ico file for icon within `index.html`

[![](https://img.shields.io/badge/mago_1.0.0-passing-green)](https://github.com/gongahkia/mago/releases/tag/1.0.0) 

# `Mago` 🪧

...

## Stack

* *Frontend*: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
* *Backend*: [Node.js](https://nodejs.org/en), [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
* *Graphics*: [WebGL2](https://get.webgl.org/webgl2/enable.html), [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
* *Package*: [Docker](https://www.docker.com/)
* *Routing*: [Nginx](https://nginx.org/)
* *Model*: [WebLLM](https://webllm.mlc.ai/), [microsoft/Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)
* *Testing*: [Vitest](https://vitest.dev/)

## Usage

The below instructions are for locally hosting `Mago`.

1. Execute the following to build and start Mago in production or development *(with optional hot reloading)*.

```console
$ git clone https://github.com/gongahkia/mago && cd mago
$ docker-compose -f docker-compose.yml up --build dev
$ docker-compose -f docker-compose.yml up --build prod
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