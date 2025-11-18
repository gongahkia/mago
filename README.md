[![](https://img.shields.io/badge/mago_1.0.0-passing-%23006400)](https://github.com/gongahkia/mago/releases/tag/1.0.0) 
[![](https://img.shields.io/badge/mago_2.0.0-passing-%23228B22)](https://github.com/gongahkia/mago/releases/tag/2.0.0) 
[![](https://img.shields.io/badge/mago_3.0.0-passing-%2390EE90)](https://github.com/gongahkia/mago/releases/tag/3.0.0) 

# `Mago` 🪧

Browser [Rougelike](https://en.wikipedia.org/wiki/Roguelike) with [LLM](#stack)-orchestrated randomisation.

Made to practise [the stack(s)](#stack).

## Stack

[`Mago` V1.0.0](#mago-v100)

* *Frontend*: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
* *Backend*: [Node.js](https://nodejs.org/en), [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
* *Graphics*: [WebGL2](https://get.webgl.org/webgl2/enable.html), [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
* *Package*: [Docker](https://www.docker.com/)
* *Routing*: [Nginx](https://nginx.org/)
* *Model*: [WebLLM](https://webllm.mlc.ai/), [microsoft/Phi-3-mini-4k-instruct](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct), [Xenova/Phi-3-mini-4k-instruct](https://huggingface.co/Xenova/Phi-3-mini-4k-instruct), [Xenova/LaMini-GPT-774M](https://huggingface.co/Xenova/LaMini-GPT-774M)
* *Testing*: [Vitest](https://vitest.dev/)

[`Mago` V2.0.0](#mago-v200)

* *Frontend*: [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML), [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* *Backend*: [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/)
* *Graphics*: [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
* *Package*: [Docker](https://www.docker.com/)
* *Routing*: [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [WEb Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
* *Model*: [Ollama](https://ollama.com/), [Ollama/llama3:8b-instruct-q2_K](https://ollama.com/library/llama3:8b-instruct-q2_K)
  
[`Mago` V3.0.0](#mago-v300)

* *Frontend*: [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [Zustand](https://zustand-demo.pmnd.rs/), [Tailwind CSS](https://tailwindcss.com/)
* *Backend*: [FastAPI](https://fastapi.tiangolo.com/), [Python](https://www.python.org/), [Celery](https://docs.celeryq.dev/) 
* *Graphics*: [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) 
* *Package*: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)
* *Routing*: [WebSocket](https://fastapi.tiangolo.com/advanced/websockets/), [REST](https://fastapi.tiangolo.com/), [Nginx](https://nginx.org/) 
* *Model*: [Transformers.js](https://github.com/xenova/transformers.js), [Ollama](https://ollama.com/) 
* *Persistence*: [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/) 
* *Auth*: [JWT](https://www.jwt.io/)
* *Testing*: [Pytest](https://docs.pytest.org/), [Jest](https://jestjs.io/) 

## Usage

The below instructions are for locally hosting `Mago`.

1. Execute the following to build and start Mago in production or development *(with optional hot reloading)*.

```console
$ git clone https://github.com/gongahkia/mago
$ cd mago/mago-app-v1 && make build
$ cd mago/mago-app-v2 && docker-compose up --build
$ cd mago/mago-app-v3 && chmod+x run-dev.sh && ./run-dev.sh
```

## Architecture

### `Mago` V1.0.0

```mermaid
sequenceDiagram
    Actor User as User
    participant UI as React + TypeScript (Frontend)
    participant Worker as Web Worker (Backend Logic)
    participant LLM as WebLLM / Phi-3 / LaMini-GPT (Model)
    participant Graphics as WebGL2 + Canvas API
    participant Server as Node.js (API)
    participant Docker as Docker Container
    participant Nginx as Nginx (Routing)

    %% User actions
    User->>UI: Load game in browser
    UI->>Nginx: Request static assets / API
    Nginx->>Docker: Route request to correct container
    Docker->>Server: Forward API/game logic requests
    Server->>UI: Serve game bundle and API endpoints

    %% Game initialization
    UI->>Worker: Initialize game logic (via Web Worker)
    UI->>Graphics: Initialize rendering context

    %% Gameplay loop
    User->>UI: Send input (move/act)
    UI->>Worker: Pass user action
    Worker->>LLM: Query for randomization/LLM-driven events
    LLM-->>Worker: Return event/outcome
    Worker->>UI: Update game state
    UI->>Graphics: Render updated state

    %% Optional: Save/Load
    User->>UI: Save/Load game
    UI->>Server: Persist/load game state (if supported)

    %% Testing
    UI->>Vitest: Run frontend tests (during development)

    %% End of loop
    Note over UI,User: Loop continues for each action

    %% Diagram legend
    Note right of LLM: LLMs can be WebLLM, Phi-3, or LaMini-GPT as configured
```

### `Mago` V2.0.0

```mermaid
sequenceDiagram
    Actor U as User
    participant F as Frontend (Browser)
    participant B as Backend (FastAPI)
    participant O as Ollama (LLM)
    participant GS as Game State

    U->>F: Loads game (localhost:3000)
    F->>B: GET /game/state
    activate B
    B->>GS: Load persisted state
    GS-->>B: Game state data
    B-->>F: JSON state (dungeon, entities)
    deactivate B

    loop Game Loop
        U->>F: Keyboard input (movement/action)
        F->>B: POST /game/action {action, direction}
        activate B
        B->>GS: Validate & update player position
        B->>B: Process collisions/combat
        B-->>F: Action result
        deactivate B

        F->>B: POST /game/process_enemies
        activate B
        loop For each enemy
            B->>O: Generate decision (enemy context)
            activate O
            O-->>B: JSON decision {action, dx, dy}
            deactivate O
            B->>GS: Update enemy position/state
        end
        B->>GS: Save game state
        B-->>F: Updated game state
        deactivate B

        F->>F: Render frame
        F->>Canvas: Draw ASCII tiles/entities
    end

    alt Special Events
        B->>O: Generate entity (enemy/item)
        activate O
        O-->>B: JSON entity properties
        deactivate O
        B->>GS: Add new entity
        B->>B: Trigger event (earthquake/hoard)
        B->>O: Generate event outcome
        O-->>B: Event description/effects
    end

    note over B,O: AI Integration Points
    note over F: Canvas Rendering Pipeline
    note over GS: JSON Persistence
```

### `Mago` V3.0.0

```mermaid
sequenceDiagram
    Actor P as Player
    participant UI as Next.js + TS (Frontend)
    participant WS as WebSocket Gateway
    participant BE as FastAPI (Backend)
    participant LLocal as WebLLM (Client Model)
    participant LRemote as Ollama (Server Model)
    participant Cache as Redis (Decision Cache)
    participant DB as PostgreSQL (State)

    %% Initial load
    P->>UI: Open game
    UI->>WS: Establish WebSocket (JWT token)
    UI->>BE: (Fallback) Fetch bootstrap state (REST)
    BE->>DB: Load player + dungeon
    DB-->>BE: State snapshot
    BE-->>UI: Initial state

    loop Gameplay Loop
        P->>UI: Input (move / attack / use)
        UI->>WS: ACTION { type, payload }
        WS->>BE: Forward authenticated action
        BE->>DB: Validate & mutate game state
        alt Enemy / AI Turn Needed
            BE->>Cache: Lookup AI context hash
            Cache-->>BE: (hit) Cached decision
            BE-->>WS: STATE_UPDATE (delta)
        else Cache miss
            BE->>BE: Classify decision complexity
            alt Simple Decision
                BE-->>UI: REQUEST_CLIENT_DECISION (context)
                UI->>LLocal: Generate quick action
                LLocal-->>UI: Decision JSON
                UI->>WS: CLIENT_DECISION relay
                WS->>BE: Apply decision
            else Complex Decision
                BE->>LRemote: Prompt (context)
                LRemote-->>BE: Decision JSON
            end
            BE->>Cache: Store decision (TTL)
            BE->>DB: Update enemy state
            BE-->>WS: STATE_UPDATE (delta)
        end
        WS-->>UI: Broadcast updated state
        UI->>UI: Render (Canvas + Particles)
    end

    alt Periodic / Explicit Save
        BE->>DB: Persist snapshot
        BE-->>WS: EVENT save_complete
    end

    note over LLocal,LRemote: Hybrid LLM routing (latency vs reasoning)
    note over Cache: 70%+ decision reuse
    note over UI,WS: Client prediction + reconciliation
```

## Reference

The name `Mago` is in reference to [Mago](https://yokwe-yokai-of-korea.fandom.com/de/wiki/Mago) (마고), the primordial goddess of creation within the [Korean Mythos](https://en.wikipedia.org/wiki/Korean_mythology) who later became the island of [Jeju](https://en.wikipedia.org/wiki/Jeju_Island). She is also known by other names, such as [Magu](https://en.wikipedia.org/wiki/Magu_(deity)) (麻姑) in Chinese and Mako (マコ) in Japanese.

<div align="center">
    <img src="./asset/logo/mago.png" width="25%">
</div>