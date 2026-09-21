import { z } from 'astro/zod';

export const nonBlank = z.string().trim().min(1);

export const httpsUrlSchema = z.string().url().refine((value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'URLs must use HTTPS');

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

export const evidenceSchema = screenshotSchema.extend({
  kind: z.enum(['screenshot', 'terminal', 'diagram', 'illustration']),
  fit: z.enum(['contain', 'cover']),
});
