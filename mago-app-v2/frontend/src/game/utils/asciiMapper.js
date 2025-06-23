/**
 * Maps entity types to ASCII symbols and colors
 * Ensures consistent representation across the game
 */
const asciiMap = {
    entities: {
        player: { symbol: '@', color: '#FF5555' },
        goblin: { symbol: 'g', color: '#55FF55' },
        orc: { symbol: 'O', color: '#FFAA00' },
        dragon: { symbol: 'D', color: '#FF5555' }
    },
    tiles: {
        floor: { symbol: '.', color: '#333333' },
        wall: { symbol: '#', color: '#555555' },
        door: { symbol: '+', color: '#AA7733' },
        stairs: { symbol: '>', color: '#FFFFFF' }
    },
    items: {
        sword: { symbol: '|', color: '#CCCCCC' },
        potion: { symbol: '!', color: '#FF00FF' }
    }
};

export default {
    getEntitySymbol: (type) => asciiMap.entities[type]?.symbol || '?',
    getEntityColor: (type) => asciiMap.entities[type]?.color || '#FF00FF',
    
    getTileSymbol: (type) => asciiMap.tiles[type]?.symbol || ' ',
    getTileColor: (type) => asciiMap.tiles[type]?.color || '#000000',
    
    // For rendering special items
    getItemSymbol: (type) => asciiMap.items[type]?.symbol || '*',
    getItemColor: (type) => asciiMap.items[type]?.color || '#FFFF00'
};