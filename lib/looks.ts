import type { Look } from "../data/menu";

/** Illustrative colours per flavor look (bag renders + Customize bucket). Not product photos. */
export const LOOKS: Record<Look, { light: string; base: string; dark: string; name: string }> = {
  butter: { light: "#fffaf0", base: "#fbe7b0", dark: "#e3b257", name: "buttery white" },
  kettle: { light: "#fff3cf", base: "#f2cf7c", dark: "#c98d2c", name: "golden kettle" },
  caramel: { light: "#f6c37a", base: "#d8852e", dark: "#985018", name: "amber caramel" },
  cheddar: { light: "#ffd27a", base: "#f7931e", dark: "#c45f07", name: "orange cheddar" },
  apple: { light: "#e3f39c", base: "#9fcf45", dark: "#5f8f1f", name: "green caramel apple" },
};

/** Deterministic 0..1 sequence from a string, so renders are stable between server and client. */
export function seeded(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
