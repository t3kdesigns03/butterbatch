import Link from "next/link";

// Dark 404 so no page on the site falls back to Next's default white screen.
export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center surface-0 px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight text-butter">Page not found</h1>
      <p className="mt-3 text-lg text-white/80">That page isn&rsquo;t here, but the popcorn is.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-butter px-6 font-semibold text-royal hover:bg-butter-light"
      >
        Back to Butter Batch
      </Link>
    </main>
  );
}
