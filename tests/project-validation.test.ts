// Node's built-in test runner is executed directly by Node 24; Astro's checker does not load Node globals.
// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { validateProjectRecords } from '../src/lib/project-validation.ts';
import { contractSchema, nonBlank, screenshotSchema } from '../src/lib/project-schema.ts';

const contract = (id: string) => ({ id });
const valid = (overrides: Record<string, unknown> = {}) => ({
  id: 'featured-client',
  slug: 'featured-client',
  title: 'Featured client',
  summary: 'A useful case study.',
  published: true,
  liveUrl: 'https://example.com',
  contracts: [contract('website'), contract('manual-planner'), contract('ai-mvp')],
  screenshots: [{ src: 'image.jpg' }],
  ...overrides,
});

test('accepts a complete published project and an incomplete draft', () => {
  assert.doesNotThrow(() => validateProjectRecords([
    valid(),
    valid({ id: 'draft', slug: 'draft', published: false, liveUrl: undefined, screenshots: [] }),
  ]));
});

test('rejects duplicate published slugs', () => {
  assert.throws(() => validateProjectRecords([valid(), valid({ id: 'other' })]), /Duplicate published project slug/);
});

test('rejects repeated, missing, or unknown contract IDs', () => {
  for (const contracts of [
    [contract('website'), contract('website'), contract('ai-mvp')],
    [contract('website'), contract('manual-planner')],
    [contract('website'), contract('manual-planner'), contract('unknown')],
  ]) {
    assert.throws(() => validateProjectRecords([valid({ contracts })]), /exactly one website/);
  }
});

test('rejects unsafe evidence URLs and incomplete published entries', () => {
  assert.throws(() => validateProjectRecords([valid({ liveUrl: 'http://example.com' })]), /valid HTTPS URL/);
  assert.throws(() => validateProjectRecords([valid({ liveUrl: 'https://' })]), /valid HTTPS URL/);
  assert.throws(() => validateProjectRecords([valid({ title: '' })]), /title and summary/);
  assert.throws(() => validateProjectRecords([valid({ screenshots: [] })]), /approved screenshots/);
});

test('rejects whitespace-only publication metadata', () => {
  assert.equal(nonBlank.safeParse('   ').success, false);
  assert.equal(contractSchema.safeParse({
    id: 'website',
    title: '   ',
    description: 'Published work',
    stack: ['Astro'],
    hosting: 'GitHub Pages',
  }).success, false);
  assert.equal(screenshotSchema.safeParse({
    src: 'evidence.jpg',
    alt: '   ',
    caption: 'Approved evidence',
  }).success, false);
});
