import Image from "next/image";
import { formatPrice, getMenu } from "@/data/menu";
import { FACEBOOK_URL } from "@/data/site";
import { ExternalIcon } from "./icons";
import { OrderButton } from "./OrderButton";

export async function Events() {
  const menu = await getMenu();
  const bundles = menu.bundles.filter((b) => b.showOnSite);

  return (
    <section id="events" aria-labelledby="events-heading" className="bg-cream py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 lg:grid-cols-2">
        <div>
          <h2 id="events-heading" className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Events &amp; game nights
          </h2>
          <p className="mt-4 text-lg text-navy/80">
            Party, fundraiser, office treat or game night? We pop for events around Lincoln. Tell us the date, how
            many people and your favorite flavors, and we&rsquo;ll put together a batch.
          </p>

          {bundles.map((b) => (
            <div
              key={b.id}
              className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-5"
            >
              <div>
                <p className="font-display text-xl font-bold tracking-tight text-navy">{b.name}</p>
                <p className="text-navy/70">{b.description}</p>
              </div>
              <p className="font-display text-3xl font-bold text-navy">{formatPrice(b.price)}</p>
            </div>
          ))}

          <h3 className="mt-8 font-display text-xl font-bold tracking-tight text-navy">Where to find us next</h3>
          <p className="mt-2 text-lg text-navy/80">
            Pop-ups and event dates are posted on our Facebook page first, so follow along there.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <OrderButton label="Plan an event" />
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-navy/20 px-6 text-base font-semibold text-navy transition-colors hover:bg-navy/5"
            >
              Follow on Facebook
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        <figure>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[1840/655]">
            <Image
              src="/photos/fresh-batch-bags.jpg"
              alt="A long table covered in Butter Batch bags of fresh popcorn — Kettle, Butter, green Caramel Apple and orange Cheddar — each with the Butter Batch label."
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <figcaption className="mt-2 text-sm text-navy/70">
            A table of fresh Butter Batch bags, labeled and ready to go. Photo: Butter Batch Popcorn Co.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
