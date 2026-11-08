import Image from "next/image";
import { mapsUrl, pickupLocations } from "@/data/site";
import { ExternalIcon, PinIcon } from "./icons";

export function Locations() {
  return (
    <section id="pickup" aria-labelledby="pickup-heading" className="bg-royal py-14 text-white sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <h2 id="pickup-heading" className="text-center font-display text-4xl text-butter sm:text-5xl">
          Pickup spots
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-white/90">
          Order in Messenger, then pick up in Lincoln. We&rsquo;ll confirm the spot and time when you order.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {pickupLocations.map((loc) => (
            <li key={loc.id} className="flex flex-col rounded-2xl bg-parchment p-6 text-navy shadow-lg">
              <div className="flex items-start gap-3">
                <PinIcon className="mt-1 h-7 w-7 shrink-0 text-ribbon" />
                <div>
                  <h3 className="font-label text-2xl font-semibold uppercase tracking-wide">{loc.name}</h3>
                  <address className="mt-1 text-lg not-italic text-ink">
                    {loc.street}
                    <br />
                    {loc.cityLine}
                  </address>
                </div>
              </div>
              <a
                href={mapsUrl(loc)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-navy px-5 font-label text-base font-semibold uppercase tracking-wide text-white hover:bg-royal"
              >
                Get directions
                <ExternalIcon />
                <span className="sr-only">to {loc.name} (opens Google Maps in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <figure className="mx-auto mt-10 max-w-3xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-butter shadow-lg">
            <Image
              src="/photos/store-display.jpg"
              alt="Shelves stocked with Butter Batch bags in front of a Butter Batch banner: butter, kettle, cheddar, caramel and pink-coated flavors, with a framed price list."
              fill
              sizes="(min-width: 800px) 768px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-center text-sm text-white/80">
            A Butter Batch shelf, stocked with fresh bags. Photo: Butter Batch Popcorn Co.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
