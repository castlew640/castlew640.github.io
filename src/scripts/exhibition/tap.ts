import type { Pick } from '../../lib/exhibition/types';

// Structural scene seam: the tap controller never imports the renderer.
export interface PickSource {
  pick(clientX: number, clientY: number): Pick | null;
}

interface Candidate {
  id: number;
  time: number;
  x: number;
  y: number;
  scrollY: number;
  maxMove: number;
}

/**
 * Turns a deliberate single-pointer tap on the canvas into a scene pick.
 * Swipes, long presses, multi-touch and scrolls never count as taps.
 */
export function registerTap(getScene: () => PickSource | null, onPick: (pick: Pick) => void): void {
  let candidate: Candidate | null = null;
  const pointers = new Set<number>();
  const isOverCanvas = (event: PointerEvent): boolean => {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    return Boolean(element?.matches('canvas') || element?.querySelector(':scope > canvas'));
  };
  const cancel = (): void => { candidate = null; };

  window.addEventListener('pointerdown', (event) => {
    pointers.add(event.pointerId);
    cancel();
    if (pointers.size !== 1 || !event.isPrimary || event.button !== 0 || !isOverCanvas(event)) return;
    candidate = {
      id: event.pointerId, time: event.timeStamp, x: event.clientX, y: event.clientY,
      scrollY: window.scrollY, maxMove: 0,
    };
  }, { passive: true });

  window.addEventListener('pointermove', (event) => {
    if (!candidate || event.pointerId !== candidate.id) return;
    candidate.maxMove = Math.max(candidate.maxMove, Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y));
    if (candidate.maxMove > 10 || !isOverCanvas(event)) cancel();
  }, { passive: true });

  window.addEventListener('pointerout', (event) => {
    if (candidate?.id === event.pointerId && !isOverCanvas(event)) cancel();
  }, { passive: true });
  window.addEventListener('scroll', cancel, { passive: true });
  window.addEventListener('pointercancel', (event) => {
    pointers.delete(event.pointerId);
    cancel();
  }, { passive: true });
  window.addEventListener('blur', () => {
    pointers.clear();
    cancel();
  }, { passive: true });

  window.addEventListener('pointerup', (event) => {
    const tap = candidate;
    const singlePointer = pointers.size === 1;
    pointers.delete(event.pointerId);
    cancel();
    if (!tap || event.pointerId !== tap.id || !singlePointer || !event.isPrimary || !isOverCanvas(event)) return;
    if (event.timeStamp - tap.time > 500) return;
    if (Math.max(tap.maxMove, Math.hypot(event.clientX - tap.x, event.clientY - tap.y)) > 10) return;
    if (Math.abs(window.scrollY - tap.scrollY) > 4) return;
    const pick = getScene()?.pick(event.clientX, event.clientY);
    if (!pick) return;
    if (pick.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pick.slug)) return;
    onPick(pick);
  }, { passive: true });
}
