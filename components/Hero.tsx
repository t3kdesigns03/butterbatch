import Link from "next/link";
import { countCurrentFlavors, getMenu } from "@/data/menu";
import { HeroStage } from "./hero/HeroStage";
import { OrderButton } from "./OrderButton";

export async function Hero() {
  const menu = await getMenu();
  const flavorCount = countCurrentFlavors(menu);

  return (
    // Solid logo blue (#013893) so the logo artwork's edges are seamless. One focal point:
    // logo, headline, subline, two buttons.
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden bg-royal text-white">
      <HeroStage>
        <h1
          id="hero-heading"
          className="mt-4 max-w-xl font-display text-[2rem] leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl"
        >
          Small-batch popcorn, popped fresh in Lincoln
        </h1>
        <p className="mt-4 max-w-md text-lg text-white/80">
          Real butter, kettle corn, caramel corn and {flavorCount} flavors on the menu.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <OrderButton />
          <a
            href="#menu"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            See the menu
          </a>
        </div>
        {/* Shop / Customize / Tour — the three big buttons from the shop concept. Yellow + the one royal blue. */}
        <nav aria-label="Explore" className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
          <Link
            href="/shop"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-butter px-3 text-base font-bold text-royal transition-colors hover:bg-butter-light"
          >
            Shop
          </Link>
          <Link
            href="/customize"
            className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-white/70 bg-royal px-3 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            Customize
          </Link>
          <Link
            href="/tour"
            className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-white/70 bg-royal px-3 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            Tour
          </Link>
        </nav>
      </HeroStage>
    </section>
  );
}
