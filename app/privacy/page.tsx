import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FACEBOOK_URL, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How the ${site.name} website handles your information.`,
  alternates: { canonical: "/privacy" },
};

// DRAFT for owner review — plain-language summary, not legal advice. Update before adding
// ordering, payments, accounts, analytics or any form (Phase 2+).
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="paper flex-1 py-14">
        <article className="mx-auto max-w-2xl px-4 text-lg leading-relaxed">
          <h1 className="font-display text-4xl text-navy">Privacy</h1>
          <p className="mt-2 text-base text-ink/75">Last updated November 2026</p>

          <h2 className="mt-8 font-label text-2xl font-semibold uppercase tracking-wide text-navy">The short version</h2>
          <p className="mt-2">
            This website doesn&rsquo;t ask for your information. There are no forms, no accounts, no cookies, and no
            analytics or advertising trackers on this site.
          </p>

          <h2 className="mt-8 font-label text-2xl font-semibold uppercase tracking-wide text-navy">Ordering</h2>
          <p className="mt-2">
            Orders are placed by messaging us on{" "}
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Facebook
            </a>
            . Messages you send there are handled by Meta under Meta&rsquo;s own privacy policy. We only use what you
            send us to fill your order and arrange pickup.
          </p>

          <h2 className="mt-8 font-label text-2xl font-semibold uppercase tracking-wide text-navy">Hosting</h2>
          <p className="mt-2">
            Like any website, our hosting provider may keep standard technical logs (such as IP address and browser
            type) to keep the site running and secure.
          </p>

          <h2 className="mt-8 font-label text-2xl font-semibold uppercase tracking-wide text-navy">Questions</h2>
          <p className="mt-2">Message us on Facebook and we&rsquo;ll be glad to help.</p>

          <p className="mt-10">
            <Link href="/" className="inline-flex min-h-11 items-center font-label font-semibold uppercase text-navy underline underline-offset-4">
              &larr; Back to the popcorn
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
