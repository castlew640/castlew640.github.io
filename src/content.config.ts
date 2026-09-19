import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const contractSchema = z.object({
  id: z.enum(['website', 'manual-planner', 'ai-mvp']),
  title: z.string().min(1),
  description: z.string().min(1),
  stack: z.array(z.string().min(1)).min(1),
  hosting: z.string().min(1),
});

const screenshotSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().min(1),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    summary: z.string().min(1),
    published: z.boolean(),
    exhibitionOrder: z.number().int().nonnegative(),
    liveUrl: z.string().url().refine((value) => value.startsWith('https:'), 'Live URLs must use HTTPS').optional(),
    contracts: z.array(contractSchema).length(3),
    screenshots: z.array(screenshotSchema.extend({ src: image() })),
  }),
});

export { contractSchema, screenshotSchema };
export const collections = { projects };
