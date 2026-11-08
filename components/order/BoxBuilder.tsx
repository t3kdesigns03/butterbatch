"use client";

import { useEffect, useRef, useState } from "react";
import type { SizeId } from "@/data/menu";
import { allFlavors, findFlavor, money, sizePrice } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { pillClass, SizePills } from "./ui";

/**
 * "Build Your Box": pick exactly menu.box.bags bags. Each bag is priced at its own menu price —
 * there is no box/bundle discount on the menu board, so none is invented here.
 * Full-screen sheet on #013893 (no panel fill, no lines).
 */
export function BoxBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { menu, add } = useCart();
  const need = menu.box.bags;
  const [size, setSize] = useState<SizeId>("medium");
  const [bags, setBags] = useState<{ flavorId: string; size: SizeId }[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const flavors = allFlavors(menu).filter((f) => f.available);
  const full = bags.length >= need;
  const total = bags.reduce((n, b) => {
    const hit = findFlavor(menu, b.flavorId);
    return n + (hit ? (sizePrice(hit.category, b.size) ?? 0) : 0);
  }, 0);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="box-title" className="fixed inset-0 z-[70] overflow-y-auto bg-royal text-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="box-title" className="font-display text-3xl font-bold tracking-tight text-butter sm:text-4xl">
              Build Your Box
            </h2>
            <p className="mt-1 text-white/85">Pick any {need} bags. Each bag is its menu price.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-royal"
          >
            <span className="sr-only">Close Build Your Box</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <p className="mt-6 text-sm font-semibold text-white/85">Size for the next bag</p>
        <div className="mt-2 max-w-xs">
          <SizePills name="next bag" value={size} onChange={setSize} />
        </div>

        <p className="mt-6 text-sm font-semibold text-white/85">Tap a flavor to add a bag</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {flavors.map((f) => (
            <button
              key={f.id}
              type="button"
              disabled={full}
              data-pop-look={f.look}
              onClick={() => setBags((b) => (b.length >= need ? b : [...b, { flavorId: f.id, size }]))}
              className={pillClass(false, "disabled:opacity-50")}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-bold" aria-live="polite">
            <span className={full ? "text-butter" : "text-white"}>{bags.length}</span>/{need} bags
          </p>
          <p className="font-display text-2xl font-bold text-butter">{money(total)}</p>
        </div>
        {bags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Bags in your box">
            {bags.map((b, i) => {
              const f = findFlavor(menu, b.flavorId)?.flavor;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setBags((all) => all.filter((_, j) => j !== i))}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-butter px-4 text-sm font-bold text-royal"
                  >
                    {f?.name} · {b.size === "medium" ? "M" : "L"}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">remove bag {i + 1}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          disabled={bags.length !== need}
          onClick={() => {
            add({ kind: "box", bags, qty: 1 });
            setBags([]);
            onClose();
            window.location.hash = "order";
          }}
          className="mt-8 min-h-12 w-full rounded-full bg-butter px-6 font-extrabold text-royal hover:bg-butter-light disabled:opacity-50"
        >
          {bags.length === need ? `Add box to order — ${money(total)}` : `Pick ${need - bags.length} more`}
        </button>
      </div>
    </div>
  );
}
