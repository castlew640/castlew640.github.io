// Explicit extension: Node's test runner loads this module directly.
import { isSoftwareRenderer } from '../../lib/exhibition/graphics.ts';
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

export type DefaultReason = 'phone' | 'reduced-motion' | 'graphics' | 'none';

/** Pure decision table: an explicit choice wins, then reduced motion, the phone default, then slow graphics. */
export function chooseView(input: { explicit: ViewMode | null; reduce: boolean; phone: boolean; softwareGraphics: () => boolean }): { mode: ViewMode; reason: DefaultReason } {
  if (input.explicit) return { mode: input.explicit, reason: 'none' };
  if (input.reduce) return { mode: 'still', reason: 'reduced-motion' };
  if (input.phone) return { mode: 'still', reason: 'phone' };
  if (input.softwareGraphics()) return { mode: 'still', reason: 'graphics' };
  return { mode: 'moving', reason: 'none' };
}

let software: boolean | undefined;
/**
 * Whether WebGL is drawn without hardware acceleration. The head script
 * records its probe on <html data-graphics>; otherwise probe once here.
 * Missing WebGL is not "software": the scene then fails with its own message.
 */
export function softwareGraphics(): boolean {
  if (software !== undefined) return software;
  const recorded = document.documentElement.dataset.graphics;
  if (recorded) return (software = recorded === 'software');
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return (software = false);
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    software = isSoftwareRenderer(String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    software = false;
  }
  return software;
}

const current = () => chooseView({
  explicit: sessionChoice ?? readStoredChoice(), reduce: reduceQuery.matches, phone: phoneQuery.matches, softwareGraphics,
});

export function defaultViewReason(): DefaultReason {
  return current().reason;
}

export function motionPermitted(): boolean {
  return current().mode === 'moving';
}

export type { ViewMode };
