/**
 * Popcorn stage engine — a tiny 2D-canvas particle system for the hero.
 *
 * HARD RULE: the logo is never drawn, warped, scaled or overlaid here. The logo is a separate,
 * untouched <Image> layer. Every particle/sparkle this engine draws is faded to zero BEFORE it can
 * reach the logo's rectangle ("keep-out" zones), so nothing ever covers or alters the logo.
 *
 * No WebGL, no libraries. Sprites are pre-rendered once to offscreen canvases; each frame is just
 * a few dozen drawImage calls.
 */

type Rect = { x: number; y: number; w: number; h: number };

type Bobber = {
  ax: number;
  ay: number;
  size: number;
  phase: number;
  speed: number;
  amp: number;
  rotAmp: number;
  sprite: number;
};

type Sparkle = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
  sprite: number;
};

type Particle = {
  kind: "kernel" | "puff" | "fleck" | "ring";
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  age: number;
  life: number;
  sprite: number;
  /** kernel only: launch angle/speed once it pops */
  launchAngle: number;
  launchSpeed: number;
  color: string;
};

const GRAVITY = 1100; // px/s^2
const MAX_PARTICLES = 140;
const FEATHER = 14; // px fade distance outside a keep-out zone

const SPARKLE_COLORS = ["#ffe38a", "#ffffff", "#9fdcff", "#ffc93c"];

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeCanvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

/** Illustrated popcorn puff: overlapping buttery blobs + a hull fleck. */
function makePuffSprite(px: number, variant: number): HTMLCanvasElement {
  const c = makeCanvas(px);
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
  // soft outline/shadow pass so puffs read on royal blue
  g.fillStyle = "rgba(120, 70, 10, 0.35)";
  for (const [x, y, r] of blobs) {
    g.beginPath();
    g.arc(x * u, y * u + u * 0.03, r * u * 1.08, 0, Math.PI * 2);
    g.fill();
  }
  for (const [x, y, r] of blobs) {
    const grd = g.createRadialGradient(
      (x - r * 0.35) * u,
      (y - r * 0.4) * u,
      r * u * 0.1,
      x * u,
      y * u,
      r * u,
    );
    grd.addColorStop(0, "#fffdf4");
    grd.addColorStop(0.55, "#fff1c9");
    grd.addColorStop(1, variant % 3 === 2 ? "#f0b545" : "#f4cf78");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x * u, y * u, r * u, 0, Math.PI * 2);
    g.fill();
  }
  // butter spots
  g.fillStyle = "rgba(255, 201, 60, 0.55)";
  for (let i = 0; i < 3; i++) {
    const [x, y, r] = blobs[(i * 2 + variant) % blobs.length];
    g.beginPath();
    g.ellipse((x + r * 0.2) * u, (y + r * 0.25) * u, r * u * 0.32, r * u * 0.2, 0.6, 0, Math.PI * 2);
    g.fill();
  }
  // hull fleck
  g.fillStyle = "#a8581b";
  g.beginPath();
  g.ellipse(0.05 * u, 0.42 * u, 0.09 * u, 0.055 * u, 0.4, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** Four-point twinkle star with a soft glow. */
function makeSparkleSprite(px: number, color: string): HTMLCanvasElement {
  const c = makeCanvas(px);
  const g = c.getContext("2d")!;
  const u = px / 2;
  g.translate(u, u);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, u);
  glow.addColorStop(0, color + "aa");
  glow.addColorStop(0.35, color + "33");
  glow.addColorStop(1, color + "00");
  g.fillStyle = glow;
  g.fillRect(-u, -u, px, px);
  g.fillStyle = color;
  const r = u * 0.95;
  const k = u * 0.16;
  g.beginPath();
  g.moveTo(0, -r);
  g.quadraticCurveTo(k, -k, r, 0);
  g.quadraticCurveTo(k, k, 0, r);
  g.quadraticCurveTo(-k, k, -r, 0);
  g.quadraticCurveTo(-k, -k, 0, -r);
  g.fill();
  return c;
}

export class PopcornEngine {
  private canvas: HTMLCanvasElement;
  private root: HTMLElement;
  private logoEl: HTMLElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private W = 0;
  private H = 0;
  private logo: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private keepouts: Rect[] = [];
  private puffs: HTMLCanvasElement[] = [];
  private stars: HTMLCanvasElement[] = [];
  private bobbers: Bobber[] = [];
  private sparkles: Sparkle[] = [];
  private particles: Particle[] = [];
  private raf = 0;
  private last = 0;
  private time = 0;
  private visible = true;
  private pageVisible = true;
  private reduced = false;
  private nextAmbient = 0;
  private destroyed = false;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private mq: MediaQueryList;

  constructor(canvas: HTMLCanvasElement, root: HTMLElement, logoEl: HTMLElement) {
    this.canvas = canvas;
    this.root = root;
    this.logoEl = logoEl;
    this.ctx = canvas.getContext("2d")!;
    this.mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reduced = this.mq.matches;
    this.mq.addEventListener("change", this.onMotionPref);

    this.ro = new ResizeObserver(() => this.layout());
    this.ro.observe(root);
    this.ro.observe(logoEl);
    this.io = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry.isIntersecting;
        this.syncLoop();
      },
      { threshold: 0 },
    );
    this.io.observe(root);
    document.addEventListener("visibilitychange", this.onPageVisibility);

    this.layout();
    if (!this.reduced) this.loadBurst();
    this.syncLoop();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    this.mq.removeEventListener("change", this.onMotionPref);
    document.removeEventListener("visibilitychange", this.onPageVisibility);
  }

  /** Pointer tap at root-relative coords. */
  tap(x: number, y: number) {
    if (this.reduced) return;
    const L = this.logo;
    const pad = 6;
    const onLogo = x > L.x - pad && x < L.x + L.w + pad && y > L.y - pad && y < L.y + L.h + pad;
    if (onLogo) {
      // Pop from the logo's surroundings, never over it: above, both sides, and spilling out below.
      const s = this.unit();
      const clampX = (v: number) => Math.min(Math.max(v, L.x + s), L.x + L.w - s);
      for (let i = 0; i < 3; i++) {
        this.spawnKernel(clampX(x + rand(-60, 60)), L.y - s * 0.7, -Math.PI / 2 + rand(-0.6, 0.6), i * 60);
      }
      const sideY = Math.min(Math.max(y, L.y + s), L.y + L.h - s);
      this.spawnKernel(L.x - s * 0.6, sideY, Math.PI + rand(0.25, 0.7), 40);
      this.spawnKernel(L.x - s * 0.6, sideY + s, Math.PI + rand(0.1, 0.5), 160);
      this.spawnKernel(L.x + L.w + s * 0.6, sideY, rand(-0.7, -0.25), 90);
      this.spawnKernel(L.x + L.w + s * 0.6, sideY + s, rand(-0.5, -0.1), 210);
      for (let i = 0; i < 3; i++) {
        this.spawnKernel(clampX(x + rand(-80, 80)), L.y + L.h + s * 0.7, Math.PI / 2 + rand(-1, 1), 30 + i * 70, 0.45);
      }
    } else {
      const n = 6;
      for (let i = 0; i < n; i++) {
        this.spawnKernel(x + rand(-10, 10), y + rand(-8, 8), -Math.PI / 2 + rand(-1.1, 1.1), i * 45);
      }
    }
    this.syncLoop();
  }

  // ---------------------------------------------------------------- layout

  private unit() {
    return Math.max(26, Math.min(42, this.logo.w * 0.08));
  }

  private onMotionPref = () => {
    this.reduced = this.mq.matches;
    if (this.reduced) this.particles = [];
    this.syncLoop();
    this.drawFrame();
  };

  private onPageVisibility = () => {
    this.pageVisible = document.visibilityState === "visible";
    this.syncLoop();
  };

  private relRect(el: Element, rootBox: DOMRect): Rect {
    const r = el.getBoundingClientRect();
    return { x: r.left - rootBox.left, y: r.top - rootBox.top, w: r.width, h: r.height };
  }

  private layout() {
    if (this.destroyed) return;
    const box = this.root.getBoundingClientRect();
    this.W = Math.max(1, box.width);
    this.H = Math.max(1, box.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.logo = this.relRect(this.logoEl, box);
    this.keepouts = [this.logo];
    this.root.querySelectorAll("[data-keepout]").forEach((el) => {
      this.keepouts.push(this.relRect(el, box));
    });

    const spritePx = Math.round(64 * this.dpr);
    this.puffs = [0, 1, 2, 3].map((v) => makePuffSprite(spritePx, v));
    this.stars = SPARKLE_COLORS.map((c) => makeSparkleSprite(Math.round(32 * this.dpr), c));

    this.placeBobbers();
    this.placeSparkles();
    if (!this.raf) this.drawFrame();
  }

  private intersectsKeepout(x: number, y: number, half: number) {
    return this.keepouts.some(
      (k) => x + half > k.x && x - half < k.x + k.w && y + half > k.y && y - half < k.y + k.h,
    );
  }

  private placeBobbers() {
    const L = this.logo;
    const narrow = this.W < 640;
    // Anchor points in logo-relative units (0..1 = across the logo box). All sit outside the box.
    const anchors: [number, number][] = narrow
      ? [
          [-0.07, 0.18],
          [-0.07, 0.66],
          [1.07, 0.34],
          [1.07, 0.82],
          [0.14, -0.13],
          [0.86, -0.11],
        ]
      : [
          [-0.16, 0.12],
          [-0.3, 0.46],
          [-0.14, 0.86],
          [1.16, 0.16],
          [1.3, 0.52],
          [1.15, 0.88],
          [-0.44, 0.2],
          [1.45, 0.72],
          [0.06, -0.1],
          [0.94, -0.09],
        ];
    const s = this.unit();
    // Plus a few in the hero's bottom band, below the call-to-action block (root-relative).
    const bottom: [number, number][] = narrow
      ? [[0.1, 1], [0.5, 1], [0.9, 1]]
      : [[0.08, 1], [0.3, 1], [0.7, 1], [0.92, 1]];
    const points: [number, number][] = [
      ...anchors.map(([nx, ny]) => [L.x + nx * L.w, L.y + ny * L.h] as [number, number]),
      ...bottom.map(([fx]) => [fx * this.W, this.H - s * 1.4] as [number, number]),
    ];
    this.bobbers = [];
    points.forEach(([px0, y], i) => {
      const nx = (px0 - L.x) / L.w;
      const size = s * rand(0.85, 1.25);
      const amp = size * 0.22;
      const half = size * 0.55 + amp;
      let x = px0;
      // keep on screen
      x = Math.min(Math.max(x, half), this.W - half);
      // never overlap the logo: nudge outward horizontally, drop if it can't fit
      if (this.intersectsKeepout(x, y, half)) {
        x = nx < 0.5 ? L.x - half - 1 : L.x + L.w + half + 1;
        if (x < half * 0.9 || x > this.W - half * 0.9 || this.intersectsKeepout(x, y, half)) return;
      }
      if (y - half < 0 || y + half > this.H) return;
      this.bobbers.push({
        ax: x,
        ay: y,
        size,
        phase: rand(0, Math.PI * 2),
        speed: rand(0.9, 1.4),
        amp,
        rotAmp: rand(0.08, 0.18),
        sprite: i % 4,
      });
    });
  }

  private placeSparkles() {
    const count = Math.round(Math.min(36, Math.max(14, (this.W * this.H) / 16000)));
    this.sparkles = [];
    for (let i = 0; i < count; i++) {
      for (let tries = 0; tries < 30; tries++) {
        const size = rand(8, 18);
        const x = rand(size, this.W - size);
        const y = rand(size, this.H - size);
        if (this.intersectsKeepout(x, y, size * 0.6 + FEATHER)) continue;
        this.sparkles.push({
          x,
          y,
          size,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.8, 2),
          sprite: i % this.stars.length,
        });
        break;
      }
    }
  }

  // ------------------------------------------------------------- particles

  private spawnKernel(x: number, y: number, angle: number, delayMs: number, speedScale = 1) {
    if (this.particles.length >= MAX_PARTICLES) this.particles.splice(0, 8);
    const s = this.unit();
    this.particles.push({
      kind: "kernel",
      x,
      y,
      vx: 0,
      vy: 0,
      rot: rand(0, Math.PI),
      vr: 0,
      size: s * 0.38,
      age: -delayMs / 1000,
      life: rand(0.09, 0.17),
      sprite: 0,
      launchAngle: angle,
      launchSpeed: rand(320, 560) * speedScale * Math.min(1.2, Math.max(0.75, this.H / 800)),
      color: "#e3a72f",
    });
  }

  private pop(k: Particle, out: Particle[]) {
    const s = this.unit();
    const sp = k.launchSpeed;
    out.push({
      kind: "puff",
      x: k.x,
      y: k.y,
      vx: Math.cos(k.launchAngle) * sp,
      vy: Math.sin(k.launchAngle) * sp,
      rot: rand(0, Math.PI * 2),
      vr: rand(-6, 6),
      size: s * rand(0.85, 1.2),
      age: 0,
      life: rand(1.3, 2),
      sprite: Math.floor(rand(0, 4)),
      launchAngle: 0,
      launchSpeed: 0,
      color: "",
    });
    out.push({
      kind: "ring",
      x: k.x,
      y: k.y,
      vx: 0,
      vy: 0,
      rot: 0,
      vr: 0,
      size: s * 0.3,
      age: 0,
      life: 0.28,
      sprite: 0,
      launchAngle: 0,
      launchSpeed: 0,
      color: "#ffe38a",
    });
    for (let i = 0; i < 4; i++) {
      const a = rand(0, Math.PI * 2);
      const v = rand(120, 260);
      out.push({
        kind: "fleck",
        x: k.x,
        y: k.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 80,
        rot: 0,
        vr: 0,
        size: rand(2, 3.5),
        age: 0,
        life: rand(0.35, 0.6),
        sprite: 0,
        launchAngle: 0,
        launchSpeed: 0,
        color: i % 2 ? "#a8581b" : "#ffc93c",
      });
    }
  }

  private perimeterPoint(): { x: number; y: number; a: number; speed: number } {
    const L = this.logo;
    const s = this.unit();
    const r = Math.random();
    if (r < 0.3)
      return { x: rand(L.x + s, L.x + L.w - s), y: L.y - s * 0.7, a: -Math.PI / 2 + rand(-0.5, 0.5), speed: 1 };
    if (r < 0.5)
      return { x: L.x - s * 0.6, y: rand(L.y + L.h * 0.2, L.y + L.h * 0.8), a: Math.PI + rand(0.2, 0.7), speed: 1 };
    if (r < 0.7)
      return { x: L.x + L.w + s * 0.6, y: rand(L.y + L.h * 0.2, L.y + L.h * 0.8), a: rand(-0.7, -0.2), speed: 1 };
    return { x: rand(L.x + s, L.x + L.w - s), y: L.y + L.h + s * 0.7, a: Math.PI / 2 + rand(-1, 1), speed: 0.45 };
  }

  private loadBurst() {
    for (let i = 0; i < 12; i++) {
      const p = this.perimeterPoint();
      this.spawnKernel(p.x, p.y, p.a, 250 + i * 120 + rand(0, 80), p.speed);
    }
    this.nextAmbient = 6;
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
      this.drawFrame();
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.step(dt);
    this.drawFrame();
    this.raf = this.shouldRun() ? requestAnimationFrame(this.tick) : 0;
  };

  private step(dt: number) {
    // rare ambient pop keeps the stage alive without being busy
    this.nextAmbient -= dt;
    if (this.nextAmbient <= 0) {
      const p = this.perimeterPoint();
      this.spawnKernel(p.x, p.y, p.a, 0, p.speed);
      this.nextAmbient = rand(5, 9);
    }

    const next: Particle[] = [];
    const born: Particle[] = [];
    for (const p of this.particles) {
      p.age += dt;
      if (p.age < 0) {
        next.push(p);
        continue;
      }
      if (p.kind === "kernel") {
        if (p.age >= p.life) {
          this.pop(p, born);
          continue;
        }
        next.push(p);
        continue;
      }
      if (p.age >= p.life) continue;
      if (p.kind !== "ring") {
        p.vy += GRAVITY * dt * (p.kind === "fleck" ? 0.8 : 1);
        p.vx *= 1 - 0.6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }
      if (p.y > this.H + 60 || p.x < -60 || p.x > this.W + 60) continue;
      next.push(p);
    }
    this.particles = born.length ? next.concat(born) : next;
  }

  /** 0 inside/touching any keep-out zone, ramps to 1 over FEATHER px outside it. */
  private keepoutAlpha(x: number, y: number, half: number) {
    let m = 1;
    for (const k of this.keepouts) {
      const dx = Math.max(k.x - x, 0, x - (k.x + k.w));
      const dy = Math.max(k.y - y, 0, y - (k.y + k.h));
      const d = Math.hypot(dx, dy) - half;
      if (d <= 0) return 0;
      m = Math.min(m, Math.min(1, d / FEATHER));
    }
    return m;
  }

  private drawFrame() {
    const g = this.ctx;
    g.clearRect(0, 0, this.W, this.H);
    const t = this.reduced ? 1.3 : this.time;

    // sparkles
    for (const s of this.sparkles) {
      const tw = Math.max(0, Math.sin(t * s.speed * 2 + s.phase));
      const a = this.reduced ? 0.6 : 0.12 + 0.88 * tw * tw * tw;
      const size = s.size * (0.55 + 0.45 * (this.reduced ? 1 : tw));
      const m = this.keepoutAlpha(s.x, s.y, size * 0.6);
      if (m <= 0 || a <= 0.01) continue;
      g.globalAlpha = a * m;
      g.drawImage(this.stars[s.sprite], s.x - size, s.y - size, size * 2, size * 2);
    }

    // bobbing popcorn
    for (const b of this.bobbers) {
      const ph = t * b.speed + b.phase;
      const x = b.ax + (this.reduced ? 0 : Math.cos(ph * 0.7) * b.amp * 0.45);
      const y = b.ay + (this.reduced ? 0 : Math.sin(ph) * b.amp);
      const rot = this.reduced ? 0 : Math.sin(ph * 0.8) * b.rotAmp;
      const m = this.keepoutAlpha(x, y, b.size * 0.55);
      if (m <= 0) continue;
      g.globalAlpha = m;
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.drawImage(this.puffs[b.sprite], -b.size / 2, -b.size / 2, b.size, b.size);
      g.restore();
    }

    // pops
    for (const p of this.particles) {
      if (p.age < 0) continue;
      const fade = p.kind === "puff" ? Math.min(1, (p.life - p.age) / (p.life * 0.3)) : 1 - p.age / p.life;
      if (p.kind === "kernel") {
        const m = this.keepoutAlpha(p.x, p.y, p.size);
        if (m <= 0) continue;
        const shake = Math.sin(p.age * 120) * 1.2;
        g.globalAlpha = m;
        g.save();
        g.translate(p.x + shake, p.y);
        g.rotate(p.rot);
        g.fillStyle = p.color;
        g.beginPath();
        g.ellipse(0, 0, p.size * 0.5, p.size * 0.36, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#a8581b";
        g.beginPath();
        g.ellipse(p.size * 0.32, 0, p.size * 0.16, p.size * 0.14, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
        continue;
      }
      if (p.kind === "ring") {
        const r = p.size + (p.age / p.life) * p.size * 3;
        const m = this.keepoutAlpha(p.x, p.y, r + 2);
        if (m <= 0) continue;
        g.globalAlpha = Math.max(0, fade) * 0.9 * m;
        g.strokeStyle = p.color;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(p.x, p.y, r, 0, Math.PI * 2);
        g.stroke();
        continue;
      }
      if (p.kind === "fleck") {
        const m = this.keepoutAlpha(p.x, p.y, p.size);
        if (m <= 0) continue;
        g.globalAlpha = Math.max(0, fade) * m;
        g.fillStyle = p.color;
        g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        continue;
      }
      // puff: swell in quickly, then fly
      const grow = Math.min(1, p.age / 0.08);
      const size = p.size * (0.4 + 0.6 * grow);
      const m = this.keepoutAlpha(p.x, p.y, size * 0.55);
      if (m <= 0) continue;
      g.globalAlpha = Math.max(0, fade) * m;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.drawImage(this.puffs[p.sprite], -size / 2, -size / 2, size, size);
      g.restore();
    }
    g.globalAlpha = 1;
  }
}
