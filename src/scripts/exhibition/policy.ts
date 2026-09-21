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
export const phoneQuery = matchMedia('(max-width: 767px), (pointer: coarse) and (max-height: 480px)');

export function defaultViewReason(): 'phone' | 'reduced-motion' | 'none' {
  if (sessionChoice ?? readStoredChoice()) return 'none';
  if (reduceQuery.matches) return 'reduced-motion';
  if (phoneQuery.matches) return 'phone';
  return 'none';
}

export function motionPermitted(): boolean {
  const explicit = sessionChoice ?? readStoredChoice();
  if (explicit === 'still') return false;
  if (explicit === 'moving') return true;
  return defaultViewReason() === 'none';
}

export type { ViewMode };
