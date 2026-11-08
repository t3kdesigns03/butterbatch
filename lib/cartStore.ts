/**
 * The one shared cart, persisted in this browser's localStorage only (never sent anywhere).
 * Stores item SPECS (flavor ids, sizes, choices, qty) — never prices. Prices are always
 * recomputed from data/menu.ts at render, so a tampered or stale cart can't change a price.
 */
import { MAX_QTY, sameSpec, type CartItem, type CartItemPatch, type NewCartItem } from "./pricing";

const KEY = "bb-cart-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 80;
const isSize = (v: unknown) => v === "medium" || v === "large";

/** Accept only well-formed items; anything else in storage is ignored. */
function sanitize(raw: unknown): CartItem[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { items?: unknown }).items)) return EMPTY;
  const out: CartItem[] = [];
  for (const r of (raw as { items: unknown[] }).items.slice(0, 50)) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const qty = typeof o.qty === "number" && Number.isInteger(o.qty) ? Math.min(MAX_QTY, Math.max(1, o.qty)) : 0;
    if (!isStr(o.id) || !qty) continue;
    const ids = Array.isArray(o.flavorIds) && o.flavorIds.every(isStr) ? (o.flavorIds as string[]).slice(0, 4) : null;
    if (o.kind === "flavor" && isStr(o.flavorId) && isSize(o.size)) {
      out.push({ id: o.id, kind: "flavor", flavorId: o.flavorId, size: o.size as "medium" | "large", qty });
    } else if (o.kind === "custom" && ids && isSize(o.size) && (o.butter === "light" || o.butter === "regular" || o.butter === "extra")) {
      out.push({ id: o.id, kind: "custom", flavorIds: ids, size: o.size as "medium" | "large", butter: o.butter, qty });
    } else if (o.kind === "bundle" && isStr(o.bundleId) && ids) {
      out.push({ id: o.id, kind: "bundle", bundleId: o.bundleId, flavorIds: ids, qty });
    }
  }
  return out;
}

function load() {
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    items = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    items = EMPTY; // storage blocked (private mode etc.) — cart still works for this page view
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: 1, items }));
  } catch {
    // ignore: storage full/blocked
  }
}

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  if (e.key === KEY) {
    load();
    emit();
  }
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartItem[] {
  if (!loaded) load();
  return items;
}

export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function set(next: CartItem[]) {
  items = next;
  save();
  emit();
}

function newId() {
  return `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Add an item (without id); merges into an existing line with the same spec. */
export function addItem(spec: NewCartItem): void {
  const current = getSnapshot();
  const candidate = { ...spec, id: newId() } as CartItem;
  const existing = current.find((i) => sameSpec(i, candidate));
  if (existing) {
    set(current.map((i) => (i === existing ? { ...i, qty: Math.min(MAX_QTY, i.qty + candidate.qty) } : i)));
  } else {
    set([...current, candidate]);
  }
}

export function updateItem(id: string, patch: CartItemPatch): void {
  set(
    getSnapshot().map((i) => {
      if (i.id !== id) return i;
      const next = { ...i, ...patch } as CartItem;
      next.qty = Math.min(MAX_QTY, Math.max(1, Math.round(next.qty)));
      return next;
    }),
  );
}

export function removeItem(id: string): void {
  set(getSnapshot().filter((i) => i.id !== id));
}

export function clearCart(): void {
  set(EMPTY);
}
