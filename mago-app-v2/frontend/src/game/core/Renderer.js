export default class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.tileSize = 16;
        this.colors = {
            player: '#FF0000',
            wall: '#555555',
            floor: '#222222',
            enemy: '#00FF00'
        };
    }

    render(gameState, player, enemies) {
        this.clearCanvas();
        this.renderMap(gameState.map);
        this.renderEntities(player, enemies);
        this.renderUI(gameState.message);
    }

    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    renderMap(map) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                this.ctx.fillStyle = tile === '#' ? this.colors.wall : this.colors.floor;
                this.ctx.fillRect(
                    x * this.tileSize, 
                    y * this.tileSize, 
                    this.tileSize, 
                    this.tileSize
                );
            }
        }
    }

    renderEntities(player, enemies) {
        // Render enemies
        enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.font = `${this.tileSize}px monospace`;
            this.ctx.fillText(
                enemy.symbol,
                enemy.x * this.tileSize,
                (enemy.y + 1) * this.tileSize
            );
        });

        // Render player
        this.ctx.fillStyle = this.colors.player;
        this.ctx.font = `${this.tileSize}px monospace`;
        this.ctx.fillText(
            player.symbol,
            player.x * this.tileSize,
            (player.y + 1) * this.tileSize
        );
    }

    renderUI(message) {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(`> ${message}`, 10, this.ctx.canvas.height - 20);
    }
}