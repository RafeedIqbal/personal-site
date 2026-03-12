"use client";

import { useEffect, useRef } from "react";

const ASCII_CHARS = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`abcdefghijklmnopqrstuvwxyz0123456789";
const GRID_SPACING = 28;
const FONT_SIZE = 12;
const REVEAL_RADIUS = 80;
const MAGNETIC_RADIUS = 190;
const MAGNETIC_STOP_RADIUS = 28;
const MAX_DISPLACEMENT = 24;
const ACTIVE_MAX_OPACITY = 1;
const TRAIL_MAX_OPACITY = 0.72;
const HIGHLIGHT_LINGER_MS = 1000;
const POINTER_ACTIVE_MS = 120;
const POSITION_EASING = 0.18;
const OPACITY_EASING = 0.22;
const FRAME_MS = 1000 / 60;
const MAX_DPR = 2;
const VISIBLE_EPSILON = 0.005;
const REVEAL_RADIUS_SQ = REVEAL_RADIUS * REVEAL_RADIUS;
const MAGNETIC_RADIUS_SQ = MAGNETIC_RADIUS * MAGNETIC_RADIUS;
const MAGNETIC_STOP_RADIUS_SQ = MAGNETIC_STOP_RADIUS * MAGNETIC_STOP_RADIUS;

interface Particle {
  char: string;
  originX: number;
  originY: number;
  x: number;
  y: number;
  opacity: number;
  trailOpacity: number;
  fadeUntil: number;
}

interface PointerState {
  x: number;
  y: number;
  lastMoveAt: number;
}

interface ViewportState {
  width: number;
  height: number;
  lastFrameAt: number;
}

function pickChar(column: number, row: number) {
  const seed = ((column + 1) * 73856093) ^ ((row + 1) * 19349663);
  return ASCII_CHARS[Math.abs(seed) % ASCII_CHARS.length];
}

function createParticleGrid(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  let column = 0;

  for (let x = GRID_SPACING / 2; x < width; x += GRID_SPACING) {
    let row = 0;

    for (let y = GRID_SPACING / 2; y < height; y += GRID_SPACING) {
      particles.push({
        char: pickChar(column, row),
        originX: x,
        originY: y,
        x,
        y,
        opacity: 0,
        trailOpacity: 0,
        fadeUntil: 0,
      });

      row += 1;
    }

    column += 1;
  }

  return particles;
}

function getBlendFactor(easing: number, deltaMs: number) {
  return 1 - Math.pow(1 - easing, deltaMs / FRAME_MS);
}

export default function BackgroundEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<PointerState>({
    x: -MAGNETIC_RADIUS,
    y: -MAGNETIC_RADIUS,
    lastMoveAt: -Infinity,
  });
  const viewportRef = useRef<ViewportState>({
    width: 0,
    height: 0,
    lastFrameAt: 0,
  });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = (timestamp: number) => {
      const viewport = viewportRef.current;
      const particles = particlesRef.current;
      const pointer = pointerRef.current;
      const deltaMs = viewport.lastFrameAt
        ? Math.min(timestamp - viewport.lastFrameAt, 64)
        : FRAME_MS;
      const positionBlend = getBlendFactor(POSITION_EASING, deltaMs);
      const opacityBlend = getBlendFactor(OPACITY_EASING, deltaMs);
      const isPointerActive = timestamp - pointer.lastMoveAt < POINTER_ACTIVE_MS;

      viewport.lastFrameAt = timestamp;

      ctx.clearRect(0, 0, viewport.width, viewport.height);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 1;

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];
        const dx = pointer.x - particle.originX;
        const dy = pointer.y - particle.originY;
        const distSq = dx * dx + dy * dy;

        let desiredOpacity = 0;
        let distance = 0;

        if (isPointerActive && distSq < REVEAL_RADIUS_SQ) {
          distance = Math.sqrt(distSq);
          const intensity = 1 - distance / REVEAL_RADIUS;

          particle.trailOpacity = Math.max(
            particle.trailOpacity,
            intensity * TRAIL_MAX_OPACITY
          );
          particle.fadeUntil = timestamp + HIGHLIGHT_LINGER_MS;
          desiredOpacity = intensity * ACTIVE_MAX_OPACITY;
        } else if (timestamp < particle.fadeUntil) {
          const remaining = (particle.fadeUntil - timestamp) / HIGHLIGHT_LINGER_MS;
          desiredOpacity = particle.trailOpacity * remaining;
        } else {
          particle.trailOpacity = 0;
          particle.fadeUntil = 0;
        }

        particle.opacity += (desiredOpacity - particle.opacity) * opacityBlend;
        if (particle.opacity < VISIBLE_EPSILON && desiredOpacity < VISIBLE_EPSILON) {
          particle.opacity = 0;
        }

        const shouldHoldMagnet =
          (isPointerActive && distSq < MAGNETIC_RADIUS_SQ) ||
          particle.opacity > VISIBLE_EPSILON ||
          desiredOpacity > VISIBLE_EPSILON;

        let targetX = particle.originX;
        let targetY = particle.originY;

        if (shouldHoldMagnet && distSq < MAGNETIC_RADIUS_SQ && distSq > MAGNETIC_STOP_RADIUS_SQ) {
          if (distance === 0) {
            distance = Math.sqrt(distSq);
          }

          const falloff =
            (distance - MAGNETIC_STOP_RADIUS) /
            (MAGNETIC_RADIUS - MAGNETIC_STOP_RADIUS);
          const strength = Math.min(
            Math.pow(1 - falloff, 1.35) * MAX_DISPLACEMENT,
            distance - MAGNETIC_STOP_RADIUS
          );
          const scale = strength / distance;

          targetX = particle.originX + dx * scale;
          targetY = particle.originY + dy * scale;
        }

        particle.x += (targetX - particle.x) * positionBlend;
        particle.y += (targetY - particle.y) * positionBlend;

        if (particle.opacity > VISIBLE_EPSILON) {
          ctx.globalAlpha = particle.opacity;
          ctx.fillText(particle.char, particle.x, particle.y);
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(drawFrame);
    };

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      viewportRef.current = {
        width,
        height,
        lastFrameAt: performance.now(),
      };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      particlesRef.current = createParticleGrid(width, height);
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        lastMoveAt: performance.now(),
      };
    };

    const handleMouseLeave = () => {
      pointerRef.current = {
        x: pointerRef.current.x,
        y: pointerRef.current.y,
        lastMoveAt: -Infinity,
      };
    };

    resizeCanvas();
    rafRef.current = requestAnimationFrame(drawFrame);

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
