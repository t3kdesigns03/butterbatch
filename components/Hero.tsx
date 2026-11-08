import Image from "next/image";
import Link from "next/link";
import { countCurrentFlavors, getMenu } from "@/data/menu";
import { HeroStage } from "./hero/HeroStage";

export async function Hero() {
  const menu = await getMenu();
  const flavorCount = countCurrentFlavors(menu);
  const pills = ["Real Butter", "Small Batch", `${flavorCount} Flavors`, "Lincoln Pickup", "Events"];

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden text-white">
      <HeroStage>
        <h1 id="hero-heading" className="font-display text-[2.6rem] leading-[1.02] font-bold tracking-tight sm:text-6xl">
          Pop Your Corn, <span className="text-butter">every day.</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-white/85">
          Small-batch popcorn made with real butter in Lincoln, Nebraska. Tap to add your bags, then send the order to
          us in Messenger. Pay when you pick up.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Why Butter Batch">
          {pills.map((p) => (
            <li key={p} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-royal">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#menu"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-butter px-7 text-base font-bold text-royal hover:bg-butter-light"
          >
            Start your order
          </a>
          <Link
            href="/customize"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-base font-bold text-royal hover:bg-butter-light"
          >
            Build My Popcorn
          </Link>
        </div>
        <figure className="mt-8">
          <div className="relative aspect-[1840/655] overflow-hidden rounded-2xl">
            <Image
              src="/photos/fresh-batch-bags.jpg"
              alt="A long table covered in real Butter Batch bags of fresh popcorn — Kettle, Butter, green Caramel Apple and orange Cheddar — each with the Butter Batch label."
              fill
              sizes="(min-width: 768px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-sm text-white/70">A fresh batch, bagged and labeled. Photo: Butter Batch Popcorn Co.</figcaption>
        </figure>
      </HeroStage>
    </section>
  );
}
