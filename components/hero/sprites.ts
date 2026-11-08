/**
 * Popcorn sprites — drawn shapes (circles, gradients, highlights), never pieces of the logo.
 * Four "flavor" looks taken from the real menu so the popcorn reads as food you want to eat:
 * butter (cream + glossy butter), kettle (golden, sugar glints), caramel (glossy amber) and
 * cheddar (orange with powder speckle). Pre-rendered once per size; drawing is just drawImage.
 */

export type Flavor = "butter" | "kettle" | "caramel" | "cheddar" | "apple";
/** The four looks the hero intro/bursts cycle through. "apple" is used by the Customize bucket. */
export const FLAVORS: Flavor[] = ["butter", "kettle", "caramel", "cheddar"];

const PALETTE: Record<Flavor, { hi: string; mid: string; shade: string; crease: string; shadow: string }> = {
  butter: { hi: "#fffef9", mid: "#fff1c8", shade: "#e9b85a", crease: "rgba(170,110,30,0.45)", shadow: "rgba(90,55,10,0.42)" },
  kettle: { hi: "#fffbea", mid: "#fbe3a0", shade: "#d9a03c", crease: "rgba(150,95,20,0.45)", shadow: "rgba(90,55,10,0.42)" },
  caramel: { hi: "#ffd98a", mid: "#d9862a", shade: "#9a4f12", crease: "rgba(90,40,5,0.55)", shadow: "rgba(60,25,0,0.5)" },
  cheddar: { hi: "#ffd68a", mid: "#ffa526", shade: "#d46a0c", crease: "rgba(150,60,0,0.5)", shadow: "rgba(100,40,0,0.45)" },
  apple: { hi: "#f4ffd2", mid: "#b5dc55", shade: "#6c9a1f", crease: "rgba(60,90,10,0.45)", shadow: "rgba(40,60,5,0.45)" },
};

type Lobe = { x: number; y: number; r: number; sq: number; rot: number };

/** Small seeded PRNG so each (flavor, variant) sprite is stable. */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A popped kernel: one merged, ruffled body of uneven lobes with folds, lit from the upper left.
 * @param vivid true = full-strength glossy "crave" look (intro + bursts); false = soft (ambient).
 */
export function makePuffSprite(
  px: number,
  flavor: Flavor,
  variant: number,
  vivid = true,
  /** Butter glaze over any flavor: 0 = none (default), 1 = regular, 2 = extra. */
  butter = 0,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = px;
  const g = c.getContext("2d")!;
  const u = px / 2;
  g.translate(u, u);
  const P = PALETTE[flavor];
  const rnd = prng(variant * 9301 + flavor.length * 49297);

  const n = 7 + Math.floor(rnd() * 3);
  const lobes: Lobe[] = [{ x: (rnd() - 0.5) * 0.1, y: (rnd() - 0.5) * 0.1, r: 0.3, sq: 0.85, rot: rnd() * 3 }];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.6;
    const d = 0.2 + rnd() * 0.16;
    lobes.push({ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.9, r: 0.17 + rnd() * 0.15, sq: 0.7 + rnd() * 0.3, rot: a + rnd() });
  }
  const path = (L: Lobe, k = 1, dy = 0) => {
    g.beginPath();
    g.ellipse(L.x * u, (L.y + dy) * u, L.r * u * k, L.r * u * k * L.sq, L.rot, 0, Math.PI * 2);
  };

  // contact shadow so pieces read on royal blue and cream
  g.fillStyle = vivid ? P.shadow : "rgba(90,55,10,0.25)";
  for (const L of lobes) {
    path(L, 1.08, 0.05);
    g.fill();
  }
  // merged body in the shade colour, then soft per-lobe light (no hard rings = no "beads")
  g.fillStyle = P.shade;
  for (const L of lobes) {
    path(L, 1);
    g.fill();
  }
  for (const L of lobes) {
    const hx = (L.x - L.r * 0.35) * u;
    const hy = (L.y - L.r * 0.4) * u;
    const gr = g.createRadialGradient(hx, hy, 0, L.x * u, L.y * u, L.r * u * 1.05);
    gr.addColorStop(0, P.hi);
    gr.addColorStop(0.55, P.mid);
    gr.addColorStop(1, P.mid + "00");
    g.fillStyle = gr;
    path(L, 0.97);
    g.fill();
  }
  // folds between the petals
  g.strokeStyle = P.crease;
  g.lineWidth = u * 0.025;
  g.lineCap = "round";
  for (const L of lobes.slice(1)) {
    g.beginPath();
    g.ellipse(L.x * u, L.y * u, L.r * u * 0.92, L.r * u * 0.92 * L.sq, L.rot, 0.3, 1.5);
    g.stroke();
  }
  // flavor coating
  if (flavor === "butter") {
    g.fillStyle = vivid ? "rgba(255,190,30,0.55)" : "rgba(255,200,60,0.35)";
    for (let i = 0; i < 4; i++) {
      const L = lobes[1 + ((i * 3 + variant) % n)];
      g.beginPath();
      g.ellipse((L.x + 0.03) * u, (L.y + 0.05) * u, L.r * u * 0.55, L.r * u * 0.32, L.rot, 0, Math.PI * 2);
      g.fill();
    }
  } else if (flavor === "cheddar") {
    g.fillStyle = "rgba(190,70,0,0.5)";
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      g.arc((rnd() - 0.5) * u * 1.1, (rnd() - 0.5) * u, u * (0.015 + rnd() * 0.02), 0, Math.PI * 2);
      g.fill();
    }
  } else if (flavor === "kettle") {
    g.fillStyle = "rgba(255,255,255,0.95)";
    for (let i = 0; i < 10; i++) g.fillRect((rnd() - 0.5) * u, (rnd() - 0.5) * u * 0.9, u * 0.035, u * 0.035);
  }
  // butter glaze (Customize "butter amount"): a golden sheen over the whole kernel
  if (butter > 0) {
    g.fillStyle = `rgba(255, 200, 40, ${butter >= 2 ? 0.42 : 0.2})`;
    for (const L of lobes) {
      path(L, 0.9);
      g.fill();
    }
  }
  // glossy streaks — the "glisten" (strongest on caramel)
  if (vivid) {
    const gl = flavor === "caramel" ? 0.9 : flavor === "cheddar" ? 0.35 : 0.75;
    g.fillStyle = `rgba(255,255,255,${gl})`;
    for (const L of lobes.slice(0, 5)) {
      g.beginPath();
      g.ellipse((L.x - L.r * 0.4) * u, (L.y - L.r * 0.45) * u, L.r * u * 0.28, L.r * u * 0.12, -0.6, 0, Math.PI * 2);
      g.fill();
    }
  }
  // hull fleck
  g.fillStyle = flavor === "caramel" ? "#5a2a08" : "#9c4f16";
  g.beginPath();
  g.ellipse(0.04 * u, 0.3 * u, 0.08 * u, 0.05 * u, 0.4, 0, Math.PI * 2);
  g.fill();
  return c;
}

/** Unpopped kernel: a small golden seed with a dark tip, shown for a beat before it pops. */
export function drawSeed(g: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = "#e9a53a";
  g.beginPath();
  g.ellipse(0, 0, size * 0.5, size * 0.36, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#8a4513";
  g.beginPath();
  g.ellipse(size * 0.32, 0, size * 0.17, size * 0.15, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.beginPath();
  g.ellipse(-size * 0.15, -size * 0.12, size * 0.14, size * 0.07, -0.4, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Pop scale curve: seed → overshoot → settle. t is seconds since the pop. */
export function popScale(t: number) {
  if (t < 0.06) return 0.3 + (t / 0.06) * 0.95; // 0.3 → 1.25
  if (t < 0.18) return 1.25 - ((t - 0.06) / 0.12) * 0.25; // 1.25 → 1.0
  return 1;
}
