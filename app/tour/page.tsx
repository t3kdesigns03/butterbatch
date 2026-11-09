import type { Metadata } from "next";
import { Tour } from "@/components/tour/Tour";

export const metadata: Metadata = {
  title: "Tour",
  description: "Take a quick photo tour of Butter Batch Popcorn Co.: the shelf, a fresh batch, our Lincoln pickup spots, and events.",
  alternates: { canonical: "/tour" },
};

export default function TourPage() {
  return (
    <main id="main" className="flex-1">
      <div className="pt-4 pb-2 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Tour</h1>
          <p className="mt-2 max-w-xl text-lg text-white/80">A quick look around, in our own photos. Swipe or use the arrows.</p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-4">
        <Tour />
      </div>
    </main>
  );
}
