// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { routeBounds, sampleRoute } from '../src/scripts/exhibition/scene/path.ts';

const landingStation = (projectCount: number): number => projectCount * 18 + 28;
const snapshot = (station: number, maximum: number) => {
  const frame = sampleRoute(station, routeBounds(maximum));
  return {
    position: frame.position.toArray(),
    forward: frame.forward.toArray(),
    right: frame.right.toArray(),
    up: frame.up.toArray(),
  };
};

test('fixed segments remain continuous with horizontal tangents at every join', () => {
  const bounds = routeBounds(landingStation(10));
  for (let join = 18; join <= 180; join += 18) {
    const before = sampleRoute(join - 0.0001, bounds);
    const at = sampleRoute(join, bounds);
    const after = sampleRoute(join + 0.0001, bounds);
    assert.ok(before.position.distanceTo(at.position) < 0.001);
    assert.ok(after.position.distanceTo(at.position) < 0.001);
    assert.ok(Math.abs(at.forward.y) < 1e-12);
    assert.ok(Math.abs(at.forward.length() - 1) < 1e-12);
    assert.deepEqual(at.up.toArray(), [0, 1, 0]);
  }
});

test('route samples clamp non-finite and endpoint stations to finite bounds', () => {
  for (const count of [0, 1, 2, 10]) {
    const maximum = landingStation(count);
    const bounds = routeBounds(maximum);
    assert.equal(bounds.minStation, 0);
    assert.equal(bounds.maxStation, maximum);
    assert.deepEqual(snapshot(-100, maximum), snapshot(0, maximum));
    assert.deepEqual(snapshot(Number.NaN, maximum), snapshot(0, maximum));
    assert.deepEqual(snapshot(Number.POSITIVE_INFINITY, maximum), snapshot(maximum, maximum));
    assert.deepEqual(snapshot(maximum + 100, maximum), snapshot(maximum, maximum));
  }
});

test('N=0, 1, 2, and 10 append without moving any earlier route frame', () => {
  const counts = [0, 1, 2, 10];
  for (let index = 0; index < counts.length - 1; index++) {
    const smaller = landingStation(counts[index]);
    const larger = landingStation(counts[index + 1]);
    for (const station of [0, 12, 18, 24, smaller]) {
      assert.deepEqual(snapshot(station, smaller), snapshot(station, larger));
    }
  }
});

test('fixed anchor pattern produces bounded lateral and elevation changes', () => {
  const bounds = routeBounds(landingStation(10));
  const anchors = Array.from({ length: 11 }, (_, index) => sampleRoute(index * 18, bounds).position);
  assert.deepEqual(anchors.slice(0, 5).map((point) => Number(point.x.toFixed(2))), [0, 0.8, 0, -0.8, 0]);
  assert.deepEqual(anchors.slice(0, 5).map((point) => Number(point.y.toFixed(2))), [0, 0.3, 0.1, 0, 0]);
  assert.ok(anchors.every((point) => Math.abs(point.x) <= 0.8 && point.y >= 0 && point.y <= 0.3));
});

