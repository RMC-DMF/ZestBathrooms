# Zest Bathrooms & Kitchens — website

Astro 5 static site, deployed on Netlify. Content is Markdown in `src/content/`; design tokens and component styles come from the Zest design system.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs dist/
```

Node 22. No CMS: edit the Markdown, commit, Netlify builds.

## Where things are

| Path | What |
| --- | --- |
| `src/content/case-studies/{kitchens,bathrooms}/` | Consumer case studies → `/kitchens/case-studies/<slug>`, `/bathrooms/case-studies/<slug>` |
| `src/content/projects/` | Developer and hospitality projects → `/projects/<slug>` |
| `src/content/brands/` | One file per brand → `/brands/<slug>` |
| `src/content/areas/` | Area pages → `/areas/<slug>` (only `published: true` build) |
| `src/content/team/` | People, used by PersonCard across the site |
| `src/content/journal/` | Posts → `/journal/<slug>`; `decision: keep | merge:<slug> | drop` after the GSC review |
| `src/content/pages/` | Copy migrated from the old static pages, rendered on the matching route until rewritten |
| `src/content.config.ts` | The schemas — what each frontmatter field means |
| `src/data/site.ts` | Phone, address, hours, nav, the at-a-glance facts |
| `src/styles/tokens.css` | Design tokens (compiled from the design system's tokens.json) |
| `src/styles/components.css` | Component styles (the design system's bundle.css) |
| `src/components/` | Astro components matching the design system |
| `src/layouts/Base.astro` | Head, LocalBusiness + Breadcrumb schema, header, footer |
| `src/layouts/Page.astro` | Light content page with heading block and CTA band |
| `src/layouts/Study.astro` | Case study / project page |
| `public/_redirects` | Every old URL → new URL (generated from zest-redirect-map.csv) |
| `public/images/` | Images, renamed per `scripts/image-map.json` |
| `scripts/migrate.mjs` | WordPress export → Markdown (already run; rerun only to re-migrate) |
| `scripts/import-images.mjs` | Copies and renames images from the export into `public/images` |

## First-time setup on your Mac

The content is migrated, but the images are on the export, not in the repo:

```bash
node scripts/import-images.mjs ~/Desktop/export
```

That copies and renames ~670 images into `public/images/` (resized to 2000px max). Commit them.

## Forms

Netlify Forms with a honeypot (`company-website`). Four forms: `general-enquiry`, `design-appointment`, `kitchen-brochures` / `bathroom-brochures`, `project-registration`. Set notification emails per form in the Netlify UI. Attachments are not used (8 MB cap); drawings go via a file-request link after first contact.

## Things in square brackets

Anything in `[brackets]` in copy is a fact Zest needs to supply — the question list is in the sitemap doc.

## Deploy

Connect the repo to Netlify; `netlify.toml` has the build settings. Add the custom domain and the old domain (zestbathrooms.co.uk) as a domain alias so the 301s in `_redirects` apply.
