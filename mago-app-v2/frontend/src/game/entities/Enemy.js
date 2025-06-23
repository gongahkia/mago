export default class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.setEnemyProperties();
    }

    setEnemyProperties() {
        switch (this.type) {
            case 'goblin':
                this.symbol = 'g';
                this.color = '#00FF00';
                this.health = 8;
                this.attackPower = 3;
                break;
            case 'orc':
                this.symbol = 'O';
                this.color = '#FFA500';
                this.health = 15;
                this.attackPower = 5;
                break;
            default:
                this.symbol = '?';
                this.color = '#FF00FF';
                this.health = 10;
                this.attackPower = 4;
        }
    }

    executeDecision(decision, gameState, player) {
        if (decision.action === 'move') {
            const newX = this.x + decision.dx;
            const newY = this.y + decision.dy;
            
            if (gameState.map[newY][newX] !== '#') {
                this.x = newX;
                this.y = newY;
            }
        } 
        else if (decision.action === 'attack' && this.isAdjacent(player)) {
            player.health -= this.attackPower;
            gameState.message = `${this.type} hits you for ${this.attackPower} damage!`;
        }
    }

    isAdjacent(entity) {
        return Math.abs(this.x - entity.x) <= 1 && 
               Math.abs(this.y - entity.y) <= 1;
    }
}