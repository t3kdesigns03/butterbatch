import Image from "next/image";
import { formatPrice, getMenu, type MenuCategory } from "@/data/menu";

function CategoryCard({ category }: { category: MenuCategory }) {
  const headingId = `menu-${category.id}`;
  const twoCol = category.flavors.length > 5;
  return (
    <article aria-labelledby={headingId} className="rounded-2xl border border-white/10 surface-2 p-6 sm:p-8">
      <h3 id={headingId} className="font-display text-2xl font-bold tracking-tight text-white">
        {category.name}
      </h3>
      <p className="mt-1 text-white/70">{category.blurb}</p>

      <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {category.prices.map((p) => (
          <div key={p.size} className="flex items-baseline justify-between py-3">
            <dt className="text-white/80">{p.label}</dt>
            <dd className="font-display text-2xl font-bold text-butter">{formatPrice(p.price)}</dd>
          </div>
        ))}
      </dl>

      <ul className={`mt-5 grid gap-x-6 gap-y-2 ${twoCol ? "sm:grid-cols-2" : ""}`} aria-label={`${category.name} flavors`}>
        {category.flavors.map((f) => (
          <li key={f.id} className="flex min-h-8 items-center gap-2 text-white">
            <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${f.available ? "bg-butter" : "bg-white/20"}`} />
            <span className={f.available ? "" : "text-white/65 line-through"}>{f.name}</span>
            {!f.available && <span className="text-xs text-white/65">Out right now</span>}
          </li>
        ))}
      </ul>
    </article>
  );
}

export async function MenuSection() {
  const menu = await getMenu();
  return (
    <section id="menu" aria-labelledby="menu-heading" className="surface-0 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 id="menu-heading" className="text-center font-display text-4xl font-bold tracking-tight text-butter sm:text-5xl">
          Menu
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-lg text-white/75">
          Every bag is popped fresh in small batches. Pick a flavor, pick a size, then message us to order.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_3fr]">
          {menu.categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-2 text-center text-sm text-white/75">
          <p>{menu.priceNote}</p>
          <p>Seasonal and rotating flavors pop up too. Ask us in Messenger what&rsquo;s fresh this week.</p>
          <p>
            <strong className="font-semibold text-white">Allergens:</strong> we use real butter, and many flavors contain
            milk or cheese. Please ask us about ingredients and allergens before you order.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-8 sm:grid-cols-2">
          <figure>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src="/photos/cheddar-caramel-craze.jpg"
                alt="A tall clear bag of Butter Batch Cheddar Caramel Craze popcorn, orange cheddar and caramel coated, with the flavor label and Butter Batch sticker."
                fill
                sizes="(min-width: 640px) 320px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-center text-sm text-white/70">
              Cheddar Caramel Craze, bagged fresh. Photo: Butter Batch Popcorn Co.
            </figcaption>
          </figure>
          <figure>
            <a
              href="/photos/menu-board.jpg"
              target="_blank"
              rel="noopener"
              className="block overflow-hidden rounded-2xl border border-white/10"
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
            <figcaption className="mt-2 text-center text-sm text-white/70">
              Our printed menu board, Sept 2026. Tap to enlarge.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
