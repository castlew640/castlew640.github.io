import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, Fog, HemisphereLight,
  Light, Material, Mesh, PCFSoftShadowMap, PerspectiveCamera, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { createQualityPolicy, qualityFor } from './quality';
import { createInkMaterials } from './ink';
import { createArchitecture } from './architecture';
import { createExhibits } from './exhibit';

export interface SceneHandle {
  setCameraZ(z: number): void;
  hitPanel(x: number, y: number): string | null;
  resize(): void;
  dispose(): void;
}

export interface SceneOptions {
  landingStopZ: number;
  cameraZ: number;
  onFailure(reason: 'start' | 'context'): void;
}

declare global {
  interface Window { __exhibition?: Record<string, number | boolean> }
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
  camera.position.set(0, 1.62, Math.max(options.landingStopZ, Math.min(0, options.cameraZ)));
  const sun = new DirectionalLight('#fff4e0', 2.6);
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
  for (const light of [sun, hemisphere, ambient]) light.layers.enable(2);
  scene.add(sun, sun.target, hemisphere, ambient);

  const quality = createQualityPolicy();
  const size = new Vector2();
  const inks = createInkMaterials(size);
  const architecture = createArchitecture(inks, options.landingStopZ);
  scene.add(architecture.group);
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  raycaster.layers.set(1);
  let disposed = false;
  let frame = 0;
  let resizeTimer = 0;
  let renderCount = 0;
  let qualityDirty = false;
  const exhibition = document.getElementById('exhibition')!;
  const initialBounds = exhibition.getBoundingClientRect();
  let inViewport = initialBounds.bottom > 0 && initialBounds.top < window.innerHeight;
  let suspended = document.hidden || !inViewport;
  const debug: Record<string, number | boolean> = {
    mounted: true, suspended, renderCount: 0, lights: 0, shadowLights: 0,
    cameraX: 0, cameraY: 1.62, cameraRotationX: 0, cameraZ: camera.position.z,
    walkwayObstructions: architecture.walkwayObstructions,
  };
  const exhibits = createExhibits(Array.from(exhibition.querySelectorAll<HTMLElement>('[data-stop][data-slug]')),
    inks, architecture.stone, renderer.capabilities.getMaxAnisotropy(), () => requestRender());
  scene.add(exhibits.group);
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
  architecture.drawn.traverse((object) => {
    if ('geometry' in object) {
      const geometry = object.geometry as import('three').BufferGeometry;
      debug.lineSegments = Number(debug.lineSegments ?? 0) + (geometry.getAttribute('instanceStart')?.count ?? 0);
    }
  });
  window.__exhibition = debug;
  Object.values(inks).forEach((ink, index) => {
    debug[`ink${index}Width`] = ink.linewidth;
    debug[`ink${index}Color`] = ink.color.getHex();
  });

  const updateCamera = (): void => {
    camera.lookAt(0, 1.62, camera.position.z - 12);
    sun.position.set(-16.8, 11, camera.position.z + 14.9);
    sun.target.position.set(0, 1.5, camera.position.z - 10);
    sun.shadow.camera.updateProjectionMatrix();
    debug.cameraZ = camera.position.z;
    debug.cameraX = camera.position.x;
    debug.cameraY = camera.position.y;
    debug.cameraRotationX = camera.rotation.x;
  };

  const updatePanels = (): void => {
    camera.updateMatrixWorld();
    const current = exhibits.panels.reduce<typeof exhibits.panels[number] | undefined>((nearest, panel) =>
      !nearest || Math.abs(panel.position.z - camera.position.z + 11.94) < Math.abs(nearest.position.z - camera.position.z + 11.94) ? panel : nearest, undefined);
    if (!current) return;
    const topLeft = new Vector3(-2, 5.1, current.position.z).project(camera);
    const bottomRight = new Vector3(2, 3.1, current.position.z).project(camera);
    debug.panelLeft = (topLeft.x + 1) / 2;
    debug.panelTop = (1 - topLeft.y) / 2;
    debug.panelRight = (bottomRight.x + 1) / 2;
    debug.panelBottom = (1 - bottomRight.y) / 2;
    debug.panelMinX = -2; debug.panelMaxX = 2;
    debug.panelMinY = 3.1; debug.panelMaxY = 5.1;
    debug.panelZ = current.position.z;
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
    debug.reflectionEnabled = policy.reflection;
    qualityDirty = false;
  };

  const requestRender = (): void => {
    if (disposed || suspended || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed || suspended) return;
      const started = performance.now();
      try {
        // Changing buffer size clears the canvas. Apply quality on this requested
        // frame, never after a draw where it would erase a correctly idle image.
        if (qualityDirty) applyQuality();
        updatePanels();
        renderer.render(scene, camera);
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
      debug.inkCssResolution = Object.values(inks).every((ink) => ink.resolution.equals(size));
      debug.inkScreenSpace = Object.values(inks).every((ink) => !ink.worldUnits);
      if (renderCount > 1 && quality.sample(performance.now() - started)) qualityDirty = true;
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
  observer.observe(exhibition);
  document.addEventListener('visibilitychange', updateSuspension);

  const contextLost = (event: Event): void => {
    event.preventDefault();
    dispose();
    options.onFailure('context');
  };
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(resizeTimer);
    window.removeEventListener('resize', queueResize);
    document.removeEventListener('visibilitychange', updateSuspension);
    observer.disconnect();
    canvas.removeEventListener('webglcontextlost', contextLost);
    canvas.removeEventListener('webglcontextcreationerror', creationError);
    exhibits.dispose();
    architecture.dispose();
    for (const ink of Object.values(inks)) ink.dispose();
    sun.shadow.dispose();
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    container.remove();
    debug.geometries = renderer.info.memory.geometries;
    debug.textures = renderer.info.memory.textures;
    debug.materials = 0;
    debug.mounted = false;
  }
  window.addEventListener('resize', queueResize, { passive: true });
  canvas.addEventListener('webglcontextlost', contextLost);
  updateCamera();
  resize();

  return {
    setCameraZ(z) {
      if (disposed || !Number.isFinite(z)) return;
      const next = Math.max(options.landingStopZ, Math.min(0, z));
      if (next === camera.position.z) return;
      camera.position.z = next;
      updateCamera();
      requestRender();
    },
    hitPanel(x, y) {
      if (disposed) return null;
      const bounds = canvas.getBoundingClientRect();
      camera.updateMatrixWorld();
      pointer.set((x - bounds.left) / bounds.width * 2 - 1, -(y - bounds.top) / bounds.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(exhibits.panels, false)[0];
      return (hit?.object.userData.stop as HTMLElement | undefined)?.dataset.slug ?? null;
    },
    resize, dispose,
  };
}
