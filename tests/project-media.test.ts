// @ts-expect-error Node test types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test types are intentionally not a production dependency.
import test from 'node:test';
// @ts-expect-error Node types are intentionally not a production dependency.
import { mkdtemp, mkdir, writeFile, symlink } from 'node:fs/promises';
// @ts-expect-error Node types are intentionally not a production dependency.
import { tmpdir } from 'node:os';
// @ts-expect-error Node types are intentionally not a production dependency.
import { join } from 'node:path';
import { validatePublicMedia } from '../src/lib/project-media.ts';
import { videoSchema } from '../src/lib/project-schema.ts';

const root = async () => mkdtemp(join(tmpdir(), 'project-media-test-'));
const video = (slug = 'published') => ({
  src: `/media/${slug}/demo.mp4`,
  poster: { src: '/_astro/poster.webp' },
  description: 'A silent demonstration.',
  hasAudio: false,
});
const entry = (overrides: Record<string, unknown> = {}) => ({
  id: 'published', data: { slug: 'published', published: true, video: video(), ...overrides },
});
const put = async (base: string, slug: string, name: string, content = 'fixture') => {
  const folder = join(base, 'media', slug);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, name), content);
};

test('still-only project and correctly owned page video are valid', async () => {
  const base = await root();
  await validatePublicMedia([entry({ video: undefined })], base);
  await put(base, 'published', 'demo.mp4');
  await validatePublicMedia([entry()], base);
  assert.equal(videoSchema.safeParse(video()).success, true);
});

test('audio requires usable captions and silent demos require description', () => {
  assert.equal(videoSchema.safeParse({ ...video(), hasAudio: true }).success, false);
  assert.equal(videoSchema.safeParse({ ...video(), description: '   ' }).success, false);
  assert.equal(videoSchema.safeParse({ ...video(), hasAudio: true, captions: { src: '/media/published/demo.vtt', language: 'en', label: 'English' } }).success, true);
});

test('rejects traversal, encoded separators, fragments, query strings and mismatched ownership', async () => {
  const base = await root();
  await put(base, 'published', 'demo.mp4');
  for (const src of [
    '/media/published/../other/demo.mp4', '/media/published/%2fescape.mp4',
    '/media/published/demo%5c.mp4', '/media/published/demo.mp4?download=1',
    '/media/published/demo.mp4#t=1', '/media/other/demo.mp4',
    '/media/published/unsafe\\name.mp4',
  ]) {
    await assert.rejects(validatePublicMedia([entry({ video: { ...video(), src } })], base), /media|path|slug|invalid/i, src);
  }
});

test('rejects absent, escaped, oversized and orphan public files', async () => {
  const base = await root();
  await assert.rejects(validatePublicMedia([entry()], base), /missing|exist/i);
  await put(base, 'published', 'demo.mp4');
  await put(base, 'other', 'orphan.mp4');
  await assert.rejects(validatePublicMedia([entry()], base), /orphan|unreferenced|published/i);
  const clean = await root();
  await put(clean, 'published', 'demo.mp4');
  await put(clean, 'published', 'extra.mp4');
  await assert.rejects(validatePublicMedia([entry()], clean), /orphan|unreferenced|published/i);
  const escaped = await root();
  await mkdir(join(escaped, 'media', 'published'), { recursive: true });
  await symlink(join(clean, 'media', 'published', 'demo.mp4'), join(escaped, 'media', 'published', 'demo.mp4'));
  await assert.rejects(validatePublicMedia([entry()], escaped), /symlink|escape|contain/i);
  const large = await root();
  await put(large, 'published', 'demo.mp4', 'x'.repeat(25_000_001));
  await assert.rejects(validatePublicMedia([entry()], large), /size|25|large/i);
});

test('draft-only media cannot be present in public and VTT must not be empty', async () => {
  const base = await root();
  await put(base, 'draft', 'demo.mp4');
  await assert.rejects(validatePublicMedia([entry({ video: undefined }), entry({ slug: 'draft', published: false, video: video('draft') })], base), /orphan|draft|published/i);
  const captioned = await root();
  await put(captioned, 'published', 'demo.mp4');
  await put(captioned, 'published', 'demo.vtt', 'WEBVTT\n\n');
  await assert.rejects(validatePublicMedia([entry({ video: { ...video(), hasAudio: true, captions: { src: '/media/published/demo.vtt', language: 'en', label: 'English' } } })], captioned), /caption|VTT|empty/i);
});
