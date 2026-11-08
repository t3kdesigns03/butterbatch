"use client";

import { useEffect, useRef } from "react";
import type { Look } from "@/data/menu";
import { onBurst, type BurstRequest } from "@/lib/popBus";
import { drawSeed, makePuffSprite, popScale, type Flavor } from "../hero/sprites";

/**
 * Page-wide popping layer: one click-through canvas over the whole viewport.
 * - Tap any button / link / card ([data-pop]) → 7–11 kernels from the exact tap point.
 * - Logo tap (sent by HeroStage) → 14 kernels rise from the popcorn pile at the bottom of the logo.
 * Every kernel launches UP first, then arcs and drifts down. Silent. Off for reduced motion.
 * Particles are an animation effect only — never product imagery, never drawn over as a photo.
 */
type K = {
  x: number; y: number; vx: number; vy: number; rot: number; vr: number;
  size: number; age: number; seed: number; life: number; sprite: HTMLCanvasElement; popped: boolean;
};
type Fleck = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };

const GRAVITY = 1250;
const LOOKS: Flavor[] = ["butter", "kettle", "caramel", "cheddar", "apple"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function PopLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0;
    let kernels: K[] = [];
    let flecks: Fleck[] = [];
    const cache = new Map<string, HTMLCanvasElement[]>();
    const spritesFor = (look: Look) => {
      const key = `${look}@${dpr}`;
      let s = cache.get(key);
      if (!s) {
        s = [0, 1].map((v) => makePuffSprite(Math.round(64 * dpr), (LOOKS.includes(look as Flavor) ? look : "butter") as Flavor, v, true));
        cache.set(key, s);
      }
      return s;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const add = (x: number, y: number, look: Look, spreadUp: number, speed: [number, number], delayMax: number, size: number) => {
      const sprites = spritesFor(look);
      const angle = -Math.PI / 2 + rand(-spreadUp, spreadUp); // always an upward launch
      const sp = rand(speed[0], speed[1]);
      kernels.push({
        x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp, rot: rand(0, Math.PI * 2), vr: rand(-9, 9),
        size: size * rand(0.85, 1.25), age: -rand(0, delayMax), seed: rand(0.04, 0.08), life: rand(1.5, 2.2),
        sprite: sprites[Math.floor(rand(0, sprites.length))], popped: false,
      });
    };

    const handle = (r: BurstRequest) => {
      if (mq.matches) return;
      if (r.kind === "point") {
        const n = r.count ?? Math.floor(rand(7, 12));
        for (let i = 0; i < n; i++) add(r.x + rand(-6, 6), r.y + rand(-6, 6), r.look ?? "butter", 1.05, [360, 620], i < 2 ? 0 : 0.12, 30);
      } else {
        const { left, top, width, height } = r.rect;
        const n = r.count ?? 14;
        const looks: Look[] = ["butter", "kettle", "caramel", "cheddar"];
        for (let i = 0; i < n; i++) {
          // the pile of popcorn along the bottom of the logo artwork
          add(left + width * rand(0.18, 0.82), top + height * rand(0.84, 0.92), looks[i % looks.length], 0.75, [420, 700], 0.25, Math.max(26, width * 0.09));
        }
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      g.clearRect(0, 0, W, H);
      const keep: K[] = [];
      for (const k of kernels) {
        k.age += dt;
        if (k.age < 0) { keep.push(k); continue; }
        if (k.age < k.seed) {
          drawSeed(g, k.x + Math.sin(k.age * 140) * 1.5, k.y, k.size * 0.3, k.rot);
          keep.push(k);
          continue;
        }
        if (!k.popped) {
          k.popped = true;
          for (let i = 0; i < 3; i++) {
            const a = -Math.PI / 2 + rand(-1.4, 1.4), v = rand(120, 240);
            flecks.push({ x: k.x, y: k.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rand(0.3, 0.5), size: rand(2, 3.5) });
          }
        }
        if (k.age >= k.life) continue;
        k.vy += GRAVITY * dt; k.vx *= 1 - 0.5 * dt;
        k.x += k.vx * dt; k.y += k.vy * dt; k.rot += k.vr * dt;
        if (k.y > H + 60) continue;
        const s = k.size * popScale(k.age - k.seed);
        g.globalAlpha = Math.max(0, Math.min(1, (k.life - k.age) / (k.life * 0.35)));
        g.save(); g.translate(k.x, k.y); g.rotate(k.rot);
        g.drawImage(k.sprite, -s / 2, -s / 2, s, s);
        g.restore();
        keep.push(k);
      }
      kernels = keep;
      flecks = flecks.filter((f) => {
        f.age += dt; f.vy += GRAVITY * 0.7 * dt; f.x += f.vx * dt; f.y += f.vy * dt;
        if (f.age >= f.life) return false;
        g.globalAlpha = 1 - f.age / f.life; g.fillStyle = "#ffc93c";
        g.beginPath(); g.arc(f.x, f.y, f.size, 0, Math.PI * 2); g.fill();
        return true;
      });
      g.globalAlpha = 1;
      raf = kernels.length || flecks.length ? requestAnimationFrame(tick) : 0;
      if (!raf) g.clearRect(0, 0, W, H);
    };

    // Taps on any button / link / card / control burst from the tap point (logo handled by HeroStage).
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || t.closest("[data-pop-logo], [data-pop-ignore], input[type=range]")) return;
      const hit = t.closest<HTMLElement>("button, a, label, [data-pop]");
      if (!hit) return;
      const look = (t.closest<HTMLElement>("[data-pop-look]")?.dataset.popLook ?? "butter") as Look;
      handle({ kind: "point", x: e.clientX, y: e.clientY, look });
    };
    document.addEventListener("pointerdown", onDown, true);
    const off = onBurst(handle);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("resize", resize);
      off();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] h-full w-full" />;
}
