import Image from "next/image";
import type { Flavor, Look } from "@/data/menu";
import { LOOKS, seeded } from "@/lib/looks";

/**
 * Product art for a flavor: the business's REAL photo when one exists; otherwise a clean drawn
 * bag (SVG) with the REAL logo file as a sticker — the logo image is placed as-is, never redrawn
 * or AI-generated — and a visible "Illustration" tag so it is never passed off as a photo.
 */
export function BagArt({ flavor, sizes = "(min-width: 1024px) 240px, 45vw" }: { flavor: Flavor; sizes?: string }) {
  if (flavor.photo) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white/5">
        <Image src={flavor.photo.src} alt={flavor.photo.alt} fill sizes={sizes} className="object-cover" />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white">
          Real photo
        </span>
      </div>
    );
  }
  return <BagRender look={flavor.look} label={flavor.name} seedKey={flavor.id} />;
}

export function BagRender({ look, label, seedKey }: { look: Look; label: string; seedKey: string }) {
  const c = LOOKS[look];
  const rnd = seeded(seedKey);
  const puffs = Array.from({ length: 46 }, () => ({
    x: 10 + rnd() * 100,
    y: 22 + rnd() * 132,
    r: 4.2 + rnd() * 2.6,
    t: rnd(),
  }));
  const clip = `bag-${seedKey}`;
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl surface-0" role="img" aria-label={`Illustration of a bag of ${label} popcorn with the Butter Batch logo sticker`}>
      <svg viewBox="0 0 120 160" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <clipPath id={clip}>
            <path d="M14 18 H106 Q110 18 110 24 L112 150 Q112 156 106 156 H14 Q8 156 8 150 L10 24 Q10 18 14 18 Z" />
          </clipPath>
          <linearGradient id={`${clip}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {/* zip top */}
        <rect x="12" y="8" width="96" height="10" rx="2" fill="#ffffff" stroke="#000" strokeOpacity="0.15" />
        <rect x="12" y="15" width="96" height="2" fill="#000" fillOpacity="0.12" />
        <g clipPath={`url(#${clip})`}>
          <rect x="0" y="0" width="120" height="160" fill={c.base} />
          {puffs.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y + 1} r={p.r} fill={c.dark} />
              <circle cx={p.x - p.r * 0.45} cy={p.y - p.r * 0.2} r={p.r * 0.72} fill={p.t > 0.5 ? c.light : c.base} />
              <circle cx={p.x + p.r * 0.45} cy={p.y - p.r * 0.25} r={p.r * 0.66} fill={p.t > 0.3 ? c.light : c.base} />
              <circle cx={p.x - p.r * 0.5} cy={p.y - p.r * 0.45} r={p.r * 0.22} fill="#fff" fillOpacity="0.85" />
            </g>
          ))}
          <rect x="0" y="0" width="120" height="160" fill={`url(#${clip}-sheen)`} />
        </g>
        <path
          d="M14 18 H106 Q110 18 110 24 L112 150 Q112 156 106 156 H14 Q8 156 8 150 L10 24 Q10 18 14 18 Z"
          fill="none"
          stroke="#000"
          strokeOpacity="0.15"
        />
      </svg>
      {/* REAL logo file as the bag sticker — placed unmodified, square corners */}
      <div className="absolute top-[38%] left-1/2 w-[52%] -translate-x-1/2 bg-white p-[3px] shadow-sm">
        <Image
          src="/brand/butter-batch-logo.png"
          alt=""
          width={1024}
          height={846}
          sizes="120px"
          className="block h-auto w-full"
        />
      </div>
      {/* flavor sticker, like the round labels on the real bags */}
      <span className="absolute top-[16%] right-[9%] max-w-[46%] rounded-full surface-2 px-2 py-1 text-center text-[10px] leading-tight font-semibold text-white shadow-sm">
        {label}
      </span>
      <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white/70">
        Illustration
      </span>
    </div>
  );
}
