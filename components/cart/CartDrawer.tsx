"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ORDER_URL } from "@/data/site";
import { cartTotal, describe, money, orderMessage, unitPrice, MAX_QTY } from "@/lib/pricing";
import { useCart } from "./CartProvider";

/**
 * The shared cart. Phase 2 checkout = no payment: the "Send order" button copies a composed
 * order message and opens the Butter Batch Facebook page, where the customer pastes it into
 * Messenger. Nothing is sent anywhere by this site.
 */
export function CartDrawer() {
  const { menu, items, isOpen, close, update, remove, clear } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const message = orderMessage(menu, items);
  const total = cartTotal(menu, items);

  // focus, Escape to close, lock page scroll while open, restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [isOpen, close]);

  function onSend() {
    // Runs inside the click, before the link opens Facebook in a new tab.
    setCopyState("idle");
    try {
      navigator.clipboard.writeText(message).then(
        () => setCopyState("copied"),
        () => setCopyState("manual"),
      );
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[70] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-navy-deep/50 transition-opacity duration-200 motion-reduce:transition-none ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white text-navy shadow-2xl transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
          <h2 id="cart-title" className="font-display text-2xl font-bold tracking-tight">
            Your cart
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-navy/5"
          >
            <span className="sr-only">Close cart</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-lg text-navy/75">Your cart is empty.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/shop" onClick={close} className="inline-flex min-h-12 items-center justify-center rounded-full bg-butter px-6 font-semibold text-navy hover:bg-butter-light">
                Shop flavors
              </Link>
              <Link href="/customize" onClick={close} className="inline-flex min-h-12 items-center justify-center rounded-full border border-navy/20 px-6 font-semibold text-navy hover:bg-navy/5">
                Build my popcorn
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-navy/10 overflow-y-auto px-5">
              {items.map((item) => {
                const d = describe(menu, item);
                const unit = unitPrice(menu, item) ?? 0;
                return (
                  <li key={item.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{d.title}</p>
                        <ul className="mt-0.5 text-sm text-navy/70">
                          {d.details.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="font-display text-lg font-bold">{money(unit * item.qty)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-navy/15">
                        <button
                          type="button"
                          onClick={() => (item.qty > 1 ? update(item.id, { qty: item.qty - 1 }) : remove(item.id))}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl hover:bg-navy/5"
                        >
                          <span aria-hidden="true">−</span>
                          <span className="sr-only">Decrease quantity of {d.title}</span>
                        </button>
                        <span className="w-8 text-center font-semibold" aria-live="polite">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.qty >= MAX_QTY}
                          onClick={() => update(item.id, { qty: item.qty + 1 })}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-xl hover:bg-navy/5 disabled:opacity-40"
                        >
                          <span aria-hidden="true">+</span>
                          <span className="sr-only">Increase quantity of {d.title}</span>
                        </button>
                      </div>
                      {item.kind === "flavor" && (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <span className="sr-only">Size for {d.title}</span>
                          <select
                            value={item.size}
                            onChange={(e) => update(item.id, { size: e.target.value as "medium" | "large" })}
                            className="min-h-11 rounded-full border border-navy/15 bg-white px-3"
                          >
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </label>
                      )}
                      {item.kind === "custom" && (
                        <Link
                          href={`/customize?edit=${encodeURIComponent(item.id)}`}
                          onClick={close}
                          className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold underline underline-offset-4"
                        >
                          Edit<span className="sr-only"> {d.title}</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="ml-auto inline-flex min-h-11 items-center rounded-full px-3 text-sm text-navy/70 underline underline-offset-4 hover:text-navy"
                      >
                        Remove<span className="sr-only"> {d.title}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-navy/10 px-5 py-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">Estimated total</p>
                <p className="font-display text-2xl font-bold">{money(total)}</p>
              </div>
              <p className="mt-1 text-xs text-navy/65">{menu.priceNote} No payment is taken on this site.</p>
              <a
                href={ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSend}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-butter px-6 font-semibold text-navy hover:bg-butter-light"
              >
                Copy order &amp; message us
                <span className="sr-only">(opens Facebook in a new tab)</span>
              </a>
              <p className="mt-2 text-center text-xs text-navy/65" aria-live="polite">
                {copyState === "copied"
                  ? "Order copied! Tap Message on our Facebook page and paste it in."
                  : copyState === "manual"
                    ? "Couldn't copy automatically — copy the order text below and paste it in Messenger."
                    : "We'll copy your order so you can paste it into Messenger."}
              </p>
              <details className="mt-2 text-sm" open={copyState === "manual"}>
                <summary className="cursor-pointer py-2 font-medium">See order text</summary>
                <textarea
                  ref={textRef}
                  readOnly
                  value={message}
                  onFocus={(e) => e.currentTarget.select()}
                  rows={8}
                  className="mt-1 w-full rounded-xl border border-navy/15 p-3 font-mono text-xs"
                  aria-label="Order message"
                />
              </details>
              <button type="button" onClick={clear} className="mt-2 min-h-11 text-sm text-navy/60 underline underline-offset-4">
                Empty cart
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
