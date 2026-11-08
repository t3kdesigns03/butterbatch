/**
 * Price-math check: runs the real cart pricing (lib/pricing.ts) against the real menu
 * (data/menu.ts) and asserts every price equals the menu-board value.
 *
 *   npm run check:pricing
 */
import { getMenu } from "../data/menu.ts";
import { cartTotal, customUnitPrice, orderMessage, sizePrice, unitPrice, type CartItem } from "../lib/pricing.ts";

const menu = await getMenu();
let failures = 0;
const check = (label: string, got: unknown, want: unknown) => {
  const ok = got === want;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: got ${String(got)}, want ${String(want)}`);
};

// 1. Every flavor × size = its category's board price.
for (const cat of menu.categories) {
  for (const f of cat.flavors) {
    for (const size of ["medium", "large"] as const) {
      const item: CartItem = { id: "t", kind: "flavor", flavorId: f.id, size, qty: 1 };
      check(`${f.name} ${size}`, unitPrice(menu, item), sizePrice(cat, size));
    }
  }
}
const classics = menu.categories.find((c) => c.id === "classics")!;
const specialty = menu.categories.find((c) => c.id === "specialty")!;
check("board: classics medium", sizePrice(classics, "medium"), 9);
check("board: classics large", sizePrice(classics, "large"), 12);
check("board: specialty medium", sizePrice(specialty, "medium"), 10);
check("board: specialty large", sizePrice(specialty, "large"), 14);

// 2. Custom bags: single flavor = board price; butter level never changes price; mixes use the higher tier.
for (const butter of ["light", "regular", "extra"] as const) {
  check(`custom Butter medium, butter=${butter}`, unitPrice(menu, { id: "c", kind: "custom", flavorIds: ["butter"], size: "medium", butter, qty: 1 }), 9);
}
check("custom Kettle large", customUnitPrice(menu, ["kettle"], "large"), 12);
check("custom Butter+Cheddar medium (classic mix)", customUnitPrice(menu, ["butter", "cheddar"], "medium"), 9);
check("custom Butter+Dill Pickle medium (cross-tier mix)", customUnitPrice(menu, ["butter", "dill-pickle"], "medium"), 10);
check("custom Kettle+Salted Caramel large (cross-tier mix)", customUnitPrice(menu, ["kettle", "salted-caramel"], "large"), 14);
check("custom 3 flavors rejected", customUnitPrice(menu, ["butter", "cheddar", "kettle"], "medium"), null);
check("custom unknown flavor rejected", customUnitPrice(menu, ["not-a-flavor"], "medium"), null);
check("toppings offered on menu", menu.customize.toppings.length, 0);

// 3. Event bundle: 2 large bags, any flavor = $20 flat.
check("bundle Butter+Maple Bourbon Habanero", unitPrice(menu, { id: "b", kind: "bundle", bundleId: "event-bundle", flavorIds: ["butter", "maple-bourbon-habanero"], qty: 1 }), 20);
check("bundle with 1 flavor rejected", unitPrice(menu, { id: "b", kind: "bundle", bundleId: "event-bundle", flavorIds: ["butter"], qty: 1 }), null);

// 4. A mixed cart total and its Messenger text.
const cart: CartItem[] = [
  { id: "1", kind: "flavor", flavorId: "butter", size: "large", qty: 2 }, // 2 × 12 = 24
  { id: "2", kind: "flavor", flavorId: "dill-pickle", size: "medium", qty: 1 }, // 10
  { id: "3", kind: "custom", flavorIds: ["kettle", "caramel-apple"], size: "medium", butter: "extra", qty: 1 }, // 10
  { id: "4", kind: "bundle", bundleId: "event-bundle", flavorIds: ["cheddar", "salted-caramel"], qty: 1 }, // 20
];
check("cart total", cartTotal(menu, cart), 64);
const msg = orderMessage(menu, cart);
for (const needle of ["2 × Butter", "Large bag", "1 × Dill Pickle", "Custom: Kettle + Caramel Apple", "Butter: Extra Butter", "Event Bundle", "Bag 1 (large bag): Cheddar", "Bag 2 (large bag): Salted Caramel", "Estimated total: $64"]) {
  check(`order text has "${needle}"`, msg.includes(needle), true);
}
console.log("\n--- order message ---\n" + msg + "\n---");

console.log(failures ? `\n${failures} FAILED` : "\nAll pricing checks passed.");
process.exit(failures ? 1 : 0);
