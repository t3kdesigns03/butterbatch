import type { Metadata } from "next";
import { FlavorMenu } from "@/components/order/FlavorMenu";
import { OrderSummary } from "@/components/order/OrderSummary";
import { Specials } from "@/components/order/Specials";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop all 13 Butter Batch popcorn flavors in medium and large bags, build a box of 6, then send your order to us on Messenger for pickup in Lincoln, NE.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">Shop</h1>
      </div>
      <Specials />
      <FlavorMenu />
      <OrderSummary />
    </main>
  );
}
