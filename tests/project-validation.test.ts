// Node's built-in test runner is executed directly by Node 24; Astro's checker does not load Node globals.
// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { validateProjectRecords } from '../src/lib/project-validation.ts';
import {
  contractSchema,
  evidenceSchema,
  httpsUrlSchema,
  nonBlank,
  screenshotSchema,
} from '../src/lib/project-schema.ts';

const contract = (id: string) => ({ id });
const valid = (overrides: Record<string, unknown> = {}) => ({
  id: 'featured-client',
  slug: 'featured-client',
  title: 'Featured client',
  summary: 'A useful case study.',
  published: true,
  exhibitionOrder: 1,
  liveUrl: 'https://example.com',
  contracts: [contract('website'), contract('manual-planner'), contract('ai-mvp')],
  screenshots: [{ src: 'image.jpg' }],
  ...overrides,
});

const personal = (overrides: Record<string, unknown> = {}) => ({
  id: 'personal-project',
  kind: 'personal' as const,
  slug: 'personal-project',
  title: 'Personal project',
  summary: 'A repository-only personal project.',
  published: true,
  exhibitionOrder: 2,
  repositoryUrl: 'https://github.com/castlew640/personal-project',
  evidence: [{ src: 'still.png', alt: 'Project output', caption: 'A real project result.' }],
  ...overrides,
});

test('accepts a complete published project and an incomplete draft', () => {
  assert.doesNotThrow(() => validateProjectRecords([
    valid(),
    valid({ id: 'draft', slug: 'draft', published: false, liveUrl: undefined, screenshots: [] }),
  ]));
});

test('rejects duplicate published slugs', () => {
  assert.throws(() => validateProjectRecords([valid(), valid({ id: 'other', exhibitionOrder: 2 })]), /Duplicate published project slug/);
  assert.doesNotThrow(() => validateProjectRecords([
    valid({ id: 'draft-a', slug: 'reused-draft', published: false }),
    valid({ id: 'draft-b', slug: 'reused-draft', published: false }),
  ]));
});

test('rejects duplicate or invalid published exhibition order', () => {
  assert.throws(
    () => validateProjectRecords([valid(), personal({ exhibitionOrder: 1 })]),
    /Duplicate published exhibition order/,
  );
  assert.throws(() => validateProjectRecords([personal({ exhibitionOrder: -1 })]), /nonnegative integer/);
  assert.throws(() => validateProjectRecords([personal({ exhibitionOrder: 1.5 })]), /nonnegative integer/);
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
  assert.throws(() => validateProjectRecords([valid({ liveUrl: undefined })]), /requires an HTTPS live URL/);
  assert.throws(() => validateProjectRecords([personal({ evidence: [] })]), /described evidence still/);
  assert.throws(() => validateProjectRecords([personal({ evidence: [{ alt: ' ', caption: 'Evidence' }] })]), /described evidence still/);
  assert.doesNotThrow(() => validateProjectRecords([personal({ liveUrl: undefined })]));
});

test('validates every supplied link, including links on drafts', () => {
  assert.throws(() => validateProjectRecords([
    personal({ published: false, repositoryUrl: 'http://github.com/example/project' }),
  ]), /repository URL must be a valid HTTPS URL/);
  assert.throws(() => validateProjectRecords([
    personal({ published: false, liveUrl: 'javascript:alert(1)' }),
  ]), /live URL must be a valid HTTPS URL/);
  assert.equal(httpsUrlSchema.safeParse('https://example.com/project').success, true);
  assert.equal(httpsUrlSchema.safeParse('http://example.com/project').success, false);
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
  assert.equal(evidenceSchema.safeParse({
    src: 'terminal.png',
    alt: 'Readable terminal output',
    caption: 'The completed command output.',
    kind: 'terminal',
    fit: 'contain',
  }).success, true);
  assert.equal(evidenceSchema.safeParse({
    src: 'diagram.png',
    alt: '',
    caption: 'Architecture diagram.',
    kind: 'diagram',
    fit: 'contain',
  }).success, false);
});
