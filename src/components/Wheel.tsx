import { Box, ButtonBase, useTheme } from '@mui/material';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { PointerEvent, ReactNode, Ref } from 'react';
import { playTick } from '../lib/feedback';
import { stoppableProgress } from '../lib/modes';
import type { Option } from '../lib/options';
import { readableText, sliceColor } from '../lib/palette';
import {
  buildSlices,
  landingPoint,
  overshootFor,
  sliceAt,
  spinPosition,
  spinTarget,
  wrapDelta,
} from '../lib/wheel';

export type WheelHandle = {
  spin: (
    index: number,
    seconds: number,
    signal?: AbortSignal,
    direction?: number,
  ) => Promise<void>;
};

type Props = {
  ref: Ref<WheelHandle>;
  options: Option[];
  sound: boolean;
  disabled: boolean;
  draggable: boolean;
  hubLabel: ReactNode;
  onHub: () => void;
  onFling: (direction: number) => void;
};

const MIN_DRAG_TURNS = 0.02;

const toRadians = (turn: number) => turn * Math.PI * 2 - Math.PI / 2;

function fit(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut}…`;
}

export default function Wheel({
  ref,
  options,
  sound,
  disabled,
  draggable,
  hubLabel,
  onHub,
  onFling,
}: Props) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<SVGSVGElement>(null);
  const rotation = useRef(0);
  const labelRotation = useRef(0);
  const frame = useRef(0);
  const drag = useRef<{ last: number; moved: number } | null>(null);
  const slices = useMemo(() => buildSlices(options.map((option) => option.weight)), [options]);
  const rim = theme.palette.background.paper;

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

    const center = size / 2;
    const ring = Math.max(8, size * 0.022);
    const radius = center - ring;

    ctx.beginPath();
    ctx.arc(center, center, center - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();

    slices.forEach((slice, index) => {
      const start = toRadians(slice.start + rotation.current);
      const end = toRadians(slice.end + rotation.current);
      const color = sliceColor(index, slices.length);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (slices.length > 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const arc = (end - start) * radius * 0.78;
      const font = Math.min(Math.max(13, size * 0.038), arc * 0.62);
      if (font < 8) return;
      ctx.save();
      ctx.translate(center, center);
      const middle = (start + end) / 2;
      const midTurn = (slice.start + slice.end) / 2;
      const flipped = Math.cos(toRadians(midTurn + labelRotation.current)) < 0;
      ctx.rotate(flipped ? middle + Math.PI : middle);
      ctx.font = `600 ${font}px Inter, ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = flipped ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = readableText(color);
      const offset = radius - size * 0.03;
      ctx.fillText(fit(ctx, options[index].label, radius * 0.66), flipped ? -offset : offset, 0);
      ctx.restore();
    });

    slices.forEach((slice) => {
      const angle = toRadians(slice.start + rotation.current);
      ctx.beginPath();
      ctx.arc(
        center + Math.cos(angle) * (radius + ring / 2),
        center + Math.sin(angle) * (radius + ring / 2),
        Math.max(2, ring * 0.26),
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = theme.palette.text.secondary;
      ctx.fill();
    });
  }, [options, rim, slices, theme.palette.text.secondary]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const pointerTurn = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    return Math.atan2(x, -y) / (Math.PI * 2);
  };

  const startDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!draggable) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { last: pointerTurn(event), moved: 0 };
  };

  const moveDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return;
    const turn = pointerTurn(event);
    const delta = wrapDelta(turn - drag.current.last);
    drag.current = { last: turn, moved: drag.current.moved + delta };
    rotation.current += delta;
    draw();
  };

  const endDrag = () => {
    const moved = drag.current?.moved ?? 0;
    drag.current = null;
    if (Math.abs(moved) >= MIN_DRAG_TURNS) onFling(Math.sign(moved));
  };

  useImperativeHandle(
    ref,
    () => ({
      spin: (index, seconds, signal, direction = 1) =>
        new Promise((resolve) => {
          const slice = slices[index];
          const landing = landingPoint(slice);
          const from = rotation.current;
          if (seconds <= 0) {
            rotation.current = spinTarget(from, landing, 1);
            labelRotation.current = rotation.current;
            draw();
            resolve();
            return;
          }
          const turns = Math.max(3, Math.round(seconds * 1.4));
          const to = spinTarget(from, landing, turns, direction);
          const overshoot = overshootFor(slice) * direction;
          labelRotation.current = to;
          const progressAt = stoppableProgress(seconds * 1000, signal, performance.now());
          let current = sliceAt(from, slices);
          const step = (now: number) => {
            const progress = progressAt(now);
            rotation.current = spinPosition(progress, from, to, overshoot);
            draw();
            const next = sliceAt(rotation.current, slices);
            if (next !== current) {
              current = next;
              if (sound) playTick();
              pointerRef.current?.animate(
                [{ rotate: '0deg' }, { rotate: '-16deg' }, { rotate: '0deg' }],
                { duration: 110 },
              );
            }
            if (progress < 1) frame.current = requestAnimationFrame(step);
            else resolve();
          };
          frame.current = requestAnimationFrame(step);
        }),
    }),
    [draw, slices, sound],
  );

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 'min(520px, 56dvh)', aspectRatio: '1', mx: 'auto' }}>
      <Box
        ref={canvasRef}
        component="canvas"
        role="img"
        aria-label={options.map((option) => option.label).join(', ')}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          drag.current = null;
        }}
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          touchAction: 'none',
          cursor: draggable ? 'grab' : 'default',
          '&:active': { cursor: draggable ? 'grabbing' : 'default' },
          boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
        }}
      />
      <Box
        ref={pointerRef}
        component="svg"
        viewBox="0 0 40 48"
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-3%',
          left: '50%',
          width: '9%',
          ml: '-4.5%',
          transformOrigin: '50% 20%',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))',
        }}
      >
        <path d="M3 3h34L20 45z" fill={theme.palette.text.primary} stroke={rim} strokeWidth="3" strokeLinejoin="round" />
      </Box>
      <ButtonBase
        onClick={onHub}
        disabled={disabled}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '24%',
          aspectRatio: '1',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 4,
          borderColor: 'primary.main',
          fontWeight: 800,
          fontSize: 'clamp(0.85rem, 3vw, 1.2rem)',
          letterSpacing: '0.02em',
          boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
          transition: 'scale 120ms',
          '&:hover': { scale: '1.05' },
          '&.Mui-disabled': { color: 'text.secondary', borderColor: 'divider' },
        }}
      >
        {hubLabel}
      </ButtonBase>
    </Box>
  );
}
