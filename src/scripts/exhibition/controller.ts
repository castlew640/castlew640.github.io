import { buildStopTable } from '../../lib/exhibition/stops';
import { defaultViewReason, motionPermitted, phoneQuery, readStoredChoice, reduceQuery, writeChoice, type ViewMode } from './policy';
import { measureStops, progressFor, type MeasuredStop } from './scroll';
import { createControls } from './controls';
import { registerTap } from './tap';
import type { SceneHandle, SceneOptions } from './scene';

let sceneHandle: SceneHandle | null = null;
let sceneGeneration = 0;

export async function enterMovingView(options: SceneOptions, mounted: () => void): Promise<void> {
  if (!motionPermitted()) return;
  const generation = ++sceneGeneration;
  try {
    const { createScene } = await import('./scene');
    if (generation !== sceneGeneration || !motionPermitted()) return;
    const handle = await createScene({ ...options, measureRender(render) {
      // Submission cost only governs quality; scene geometry never reads time.
      const started = performance.now();
      render();
      return performance.now() - started;
    } });
    if (generation !== sceneGeneration || !motionPermitted()) {
      handle?.dispose();
      return;
    }
    if (!handle) { options.onFailure('start'); return; }
    sceneHandle = handle;
    document.documentElement.dataset.scene = 'active';
    mounted();
  } catch {
    if (generation === sceneGeneration) options.onFailure('start');
  }
}

export function start(): void {
  const exhibition = document.getElementById('exhibition');
  if (!exhibition) return;
  registerTap(() => sceneHandle);

  // Decide motion policy before scheduling any work or requesting scene code.
  let mode: ViewMode = motionPermitted() ? 'moving' : 'still';

  const preferences = document.createElement('div');
  preferences.className = 'view-preferences';
  preferences.setAttribute('role', 'region');
  preferences.setAttribute('aria-label', 'Exhibition view');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'view-toggle';
  toggle.dataset.viewToggle = '';
  const notice = document.createElement('p');
  notice.className = 'view-notice';
  notice.textContent = 'Still view is on because your device requests reduced motion.';
  preferences.append(toggle, notice);
  document.querySelector('.page-frame')?.prepend(preferences);
  let explicitChoice = readStoredChoice();
  let retryUsed = false;
  const failure = document.createElement('div');
  failure.className = 'exhibition-error';
  failure.setAttribute('role', 'status');
  failure.hidden = true;
  preferences.append(failure);
  const fail = (reason: 'start' | 'context'): void => {
    switchView('still');
    const heading = document.createElement('h2');
    heading.textContent = reason === 'context'
      ? 'The exhibition stopped rendering. Everything is still here to read.'
      : 'The exhibition could not start.';
    failure.replaceChildren(heading);
    if (reason === 'start') {
      const body = document.createElement('p');
      body.textContent = 'The full catalogue is below, with every project, the resume, and contact details.';
      failure.append(body);
    }
    if (!retryUsed) {
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Try the exhibition again';
      retry.addEventListener('click', () => {
        retryUsed = true;
        explicitChoice = 'moving';
        writeChoice(explicitChoice);
        toggle.focus({ preventScroll: true });
        switchView('moving');
      }, { once: true, passive: true });
      failure.append(retry);
    }
    failure.hidden = false;
  };
  const presentMode = (): void => {
    document.documentElement.dataset.view = mode;
    toggle.textContent = mode === 'still' ? 'Enter 3D exhibition' : 'Use illustrated still view';
    toggle.setAttribute('aria-pressed', String(mode === 'still'));
    const reason = defaultViewReason();
    notice.textContent = reason === 'phone'
      ? 'Illustrated still view is on. You can enter the 3D exhibition.'
      : 'Still view is on because your device requests reduced motion.';
    notice.hidden = !(mode === 'still' && explicitChoice === null && reason !== 'none');
    if (mode === 'still') {
      sceneGeneration++;
      sceneHandle?.dispose();
      sceneHandle = null;
      delete document.documentElement.dataset.scene;
    } else if (!sceneHandle) {
      failure.hidden = true;
      const travel = { station: -progress.z, stopId: stops[progress.stopIndex]?.id ?? 'entrance' };
      void enterMovingView({ landingStation: -table.stops[table.stops.length - 1].z, travel, onFailure: fail }, () => {
        // Active-scene CSS can change stop sizes; retain the native scroll projection.
        queue(true);
        sceneHandle?.setTravel(-progress.z, stops[progress.stopIndex]?.id ?? 'entrance');
      });
    }
  };

  const elements = Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop]'));
  const ids = elements.map((el) => el.dataset.stopId ?? el.id);
  const table = buildStopTable(ids.filter((id) => id.startsWith('exhibit-')).map((id) => id.slice(8)));
  const stops: MeasuredStop[] = elements.map((el, index) => ({
    id: ids[index], el, offsetTop: 0, z: table.stops[index].z,
  }));
  const controls = createControls(stops, () => mode, () => progressFor(window.scrollY, stops));
  document.querySelector('.page-frame')?.append(controls.nav);
  let progress = progressFor(window.scrollY, []);
  let measured = false;
  let frame = 0;
  let needsMeasure = false;
  let restoringView = false;

  const derive = (): void => {
    progress = progressFor(window.scrollY, stops);
    controls.update(progress);
    sceneHandle?.setTravel(-progress.z, stops[progress.stopIndex]?.id ?? 'entrance');
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
    const before = progressFor(window.scrollY, stops);
    const stopId = stops[before.stopIndex]?.id;
    restoringView = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    needsMeasure = false;
    mode = nextMode;
    presentMode();
    requestAnimationFrame(() => {
      measureStops(stops);
      const destination = stops.find((stop) => stop.id === stopId);
      if (destination) {
        const next = stops[stops.indexOf(destination) + 1] ?? destination;
        window.scrollTo({ top: destination.offsetTop + (next.offsetTop - destination.offsetTop) * before.localProgress, behavior: 'auto' });
      }
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

  presentMode();
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
  const updateImplicitMode = (): void => {
    if (explicitChoice !== null) return;
    const nextMode = motionPermitted() ? 'moving' : 'still';
    if (nextMode !== mode) switchView(nextMode);
    else presentMode();
  };
  reduceQuery.addEventListener('change', updateImplicitMode, { passive: true });
  phoneQuery.addEventListener('change', updateImplicitMode, { passive: true });
}
