"use client";

import { useState } from "react";
import type { Flavor, MenuCategory, SizeId } from "@/data/menu";
import { mapsUrl, pickupLocations } from "@/data/site";
import { money, sizePrice } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { BoxBuilder } from "./BoxBuilder";
import { FlavorPhoto, pillClass, SizePills } from "./ui";

function FlavorCard({ flavor, category }: { flavor: Flavor; category: MenuCategory }) {
  const { menu, add } = useCart();
  const [size, setSize] = useState<SizeId>("medium");
  const [added, setAdded] = useState(false);
  const price = sizePrice(category, size);
  const medium = sizePrice(category, "medium");
  const isClassic = category.id === "classics";
  return (
    <li className="flex flex-col" data-pop-look={flavor.look}>
      <FlavorPhoto flavor={flavor} menu={menu} sizes="(min-width: 1024px) 260px, 46vw" />
      <span className="mt-3 self-start rounded-full bg-butter px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-royal uppercase">
        {isClassic ? "Classic" : "Specialty"}
      </span>
      <h3 className="mt-1.5 font-display text-lg leading-tight font-bold tracking-tight text-white">{flavor.name}</h3>
      <p className="text-sm text-white/75">{medium != null ? `${money(medium)} Medium bag` : ""}</p>
      <div className="mt-3">
        <SizePills name={flavor.name} value={size} onChange={setSize} small />
      </div>
      <button
        type="button"
        disabled={!flavor.available || price == null}
        onClick={() => {
          add({ kind: "flavor", flavorId: flavor.id, size, qty: 1 });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1500);
        }}
        className="mt-2 min-h-12 rounded-full bg-butter px-3 text-sm font-extrabold text-royal transition-colors hover:bg-butter-light disabled:opacity-50"
      >
        {!flavor.available ? "Out right now" : added ? "Added ✓" : `Add to cart — ${price != null ? money(price) : ""}`}
      </button>
      <span className="sr-only" aria-live="polite">
        {added ? `${flavor.name}, ${size}, added to your order.` : ""}
      </span>
    </li>
  );
}

type Filter = "all" | string;

export function FlavorMenu() {
  const { menu, prefs, setPrefs } = useCart();
  const [filter, setFilter] = useState<Filter>("all");
  const [boxOpen, setBoxOpen] = useState(false);
  const total = menu.categories.reduce((n, c) => n + c.flavors.length, 0);
  const shown = menu.categories.filter((c) => filter === "all" || c.id === filter);

  return (
    <section id="menu" aria-labelledby="menu-heading" className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="menu-heading" className="font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Pick your popcorn
        </h2>
        <p className="mt-2 max-w-xl text-lg text-white/85">Tap a size, tap Add. Your order builds below.</p>

        {/* Pickup / Ship toggle — reprices nothing */}
        <div className="mt-7">
          <div role="radiogroup" aria-label="How do you want it?" className="flex flex-wrap gap-2">
            {(
              [
                ["pickup", "Lincoln Pickup"],
                ["ship", "Ship It"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={prefs.fulfillment === id}
                onClick={() => setPrefs({ fulfillment: id, ...(id === "ship" && prefs.payment === "cash" ? { payment: "messenger" } : {}) })}
                className={pillClass(prefs.fulfillment === id, "min-h-12 px-6 text-base")}
              >
                {label}
              </button>
            ))}
          </div>
          {prefs.fulfillment === "pickup" ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-white/85">Pickup spot</p>
              <div role="radiogroup" aria-label="Pickup spot" className="mt-2 flex flex-wrap gap-2">
                {pickupLocations.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={prefs.pickupId === l.id}
                    onClick={() => setPrefs({ pickupId: l.id })}
                    className={pillClass(prefs.pickupId === l.id)}
                  >
                    {l.name}
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={prefs.pickupId === null}
                  onClick={() => setPrefs({ pickupId: null })}
                  className={pillClass(prefs.pickupId === null)}
                >
                  Decide in Messenger
                </button>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-white/80">
                {pickupLocations.map((l) => (
                  <li key={l.id}>
                    {l.name}: {l.street}, {l.cityLine} ·{" "}
                    <a href={mapsUrl(l)} target="_blank" rel="noopener noreferrer" className="font-semibold text-butter">
                      Directions<span className="sr-only"> to {l.name} (opens Google Maps in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-white/85">
              <strong className="text-butter">Shipping quoted in Messenger.</strong> Bag prices stay as listed; we&rsquo;ll
              quote shipping when you send your order.
            </p>
          )}
        </div>

        {/* Filter row — no container behind it */}
        <div className="mt-8 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Filter flavors">
          <button type="button" role="radio" aria-checked={filter === "all"} onClick={() => setFilter("all")} className={pillClass(filter === "all")}>
            All {total} flavors
          </button>
          {menu.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={filter === c.id}
              onClick={() => setFilter(c.id)}
              className={pillClass(filter === c.id)}
            >
              {c.id === "classics" ? "Classics" : "Specialty"} · {c.prices.map((p) => money(p.price)).join("/")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBoxOpen(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-butter px-5 text-sm font-extrabold text-royal hover:bg-butter-light sm:ml-auto"
          >
            Build Your Box of {menu.box.bags}
          </button>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4" aria-label="Flavors">
          {shown.flatMap((c) => c.flavors.map((f) => <FlavorCard key={f.id} flavor={f} category={c} />))}
        </ul>

        <div className="mt-10 max-w-3xl space-y-2 text-sm text-white/80">
          <p>{menu.priceNote}</p>
          <p>
            <strong className="text-white">Allergens:</strong> we use real butter, and many flavors contain milk or cheese.
            Please ask us about ingredients and allergens before you order.
          </p>
        </div>
      </div>
      <BoxBuilder open={boxOpen} onClose={() => setBoxOpen(false)} />
    </section>
  );
}
