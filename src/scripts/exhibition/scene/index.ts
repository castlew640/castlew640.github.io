import {
  ACESFilmicToneMapping, DoubleSide, Fog, Group, Mesh, MeshBasicMaterial, PCFShadowMap, PerspectiveCamera,
  Raycaster, Scene, Shape, ShapeGeometry, SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type Object3D,
} from 'three';
import type { Pick } from '../../../lib/exhibition/types';
import { createFaces } from './clocks';
import { createEnvironment, palette } from './environment';
import { createExhibits } from './exhibits';
import { layoutWorld, type StopKind } from './layout';
import { createProps, PICK_LAYER, proxyBox } from './props';
import { ambientAllowed, createQualityPolicy, isSoftwareRenderer, qualityFor, SOFTWARE_QUALITY_LEVEL } from './quality';
import { createRig, damp, fovFor, framingFor, type Pose, type Rig } from './rig';

export interface SceneStop {
  id: string;
  kind: StopKind;
  station: number;
  element: HTMLElement;
  name: string;
}

export interface SceneOptions {
  stops: SceneStop[];
  /** Continuous stop parameter: stop index plus progress toward the next stop. */
  travel: number;
  onFailure(reason: 'start' | 'context'): void;
}

export interface SceneHandle {
  setTravel(u: number, immediate?: boolean): void;
  pick(x: number, y: number): Pick | null;
  setHover(id: string | null): void;
  setPointer(x: number | null, y?: number): void;
  react(id: string): void;
  setPaused(paused: boolean): void;
  wake(): void;
  resize(): void;
  dispose(): void;
}

declare global {
  interface Window { __exhibition?: Record<string, number | boolean | string> }
}

/** Ambient animation rests after this long without input, until the visitor returns. */
const IDLE_AFTER_MS = 60_000;

function chevron(): ShapeGeometry {
  const shape = new Shape();
  shape.moveTo(0, 1);
  shape.lineTo(1, -0.1);
  shape.lineTo(0.62, -0.38);
  shape.lineTo(0, 0.32);
  shape.lineTo(-0.62, -0.38);
  shape.lineTo(-1, -0.1);
  shape.closePath();
  return new ShapeGeometry(shape).rotateX(-Math.PI / 2);
}

export async function createScene(options: SceneOptions): Promise<SceneHandle | null> {
  const container = document.createElement('div');
  container.className = 'exhibition-canvas';
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.append(canvas);
  document.body.append(container);
  let renderer: WebGLRenderer;
  // Suppress the browser's context-creation status message before three can log
  // it. The caller presents the same catalogue copy for every failure cause.
  const creationError = (event: Event): void => { event.stopImmediatePropagation(); };
  canvas.addEventListener('webglcontextcreationerror', creationError);
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
  } catch {
    canvas.removeEventListener('webglcontextcreationerror', creationError);
    container.remove();
    return null;
  }
  let disposed = false;
  let frame = 0;
  let resizeTimer = 0;
  let diagnostics: Record<string, number | boolean | string> | null = null;
  let diagnosticsSoftware = false;
  // Register ownership immediately after acquisition. Setup can fail before a
  // handle exists; the same partial-safe teardown also owns normal disposal.
  const cleanups: (() => void)[] = [
    () => container.remove(),
    () => canvas.removeEventListener('webglcontextcreationerror', creationError),
    () => { if (!renderer.getContext().isContextLost()) renderer.forceContextLoss(); },
    () => renderer.dispose(),
  ];
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(resizeTimer);
    for (const cleanup of cleanups.reverse()) {
      // A failing disposer must not strand later resources or mask the setup
      // failure that the controller turns into the readable catalogue.
      try { cleanup(); } catch { /* Continue releasing the remaining owners. */ }
    }
    cleanups.length = 0;
    if (diagnostics) {
      diagnostics.geometries = renderer.info.memory.geometries;
      diagnostics.textures = renderer.info.memory.textures;
      diagnostics.mounted = false;
      diagnostics.running = false;
    }
  }

  try {
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    renderer.debug.onShaderError = () => { throw new Error('Exhibition shader compilation failed'); };

    const stops = options.stops;
    const world = layoutWorld(stops.map((stop) => {
      const img = stop.element.querySelector<HTMLImageElement>('figure[data-panel-source] img');
      const aspect = img ? Number(img.getAttribute('width')) / Number(img.getAttribute('height')) : undefined;
      return { id: stop.id, kind: stop.kind, station: stop.station, aspect };
    }));
    const scene = new Scene();
    scene.fog = new Fog(palette.haze, 110, Math.max(650, world.pathEnd + 480));
    const camera = new PerspectiveCamera(45, 1, 0.2, 2000);
    const environment = createEnvironment(renderer, world.pathEnd);
    cleanups.push(() => environment.dispose());
    scene.add(environment.group);
    scene.environment = environment.environment;
    scene.environmentIntensity = 0.85;

    const faces = createFaces();
    cleanups.push(() => faces.dispose());
    const exhibitStops = world.stops.filter((stop) => stop.kind === 'exhibit');
    const exhibitElements = stops.filter((stop) => stop.kind === 'exhibit').map((stop) => stop.element);
    const exhibits = createExhibits(exhibitStops, exhibitElements, faces.textures, renderer.capabilities.getMaxAnisotropy(), () => wake());
    cleanups.push(() => exhibits.dispose());
    scene.add(exhibits.group);
    const props = createProps(faces.textures, world);
    cleanups.push(() => props.dispose());
    scene.add(props.group);

    const arrow = new Group();
    const arrowFill = new MeshBasicMaterial({ color: '#f6efe0', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide, toneMapped: false });
    const arrowEdge = new MeshBasicMaterial({ color: '#8e4935', transparent: true, opacity: 0, depthWrite: false, side: DoubleSide, toneMapped: false });
    const arrowGeometry = chevron();
    const fill = new Mesh(arrowGeometry, arrowFill);
    const edge = new Mesh(arrowGeometry, arrowEdge);
    edge.scale.setScalar(1.16);
    edge.position.y = -0.005;
    fill.raycast = edge.raycast = () => {};
    fill.renderOrder = edge.renderOrder = 3;
    arrow.add(edge, fill);
    arrow.scale.setScalar(0.62);
    const arrowProxy = proxyBox(2.6, 0.8, 2.6, 0, 0.1, 0);
    arrow.add(arrowProxy);
    arrow.visible = false;
    scene.add(arrow);
    cleanups.push(() => { arrowGeometry.dispose(); arrowFill.dispose(); arrowEdge.dispose(); arrowProxy.geometry.dispose(); });

    const landing = stops.length - 1;
    const about = stops.findIndex((stop) => stop.kind === 'about');
    const picks: { proxy: Mesh; pick: Pick; volume: number }[] = [];
    const register = (proxy: Mesh, pick: Pick): void => {
      proxy.geometry.computeBoundingBox();
      const size = proxy.geometry.boundingBox!.getSize(new Vector3());
      picks.push({ proxy, pick, volume: size.x * size.y * size.z });
    };
    exhibits.exhibits.forEach((exhibit) => {
      const index = stops.findIndex((stop) => stop.id === exhibit.stop.id);
      const name = stops[index].name;
      register(exhibit.proxy, { id: exhibit.stop.id, kind: 'exhibit', name, action: `View ${name}`, stopIndex: index, slug: exhibit.slug });
    });
    const { props: named } = props;
    register(named.sofa.proxy, { id: 'sofa', kind: 'landmark', name: 'About', action: 'Take a seat', stopIndex: about });
    register(named.cabinet.proxy, { id: 'cabinet', kind: 'landmark', name: 'the resume', action: 'Open the resume (PDF)', stopIndex: landing });
    register(named.phone.proxy, { id: 'phone', kind: 'landmark', name: 'Contact', action: 'Ring the lobster telephone', stopIndex: landing });
    register(named.pint.proxy, { id: 'pint', kind: 'landmark', name: 'Contact', action: 'Take a sip', stopIndex: landing });
    register(named.castle.proxy, { id: 'castle', kind: 'landmark', name: 'the castle', action: 'Wave at the castle', stopIndex: landing });
    register(named.persistence.proxy, { id: 'persistence', kind: 'toy', name: 'Soft clocks', action: 'Turn back time' });
    register(named.ants.proxy, { id: 'ants', kind: 'toy', name: 'Ants', action: 'Scatter the ants' });
    register(named.egg.proxy, { id: 'egg', kind: 'toy', name: 'Egg', action: 'New work hatches here' });
    for (const key of Object.keys(named).filter((key) => key.startsWith('elephant'))) {
      register(named[key].proxy, { id: key, kind: 'toy', name: 'Elephant', action: 'Startle the elephant' });
    }
    register(arrowProxy, { id: 'arrow', kind: 'arrow', name: 'Next stop', action: 'Walk on' });
    const proxies = picks.map(({ proxy }) => proxy);

    const gl = renderer.getContext();
    const rendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const software = isSoftwareRenderer(String(gl.getParameter(rendererInfo ? rendererInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
    const quality = createQualityPolicy(software ? SOFTWARE_QUALITY_LEVEL : 0);
    diagnosticsSoftware = software;
    const size = new Vector2(1, 1);
    let rig: Rig = createRig(world.stops, camera.fov * Math.PI / 180, 1, framingFor(1, 1));
    let uTarget = Math.max(0, Math.min(landing, Number.isFinite(options.travel) ? options.travel : 0));
    let uCam = uTarget;
    const pose: Pose = { position: new Vector3(), target: new Vector3() };
    const parallax = new Vector2();
    const parallaxTarget = new Vector2();
    const right = new Vector3();
    const look = new Vector3();
    let time = 0;
    let lastFrame = 0;
    let lastInput = performance.now();
    let running = false;
    let paused = false;
    let hovered: string | null = null;
    let activeStop = -1;
    let settledIndex = -1;
    let arrowOpacity = 0;
    let arrowGoal = 0;
    let renderCount = 0;
    const exhibition = document.getElementById('exhibition')!;
    const initialBounds = exhibition.getBoundingClientRect();
    let inViewport = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
    const debug: Record<string, number | boolean | string> = {
      mounted: true, running: false, suspended: false, paused: false, idle: false, renderCount: 0,
      u: uCam, uTarget, currentStopId: stops[Math.round(uCam)]?.id ?? 'entrance',
      clocks: props.clocks.length + exhibits.exhibits.length, interactives: picks.length, softwareRenderer: diagnosticsSoftware,
      exhibitFrames: exhibits.exhibits.length, hovered: '', lastReaction: '',
    };
    diagnostics = debug;
    window.__exhibition = debug;

    const stationAt = (u: number): number => {
      const index = Math.min(stops.length - 2, Math.max(0, Math.floor(u)));
      if (stops.length < 2) return stops[0]?.station ?? 0;
      const t = Math.min(1, Math.max(0, u - index));
      return stops[index].station + (stops[index + 1].station - stops[index].station) * t;
    };

    const placeArrow = (index: number): void => {
      if (index >= landing) { arrow.visible = false; return; }
      const from = rig.poses[index];
      const to = rig.poses[index + 1];
      look.copy(from.target).sub(from.position).setY(0).normalize();
      const heading = to.position.clone().sub(from.position).setY(0).normalize();
      arrow.position.copy(from.position).addScaledVector(look, 6.2).setY(0.07);
      arrow.rotation.set(0, Math.atan2(-heading.x, -heading.z), 0);
      arrow.visible = true;
    };

    // Diagnostics for tests: where each interactive object's hit volume sits on
    // screen, as viewport fractions, while it is in front of the camera.
    const probe = new Vector3();
    const publishPicks = (): void => {
      for (const { proxy, pick } of picks) {
        proxy.geometry.boundingBox!.getCenter(probe).applyMatrix4(proxy.matrixWorld).project(camera);
        const x = (probe.x + 1) / 2;
        const y = (1 - probe.y) / 2;
        const key = `at:${pick.id}`;
        if (proxy.visible && probe.z > -1 && probe.z < 1 && x > 0 && x < 1 && y > 0 && y < 1) debug[key] = `${x.toFixed(4)},${y.toFixed(4)}`;
        else delete debug[key];
      }
    };

    const updatePanels = (): void => {
      publishPicks();
      const index = Math.round(uCam);
      const exhibit = exhibits.exhibits.find((item) => item.stop.id === stops[index]?.id);
      debug.panelStopId = exhibit ? exhibit.stop.id : '';
      debug.panelTextureReady = exhibit ? exhibit.textureReady : exhibits.exhibits.every((item) => item.textureReady);
      debug.panelTextures = exhibits.exhibits.filter((item) => item.textureReady).length;
      if (!exhibit) {
        for (const key of ['panelLeft', 'panelRight', 'panelTop', 'panelBottom']) delete debug[key];
        return;
      }
      exhibit.canvas.updateMatrixWorld(true);
      const { width, height } = exhibit.canvas.geometry.parameters;
      const corners = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, y]) => new Vector3(x * width / 2, y * height / 2, 0)
        .applyMatrix4(exhibit.canvas.matrixWorld).project(camera));
      const xs = corners.map((corner) => (corner.x + 1) / 2);
      const ys = corners.map((corner) => (1 - corner.y) / 2);
      debug.panelLeft = Math.min(...xs);
      debug.panelRight = Math.max(...xs);
      debug.panelTop = Math.min(...ys);
      debug.panelBottom = Math.max(...ys);
      debug.panelAspect = width / height;
      debug.panelImageAspect = exhibit.imageAspect;
    };

    const applyQuality = (): void => {
      const policy = qualityFor(size.x, window.devicePixelRatio, quality.level);
      renderer.setPixelRatio(policy.pixelRatio);
      renderer.setSize(size.x, size.y, false);
      if (environment.sun.shadow.mapSize.x !== policy.shadowMapSize) {
        environment.sun.shadow.map?.dispose();
        environment.sun.shadow.map = null;
        environment.sun.shadow.mapSize.setScalar(policy.shadowMapSize);
      }
      renderer.shadowMap.enabled = policy.shadows;
      environment.sun.castShadow = policy.shadows;
      debug.qualityLevel = policy.level;
      debug.pixelRatio = policy.pixelRatio;
      debug.shadows = policy.shadows;
      debug.shadowMapSize = policy.shadowMapSize;
    };

    const render = (dt: number): void => {
      uCam = Math.abs(uTarget - uCam) < 0.0004 ? uTarget : damp(uCam, uTarget, 6.5, dt);
      rig.evaluate(uCam, pose);
      parallax.x = damp(parallax.x, parallaxTarget.x, 3, dt);
      parallax.y = damp(parallax.y, parallaxTarget.y, 3, dt);
      camera.position.copy(pose.position);
      right.copy(pose.target).sub(pose.position).cross(camera.up).normalize();
      look.copy(pose.target).addScaledVector(right, parallax.x * 0.45).addScaledVector(camera.up, -parallax.y * 0.25);
      camera.lookAt(look);
      // A level horizon: the camera's right vector never tilts out of the ground plane.
      debug.horizonTilt = right.set(1, 0, 0).applyQuaternion(camera.quaternion).y;
      const nearest = Math.round(uCam);
      const settled = Math.abs(uCam - nearest) < 0.02;
      if (settled && nearest !== settledIndex) { settledIndex = nearest; placeArrow(nearest); }
      arrowGoal = settled && nearest < landing ? 1 : 0;
      arrowOpacity = Math.abs(arrowOpacity - arrowGoal) < 0.005 ? arrowGoal : damp(arrowOpacity, arrowGoal, 6, dt);
      arrowFill.opacity = arrowOpacity * 0.9;
      arrowEdge.opacity = arrowOpacity;
      arrow.position.y = 0.07 + Math.sin(time * 2.2) * 0.03;
      arrowProxy.visible = arrowOpacity > 0.5;
      // Screenshot textures follow the visitor: only exhibits near the current stop stay uploaded.
      if (nearest !== activeStop) { activeStop = nearest; exhibits.setActiveStation(stationAt(uCam)); }
      environment.update(camera, pose.target, time);
      faces.update(dt);
      props.update(time, dt, camera.position);
      exhibits.update(time, dt, camera.position);
      renderer.info.reset();
      const submitted = performance.now();
      renderer.render(scene, camera);
      // Renderer submission cost, for the measurement script; not a GPU timing.
      debug.lastSubmissionMs = performance.now() - submitted;
      debug.renderCount = ++renderCount;
      debug.u = uCam;
      debug.uTarget = uTarget;
      debug.currentStopId = stops[nearest]?.id ?? '';
      debug.cameraX = camera.position.x;
      debug.cameraY = camera.position.y;
      debug.cameraZ = camera.position.z;
      debug.drawCalls = renderer.info.render.calls;
      debug.triangles = renderer.info.render.triangles;
      debug.geometries = renderer.info.memory.geometries;
      debug.textures = renderer.info.memory.textures;
      debug.programs = renderer.info.programs?.length ?? 0;
      debug.arrowVisible = arrow.visible && arrowOpacity > 0.5;
      updatePanels();
    };

    const shouldRun = (): boolean => !disposed && !paused && !document.hidden && inViewport;
    const tick = (now: number): void => {
      frame = 0;
      if (!shouldRun()) { running = false; debug.running = false; return; }
      const interval = lastFrame ? now - lastFrame : 0;
      // Slow frames take larger steps so travel still settles in a fraction of a second.
      const dt = Math.min(0.25, interval / 1000);
      lastFrame = now;
      time += dt;
      try {
        render(dt);
      } catch {
        dispose();
        options.onFailure('start');
        return;
      }
      if (interval && quality.sample(interval)) applyQuality();
      const ambient = ambientAllowed(software, quality.level);
      debug.ambient = ambient;
      const resting = uCam === uTarget && arrowOpacity === arrowGoal && parallax.distanceTo(parallaxTarget) < 0.002;
      const idle = resting && !props.busy && !faces.rewinding
        && (!ambient || performance.now() - lastInput > IDLE_AFTER_MS);
      debug.idle = idle;
      if (idle) { running = false; debug.running = false; return; }
      frame = requestAnimationFrame(tick);
    };
    const start = (): void => {
      if (running || !shouldRun()) return;
      running = true;
      debug.running = true;
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    };
    function wake(): void {
      lastInput = performance.now();
      debug.idle = false;
      start();
    }

    const resize = (): void => {
      if (disposed) return;
      const bounds = container.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      if (width === size.x && Math.abs(height - size.y) < 8 && renderer.getPixelRatio() === qualityFor(width, window.devicePixelRatio, quality.level).pixelRatio) return;
      size.set(width, height);
      const aspect = width / height;
      const fovY = fovFor(aspect);
      const framing = framingFor(width, height);
      camera.aspect = aspect;
      camera.fov = fovY * 180 / Math.PI;
      // Lens shift: keep the subject clear of the HTML placard without turning the camera.
      camera.setViewOffset(width, height, (0.5 - framing.fx) * width, (0.5 - framing.fy) * height, width, height);
      camera.updateProjectionMatrix();
      rig = createRig(world.stops, fovY, aspect, framing);
      settledIndex = -1;
      debug.fovY = camera.fov;
      debug.cssWidth = width;
      debug.cssHeight = height;
      debug.focusX = framing.fx;
      debug.focusY = framing.fy;
      applyQuality();
      wake();
    };
    const queueResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 80);
    };

    const updateSuspension = (): void => {
      debug.suspended = document.hidden || !inViewport;
      if (shouldRun()) start();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      updateSuspension();
    });
    cleanups.push(() => observer.disconnect());
    observer.observe(exhibition);
    document.addEventListener('visibilitychange', updateSuspension);
    cleanups.push(() => document.removeEventListener('visibilitychange', updateSuspension));
    const input = (): void => wake();
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
      window.addEventListener(type, input, { passive: true });
      cleanups.push(() => window.removeEventListener(type, input));
    }
    const contextLost = (event: Event): void => {
      event.preventDefault();
      dispose();
      options.onFailure('context');
    };
    window.addEventListener('resize', queueResize, { passive: true });
    cleanups.push(() => window.removeEventListener('resize', queueResize));
    canvas.addEventListener('webglcontextlost', contextLost);
    cleanups.push(() => canvas.removeEventListener('webglcontextlost', contextLost));

    resize();
    rig.evaluate(uCam, pose);
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
    exhibits.setActiveStation(stationAt(uCam));
    await renderer.compileAsync(scene, camera);
    if (disposed) return null;
    render(0);
    start();

    const pointer = new Vector2();
    const raycaster = new Raycaster();
    raycaster.layers.set(PICK_LAYER);
    const byId = new Map(picks.map((entry) => [entry.pick.id, entry]));
    return {
      setTravel(u, immediate = false) {
        if (disposed || !Number.isFinite(u)) return;
        uTarget = Math.max(0, Math.min(landing, u));
        if (immediate) uCam = uTarget;
        wake();
      },
      pick(x, y) {
        if (disposed) return null;
        const bounds = canvas.getBoundingClientRect();
        pointer.set((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1);
        scene.updateMatrixWorld();
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(proxies, false).filter((hit) => hit.object.visible);
        if (hits.length === 0) return null;
        // Nested hit volumes (the ant watch inside the clock block) prefer the smaller one.
        const reach = hits[0].distance + 3;
        let best = byId.get(picks.find((entry) => entry.proxy === hits[0].object)!.pick.id)!;
        for (const hit of hits) {
          if (hit.distance > reach) break;
          const entry = picks.find((candidate) => candidate.proxy === hit.object as Object3D);
          if (entry && entry.volume < best.volume) best = entry;
        }
        if (best.pick.kind === 'arrow') return { ...best.pick, stopIndex: Math.min(landing, Math.round(uCam) + 1) };
        return { ...best.pick };
      },
      setHover(id) {
        if (id === hovered) return;
        hovered = id;
        debug.hovered = id ?? '';
        exhibits.exhibits.forEach((exhibit) => exhibit.setHover(exhibit.stop.id === id));
        wake();
      },
      setPointer(x, y = 0) {
        // Parallax costs a stream of frames; only hardware with ambient animation gets it.
        if (x === null || !ambientAllowed(software, quality.level)) parallaxTarget.set(0, 0);
        else parallaxTarget.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
        wake();
      },
      react(id) {
        if (disposed) return;
        debug.lastReaction = id;
        if (id === 'persistence') faces.rewind();
        named[id]?.react();
        wake();
      },
      setPaused(next) {
        paused = next;
        debug.paused = next;
        if (!next) wake();
      },
      wake,
      resize,
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
