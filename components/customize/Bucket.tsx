"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Look, SizeId } from "@/data/menu";
import { makePuffSprite, popScale, type Flavor as SpriteLook } from "../hero/sprites";

/**
 * Live "Build My Popcorn" bucket. Back to front:
 *   1. canvas — a mound of drawn popcorn (sprites.ts) tinted to the chosen flavor(s); bigger for
 *      Large; butter glaze from the butter slider. On every change the kernels pop UP into place.
 *   2. SVG bucket body (blue/white stripes — no red outside the logo).
 *   3. the REAL logo file as a label on the bucket front. Placed as-is: never redrawn or tinted.
 */
type Props = { looks: Look[]; size: SizeId; butter: number };

type K = { x: number; y: number; size: number; rot: number; delay: number; sprite: number };

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function Bucket({ looks, size, butter }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const key = `${looks.join("+")}|${size}|${butter}`;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const lookList: SpriteLook[] = (looks.length ? looks : ["butter"]) as SpriteLook[];
    const spritePx = Math.round(56 * dpr);
    const sprites = lookList.flatMap((l) => [0, 1, 2].map((v) => makePuffSprite(spritePx, l, v, true, butter)));

    let W = 0;
    let H = 0;
    let kernels: K[] = [];

    const build = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The rim (SVG y=44/112) sits at ~39% of the height; the mound is seated on it and rises
      // above it. Large = a taller, fuller mound than Medium.
      const rimY = H * 0.4;
      const rimHalf = W * 0.42;
      const moundH = H * (size === "large" ? 0.3 : 0.16);
      const count = size === "large" ? 95 : 62;
      const r = rand(size === "large" ? 7 : 3);
      const kSize = W * 0.15;
      const list: K[] = [];
      for (let i = 0; i < count; i++) {
        const t = Math.pow(r(), 1.15); // 0 = rim, 1 = top of mound (biased to a broad base)
        const half = rimHalf * Math.sqrt(Math.max(0, 1 - t * t)) * 0.95; // round dome profile
        list.push({
          x: W / 2 + (r() * 2 - 1) * half,
          y: rimY - t * moundH,
          size: kSize * (0.85 + r() * 0.35),
          rot: r() * Math.PI * 2,
          delay: 0,
          sprite: Math.floor(r() * sprites.length),
        });
      }
      // draw upper kernels first so lower/front ones overlap them; pop from the bottom up
      list.sort((a, b) => a.y - b.y);
      const byHeight = [...list].sort((a, b) => b.y - a.y);
      byHeight.forEach((k, i) => (k.delay = reduced ? -1 : i * 0.018));
      kernels = list;
    };

    const start = performance.now();
    const frame = (now: number) => {
      const t = (now - start) / 1000;
      g.clearRect(0, 0, W, H);
      let busy = false;
      for (const k of kernels) {
        const age = t - k.delay;
        if (k.delay >= 0 && age < 0) {
          busy = true;
          continue;
        }
        const a = k.delay < 0 ? 1 : Math.min(1, age / 0.22);
        if (a < 1) busy = true;
        // rises UP from 22px below its spot, with the pop overshoot
        const rise = (1 - (1 - a) * (1 - a)) * 22;
        const sz = k.size * (k.delay < 0 ? 1 : popScale(age));
        g.save();
        g.translate(k.x, k.y + 22 - rise);
        g.rotate(k.rot);
        g.drawImage(sprites[k.sprite], -sz / 2, -sz / 2, sz, sz);
        g.restore();
      }
      if (busy) raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      build();
      kernels.forEach((k) => (k.delay = -1));
      raf = requestAnimationFrame(frame);
    });
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // key captures looks/size/butter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-[1/1.12] w-full max-w-[320px]" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg viewBox="0 0 100 112" className="absolute inset-0 h-full w-full">
        <defs>
          <clipPath id="bucket-body">
            <path d="M8 47 L92 47 L82 110 L18 110 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#bucket-body)">
          <rect x="0" y="40" width="100" height="72" fill="#ffffff" />
          {/* 13 equal bands that follow the taper; odd bands are blue */}
          {Array.from({ length: 6 }, (_, j) => {
            const i = j * 2 + 1;
            const n = 13;
            const t0 = 8 + (i * 84) / n;
            const t1 = 8 + ((i + 1) * 84) / n;
            const b0 = 18 + (i * 64) / n;
            const b1 = 18 + ((i + 1) * 64) / n;
            return <path key={j} d={`M${t0} 47 L${t1} 47 L${b1} 110 L${b0} 110 Z`} fill="#013893" />;
          })}
          <rect x="0" y="47" width="100" height="63" fill="url(#bucket-shade)" />
        </g>
        <linearGradient id="bucket-shade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <path d="M8 47 L92 47 L82 110 L18 110 Z" fill="none" stroke="#0b1f4d" strokeOpacity="0.25" strokeWidth="0.6" />
        <rect x="6" y="44" width="88" height="5" rx="2.5" fill="#ffc93c" stroke="#0b1f4d" strokeOpacity="0.2" strokeWidth="0.5" />
      </svg>
      {/* REAL logo file as the bucket label — unmodified, square corners */}
      <div className="absolute top-[53%] left-1/2 w-[50%] -translate-x-1/2 bg-white p-[3px] shadow-md">
        <Image src="/brand/butter-batch-logo.png" alt="" width={1024} height={846} sizes="160px" className="block h-auto w-full" />
      </div>
    </div>
  );
}
