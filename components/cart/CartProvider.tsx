"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Menu } from "@/data/menu";
import * as store from "@/lib/cartStore";
import { cartCount, pricedItems, type CartItem } from "@/lib/pricing";
import { CartDrawer } from "./CartDrawer";

type CartContext = {
  menu: Menu;
  /** Items that still match the menu (stale ones are silently skipped). */
  items: CartItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: typeof store.addItem;
  update: typeof store.updateItem;
  remove: typeof store.removeItem;
  clear: typeof store.clearCart;
};

const Ctx = createContext<CartContext | null>(null);

export function CartProvider({ menu, children }: { menu: Menu; children: ReactNode }) {
  const raw = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const items = useMemo(() => pricedItems(menu, raw).map((l) => l.item), [menu, raw]);
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo<CartContext>(
    () => ({
      menu,
      items,
      count: cartCount(items),
      isOpen,
      open,
      close,
      add: store.addItem,
      update: store.updateItem,
      remove: store.removeItem,
      clear: store.clearCart,
    }),
    [menu, items, isOpen, open, close],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
