import {
  BackSide, BufferGeometry, Color, DirectionalLight, Float32BufferAttribute, Group, HemisphereLight,
  IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, PMREMGenerator,
  Scene, ShaderMaterial, SphereGeometry, Texture, Vector3, type Camera, type WebGLRenderer,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { routeFrame } from './layout';

export const palette = {
  zenith: '#2f5268',
  sky: '#8fb2b9',
  horizon: '#f2d8a2',
  glow: '#f6c27f',
  haze: '#e9cc98',
  sand: '#dcae6a',
  shore: '#b58a58',
  tileLight: '#efe2c6',
  tileDark: '#6c4633',
  sea: '#4d7e81',
  rock: '#c08f55',
  cloud: '#fff2da',
};

/** Direction toward the sun: low and behind the visitor's left shoulder, so shadows run ahead. */
export const SUN_DIRECTION = new Vector3(-0.5, 0.43, 0.75).normalize();

const noise = /* glsl */ `
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

function skyMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false, toneMapped: false,
    uniforms: {
      zenith: { value: new Color(palette.zenith) },
      sky: { value: new Color(palette.sky) },
      horizon: { value: new Color(palette.horizon) },
      glow: { value: new Color(palette.glow) },
      haze: { value: new Color(palette.haze) },
      sunDirection: { value: SUN_DIRECTION },
      moonDirection: { value: new Vector3(0.3, 0.34, -0.89).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vDirection = world.xyz - cameraPosition;
        gl_Position = projectionMatrix * viewMatrix * world;
        gl_Position.z = gl_Position.w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith; uniform vec3 sky; uniform vec3 horizon; uniform vec3 glow; uniform vec3 haze;
      uniform vec3 sunDirection; uniform vec3 moonDirection;
      varying vec3 vDirection;
      ${noise}
      void main() {
        vec3 d = normalize(vDirection);
        float h = d.y;
        vec3 color = mix(horizon, sky, smoothstep(0.0, 0.2, h));
        color = mix(color, zenith, smoothstep(0.14, 0.9, h));
        // Warm band hugging the horizon all the way round, strongest toward the sun.
        float sun = max(dot(d, sunDirection), 0.0);
        color = mix(color, glow, (1.0 - smoothstep(0.0, 0.12, abs(h))) * (0.35 + 0.45 * pow(sun, 3.0)));
        // Thin painted stratus streaks.
        float streak = vnoise(vec2(atan(d.x, d.z) * 3.0, h * 38.0)) * smoothstep(0.03, 0.09, h) * (1.0 - smoothstep(0.1, 0.26, h));
        color = mix(color, vec3(1.0, 0.95, 0.86), streak * 0.28);
        // A pale daytime moon ahead of the visitor.
        float moon = dot(d, moonDirection);
        color = mix(color, vec3(0.97, 0.95, 0.88), smoothstep(0.99955, 0.99975, moon) * 0.85);
        color = mix(color, haze, 1.0 - smoothstep(-0.08, 0.0, h));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

function groundMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ color: palette.sand, roughness: 1, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.shore = { value: new Color(palette.shore) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vGroundPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGroundPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vGroundPosition;\nuniform vec3 shore;\n${noise}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 p = vGroundPosition.xz;
        float grain = vnoise(p * 0.05) * 0.55 + vnoise(p * 0.37) * 0.3 + vnoise(p * 2.1) * 0.15;
        diffuseColor.rgb *= 0.84 + 0.26 * grain;
        float ripple = sin(p.x * 0.8 + p.y * 0.25 + vnoise(p * 0.11) * 7.0);
        diffuseColor.rgb *= 1.0 + 0.03 * ripple;
        diffuseColor.rgb = mix(diffuseColor.rgb, shore, smoothstep(-128.0, -150.0, p.x) * 0.8);`);
  };
  material.customProgramCacheKey = () => 'dream-ground-v1';
  return material;
}

function pathMaterial(): MeshStandardMaterial {
  const material = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.62, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.tileLight = { value: new Color(palette.tileLight) };
    shader.uniforms.tileDark = { value: new Color(palette.tileDark) };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTile;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTile = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTile;\nuniform vec3 tileLight;\nuniform vec3 tileDark;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 cell = floor(vec2(vTile.x * 3.0, vTile.y));
        float checker = mod(cell.x + cell.y, 2.0);
        vec3 tile = mix(tileLight, tileDark, checker);
        vec2 grout = abs(fract(vec2(vTile.x * 3.0, vTile.y)) - 0.5);
        tile *= 0.9 + 0.1 * smoothstep(0.47, 0.44, max(grout.x, grout.y));
        float edge = min(vTile.x, 1.0 - vTile.x);
        tile = mix(tileDark * 0.8, tile, smoothstep(0.018, 0.028, edge));
        diffuseColor.rgb = tile;`);
  };
  material.customProgramCacheKey = () => 'dream-path-v1';
  return material;
}

function pathGeometry(from: number, to: number, width: number): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const steps = Math.max(2, Math.ceil(to - from));
  for (let index = 0; index <= steps; index++) {
    const station = from + (to - from) * index / steps;
    const frame = routeFrame(station);
    for (const side of [-1, 1]) {
      const point = frame.position.clone().addScaledVector(frame.right, side * width / 2);
      positions.push(point.x, 0.03, point.z);
      normals.push(0, 1, 0);
      uvs.push(side < 0 ? 0 : 1, station / (width / 3));
    }
    if (index < steps) {
      const a = index * 2;
      // Counter-clockwise seen from above, so the walk faces the sky.
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Deterministic pseudo-random sequence so every visit sees the same landscape. */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function colored(geometry: BufferGeometry, color: Color): BufferGeometry {
  const count = geometry.getAttribute('position').count;
  const values = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) color.toArray(values, index * 3);
  geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
  return geometry;
}

function rockGeometry(width: number, height: number, depth: number, detail = 2): BufferGeometry {
  // Polyhedra are already non-indexed, so shared corners hash to the same jitter.
  const geometry = new IcosahedronGeometry(1, detail);
  const position = geometry.getAttribute('position');
  const point = new Vector3();
  for (let index = 0; index < position.count; index++) {
    point.fromBufferAttribute(position, index);
    // Hash the unit vertex so shared corners of the flat-shaded faces move together.
    const key = Math.sin(point.x * 12.9898 + point.y * 78.233 + point.z * 37.719) * 43758.5453;
    const jitter = 0.78 + 0.34 * (key - Math.floor(key));
    point.multiplyScalar(jitter);
    point.y = point.y < 0 ? point.y * 0.15 : point.y;
    position.setXYZ(index, point.x * width, point.y * height, point.z * depth);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function createEnvironment(renderer: WebGLRenderer, pathEnd: number) {
  const group = new Group();
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T): T => { owned.push(item); return item; };

  const skyGeometry = own(new SphereGeometry(900, 48, 24));
  const sky = new Mesh(skyGeometry, own(skyMaterial()));
  sky.frustumCulled = false;
  sky.renderOrder = -1;
  sky.raycast = () => {};
  group.add(sky);

  // Image-based light from the same sky gives gilded frames and glossy tiles
  // believable reflections without a single texture download.
  const pmrem = new PMREMGenerator(renderer);
  const envScene = new Scene();
  const envGeometry = new SphereGeometry(40, 32, 16);
  envScene.add(new Mesh(envGeometry, sky.material));
  const ground = new Mesh(new PlaneGeometry(200, 200).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: palette.sand }));
  ground.position.y = -1.6;
  envScene.add(ground);
  // Own the render target, not just its texture, so its framebuffer is released too.
  const environment: Texture = own(pmrem.fromScene(envScene, 0.02, 0.1, 100)).texture;
  pmrem.dispose();
  envGeometry.dispose();
  ground.geometry.dispose();
  (ground.material as MeshBasicMaterial).dispose();

  const sun = new DirectionalLight('#ffe6bd', 2.7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 34;
  sun.shadow.camera.bottom = -34;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.035;
  sun.shadow.radius = 3;
  own({ dispose: () => sun.shadow.dispose() });
  const hemisphere = new HemisphereLight('#b3cad3', '#c89857', 0.75);
  group.add(sun, sun.target, hemisphere);

  const groundMesh = new Mesh(own(new PlaneGeometry(1400, 2400).rotateX(-Math.PI / 2)), own(groundMaterial()));
  groundMesh.position.set(540, 0, -pathEnd / 2);
  groundMesh.receiveShadow = true;
  groundMesh.raycast = () => {};
  group.add(groundMesh);

  const sea = new Mesh(own(new PlaneGeometry(1200, 2400).rotateX(-Math.PI / 2)),
    own(new MeshStandardMaterial({ color: palette.sea, roughness: 0.16, metalness: 0.1 })));
  sea.position.set(-744, 0.12, -pathEnd / 2);
  sea.raycast = () => {};
  group.add(sea);

  const path = new Mesh(own(pathGeometry(-14, pathEnd, 4.8)), own(pathMaterial()));
  path.receiveShadow = true;
  path.raycast = () => {};
  group.add(path);

  // Golden headland rocks on the right and a few boulders that rhyme with them.
  const random = seeded(1904);
  const rocks: BufferGeometry[] = [];
  const rockColor = new Color(palette.rock);
  for (let index = 0; index < 9; index++) {
    const shade = rockColor.clone().offsetHSL(0, (random() - 0.5) * 0.08, (random() - 0.5) * 0.1);
    const width = 26 + random() * 38;
    const geometry = rockGeometry(width, 12 + random() * 30, 16 + random() * 22);
    geometry.rotateY(random() * Math.PI);
    geometry.translate(150 + random() * 130, 0, 40 - index * 72 - random() * 40 - Math.max(0, pathEnd - 160) * index / 9);
    rocks.push(colored(geometry, shade));
  }
  for (let index = 0; index < 6; index++) {
    const shade = rockColor.clone().offsetHSL(0, 0, -0.06 + random() * 0.08);
    const geometry = rockGeometry(2 + random() * 3, 1 + random() * 2.2, 2 + random() * 2.5, 1);
    const station = 20 + random() * pathEnd;
    const frame = routeFrame(station);
    const side = random() > 0.5 ? 1 : -1;
    const at = frame.position.addScaledVector(frame.right, side * (22 + random() * 40));
    geometry.translate(at.x, 0, at.z);
    rocks.push(colored(geometry, shade));
  }
  const rockMesh = new Mesh(own(mergeGeometries(rocks)!), own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true })));
  rocks.forEach((geometry) => geometry.dispose());
  rockMesh.receiveShadow = true;
  rockMesh.raycast = () => {};
  group.add(rockMesh);

  const clouds: BufferGeometry[] = [];
  for (let index = 0; index < 7; index++) {
    const geometry = new SphereGeometry(1, 16, 8);
    geometry.scale(40 + random() * 60, 1.6 + random() * 2.2, 8 + random() * 10);
    geometry.translate(-260 + random() * 520, 70 + random() * 55, -120 - random() * 520);
    clouds.push(geometry);
  }
  const cloudMesh = new Mesh(own(mergeGeometries(clouds)!), own(new MeshBasicMaterial({ color: palette.cloud, transparent: true, opacity: 0.72, fog: false, depthWrite: false })));
  clouds.forEach((geometry) => geometry.dispose());
  cloudMesh.raycast = () => {};
  cloudMesh.renderOrder = -0.5;
  group.add(cloudMesh);

  const focus = new Vector3();
  return {
    group, sun, hemisphere, environment,
    update(camera: Camera, target: Vector3, time: number) {
      sky.position.copy(camera.position);
      cloudMesh.position.x = Math.sin(time * 0.004) * 60;
      // Keep the shadow box centred where the visitor is looking.
      focus.copy(target).lerp(camera.position, 0.35);
      focus.y = 0;
      sun.target.position.copy(focus);
      sun.position.copy(focus).addScaledVector(SUN_DIRECTION, 90);
      sun.target.updateMatrixWorld();
    },
    dispose() { owned.forEach((item) => item.dispose()); },
  };
}
