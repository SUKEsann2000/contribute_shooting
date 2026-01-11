import { Grid, grid } from "../types.js";

export class Block {
    constructor(
        private x: Grid,
        private y: Grid,
        private color: string,
        private width: Grid,
        private height: Grid,
        private alive: boolean,
        private id: string,
        private contribute: number,
        private readonly maxContribute?: number,
    ) {
        this.maxContribute = contribute
    }

    // x
    getX(): Grid {
        return this.x;
    }
    setX(value: Grid) {
        this.x = value;
    }

    // y
    getY(): Grid {
        return this.y;
    }
    setY(value: Grid) {
        this.y = value;
    }

    // color
    getColor(): string {
        return this.color;
    }
    setColor(value: string) {
        this.color = value;
    }

    // width
    getWidth(): Grid {
        return this.width;
    }
    setWidth(value: Grid) {
        this.width = value;
    }

    // height
    getHeight(): Grid {
        return this.height;
    }
    setHeight(value: Grid) {
        this.height = value;
    }

    // alive
    isAlive(): boolean {
        return this.alive;
    }
    setAlive(value: boolean) {
        this.alive = value;
    }

    // id
    getId(): string {
        return this.id
    }
    setId(id: string) {
        this.id = id;
    }
    
    // health
    getContribute(): number {
        return this.contribute;
    }
    setContribute(contribute: number) {
        this.contribute = contribute;
        this.alive = contribute > 0;
    
        const ratio = Math.min(1, contribute / 5); // 体力の最大値が5なら
        const r = Math.round(198 * ratio);
        const g = Math.round(228 * ratio);
        const b = Math.round(139 * ratio);
        this.color = `rgb(${r},${g},${b})`;
    }

    // maxContribute
    getMaxContribute(): number {
        return this.maxContribute!;
    }

    toSVG() {
        return `<rect id="${this.id}" x="${this.x}" y="${this.y}" width="${this.width}" height="${this.height}" fill="#7bc96f"/>`;
    }
}