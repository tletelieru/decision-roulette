import { Box, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
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
  hasOptions: boolean;
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

export default function Dice({ ref, sides, hasOptions, onSides }: Props) {
  const t = useMessages(messages).dice;
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orientation = useRef<Quat>(restingRotation(solidFor(sides), sides));
  const frame = useRef(0);
  const color = theme.palette.primary.main;
  const ink = theme.palette.primary.contrastText;

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

    for (const face of solid.faces) {
      const normal = rotate(q, face.normal);
      if (normal[2] <= 0.02) continue;
      const points = face.points.map((index) => project(corners[index]));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.beginPath();
      points.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = shade(color, 0.5 + 0.62 * Math.max(0, dot(normal, LIGHT)));
      ctx.fill();
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(1.5, size * 0.008);
      ctx.strokeStyle = 'rgba(255,255,255,0.42)';
      ctx.stroke();

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
      ctx.font = `800 ${FONT_SCALE[sides] * 100}px Inter, ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ink;
      const marked = sides > 6 && (face.value === 6 || face.value === 9);
      ctx.fillText(marked ? `${face.value}.` : `${face.value}`, 0, 2);
    }
  }, [color, ink, sides]);

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
          if (seconds <= 0) {
            orientation.current = end;
            draw();
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
            if (progress < 1) frame.current = requestAnimationFrame(step);
            else resolve();
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
      {hasOptions && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {t.mapped}
        </Typography>
      )}
    </Stack>
  );
}
