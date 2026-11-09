"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { burst } from "@/lib/popBus";
import type { PopcornEngine } from "./popcornEngine";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;
const getReducedServer = () => false;

/**
 * Two-column hero stage. Layers, back to front:
 *   1. back canvas — the one entrance burst (kernels emerge from behind the logo), then it goes quiet.
 *   2. the ORIGINAL logo artwork as a plain <img>: no transform, scale, rotation, filter, mask or
 *      animation, ever. (`butter-batch-logo-840.webp` is a resized copy of `butter-batch-logo.png`
 *      whose blue background decodes to exactly #013893, so there is no seam on the page.)
 *   3. Logo taps → 14 kernels rise from the popcorn pile at the bottom of the logo (page-wide PopLayer).
 * Layout: copy | logo side by side (stacked on phones), then `below` spans the full width so the
 * hero fills the screen instead of leaving an empty column.
 */
export function HeroStage({ children, below }: { children: ReactNode; below?: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const engineRef = useRef<PopcornEngine | null>(null);
  const [popped, setPopped] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);

  useEffect(() => {
    let cancelled = false;
    import("./popcornEngine").then(({ PopcornEngine }) => {
      if (cancelled || !backRef.current || !rootRef.current || !logoRef.current) return;
      engineRef.current = new PopcornEngine(backRef.current, rootRef.current, logoRef.current);
    });
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  function popLogo() {
    const r = logoRef.current?.getBoundingClientRect();
    if (!r || reduced) return;
    burst({ kind: "pile", rect: { left: r.left, top: r.top, width: r.width, height: r.height }, count: 14 });
    setPopped(true);
  }

  return (
    <div ref={rootRef} className="relative isolate">
      <canvas ref={backRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pt-4 pb-4 md:grid-cols-[1.05fr_1fr] md:gap-x-12 md:gap-y-6 md:pt-6">
        <div className="order-2 md:order-1">
          {children}
        </div>
        <div className="order-1 flex flex-col items-center md:order-2">
          <button
            ref={logoRef}
            type="button"
            data-pop-logo
            onClick={popLogo}
            className="block w-[260px] cursor-pointer rounded-2xl sm:w-[320px] lg:w-[400px]"
            style={{ aspectRatio: "840 / 694" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-encoded so the background is exactly #013893 */}
            <img
              src="/brand/butter-batch-logo-840.webp"
              alt="Butter Batch Popcorn Co., Lincoln, NE"
              width={840}
              height={694}
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="block h-auto w-full select-none"
            />
            {!reduced && <span className="sr-only"> — tap to pop some popcorn</span>}
          </button>
          <p
            aria-hidden="true"
            className={`mt-3 h-5 text-sm font-semibold text-butter transition-opacity duration-500 ${reduced || popped ? "opacity-0" : "opacity-100"}`}
          >
            Tap the logo — it pops!
          </p>
        </div>
        {below && <div className="order-3 md:col-span-2">{below}</div>}
      </div>
    </div>
  );
}
