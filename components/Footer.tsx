import Link from "next/link";
import { FACEBOOK_URL, pickupLocations, site } from "@/data/site";
import { ExternalIcon } from "./icons";
import { OrderButton } from "./OrderButton";

async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await copyrightYear();
  return (
    <footer className="bg-royal-deep text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="font-display text-3xl text-butter sm:text-4xl">Message us to order</p>
        <p className="mx-auto mt-2 max-w-md text-lg text-white/90">
          Send us your flavors and sizes on Facebook Messenger and we&rsquo;ll confirm pickup.
        </p>
        <div className="mt-6 flex justify-center">
          <OrderButton />
        </div>

        <div className="mt-10 grid gap-6 border-t border-white/15 pt-8 text-left sm:grid-cols-3">
          <div>
            <p className="font-label text-lg font-semibold uppercase tracking-wide text-butter">{site.name}</p>
            <p className="mt-1 text-white/85">Lincoln, Nebraska</p>
          </div>
          <div>
            <p className="font-label text-lg font-semibold uppercase tracking-wide text-butter">Pickup</p>
            <ul className="mt-1 space-y-1 text-white/85">
              {pickupLocations.map((l) => (
                <li key={l.id}>{l.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-label text-lg font-semibold uppercase tracking-wide text-butter">Follow along</p>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex min-h-11 items-center gap-2 text-white underline underline-offset-4 hover:text-butter-light"
            >
              Butter Batch on Facebook
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-6 text-sm text-white/75 sm:flex-row">
          <p>
            &copy; {year} {site.name}. Prices may change.
          </p>
          <Link href="/privacy" className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 underline underline-offset-4 hover:text-white">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
