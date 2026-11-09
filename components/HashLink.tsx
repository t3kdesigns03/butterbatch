"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

/**
 * Link for "/#section" targets. On the home page it scrolls in place and REPLACES the hash, so the
 * address bar only ever carries one (#menu, never #events#menu). From any other page it is a normal
 * Next.js navigation to "/#section".
 */
export function HashLink({ href, onClick, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: `/#${string}` }) {
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.location.pathname !== "/") return; // cross-page: let Next navigate
    const id = href.slice(2);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", `/#${id}`);
  }
  return <Link href={href} onClick={handle} {...rest} />;
}
