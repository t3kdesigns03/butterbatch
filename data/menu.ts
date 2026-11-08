/**
 * Butter Batch menu — the ONE source of truth for flavors, sizes, prices and availability.
 *
 * Phase 1: static data transcribed from the menu board in the repo (Menu1.jpg, dated Sept 2, 2026).
 * Phase 3: the admin panel replaces the body of `getMenu()` with a database read. Components
 * only ever call `getMenu()`, so nothing else needs to change.
 *
 * Prices are whole US dollars as printed on the menu board. See PRICE NOTE below.
 */

export type SizeId = "medium" | "large";

export type SizePrice = {
  size: SizeId;
  label: string;
  /** Price in US dollars, as printed on the menu board. */
  price: number;
};

export type Flavor = {
  id: string;
  name: string;
  /** false = temporarily out. Shown as "Out right now" instead of being hidden. */
  available: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  blurb: string;
  prices: SizePrice[];
  flavors: Flavor[];
};

export type Bundle = {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Only rendered on the site when true. */
  showOnSite: boolean;
  /** Where this item came from, for whoever maintains the menu. */
  source: string;
};

export type RotatingItem = {
  id: string;
  name: string;
  price?: number;
  /**
   * "unconfirmed" items are seen on Facebook but NOT on the current menu board.
   * They are never rendered until the owner confirms them as current.
   */
  status: "unconfirmed" | "current";
  note?: string;
};

export type Menu = {
  /** ISO date of the menu board this data was transcribed from. */
  effectiveDate: string;
  source: string;
  currency: "USD";
  priceNote: string;
  categories: MenuCategory[];
  bundles: Bundle[];
  rotating: RotatingItem[];
};

const flavor = (name: string, available = true): Flavor => ({
  id: name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, ""),
  name,
  available,
});

/*
 * PRICE NOTE: an Oct 2026 Facebook video shows $9.85 / $13.13 for classics, which may be
 * tax-included. Not confirmed. v1 uses the menu-board prices below until the owner confirms.
 */
const MENU: Menu = {
  effectiveDate: "2026-09-02",
  source: "Menu board (Menu1.jpg)",
  currency: "USD",
  priceNote:
    "Prices are from our September 2026 menu board and may change. We confirm your total when you order in Messenger.",
  categories: [
    {
      id: "classics",
      name: "Classics",
      blurb: "The ones that started it all.",
      prices: [
        { size: "medium", label: "Medium bag", price: 9 },
        { size: "large", label: "Large bag", price: 12 },
      ],
      flavors: [flavor("Butter"), flavor("Cheddar"), flavor("Kettle")],
    },
    {
      id: "specialty",
      name: "Specialty Flavors",
      blurb: "Sweet, savory, spicy and a little bit wild.",
      prices: [
        { size: "medium", label: "Medium bag", price: 10 },
        { size: "large", label: "Large bag", price: 14 },
      ],
      flavors: [
        flavor("Parmesan Garlic"),
        flavor("Dill Pickle"),
        flavor("Hot Honey BBQ"),
        flavor("Spicy Dill"),
        flavor("Caramel Apple"),
        flavor("Maple Bourbon Habanero"),
        flavor("Jalapeño Cheddar"),
        flavor("Salted Caramel"),
        flavor("Loaded Baked Potato"),
        flavor("Cheddar Caramel Craze"),
      ],
    },
  ],
  bundles: [
    {
      id: "event-bundle",
      name: "Event Bundle",
      description: "2 large bags, any flavor",
      price: 20,
      // Not on Menu1.jpg — from the business's Sept 2026 Facebook menu post. Owner to confirm.
      showOnSite: true,
      source: "Facebook menu post, Sept 2, 2026 (not on Menu1.jpg)",
    },
  ],
  rotating: [
    { id: "cheddar-pretzel-ale", name: "Cheddar Pretzel Ale", status: "unconfirmed" },
    { id: "cinnadust-kettle", name: "Cinnadust Kettle", status: "unconfirmed" },
    {
      id: "spectrum-crunch",
      name: "Spectrum Crunch",
      status: "unconfirmed",
      note: "Rainbow popcorn seen on a pop-up table sign ($10) and a bag label; not on the menu board",
    },
    { id: "popcorn-balls", name: "Popcorn Balls", price: 7.66, status: "unconfirmed" },
    {
      id: "chocolate-dipped-strawberry",
      name: "Chocolate Dipped Strawberry",
      status: "unconfirmed",
      note: "Seasonal",
    },
  ],
};

/**
 * The only way components read the menu. Swap the body for a DB/API call in Phase 3.
 */
export async function getMenu(): Promise<Menu> {
  "use cache";
  return MENU;
}

export function formatPrice(dollars: number): string {
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

export function countCurrentFlavors(menu: Menu): number {
  return menu.categories.reduce((n, c) => n + c.flavors.length, 0);
}
