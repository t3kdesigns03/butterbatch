/**
 * Cart pricing + order text. Pure functions: every price comes from the Menu passed in
 * (data/menu.ts → getMenu()). Nothing here hardcodes a price, flavor or upcharge.
 */
import type { Bundle, ButterLevel, Flavor, Menu, MenuCategory, SizeId } from "../data/menu";

export type FlavorItem = { id: string; kind: "flavor"; flavorId: string; size: SizeId; qty: number };
export type CustomItem = {
  id: string;
  kind: "custom";
  flavorIds: string[]; // 1..menu.customize.maxFlavors
  size: SizeId;
  butter: ButterLevel["id"];
  qty: number;
};
export type BundleItem = { id: string; kind: "bundle"; bundleId: string; flavorIds: string[]; qty: number };
export type CartItem = FlavorItem | CustomItem | BundleItem;

/** Omit that distributes over the union, so each item kind keeps its own fields. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type NewCartItem = DistributiveOmit<CartItem, "id">;
export type CartItemPatch = Partial<DistributiveOmit<CartItem, "id" | "kind">>;

export const MAX_QTY = 99;

export function findFlavor(menu: Menu, flavorId: string): { flavor: Flavor; category: MenuCategory } | null {
  for (const category of menu.categories) {
    const flavor = category.flavors.find((f) => f.id === flavorId);
    if (flavor) return { flavor, category };
  }
  return null;
}

export function allFlavors(menu: Menu): Flavor[] {
  return menu.categories.flatMap((c) => c.flavors);
}

export function sizePrice(category: MenuCategory, size: SizeId): number | null {
  return category.prices.find((p) => p.size === size)?.price ?? null;
}

export function sizeLabel(menu: Menu, size: SizeId): string {
  for (const c of menu.categories) {
    const p = c.prices.find((x) => x.size === size);
    if (p) return p.label;
  }
  return size;
}

export function findBundle(menu: Menu, bundleId: string): Bundle | null {
  return menu.bundles.find((b) => b.id === bundleId && b.showOnSite) ?? null;
}

/**
 * Price of one custom bag. Base = menu-board price for the size. A 2-flavor mix across price
 * tiers uses menu.customize.mixPricing ("highest" = the higher board price). Butter level has
 * no upcharge on the board, so it never changes the price.
 */
export function customUnitPrice(menu: Menu, flavorIds: string[], size: SizeId): number | null {
  if (flavorIds.length < 1 || flavorIds.length > menu.customize.maxFlavors) return null;
  const prices: number[] = [];
  for (const id of flavorIds) {
    const hit = findFlavor(menu, id);
    if (!hit || !hit.flavor.available) return null;
    const p = sizePrice(hit.category, size);
    if (p == null) return null;
    prices.push(p);
  }
  return Math.max(...prices);
}

/** Unit price for any cart item, or null if it no longer matches the menu (then it's dropped). */
export function unitPrice(menu: Menu, item: CartItem): number | null {
  if (item.kind === "flavor") {
    const hit = findFlavor(menu, item.flavorId);
    if (!hit || !hit.flavor.available) return null;
    return sizePrice(hit.category, item.size);
  }
  if (item.kind === "custom") {
    if (!menu.customize.butterLevels.some((b) => b.id === item.butter)) return null;
    return customUnitPrice(menu, item.flavorIds, item.size);
  }
  const bundle = findBundle(menu, item.bundleId);
  if (!bundle || item.flavorIds.length !== bundle.bags) return null;
  for (const id of item.flavorIds) {
    const hit = findFlavor(menu, id);
    if (!hit || !hit.flavor.available) return null;
  }
  return bundle.price;
}

export function lineTotal(menu: Menu, item: CartItem): number | null {
  const u = unitPrice(menu, item);
  return u == null ? null : u * item.qty;
}

/** Items that still match the current menu, with their prices. */
export function pricedItems(menu: Menu, items: CartItem[]) {
  const out: { item: CartItem; unit: number; total: number }[] = [];
  for (const item of items) {
    const unit = unitPrice(menu, item);
    if (unit != null) out.push({ item, unit, total: unit * item.qty });
  }
  return out;
}

export function cartTotal(menu: Menu, items: CartItem[]): number {
  return pricedItems(menu, items).reduce((n, l) => n + l.total, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

const flavorName = (menu: Menu, id: string) => findFlavor(menu, id)?.flavor.name ?? id;

/** Human title + detail lines for a cart item (used by the cart drawer and the order message). */
export function describe(menu: Menu, item: CartItem): { title: string; details: string[] } {
  if (item.kind === "flavor") {
    return { title: flavorName(menu, item.flavorId), details: [sizeLabel(menu, item.size)] };
  }
  if (item.kind === "custom") {
    const butter = menu.customize.butterLevels.find((b) => b.id === item.butter)?.label ?? item.butter;
    return {
      title: `Custom: ${item.flavorIds.map((id) => flavorName(menu, id)).join(" + ")}`,
      details: [sizeLabel(menu, item.size), `Butter: ${butter}`],
    };
  }
  const bundle = findBundle(menu, item.bundleId);
  const size = bundle ? sizeLabel(menu, bundle.size).toLowerCase() : "bag";
  return {
    title: bundle?.name ?? "Bundle",
    details: item.flavorIds.map((id, i) => `Bag ${i + 1} (${size}): ${flavorName(menu, id)}`),
  };
}

export function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** The Messenger order text: every item, size, choices, line totals and the estimated total. */
export function orderMessage(menu: Menu, items: CartItem[]): string {
  const lines = pricedItems(menu, items);
  const out = ["Hi Butter Batch! I'd like to order:", ""];
  for (const { item, unit, total } of lines) {
    const d = describe(menu, item);
    out.push(`• ${item.qty} × ${d.title} — ${money(unit)} each = ${money(total)}`);
    for (const detail of d.details) out.push(`   - ${detail}`);
  }
  out.push("", `Estimated total: ${money(cartTotal(menu, items))}`);
  out.push("(Menu-board prices — please confirm my total and a pickup time. Thanks!)");
  return out.join("\n");
}

/** Same item spec = same line (qty merges). */
export function sameSpec(a: CartItem, b: CartItem): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "flavor" && b.kind === "flavor") return a.flavorId === b.flavorId && a.size === b.size;
  if (a.kind === "custom" && b.kind === "custom")
    return a.size === b.size && a.butter === b.butter && a.flavorIds.join("|") === b.flavorIds.join("|");
  if (a.kind === "bundle" && b.kind === "bundle")
    return a.bundleId === b.bundleId && a.flavorIds.join("|") === b.flavorIds.join("|");
  return false;
}
