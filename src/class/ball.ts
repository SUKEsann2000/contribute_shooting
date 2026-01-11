import { Pixel, pixel } from "../types.js";
export class Ball {
    constructor(
        private x: Pixel,
        private y: Pixel,
        private vx: Pixel,
        private vy: Pixel,
        private radius: Pixel
    ) {}

    getX() { return this.x; }
    getY() { return this.y; }
    getVX() { return this.vx; }
    getVY() { return this.vy; }
    getRadius() { return this.radius; }

    setX(x: Pixel) { this.x = x; }
    setY(y: Pixel) { this.y = y; }
    setVX(vx: Pixel) { this.vx = vx; }
    setVY(vy: Pixel) { this.vy = vy; }
    setRadius(radius: Pixel) { this.radius = radius }

    move() {
        this.x = pixel(this.x + this.vx);
        this.y = pixel(this.y + this.vy);
    }

    bounceY() { this.vy = pixel(-this.vy); }
    bounceX() { this.vx = pixel(-this.vx); }
}
