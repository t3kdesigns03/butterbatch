"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Menu } from "@/data/menu";
import * as store from "@/lib/cartStore";
import { getPrefs, getPrefsServer, setPrefs, subscribePrefs } from "@/lib/orderPrefs";
import { cartCount, pricedItems, type CartItem, type OrderPrefs } from "@/lib/pricing";

type CartContext = {
  menu: Menu;
  /** Items that still match the menu (stale ones are silently skipped). */
  items: CartItem[];
  count: number;
  prefs: OrderPrefs;
  setPrefs: typeof setPrefs;
  add: typeof store.addItem;
  update: typeof store.updateItem;
  remove: typeof store.removeItem;
  clear: typeof store.clearCart;
};

const Ctx = createContext<CartContext | null>(null);

/** One shared cart + order preferences for every page (saved in this browser only). */
export function CartProvider({ menu, children }: { menu: Menu; children: ReactNode }) {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const prefs = useSyncExternalStore(subscribePrefs, getPrefs, getPrefsServer);
  const items = useMemo(() => pricedItems(menu, raw).map((l) => l.item), [menu, raw]);
  const value = useMemo<CartContext>(
    () => ({
      menu,
      items,
      count: cartCount(items),
      prefs,
      setPrefs,
      add: store.addItem,
      update: store.updateItem,
      remove: store.removeItem,
      clear: store.clearCart,
    }),
    [menu, items, prefs],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
