# Greatest Solutions

Marketing site for **Greatest Solutions**, a software development and technology services agency.

Built with the Next.js App Router, React 19 and Tailwind CSS v4. Content lives in typed
data modules rather than in the markup, so copy, navigation and pricing are edited in one
place and the pages render from it.

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components) |
| UI | React 19, Tailwind CSS v4, `motion` for animation |
| Language | TypeScript (strict) |
| Fonts | Fraunces, Inter and Geist Mono, self-hosted via `next/font` |
| Images | AVIF/WebP generated ahead of time, served through `<picture>` |

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production origin, e.g. `https://greatestsolutions.com`. Canonical URLs, Open Graph tags and `sitemap.xml` all derive from it. Falls back to `http://localhost:3000` when unset. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Typecheck, lint and build — run before pushing |
| `npm run assets:hero` | Regenerate AVIF/WebP siblings for `public/hero` |
| `npm run assets:images` | Regenerate AVIF/WebP siblings for the other artwork folders |

The asset scripts need `sharp`, which arrives as a Next dependency. Their output is
committed, so no build step depends on them — run one only after changing the source
artwork.

## Project structure

```
src/
  app/            Routes (App Router)
    services/     Index + [slug] detail pages
    works/        Index + [slug] case studies
    about/  blog/  contact/  pricing/  solutions/
    privacy/  terms/
    sitemap.ts    robots.ts
  components/
    sections/     Homepage sections (Hero, Services, Works, Pricing, FAQ, …)
    ui/           Button, Pill, Marquee, Picture
    hero/  layout/  footer/  …
  config/site.ts  Site identity: name, tagline, contact, social links
  data/           Typed content — services, works, pricing, FAQ, navigation, blog
  lib/            cn (class merging), motion presets
  types/          Shared types (media sources)
public/           Static artwork, video and icons
scripts/          Image pipeline (AVIF/WebP generation)
```

### Editing content

Most changes do not touch a component:

- **Company name, tagline, email, social links** — `src/config/site.ts`
- **Services** — `src/data/services.ts`. The nav dropdown and `/services/[slug]`
  routes are generated from this list, so adding an entry is enough.
- **Navigation** — `src/data/navigation.ts`. Items marked `pending` render disabled
  instead of linking to a route that does not exist yet.
- **Pricing, FAQ, testimonials, case studies, blog** — the matching file in `src/data/`.

## Notes

- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`) are set in `next.config.ts`, and `X-Powered-By` is disabled.
- The hero deliberately bypasses `next/image`: it uploads the resolved `<img>` to a
  WebGL context, so its modern formats are generated ahead of time instead.
- `sitemap.xml` and `robots.txt` are generated from `src/app/sitemap.ts` and
  `src/app/robots.ts`.

## Deployment

Any platform that runs a Next.js build works. Set `NEXT_PUBLIC_SITE_URL` in the
deployment environment, then build and start:

```bash
npm run build
npm start
```
