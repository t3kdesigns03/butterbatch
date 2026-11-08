"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sunburst } from "./Sunburst";
import type { PopcornEngine } from "./popcornEngine";

/**
 * The living logo. Layers, back to front:
 *   1. Sunburst rays (SVG, pulse/shimmer via CSS) — behind the logo, masked so they never touch it.
 *   2. The ORIGINAL logo artwork as a fixed <Image>. No transforms, filters, masks or animation —
 *      it is never morphed, warped, stretched or redrawn.
 *   3. A transparent canvas for popcorn, sparkles and popping kernels. The engine keeps every
 *      particle out of the logo's box, so nothing is ever drawn on top of the logo.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PopcornEngine | null>(null);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Load the engine after first paint so it never competes with the logo (LCP).
    import("./popcornEngine").then(({ PopcornEngine }) => {
      if (cancelled || !canvasRef.current || !rootRef.current || !logoRef.current) return;
      engineRef.current = new PopcornEngine(canvasRef.current, rootRef.current, logoRef.current);
    });
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    const box = rootRef.current?.getBoundingClientRect();
    if (!box) return;
    engineRef.current?.tap(e.clientX - box.left, e.clientY - box.top);
    if (!tapped) setTapped(true);
  }

  return (
    <div ref={rootRef} className="relative isolate select-none" onPointerDown={onPointerDown}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 pb-20 sm:pt-16 md:pb-24">
        <div
          ref={logoRef}
          className="relative w-[80vw] max-w-[560px] sm:w-[68vw]"
          style={{ aspectRatio: "1024 / 846" }}
        >
          <div className="absolute inset-0 -z-10">
            <Sunburst />
          </div>
          <Image
            src="/brand/butter-batch-logo.png"
            alt="Butter Batch Popcorn Co. — Lincoln, NE"
            width={1024}
            height={846}
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 824px) 560px, (min-width: 640px) 68vw, 80vw"
            className="relative block h-auto w-full"
            draggable={false}
          />
        </div>
        <p
          aria-hidden="true"
          className={`mt-2 h-6 font-script text-xl text-butter-light motion-reduce:invisible ${
            tapped ? "invisible" : "tap-hint"
          }`}
        >
          tap to pop some corn!
        </p>
        {children}
      </div>
    </div>
  );
}
