import { buildStopTable } from '../../lib/exhibition/stops';
import { motionPermitted, reduceQuery } from './policy';
import { measureStops, progressFor, type MeasuredStop } from './scroll';

export function enterMovingView(): void {
  if (!motionPermitted()) return;
  // Plan 02-06 adds the sole dynamic scene import here, after the motion gate.
}

export function start(): void {
  const exhibition = document.getElementById('exhibition');
  if (!exhibition) return;

  // Decide motion policy before scheduling any work or requesting scene code.
  let mode = motionPermitted() ? 'moving' : 'still';
  document.documentElement.dataset.view = mode;
  if (mode === 'moving') enterMovingView();

  const elements = Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop]'));
  const ids = elements.map((el) => el.dataset.stopId ?? el.id);
  const table = buildStopTable(ids.filter((id) => id.startsWith('exhibit-')).map((id) => id.slice(8)));
  const stops: MeasuredStop[] = elements.map((el, index) => ({
    id: ids[index], el, offsetTop: 0, z: table.stops[index].z,
  }));
  let progress = progressFor(window.scrollY, []);
  let measured = false;
  let frame = 0;
  let needsMeasure = false;

  const derive = (): void => {
    progress = progressFor(window.scrollY, stops);
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
    if (!measured) return;
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
    mode = motionPermitted() ? 'moving' : 'still';
    document.documentElement.dataset.view = mode;
    if (mode === 'still') delete document.documentElement.dataset.scene;
    else enterMovingView();
  }, { passive: true });
}
