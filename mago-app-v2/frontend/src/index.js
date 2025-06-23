/**
 * Application entry point
 * Initializes game systems and mounts to DOM
 */
import GameEngine from './game/core/GameEngine.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    // Check browser support
    if (!canvas.getContext) {
        alert('Canvas not supported in your browser!');
        return;
    }
    
    // Initialize game engine
    try {
        const game = new GameEngine(canvas);
        console.log('Mago game started!');
        
        // Expose for debugging
        window.game = game;
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.getElementById('status-bar').textContent = 
            'Fatal Error: Check console for details';
    }
});