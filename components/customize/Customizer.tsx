"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ButterLevel, SizeId } from "@/data/menu";
import { customUnitPrice, findFlavor, money, sizePrice, type CustomItem } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { FlavorPhoto, pillClass } from "../order/ui";
import { Bucket } from "./Bucket";

/** Reads ?edit=<cart line id> and remounts the builder once the saved cart has loaded. */
export function Customizer() {
  const { items } = useCart();
  const editId = useSearchParams().get("edit");
  const editing = items.find((i): i is CustomItem => i.kind === "custom" && i.id === editId) ?? null;
  return <Builder key={editing?.id ?? "new"} editing={editing} />;
}

function Builder({ editing }: { editing: CustomItem | null }) {
  const { menu, add, remove } = useCart();
  const opts = menu.customize;
  const [size, setSize] = useState<SizeId>(editing?.size ?? "medium");
  const [picked, setPicked] = useState<string[]>(editing?.flavorIds ?? []);
  const [butterIdx, setButterIdx] = useState(() => Math.max(0, opts.butterLevels.findIndex((b) => b.id === (editing?.butter ?? "regular"))));
  const [added, setAdded] = useState(false);

  const butter: ButterLevel = opts.butterLevels[butterIdx];
  const price = customUnitPrice(menu, picked, size);
  const pickedFlavors = picked.map((id) => findFlavor(menu, id)?.flavor).filter((f): f is NonNullable<typeof f> => !!f);
  const looks = pickedFlavors.map((f) => f.look);
  const tiers = new Set(picked.map((id) => findFlavor(menu, id)?.category.id));
  const crossTierMix = picked.length > 1 && tiers.size > 1;
  const full = picked.length >= opts.maxFlavors;

  function toggle(id: string) {
    setAdded(false);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= opts.maxFlavors ? p : [...p, id]));
  }

  function submit() {
    if (price == null) return;
    const spec = { kind: "custom" as const, flavorIds: picked, size, butter: butter.id, qty: 1 };
    if (editing) {
      remove(editing.id);
      add({ ...spec, qty: editing.qty });
    } else {
      add(spec);
    }
    setAdded(true);
  }

  const sizePriceLabel = (s: SizeId) => {
    const p = customUnitPrice(menu, picked, s);
    if (p != null) return money(p);
    const all = menu.categories.map((c) => sizePrice(c, s)).filter((x): x is number => x != null);
    return `from ${money(Math.min(...all))}`;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      {/* live preview: bucket (real logo label) + real photo of the chosen flavor(s) */}
      <div className="lg:sticky lg:top-24" data-pop data-pop-look={looks[0] ?? "butter"}>
        <Bucket looks={looks} size={size} butter={butterIdx} />
        <p className="mt-4 text-center text-sm text-white/85" aria-live="polite">
          {picked.length === 0
            ? "Pick a flavor to fill your bucket."
            : `${size === "large" ? "Large" : "Medium"} · ${pickedFlavors.map((f) => f.name).join(" + ")} · ${butter.label}`}
        </p>
        {pickedFlavors.length > 0 && (
          <div className="mx-auto mt-5 flex max-w-xs justify-center gap-4">
            {pickedFlavors.map((f) => (
              <figure key={f.id} className="w-32">
                <FlavorPhoto flavor={f} menu={menu} sizes="128px" />
                <figcaption className="mt-1 text-center text-xs text-white/80">{f.name}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <p className="mt-3 text-center text-xs text-white/75">The bucket is an illustration; the bag photos are real.</p>
      </div>

      <div className="space-y-9">
        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-butter">1. Pick a size</legend>
          <div role="radiogroup" aria-label="Size" className="mt-3 grid grid-cols-2 gap-3">
            {(["medium", "large"] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={size === s} onClick={() => setSize(s)} className={pillClass(size === s, "min-h-16 flex-col rounded-3xl")}>
                <span className="text-base">{s === "medium" ? "Medium bag" : "Large bag"}</span>
                <span className="text-sm font-semibold opacity-80">{sizePriceLabel(s)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-butter">2. Pick a flavor (or two)</legend>
          <p className="mt-1 text-sm text-white/80">
            Max {opts.maxFlavors} flavors per bag.{full ? " Tap a picked flavor to swap it out." : ""}
          </p>
          {menu.categories.map((cat) => (
            <div key={cat.id} className="mt-4">
              <p className="text-sm font-semibold text-white/85">
                {cat.name} · {cat.prices.map((p) => money(p.price)).join(" / ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.flavors.map((f) => {
                  const on = picked.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      disabled={!f.available || (!on && full)}
                      data-pop-look={f.look}
                      onClick={() => toggle(f.id)}
                      className={pillClass(on, "disabled:opacity-50")}
                    >
                      {f.name}
                      {!f.available && <span className="ml-1 text-xs">(out)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-butter">3. Butter amount</legend>
          <input
            type="range"
            min={0}
            max={opts.butterLevels.length - 1}
            step={1}
            value={butterIdx}
            onChange={(e) => setButterIdx(Number(e.target.value))}
            aria-valuetext={butter.label}
            aria-label="Butter amount"
            className="mt-4 h-11 w-full cursor-pointer accent-[#ffc93c]"
          />
          <div className="mt-1 flex justify-between text-sm text-white/85" aria-hidden="true">
            {opts.butterLevels.map((b, i) => (
              <span key={b.id} className={i === butterIdx ? "font-bold text-butter" : ""}>
                {b.label}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-white/75">No extra charge for butter.</p>
        </fieldset>

        {opts.toppings.length > 0 && (
          <fieldset>
            <legend className="font-display text-2xl font-bold tracking-tight text-butter">4. Toppings</legend>
            {/* Rendered only when the menu actually offers toppings (none on the current board). */}
          </fieldset>
        )}

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold">Your popcorn</p>
            <p className="font-display text-4xl font-bold text-butter" aria-live="polite">
              {price != null ? money(price) : "—"}
            </p>
          </div>
          <p className="mt-1 text-sm text-white/85">
            {picked.length === 0
              ? "Pick at least one flavor."
              : `${size === "large" ? "Large" : "Medium"} bag · ${pickedFlavors.map((f) => f.name).join(" + ")} · ${butter.label}`}
          </p>
          {crossTierMix && (
            <p className="mt-2 text-xs text-white/80">Flavors from different price tiers are priced at the higher menu price. We&rsquo;ll confirm in Messenger.</p>
          )}
          <button
            type="button"
            disabled={price == null}
            onClick={submit}
            className="mt-4 min-h-12 w-full rounded-full bg-butter px-6 font-extrabold text-royal transition-colors hover:bg-butter-light disabled:opacity-50"
          >
            {editing ? "Update My Popcorn" : added ? "Added ✓ — add another?" : "Add My Popcorn to Cart"}
          </button>
          {added && (
            <p className="mt-3 text-center">
              <Link href="/#order" className="inline-flex min-h-11 items-center font-bold text-butter">
                View your order →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
