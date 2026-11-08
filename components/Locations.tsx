import Image from "next/image";
import { mapsUrl, pickupLocations } from "@/data/site";
import { ExternalIcon, PinIcon } from "./icons";

export function Locations() {
  return (
    <section id="pickup" aria-labelledby="pickup-heading" className="surface-1 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 id="pickup-heading" className="text-center font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Pickup spots
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-white/75">
          Order in Messenger, then pick up in Lincoln. We&rsquo;ll confirm the spot and time when you order.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {pickupLocations.map((loc) => (
            <li key={loc.id} className="flex flex-col rounded-2xl surface-2 p-6 text-white">
              <div className="flex items-start gap-3">
                <PinIcon className="mt-1 h-6 w-6 shrink-0 text-white/40" />
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{loc.name}</h3>
                  <address className="mt-1 text-base not-italic text-white/75">
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
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
              >
                Get directions
                <ExternalIcon />
                <span className="sr-only">to {loc.name} (opens Google Maps in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        <figure className="mx-auto mt-10 max-w-3xl">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/store-display.jpg"
              alt="Shelves stocked with Butter Batch bags in front of a Butter Batch banner: butter, kettle, cheddar, caramel and pink-coated flavors, with a framed price list."
              fill
              sizes="(min-width: 800px) 768px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-center text-sm text-white/70">
            A Butter Batch shelf, stocked with fresh bags. Photo: Butter Batch Popcorn Co.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
