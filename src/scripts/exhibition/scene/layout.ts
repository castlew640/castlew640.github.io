import { Vector3 } from 'three';

export type StopKind = 'entrance' | 'exhibit' | 'about' | 'landing';

export interface StopInput {
  id: string;
  kind: StopKind;
  station: number;
  /** Width / height of the exhibit's evidence image. */
  aspect?: number;
}

export interface RouteFrame {
  position: Vector3;
  forward: Vector3;
  right: Vector3;
}

/** What the camera frames on arrival: a rectangle facing `normal`. */
export interface Subject {
  center: Vector3;
  normal: Vector3;
  halfWidth: number;
  halfHeight: number;
}

export interface StopLayout extends StopInput {
  side: -1 | 0 | 1;
  subject: Subject;
  /** Exhibits only: canvas size and support style. */
  canvas?: { width: number; height: number };
  variant?: number;
  /** A fixed pose replaces subject framing (the entrance looks down the walk). */
  fixed?: { position: Vector3; target: Vector3 };
}

export interface Placement {
  position: Vector3;
  /** Direction the object's front (+z) faces. */
  facing: Vector3;
}

export interface WorldLayout {
  stops: StopLayout[];
  block: Placement;
  egg: Placement;
  sofa: Placement;
  stage: Placement;
  castle: Vector3;
  pathEnd: number;
}

export const UP = new Vector3(0, 1, 0);
export const FRAME_BORDER = 0.16 + 0.44;
export const EYE_HEIGHT = 1.75;

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

/** Lateral meander of the walk. It starts straight so the entrance looks down a clear axis. */
export function routeX(station: number): number {
  const s = Math.max(0, finite(station));
  const ramp = Math.min(1, s / 40);
  const eased = ramp * ramp * (3 - 2 * ramp);
  return eased * (2.6 * Math.sin((s - 20) / 27) + 0.9 * Math.sin(s / 13));
}

export function routeFrame(station: number): RouteFrame {
  const s = finite(station);
  const slope = (routeX(s + 0.05) - routeX(s - 0.05)) / 0.1;
  const forward = new Vector3(slope, 0, -1).normalize();
  const right = new Vector3().crossVectors(forward, UP).normalize();
  return { position: new Vector3(routeX(s), 0, -s), forward, right };
}

export function canvasSize(aspect?: number): { width: number; height: number } {
  const maxWidth = 6.2;
  const maxHeight = 3.6;
  const ratio = aspect !== undefined && Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  return ratio >= maxWidth / maxHeight
    ? { width: maxWidth, height: maxWidth / ratio }
    : { width: maxHeight * ratio, height: maxHeight };
}

/** Face back down the walk, turned toward its centre line by `degrees`. */
function facingFrom(frame: RouteFrame, side: number, degrees: number): Vector3 {
  const angle = degrees * Math.PI / 180;
  return frame.forward.clone().multiplyScalar(-Math.cos(angle))
    .addScaledVector(frame.right, -side * Math.sin(angle)).normalize();
}

export function layoutWorld(inputs: StopInput[]): WorldLayout {
  let exhibitIndex = 0;
  let lastExhibitStation = 2;
  let lastExhibitSide: -1 | 1 = 1;
  const stops = inputs.map((input): StopLayout => {
    const station = Math.max(0, finite(input.station));
    if (input.kind === 'exhibit') {
      const index = exhibitIndex++;
      const side: -1 | 1 = index % 2 === 0 ? -1 : 1;
      const variant = index % 3;
      const base = routeFrame(station + 5);
      const canvas = canvasSize(input.aspect);
      const lift = variant === 2 ? 1.35 : 0;
      const center = base.position.clone().addScaledVector(base.right, side * 4.9)
        .setY(1.4 + lift + FRAME_BORDER + canvas.height / 2);
      lastExhibitStation = station;
      lastExhibitSide = side;
      return {
        ...input, station, side, variant, canvas,
        subject: {
          center, normal: facingFrom(base, side, 34),
          halfWidth: canvas.width / 2 + FRAME_BORDER + 0.25,
          halfHeight: canvas.height / 2 + FRAME_BORDER + 0.2,
        },
      };
    }
    if (input.kind === 'about') {
      const base = routeFrame(station + 6);
      const center = base.position.clone().addScaledVector(base.right, 4.4).setY(1.35);
      return {
        ...input, station, side: 1,
        subject: { center, normal: facingFrom(base, 1, 30), halfWidth: 3.3, halfHeight: 1.9 },
      };
    }
    if (input.kind === 'landing') {
      const base = routeFrame(station + 10);
      const center = base.position.clone().setY(1.7);
      return {
        ...input, station, side: 0,
        subject: { center, normal: base.forward.clone().negate(), halfWidth: 5.2, halfHeight: 2.4 },
      };
    }
    const start = routeFrame(station);
    const ahead = routeFrame(station + 26);
    const position = start.position.clone().setY(EYE_HEIGHT + 0.15);
    const target = ahead.position.clone().setY(2.1);
    return {
      ...input, station, side: 0,
      subject: { center: target, normal: start.forward.clone().negate(), halfWidth: 4, halfHeight: 2 },
      fixed: { position, target },
    };
  });

  const about = stops.find((stop) => stop.kind === 'about');
  const landing = stops.find((stop) => stop.kind === 'landing');
  const blockFrame = routeFrame(13);
  const eggStation = lastExhibitStation + 16;
  const eggFrame = routeFrame(eggStation);
  const landingStation = landing?.station ?? eggStation + 40;
  const stageFrame = routeFrame(landingStation + 10);
  // Far beyond the stage and high enough to hover between the cabinet and the telephone.
  const castleFrame = routeFrame(landingStation + 135);
  return {
    stops,
    block: {
      position: blockFrame.position.clone().addScaledVector(blockFrame.right, 4.9),
      facing: facingFrom(blockFrame, 1, 40),
    },
    egg: {
      position: eggFrame.position.clone().addScaledVector(eggFrame.right, -lastExhibitSide * 4.2),
      facing: facingFrom(eggFrame, -lastExhibitSide, 30),
    },
    sofa: about
      ? { position: about.subject.center.clone().setY(0), facing: about.subject.normal.clone() }
      : { position: eggFrame.position.clone(), facing: eggFrame.forward.clone().negate() },
    stage: { position: stageFrame.position.clone(), facing: stageFrame.forward.clone().negate() },
    castle: castleFrame.position.clone().addScaledVector(castleFrame.right, 3).setY(30),
    pathEnd: landingStation + 5,
  };
}
