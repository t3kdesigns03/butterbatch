"use client";

import { useSyncExternalStore } from "react";
import { events, type PopEvent } from "@/data/events";
import { FACEBOOK_URL } from "@/data/site";
import { ExternalIcon } from "./icons";
import { OrderButton } from "./OrderButton";

/**
 * Events — rendered ONLY from data/events.ts (events the business published itself).
 * Past events drop off on the visitor's device; nothing is ever invented.
 */
const TZ = "America/Chicago";
const nowHour = () => Math.floor(Date.now() / 3_600_000);
const subscribeNoop = () => () => {};

function endOf(e: PopEvent) {
  if (e.end) return Date.parse(e.end);
  // no end time published: keep it listed through the end of that day in Lincoln
  return Date.parse(e.start) + 24 * 3_600_000;
}
const dayFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
const shortFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" });

export function Events() {
  // null on the server (all events from the file at build time); the visitor's clock after hydration
  const hour = useSyncExternalStore(subscribeNoop, nowHour, () => null);
  const upcoming = events
    .filter((e) => hour === null || endOf(e) > hour * 3_600_000)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const [next, ...rest] = upcoming;

  return (
    <section id="events" aria-labelledby="events-heading" className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="events-heading" className="font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Events &amp; pop-ups
        </h2>

        {next ? (
          <>
            <div className="mt-6">
              <span className="rounded-full bg-butter px-3 py-1 text-xs font-extrabold tracking-wider text-royal uppercase">Next stop</span>
              <p className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">{next.title}</p>
              <p className="mt-2 text-xl text-white/90">
                <time dateTime={next.start}>
                  {dayFmt.format(new Date(next.start))} · {timeFmt.format(new Date(next.start))}
                </time>
              </p>
              <p className="text-lg text-white/85">
                {next.venue}, {next.city}
              </p>
              <a
                href={next.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-bold text-royal hover:bg-butter-light"
              >
                Event details on Facebook <ExternalIcon />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
            {rest.length > 0 && (
              <ul className="mt-10 space-y-4" aria-label="More upcoming events">
                {rest.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline gap-x-4">
                    <time dateTime={e.start} className="w-24 font-display text-xl font-bold text-butter">
                      {shortFmt.format(new Date(e.start))}
                    </time>
                    <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-white">
                      {e.title}
                    </a>
                    <span className="text-white/80">
                      {timeFmt.format(new Date(e.start))} · {e.venue}, {e.city}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="mt-4 max-w-xl text-lg text-white/85">Pop-ups are announced on Facebook first — follow along there.</p>
        )}

        <div className="mt-10">
          <p className="max-w-xl text-lg text-white/85">
            Party, fundraiser, office treat or game night? Tell us the date, how many people and your favorite flavors.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <OrderButton label="Plan an event" />
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-royal hover:bg-butter-light"
            >
              Follow on Facebook <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
