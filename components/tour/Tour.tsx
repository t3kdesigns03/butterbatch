"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FACEBOOK_URL, mapsUrl, pickupLocations } from "@/data/site";
import { tourStops } from "@/data/tour";
import { money } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { ExternalIcon, PinIcon } from "../icons";

/**
 * Photo-led tour. Native horizontal scroll-snap = swipe on phones with no library;
 * prev/next buttons, dots and ←/→ keys on desktop. The track takes the height of the CURRENT
 * stop (not the tallest one), so there's never an empty band under a short caption.
 */
export function Tour() {
  const { menu } = useCart();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const bundle = menu.bundles.find((b) => b.showOnSite);
  const last = tourStops.length - 1;

  function go(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(last, i));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: next * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
  }

  // fit the track to the visible stop
  useEffect(() => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    const fit = () => {
      track.style.height = `${slide.offsetHeight}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(slide);
    return () => ro.disconnect();
  }, [index]);

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
  }

  return (
    <section aria-roledescription="carousel" aria-label="Butter Batch tour" className="w-full">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white/70" aria-live="polite">
          Stop {index + 1} of {tourStops.length}: <span className="text-white">{tourStops[index]?.title}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-royal hover:bg-butter-light disabled:opacity-40"
          >
            <span className="sr-only">Previous stop</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === last}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-butter text-royal hover:bg-butter-light disabled:opacity-40"
          >
            <span className="sr-only">Next stop</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* relative: keeps absolutely-positioned descendants (e.g. sr-only labels) inside the
          scroller, so off-screen slides can't widen the page on phones */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          }
        }}
        aria-label="Tour stops — swipe, or use the arrow keys"
        className="relative mt-4 flex items-start snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-3xl transition-[height] duration-200 motion-reduce:transition-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tourStops.map((stop, i) => (
          <article
            key={stop.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${tourStops.length}: ${stop.title}`}
            className="relative w-full shrink-0 snap-start snap-always"
          >
            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:items-center">
              <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl md:aspect-auto md:h-[min(52vh,460px)] md:min-h-[300px]">
                <Image
                  src={stop.photo.src}
                  alt={stop.photo.alt}
                  fill
                  sizes="(min-width: 1152px) 690px, (min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <figcaption className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white">
                  Photo: Butter Batch Popcorn Co.
                </figcaption>
              </figure>
              <div className="flex flex-col">
                <h2 className="font-display text-3xl font-bold tracking-tight text-butter">{stop.title}</h2>
                <p className="mt-2 text-lg text-white/80">{stop.caption}</p>
                {stop.pictured && <p className="mt-1 text-sm text-white/65">{stop.pictured}</p>}

                {stop.id === "pickup" && (
                  <ul className="mt-4 space-y-3">
                    {pickupLocations.map((loc) => (
                      <li key={loc.id}>
                        <div className="flex items-start gap-2">
                          <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
                          <div>
                            <p className="font-semibold text-white">{loc.name}</p>
                            <address className="text-sm not-italic text-white/75">
                              {loc.street}, {loc.cityLine}
                            </address>
                          </div>
                        </div>
                        <a
                          href={mapsUrl(loc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-royal hover:bg-butter-light"
                        >
                          Get directions <ExternalIcon />
                          <span className="sr-only">to {loc.name} (opens Google Maps in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {stop.id === "events" && (
                  <div className="mt-4 space-y-3">
                    {bundle && (
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{bundle.name}</p>
                          <p className="text-sm text-white/70">{bundle.description}</p>
                        </div>
                        <p className="font-display text-2xl font-bold text-butter">{money(bundle.price)}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link href="/shop" className="inline-flex min-h-11 items-center rounded-full bg-butter px-5 text-sm font-semibold text-royal hover:bg-butter-light">
                        Shop the bundle
                      </Link>
                      <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-royal hover:bg-butter-light"
                      >
                        Follow on Facebook <ExternalIcon />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-1" role="group" aria-label="Choose a stop">
        {tourStops.map((stop, i) => (
          <button
            key={stop.id}
            type="button"
            onClick={() => go(i)}
            aria-current={i === index ? "step" : undefined}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span className="sr-only">Go to stop {i + 1}: {stop.title}</span>
            <span aria-hidden="true" className={`block h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-butter" : "w-2.5 bg-white"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
