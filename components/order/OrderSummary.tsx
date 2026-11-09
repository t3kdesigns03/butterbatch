"use client";

import Link from "next/link";
import { useState } from "react";
import { ORDER_URL, pickupLocations } from "@/data/site";
import { cartTotal, describe, money, orderMessage, unitPrice, MAX_QTY, type OrderPrefs } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { pillClass, SizePills } from "./ui";

/**
 * Live "Your Order". No payment is taken on the site: Proceed copies the full order and opens the
 * Butter Batch Facebook page to paste it into Messenger. Tax and shipping are confirmed there —
 * no rate or shipping price is invented here.
 */
export function OrderSummary() {
  const { menu, items, prefs, setPrefs, update, remove, clear } = useCart();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const subtotal = cartTotal(menu, items);
  const message = orderMessage(menu, items, prefs, pickupLocations);
  const spot = pickupLocations.find((l) => l.id === prefs.pickupId);
  const amount = `${money(subtotal)} + tax${prefs.fulfillment === "ship" ? " + shipping" : ""}`;

  const methods: { id: OrderPrefs["payment"]; title: string; help: string; disabled?: boolean }[] = [
    { id: "messenger", title: "Messenger", help: `Send your order now. We'll confirm ${amount} and how you'd like to pay.` },
    { id: "venmo", title: "Venmo", help: `Venmo ${amount} after we confirm in Messenger. We'll share our Venmo there.` },
    {
      id: "cash",
      title: "Cash at pickup",
      help: prefs.fulfillment === "ship" ? "Not available when shipping." : `Bring ${amount} in cash when you pick up.`,
      disabled: prefs.fulfillment === "ship",
    },
  ];

  function onProceed() {
    setCopyState("idle");
    try {
      navigator.clipboard.writeText(message).then(
        () => setCopyState("copied"),
        () => setCopyState("manual"),
      );
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <section id="order" aria-labelledby="order-heading" className="py-4">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="order-heading" className="font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Your Order
        </h2>

        {items.length === 0 ? (
          <p className="mt-4 text-lg text-white/85">
            Nothing yet.{" "}
            <a href="#menu" className="font-bold text-butter">
              Pick your popcorn
            </a>{" "}
            or{" "}
            <Link href="/customize" className="font-bold text-butter">
              build your own
            </Link>
            .
          </p>
        ) : (
          // desktop: bags on the left, totals + payment + Proceed on the right (no empty sides)
          <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:items-start lg:gap-12">
            <ul className="space-y-7" aria-label="Items in your order">
              {items.map((item) => {
                const d = describe(menu, item);
                const unit = unitPrice(menu, item) ?? 0;
                return (
                  <li key={item.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-white">{d.title}</p>
                        <ul className="text-sm text-white/80">
                          {d.details.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="font-display text-xl font-bold text-butter">{money(unit * item.qty)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => (item.qty > 1 ? update(item.id, { qty: item.qty - 1 }) : remove(item.id))}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold text-royal"
                      >
                        <span aria-hidden="true">−</span>
                        <span className="sr-only">Decrease quantity of {d.title}</span>
                      </button>
                      <span className="w-7 text-center text-lg font-bold" aria-live="polite">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        disabled={item.qty >= MAX_QTY}
                        onClick={() => update(item.id, { qty: item.qty + 1 })}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-bold text-royal disabled:opacity-50"
                      >
                        <span aria-hidden="true">+</span>
                        <span className="sr-only">Increase quantity of {d.title}</span>
                      </button>
                      {item.kind === "flavor" && (
                        <div className="w-44">
                          <SizePills name={d.title} value={item.size} onChange={(s) => update(item.id, { size: s })} small />
                        </div>
                      )}
                      {item.kind === "custom" && (
                        <Link
                          href={`/customize?edit=${encodeURIComponent(item.id)}`}
                          className="inline-flex min-h-11 items-center px-2 text-sm font-bold text-butter"
                        >
                          Edit<span className="sr-only"> {d.title}</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="ml-auto inline-flex min-h-11 items-center px-2 text-sm font-bold text-butter"
                      >
                        Remove<span className="sr-only"> {d.title}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div>
              <dl className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <dt className="text-white/85">Subtotal</dt>
                  <dd className="font-bold">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/85">Tax</dt>
                  <dd className="text-white/85">Tax confirmed in Messenger</dd>
                </div>
                {prefs.fulfillment === "ship" && (
                  <div className="flex justify-between">
                    <dt className="text-white/85">Shipping</dt>
                    <dd className="text-white/85">Shipping quoted in Messenger</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-2">
                  <dt className="font-display text-2xl font-bold">Estimated total</dt>
                  <dd className="font-display text-3xl font-bold text-butter">{money(subtotal)}</dd>
                </div>
              </dl>
              <p className="mt-1 text-sm text-white/75">
                {prefs.fulfillment === "pickup"
                  ? `Lincoln pickup${spot ? ` at ${spot.name}` : " — spot confirmed in Messenger"}.`
                  : "Ship It — shipping quoted in Messenger."}{" "}
                {menu.priceNote} No payment is taken on this site.
              </p>

              <fieldset className="mt-9">
                <legend className="font-display text-2xl font-bold tracking-tight text-butter">How will you pay?</legend>
                <p className="mt-1 text-sm text-white/80">You pay after we confirm. No card details on this site.</p>
                <div role="radiogroup" aria-label="Payment method" className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {methods.map((m) => {
                    const on = prefs.payment === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={m.disabled}
                        onClick={() => setPrefs({ payment: m.id })}
                        className={pillClass(on, "min-h-24 flex-col items-start rounded-3xl px-5 py-4 text-left disabled:opacity-50 lg:min-h-0")}
                      >
                        <span className="text-lg font-extrabold">{m.title}</span>
                        <span className="mt-1 text-sm font-medium opacity-90">{m.help}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <a
                href={ORDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onProceed}
                className="mt-9 flex min-h-14 w-full items-center justify-center rounded-full bg-butter px-6 py-3 text-center text-lg leading-tight font-extrabold text-balance text-royal hover:bg-butter-light"
              >
                Proceed — copy order &amp; open Messenger
                <span className="sr-only">(opens Facebook in a new tab)</span>
              </a>
              <p className="mt-2 text-center text-sm text-white/80" aria-live="polite">
                {copyState === "copied"
                  ? "Order copied! Tap Message on our Facebook page and paste it in."
                  : copyState === "manual"
                    ? "Couldn't copy automatically — copy the order text below and paste it in Messenger."
                    : "We'll copy your order so you can paste it into Messenger."}
              </p>
              <details className="mt-2 text-sm" open={copyState === "manual"}>
                <summary className="cursor-pointer py-2 font-bold text-butter">See order text</summary>
                <textarea
                  readOnly
                  value={message}
                  onFocus={(e) => e.currentTarget.select()}
                  rows={10}
                  className="mt-1 w-full rounded-2xl bg-white p-3 font-mono text-xs text-royal"
                  aria-label="Order message"
                />
              </details>
              <button type="button" onClick={clear} className="mt-2 min-h-11 text-sm font-bold text-butter">
                Empty order
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
