export interface Quality {
  level: number;
  pixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
}

/** Level 5 is where software rasterizers start; slow hardware can also reach it. */
export const MAX_QUALITY_LEVEL = 5;
export const SOFTWARE_QUALITY_LEVEL = 5;

export { isSoftwareRenderer } from '../../../lib/exhibition/graphics';

/**
 * Ambient animation (drifting clouds, walking elephants, crawling ants) runs
 * only on hardware that keeps up. Otherwise the scene renders while the visitor
 * travels or plays with something, then rests on a still frame.
 */
export function ambientAllowed(software: boolean, level: number): boolean {
  return !software && level < 3;
}

export function qualityFor(width: number, devicePixelRatio: number, level = 0): Quality {
  const ceilings = [width >= 768 ? 2 : 1.75, 1.5, 1.25, 1, 0.85, 0.6];
  const clamped = Math.min(MAX_QUALITY_LEVEL, Math.max(0, level));
  return {
    level: clamped,
    pixelRatio: Math.min(devicePixelRatio, ceilings[clamped]),
    shadows: clamped < 3,
    shadowMapSize: clamped === 0 && width >= 768 ? 2048 : 1024,
  };
}

/**
 * Frame intervals (ms) drive a reversible quality ladder. Hysteresis avoids
 * oscillation: many slow frames step down, a long run of fast frames steps up.
 */
export function createQualityPolicy(initialLevel = 0) {
  let level = Math.min(MAX_QUALITY_LEVEL, Math.max(0, initialLevel));
  let slow = 0;
  let fast = 0;
  return {
    get level() { return level; },
    sample(milliseconds: number): boolean {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) return false;
      slow = milliseconds > 28 ? slow + 1 : Math.max(0, slow - 0.5);
      fast = milliseconds < 18 ? fast + 1 : 0;
      const next = slow >= 40 ? Math.min(MAX_QUALITY_LEVEL, level + 1) : fast >= 300 ? Math.max(0, level - 1) : level;
      if (next === level) return false;
      level = next;
      slow = fast = 0;
      return true;
    },
  };
}
