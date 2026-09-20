// Node's built-in test runner is executed directly by Node 24; Astro's checker does not load Node globals.
// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { buildStopTable } from '../src/lib/exhibition/stops.ts';

const slugs = () => ['featured-client', 'second-project', 'third-project'];

test('one published project follows the approved stop and architecture table', () => {
  const table = buildStopTable(slugs().slice(0, 1));
  assert.deepEqual(table.stops.map((stop) => stop.z), [0, -18, -36, -46]);
  assert.equal(table.thresholdArchZ, -12);
  assert.equal(table.portalZ(1), -30);
  assert.equal(table.landingArchZ, -64);
});

test('an empty collection keeps the entrance and destination without an invented exhibit', () => {
  const table = buildStopTable([]);
  assert.deepEqual(table.stops.map((stop) => stop.id), ['entrance', 'about', 'landing']);
  assert.deepEqual(table.stops.map((stop) => stop.z), [0, -18, -28]);
  assert.equal(table.stops.some((stop) => stop.id.startsWith('exhibit-')), false);
});

test('three published projects retain eighteen metre exhibit spacing', () => {
  const table = buildStopTable(slugs());
  assert.deepEqual(table.stops.map((stop) => stop.z), [0, -18, -36, -54, -72, -82]);
});

test('GROW-04 invariance keeps earlier stops and portals fixed when projects are appended', () => {
  const original = buildStopTable(slugs().slice(0, 1));
  const expanded = buildStopTable(slugs());
  assert.equal(expanded.stops[1].z, original.stops[1].z);
  assert.equal(expanded.portalZ(1), original.portalZ(1));
});

test('exhibit ids preserve the supplied published slug order', () => {
  const table = buildStopTable(['third-project', 'featured-client', 'second-project']);
  assert.deepEqual(table.stops.map((stop) => stop.id), [
    'entrance', 'exhibit-third-project', 'exhibit-featured-client', 'exhibit-second-project', 'about', 'landing',
  ]);
});
