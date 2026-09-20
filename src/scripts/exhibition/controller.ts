import { buildStopTable } from '../../lib/exhibition/stops';
import { motionPermitted, readStoredChoice, reduceQuery, writeChoice, type ViewMode } from './policy';
import { measureStops, progressFor, type MeasuredStop } from './scroll';
import { createControls } from './controls';

export function enterMovingView(): void {
  if (!motionPermitted()) return;
  // Plan 02-06 adds the sole dynamic scene import here, after the motion gate.
}

export function start(): void {
  const exhibition = document.getElementById('exhibition');
  if (!exhibition) return;

  // Decide motion policy before scheduling any work or requesting scene code.
  let mode: ViewMode = motionPermitted() ? 'moving' : 'still';

  const preferences = document.createElement('div');
  preferences.className = 'view-preferences';
  preferences.setAttribute('role', 'region');
  preferences.setAttribute('aria-label', 'Exhibition view');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'view-toggle';
  toggle.textContent = 'Still view';
  const notice = document.createElement('p');
  notice.className = 'view-notice';
  notice.textContent = 'Still view is on because your device requests reduced motion.';
  preferences.append(toggle, notice);
  document.querySelector('.page-frame')?.prepend(preferences);
  let explicitChoice = readStoredChoice();
  const presentMode = (): void => {
    document.documentElement.dataset.view = mode;
    toggle.setAttribute('aria-pressed', String(mode === 'still'));
    notice.hidden = !(mode === 'still' && reduceQuery.matches && explicitChoice === null);
    if (mode === 'still') delete document.documentElement.dataset.scene;
    else enterMovingView();
  };
  presentMode();

  const elements = Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop]'));
  const ids = elements.map((el) => el.dataset.stopId ?? el.id);
  const table = buildStopTable(ids.filter((id) => id.startsWith('exhibit-')).map((id) => id.slice(8)));
  const stops: MeasuredStop[] = elements.map((el, index) => ({
    id: ids[index], el, offsetTop: 0, z: table.stops[index].z,
  }));
  const controls = createControls(stops, () => mode);
  document.querySelector('.page-frame')?.append(controls.nav);
  let progress = progressFor(window.scrollY, []);
  let measured = false;
  let frame = 0;
  let needsMeasure = false;
  let restoringView = false;

  const derive = (): void => {
    progress = progressFor(window.scrollY, stops);
    controls.update(progress.stopIndex);
  };

  const remeasure = (): void => {
    const previousOffsets = stops.map((stop) => stop.offsetTop);
    const withinTravel = stops.length > 0 && window.scrollY >= stops[0].offsetTop
      && window.scrollY <= stops[stops.length - 1].offsetTop;
    measureStops(stops);
    const changed = stops.some((stop, index) => Math.abs(stop.offsetTop - previousOffsets[index]) > 0.5);
    if (changed && withinTravel) {
      const start = stops[progress.stopIndex];
      const end = stops[progress.stopIndex + 1] ?? start;
      window.scrollTo({ top: start.offsetTop + (end.offsetTop - start.offsetTop) * progress.localProgress, behavior: 'auto' });
    }
    derive();
  };

  const queue = (remeasureStops = false): void => {
    if (!measured || restoringView) return;
    needsMeasure ||= remeasureStops;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (needsMeasure) remeasure();
      else derive();
      needsMeasure = false;
    });
  };

  const focusHash = (): void => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.focus({ preventScroll: true });
  };

  const switchView = (nextMode: ViewMode): void => {
    const currentStop = stops.reduce<MeasuredStop | undefined>((nearest, stop) =>
      !nearest || Math.abs(stop.el.getBoundingClientRect().top) < Math.abs(nearest.el.getBoundingClientRect().top)
        ? stop : nearest, undefined);
    const stopId = currentStop?.id;
    restoringView = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    needsMeasure = false;
    mode = nextMode;
    presentMode();
    requestAnimationFrame(() => {
      measureStops(stops);
      const destination = stops.find((stop) => stop.id === stopId);
      if (destination) window.scrollTo({ top: destination.offsetTop, behavior: 'auto' });
      derive();
      restoringView = false;
    });
  };

  toggle.addEventListener('click', () => {
    explicitChoice = mode === 'still' ? 'moving' : 'still';
    writeChoice(explicitChoice);
    switchView(explicitChoice);
  }, { passive: true });

  const observer = new ResizeObserver(() => queue(true));
  const loaded = (): void => {
    requestAnimationFrame(() => {
      measureStops(stops);
      measured = true;
      derive();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!navigation || navigation.type === 'navigate') focusHash();
      observer.observe(exhibition);
    });
  };

  if (document.readyState === 'complete') loaded();
  else window.addEventListener('load', loaded, { once: true, passive: true });
  window.addEventListener('scroll', () => queue(), { passive: true });
  window.addEventListener('resize', () => queue(true), { passive: true });
  window.addEventListener('orientationchange', () => queue(true), { passive: true });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    needsMeasure = false;
    measureStops(stops);
    measured = true;
    derive();
  }, { passive: true });
  let historyArrival = false;
  window.addEventListener('popstate', () => { historyArrival = true; }, { passive: true });
  window.addEventListener('hashchange', () => {
    if (!historyArrival) focusHash();
    historyArrival = false;
  }, { passive: true });
  reduceQuery.addEventListener('change', () => {
    const nextMode = motionPermitted() ? 'moving' : 'still';
    if (nextMode !== mode) switchView(nextMode);
    else presentMode();
  }, { passive: true });
}
