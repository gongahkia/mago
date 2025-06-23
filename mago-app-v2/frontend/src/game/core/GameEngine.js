import Player from '../entities/Player.js';
import Renderer from './Renderer.js';
import InputHandler from './InputHandler.js';
import { fetchLLMDecision } from '../../api/llmAdapter.js';

export default class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.renderer = new Renderer(this.ctx);
        this.inputHandler = new InputHandler();
        this.player = new Player(10, 10);
        this.enemies = [];
        this.gameState = {
            map: [],
            turn: 'player',
            message: 'Welcome to Mago!'
        };
        this.init();
    }

    async init() {
        this.generateDungeon(50, 50);
        this.gameLoop();
    }

    generateDungeon(width, height) {
        // Generate simple dungeon layout
        const map = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                if (x === 0 || y === 0 || x === width-1 || y === height-1) {
                    row.push('#'); // Walls
                } else {
                    row.push(Math.random() > 0.7 ? '#' : '.');
                }
            }
            map.push(row);
        }
        this.gameState.map = map;
    }

    async gameLoop() {
        // Handle player input
        if (this.gameState.turn === 'player') {
            const action = this.inputHandler.getAction();
            if (action) {
                this.player.handleAction(action, this.gameState);
                this.gameState.turn = 'enemies';
            }
        } 
        // Process enemy turns
        else if (this.gameState.turn === 'enemies') {
            await this.processEnemyTurns();
            this.gameState.turn = 'player';
        }

        // Render game state
        this.renderer.render(this.gameState, this.player, this.enemies);
        
        requestAnimationFrame(() => this.gameLoop());
    }

    async processEnemyTurns() {
        for (const enemy of this.enemies) {
            const decision = await fetchLLMDecision({
                enemyType: enemy.type,
                playerPosition: { x: this.player.x, y: this.player.y },
                enemyPosition: { x: enemy.x, y: enemy.y },
                map: this.gameState.map
            });
            enemy.executeDecision(decision, this.gameState, this.player);
        }
    }
}