export interface Quality {
  level: number;
  reflection: boolean;
  shadowMapSize: number;
  pixelRatio: number;
  shadows: boolean;
}

export function qualityFor(width: number, devicePixelRatio: number, level = 0): Quality {
  return {
    level,
    reflection: level < 1,
    shadowMapSize: width >= 768 && level < 2 ? 1024 : 512,
    pixelRatio: Math.min(devicePixelRatio, level >= 3 ? 1.25 : width >= 768 ? 2 : 1.75),
    shadows: level < 4,
  };
}

// Samples are renderer submission costs, not claims about physical-device GPU timings.
// Hysteresis avoids oscillation; idle time never advances this reversible ladder.
export function createQualityPolicy() {
  let level = 0;
  let slow = 0;
  let fast = 0;
  return {
    get level() { return level; },
    sample(milliseconds: number): boolean {
      slow = milliseconds > 28 ? slow + 1 : 0;
      fast = milliseconds < 14 ? fast + 1 : 0;
      const next = slow >= 12 ? Math.min(4, level + 1) : fast >= 90 ? Math.max(0, level - 1) : level;
      if (next === level) return false;
      level = next;
      slow = fast = 0;
      return true;
    },
  };
}
