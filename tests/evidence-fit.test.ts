// @ts-expect-error Node test types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test types are intentionally not a production dependency.
import test from 'node:test';
import { evidenceFit, containedScale, imageSize } from '../src/lib/evidence-fit.ts';

test('terminal and diagram extents cannot be cropped by author preference', () => {
  assert.equal(evidenceFit('terminal', 'cover', 1200, 240), 'contain');
  assert.equal(evidenceFit('diagram', 'cover', 240, 960), 'contain');
  assert.equal(evidenceFit('illustration', 'contain', 800, 400), 'contain');
});

test('cover is accepted only when no more than 10% of either dimension is lost', () => {
  assert.equal(evidenceFit('screenshot', 'cover', 1800, 1000), 'cover');
  assert.equal(evidenceFit('screenshot', 'cover', 2200, 1000), 'cover');
  assert.equal(evidenceFit('screenshot', 'cover', 2300, 1000), 'contain');
  assert.equal(evidenceFit('screenshot', 'cover', 1700, 1000), 'contain');
  assert.equal(evidenceFit('screenshot', 'cover', 800, 400), 'cover');
});

test('contained image mapping and optimization preserve all four source corners', () => {
  assert.deepEqual(containedScale(1200, 240), { x: 1, y: 0.4 });
  assert.deepEqual(containedScale(240, 960), { x: 0.125, y: 1 });
  assert.deepEqual(imageSize(1200, 240), { width: 1200, height: 240 });
  assert.deepEqual(imageSize(240, 960), { width: 240, height: 960 });
  assert.deepEqual(imageSize(3200, 1600), { width: 1600, height: 800 });
});
