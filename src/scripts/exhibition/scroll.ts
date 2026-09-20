import type { Stop } from '../../lib/exhibition/types';

export interface MeasuredStop extends Stop {
  el: HTMLElement;
  offsetTop: number;
}

export interface ScrollProgress {
  stopIndex: number;
  localProgress: number;
  z: number;
}

export function measureStops(stops: MeasuredStop[]): void {
  const scrollY = window.scrollY;
  for (const stop of stops) {
    stop.offsetTop = stop.el.getBoundingClientRect().top + scrollY;
  }
}

export function progressFor(scrollY: number, stops: { offsetTop: number; z: number }[]): ScrollProgress {
  if (stops.length === 0) return { stopIndex: 0, localProgress: 0, z: 0 };
  let stopIndex = 0;
  while (stopIndex < stops.length - 1 && scrollY >= stops[stopIndex + 1].offsetTop) stopIndex++;
  const start = stops[stopIndex];
  const end = stops[stopIndex + 1] ?? start;
  const span = end.offsetTop - start.offsetTop;
  const localProgress = span > 0 ? Math.min(1, Math.max(0, (scrollY - start.offsetTop) / span)) : 0;
  const rawZ = start.z + (end.z - start.z) * localProgress;
  return { stopIndex, localProgress, z: Math.min(0, Math.max(stops[stops.length - 1].z, rawZ)) };
}
