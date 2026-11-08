# Butter Batch Popcorn Co. — website

Small-batch popcorn in Lincoln, NE. Next.js (App Router) + Tailwind CSS, deployed on Netlify.

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint
npm run check:pricing   # cart/custom/bundle price math vs data/menu.ts
```

Node 20.9+ (Netlify uses Node 22, see `netlify.toml` / `.nvmrc`).

## Where things live

| What | Where |
| --- | --- |
| Menu (flavors, sizes, prices, availability) | `data/menu.ts` — the only source. Components call `getMenu()`. |
| Contact links, pickup locations | `data/site.ts` |
| Shop / Customize / Tour pages | `app/shop`, `app/customize`, `app/tour` (+ `components/shop`, `components/customize`, `components/tour`) |
| Shared cart (localStorage, specs only — never prices) | `lib/cartStore.ts`, `components/cart/` |
| Cart pricing + Messenger order text (pure, from the menu) | `lib/pricing.ts` |
| Tour stops (real photos + captions) | `data/tour.ts` |
| Living logo hero | `components/hero/` — `HeroStage.tsx` (layers, hint), `PopcornIntro.tsx` (full-screen opening burst), `popcornEngine.ts` (tap/entrance bursts), `sprites.ts` (drawn popcorn) |
| Page sections | `components/*.tsx`, composed in `app/page.tsx` |
| Security headers / CSP | `next.config.ts` |
| SEO | `app/layout.tsx` (metadata + JSON-LD), `app/opengraph-image.jpg`, `app/robots.ts`, `app/sitemap.ts` |

### Updating the menu

Edit `data/menu.ts`. To mark a flavor sold out, set `available: false` (it shows "Out right now").
Items in `rotating` with `status: "unconfirmed"` are never shown on the site.

### The logo rule

The logo (`public/brand/butter-batch-logo.png`) is a fixed image layer. It is never animated, transformed,
masked, scaled as an effect, bounced or redrawn. Only popcorn shapes around it move: the entrance burst and
up to 8 faint drifting kernels on a canvas *behind* the logo, and tap bursts on a canvas in front.
Keep it that way.

The hero/header background colour is sampled at runtime from the served logo image (`--logo-bg`), so
image-encoder colour shifts never show a seam around the artwork.

### Images

All photos are the business's own (`public/photos/`). Never add stock food photos. The originals stay at the repo root.

## Not built yet

- Payments / checkout page (the cart composes a Messenger order; no payment is taken).
- Phase 3: admin panel (will replace the body of `getMenu()`).
