/**
 * Popcorn stage engine (v2) — a small 2D-canvas particle system for the hero.
 *
 * HARD RULE: the logo is never drawn, scaled, rotated, masked or overlaid by this engine's
 * layers at rest. The logo is a separate, untouched <Image>. This engine draws popcorn shapes
 * (pre-rendered sprites of drawn circles — never pieces of the logo) on two canvases:
 *
 *   back  canvas — BEHIND the logo: the entrance burst (kernels emerge from behind the logo)
 *                  and up to 8 slow, faint ambient kernels. Anything behind the logo is hidden
 *                  by it, so the logo is never covered.
 *   front canvas — IN FRONT: tap/click bursts only. They fly out from the tap point, fall and
 *                  fade within ~2s; the logo itself never moves.
 *
 * No WebGL, no libraries. Each frame is a handful of drawImage calls.
 */

type Layer = "back" | "front";

type Kernel = {
  layer: Layer;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  age: number; // seconds; negative = waiting to pop (staggered)
  life: number;
  sprite: number;
};

type Drifter = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  dx: number; // slow horizontal drift, px/s
  alpha: number;
  sprite: number;
};

type Rect = { x: number; y: number; w: number; h: number };

export type EngineCallbacks = {
  /** Called for a few kernels per burst as they pop, with a stagger delay in seconds (for sound). */
  onPop?: (delay: number) => void;
};

const GRAVITY = 1250; // px/s^2
const MAX_KERNELS = 80;
const MAX_DRIFTERS = 8;

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** Illustrated popcorn puff: overlapping buttery blobs + a hull fleck. Drawn, not sampled. */
function makePuffSprite(px: number, variant: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const u = px / 2;
  g.translate(u, u);
  const base: [number, number, number][] = [
    [0, 0.05, 0.4],
    [-0.36, -0.14, 0.3],
    [0.35, -0.18, 0.31],
    [0.02, -0.4, 0.29],
    [-0.27, 0.32, 0.27],
    [0.3, 0.3, 0.26],
  ];
  const seed = variant * 1.7;
  const blobs = base.map(([x, y, r], i) => {
    const j = Math.sin(seed + i * 2.3) * 0.06;
    return [x + j, y - j, r + Math.cos(seed + i) * 0.03] as [number, number, number];
  });
  g.fillStyle = "rgba(90, 55, 10, 0.35)";
  for (const [x, y, r] of blobs) {
    g.beginPath();
    g.arc(x * u, y * u + u * 0.03, r * u * 1.08, 0, Math.PI * 2);
    g.fill();
  }
  for (const [x, y, r] of blobs) {
    const grd = g.createRadialGradient((x - r * 0.35) * u, (y - r * 0.4) * u, r * u * 0.1, x * u, y * u, r * u);
    grd.addColorStop(0, "#fffdf4");
    grd.addColorStop(0.55, "#fff1c9");
    grd.addColorStop(1, variant % 3 === 2 ? "#f0b545" : "#f4cf78");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x * u, y * u, r * u, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "rgba(255, 201, 60, 0.55)";
  for (let i = 0; i < 3; i++) {
    const [x, y, r] = blobs[(i * 2 + variant) % blobs.length];
    g.beginPath();
    g.ellipse((x + r * 0.2) * u, (y + r * 0.25) * u, r * u * 0.32, r * u * 0.2, 0.6, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#a8581b";
  g.beginPath();
  g.ellipse(0.05 * u, 0.42 * u, 0.09 * u, 0.055 * u, 0.4, 0, Math.PI * 2);
  g.fill();
  return c;
}

export class PopcornEngine {
  private back: HTMLCanvasElement;
  private front: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private fctx: CanvasRenderingContext2D;
  private root: HTMLElement;
  private logoEl: HTMLElement;
  private cb: EngineCallbacks;
  private dpr = 1;
  private W = 0;
  private H = 0;
  private logo: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private clear: Rect[] = [];
  private sprites: HTMLCanvasElement[] = [];
  private kernels: Kernel[] = [];
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
    front: HTMLCanvasElement,
    root: HTMLElement,
    logoEl: HTMLElement,
    cb: EngineCallbacks = {},
  ) {
    this.back = back;
    this.front = front;
    this.bctx = back.getContext("2d")!;
    this.fctx = front.getContext("2d")!;
    this.root = root;
    this.logoEl = logoEl;
    this.cb = cb;
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

  get isReduced() {
    return this.reduced;
  }

  /** Burst of 6–10 kernels from a root-relative point, drawn in front, arcing out and falling. */
  burst(x: number, y: number) {
    if (this.reduced) return;
    const n = Math.floor(rand(6, 11));
    const s = this.unit();
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + rand(-1.25, 1.25);
      const speed = rand(380, 660);
      const delay = i < 2 ? 0 : rand(0, 0.12);
      this.addKernel({
        layer: "front",
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: rand(0, Math.PI * 2),
        vr: rand(-9, 9),
        size: s * rand(1.05, 1.5),
        age: -delay,
        life: rand(1.5, 2.2),
        sprite: Math.floor(rand(0, this.sprites.length)),
      });
      if (i < 4) this.cb.onPop?.(delay + i * 0.035);
    }
    this.syncLoop();
  }

  /** Burst from the upper middle of the logo (keyboard activation). */
  burstFromLogo() {
    const L = this.logo;
    this.burst(L.x + L.w / 2, L.y + L.h * 0.35);
  }

  // ---------------------------------------------------------------- layout

  private unit() {
    return Math.max(22, Math.min(36, this.logo.w * 0.11));
  }

  private onMotionPref = () => {
    this.reduced = this.mq.matches;
    if (this.reduced) this.kernels = [];
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
    for (const [c, g] of [
      [this.back, this.bctx],
      [this.front, this.fctx],
    ] as const) {
      c.width = Math.round(this.W * this.dpr);
      c.height = Math.round(this.H * this.dpr);
      g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    const r = this.logoEl.getBoundingClientRect();
    this.logo = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
    this.clear = [this.logo];
    this.root.querySelectorAll("[data-clear]").forEach((el) => {
      const q = el.getBoundingClientRect();
      this.clear.push({ x: q.left - box.left, y: q.top - box.top, w: q.width, h: q.height });
    });
    const px = Math.round(64 * this.dpr);
    this.sprites = [0, 1, 2, 3].map((v) => makePuffSprite(px, v));
    this.placeDrifters();
    if (!this.raf) this.draw();
  }

  /** Up to 8 faint kernels in the margins: never over the logo box or the headline/buttons column. */
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
          dx: 0,
          alpha: rand(0.28, 0.42),
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
      // fan the launch angles across the top so each kernel clears the logo's edge
      const angle = -Math.PI / 2 + ((i / (n - 1)) * 2 - 1) * 1.05 + rand(-0.12, 0.12);
      const speed = rand(520, 640) * Math.min(1.15, Math.max(0.8, L.w / 300));
      const delay = 0.45 + i * 0.14 + rand(0, 0.06);
      this.addKernel({
        layer: "back",
        x: L.x + L.w / 2 + rand(-L.w * 0.12, L.w * 0.12),
        y: L.y + L.h * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: rand(0, Math.PI * 2),
        vr: rand(-6, 6),
        size: s * rand(0.9, 1.2),
        age: -delay,
        life: rand(1.6, 2.1),
        sprite: i % 4,
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
      if (k.age < 0) {
        keep.push(k);
        continue;
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
    for (const d of this.drifters) {
      d.x += d.dx * dt;
      if (d.x < -d.size) d.x = this.W + d.size;
      if (d.x > this.W + d.size) d.x = -d.size;
    }
  }

  private draw() {
    const b = this.bctx;
    const f = this.fctx;
    b.clearRect(0, 0, this.W, this.H);
    f.clearRect(0, 0, this.W, this.H);
    if (this.reduced) return; // static hero: logo + text only

    for (const d of this.drifters) {
      const ph = this.time * d.speed + d.phase;
      const y = d.y + Math.sin(ph) * 6;
      const rot = Math.sin(ph * 0.7) * 0.25;
      b.globalAlpha = d.alpha;
      b.save();
      b.translate(d.x, y);
      b.rotate(rot);
      b.drawImage(this.sprites[d.sprite], -d.size / 2, -d.size / 2, d.size, d.size);
      b.restore();
    }

    for (const k of this.kernels) {
      if (k.age < 0) continue;
      const g = k.layer === "back" ? b : f;
      const pop = Math.min(1, k.age / 0.07); // quick swell as it pops
      const size = k.size * (0.35 + 0.65 * pop);
      const fade = Math.min(1, (k.life - k.age) / (k.life * 0.35));
      g.globalAlpha = Math.max(0, fade);
      g.save();
      g.translate(k.x, k.y);
      g.rotate(k.rot);
      g.drawImage(this.sprites[k.sprite], -size / 2, -size / 2, size, size);
      g.restore();
    }
    b.globalAlpha = 1;
    f.globalAlpha = 1;
  }
}
