// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { PerspectiveCamera, Vector3 } from 'three';
import { buildStopTable } from '../src/lib/exhibition/stops.ts';
import { layoutWorld, routeFrame, type StopInput } from '../src/scripts/exhibition/scene/layout.ts';
import { createRig, damp, dwell, fovFor, framingFor } from '../src/scripts/exhibition/scene/rig.ts';

const slugs = (count: number) => Array.from({ length: count }, (_, index) => `project-${index + 1}`);
const inputs = (count: number, aspect = 1600 / 780): StopInput[] => buildStopTable(slugs(count)).stops.map((stop) => ({
  id: stop.id,
  kind: stop.id === 'entrance' || stop.id === 'about' || stop.id === 'landing' ? stop.id : 'exhibit',
  station: -stop.z,
  aspect,
}));

test('the walk starts straight down the axis and stays continuous with level unit tangents', () => {
  const start = routeFrame(0);
  assert.equal(start.position.length(), 0);
  assert.ok(start.forward.distanceTo(new Vector3(0, 0, -1)) < 1e-3);
  for (let station = 0; station <= 400; station += 0.5) {
    const at = routeFrame(station);
    const next = routeFrame(station + 0.01);
    assert.ok(at.position.distanceTo(next.position) < 0.02);
    assert.equal(at.forward.y, 0);
    assert.ok(Math.abs(at.forward.length() - 1) < 1e-12);
    assert.ok(Math.abs(at.right.dot(at.forward)) < 1e-12);
    assert.ok(Math.abs(at.position.x) < 4, 'the meander stays gentle');
  }
});

test('non-finite stations produce finite route frames', () => {
  for (const station of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -50]) {
    const frame = routeFrame(station);
    for (const value of [...frame.position.toArray(), ...frame.forward.toArray()]) assert.ok(Number.isFinite(value));
  }
});

test('GROW-04: appending projects never moves an earlier exhibit, its frame or its facing', () => {
  const counts = [0, 1, 2, 10];
  for (let index = 1; index < counts.length; index++) {
    const smaller = layoutWorld(inputs(counts[index - 1])).stops.filter((stop) => stop.kind === 'exhibit');
    const larger = layoutWorld(inputs(counts[index])).stops.filter((stop) => stop.kind === 'exhibit');
    smaller.forEach((stop, exhibit) => {
      assert.equal(larger[exhibit].id, stop.id);
      assert.deepEqual(larger[exhibit].subject.center.toArray(), stop.subject.center.toArray());
      assert.deepEqual(larger[exhibit].subject.normal.toArray(), stop.subject.normal.toArray());
      assert.deepEqual(larger[exhibit].canvas, stop.canvas);
    });
  }
});

test('exhibits alternate sides, stand clear of the walk and face the approaching visitor', () => {
  const exhibits = layoutWorld(inputs(10)).stops.filter((stop) => stop.kind === 'exhibit');
  exhibits.forEach((stop, index) => {
    assert.equal(stop.side, index % 2 === 0 ? -1 : 1);
    const frame = routeFrame(stop.station + 5);
    const lateral = stop.subject.center.clone().sub(frame.position).dot(frame.right);
    assert.ok(Math.abs(lateral) > 3.5, 'the frame never blocks the walk');
    assert.ok(stop.subject.normal.dot(frame.forward.clone().negate()) > 0.75, 'the evidence faces back down the walk');
    assert.ok(stop.subject.center.y - stop.canvas!.height / 2 > 1.5, 'the painting hangs above the ground');
  });
});

test('evidence aspect sets the canvas without exceeding the frame limits', () => {
  for (const aspect of [0.5, 1, 16 / 9, 2, 4, Number.NaN]) {
    const exhibit = layoutWorld(inputs(1, aspect)).stops.find((stop) => stop.kind === 'exhibit')!;
    const { width, height } = exhibit.canvas!;
    assert.ok(width <= 6.2 + 1e-9 && height <= 3.6 + 1e-9);
    if (Number.isFinite(aspect)) assert.ok(Math.abs(width / height - aspect) < 1e-9);
  }
});

for (const [width, height] of [[1440, 900], [1024, 768], [390, 844], [844, 390]]) {
  test(`arrival poses keep every subject inside the region the placard leaves free at ${width}×${height}`, () => {
    const aspect = width / height;
    const fov = fovFor(aspect);
    const framing = framingFor(width, height);
    const world = layoutWorld(inputs(3));
    const rig = createRig(world.stops, fov, aspect, framing);
    const camera = new PerspectiveCamera(fov * 180 / Math.PI, aspect, 0.2, 2000);
    camera.setViewOffset(width, height, (0.5 - framing.fx) * width, (0.5 - framing.fy) * height, width, height);
    camera.updateProjectionMatrix();
    world.stops.forEach((stop, index) => {
      if (stop.fixed) return;
      const pose = rig.poses[index];
      camera.position.copy(pose.position);
      camera.lookAt(pose.target);
      camera.updateMatrixWorld();
      const { center, normal, halfWidth, halfHeight } = stop.subject;
      const across = new Vector3().crossVectors(new Vector3(0, 1, 0), normal).normalize();
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => center.clone()
        .addScaledVector(across, x * halfWidth).add(new Vector3(0, y * halfHeight, 0)).project(camera));
      const xs = corners.map((corner) => (corner.x + 1) / 2);
      const ys = corners.map((corner) => (1 - corner.y) / 2);
      // The subject sits inside its framing box, which itself stays on screen.
      assert.ok(Math.min(...xs) >= framing.fx - framing.ax / 2 - 0.02, `${stop.id} left ${Math.min(...xs)}`);
      assert.ok(Math.max(...xs) <= framing.fx + framing.ax / 2 + 0.02, `${stop.id} right ${Math.max(...xs)}`);
      assert.ok(Math.min(...ys) >= Math.max(0, framing.fy - framing.ay / 2) - 0.02, `${stop.id} top ${Math.min(...ys)}`);
      assert.ok(Math.max(...ys) <= framing.fy + framing.ay / 2 + 0.02, `${stop.id} bottom ${Math.max(...ys)}`);
      assert.ok(pose.position.y >= 1.5, 'the visitor never sinks below eye level');
    });
  });
}

test('dwell holds each stop still, then eases monotonically to the next', () => {
  assert.equal(dwell(0), 0);
  assert.equal(dwell(0.1), 0);
  assert.equal(dwell(0.9), 1);
  assert.equal(dwell(1), 1);
  assert.ok(Math.abs(dwell(0.5) - 0.5) < 1e-12);
  let previous = 0;
  for (let progress = 0; progress <= 1; progress += 0.01) {
    const value = dwell(progress);
    assert.ok(value >= previous - 1e-12);
    previous = value;
  }
});

test('damping converges independently of frame rate', () => {
  const once = damp(0, 1, 6.5, 1 / 30);
  const twice = damp(damp(0, 1, 6.5, 1 / 60), 1, 6.5, 1 / 60);
  assert.ok(Math.abs(once - twice) < 1e-12);
  assert.ok(damp(0, 1, 6.5, 2) > 0.999);
});

test('the camera path is continuous through every stop and settles exactly on arrival poses', () => {
  const world = layoutWorld(inputs(2));
  const rig = createRig(world.stops, fovFor(16 / 9), 16 / 9, framingFor(1440, 810));
  for (let stop = 0; stop < world.stops.length; stop++) {
    const at = rig.evaluate(stop);
    assert.ok(at.position.distanceTo(rig.poses[stop].position) < 1e-9);
    assert.ok(at.target.distanceTo(rig.poses[stop].target) < 1e-9);
    if (stop === 0 || stop === world.stops.length - 1) continue;
    const before = rig.evaluate(stop - 1e-6);
    const after = rig.evaluate(stop + 1e-6);
    assert.ok(before.position.distanceTo(after.position) < 1e-3);
  }
  for (let u = 0; u < world.stops.length - 1; u += 0.01) {
    const a = rig.evaluate(u);
    const b = rig.evaluate(u + 0.01);
    assert.ok(a.position.distanceTo(b.position) < 1.5, `no jump near u=${u.toFixed(2)}`);
  }
  for (const value of [Number.NaN, -3, 99]) {
    const pose = rig.evaluate(value);
    assert.ok(pose.position.toArray().every(Number.isFinite));
  }
});
