/**
 * Order preferences (pickup vs ship, pickup spot, payment method), saved in this browser only.
 * Validated on load; nothing here affects a price.
 */
import { DEFAULT_PREFS, type OrderPrefs } from "./pricing";

const KEY = "bb-order-prefs-v1";
let prefs: OrderPrefs = DEFAULT_PREFS;
let loaded = false;
const listeners = new Set<() => void>();

function sanitize(raw: unknown): OrderPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
  const o = raw as Record<string, unknown>;
  return {
    fulfillment: o.fulfillment === "ship" ? "ship" : "pickup",
    pickupId: typeof o.pickupId === "string" && o.pickupId.length < 60 ? o.pickupId : null,
    payment: o.payment === "venmo" || o.payment === "cash" ? o.payment : "messenger",
  };
}

function load() {
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    prefs = raw ? sanitize(JSON.parse(raw)) : DEFAULT_PREFS;
  } catch {
    prefs = DEFAULT_PREFS;
  }
}

export function subscribePrefs(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getPrefs(): OrderPrefs {
  if (!loaded) load();
  return prefs;
}
export function getPrefsServer(): OrderPrefs {
  return DEFAULT_PREFS;
}
export function setPrefs(patch: Partial<OrderPrefs>) {
  prefs = sanitize({ ...getPrefs(), ...patch });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // storage blocked: prefs still work for this page view
  }
  for (const l of listeners) l();
}
