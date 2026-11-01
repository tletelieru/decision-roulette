import { Box, Stack, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import { messages } from '../i18n/messages';
import { useMessages } from '../i18n/react';
import { dot, normalize, planRoll, restingRotation, rollAt, rotate, solidFor } from '../lib/dice';
import type { Quat, Vec } from '../lib/dice';
import { diceSides } from '../lib/modes';
import type { Stage } from '../lib/modes';

type Props = {
  ref: Ref<Stage<number>>;
  sides: number;
  onSides: (sides: number) => void;
};

const LIGHT = normalize([-0.45, 0.6, 0.75]);
const DEPTH = 0.16;
const FONT_SCALE: Record<number, number> = { 4: 0.42, 6: 0.62, 8: 0.4, 12: 0.34, 20: 0.23 };

function shade(hex: string, light: number): string {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  const [r, g, b] = channels.map((channel) => Math.round(Math.min(255, channel * light)));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function Dice({ ref, sides, onSides }: Props) {
  const t = useMessages(messages).dice;
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orientation = useRef<Quat>(restingRotation(solidFor(sides), sides));
  const frame = useRef(0);
  const [rolled, setRolled] = useState<number | null>(null);
  const color = theme.palette.primary.main;
  const ink = theme.palette.primary.contrastText;
  const dark = theme.palette.mode === 'dark';

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext?.('2d');
    if (!canvas || !ctx) return;
    const size = canvas.clientWidth;
    if (!size) return;
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size * ratio)) {
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
    }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const solid = solidFor(sides);
    const radius = size * 0.44;
    const center = size / 2;
    const q = orientation.current;
    const project = (point: Vec): [number, number] => {
      const lens = 1 / (1 - point[2] * DEPTH);
      return [center + point[0] * radius * lens, center - point[1] * radius * lens];
    };
    const corners = solid.vertices.map((vertex) => rotate(q, vertex));
    const visible = solid.faces
      .map((face) => ({ face, normal: rotate(q, face.normal) }))
      .filter(({ normal }) => normal[2] > 0.02);
    const outline = (points: number[]) => {
      ctx.beginPath();
      points
        .map((index) => project(corners[index]))
        .forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    };

    ctx.lineJoin = 'round';
    for (const { face, normal } of visible) {
      const light = 0.5 + 0.62 * Math.max(0, dot(normal, LIGHT));
      const muted = rolled !== null && face.value !== rolled;
      outline(face.points);
      if (face.value === rolled) ctx.fillStyle = color;
      else ctx.fillStyle = shade(muted ? (dark ? '#4a4c56' : '#c4c5cc') : color, light);
      ctx.fill();
      ctx.lineWidth = Math.max(1.5, size * 0.008);
      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.stroke();
    }

    const winner = visible.find(({ face }) => face.value === rolled);
    if (winner) {
      outline(winner.face.points);
      ctx.lineWidth = Math.max(3, size * 0.016);
      ctx.strokeStyle = dark ? '#ffffff' : '#17181c';
      ctx.stroke();
    }

    ctx.font = `800 ${FONT_SCALE[sides] * 100}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { face, normal } of visible) {
      const mid = rotate(q, face.center);
      const up = rotate(q, face.up);
      const right: Vec = [
        up[1] * normal[2] - up[2] * normal[1],
        up[2] * normal[0] - up[0] * normal[2],
        up[0] * normal[1] - up[1] * normal[0],
      ];
      const [x, y] = project(mid);
      const unit = (radius / (1 - mid[2] * DEPTH)) * 0.01;
      ctx.setTransform(
        ratio * right[0] * unit,
        -ratio * right[1] * unit,
        -ratio * up[0] * unit,
        ratio * up[1] * unit,
        ratio * x,
        ratio * y,
      );
      const muted = rolled !== null && face.value !== rolled;
      ctx.fillStyle = muted ? (dark ? '#c9cad1' : '#4a4c56') : ink;
      const marked = sides > 6 && (face.value === 6 || face.value === 9);
      ctx.fillText(marked ? `${face.value}.` : `${face.value}`, 0, 2);
    }
  }, [color, dark, ink, rolled, sides]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useImperativeHandle(
    ref,
    () => ({
      run: (value, seconds) =>
        new Promise((resolve) => {
          const end = restingRotation(solidFor(sides), value);
          setRolled(null);
          if (seconds <= 0) {
            orientation.current = end;
            setRolled(value);
            resolve();
            return;
          }
          const total = seconds * 1000;
          const turns = Math.max(3, Math.round(seconds * 1.5));
          const roll = planRoll(orientation.current, end, turns, normalize([0.7, 0.2, 0.5]));
          canvasRef.current?.animate?.(
            [
              { transform: 'translateY(0) scale(1)' },
              { transform: 'translateY(-12%) scale(1.08)', offset: 0.3 },
              { transform: 'translateY(0) scale(1)', offset: 0.7 },
              { transform: 'translateY(-3%) scale(1.02)', offset: 0.84 },
              { transform: 'translateY(0) scale(1)' },
            ],
            { duration: total, easing: 'ease-in-out' },
          );
          const startedAt = performance.now();
          const step = (now: number) => {
            const progress = Math.min(1, (now - startedAt) / total);
            orientation.current = rollAt(roll, progress);
            draw();
            if (progress < 1) {
              frame.current = requestAnimationFrame(step);
              return;
            }
            setRolled(value);
            resolve();
          };
          frame.current = requestAnimationFrame(step);
        }),
    }),
    [draw, sides],
  );

  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', width: '100%' }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        aria-label={t.sides}
        value={sides}
        onChange={(_, next: number | null) => {
          if (next) onSides(next);
        }}
      >
        {diceSides.map((option) => (
          <ToggleButton key={option} value={option} sx={{ px: 1.5, fontWeight: 700 }}>
            d{option}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box
        ref={canvasRef}
        component="canvas"
        role="img"
        aria-label={`d${sides}`}
        sx={{
          display: 'block',
          width: 'min(62%, 34dvh, 280px)',
          aspectRatio: '1',
          filter: 'drop-shadow(0 14px 16px rgba(0,0,0,0.3))',
        }}
      />
    </Stack>
  );
}
