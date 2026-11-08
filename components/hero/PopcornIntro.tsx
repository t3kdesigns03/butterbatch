"use client";

import { useEffect, useRef } from "react";
import { drawSeed, FLAVORS, makePuffSprite, popScale } from "./sprites";

/**
 * Full-screen popcorn moment when the site opens: kernels pop up from the lower part of the
 * screen in a rising crescendo, fill the view, then fall away and the canvas removes itself
 * (~3s). Click-through (pointer-events: none), aria-hidden, skipped for reduced motion or if the
 * page opens scrolled away from the hero. Plays once per full page load.
 *
 * Drawn popcorn only — the logo underneath is never touched.
 */

let playedThisLoad = false;

type Pop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  delay: number;
  seed: number;
  sprite: number;
  popped: boolean;
};
type Fleck = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };

const GRAVITY = 1500;
const MAX_TIME = 3.6; // hard stop, seconds

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function PopcornIntro() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // Hide (not unmount) when skipped or finished: no re-render needed, nothing left painting.
    let finished = false;
    const finish = () => {
      finished = true;
      canvas.style.display = "none";
      canvas.width = canvas.height = 0;
    };
    if (
      playedThisLoad ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.scrollY > window.innerHeight * 0.5
    ) {
      finish();
      return;
    }
    playedThisLoad = true;

    const g = canvas.getContext("2d");
    if (!g) {
      finish();
      return;
    }
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    const small = W < 640;
    const spritePx = Math.round(64 * dpr);
    const sprites = FLAVORS.flatMap((f) => [0, 1].map((v) => makePuffSprite(spritePx, f, v, true)));

    const n = small ? 40 : 64;
    const pops: Pop[] = [];
    for (let i = 0; i < n; i++) {
      // crescendo: pops get closer together, like a pan coming up to temperature
      const t = i / (n - 1);
      const delay = 0.15 + Math.pow(t, 0.7) * 1.15 + rand(-0.04, 0.04);
      const x = rand(W * 0.04, W * 0.96);
      const y = rand(H * 0.55, H * 1.02);
      const apex = rand(H * 0.18, H * 0.62); // how high above its start it flies
      pops.push({
        x,
        y,
        vx: rand(-260, 260),
        vy: -Math.sqrt(2 * GRAVITY * Math.min(apex, y - 20)),
        rot: rand(0, Math.PI * 2),
        vr: rand(-8, 8),
        size: small ? rand(30, 50) : rand(38, 66),
        delay,
        seed: rand(0.05, 0.1),
        sprite: Math.floor(rand(0, sprites.length)),
        popped: false,
      });
    }
    let flecks: Fleck[] = [];

    let raf = 0;
    let last = performance.now();
    let time = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;
      g.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of pops) {
        const age = time - p.delay;
        if (age < 0) {
          alive++;
          continue;
        }
        if (age < p.seed) {
          alive++;
          drawSeed(g, p.x + Math.sin(age * 140) * 1.5, p.y, p.size * 0.3, p.rot);
          continue;
        }
        if (!p.popped) {
          p.popped = true;
          for (let i = 0; i < 3; i++) {
            const a = rand(0, Math.PI * 2);
            const v = rand(140, 280);
            flecks.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, age: 0, life: rand(0.3, 0.55), size: rand(2, 4) });
          }
        }
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.y - p.size > H) continue;
        alive++;
        const size = p.size * popScale(age - p.seed);
        g.globalAlpha = time > MAX_TIME - 0.4 ? Math.max(0, (MAX_TIME - time) / 0.4) : 1;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.drawImage(sprites[p.sprite], -size / 2, -size / 2, size, size);
        g.restore();
      }
      flecks = flecks.filter((f) => {
        f.age += dt;
        f.vy += GRAVITY * 0.7 * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.age >= f.life) return false;
        g.globalAlpha = 1 - f.age / f.life;
        g.fillStyle = "#ffc93c";
        g.beginPath();
        g.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        g.fill();
        return true;
      });
      g.globalAlpha = 1;
      if ((alive === 0 && flecks.length === 0) || time > MAX_TIME) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Interrupted before finishing (e.g. React Strict Mode's dev double-run): allow a replay.
      if (!finished) playedThisLoad = false;
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}
