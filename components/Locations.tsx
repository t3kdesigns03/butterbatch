import Image from "next/image";
import { mapsUrl, pickupLocations } from "@/data/site";
import { ExternalIcon, PinIcon } from "./icons";

export function Locations() {
  return (
    <section id="pickup" aria-labelledby="pickup-heading" className="py-4 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="pickup-heading" className="font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Pickup spots
        </h2>
        <p className="mt-2 max-w-xl text-lg text-white/85">
          Order in Messenger, then pick up in Lincoln. We&rsquo;ll confirm the spot and time when you order.
        </p>
        <div className="mt-6 grid items-start gap-8 md:grid-cols-2">
          <ul className="space-y-8">
            {pickupLocations.map((loc) => (
              <li key={loc.id} className="flex items-start gap-3">
                <PinIcon className="mt-1 h-6 w-6 shrink-0 text-butter" />
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{loc.name}</h3>
                  <address className="mt-1 text-lg not-italic text-white/85">
                    {loc.street}
                    <br />
                    {loc.cityLine}
                  </address>
                  <a
                    href={mapsUrl(loc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-royal hover:bg-butter-light"
                  >
                    Get directions
                    <ExternalIcon />
                    <span className="sr-only">to {loc.name} (opens Google Maps in a new tab)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/photos/store-display.jpg"
                alt="Shelves stocked with real Butter Batch bags in front of a Butter Batch banner: butter, kettle, cheddar, caramel and pink-coated flavors, with a framed price list."
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-white/75">A Butter Batch shelf, stocked with fresh bags. Photo: Butter Batch Popcorn Co.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
