import GameEngine from './game/core/GameEngine.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas.getContext) {
        alert('Canvas not supported in your browser!');
        return;
    }
    try {
        const game = new GameEngine(canvas);
        console.log('Mago game started!');
        window.game = game;
    } catch (error) {
        console.error('Game initialization failed:', error);
        document.getElementById('status-bar').textContent = 
            'Fatal Error: Check console for details';
    }
});