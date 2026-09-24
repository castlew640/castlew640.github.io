import { buildStopTable } from '../../lib/exhibition/stops';
import type { Pick } from '../../lib/exhibition/types';
import { defaultViewReason, motionPermitted, phoneQuery, readStoredChoice, reduceQuery, writeChoice, type ViewMode } from './policy';
import { measureStops, progressFor, type MeasuredStop, type ScrollProgress } from './scroll';
import { createControls } from './controls';
import { registerTap } from './tap';
import { createViewer } from './viewer';
import type { SceneHandle, SceneOptions, SceneStop } from './scene';

let sceneHandle: SceneHandle | null = null;
let sceneGeneration = 0;

export async function enterMovingView(options: SceneOptions, mounted: () => void): Promise<void> {
  if (!motionPermitted()) return;
  const generation = ++sceneGeneration;
  try {
    const { createScene } = await import('./scene');
    if (generation !== sceneGeneration || !motionPermitted()) return;
    const handle = await createScene(options);
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

const kindOf = (id: string): SceneStop['kind'] => id === 'entrance' || id === 'about' || id === 'landing' ? id : 'exhibit';

export function start(): void {
  const exhibition = document.getElementById('exhibition');
  if (!exhibition) return;
  const root = document.documentElement;
  const viewer = createViewer((open) => {
    sceneHandle?.setPaused(open);
    if (open) hideTooltip();
  });

  // Decide motion policy before scheduling any work or requesting scene code.
  let mode: ViewMode = motionPermitted() ? 'moving' : 'still';

  // Travel and the view choice share one fixed dock, reachable from anywhere on the page.
  const dock = document.createElement('div');
  dock.className = 'exhibition-dock';
  const preferences = document.createElement('div');
  preferences.className = 'view-preferences';
  preferences.setAttribute('role', 'region');
  preferences.setAttribute('aria-label', 'Exhibition view');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'view-toggle';
  toggle.dataset.viewToggle = '';
  preferences.append(toggle);
  let explicitChoice = readStoredChoice();
  let retryUsed = false;
  const failure = document.createElement('div');
  failure.className = 'exhibition-error';
  failure.setAttribute('role', 'status');
  failure.hidden = true;
  document.querySelector('main')?.prepend(failure);
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

  const elements = Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop]'));
  const ids = elements.map((el) => el.dataset.stopId ?? el.id);
  const table = buildStopTable(ids.filter((id) => id.startsWith('exhibit-')).map((id) => id.slice(8)));
  const stops: MeasuredStop[] = elements.map((el, index) => ({
    id: ids[index], el, offsetTop: 0, z: table.stops[index].z,
  }));
  const names = elements.map((el, index) => el.dataset.stopName ?? ids[index]);
  const sceneStops: SceneStop[] = elements.map((el, index) => ({
    id: ids[index], kind: kindOf(ids[index]), station: -table.stops[index].z, element: el,
    name: el.dataset.stopTitle ?? names[index],
  }));
  const controls = createControls(stops, names, () => mode, () => progressFor(window.scrollY, stops));
  dock.append(controls.nav, preferences);
  document.querySelector('.page-frame')?.append(dock);
  let progress: ScrollProgress = progressFor(window.scrollY, []);
  let measured = false;
  let frame = 0;
  let needsMeasure = false;
  let restoringView = false;
  let currentStop = -1;

  const travelParameter = (value: ScrollProgress): number => value.stopIndex + value.localProgress;
  const setCurrent = (index: number): void => {
    if (index === currentStop) return;
    stops[currentStop]?.el.removeAttribute('data-current');
    stops[index]?.el.setAttribute('data-current', '');
    currentStop = index;
    controls.setCurrent(index);
  };
  const liveTop = (index: number): number => stops[index].el.getBoundingClientRect().top + window.scrollY;
  const arrivedAt = (index: number): boolean => Math.abs(travelParameter(progressFor(window.scrollY, stops)) - index) < 0.25;
  const travelTo = (index: number, smooth = true): void => {
    if (!stops[index]) return;
    window.scrollTo({ top: liveTop(index), behavior: smooth && mode === 'moving' && !reduceQuery.matches ? 'smooth' : 'auto' });
  };
  const stopIndexFor = (target: Element | null): number => {
    if (!target) return -1;
    const stop = target.closest<HTMLElement>('[data-stop]') ?? target.querySelector<HTMLElement>('[data-stop]');
    return stop ? stops.findIndex((item) => item.el === stop) : -1;
  };

  const presentMode = (): void => {
    root.dataset.view = mode;
    // The dock shows a short caption; the full label stays in the accessible name.
    const part = (text: string, visible: boolean): HTMLSpanElement => {
      const span = document.createElement('span');
      span.className = visible ? 'toggle-short' : 'toggle-long';
      span.textContent = text;
      return span;
    };
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(icon.namespaceURI, 'path');
    // A cube to enter 3D; a framed picture to return to the illustrated view.
    path.setAttribute('d', mode === 'still'
      ? 'M12 3 20 7.5v9L12 21l-8-4.5v-9zm0 0v9m0 0 8-4.5M12 12l-8-4.5'
      : 'M4 5h16v14H4zm3 3h10v8H7zm0 8 3.5-4 2.5 2.5 1.5-1.5 2.5 3');
    icon.append(path);
    toggle.replaceChildren(icon, ...(mode === 'still'
      ? [part('Enter ', false), part('3D', true), part(' exhibition', false)]
      : [part('Use illustrated ', false), part('still', true), part(' view', false)]));
    toggle.setAttribute('aria-pressed', String(mode === 'still'));
    // The notice is in the page from the start; naming the reason reveals it.
    const reason = defaultViewReason();
    if (mode === 'still' && explicitChoice === null && reason !== 'none') root.dataset.viewReason = reason;
    else delete root.dataset.viewReason;
    if (mode === 'still') {
      sceneGeneration++;
      sceneHandle?.dispose();
      sceneHandle = null;
      delete root.dataset.scene;
      hideTooltip();
    } else if (!sceneHandle) {
      failure.hidden = true;
      void enterMovingView({ stops: sceneStops, travel: travelParameter(progress), onFailure: fail }, () => {
        // Active-scene CSS can change stop sizes; retain the native scroll projection.
        queue(true);
        sceneHandle?.setTravel(travelParameter(progress), true);
      });
    }
  };

  const derive = (): void => {
    progress = progressFor(window.scrollY, stops);
    controls.update(progress);
    // The camera dwells at each stop, so the placard switches at the midpoint.
    setCurrent(Math.min(stops.length - 1, Math.round(travelParameter(progress))));
    sceneHandle?.setTravel(travelParameter(progress));
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

  /** Hash targets inside a placard have no scroll position of their own in 3D; travel to their stop. */
  const revealHash = (smooth: boolean): void => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    const index = stopIndexFor(target);
    if (mode === 'moving' && index >= 0 && !arrivedAt(index) && target !== stops[index].el) travelTo(index, smooth);
    target.focus({ preventScroll: true });
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

  // ——— Scene picks: walk to what you tap; on arrival, open or play with it.
  const ring = (): void => {
    const email = document.querySelector<HTMLElement>('.email-link');
    if (!email) return;
    email.classList.remove('is-ringing');
    void email.offsetWidth;
    email.classList.add('is-ringing');
  };
  const activate = (pick: Pick): void => {
    if (pick.kind === 'arrow') { if (pick.stopIndex !== undefined) travelTo(pick.stopIndex); return; }
    if (pick.kind === 'toy') { sceneHandle?.react(pick.id); return; }
    if (pick.stopIndex !== undefined && pick.stopIndex >= 0 && !arrivedAt(pick.stopIndex)) { travelTo(pick.stopIndex); return; }
    if (pick.kind === 'exhibit' && pick.slug && pick.stopIndex !== undefined) {
      viewer.open(pick.slug, stops[pick.stopIndex]?.el.querySelector<HTMLElement>('[data-view-exhibit]') ?? null);
      return;
    }
    sceneHandle?.react(pick.id);
    if (pick.id === 'cabinet') {
      const resume = document.querySelector<HTMLAnchorElement>('#resume a[href$=".pdf"]');
      window.setTimeout(() => resume?.click(), reduceQuery.matches ? 0 : 650);
    }
    if (pick.id === 'phone') ring();
  };
  registerTap(() => sceneHandle, activate);

  // ——— Hover: a label and a pointer cursor for anything that responds.
  const tooltip = document.createElement('div');
  tooltip.className = 'scene-tooltip';
  tooltip.setAttribute('aria-hidden', 'true');
  tooltip.hidden = true;
  document.body.append(tooltip);
  function hideTooltip(): void {
    tooltip.hidden = true;
    delete root.dataset.hover;
    sceneHandle?.setHover(null);
  }
  let hoverFrame = 0;
  let hoverEvent: PointerEvent | null = null;
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !sceneHandle || viewer.openSlug) return;
    hoverEvent = event;
    if (hoverFrame) return;
    hoverFrame = requestAnimationFrame(() => {
      hoverFrame = 0;
      const pointer = hoverEvent;
      if (!pointer || !sceneHandle) return;
      const element = document.elementFromPoint(pointer.clientX, pointer.clientY);
      const overCanvas = Boolean(element?.matches('canvas'));
      sceneHandle.setPointer(overCanvas ? pointer.clientX / window.innerWidth * 2 - 1 : null, pointer.clientY / window.innerHeight * 2 - 1);
      const pick = overCanvas ? sceneHandle.pick(pointer.clientX, pointer.clientY) : null;
      if (!pick) { hideTooltip(); return; }
      const far = (pick.kind === 'exhibit' || pick.kind === 'landmark') && pick.stopIndex !== undefined && !arrivedAt(pick.stopIndex);
      tooltip.textContent = far ? `Walk to ${pick.name}` : pick.kind === 'arrow' ? `Walk on to ${names[pick.stopIndex ?? 0] ?? 'the next stop'}` : pick.action;
      tooltip.hidden = false;
      const x = Math.min(window.innerWidth - tooltip.offsetWidth - 12, pointer.clientX + 16);
      const y = Math.min(window.innerHeight - tooltip.offsetHeight - 12, pointer.clientY + 18);
      tooltip.style.transform = `translate(${x}px, ${y}px)`;
      root.dataset.hover = 'pick';
      sceneHandle.setHover(pick.id);
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { hideTooltip(); sceneHandle?.setPointer(null); }, { passive: true });

  // ——— In 3D, in-page links travel to the stop that holds their target.
  document.addEventListener('click', (event) => {
    if (mode !== 'moving' || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    const index = stopIndexFor(target);
    if (!target || index < 0) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(history.state, '', url.hash);
    travelTo(index);
    target.focus({ preventScroll: true });
  });
  // Keyboard focus inside another stop's placard brings that stop into view.
  document.addEventListener('focusin', (event) => {
    if (mode !== 'moving' || viewer.openSlug) return;
    const index = stopIndexFor(event.target as Element);
    if (index >= 0 && index !== currentStop && !arrivedAt(index)) travelTo(index);
  });

  const observer = new ResizeObserver(() => queue(true));
  const loaded = (): void => {
    requestAnimationFrame(() => {
      measureStops(stops);
      measured = true;
      derive();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!navigation || navigation.type === 'navigate') revealHash(false);
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
    if (!historyArrival) revealHash(true);
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
