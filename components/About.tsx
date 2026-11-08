import Image from "next/image";

const POINTS = [
  { title: "Small batch", body: "Popped in small batches, so every bag is fresh." },
  { title: "Real butter", body: "Made with real butter, plus kettle and caramel corn." },
  { title: "Lincoln, NE", body: "Made right here in Lincoln and picked up locally." },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 md:grid-cols-[3fr_2fr]">
        <div>
          <h2 id="about-heading" className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Small batch. Real butter. Right here in Lincoln.
          </h2>
          <p className="mt-4 text-lg text-navy/80">
            Butter Batch Popcorn Co. is a small popcorn maker in Lincoln, Nebraska. We pop fresh, small batches with
            real butter, from classic butter and kettle corn to caramel corn and specialty flavors like Dill Pickle and
            Maple Bourbon Habanero.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {POINTS.map((p) => (
              <li key={p.title} className="rounded-2xl border border-navy/10 bg-cream p-5">
                <p className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-butter" />
                  {p.title}
                </p>
                <p className="mt-1 text-navy/75">{p.body}</p>
              </li>
            ))}
          </ul>
          {/* The one script accent on the site. */}
          <p className="mt-8 font-script text-2xl text-navy">Thank you for supporting small business!</p>
        </div>

        <figure className="mx-auto w-full max-w-sm">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/photos/popcorn-treat.jpg"
              alt="Close-up of a drizzled, crumble-topped Butter Batch popcorn treat in a clear clamshell, with a Butter Batch label on the lid."
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-sm text-navy/70">Photo: Butter Batch Popcorn Co.</figcaption>
        </figure>
      </div>
    </section>
  );
}
