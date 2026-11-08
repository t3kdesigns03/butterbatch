import Link from "next/link";
import { OrderButton } from "./OrderButton";

const NAV = [
  { href: "/#menu", label: "Menu" },
  { href: "/#pickup", label: "Pickup" },
  { href: "/#events", label: "Events" },
  { href: "/#about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-butter bg-royal">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-h-11 items-center leading-none" aria-label="Butter Batch Popcorn Co. home">
          <span className="font-display text-xl text-butter sm:text-2xl">Butter Batch</span>
          <span className="ml-2 hidden rounded bg-ribbon px-1.5 py-0.5 font-label text-[0.7rem] font-semibold tracking-widest text-white min-[380px]:inline">
            POPCORN CO.
          </span>
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 font-label text-base uppercase tracking-wide text-white hover:bg-white/10"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <OrderButton label="Order" size="md" />
      </div>
    </header>
  );
}
