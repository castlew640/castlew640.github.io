import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { contractSchema, nonBlank, screenshotSchema } from './lib/project-schema';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: nonBlank,
    summary: nonBlank.max(200),
    published: z.boolean(),
    exhibitionOrder: z.number().int().nonnegative(),
    liveUrl: z.string().url().refine((value) => value.startsWith('https:'), 'Live URLs must use HTTPS').optional(),
    contracts: z.array(contractSchema).length(3),
    screenshots: z.array(screenshotSchema.extend({ src: image() })),
  }),
});

export const collections = { projects };
