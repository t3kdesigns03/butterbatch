import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Yellowtail } from "next/font/google";
import { FACEBOOK_URL, site, siteUrl } from "@/data/site";
import "./globals.css";

// Two typefaces: Bricolage Grotesque (display) + Inter (text). Yellowtail = one small accent only.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], variable: "--font-yellowtail", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "Butter Batch Popcorn Co. | Small-Batch Popcorn in Lincoln, NE",
    template: "%s | Butter Batch Popcorn Co.",
  },
  description: site.description,
  keywords: [
    "popcorn Lincoln NE",
    "Lincoln Nebraska popcorn",
    "kettle corn Lincoln",
    "caramel corn Lincoln NE",
    "gourmet popcorn Nebraska",
    "small batch popcorn",
    "event popcorn Lincoln",
    "Butter Batch Popcorn",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: "Butter Batch Popcorn Co. — Lincoln, NE",
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Butter Batch Popcorn Co. — Lincoln, NE",
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#013893",
  width: "device-width",
  initialScale: 1,
};

function jsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: site.name,
    description: site.description,
    url: siteUrl().toString(),
    image: new URL("/brand/butter-batch-logo.png", siteUrl()).toString(),
    servesCuisine: "Popcorn",
    priceRange: "$",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.city,
      addressRegion: site.region,
      postalCode: site.postalCode,
      addressCountry: site.country,
    },
    areaServed: { "@type": "City", name: "Lincoln, Nebraska" },
    sameAs: [FACEBOOK_URL],
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${yellowtail.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-butter px-5 py-3 font-semibold text-navy focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      </body>
    </html>
  );
}
