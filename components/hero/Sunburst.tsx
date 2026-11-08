/**
 * Sunburst rays radiating from BEHIND the logo. Pure SVG + CSS (opacity/transform only).
 *
 * The rays are masked out in a soft-edged hole a bit larger than the logo box, so they fade to
 * nothing before they reach the logo's edge — no hard seam, and the logo pixels are never touched.
 * Geometry: the SVG is 175% of the logo's width; in viewBox units (200 wide) the logo is
 * 114.3 x 94.4 (1024:846, LOGO.jpg cropped above its Facebook badge).
 */

const RAYS = 28;
const LOGO_W = 200 / 1.75;
const LOGO_H = (LOGO_W * 846) / 1024;
const HOLE_PAD = 14;

function rayPath(offset: number) {
  const step = (Math.PI * 2) / RAYS;
  const half = step * 0.26;
  const R = 145;
  let d = "";
  for (let i = 0; i < RAYS; i++) {
    const a = i * step + offset;
    const x1 = Math.cos(a - half) * R;
    const y1 = Math.sin(a - half) * R;
    const x2 = Math.cos(a + half) * R;
    const y2 = Math.sin(a + half) * R;
    d += `M0 0L${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
  }
  return d;
}

function RaysSvg({ id, offset, color, opacity, className }: {
  id: string;
  offset: number;
  color: string;
  opacity: number;
  className: string;
}) {
  return (
    <svg
      className={`rays ${className}`}
      style={{ width: "175%", aspectRatio: "1 / 1" }}
      viewBox="-100 -100 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-fade`} cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <stop offset="0.35" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200">
          <rect x="-100" y="-100" width="200" height="200" fill={`url(#${id}-fade)`} />
          <rect
            x={-LOGO_W / 2 - HOLE_PAD}
            y={-LOGO_H / 2 - HOLE_PAD}
            width={LOGO_W + HOLE_PAD * 2}
            height={LOGO_H + HOLE_PAD * 2}
            rx="30"
            fill="#000"
            filter={`url(#${id}-blur)`}
          />
        </mask>
      </defs>
      <path d={rayPath(offset)} fill={color} opacity={opacity} mask={`url(#${id}-mask)`} />
    </svg>
  );
}

export function Sunburst() {
  const step = (Math.PI * 2) / RAYS;
  return (
    <>
      <RaysSvg id="bb-rays-a" offset={0} color="#ffc93c" opacity={0.42} className="rays-a" />
      <RaysSvg id="bb-rays-b" offset={step / 2} color="#fff4d6" opacity={0.28} className="rays-b" />
    </>
  );
}
