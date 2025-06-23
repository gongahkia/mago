export default class InputHandler {
    constructor() {
        this.actions = {
            ArrowUp: { type: 'move', dx: 0, dy: -1 },
            ArrowDown: { type: 'move', dx: 0, dy: 1 },
            ArrowLeft: { type: 'move', dx: -1, dy: 0 },
            ArrowRight: { type: 'move', dx: 1, dy: 0 },
            Space: { type: 'wait' },
            KeyA: { type: 'attack' }
        };
        
        this.currentAction = null;
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.code in this.actions) {
                this.currentAction = this.actions[e.code];
            }
        });
    }

    getAction() {
        const action = this.currentAction;
        this.currentAction = null; 
        return action;
    }
}