export default class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.symbol = '@';
        this.health = 20;
        this.maxHealth = 20;
        this.attackPower = 5;
    }

    handleAction(action, gameState) {
        if (action.type === 'move') {
            const newX = this.x + action.dx;
            const newY = this.y + action.dy;
            if (gameState.map[newY][newX] !== '#') {
                this.x = newX;
                this.y = newY;
                gameState.message = `You move ${this.getDirectionName(action)}`;
            } else {
                gameState.message = 'You bump into a wall';
            }
        }
    }

    getDirectionName(action) {
        if (action.dy === -1) return 'north';
        if (action.dy === 1) return 'south';
        if (action.dx === -1) return 'west';
        if (action.dx === 1) return 'east';
        return '';
    }
}