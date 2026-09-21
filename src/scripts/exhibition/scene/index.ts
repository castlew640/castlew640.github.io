import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, Fog, HemisphereLight,
  Light, Material, Mesh, PCFSoftShadowMap, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { createQualityPolicy, qualityFor } from './quality';
import { createInkMaterials } from './ink';
import { createArchitecture } from './architecture';
import { createExhibits } from './exhibit';
import { createCompletedGroup, createReflection } from './reflection';
import { createTransformations } from './transformations';
import { routeBounds, sampleRoute } from './path';

export interface SceneHandle {
  setTravel(station: number, stopId: string): void;
  hitPanel(x: number, y: number): string | null;
  resize(): void;
  dispose(): void;
}

export interface SceneOptions {
  landingStation: number;
  travel: { station: number; stopId: string };
  onFailure(reason: 'start' | 'context'): void;
  measureRender?: (render: () => void) => number;
}

declare global {
  interface Window { __exhibition?: Record<string, number | boolean | string> }
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
    renderer = new WebGLRenderer({
      canvas, antialias: true, alpha: true,
      powerPreference: 'default', failIfMajorPerformanceCaveat: false,
    });
  } catch {
    canvas.removeEventListener('webglcontextcreationerror', creationError);
    container.remove();
    return null;
  }
  let disposed = false;
  let frame = 0;
  let resizeTimer = 0;
  let diagnostics: Record<string, number | boolean | string> | null = null;
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
      diagnostics.materials = 0;
      diagnostics.mounted = false;
    }
  }
  try {
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.debug.onShaderError = () => { throw new Error('Exhibition shader compilation failed'); };

    const scene = new Scene();
    scene.fog = new Fog(0xefe4cf, 60, 240);
    const camera = new PerspectiveCamera(36, 1, 0.1, 300);
    const bounds = routeBounds(options.landingStation);
    let station = Math.max(bounds.minStation, Math.min(bounds.maxStation,
      Number.isFinite(options.travel.station) ? options.travel.station : bounds.minStation));
    const initialFrame = sampleRoute(station, bounds);
    camera.position.copy(initialFrame.position).addScaledVector(initialFrame.up, 1.62);
    const sun = new DirectionalLight('#fff4e0', 2.6);
    cleanups.push(() => sun.shadow.dispose());
    sun.castShadow = true;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 12;
    sun.shadow.camera.bottom = -12;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 4;
    const hemisphere = new HemisphereLight('#f4f0e6', '#e3e5d8', 0.55);
    const ambient = new AmbientLight('#efe4cf', 0.12);
    sun.layers.enable(2);
    hemisphere.layers.enable(2);
    ambient.layers.enable(2);
    scene.add(sun, sun.target, hemisphere, ambient);

    const quality = createQualityPolicy();
    const size = new Vector2();
    const inks = createInkMaterials(size);
    for (const ink of Object.values(inks)) cleanups.push(() => ink.dispose());
    const architecture = createArchitecture(inks, options.landingStation);
    cleanups.push(() => architecture.dispose());
    scene.add(architecture.group);
    const pointer = new Vector2();
    const raycaster = new Raycaster();
    raycaster.layers.set(1);
    let renderCount = 0;
    let qualityDirty = false;
    const exhibition = document.getElementById('exhibition')!;
    const initialBounds = exhibition.getBoundingClientRect();
    let inViewport = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
    let suspended = document.hidden || !inViewport;
    const stopIds = new Set(Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop]'))
      .map((element) => element.dataset.stopId ?? element.id));
    let currentStopId = stopIds.has(options.travel.stopId) ? options.travel.stopId : 'entrance';
    const debug: Record<string, number | boolean | string> = {
      mounted: true, suspended, renderCount: 0, lights: 0, shadowLights: 0,
      cameraX: 0, cameraY: 1.62, cameraRotationX: 0, cameraZ: camera.position.z,
      station, currentStopId, walkwayObstructions: architecture.walkwayObstructions,
    };
    diagnostics = debug;
    const exhibits = createExhibits(Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop][data-slug]')),
      inks, architecture.stone, renderer.capabilities.getMaxAnisotropy(), () => requestRender(), options.landingStation);
    cleanups.push(() => exhibits.dispose());
    scene.add(exhibits.group);
    const transformations = createTransformations(inks, architecture.stone, -options.landingStation + 10);
    cleanups.push(() => transformations.dispose());
    scene.add(transformations.group);
    const completed = createCompletedGroup([architecture.group, architecture.completed, exhibits.group, exhibits.completed, transformations.completed], architecture.stone, inks);
    let releaseCompleted = () => completed.dispose();
    cleanups.push(() => releaseCompleted());
    architecture.batch();
    const reflection = createReflection(scene, camera, renderer, completed, inks);
    // Reflection takes ownership of the completed group only after it succeeds.
    releaseCompleted = () => reflection.dispose();
    debug.transformations = transformations.elements.length;
    debug.impossibleConstructions = Number(architecture.cornice.material === architecture.stone && architecture.corniceSolidSupports === 0)
      + Number(architecture.landingRing.material === architecture.stone && architecture.landingRightMeshes === 0);
    debug.corniceSupports = architecture.corniceSupports;
    debug.corniceSolidSupports = architecture.corniceSolidSupports;
    debug.landingLeftSolid = architecture.landingLeft.material === architecture.stone;
    debug.landingRightMeshes = architecture.landingRightMeshes;
    debug.completedLayerZeroObjects = 0;
    completed.group.traverse((object) => { if (object.layers.isEnabled(0)) debug.completedLayerZeroObjects = Number(debug.completedLayerZeroObjects) + 1; });
    debug.lightsOnBothLayers = [sun, hemisphere, ambient].every((light) => light.layers.isEnabled(0) && light.layers.isEnabled(2));
    renderer.info.autoReset = false;
    debug.walkwayObstructions = architecture.walkwayObstructions + exhibits.walkwayObstructions;
    debug.pickablePanels = exhibits.panels.length;
    debug.nonPanelRaycasts = 0;
    exhibits.group.traverse((object) => {
      if (object instanceof Mesh && !exhibits.panels.includes(object as typeof exhibits.panels[number]) && object.raycast === Mesh.prototype.raycast) debug.nonPanelRaycasts = Number(debug.nonPanelRaycasts) + 1;
    });
    const materials = new Set<Material>(Object.values(inks));
    scene.traverse((object) => {
      if (object instanceof Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      if (object instanceof Light) {
        debug.lights = Number(debug.lights) + 1;
        if (object.castShadow) debug.shadowLights = Number(debug.shadowLights) + 1;
      }
    });
    debug.materials = materials.size;
    for (const group of [architecture.drawn, exhibits.group, transformations.group]) group.traverse((object) => {
      if ('geometry' in object) {
        const geometry = object.geometry as import('three').BufferGeometry;
        debug.lineSegments = Number(debug.lineSegments ?? 0) + (geometry.getAttribute('instanceStart')?.count ?? 0);
      }
    });
    window.__exhibition = debug;
    const architectureLineSegments = Number(debug.lineSegments);
    Object.values(inks).forEach((ink, index) => {
      debug[`ink${index}Width`] = ink.linewidth;
      debug[`ink${index}Color`] = ink.color.getHex();
    });

    const updateCamera = (): void => {
      const route = sampleRoute(station, bounds);
      camera.position.copy(route.position).addScaledVector(route.up, 1.62);
      camera.up.copy(route.up);
      camera.lookAt(camera.position.clone().addScaledVector(route.forward, 12));
      sun.position.copy(route.position).addScaledVector(route.right, -16.8)
        .addScaledVector(route.up, 11).addScaledVector(route.forward, -14.9);
      sun.target.position.copy(route.position).addScaledVector(route.up, 1.5).addScaledVector(route.forward, 10);
      sun.shadow.camera.updateProjectionMatrix();
      debug.station = station;
      debug.currentStopId = currentStopId;
      debug.cameraZ = camera.position.z;
      debug.cameraX = camera.position.x;
      debug.cameraY = camera.position.y;
      debug.cameraRotationX = Math.abs(camera.rotation.x) < 1e-12 ? 0 : camera.rotation.x;
      debug.cameraYaw = camera.rotation.y;
      debug.cameraRoll = Math.abs(camera.rotation.z) < 1e-12 ? 0 : camera.rotation.z;
      debug.cameraUpX = camera.up.x;
      debug.cameraUpY = camera.up.y;
      debug.cameraUpZ = camera.up.z;
      transformations.update(-station);
      transformations.elements.forEach((element, index) => {
        debug[`transformation${index}Z`] = element.z;
        debug[`transformation${index}Progress`] = element.progress;
        debug[`transformation${index}Shadow`] = element.mesh.castShadow;
        debug[`transformation${index}MeshVisible`] = element.mesh.visible;
      });
    };

    const updatePanels = (): void => {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      const current = exhibits.panels.find((panel) => panel.userData.stopId === currentStopId);
      if (!current) {
        debug.panelStopId = '';
        debug.panelTextureReady = exhibits.panels.length > 0 && exhibits.panels.every((panel) => Boolean(panel.material.map));
        debug.panelReusesImage = exhibits.panels.every((panel) => panel.material.map?.image
          === (panel.userData.stop as HTMLElement).querySelector('figure img'));
        return;
      }
      current.updateMatrixWorld(true);
      const localCorners = [new Vector3(-2, 1, 0), new Vector3(2, 1, 0), new Vector3(2, -1, 0), new Vector3(-2, -1, 0)];
      const worldCorners = localCorners.map((corner) => current.localToWorld(corner.clone()));
      const projected = worldCorners.map((corner) => corner.clone().project(camera));
      const screen = projected.map((corner) => ({ x: (corner.x + 1) / 2, y: (1 - corner.y) / 2 }));
      screen.forEach((corner, index) => {
        debug[`panelCorner${index}X`] = corner.x;
        debug[`panelCorner${index}Y`] = corner.y;
      });
      debug.panelLeft = Math.min(...screen.map((corner) => corner.x));
      debug.panelTop = Math.min(...screen.map((corner) => corner.y));
      debug.panelRight = Math.max(...screen.map((corner) => corner.x));
      debug.panelBottom = Math.max(...screen.map((corner) => corner.y));
      debug.panelMinX = -2; debug.panelMaxX = 2;
      debug.panelMinY = 3.1; debug.panelMaxY = 5.1;
      const centre = current.getWorldPosition(new Vector3());
      const normal = new Vector3(0, 0, 1).transformDirection(current.matrixWorld);
      debug.panelFacingCamera = normal.dot(camera.position.clone().sub(centre)) > 0;
      debug.panelStopId = currentStopId;
      debug.panelZ = centre.z;
      debug.panelVariant = current.userData.variant;
      debug.panelTextureReady = Boolean(current.material.map);
      debug.panelTextureSRGB = current.material.map?.colorSpace === SRGBColorSpace;
      debug.panelReusesImage = current.material.map?.image === (current.userData.stop as HTMLElement).querySelector('figure img');
    };

    const applyQuality = (): void => {
      const policy = qualityFor(size.x, window.devicePixelRatio, quality.level);
      renderer.setPixelRatio(policy.pixelRatio);
      renderer.setSize(size.x, size.y, false);
      const cssSize = renderer.getSize(new Vector2());
      for (const ink of Object.values(inks)) ink.resolution.copy(cssSize);
      transformations.resize(cssSize);
      if (sun.shadow.mapSize.x !== policy.shadowMapSize) {
        sun.shadow.map?.dispose();
        sun.shadow.map = null;
        sun.shadow.mapSize.setScalar(policy.shadowMapSize);
      }
      renderer.shadowMap.enabled = policy.shadows;
      sun.visible = ambient.visible = policy.shadows;
      debug.qualityLevel = policy.level;
      debug.pixelRatio = policy.pixelRatio;
      debug.shadowMapSize = policy.shadowMapSize;
      reflection.resize(size, window.devicePixelRatio, policy.reflection && !quality.reflectionFallback);
      debug.reflectionEnabled = reflection.enabled;
      debug.reflectionLayerMask = reflection.layerMask;
      debug.reflectionTargetWidth = reflection.targetWidth;
      debug.reflectionTargetHeight = reflection.targetHeight;
      debug.reflectionFallbackSegments = reflection.fallbackSegments;
      debug.lineSegments = architectureLineSegments + reflection.fallbackSegments;
      qualityDirty = false;
    };

    const requestRender = (): void => {
      if (disposed || suspended || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (disposed || suspended) return;
        let submissionCost = 0;
        try {
          // Changing buffer size clears the canvas. Apply quality on this requested
          // frame, never after a draw where it would erase a correctly idle image.
          if (qualityDirty) applyQuality();
          updatePanels();
          renderer.info.reset();
          reflection.beginFrame();
          const render = () => renderer.render(scene, camera);
          if (options.measureRender) submissionCost = options.measureRender(render);
          else render();
        } catch {
          dispose();
          options.onFailure('start');
          return;
        }
        debug.renderCount = ++renderCount;
        debug.drawCalls = renderer.info.render.calls;
        debug.triangles = renderer.info.render.triangles;
        debug.geometries = renderer.info.memory.geometries;
        debug.textures = renderer.info.memory.textures;
        debug.panelGpuTextures = exhibits.panels.filter((panel) => panel.material.map && (renderer.properties.get(panel.material.map) as { __webglTexture?: unknown }).__webglTexture).length;
        debug.shadowGpuTextures = [sun.shadow.map?.texture, sun.shadow.map?.depthTexture].filter((texture) => texture && (renderer.properties.get(texture) as { __webglTexture?: unknown }).__webglTexture).length;
        debug.waterGpuTextures = reflection.allocatedTextures;
        materials.clear();
        for (const ink of Object.values(inks)) materials.add(ink);
        scene.traverse((object) => {
          if (object instanceof Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        });
        debug.materials = materials.size;
        debug.renderTargetRendersPerFrame = reflection.passes;
        debug.reflectionLayerMask = reflection.layerMask;
        debug.inkCssResolution = Object.values(inks).every((ink) => ink.resolution.equals(size));
        debug.inkScreenSpace = Object.values(inks).every((ink) => !ink.worldUnits);
        if (renderCount > 1 && quality.sample(submissionCost)) qualityDirty = true;
      });
    };

    const resize = (): void => {
      if (disposed) return;
      const bounds = container.getBoundingClientRect();
      const pixelRatio = qualityFor(bounds.width, window.devicePixelRatio, quality.level).pixelRatio;
      if (bounds.width === size.x && Math.abs(bounds.height - size.y) < 8 && renderer.getPixelRatio() === pixelRatio) return;
      size.set(Math.max(1, bounds.width), Math.max(1, bounds.height));
      camera.aspect = size.x / size.y;
      camera.fov = Math.max(36, Math.min(68, 2 * Math.atan(Math.tan(32 * Math.PI / 180) / camera.aspect) * 180 / Math.PI));
      camera.updateProjectionMatrix();
      debug.fovY = camera.fov;
      debug.cssWidth = size.x;
      debug.cssHeight = size.y;
      applyQuality();
      requestRender();
    };
    const queueResize = (): void => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 80);
    };

    const updateSuspension = (): void => {
      const next = document.hidden || !inViewport;
      if (next === suspended || disposed) return;
      suspended = next;
      debug.suspended = suspended;
      if (suspended) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestRender();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      updateSuspension();
    });
    cleanups.push(() => observer.disconnect());
    observer.observe(exhibition);
    document.addEventListener('visibilitychange', updateSuspension);
    cleanups.push(() => document.removeEventListener('visibilitychange', updateSuspension));

    const contextLost = (event: Event): void => {
      event.preventDefault();
      dispose();
      options.onFailure('context');
    };
    window.addEventListener('resize', queueResize, { passive: true });
    cleanups.push(() => window.removeEventListener('resize', queueResize));
    canvas.addEventListener('webglcontextlost', contextLost);
    cleanups.push(() => canvas.removeEventListener('webglcontextlost', contextLost));
    updateCamera();
    resize();

    return {
      setTravel(nextStation, stopId) {
        if (disposed || !Number.isFinite(nextStation)) return;
        const next = Math.max(bounds.minStation, Math.min(bounds.maxStation, nextStation));
        const nextStopId = stopIds.has(stopId) ? stopId : currentStopId;
        if (next === station && nextStopId === currentStopId) return;
        station = next;
        currentStopId = nextStopId;
        updateCamera();
        // Publish projection and camera together, even before the scheduled draw.
        // Otherwise readers can observe the new pose with the previous frame's panel.
        updatePanels();
        requestRender();
      },
      hitPanel(x, y) {
        if (disposed) return null;
        const bounds = canvas.getBoundingClientRect();
        scene.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        pointer.set((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(exhibits.panels, false)[0];
        return (hit?.object.userData.stop as HTMLElement | undefined)?.dataset.slug ?? null;
      },
      resize, dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
