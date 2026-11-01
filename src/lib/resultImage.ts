import { readableText, sliceColor } from './palette';
import { secureRandom } from './random';
import type { Rng } from './random';

export type ResultArt =
  | { kind: 'wheel'; canvas: HTMLCanvasElement }
  | { kind: 'dice'; canvas: HTMLCanvasElement }
  | { kind: 'coin'; label: string; color: string }
  | { kind: 'card'; label: string }
  | { kind: 'orb'; label: string };

export type ResultCard = {
  art?: ResultArt;
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
const ART_SIZE = 450;
const ART_LEFT = 56;
const ART_TOP = 136;
const TEXT_LEFT = 560;

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

export function wrapWords(
  text: string,
  fits: (line: string) => boolean,
): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && !fits(next)) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  return line ? [...lines, line] : lines;
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  maxSize: number,
) {
  let size = maxSize;
  let lines = [text];
  while (size > 16) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrapWords(text, (line) => ctx.measureText(line).width <= width);
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest <= width && lines.length * size * 1.15 <= width) break;
    size -= 2;
  }
  ctx.textAlign = 'center';
  const step = size * 1.15;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index - (lines.length - 1) / 2) * step);
  });
}

function drawPointer(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y - size * 0.55);
  ctx.lineTo(x + size / 2, y - size * 0.55);
  ctx.lineTo(x, y + size * 0.6);
  ctx.closePath();
  ctx.fillStyle = '#17181c';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
}

function drawArt(ctx: CanvasRenderingContext2D, art: ResultArt) {
  const x = ART_LEFT + ART_SIZE / 2;
  const y = ART_TOP + ART_SIZE / 2;
  const radius = ART_SIZE / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  if (art.kind === 'wheel' || art.kind === 'dice') {
    ctx.drawImage(art.canvas, ART_LEFT, ART_TOP, ART_SIZE, ART_SIZE);
    ctx.restore();
    if (art.kind === 'wheel') {
      ctx.beginPath();
      ctx.arc(x, y, ART_SIZE * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#17181c';
      ctx.stroke();
      drawPointer(ctx, x, ART_TOP + 6, 46);
    }
    return;
  }
  if (art.kind === 'coin') {
    ctx.beginPath();
    ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, radius - 30, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = art.color;
    ctx.stroke();
    ctx.fillStyle = art.color;
    drawCentered(ctx, art.label, x, y, ART_SIZE * 0.66, 76);
    return;
  }
  if (art.kind === 'card') {
    const width = ART_SIZE * 0.68;
    const height = ART_SIZE * 0.92;
    ctx.translate(x, y);
    ctx.rotate(-0.05);
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#17181c';
    ctx.stroke();
    ctx.fillStyle = '#17181c';
    drawCentered(ctx, art.label, 0, 0, width * 0.82, 56);
    ctx.restore();
    return;
  }
  const shell = ctx.createRadialGradient(x - 70, y - 90, 10, x, y, radius);
  shell.addColorStop(0, '#6a6d7c');
  shell.addColorStop(0.42, '#24252c');
  shell.addColorStop(1, '#0c0c10');
  ctx.beginPath();
  ctx.arc(x, y, radius - 8, 0, Math.PI * 2);
  ctx.fillStyle = shell;
  ctx.fill();
  ctx.restore();
  const inner = radius * 0.62;
  const glass = ctx.createRadialGradient(x, y, 10, x, y, inner);
  glass.addColorStop(0, '#3b2fa0');
  glass.addColorStop(1, '#1a1650');
  ctx.beginPath();
  ctx.arc(x, y, inner, 0, Math.PI * 2);
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  drawCentered(ctx, art.label, x, y, inner * 1.5, 46);
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

  if (card.art) {
    drawArt(ctx, card.art);
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
  }

  const textLeft = card.art ? TEXT_LEFT : MARGIN;
  const textWidth = WIDTH - MARGIN - textLeft;
  const textCenter = textLeft + textWidth / 2;
  let top = card.art ? 170 : 140;
  ctx.textAlign = 'center';
  if (card.question) {
    ctx.font = `600 34px ${FONT}`;
    write(fitText(ctx, card.question, textWidth), textCenter, top + 18);
    top += 64;
  }
  ctx.font = `500 32px ${FONT}`;
  write(card.winner, textCenter, top + 18);
  top += 56;

  const room = HEIGHT - top - 56;
  const size = fontSizeFor(ctx, card.lines, textWidth, room);
  const step = size * 1.2;
  const start = top + (room - step * card.lines.length) / 2 + step / 2;
  ctx.font = `800 ${size}px ${FONT}`;
  card.lines.forEach((line, index) => {
    write(fitText(ctx, line, textWidth), textCenter, start + index * step);
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
