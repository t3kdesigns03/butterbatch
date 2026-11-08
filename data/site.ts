/**
 * Business details used across the site. Keep contact links and locations here, not in components.
 */

export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61578397396449";

/**
 * Phase 1 ordering = Facebook Messenger. Their Page is a profile.php?id= page, so we link the
 * Page itself (which has the Message button). If they set a Page username later, this can become
 * https://m.me/<username> to open Messenger directly.
 */
export const ORDER_URL = FACEBOOK_URL;

export const site = {
  name: "Butter Batch Popcorn Co.",
  shortName: "Butter Batch",
  tagline: "Small-batch popcorn, popped fresh in Lincoln, Nebraska.",
  description:
    "Butter Batch Popcorn Co. makes small-batch, fresh-popped popcorn in Lincoln, NE — real butter, kettle corn, caramel corn and specialty flavors. Message us on Facebook to order for local pickup or your next event.",
  city: "Lincoln",
  region: "NE",
  postalCode: "68506",
  country: "US",
} as const;

export type PickupLocation = {
  id: string;
  name: string;
  street: string;
  cityLine: string;
};

/** From the "Find us at" panel on the menu board (Menu1.jpg). */
export const pickupLocations: PickupLocation[] = [
  {
    id: "creative-collabs-collective",
    name: "Creative Collabs Collective",
    street: "1601 Normandy Ct",
    cityLine: "Lincoln, NE 68512",
  },
  {
    id: "kt-designs",
    name: "KT Designs",
    street: "6100 O St, Ste 310",
    cityLine: "Lincoln, NE 68505",
  },
];

export function mapsUrl(loc: PickupLocation): string {
  const q = encodeURIComponent(`${loc.name}, ${loc.street}, ${loc.cityLine}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** Canonical site URL. Netlify sets URL at build time; falls back to localhost for dev. */
export function siteUrl(): URL {
  const raw = process.env.SITE_URL || process.env.URL || "http://localhost:3000";
  return new URL(raw);
}
