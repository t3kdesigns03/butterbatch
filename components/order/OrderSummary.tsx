"use client";

import Link from "next/link";
import { useState, type ComponentType } from "react";
import { ORDER_URL, pickupLocations } from "@/data/site";
import { cartTotal, describe, money, orderMessage, unitPrice, MAX_QTY, type OrderPrefs } from "@/lib/pricing";
import { useCart } from "../cart/CartProvider";
import { CashIcon, ChatIcon, CheckIcon, VenmoIcon } from "../icons";
import { SizePills } from "./ui";

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

  const methods: { id: OrderPrefs["payment"]; title: string; help: string; icon: ComponentType<{ className?: string }>; disabled?: boolean }[] = [
    { id: "messenger", title: "Messenger", help: "Send your order now.", icon: ChatIcon },
    { id: "venmo", title: "Venmo", help: "We'll share our Venmo there.", icon: VenmoIcon },
    {
      id: "cash",
      title: "Cash at pickup",
      help: prefs.fulfillment === "ship" ? "Not available when shipping." : "Bring cash when you pick up.",
      icon: CashIcon,
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
                <p className="mt-2 text-sm leading-relaxed text-pretty text-white/80">
                  You pay after we confirm — {amount}. No card details on this site.
                </p>
                <div role="radiogroup" aria-label="Payment method" className="mt-4 grid gap-3">
                  {methods.map((m) => {
                    const on = prefs.payment === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={m.disabled}
                        onClick={() => setPrefs({ payment: m.id })}
                        className={`flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                          on ? "bg-butter-light text-royal" : "bg-white text-royal"
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden="true">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-base ${on ? "font-extrabold" : "font-bold"}`}>{m.title}</span>
                          <span className="mt-0.5 block text-sm font-medium opacity-90">{m.help}</span>
                        </span>
                        {on && <CheckIcon className="h-6 w-6 shrink-0" />}
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
                className="mt-9 flex min-h-14 w-full items-center justify-center rounded-full bg-butter px-6 py-3 text-center text-lg leading-tight font-black text-balance text-royal hover:bg-butter-light"
              >
                <span>
                  Proceed — copy order &amp; open Messenger
                  <span aria-hidden="true">{" "}→</span>
                </span>
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
              <button type="button" onClick={clear} className="mt-2 min-h-11 text-sm font-semibold text-white/60 hover:text-butter">
                Clear order
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
