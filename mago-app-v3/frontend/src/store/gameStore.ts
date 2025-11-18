/**
 * Zustand Store with Immer for Game State Management
 * 
 * Manages:
 * - Player state (position, health, inventory, skills)
 * - Dungeon map
 * - Entities (enemies, NPCs)
 * - WebSocket connection
 * - UI state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Position {
  x: number;
  y: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest';
  description: string;
  stackable: boolean;
  quantity: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cooldown: number;
  currentCooldown: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  inventory: Item[];
  skills: Skill[];
  class: 'warrior' | 'mage' | 'rogue';
}

export interface Entity {
  id: string;
  type: 'enemy' | 'npc' | 'object';
  name: string;
  char: string;
  color: string;
  position: Position;
  health?: number;
  maxHealth?: number;
  hostile?: boolean;
}

export interface GameState {
  // Player
  player: Player | null;
  
  // World
  dungeonMap: string[][];
  dungeonLevel: number;
  dungeonTheme: string;
  entities: Entity[];
  
  // WebSocket
  wsConnected: boolean;
  wsUrl: string;
  token: string | null;
  
  // UI
  selectedItem: string | null;
  hoveredTile: Position | null;
  messageLog: string[];
  showInventory: boolean;
  showSkills: boolean;
  
  // Actions
  setPlayer: (player: Player) => void;
  updatePlayerPosition: (position: Position) => void;
  updatePlayerHealth: (health: number) => void;
  addItemToInventory: (item: Item) => void;
  removeItemFromInventory: (itemId: string) => void;
  
  setDungeonMap: (map: string[][]) => void;
  setEntities: (entities: Entity[]) => void;
  updateEntity: (entityId: string, updates: Partial<Entity>) => void;
  
  setWsConnected: (connected: boolean) => void;
  setToken: (token: string | null) => void;
  
  addMessage: (message: string) => void;
  toggleInventory: () => void;
  toggleSkills: () => void;
  setHoveredTile: (position: Position | null) => void;
}

export const useGameStore = create<GameState>()(
  immer((set) => ({
    // Initial state
    player: null,
    dungeonMap: [],
    dungeonLevel: 1,
    dungeonTheme: 'dungeon',
    entities: [],
    wsConnected: false,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    token: null,
    selectedItem: null,
    hoveredTile: null,
    messageLog: ['Welcome to Mago V3!'],
    showInventory: false,
    showSkills: false,
    
    // Player actions
    setPlayer: (player) => set((state) => {
      state.player = player;
    }),
    
    updatePlayerPosition: (position) => set((state) => {
      if (state.player) {
        state.player.position = position;
      }
    }),
    
    updatePlayerHealth: (health) => set((state) => {
      if (state.player) {
        state.player.health = Math.max(0, Math.min(health, state.player.maxHealth));
      }
    }),
    
    addItemToInventory: (item) => set((state) => {
      if (state.player) {
        // Check for existing stackable item
        const existingItem = state.player.inventory.find(
          i => i.id === item.id && i.stackable
        );
        
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          state.player.inventory.push(item);
        }
      }
    }),
    
    removeItemFromInventory: (itemId) => set((state) => {
      if (state.player) {
        state.player.inventory = state.player.inventory.filter(i => i.id !== itemId);
      }
    }),
    
    // World actions
    setDungeonMap: (map) => set((state) => {
      state.dungeonMap = map;
    }),
    
    setEntities: (entities) => set((state) => {
      state.entities = entities;
    }),
    
    updateEntity: (entityId, updates) => set((state) => {
      const entity = state.entities.find(e => e.id === entityId);
      if (entity) {
        Object.assign(entity, updates);
      }
    }),
    
    // WebSocket actions
    setWsConnected: (connected) => set((state) => {
      state.wsConnected = connected;
    }),
    
    setToken: (token) => set((state) => {
      state.token = token;
    }),
    
    // UI actions
    addMessage: (message) => set((state) => {
      state.messageLog.push(message);
      if (state.messageLog.length > 50) {
        state.messageLog = state.messageLog.slice(-50);
      }
    }),
    
    toggleInventory: () => set((state) => {
      state.showInventory = !state.showInventory;
      if (state.showInventory) {
        state.showSkills = false;
      }
    }),
    
    toggleSkills: () => set((state) => {
      state.showSkills = !state.showSkills;
      if (state.showSkills) {
        state.showInventory = false;
      }
    }),
    
    setHoveredTile: (position) => set((state) => {
      state.hoveredTile = position;
    }),
  }))
);
