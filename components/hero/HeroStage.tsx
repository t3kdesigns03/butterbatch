"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { PopcornEngine } from "./popcornEngine";
import { PopcornIntro } from "./PopcornIntro";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;
const getReducedServer = () => false;

/**
 * Image encoders (WebP/AVIF, Netlify Image CDN) shift the logo's flat blue background by a level
 * or two, which shows as a faint rectangle on a solid page colour. Sample the served image's
 * corner once it loads and use that exact colour for the hero/header background. Reads pixels
 * only — the logo itself is not modified.
 */
function matchLogoBackground(img: HTMLImageElement) {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g || !img.naturalWidth) return;
    g.drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
    const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
    document.documentElement.style.setProperty("--logo-bg", `rgb(${r} ${gr} ${b})`);
  } catch {
    // tainted canvas or no 2D context: keep the default #013893
  }
}

/**
 * The living logo (v2). Layers, back to front:
 *   1. back canvas  — entrance burst (kernels emerge from behind the logo) + ≤8 faint drifting kernels.
 *   2. the ORIGINAL logo artwork as a fixed <Image> inside a plain button. No transform, scale,
 *      rotation, filter, mask or animation is ever applied to it.
 *   3. front canvas — tap/click bursts from the tap point.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const engineRef = useRef<PopcornEngine | null>(null);
  const [popped, setPopped] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);

  useEffect(() => {
    let cancelled = false;
    // Load the engine after first paint so it never competes with the logo (LCP).
    import("./popcornEngine").then(({ PopcornEngine }) => {
      if (cancelled || !backRef.current || !frontRef.current || !rootRef.current || !logoRef.current) return;
      engineRef.current = new PopcornEngine(backRef.current, frontRef.current, rootRef.current, logoRef.current);
    });
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a, button:not([data-pop])")) return;
    const box = rootRef.current?.getBoundingClientRect();
    if (!box || reduced) return;
    engineRef.current?.burst(e.clientX - box.left, e.clientY - box.top);
    setPopped(true);
  }

  // Keyboard activation of the logo button (pointer taps are handled above).
  function onLogoClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (e.detail !== 0 || reduced) return;
    engineRef.current?.burstFromLogo();
    setPopped(true);
  }

  return (
    <div ref={rootRef} className="relative isolate select-none" onPointerDown={onPointerDown}>
      <PopcornIntro />
      <canvas ref={backRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <canvas ref={frontRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />


      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-10 pb-16 text-center sm:pt-14 sm:pb-20">
        <button
          ref={logoRef}
          type="button"
          data-pop
          onClick={onLogoClick}
          className="block w-[240px] cursor-pointer rounded-2xl sm:w-[300px]"
          style={{ aspectRatio: "1024 / 846" }}
        >
          <Image
            src="/brand/butter-batch-logo.png"
            alt="Butter Batch Popcorn Co., Lincoln, NE"
            width={1024}
            height={846}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 640px) 300px, 240px"
            className="block h-auto w-full"
            draggable={false}
            onLoad={(e) => matchLogoBackground(e.currentTarget)}
          />
          {!reduced && <span className="sr-only"> — pop some popcorn</span>}
        </button>

        <p
          aria-hidden="true"
          className={`mt-3 h-5 text-sm font-medium text-butter transition-opacity duration-500 ${
            reduced || popped ? "opacity-0" : "opacity-100"
          }`}
        >
          Tap the logo — pop some corn!
        </p>

        {/* data-clear: ambient kernels stay out of the headline/buttons column */}
        <div data-clear className="flex w-full flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
