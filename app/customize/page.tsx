import type { Metadata } from "next";
import { Suspense } from "react";
import { Customizer } from "@/components/customize/Customizer";

export const metadata: Metadata = {
  title: "Build My Popcorn",
  description: "Build your own Butter Batch popcorn: pick a size, up to two flavors and your butter level, then send the order to us on Messenger.",
  alternates: { canonical: "/customize" },
};

export default function CustomizePage() {
  return (
    <main id="main" className="flex-1 surface-0">
      <div className="bg-royal py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Build My Popcorn</h1>
          <p className="mt-2 max-w-xl text-lg text-white/80">
            Pick a size, up to two flavors and how buttery you like it. Prices are straight from our menu board.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Suspense fallback={<p className="text-white/70">Loading the popcorn builder…</p>}>
          <Customizer />
        </Suspense>
      </div>
    </main>
  );
}
