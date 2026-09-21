import {
  BoxGeometry, BufferGeometry, CanvasTexture, Color, EdgesGeometry, Float32BufferAttribute, Group, Matrix4,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Quaternion, ShaderMaterial,
  SRGBColorSpace, UniformsLib, UniformsUtils, Vector3, type PerspectiveCamera, type Scene, type Vector2, type WebGLRenderer,
} from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { segments, type Inks } from './ink';
import { routeBounds, sampleRoute } from './path';

const waterShader = {
  name: 'CompletedArchitectureWater',
  uniforms: UniformsUtils.merge([UniformsLib.fog, {
    color: { value: new Color('#e3e5d8') }, tDiffuse: { value: null }, textureMatrix: { value: new Matrix4() },
  }]),
  vertexShader: `
    uniform mat4 textureMatrix;
    varying vec4 reflectionUv;
    attribute float routeDistance;
    varying float waterRouteDistance;
    #include <fog_pars_vertex>
    void main() {
      reflectionUv = textureMatrix * vec4(position, 1.0);
      waterRouteDistance = routeDistance;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    uniform vec3 color;
    uniform sampler2D tDiffuse;
    varying vec4 reflectionUv;
    varying float waterRouteDistance;
    #include <fog_pars_fragment>
    void main() {
      vec4 reflection = texture2DProj(tDiffuse, reflectionUv);
      float strength = 0.42 * clamp((26.0 - waterRouteDistance) / 23.0, 0.0, 1.0);
      gl_FragColor = vec4(mix(color, reflection.rgb, strength * reflection.a), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #include <fog_fragment>
    }`,
};

// Complete only structural members; construction guides and annotation remain ink.
// Batch the finished mass into one draw, sharing the same stone and panel materials.
export function createCompletedGroup(sources: Group[], stone: MeshStandardMaterial, inks: Inks) {
  const group = new Group();
  group.name = 'completed-architecture';
  const geometries: BufferGeometry[] = [];
  const silhouettes: number[] = [];
  const completedEdges: number[] = [];
  const color = new Color('#ece6d6');
  const add = (geometry: BufferGeometry): void => {
    geometry.deleteAttribute('uv');
    if (!geometry.getAttribute('color')) {
      const values: number[] = [];
      for (let i = 0; i < geometry.getAttribute('position').count; i++) values.push(color.r, color.g, color.b);
      geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
    }
    const unindexed = geometry.index ? geometry.toNonIndexed() : geometry;
    if (unindexed !== geometry) geometry.dispose();
    geometries.push(unindexed);
    unindexed.computeBoundingBox();
    const { max } = unindexed.boundingBox!;
    // Select actual transformed structural edges. Floor tessellation is not a
    // silhouette; cap each member's strokes to keep growing catalogues bounded.
    if (max.y > 0.2) {
      const edges = new EdgesGeometry(unindexed, 24);
      const positions = edges.getAttribute('position');
      const step = Math.max(1, Math.ceil(positions.count / 24));
      for (let index = 0; index + 1 < positions.count; index += 2 * step) {
        const a = new Vector3().fromBufferAttribute(positions, index);
        const b = new Vector3().fromBufferAttribute(positions, index + 1);
        if (a.distanceToSquared(b) < 0.0625) continue;
        completedEdges.push(...a.toArray(), ...b.toArray());
        silhouettes.push(a.x, -a.y, a.z, b.x, -b.y, b.z);
      }
      edges.dispose();
    }
  };
  for (const source of sources) {
    source.updateMatrixWorld(true);
    source.traverse((object) => {
      if (!(object instanceof Mesh) || object.userData.excludeCompletion) return;
      if (object.material === stone) add(object.geometry.clone().applyMatrix4(object.matrixWorld));
      else if (object.material === inks.unbuilt) {
        const starts = object.geometry.getAttribute('instanceStart');
        const ends = object.geometry.getAttribute('instanceEnd');
        for (let i = 0; i < (starts?.count ?? 0); i++) {
          const a = new Vector3().fromBufferAttribute(starts, i).applyMatrix4(object.matrixWorld);
          const b = new Vector3().fromBufferAttribute(ends, i).applyMatrix4(object.matrixWorld);
          const direction = b.clone().sub(a);
          if (direction.length() < 0.01) continue;
          const geometry = new BoxGeometry(0.2, direction.length(), 0.2);
          geometry.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()));
          geometry.translate(...a.add(b).multiplyScalar(0.5).toArray());
          add(geometry);
        }
      } else if (object.userData.stop) {
        const panel = new Mesh(object.geometry, object.material);
        panel.applyMatrix4(object.matrixWorld);
        panel.raycast = () => {};
        group.add(panel);
      }
    });
  }
  // Keep the fallback a sparse drawing even when additional project portals
  // expand the completed world. Sampling after traversal represents the full
  // route instead of exhausting the ink budget at the entrance.
  const edgeCount = silhouettes.length / 6;
  if (edgeCount > 120) {
    const selected = Array.from({ length: 120 }, (_, index) => Math.floor(index * edgeCount / 120));
    const sparseSilhouettes = selected.flatMap((index) => silhouettes.slice(index * 6, index * 6 + 6));
    const sparseEdges = selected.flatMap((index) => completedEdges.slice(index * 6, index * 6 + 6));
    silhouettes.splice(0, silhouettes.length, ...sparseSilhouettes);
    completedEdges.splice(0, completedEdges.length, ...sparseEdges);
  }
  const merged = mergeGeometries(geometries)!;
  geometries.forEach((geometry) => geometry.dispose());
  group.add(new Mesh(merged, stone));
  group.traverse((object) => { object.layers.set(2); object.raycast = () => {}; });
  return { group, silhouettes, completedEdges, dispose() { merged.dispose(); } };
}

export function createReflection(scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer,
  completed: ReturnType<typeof createCompletedGroup>, inks: Inks, landingStation: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Reflection texture could not be created');
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#e9dcc4'); gradient.addColorStop(0.28, '#efe4cf'); gradient.addColorStop(1, '#f4f0e6');
  context.fillStyle = gradient; context.fillRect(0, 0, 64, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  scene.add(completed.group);
  const bounds = routeBounds(landingStation + 36);
  const centerline: Vector3[] = [];
  for (let station = 0; station <= bounds.maxStation; station++) centerline.push(sampleRoute(station, bounds).position);
  if (bounds.maxStation % 1 !== 0) centerline.push(sampleRoute(bounds.maxStation, bounds).position);
  const minX = Math.min(...centerline.map((point) => point.x)) - 30;
  const maxX = Math.max(...centerline.map((point) => point.x)) + 30;
  const minZ = Math.min(...centerline.map((point) => point.z)) - 20;
  const maxZ = Math.max(...centerline.map((point) => point.z)) + 20;
  const width = maxX - minX;
  const depth = maxZ - minZ;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const geometry = new PlaneGeometry(width, depth, Math.ceil(width / 2), Math.ceil(depth / 2));
  const positions = geometry.getAttribute('position');
  const distances: number[] = [];
  for (let index = 0; index < positions.count; index++) {
    const worldX = centerX + positions.getX(index);
    const worldZ = centerZ - positions.getY(index);
    let square = Number.POSITIVE_INFINITY;
    for (const point of centerline) square = Math.min(square, (worldX - point.x) ** 2 + (worldZ - point.z) ** 2);
    distances.push(Math.sqrt(square));
  }
  geometry.setAttribute('routeDistance', new Float32BufferAttribute(distances, 1));
  const fallbackMaterial = new MeshBasicMaterial({ color: '#e3e5d8', transparent: true, opacity: 0.65, depthWrite: false, toneMapped: false });
  fallbackMaterial.map = texture;
  const fallback = new Mesh(geometry, fallbackMaterial);
  fallback.rotation.x = -Math.PI / 2; fallback.position.set(centerX, 0, centerZ);
  fallback.raycast = () => {};
  // Reuse the datum ink; per-draw opacity adds no persistent material.
  const drawing = segments(completed.silhouettes, inks.construction, true);
  const beforeDrawing = drawing.onBeforeRender;
  inks.construction.transparent = true;
  drawing.onBeforeRender = function (...args) { beforeDrawing.apply(this, args); inks.construction.opacity = 0.5; inks.construction.uniformsNeedUpdate = true; };
  drawing.onAfterRender = () => { inks.construction.opacity = 1; };
  scene.add(fallback, drawing);
  let reflector: Reflector | null = null;
  let failed = false;
  let passes = 0;
  const releaseTarget = (): void => {
    if (!reflector) return;
    scene.remove(reflector);
    reflector.dispose();
    reflector = null;
  };
  function resize(size: Vector2, deviceDpr: number, permitted: boolean): void {
    const enabled = permitted && size.x * deviceDpr >= 700 && !failed;
    if (!enabled) releaseTarget();
    else {
      const width = Math.min(1024, Math.round(size.x * deviceDpr));
      const height = Math.max(1, Math.round(Math.min(1024, size.y * deviceDpr) * 0.5));
      try {
        // Reflector allocates an RGBA HalfFloat target. Initialization can leave
        // an unusable attachment without throwing, so validate the actual FBO.
        if (!renderer.extensions.has('EXT_color_buffer_float') && !renderer.extensions.has('EXT_color_buffer_half_float')) {
          throw new Error('Reflection colour attachment is unavailable');
        }
        if (!reflector) {
          reflector = new Reflector(geometry, { textureWidth: width, textureHeight: height,
            multisample: deviceDpr > 1.5 ? 0 : 4, shader: waterShader, color: '#e3e5d8' });
          reflector.getReflectionCamera(camera).layers.set(2);
          reflector.rotation.x = -Math.PI / 2; reflector.position.set(centerX, 0, centerZ);
          (reflector.material as ShaderMaterial).fog = true;
          reflector.raycast = () => {};
          const renderReflection = reflector.onBeforeRender;
          reflector.onBeforeRender = function (...args) {
            if (passes > 0) return;
            renderReflection.apply(this, args);
            passes++;
          };
          scene.add(reflector);
        } else reflector.getRenderTarget().setSize(width, height);
        const previousTarget = renderer.getRenderTarget();
        const previousFace = renderer.getActiveCubeFace();
        const previousMip = renderer.getActiveMipmapLevel();
        try {
          const target = reflector.getRenderTarget();
          renderer.initRenderTarget(target);
          renderer.setRenderTarget(target);
          const gl = renderer.getContext();
          if (!gl.getParameter(gl.FRAMEBUFFER_BINDING) || gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Reflection framebuffer is incomplete');
          }
        } finally {
          renderer.setRenderTarget(previousTarget, previousFace, previousMip);
        }
      } catch { failed = true; releaseTarget(); }
    }
    fallback.visible = drawing.visible = !reflector;
    // The fallback can have been rendered during a temporary quality or
    // viewport change. Its CanvasTexture is reusable, but the old GPU handle
    // must not remain allocated alongside the live reflection target.
    if (reflector) texture.dispose();
  }
  return {
    resize,
    beginFrame() { passes = 0; },
    get enabled() { return Boolean(reflector); },
    get layerMask() { return reflector?.getReflectionCamera(camera).layers.mask ?? completed.group.layers.mask; },
    get passes() { return passes; },
    get targetWidth() { return reflector?.getRenderTarget().width ?? 0; },
    get targetHeight() { return reflector?.getRenderTarget().height ?? 0; },
    get fallbackSegments() { return fallback.visible ? completed.silhouettes.length / 6 : 0; },
    get completedEdgeCount() { return completed.completedEdges.length / 6; },
    get fallbackEdgeCount() { return completed.silhouettes.length / 6; },
    get waterBounds() { return { minX, maxX, minZ, maxZ }; },
    get waterContainsRoute() { return centerline.every((point) => point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ); },
    get waterNearRouteDistance() { return Math.min(...distances); },
    get waterFarRouteDistance() { return Math.max(...distances); },
    get waterNearStrength() { return 0.42 * Math.max(0, Math.min(1, (26 - Math.min(...distances)) / 23)); },
    get waterFarStrength() { return 0.42 * Math.max(0, Math.min(1, (26 - Math.max(...distances)) / 23)); },
    get allocatedTextures() {
      return Number(Boolean((renderer.properties.get(texture) as { __webglTexture?: unknown }).__webglTexture))
        + Number(Boolean(reflector && (renderer.properties.get(reflector.getRenderTarget().texture) as { __webglTexture?: unknown }).__webglTexture));
    },
    get material() { return reflector?.material ?? fallbackMaterial; },
    dispose() {
      releaseTarget();
      scene.remove(completed.group, fallback, drawing);
      completed.dispose(); geometry.dispose(); drawing.geometry.dispose(); fallbackMaterial.dispose(); texture.dispose();
    },
  };
}
