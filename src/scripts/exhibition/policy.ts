import type { ViewMode } from '../../lib/exhibition/types';

const KEY = 'exhibition-view';
let sessionChoice: ViewMode | null = null;

export function readStoredChoice(): ViewMode | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'still' || value === 'moving' ? value : null;
  } catch {
    return null;
  }
}

export function writeChoice(value: ViewMode): void {
  sessionChoice = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // The explicit choice still applies for this page when storage is unavailable.
  }
}

export const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');

export function motionPermitted(): boolean {
  const explicit = sessionChoice ?? readStoredChoice();
  if (explicit === 'still') return false;
  if (explicit === 'moving') return true;
  return !reduceQuery.matches;
}

export type { ViewMode };
