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

export const videoFields = {
  src: nonBlank,
  // The collection replaces this with image() so Astro resolves a local still.
  poster: z.unknown(),
  description: nonBlank,
  hasAudio: z.boolean(),
  captions: z.object({
    src: nonBlank,
    language: nonBlank,
    label: nonBlank,
  }).optional(),
};

export const requireVideoCaptions = (value: { hasAudio: boolean; captions?: unknown }, context: z.RefinementCtx) => {
  if (value.hasAudio && !value.captions) context.addIssue({ code: 'custom', path: ['captions'], message: 'Video with audio requires captions' });
};

export const videoSchema = z.object(videoFields).superRefine(requireVideoCaptions);
