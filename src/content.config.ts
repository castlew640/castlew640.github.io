import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  contractSchema,
  evidenceSchema,
  httpsUrlSchema,
  nonBlank,
  screenshotSchema,
  videoFields,
  requireVideoCaptions,
} from './lib/project-schema';

const commonProject = {
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonBlank,
  summary: nonBlank.max(200),
  published: z.boolean(),
  exhibitionOrder: z.number().int().nonnegative(),
};

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) => z.union([
    z.object({
      ...commonProject,
      kind: z.literal('client').default('client'),
      format: z.literal('case-study').default('case-study'),
      liveUrl: httpsUrlSchema.optional(),
      repositoryUrl: httpsUrlSchema.optional(),
      contracts: z.array(contractSchema).length(3),
      screenshots: z.array(screenshotSchema.extend({ src: image() })),
      video: z.object({ ...videoFields, poster: image() }).superRefine(requireVideoCaptions).optional(),
    }),
    z.object({
      ...commonProject,
      kind: z.literal('personal'),
      format: z.enum(['case-study', 'showcase', 'deep-dive']).default('case-study'),
      liveUrl: httpsUrlSchema.optional(),
      repositoryUrl: httpsUrlSchema.optional(),
      evidence: z.array(evidenceSchema.extend({ src: image() })),
      video: z.object({ ...videoFields, poster: image() }).superRefine(requireVideoCaptions).optional(),
    }),
  ]),
});

export const collections = { projects };
