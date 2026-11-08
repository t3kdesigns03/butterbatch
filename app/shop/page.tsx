import type { Metadata } from "next";
import Link from "next/link";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { getMenu } from "@/data/menu";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop Butter Batch popcorn flavors in medium and large bags. Build your order, then send it to us on Messenger for pickup in Lincoln, NE.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const menu = await getMenu();
  return (
    <main id="main" className="flex-1 surface-0">
      <div className="bg-royal py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Shop</h1>
          <p className="mt-2 max-w-xl text-lg text-white/80">
            Pick your flavors and sizes, then send the order to us on Messenger. {menu.priceNote}
          </p>
          <p className="mt-3 text-sm text-white/70">
            Want something your way?{" "}
            <Link href="/customize" className="font-semibold text-butter underline underline-offset-4">
              Build my popcorn
            </Link>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <ShopGrid />
      </div>
    </main>
  );
}
