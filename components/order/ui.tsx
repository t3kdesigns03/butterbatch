"use client";

import Image from "next/image";
import type { Flavor, Menu, SizeId } from "@/data/menu";

/**
 * Shared ordering UI pieces. No borders or panel fills (V6): controls are solid white (off) or
 * solid yellow (on) pills with royal text — everything else sits directly on #013893.
 */

export function pillClass(on: boolean, extra = "") {
  return `inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold transition-colors ${
    on ? "bg-butter text-royal" : "bg-white text-royal hover:bg-butter-light"
  } ${extra}`;
}

export function SizePills({
  name,
  value,
  onChange,
  prices,
  small = false,
}: {
  name: string;
  value: SizeId;
  onChange: (s: SizeId) => void;
  prices?: Partial<Record<SizeId, string>>;
  small?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={`Size for ${name}`} className="flex gap-2">
      {(["medium", "large"] as const).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={pillClass(value === s, small ? "flex-1 px-3" : "flex-1")}
        >
          {s === "medium" ? "Medium" : "Large"}
          {prices?.[s] ? <span className="ml-1 font-semibold opacity-80">{prices[s]}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** A flavor's real photo, or the real "assorted bags" photo clearly tagged as such. Never drawn popcorn. */
export function FlavorPhoto({ flavor, menu, sizes }: { flavor: Flavor; menu: Menu; sizes: string }) {
  const photo = flavor.photo ?? menu.fallbackPhoto;
  const tag = flavor.photo ? "Real photo" : menu.fallbackPhoto.tag;
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
      <Image src={photo.src} alt={flavor.photo ? photo.alt : `${menu.fallbackPhoto.alt} (not a photo of ${flavor.name} specifically)`} fill sizes={sizes} className="object-cover" />
      <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">{tag}</span>
    </div>
  );
}
