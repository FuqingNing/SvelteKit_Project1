import * as PIXI from 'pixi.js';

export class GameRender {
    private app: PIXI.Application;
    private cellSize: number;

    constructor(app: PIXI.Application, cellSize: number) {
        this.app = app;
        this.cellSize = cellSize;
    }

    createImageForCell(x: number, y: number, image: string) {
        const texture = PIXI.Texture.from(image);
        const sprite = PIXI.Sprite.from(texture);
        sprite.x = x * this.cellSize;
        sprite.y = y * this.cellSize;
        sprite.width = this.cellSize;
        sprite.height = this.cellSize;
        this.app.stage.addChild(sprite);
    }

    // 可以在这里添加更多相关的方法
}
