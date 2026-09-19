import { z } from 'astro/zod';

export const nonBlank = z.string().trim().min(1);

export const contractSchema = z.object({
  id: z.enum(['website', 'manual-planner', 'ai-mvp']),
  title: nonBlank,
  description: nonBlank,
  stack: z.array(nonBlank).min(1),
  hosting: nonBlank,
});

export const screenshotSchema = z.object({
  src: nonBlank,
  alt: nonBlank,
  caption: nonBlank,
});
