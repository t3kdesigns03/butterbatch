"use client";

import { useState } from "react";
import type { SizeId } from "@/data/menu";
import { allFlavors, findBundle, findFlavor, money, sizePrice } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { FlavorPhoto, SizePills } from "./ui";

/** Monthly Special = the Event Bundle; Weekly Special = one flavor from data/menu.ts (owner picks). */
export function Specials() {
  const { menu, add } = useCart();
  const bundle = findBundle(menu, menu.specials.monthlyBundleId);
  const weeklyId = menu.specials.weeklyFlavorId ?? menu.categories.find((c) => c.id === "specialty")?.flavors[0]?.id ?? null;
  const weekly = weeklyId ? findFlavor(menu, weeklyId) : null;
  const flavors = allFlavors(menu).filter((f) => f.available);
  const [picks, setPicks] = useState<string[]>(() => Array.from({ length: bundle?.bags ?? 2 }, (_, i) => flavors[i % flavors.length]?.id ?? ""));
  const [size, setSize] = useState<SizeId>("medium");
  const [addedB, setAddedB] = useState(false);
  const [addedW, setAddedW] = useState(false);
  const flash = (f: (v: boolean) => void) => {
    f(true);
    window.setTimeout(() => f(false), 1500);
  };

  return (
    <section id="specials" aria-labelledby="specials-heading" className="py-12 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.4fr_1fr]">
        <h2 id="specials-heading" className="sr-only">
          Specials
        </h2>

        {bundle && (
          <div data-pop-look="caramel">
            <span className="rounded-full bg-butter px-3 py-1 text-xs font-extrabold tracking-wider text-royal uppercase">Monthly Special</span>
            <p className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {bundle.name} <span className="text-butter">{money(bundle.price)}</span>
            </p>
            <p className="mt-2 text-lg text-white/85">{bundle.description}. Great for game nights and parties.</p>
            <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2">
              {picks.map((id, i) => (
                <label key={i} className="block text-sm font-semibold text-white/85">
                  Bag {i + 1} flavor
                  <select
                    value={id}
                    onChange={(e) => setPicks((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                    className="mt-1 block min-h-12 w-full rounded-full bg-white px-4 text-base font-semibold text-royal"
                  >
                    {flavors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                add({ kind: "bundle", bundleId: bundle.id, flavorIds: picks, qty: 1 });
                flash(setAddedB);
              }}
              className="mt-5 min-h-12 rounded-full bg-butter px-7 font-extrabold text-royal hover:bg-butter-light"
            >
              {addedB ? "Added ✓" : `Add bundle — ${money(bundle.price)}`}
            </button>
          </div>
        )}

        {weekly && (
          <div className="grid grid-cols-[120px_1fr] gap-4 sm:grid-cols-[150px_1fr]" data-pop-look={weekly.flavor.look}>
            <FlavorPhoto flavor={weekly.flavor} menu={menu} sizes="150px" />
            <div>
              <span className="rounded-full bg-butter px-3 py-1 text-xs font-extrabold tracking-wider text-royal uppercase">Weekly Special</span>
              <p className="mt-3 font-display text-2xl font-bold tracking-tight text-white">{weekly.flavor.name}</p>
              <p className="text-sm text-white/80">
                {weekly.category.name} · {weekly.category.prices.map((p) => money(p.price)).join(" / ")}
              </p>
              <div className="mt-3 max-w-[16rem]">
                <SizePills name={weekly.flavor.name} value={size} onChange={setSize} small />
              </div>
              <button
                type="button"
                onClick={() => {
                  add({ kind: "flavor", flavorId: weekly.flavor.id, size, qty: 1 });
                  flash(setAddedW);
                }}
                className="mt-2 min-h-12 rounded-full bg-butter px-5 text-sm font-extrabold text-royal hover:bg-butter-light"
              >
                {addedW ? "Added ✓" : `Add to cart — ${money(sizePrice(weekly.category, size) ?? 0)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
