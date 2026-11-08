"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ButterLevel, SizeId } from "@/data/menu";
import { LOOKS } from "@/lib/looks";
import { customUnitPrice, findFlavor, money, sizePrice, type CustomItem } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { Bucket } from "./Bucket";

/** Reads ?edit=<cart line id> and remounts the builder once the saved cart has loaded. */
export function Customizer() {
  const { items } = useCart();
  const editId = useSearchParams().get("edit");
  const editing = items.find((i): i is CustomItem => i.kind === "custom" && i.id === editId) ?? null;
  return <Builder key={editing?.id ?? "new"} editing={editing} />;
}

function Builder({ editing }: { editing: CustomItem | null }) {
  const { menu, add, remove, open } = useCart();
  const opts = menu.customize;
  const [size, setSize] = useState<SizeId>(editing?.size ?? "medium");
  const [picked, setPicked] = useState<string[]>(editing?.flavorIds ?? []);
  const [butterIdx, setButterIdx] = useState(() =>
    Math.max(0, opts.butterLevels.findIndex((b) => b.id === (editing?.butter ?? "regular"))),
  );
  const [added, setAdded] = useState(false);

  const butter: ButterLevel = opts.butterLevels[butterIdx];
  const price = customUnitPrice(menu, picked, size);
  const looks = picked.map((id) => findFlavor(menu, id)?.flavor.look ?? "butter");
  const pickedNames = picked.map((id) => findFlavor(menu, id)?.flavor.name ?? id);
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
    open();
  }

  // price shown per size: depends on the chosen flavors' tier (board prices), "from" when none chosen
  const sizePriceLabel = (s: SizeId) => {
    const p = customUnitPrice(menu, picked, s);
    if (p != null) return money(p);
    const all = menu.categories.map((c) => sizePrice(c, s)).filter((x): x is number => x != null);
    return `from ${money(Math.min(...all))}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      {/* live preview */}
      <div className="lg:sticky lg:top-24">
        <div className="rounded-3xl bg-royal px-4 pt-8 pb-6 text-white">
          <Bucket looks={looks} size={size} butter={butterIdx} />
          <p className="mt-4 text-center text-sm text-white/80" aria-live="polite">
            {picked.length === 0
              ? "Pick a flavor to fill your bucket."
              : `${size === "large" ? "Large" : "Medium"} · ${pickedNames.join(" + ")} · ${butter.label}`}
          </p>
          <p className="mt-1 text-center text-xs text-white/60">
            Bucket colours are an illustration of {looks.length ? looks.map((l) => LOOKS[l].name).join(" + ") : "our popcorn"}.
          </p>
        </div>
      </div>

      {/* choices */}
      <div className="space-y-8">
        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-navy">1. Pick a size</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["medium", "large"] as const).map((s) => (
              <label
                key={s}
                className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 px-3 py-2 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-butter ${
                  size === s ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-navy/40"
                }`}
              >
                <input type="radio" name="custom-size" value={s} checked={size === s} onChange={() => setSize(s)} className="sr-only" />
                <span className="font-semibold">{s === "medium" ? "Medium bag" : "Large bag"}</span>
                <span className={`text-sm ${size === s ? "text-white/80" : "text-navy/65"}`}>{sizePriceLabel(s)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-navy">2. Pick a flavor (or two)</legend>
          <p className="mt-1 text-sm text-navy/70">
            Max {opts.maxFlavors} flavors per bag.{full ? " Tap a picked flavor to swap it out." : ""}
          </p>
          {menu.categories.map((cat) => (
            <div key={cat.id} className="mt-4">
              <p className="text-sm font-semibold text-navy/80">
                {cat.name} · {cat.prices.map((p) => money(p.price)).join(" / ")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cat.flavors.map((f) => {
                  const on = picked.includes(f.id);
                  const disabled = !f.available || (!on && full);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      disabled={disabled}
                      onClick={() => toggle(f.id)}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                        on
                          ? "border-navy bg-navy text-white"
                          : "border-navy/15 bg-white text-navy hover:border-navy/40 disabled:opacity-40 disabled:hover:border-navy/15"
                      }`}
                    >
                      <span aria-hidden="true" className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: LOOKS[f.look].base }} />
                      {f.name}
                      {!f.available && <span className="text-xs">(out)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl font-bold tracking-tight text-navy">3. Butter amount</legend>
          <input
            type="range"
            min={0}
            max={opts.butterLevels.length - 1}
            step={1}
            value={butterIdx}
            onChange={(e) => setButterIdx(Number(e.target.value))}
            aria-valuetext={butter.label}
            aria-label="Butter amount"
            className="mt-4 h-11 w-full cursor-pointer accent-[#013893]"
          />
          <div className="mt-1 flex justify-between text-sm text-navy/70" aria-hidden="true">
            {opts.butterLevels.map((b, i) => (
              <span key={b.id} className={i === butterIdx ? "font-semibold text-navy" : ""}>
                {b.label}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs text-navy/60">No extra charge for butter.</p>
        </fieldset>

        {opts.toppings.length > 0 && (
          <fieldset>
            <legend className="font-display text-2xl font-bold tracking-tight text-navy">4. Toppings</legend>
            {/* Rendered only when the menu actually offers toppings (none on the current board). */}
          </fieldset>
        )}

        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold text-navy">Your popcorn</p>
            <p className="font-display text-3xl font-bold text-navy" aria-live="polite">
              {price != null ? money(price) : "—"}
            </p>
          </div>
          <p className="mt-1 text-sm text-navy/70">
            {picked.length === 0
              ? "Pick at least one flavor."
              : `${size === "large" ? "Large" : "Medium"} bag · ${pickedNames.join(" + ")} · ${butter.label}`}
          </p>
          {crossTierMix && (
            <p className="mt-2 text-xs text-navy/65">
              Flavors from different price tiers are priced at the higher menu price. We&rsquo;ll confirm in Messenger.
            </p>
          )}
          <button
            type="button"
            disabled={price == null}
            onClick={submit}
            className="mt-4 min-h-12 w-full rounded-full bg-butter px-6 font-semibold text-navy transition-colors hover:bg-butter-light disabled:bg-navy/10 disabled:text-navy/50"
          >
            {editing ? "Update My Popcorn" : added ? "Added ✓ — add another?" : "Add My Popcorn to Cart"}
          </button>
          <p className="mt-3 text-center text-sm text-navy/70">
            Prefer a classic bag?{" "}
            <Link href="/shop" className="font-semibold underline underline-offset-4">
              Shop flavors
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
