"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OrderButton } from "./OrderButton";

const NAV = [
  { href: "/#menu", label: "Menu" },
  { href: "/#pickup", label: "Pickup" },
  { href: "/#events", label: "Events" },
  { href: "/#about", label: "About" },
];

/**
 * Mobile-first header: wordmark + Order + hamburger on phones (nav lives in a slide-down panel);
 * inline nav from md up.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onWide = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-royal">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex min-h-11 items-center font-display text-xl font-bold tracking-tight text-butter"
        >
          Butter Batch
          <span className="sr-only"> Popcorn Co. home</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <OrderButton label="Order" size="md" />
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-down panel (phones). grid-rows trick animates height without measuring. */}
      <div
        id="mobile-nav"
        className={`grid border-white/10 bg-navy transition-[grid-template-rows] duration-200 motion-reduce:transition-none md:hidden ${
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        }`}
        inert={!open}
      >
        <nav aria-label="Mobile" className="overflow-hidden">
          <ul className="px-4 py-2">
            {NAV.map((n) => (
              <li key={n.href} className="border-b border-white/10 last:border-0">
                <a
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-lg font-medium text-white"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
