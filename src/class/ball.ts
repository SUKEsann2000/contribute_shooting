export class Ball {
    private x: number;
    private y: number;
    private vx: number;
    private vy: number;
    private radius: number;

    constructor(
        x: number,
        y: number,
        vx: number,
        vy: number,
        radius: number
    ) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getVX() { return this.vx; }
    getVY() { return this.vy; }
    getRadius() { return this.radius; }

    setX(x: number) { this.x = x; }
    setY(y: number) { this.y = y; }
    setVX(vx: number) { this.vx = vx; }
    setVY(vy: number) { this.vy = vy; }
    setRadius(radius: number) { this.radius = radius }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    bounceY() { this.vy = -this.vy; }
    bounceX() { this.vx = -this.vx; }
}
