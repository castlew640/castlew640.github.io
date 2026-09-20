// Node's built-in test runner is executed directly by Node 24; Astro's checker does not load Node globals.
// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { buildStopTable } from '../src/lib/exhibition/stops.ts';
import { progressFor } from '../src/scripts/exhibition/scroll.ts';

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

test('measured scroll segments interpolate camera depth and clamp travel endpoints', () => {
  const stops = [{ offsetTop: 120, z: 0 }, { offsetTop: 1500, z: -18 }, { offsetTop: 2400, z: -36 }];
  assert.deepEqual(progressFor(810, stops), { stopIndex: 0, localProgress: 0.5, z: -9 });
  assert.deepEqual(progressFor(1950, stops), { stopIndex: 1, localProgress: 0.5, z: -27 });
  assert.deepEqual(progressFor(0, stops), { stopIndex: 0, localProgress: 0, z: 0 });
  assert.deepEqual(progressFor(3000, stops), { stopIndex: 2, localProgress: 0, z: -36 });
});

test('empty and collapsed scroll segments return finite progress without motion', () => {
  assert.deepEqual(progressFor(500, []), { stopIndex: 0, localProgress: 0, z: 0 });
  assert.deepEqual(progressFor(50, [{ offsetTop: 100, z: 0 }, { offsetTop: 100, z: -18 }]),
    { stopIndex: 0, localProgress: 0, z: 0 });
});

test('native scrolling reaches a stop even when its fractional offset rounds down', () => {
  const stops = [{ offsetTop: 0, z: 0 }, { offsetTop: 1800.25, z: -18 }, { offsetTop: 2500.75, z: -36 }];
  assert.equal(progressFor(1799, stops).stopIndex, 0);
  assert.deepEqual(progressFor(1800, stops), { stopIndex: 1, localProgress: 0, z: -18 });
  assert.equal(progressFor(2500, stops).stopIndex, 1);
  assert.deepEqual(progressFor(2501, stops), { stopIndex: 2, localProgress: 0, z: -36 });
});
