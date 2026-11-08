import { About } from "@/components/About";
import { Events } from "@/components/Events";
import { Hero } from "@/components/Hero";
import { Locations } from "@/components/Locations";
import { FlavorMenu } from "@/components/order/FlavorMenu";
import { OrderSummary } from "@/components/order/OrderSummary";
import { Specials } from "@/components/order/Specials";
import { Tour } from "@/components/tour/Tour";

export default function Home() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <Specials />
      <FlavorMenu />
      <OrderSummary />
      <section id="tour" aria-labelledby="tour-heading" className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="tour-heading" className="font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
            Take the tour
          </h2>
          <p className="mt-2 max-w-xl text-lg text-white/85">A quick look around, in our own photos.</p>
        </div>
        <div className="mt-6 px-4">
          <Tour />
        </div>
      </section>
      <Events />
      <Locations />
      <About />
    </main>
  );
}
