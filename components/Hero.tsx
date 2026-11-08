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
      </HeroStage>
    </section>
  );
}
