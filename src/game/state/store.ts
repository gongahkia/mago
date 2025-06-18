import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Entity } from '../ecs/Entity';
import { Component } from '../ecs/Component';
import { System } from '../ecs/System';
import { RNG } from '../../utils/rng';

interface ECSState {
  entities: Record<string, Entity>;
  components: Record<string, Component>;
  systems: System[];
  rng: RNG;
}

interface PlayerState {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  inventory: string[]; 
  position: { x: number; y: number };
}

interface SessionState {
  currentDungeonLevel: number;
  score: number;
  startTime: number;
}

interface AIState {
  isModelLoading: boolean;
  modelError: string | null;
  currentContext: string;
}

interface GameState {
  ecs: ECSState;
  player: PlayerState;
  session: SessionState;
  ai: AIState;
  actions: {
    createEntity: (components?: Component[]) => string;
    removeEntity: (entityId: string) => void;
    addComponent: (entityId: string, component: Component) => void;
    updatePlayerPosition: (x: number, y: number) => void;
    setAIContext: (context: string) => void;
  };
}

export const useGameStore = create<GameState>()(
  immer(
    persist(
      (set) => ({
        ecs: {
          entities: {},
          components: {},
          systems: [],
          rng: new RNG(Date.now()),
        },
        player: {
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
          inventory: [],
          position: { x: 0, y: 0 },
        },
        session: {
          currentDungeonLevel: 1,
          score: 0,
          startTime: Date.now(),
        },
        ai: {
          isModelLoading: false,
          modelError: null,
          currentContext: '',
        },
        actions: {
          createEntity: (components = []) => {
            const entity = new Entity();
            components.forEach((c) => entity.addComponent(c));
            set((state) => {
              state.ecs.entities[entity.id] = entity;
              components.forEach((c) => {
                state.ecs.components[c.constructor.name] ??= [];
                state.ecs.components[c.constructor.name].push(c);
              });
            });
            return entity.id;
          },
          removeEntity: (entityId) => {
            set((state) => {
              const entity = state.ecs.entities[entityId];
              if (entity) {
                entity.getAllComponents().forEach((c) => {
                  state.ecs.components[c.constructor.name] = 
                    state.ecs.components[c.constructor.name]
                      .filter(comp => comp.entityId !== entityId);
                });
                delete state.ecs.entities[entityId];
              }
            });
          },
          addComponent: (entityId, component) => {
            set((state) => {
              const entity = state.ecs.entities[entityId];
              if (entity) {
                entity.addComponent(component);
                state.ecs.components[component.constructor.name] ??= [];
                state.ecs.components[component.constructor.name].push(component);
              }
            });
          },
          updatePlayerPosition: (x, y) => {
            set((state) => {
              state.player.position = { x, y };
            });
          },
          setAIContext: (context) => {
            set((state) => {
              state.ai.currentContext = context;
            });
          },
        },
      }),
      {
        name: 'mago-save',
        partialize: (state) => ({
          ecs: state.ecs,
          player: state.player,
          session: state.session,
        }),
      }
    )
  )
);

export const selectPlayerHealth = (state: GameState) => ({
  health: state.player.health,
  maxHealth: state.player.maxHealth,
});

export const selectInventoryItems = (state: GameState) => 
  state.player.inventory.map(id => state.ecs.entities[id]);

export const selectCurrentContext = (state: GameState) =>
  state.ai.currentContext;

export const useGameActions = () => useGameStore(state => state.actions);
export const useECS = () => useGameStore(state => state.ecs);
export const usePlayer = () => useGameStore(state => state.player);
export const useAIState = () => useGameStore(state => state.ai);