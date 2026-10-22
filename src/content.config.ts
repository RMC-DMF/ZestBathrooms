import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const imageRef = z.object({ src: z.string(), alt: z.string().default('') });

/** Consumer case studies — kitchens and bathrooms. One folder per room so URLs stay /kitchens/case-studies/<slug>. */
const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    room: z.enum(['kitchens', 'bathrooms']),
    summary: z.string().max(220),
    location: z.string().optional(),
    area: z.string().optional(), // matches an areas slug
    client: z.string().optional(),
    designer: z.string().optional(), // matches a team slug
    collaborators: z.array(z.string()).default([]),
    brands: z.array(z.string()).default([]), // brand slugs
    style: z.array(z.string()).default([]),
    hero: imageRef.optional(),
    gallery: z.array(imageRef).default([]),
    quote: z.object({ text: z.string(), by: z.string() }).optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    legacyUrl: z.string().optional(),
  }),
});

/** Developer and hospitality projects. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    client: z.string().optional(),
    architect: z.string().optional(),
    location: z.string().optional(),
    area: z.string().optional(),
    sector: z.enum(['Residential', 'Hospitality', 'Student', 'Retirement Living', 'Commercial', 'Leisure', 'Residential development']).optional(),
    units: z.number().int().optional(),
    unitsLabel: z.string().optional(), // e.g. "106 apartments + 20 cottages", "47,000 sq ft"
    brands: z.array(z.string()).default([]),
    scope: z.array(z.string()).default([]),
    hero: imageRef.optional(),
    gallery: z.array(imageRef).default([]),
    quote: z.object({ text: z.string(), by: z.string() }).optional(),
    date: z.coerce.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    legacyUrl: z.string().optional(),
  }),
});

const brands = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/brands' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['Kitchens', 'Brassware', 'Sanitaryware', 'Furniture', 'Wellness', 'Tiles & surfaces', 'Appliances', 'Baths']),
    country: z.string().optional(),
    summary: z.string().max(220),
    onDisplay: z.string().optional(),
    website: z.string().url().optional(),
    logo: z.string().optional(),
    hero: imageRef.optional(),
    gallery: z.array(imageRef).default([]),
    /** One line under the name: what the house is, in Zest's words. */
    tagline: z.string().optional(),
    /** Two or three sentences, first person: why Zest chose to work with this house, and since when. */
    heritage: z.string().optional(),
    founded: z.string().optional(),
    hometown: z.string().optional(),
    /** Three to five things the brand is known for — each a short title and one sentence. */
    knownFor: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    /** Why buy it from Zest rather than online — short paragraphs. */
    whyZest: z.array(z.string()).default([]),
    /** Brand-specific FAQs; the template adds the universal ones (price match, online, lead times). */
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /** Collections or ranges worth naming, with an image where there is one. */
    collections: z.array(z.object({ name: z.string(), text: z.string().optional(), image: z.string().optional() })).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(50),
    legacyUrl: z.string().optional(),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    title: z.string(),
    county: z.string().optional(),
    summary: z.string().max(220),
    distance: z.string().optional(), // "20 minutes from the showroom"
    contact: z.string().optional(), // team slug
    hero: imageRef.optional(),
    published: z.boolean().default(false), // only publish with real projects and photography
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    ask: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    photo: z.string().optional(),
    order: z.number().default(50),
    published: z.boolean().default(false),
  }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    author: z.string().optional(), // team slug
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    hero: imageRef.optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    legacyUrl: z.string().optional(),
    /** Decision after GSC review: keep | merge:<slug> | drop */
    decision: z.string().default('review'),
  }),
});

/** Migrated copy from the old static pages — source material for the rewrite, rendered on the matching route until replaced. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), legacyUrl: z.string().optional(), hero: imageRef.optional(), gallery: z.array(imageRef).default([]) }),
});

export const collections = { caseStudies, projects, brands, areas, team, journal, pages };
