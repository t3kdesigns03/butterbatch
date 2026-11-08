/**
 * Popcorn stage engine — a small 2D-canvas particle system for the hero.
 *
 * HARD RULE: the logo is never drawn, scaled, rotated, masked or redrawn here. The logo is a
 * separate, untouched <Image>. This engine draws popcorn shapes (see sprites.ts — drawn
 * gradients, never pieces of the logo) on two canvases:
 *
 *   back  canvas — BEHIND the logo: the entrance burst (kernels emerge from behind the logo)
 *                  and up to 8 slow, faint ambient kernels in the margins.
 *   Tap/click bursts are handled page-wide by components/pop/PopLayer.tsx.
 *
 * Each burst kernel shows as a seed for a beat, then pops with an overshoot and a few butter
 * flecks. No WebGL, no libraries.
 */

import { drawSeed, FLAVORS, makePuffSprite, popScale } from "./sprites";

type Layer = "back";

type Kernel = {
  layer: Layer;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  age: number; // seconds; negative = waiting
  seed: number; // seconds spent as an unpopped seed before popping
  life: number;
  sprite: number;
  popped: boolean;
};

type Fleck = { layer: Layer; x: number; y: number; vx: number; vy: number; age: number; life: number; size: number };

type Drifter = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  alpha: number;
  sprite: number;
};

type Rect = { x: number; y: number; w: number; h: number };

const GRAVITY = 1250; // px/s^2
const MAX_KERNELS = 80;
const MAX_DRIFTERS = 8;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export class PopcornEngine {
  private back: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private root: HTMLElement;
  private logoEl: HTMLElement;
  private dpr = 1;
  private W = 0;
  private H = 0;
  private logo: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private clear: Rect[] = [];
  private vivid: HTMLCanvasElement[] = [];
  private soft: HTMLCanvasElement[] = [];
  private kernels: Kernel[] = [];
  private flecks: Fleck[] = [];
  private drifters: Drifter[] = [];
  private raf = 0;
  private last = 0;
  private time = 0;
  private visible = true;
  private pageVisible = true;
  private reduced = false;
  private destroyed = false;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private mq: MediaQueryList;

  constructor(
    back: HTMLCanvasElement,
    root: HTMLElement,
    logoEl: HTMLElement,
  ) {
    this.back = back;
    this.bctx = back.getContext("2d")!;
    this.root = root;
    this.logoEl = logoEl;
    this.mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.mq.matches;
    this.mq.addEventListener("change", this.onMotionPref);

    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(root);
    this.ro.observe(logoEl);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.syncLoop();
    });
    this.io.observe(root);
    document.addEventListener("visibilitychange", this.onPageVisibility);

    this.layout();
    if (!this.reduced) this.entranceBurst();
    this.syncLoop();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
    this.io.disconnect();
    this.mq.removeEventListener("change", this.onMotionPref);
    document.removeEventListener("visibilitychange", this.onPageVisibility);
  }

  // ---------------------------------------------------------------- layout

  private unit() {
    return Math.max(22, Math.min(36, this.logo.w * 0.11));
  }

  private onMotionPref = () => {
    this.reduced = this.mq.matches;
    if (this.reduced) {
      this.kernels = [];
      this.flecks = [];
    }
    this.syncLoop();
    this.draw();
  };

  private onPageVisibility = () => {
    this.pageVisible = document.visibilityState === "visible";
    this.syncLoop();
  };

  private layout() {
    if (this.destroyed) return;
    const box = this.root.getBoundingClientRect();
    this.W = Math.max(1, box.width);
    this.H = Math.max(1, box.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.back.width = Math.round(this.W * this.dpr);
    this.back.height = Math.round(this.H * this.dpr);
    this.bctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const r = this.logoEl.getBoundingClientRect();
    this.logo = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
    this.clear = [this.logo];
    this.root.querySelectorAll("[data-clear]").forEach((el) => {
      const q = el.getBoundingClientRect();
      this.clear.push({ x: q.left - box.left, y: q.top - box.top, w: q.width, h: q.height });
    });
    const px = Math.round(72 * this.dpr);
    this.vivid = FLAVORS.flatMap((f) => [0, 1].map((v) => makePuffSprite(px, f, v, true)));
    this.soft = [0, 1, 2, 3].map((v) => makePuffSprite(Math.round(48 * this.dpr), "butter", v, false));
    this.placeDrifters();
    if (!this.raf) this.draw();
  }

  /** Up to 8 small kernels in the margins: never over the logo box or the headline/buttons column. */
  private placeDrifters() {
    const count = this.W < 640 ? 5 : MAX_DRIFTERS;
    const pad = 14;
    this.drifters = [];
    for (let i = 0; i < count; i++) {
      for (let t = 0; t < 60; t++) {
        const size = rand(16, 24);
        const x = rand(size, this.W - size);
        const y = rand(size, this.H - size);
        const m = pad + size;
        const blocked = this.clear.some((k) => x > k.x - m && x < k.x + k.w + m && y > k.y - m && y < k.y + k.h + m);
        if (blocked) continue;
        this.drifters.push({
          x,
          y,
          size,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.35, 0.6),
          alpha: rand(0.85, 1),
          sprite: i % 4,
        });
        break;
      }
    }
  }

  // ------------------------------------------------------------- particles

  private addKernel(k: Kernel) {
    if (this.kernels.length >= MAX_KERNELS) this.kernels.splice(0, this.kernels.length - MAX_KERNELS + 1);
    this.kernels.push(k);
  }

  /** One gentle entrance: 5–6 kernels pop out from behind the logo, then it settles. */
  private entranceBurst() {
    const L = this.logo;
    const s = this.unit();
    const n = Math.random() < 0.5 ? 5 : 6;
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + ((i / (n - 1)) * 2 - 1) * 1.05 + rand(-0.12, 0.12);
      const speed = rand(520, 640) * Math.min(1.15, Math.max(0.8, L.w / 300));
      this.addKernel({
        layer: "back",
        x: L.x + L.w / 2 + rand(-L.w * 0.12, L.w * 0.12),
        y: L.y + L.h * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: rand(0, Math.PI * 2),
        vr: rand(-6, 6),
        size: s * rand(0.9, 1.2),
        age: -(0.45 + i * 0.14 + rand(0, 0.06)),
        seed: 0.05,
        life: rand(1.6, 2.1),
        sprite: Math.floor(rand(0, this.vivid.length)),
        popped: false,
      });
    }
  }

  // ----------------------------------------------------------------- loop

  private shouldRun() {
    return !this.reduced && this.visible && this.pageVisible && !this.destroyed;
  }

  private syncLoop() {
    if (this.shouldRun()) {
      if (!this.raf) {
        this.last = performance.now();
        this.raf = requestAnimationFrame(this.tick);
      }
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.draw();
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.step(dt);
    this.draw();
    this.raf = this.shouldRun() ? requestAnimationFrame(this.tick) : 0;
  };

  private step(dt: number) {
    const keep: Kernel[] = [];
    for (const k of this.kernels) {
      k.age += dt;
      if (k.age < k.seed) {
        keep.push(k);
        continue;
      }
      if (!k.popped) {
        k.popped = true;
        for (let i = 0; i < 3; i++) {
          const a = rand(0, Math.PI * 2);
          const v = rand(120, 240);
          this.flecks.push({
            layer: k.layer,
            x: k.x,
            y: k.y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v - 60,
            age: 0,
            life: rand(0.3, 0.5),
            size: rand(2, 3.5),
          });
        }
      }
      if (k.age >= k.life) continue;
      k.vy += GRAVITY * dt;
      k.vx *= 1 - 0.5 * dt;
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.rot += k.vr * dt;
      if (k.y > this.H + 60 || k.x < -60 || k.x > this.W + 60) continue;
      keep.push(k);
    }
    this.kernels = keep;
    this.flecks = this.flecks.filter((f) => {
      f.age += dt;
      f.vy += GRAVITY * 0.7 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      return f.age < f.life;
    });
  }

  private draw() {
    const b = this.bctx;
    b.clearRect(0, 0, this.W, this.H);
    if (this.reduced) return; // static hero: logo + text only

    for (const d of this.drifters) {
      const ph = this.time * d.speed + d.phase;
      const y = d.y + Math.sin(ph) * 6;
      const rot = Math.sin(ph * 0.7) * 0.25;
      b.globalAlpha = d.alpha;
      b.save();
      b.translate(d.x, y);
      b.rotate(rot);
      b.drawImage(this.soft[d.sprite], -d.size / 2, -d.size / 2, d.size, d.size);
      b.restore();
    }

    for (const k of this.kernels) {
      if (k.age < 0) continue;
      const g = b;
      g.globalAlpha = 1;
      if (k.age < k.seed) {
        const jiggle = Math.sin(k.age * 140) * 1.5;
        drawSeed(g, k.x + jiggle, k.y, k.size * 0.32, k.rot);
        continue;
      }
      const size = k.size * popScale(k.age - k.seed);
      g.globalAlpha = Math.max(0, Math.min(1, (k.life - k.age) / (k.life * 0.35)));
      g.save();
      g.translate(k.x, k.y);
      g.rotate(k.rot);
      g.drawImage(this.vivid[k.sprite], -size / 2, -size / 2, size, size);
      g.restore();
    }

    for (const fl of this.flecks) {
      const g = b;
      g.globalAlpha = 1 - fl.age / fl.life;
      g.fillStyle = "#ffc93c";
      g.beginPath();
      g.arc(fl.x, fl.y, fl.size, 0, Math.PI * 2);
      g.fill();
    }
    b.globalAlpha = 1;
  }
}
