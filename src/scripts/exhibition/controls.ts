import { reduceQuery, type ViewMode } from './policy';

export function createControls(
  stops: { offsetTop: number }[],
  getMode: () => ViewMode,
): { nav: HTMLElement; update: (stopIndex: number) => void } {
  const nav = document.createElement('nav');
  nav.className = 'exhibition-controls';
  nav.setAttribute('aria-label', 'Exhibition travel');
  let current = 0;

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
      const destination = stops[current + direction];
      if (!destination) return;
      window.scrollTo({
        top: destination.offsetTop,
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

  const update = (stopIndex: number): void => {
    current = stopIndex;
    nav.dataset.stopIndex = String(current);
    const atStart = current === 0;
    const atEnd = current === stops.length - 1;
    back.setAttribute('aria-disabled', String(atStart));
    forward.setAttribute('aria-disabled', String(atEnd));
    back.classList.toggle('is-endpoint', atStart);
    forward.classList.toggle('is-endpoint', atEnd);
    const message = atStart ? 'Entrance — the exhibition starts here.' : atEnd ? 'End of the exhibition.' : '';
    if (status.textContent !== message) status.textContent = message;
  };
  update(0);
  return { nav, update };
}
