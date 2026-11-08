"use client";

import { useState } from "react";
import type { Bundle, Flavor, MenuCategory, SizeId } from "@/data/menu";
import { allFlavors, money, sizePrice } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { BagArt, BagRender } from "./BagArt";

function useAdded() {
  const [added, setAdded] = useState(false);
  return [
    added,
    () => {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    },
  ] as const;
}

function SizePicker({
  name,
  category,
  value,
  onChange,
}: {
  name: string;
  category: MenuCategory;
  value: SizeId;
  onChange: (s: SizeId) => void;
}) {
  return (
    <fieldset className="mt-3">
      <legend className="sr-only">Size for {name}</legend>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1">
        {category.prices.map((p) => (
          <label
            key={p.size}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-butter ${
              value === p.size ? "bg-butter text-royal" : "text-white hover:bg-white/10"
            }`}
          >
            <input
              type="radio"
              name={`size-${name}`}
              value={p.size}
              checked={value === p.size}
              onChange={() => onChange(p.size)}
              className="sr-only"
            />
            {p.size === "medium" ? "Medium" : "Large"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FlavorCard({ flavor, category }: { flavor: Flavor; category: MenuCategory }) {
  const { add, open } = useCart();
  const [size, setSize] = useState<SizeId>("medium");
  const [added, flash] = useAdded();
  const price = sizePrice(category, size);
  return (
    <li className="flex flex-col rounded-2xl border border-white/10 surface-2 p-3 sm:p-4">
      <BagArt flavor={flavor} />
      <h3 className="mt-3 font-display text-lg leading-tight font-bold tracking-tight text-white">{flavor.name}</h3>
      <p className="text-sm text-white/65">{category.name}</p>
      <SizePicker name={flavor.name} category={category} value={size} onChange={setSize} />
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="font-display text-2xl font-bold text-butter">{price != null ? money(price) : "—"}</p>
      </div>
      <button
        type="button"
        disabled={!flavor.available || price == null}
        onClick={() => {
          add({ kind: "flavor", flavorId: flavor.id, size, qty: 1 });
          flash();
        }}
        className="mt-2 min-h-12 rounded-full bg-butter px-4 font-semibold text-royal transition-colors hover:bg-butter-light disabled:bg-white/10 disabled:text-white/65"
      >
        {!flavor.available ? "Out right now" : added ? "Added ✓" : "Add to cart"}
      </button>
      <p className="sr-only" aria-live="polite">
        {added ? `${flavor.name}, ${size}, added to cart.` : ""}
      </p>
      {added && (
        <button type="button" onClick={open} className="mt-1 min-h-11 text-sm font-medium text-white underline underline-offset-4">
          View cart
        </button>
      )}
    </li>
  );
}

function BundleCard({ bundle, flavors }: { bundle: Bundle; flavors: Flavor[] }) {
  const { add, open } = useCart();
  const available = flavors.filter((f) => f.available);
  const [picks, setPicks] = useState<string[]>(() =>
    Array.from({ length: bundle.bags }, (_, i) => available[i % available.length]?.id ?? ""),
  );
  const [added, flash] = useAdded();
  return (
    <div className="grid gap-5 rounded-2xl border border-white/10 surface-2 p-4 sm:grid-cols-[180px_1fr] sm:p-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {picks.slice(0, 2).map((id, i) => {
          const f = flavors.find((x) => x.id === id) ?? available[0];
          return f ? <BagRender key={i} look={f.look} label={f.name} seedKey={`bundle-${i}-${f.id}`} /> : null;
        })}
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-white">{bundle.name}</h3>
        <p className="text-white/70">{bundle.description}</p>
        <p className="mt-2 font-display text-3xl font-bold text-butter">{money(bundle.price)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {picks.map((id, i) => (
            <label key={i} className="block text-sm font-medium text-white">
              Bag {i + 1} flavor
              <select
                value={id}
                onChange={(e) => setPicks((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                className="mt-1 block min-h-12 w-full rounded-xl border border-white/15 surface-2 px-3 text-base"
              >
                {available.map((f) => (
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
            flash();
          }}
          className="mt-4 min-h-12 w-full rounded-full bg-butter px-6 font-semibold text-royal hover:bg-butter-light sm:w-auto"
        >
          {added ? "Added ✓" : "Add bundle to cart"}
        </button>
        <p className="sr-only" aria-live="polite">
          {added ? `${bundle.name} added to cart.` : ""}
        </p>
        {added && (
          <button type="button" onClick={open} className="ml-3 min-h-11 text-sm font-medium text-white underline underline-offset-4">
            View cart
          </button>
        )}
      </div>
    </div>
  );
}

export function ShopGrid() {
  const { menu } = useCart();
  const bundles = menu.bundles.filter((b) => b.showOnSite);
  const flavors = allFlavors(menu);
  return (
    <div className="space-y-14">
      {menu.categories.map((cat) => {
        const tier = cat.prices.map((p) => money(p.price)).join(" / ");
        return (
          <section key={cat.id} aria-labelledby={`shop-${cat.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`shop-${cat.id}`} className="font-display text-3xl font-bold tracking-tight text-butter">
                {cat.name}
              </h2>
              <p className="text-white/70">Medium / Large: {tier}</p>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {cat.flavors.map((f) => (
                <FlavorCard key={f.id} flavor={f} category={cat} />
              ))}
            </ul>
          </section>
        );
      })}
      {bundles.map((b) => (
        <section key={b.id} aria-labelledby={`shop-${b.id}`}>
          <h2 id={`shop-${b.id}`} className="font-display text-3xl font-bold tracking-tight text-butter">
            Bundles
          </h2>
          <div className="mt-5">
            <BundleCard bundle={b} flavors={flavors} />
          </div>
        </section>
      ))}
    </div>
  );
}
