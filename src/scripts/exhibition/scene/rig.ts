import { Vector3 } from 'three';
// Explicit extension: Node's test runner loads this module directly.
import { routeFrame, UP, type StopLayout } from './layout.ts';

/**
 * Where the subject should sit on screen. `fx`/`fy` place the look target
 * (0..1 from the top left) so HTML placards never cover it; `ax`/`ay` are the
 * normalized half extents the subject may occupy around that point.
 */
export interface Framing {
  fx: number;
  fy: number;
  ax: number;
  ay: number;
}

export interface Pose {
  position: Vector3;
  target: Vector3;
}

/**
 * Mirrors the placard geometry in global.css: a card at the lower left
 * (desktop and landscape phones) or a bottom sheet above the travel bar.
 */
export function framingFor(width: number, height: number): Framing {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  if (h < 520 && w >= 480) {
    const left = (16 + Math.min(384, w * 0.42)) / w + 0.03;
    return { fx: (left + 0.97) / 2, fy: 0.44, ax: 0.97 - left, ay: 0.7 };
  }
  if (w < 768) {
    const header = 64;
    const sheetTop = h - 81 - 0.38 * h;
    return { fx: 0.5, fy: (header + sheetTop) / 2 / h, ax: 0.88, ay: Math.max(0.2, (sheetTop - header) / h * 0.9) };
  }
  const left = (24 + Math.min(464, w * 0.4)) / w + 0.03;
  return { fx: (left + 0.97) / 2, fy: 0.43, ax: Math.min(0.62, 0.97 - left), ay: 0.62 };
}

/** Vertical field of view in radians: wider on tall screens so the walk stays legible. */
export function fovFor(aspect: number): number {
  const horizontal = 2 * Math.atan(Math.tan(22.5 * Math.PI / 180) * 16 / 9);
  const fitted = 2 * Math.atan(Math.tan(horizontal / 2) / Math.max(0.2, aspect));
  return Math.min(68 * Math.PI / 180, Math.max(45 * Math.PI / 180, fitted));
}

export function poseFor(stop: StopLayout, fovY: number, aspect: number, framing: Framing): Pose {
  if (stop.fixed) return { position: stop.fixed.position.clone(), target: stop.fixed.target.clone() };
  const tanY = Math.tan(fovY / 2);
  const tanX = tanY * aspect;
  const { center, normal, halfWidth, halfHeight } = stop.subject;
  const distance = Math.max(5, halfWidth / (framing.ax * tanX), halfHeight / (framing.ay * tanY));
  const position = center.clone().addScaledVector(normal, distance);
  // Stand slightly below the subject's centre: the work reads as monumental
  // without leaving the viewer's eye height.
  position.y = Math.max(1.6, center.y - 0.35);
  return { position, target: center.clone() };
}

/** Smootherstep with flat dwell zones at both ends of a segment. */
export function dwell(progress: number, zone = 0.14): number {
  const t = Math.min(1, Math.max(0, (progress - zone) / (1 - 2 * zone)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, rate: number, seconds: number): number {
  return target + (current - target) * Math.exp(-rate * seconds);
}

export interface Rig {
  poses: Pose[];
  evaluate(u: number, into?: Pose): Pose;
}

export function createRig(stops: StopLayout[], fovY: number, aspect: number, framing: Framing): Rig {
  const poses = stops.map((stop) => poseFor(stop, fovY, aspect, framing));
  const forwards = stops.map((stop) => routeFrame(stop.station).forward);
  const lookAhead = stops.slice(0, -1).map((stop, index) => routeFrame((stop.station + stops[index + 1].station) / 2 + 22)
    .position.setY(2.1));
  const scratch = { a: new Vector3(), b: new Vector3() };
  return {
    poses,
    evaluate(u, into = { position: new Vector3(), target: new Vector3() }) {
      if (poses.length === 1 || !Number.isFinite(u)) {
        const pose = poses[0];
        into.position.copy(pose.position);
        into.target.copy(pose.target);
        return into;
      }
      const clamped = Math.min(poses.length - 1, Math.max(0, u));
      const index = Math.min(poses.length - 2, Math.floor(clamped));
      const t = dwell(clamped - index);
      const from = poses[index];
      const to = poses[index + 1];
      // Cubic Hermite along the walk direction, so the camera walks forward
      // between exhibits instead of sliding sideways.
      const length = from.position.distanceTo(to.position) * 0.85;
      const t2 = t * t;
      const t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1;
      const h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2;
      const h11 = t3 - t2;
      into.position.copy(from.position).multiplyScalar(h00)
        .addScaledVector(scratch.a.copy(forwards[index]).multiplyScalar(length), h10)
        .addScaledVector(to.position, h01)
        .addScaledVector(scratch.b.copy(forwards[index + 1]).multiplyScalar(length), h11);
      into.position.y = Math.max(1.5, into.position.y);
      // Quadratic Bézier through a point down the walk: mid-journey the
      // visitor looks where they are going.
      const middle = lookAhead[index];
      const u1 = 1 - t;
      into.target.copy(from.target).multiplyScalar(u1 * u1)
        .addScaledVector(middle, 2 * u1 * t)
        .addScaledVector(to.target, t * t);
      return into;
    },
  };
}

export { UP };
