import { readableText, sliceColor } from './palette';
import { secureRandom } from './random';
import type { Rng } from './random';

export type ResultCard = {
  appName: string;
  mode: string;
  winner: string;
  lines: string[];
  color: string;
  question?: string;
  confetti: boolean;
};

export type ConfettiPiece = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  color: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN = 64;
const FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';

export function confettiPieces(
  count: number,
  width: number,
  height: number,
  background: string,
  rng: Rng = secureRandom,
): ConfettiPiece[] {
  return Array.from({ length: count }, () => {
    const pick = sliceColor(Math.floor(rng() * 8), 100);
    return {
      x: rng() * width,
      y: rng() * height,
      width: 8 + rng() * 14,
      height: 6 + rng() * 10,
      angle: rng() * Math.PI,
      color: pick === background ? '#ffffff' : pick,
    };
  });
}

function fontSizeFor(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
  maxHeight: number,
): number {
  let size = 112;
  while (size > 24) {
    ctx.font = `800 ${size}px ${FONT}`;
    const fits = lines.every((line) => ctx.measureText(line).width <= maxWidth);
    if (fits && lines.length * size * 1.2 <= maxHeight) break;
    size -= 4;
  }
  return size;
}

function fitText(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut}…`;
}

function drawCard(ctx: CanvasRenderingContext2D, card: ResultCard) {
  const ink = readableText(card.color);
  ctx.fillStyle = card.color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (card.confetti) {
    for (const piece of confettiPieces(170, WIDTH, HEIGHT, card.color)) {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.angle);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      ctx.restore();
    }
  }

  const write = (text: string, x: number, y: number) => {
    if (card.confetti) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = 16;
      ctx.strokeStyle = card.color;
      ctx.strokeText(text, x, y);
    }
    ctx.fillText(text, x, y);
  };

  ctx.fillStyle = ink;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `700 32px ${FONT}`;
  write(card.appName, MARGIN, 72);
  ctx.textAlign = 'right';
  ctx.font = `600 28px ${FONT}`;
  write(card.mode, WIDTH - MARGIN, 72);

  const textWidth = WIDTH - MARGIN * 2;
  let top = 140;
  ctx.textAlign = 'center';
  if (card.question) {
    ctx.font = `600 34px ${FONT}`;
    write(fitText(ctx, card.question, textWidth), WIDTH / 2, top + 18);
    top += 64;
  }
  ctx.font = `500 32px ${FONT}`;
  write(card.winner, WIDTH / 2, top + 18);
  top += 56;

  const room = HEIGHT - top - 56;
  const size = fontSizeFor(ctx, card.lines, textWidth, room);
  const step = size * 1.2;
  const start = top + (room - step * card.lines.length) / 2 + step / 2;
  ctx.font = `800 ${size}px ${FONT}`;
  card.lines.forEach((line, index) => {
    write(fitText(ctx, line, textWidth), WIDTH / 2, start + index * step);
  });
}

export function resultBlob(card: ResultCard): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return Promise.resolve(null);
  drawCard(ctx, card);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export function resultText(card: Pick<ResultCard, 'winner' | 'lines' | 'question'>): string {
  const answer = `${card.winner}: ${card.lines.join(', ')}`;
  return card.question ? `${card.question} ${answer}` : answer;
}
