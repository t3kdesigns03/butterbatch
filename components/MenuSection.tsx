import Image from "next/image";
import { formatPrice, getMenu, type MenuCategory } from "@/data/menu";
import { StarIcon } from "./icons";

function CategoryCard({ category, tone }: { category: MenuCategory; tone: "navy" | "red" }) {
  const ribbon = tone === "navy" ? "bg-navy" : "bg-ribbon-dark";
  const headingId = `menu-${category.id}`;
  return (
    <article aria-labelledby={headingId} className="rounded-2xl border-2 border-navy/15 bg-white/60 p-5 shadow-sm sm:p-7">
      <div className="text-center">
        <h3 id={headingId} className={`ribbon ${ribbon} font-display text-lg tracking-wider whitespace-nowrap uppercase sm:text-2xl`}>
          <StarIcon className="h-4 w-4 text-butter" />
          {category.name}
          <StarIcon className="h-4 w-4 text-butter" />
        </h3>
        <p className="mt-2 font-script text-xl text-ribbon-dark">{category.blurb}</p>
      </div>

      <dl className="mx-auto mt-5 grid max-w-sm grid-cols-2 divide-x-2 divide-navy/15 text-center">
        {category.prices.map((p) => (
          <div key={p.size} className="px-2">
            <dt className="font-label text-sm font-semibold uppercase tracking-wider text-ribbon-dark">{p.label}</dt>
            <dd className="font-display text-5xl leading-none text-navy sm:text-6xl">{formatPrice(p.price)}</dd>
          </div>
        ))}
      </dl>

      <ul
        className={`mt-6 grid gap-x-8 ${category.flavors.length > 5 ? "sm:grid-cols-2" : ""}`}
        aria-label={`${category.name} flavors`}
      >
        {category.flavors.map((f) => (
          <li
            key={f.id}
            className="flex min-h-11 items-center justify-between gap-3 border-b-2 border-dotted border-navy/25 font-label text-lg font-medium uppercase tracking-wide text-navy"
          >
            <span className={f.available ? "" : "text-navy/50 line-through"}>{f.name}</span>
            {!f.available && (
              <span className="shrink-0 rounded-full bg-navy/10 px-2 py-0.5 text-xs normal-case tracking-normal text-navy">
                Out right now
              </span>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}

export async function MenuSection() {
  const menu = await getMenu();
  return (
    <section id="menu" aria-labelledby="menu-heading" className="paper py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-center gap-4">
          <span aria-hidden="true" className="h-[3px] w-10 rounded bg-navy sm:w-24" />
          <h2 id="menu-heading" className="font-display text-5xl tracking-wide text-navy uppercase sm:text-6xl">
            Menu
          </h2>
          <span aria-hidden="true" className="h-[3px] w-10 rounded bg-navy sm:w-24" />
        </div>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg">
          Every bag is popped fresh in small batches. Pick a flavor, pick a size, then message us to order.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_3fr]">
          {menu.categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} tone={i % 2 === 0 ? "navy" : "red"} />
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-2 text-center text-base text-ink/85">
          <p>{menu.priceNote}</p>
          <p>
            Seasonal and rotating flavors pop up too. Ask us in Messenger what&rsquo;s fresh this week.
          </p>
          <p>
            <strong>Allergens:</strong> we use real butter, and many flavors contain milk or cheese. Please ask us about
            ingredients and allergens before you order.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl gap-8 sm:grid-cols-2">
        <figure>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-white shadow-md">
            <Image
              src="/photos/cheddar-caramel-craze.jpg"
              alt="A tall clear bag of Butter Batch Cheddar Caramel Craze popcorn, orange cheddar and caramel coated, with the flavor label and Butter Batch sticker."
              fill
              sizes="(min-width: 640px) 320px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-center text-sm text-ink/80">
            Cheddar Caramel Craze, bagged fresh. Photo: Butter Batch Popcorn Co.
          </figcaption>
        </figure>
        <figure>
          <a
            href="/photos/menu-board.jpg"
            target="_blank"
            rel="noopener"
            className="block overflow-hidden rounded-xl border-4 border-white shadow-md"
          >
            <Image
              src="/photos/menu-board.jpg"
              alt="The Butter Batch printed menu board: Classics $9 medium, $12 large; Specialty Flavors $10 medium, $14 large; pickup at Creative Collabs Collective and KT Designs."
              width={1024}
              height={1535}
              sizes="320px"
              className="h-auto w-full"
            />
            <span className="sr-only">(opens full-size menu board image in a new tab)</span>
          </a>
          <figcaption className="mt-2 text-center text-sm text-ink/80">Our printed menu board, Sept 2026. Tap to enlarge.</figcaption>
        </figure>
        </div>
      </div>
    </section>
  );
}
