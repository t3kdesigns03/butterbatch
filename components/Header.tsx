"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "./cart/CartProvider";
import { HashLink } from "./HashLink";

const NAV: { href: string; label: string }[] = [
  { href: "/#menu", label: "Menu" },
  { href: "/customize", label: "Customize" },
  { href: "/tour", label: "Tour" },
  { href: "/#events", label: "Events" },
  { href: "/#pickup", label: "Pickup" },
  { href: "/#about", label: "About" },
];

/** Hash targets ("/#menu") go through HashLink so the URL never stacks two hashes. */
function NavLink({ href, ...rest }: { href: string; className: string; onClick?: () => void; children: ReactNode }) {
  return href.startsWith("/#") ? <HashLink href={href as `/#${string}`} {...rest} /> : <Link href={href} {...rest} />;
}

/** Same #013893 as every section, no lines. Wordmark + Cart (count) + hamburger on phones. */
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onWide = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-royal">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" onClick={() => setOpen(false)} className="flex min-h-11 items-center font-display text-xl font-bold tracking-tight whitespace-nowrap text-butter">
          Butter Batch
          <span className="sr-only"> Popcorn Co. home</span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <NavLink href={n.href} className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-white hover:text-butter">
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <HashLink
            href="/#order"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-butter px-4 text-sm font-bold whitespace-nowrap text-royal hover:bg-butter-light"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
              <circle cx="9.5" cy="19.5" r="1.3" />
              <circle cx="17" cy="19.5" r="1.3" />
            </svg>
            Cart
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-royal px-1.5 text-xs text-white">{count}</span>
            <span className="sr-only">{count === 1 ? "item" : "items"} — view your order</span>
          </HashLink>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full grid bg-royal transition-[grid-template-rows] duration-200 motion-reduce:transition-none lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        inert={!open}
      >
        <nav aria-label="Mobile" className="overflow-hidden">
          <ul className="px-4 pb-3">
            {NAV.map((n) => (
              <li key={n.href}>
                <NavLink href={n.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-lg font-semibold text-white">
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
