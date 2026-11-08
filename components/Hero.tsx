import { countCurrentFlavors, getMenu } from "@/data/menu";
import { HeroStage } from "./hero/HeroStage";
import { OrderButton } from "./OrderButton";

export async function Hero() {
  const menu = await getMenu();
  const flavorCount = countCurrentFlavors(menu);

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-royal text-white"
      style={{
        // Solid logo blue (#013893) all around the logo so its edges are seamless; deepens only far out.
        backgroundImage: "radial-gradient(ellipse farthest-corner at 50% 40%, #013893 68%, #002670 100%)",
      }}
    >
      <HeroStage>
        <div className="mt-1 flex max-w-xl flex-col items-center text-center">
          <h1
            id="hero-heading"
            className="font-display text-[1.7rem] leading-tight text-butter sm:text-4xl"
          >
            Small-batch popcorn, popped fresh in Lincoln, Nebraska
          </h1>
          <p className="mt-3 text-lg text-white/90">
            Real butter. Kettle corn, caramel corn and {flavorCount} flavors on the menu.
          </p>
          <div data-keepout className="mt-6 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <OrderButton />
            <a
              href="#menu"
              className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-white/80 px-7 font-label text-lg font-semibold uppercase tracking-wide text-white hover:bg-white/10"
            >
              See the menu
            </a>
          </div>
          <p className="mt-4 text-sm text-white/80">Local pickup in Lincoln · Events &amp; game nights</p>
        </div>
      </HeroStage>
    </section>
  );
}
