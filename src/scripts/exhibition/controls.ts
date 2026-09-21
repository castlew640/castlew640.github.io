import { reduceQuery, type ViewMode } from './policy';
import type { ScrollProgress } from './scroll';

export function createControls(
  stops: { offsetTop: number; el?: HTMLElement }[],
  getMode: () => ViewMode,
  getProgress: () => ScrollProgress,
): { nav: HTMLElement; update: (progress: ScrollProgress) => void } {
  const nav = document.createElement('nav');
  nav.className = 'exhibition-controls';
  nav.setAttribute('aria-label', 'Exhibition travel');
  // A position-only layout shift need not resize the exhibition, so cached
  // offsets can lag behind the document. Read live positions for arrow actions
  // and allow native scrolling to round within half a CSS pixel at any DPR.
  const arrivalTolerance = 0.5;
  const positions = (): number[] => stops.map((stop) => stop.el
    ? stop.el.getBoundingClientRect().top + window.scrollY : stop.offsetTop);
  const indexAt = (initial: number, offsets: number[]): number => {
    let index = Math.min(initial, Math.max(0, offsets.length - 1));
    while (index > 0 && window.scrollY < offsets[index] - arrivalTolerance) index--;
    while (index < offsets.length - 1 && window.scrollY >= offsets[index + 1] - arrivalTolerance) index++;
    return index;
  };

  const createButton = (direction: -1 | 1): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', direction === -1 ? 'Previous exhibit' : 'Next exhibit');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('aria-hidden', 'true');
    const chevron = document.createElementNS(svg.namespaceURI, 'path');
    chevron.setAttribute('d', direction === 1 ? 'M3 16 12 6 21 16 12 12Z' : 'M3 8 12 18 21 8 12 12Z');
    svg.append(chevron);
    const caption = document.createElement('span');
    caption.textContent = direction === -1 ? 'Back' : 'Forward';
    button.append(svg, caption);
    button.addEventListener('click', () => {
      // Read native progress at activation, including during a smooth trip or
      // before the next scroll frame has updated the controls.
      const offsets = positions();
      const current = indexAt(getProgress().stopIndex, offsets);
      const start = offsets[current];
      if (start === undefined) return;
      const pastStart = window.scrollY > start + arrivalTolerance;
      const destination = offsets[direction === -1 && pastStart ? current : current + direction];
      if (destination === undefined) return;
      window.scrollTo({
        top: destination,
        behavior: reduceQuery.matches || getMode() === 'still' ? 'auto' : 'smooth',
      });
    }, { passive: true });
    return button;
  };

  const back = createButton(-1);
  const marker = document.createElement('span');
  marker.className = 'exhibition-marker';
  marker.setAttribute('aria-hidden', 'true');
  const forward = createButton(1);
  const status = document.createElement('p');
  status.className = 'exhibition-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  nav.append(back, marker, forward, status);

  const update = (progress: ScrollProgress): void => {
    const offsets = positions();
    nav.dataset.stopIndex = String(indexAt(progress.stopIndex, offsets));
    const atStart = offsets.length === 0 || window.scrollY <= offsets[0] + arrivalTolerance;
    const atEnd = offsets.length === 0 || window.scrollY >= offsets[offsets.length - 1] - arrivalTolerance;
    back.setAttribute('aria-disabled', String(atStart));
    forward.setAttribute('aria-disabled', String(atEnd));
    back.classList.toggle('is-endpoint', atStart);
    forward.classList.toggle('is-endpoint', atEnd);
    const message = atStart ? 'Entrance — the exhibition starts here.' : atEnd ? 'End of the exhibition.' : '';
    if (status.textContent !== message) status.textContent = message;
  };
  update(getProgress());
  return { nav, update };
}
