import { CubicBezierCurve3, LineCurve3, Matrix4, Vector3 } from 'three';

const SEGMENT_LENGTH = 18;
const STRAIGHT_LENGTH = 12;
const LATERAL_OFFSETS = [0, 0.8, 0, -0.8] as const;
const ELEVATION_OFFSETS = [0, 0.3, 0.1, 0] as const;
const WORLD_UP = new Vector3(0, 1, 0);

export interface RouteBounds {
  minStation: number;
  maxStation: number;
}

export interface RouteFrame {
  position: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;
}

function finiteStation(value: number, fallback: number): number {
  if (Number.isNaN(value) || value === Number.NEGATIVE_INFINITY) return 0;
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function routeBounds(maxStation: number): RouteBounds {
  return { minStation: 0, maxStation: Math.max(0, finiteStation(maxStation, 0)) };
}

function anchor(index: number): Vector3 {
  const pattern = ((index % LATERAL_OFFSETS.length) + LATERAL_OFFSETS.length) % LATERAL_OFFSETS.length;
  return new Vector3(LATERAL_OFFSETS[pattern], ELEVATION_OFFSETS[pattern], -index * SEGMENT_LENGTH);
}

function segmentSample(station: number): { position: Vector3; tangent: Vector3 } {
  const segmentIndex = Math.max(0, Math.floor(station / SEGMENT_LENGTH));
  const local = station - segmentIndex * SEGMENT_LENGTH;
  const start = anchor(segmentIndex);
  if (local <= STRAIGHT_LENGTH) {
    const end = start.clone().add(new Vector3(0, 0, -STRAIGHT_LENGTH));
    const curve = new LineCurve3(start, end);
    return {
      position: curve.getPoint(Math.max(0, Math.min(1, local / STRAIGHT_LENGTH))),
      tangent: curve.getTangent(0),
    };
  }

  const next = anchor(segmentIndex + 1);
  const curve = new CubicBezierCurve3(
    start.clone().setZ(start.z - STRAIGHT_LENGTH),
    start.clone().setZ(start.z - 14),
    next.clone().setZ(start.z - 16),
    next,
  );
  const t = Math.max(0, Math.min(1, (local - STRAIGHT_LENGTH) / (SEGMENT_LENGTH - STRAIGHT_LENGTH)));
  return { position: curve.getPoint(t), tangent: curve.getTangent(t) };
}

export function sampleRoute(station: number, bounds: RouteBounds = routeBounds(Number.MAX_SAFE_INTEGER)): RouteFrame {
  const maximum = Math.max(0, finiteStation(bounds.maxStation, 0));
  const minimum = Math.max(0, Math.min(maximum, finiteStation(bounds.minStation, 0)));
  const clamped = Math.max(minimum, Math.min(maximum, finiteStation(station, maximum)));
  const { position, tangent } = segmentSample(clamped);
  const forward = tangent.setY(0).normalize();
  if (forward.lengthSq() === 0) forward.set(0, 0, -1);
  const up = WORLD_UP.clone();
  const right = forward.clone().cross(up).normalize();
  return { position, forward, right, up };
}

/** Matrix for route-local coordinates: +x right, +y up, and -z forward. */
export function routeMatrix(station: number, bounds: RouteBounds): Matrix4 {
  const frame = sampleRoute(station, bounds);
  return new Matrix4().makeBasis(frame.right, frame.up, frame.forward.clone().negate()).setPosition(frame.position);
}

export function routePoint(station: number, localX: number, localY: number, bounds: RouteBounds): Vector3 {
  const frame = sampleRoute(station, bounds);
  return frame.position.clone().addScaledVector(frame.right, localX).addScaledVector(frame.up, localY);
}

