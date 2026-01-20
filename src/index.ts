import { config } from "dotenv";
config({ path: ["../.env", "./.env"] });
import fs from "fs";
import { GitHubResponseSchema } from "./schema.js";
import { Ball } from "./class/ball.js";
import { Block } from "./class/block.js";

type Contribute = { date: string; contributionCount: number };

const ROWS = 7;
const COLS = 53;
const BLOCK_SIZE = 10;
const BALL_RADIUS = 0.5;
const FPS = 120;

async function getContributes(username: string, token: string): Promise<Contribute[]> {
    const query = `
query ($user: String!) {
    user(login: $user) {
        contributionsCollection {
        contributionCalendar {
            weeks {
            contributionDays {
                date
                contributionCount
            }
            }
            totalContributions
        }
        }
    }
}
`;
    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables: { user: username } }),
    });
    const parsed = GitHubResponseSchema.parse(await res.json());
    return parsed.data.user.contributionsCollection.contributionCalendar.weeks
        .flatMap(w => w.contributionDays)
        .sort((a, b) => a.date.localeCompare(b.date));
}

// 衝突判定
function checkCollision(ball: Ball, block: Block): boolean {
    const bx = block.getX() / BLOCK_SIZE;
    const by = block.getY() / BLOCK_SIZE;
    const bw = block.getWidth() / BLOCK_SIZE;
    const bh = block.getHeight() / BLOCK_SIZE;

    return (
        ball.getX() + ball.getRadius() > bx &&
        ball.getX() - ball.getRadius() < bx + bw &&
        ball.getY() + ball.getRadius() > by &&
        ball.getY() - ball.getRadius() < by + bh
    );
}

function tick(ball: Ball, blocks: Block[], ballPath: { x: number; y: number }[]) {
    // 画面端で跳ね返る
    if (ball.getX() < 0) {
        ball.setX(ball.getRadius());
        ball.bounceX();
    } else if (ball.getX() + ball.getRadius() > COLS) {
        ball.setX(COLS - ball.getRadius());
        ball.bounceX();
    }
    if (ball.getY() < 0) {
        ball.setY(ball.getRadius());
        ball.bounceY();
    } else if (ball.getY() + ball.getRadius() > ROWS) {
        ball.setY(ROWS - ball.getRadius());
        ball.bounceY();
    }

    // ブロックとの衝突
    blocks.forEach(block => {
        if (!block.isAlive() || !checkCollision(ball, block)) return;

        // 体力を減らす
        block.setContribute(block.getContribute() - 1);

        // 衝突方向の判定（中心座標ベース）
        const dx = ball.getX() - (block.getX() / BLOCK_SIZE + block.getWidth() / BLOCK_SIZE / 2);
        const dy = ball.getY() - (block.getY() / BLOCK_SIZE + block.getHeight() / BLOCK_SIZE / 2);

        if (Math.abs(dx) > Math.abs(dy)) {
            ball.bounceX();
        } else {
            ball.bounceY();
        }
    });

    // ボール移動
    ball.move();

    // 経路を記録
    ballPath.push({ x: ball.getX(), y: ball.getY() });
}


export async function main() {
    const owner = process.env.GITHUB_REPOSITORY_OWNER ?? "SUKEsann2000";
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKENが設定されていません");

    const contributes = await getContributes(owner, token);

    const blocks: Block[] = [];
    contributes.forEach((c, index) => {
        const row = index % ROWS;
        const col = Math.floor(index / ROWS);
        if (c.contributionCount > 0) {
            const color = c.contributionCount <= 2 ? "#c6e48b" : c.contributionCount <= 4 ? "#7bc96f" : "#196127";
            blocks.push(new Block(col * BLOCK_SIZE, row * BLOCK_SIZE, color, BLOCK_SIZE, BLOCK_SIZE, true, `block-${row}-${col}`, c.contributionCount));
        }
    });

    // ランダムな位置（ボールが画面内に完全に収まるように）
    const startX = Math.random() * (COLS - BALL_RADIUS * 2) + BALL_RADIUS;
    const startY = Math.random() * (ROWS - BALL_RADIUS * 2) + BALL_RADIUS;

    // ランダムな速度（例えば -0.3〜0.3 の範囲で X/Y 両方）
    const speedRange = 0.3;
    const startVx = (Math.random() * 2 - 1) * speedRange;
    const startVy = (Math.random() * 2 - 1) * speedRange;

    // ボール生成
    const ball = new Ball(startX, startY, startVx, startVy, BALL_RADIUS);

    const ballPath: { x: number; y: number }[] = [];
    const blockHitFrames: Record<string, number> = {};
    blocks.forEach(b => blockHitFrames[b.getId()] = -1);

    let frame = 0;
    while (blocks.some(b => b.isAlive())) {
        tick(ball, blocks, ballPath);
        blocks.forEach(block => {
            if (!block.isAlive() && blockHitFrames[block.getId()] === -1) {
                blockHitFrames[block.getId()] = frame;
            }
        });
        frame++;
    }

    const animationDuration = (frame / FPS).toFixed(2);
    const ballSize = BALL_RADIUS * BLOCK_SIZE * 2;

    // ballのキーフレーム
    const keyframes = ballPath.map((pos, i) => {
        const pct = (i / (ballPath.length - 1)) * 100;
        const x = pos.x * BLOCK_SIZE - ballSize / 2;
        const y = pos.y * BLOCK_SIZE - ballSize / 2;
        return `${pct.toFixed(2)}% { transform: translate(${x}px, ${y}px); }`;
    }).join('\n');

    // ブロックのアニメーション（体力→透明になる）
    const blockAnimations = blocks.map(block => {
        const f = blockHitFrames[block.getId()];
        if (f === -1 || !f) return '';
        const delay = (f / frame * Number(animationDuration)).toFixed(2);
    
        const hp = block.getMaxContribute();
        const startColor = hp >= 4 ? "#196127" : hp >= 2 ? "#7bc96f" : "#c6e48b";
    
        const keyframeName = `fadeColor-${block.getId()}`;
        return `
    @keyframes ${keyframeName} {
      0% { fill: ${startColor}; }
      50% { fill: #7bc96f; }
      100% { fill: #c6e48b00; }
    }
    #${block.getId()} {
      animation: disappear 0.1s linear ${delay}s forwards, ${keyframeName} ${animationDuration}s linear forwards;
    }
    `;
    }).join('\n');
    
    const svg = `<svg width="${COLS * BLOCK_SIZE}" height="${ROWS * BLOCK_SIZE}" xmlns="http://www.w3.org/2000/svg">
<style>
.ball { 
    fill: #ff0000; 
    width:${ballSize}px; 
    height:${ballSize}px; 
    animation: move ${animationDuration}s linear forwards; 
}
@keyframes move { ${keyframes} }
@keyframes disappear { 0% { opacity: 1; } 100% { opacity: 0; } }
${blockAnimations}
</style>
${blocks.map(b => b.toSVG()).join('\n')}
<rect class="ball" x="0" y="0" width="${ballSize}" height="${ballSize}" />
</svg>`;

    fs.writeFileSync('out.svg', svg);
    console.log('SVG出力しました: out.svg');
}

main();
