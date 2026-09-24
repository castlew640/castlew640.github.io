import {
  BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DoubleSide, Group, InstancedMesh,
  Matrix4, Mesh, MeshStandardMaterial, Object3D, Quaternion, SphereGeometry, SRGBColorSpace, TorusGeometry, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type FaceStyle = 'cream' | 'blue';

interface FaceStyleSpec { face: string; rim: string; rimShade: string; ink: string }
const faceStyles: Record<FaceStyle, FaceStyleSpec> = {
  cream: { face: '#efe1bd', rim: '#d0a54c', rimShade: '#8f6a25', ink: '#2a2620' },
  blue: { face: '#b7c7cb', rim: '#c9cfd0', rimShade: '#7b8588', ink: '#1f2a2e' },
};

/**
 * Clock faces are shared canvases that show the visitor's real local time.
 * A rewind offset lets a tapped clock spin every hand backwards, then catch up.
 */
export function createFaces(size = 512) {
  const faces = (Object.keys(faceStyles) as FaceStyle[]).map((style) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return { style, canvas, texture, context: canvas.getContext('2d')! };
  });
  let drawnSecond = Number.NaN;
  let warp = 0;
  let warpVelocity = 0;

  const draw = (face: typeof faces[number], seconds: number): void => {
    const { context: ctx, canvas } = face;
    const spec = faceStyles[face.style];
    const c = canvas.width / 2;
    const r = c * 0.985;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const rim = ctx.createRadialGradient(c * 0.8, c * 0.7, r * 0.2, c, c, r);
    rim.addColorStop(0, spec.rim);
    rim.addColorStop(1, spec.rimShade);
    ctx.fillStyle = rim;
    ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2); ctx.fill();
    const faceGradient = ctx.createRadialGradient(c * 0.85, c * 0.8, r * 0.1, c, c, r * 0.9);
    faceGradient.addColorStop(0, spec.face);
    faceGradient.addColorStop(1, new Color(spec.face).offsetHSL(0, 0, -0.08).getStyle());
    ctx.fillStyle = faceGradient;
    ctx.beginPath(); ctx.arc(c, c, r * 0.86, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = spec.ink;
    ctx.lineCap = 'round';
    for (let tick = 0; tick < 60; tick++) {
      const angle = tick / 60 * Math.PI * 2;
      const hour = tick % 5 === 0;
      ctx.lineWidth = hour ? r * 0.022 : r * 0.008;
      const inner = hour ? 0.68 : 0.75;
      ctx.beginPath();
      ctx.moveTo(c + Math.sin(angle) * r * inner, c - Math.cos(angle) * r * inner);
      ctx.lineTo(c + Math.sin(angle) * r * 0.8, c - Math.cos(angle) * r * 0.8);
      ctx.stroke();
    }
    ctx.fillStyle = spec.ink;
    ctx.font = `${Math.round(r * 0.17)}px "Iowan Old Style", Palatino, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [12, 3, 6, 9].forEach((numeral, index) => {
      const angle = index * Math.PI / 2;
      ctx.fillText(String(numeral), c + Math.sin(angle) * r * 0.54, c - Math.cos(angle) * r * 0.54);
    });
    const hand = (turns: number, length: number, width: number, color: string): void => {
      const angle = turns * Math.PI * 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(c - Math.sin(angle) * r * 0.08, c + Math.cos(angle) * r * 0.08);
      ctx.lineTo(c + Math.sin(angle) * r * length, c - Math.cos(angle) * r * length);
      ctx.stroke();
    };
    const total = ((seconds % 43200) + 43200) % 43200;
    hand(total / 43200, 0.42, r * 0.045, spec.ink);
    hand((total % 3600) / 3600, 0.64, r * 0.03, spec.ink);
    hand((total % 60) / 60, 0.7, r * 0.012, '#8e4935');
    ctx.fillStyle = spec.ink;
    ctx.beginPath(); ctx.arc(c, c, r * 0.035, 0, Math.PI * 2); ctx.fill();
    if (face.style === 'cream') {
      // The fly from the painting, resting near four o'clock.
      ctx.save();
      ctx.translate(c + r * 0.3, c + r * 0.22);
      ctx.rotate(0.6);
      ctx.fillStyle = 'rgba(20, 18, 16, 0.9)';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.028, r * 0.016, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(210, 220, 225, 0.55)';
      ctx.beginPath(); ctx.ellipse(-r * 0.01, -r * 0.02, r * 0.024, r * 0.011, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-r * 0.01, r * 0.02, r * 0.024, r * 0.011, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    face.texture.needsUpdate = true;
  };

  return {
    textures: Object.fromEntries(faces.map((face) => [face.style, face.texture])) as Record<FaceStyle, CanvasTexture>,
    get rewinding() { return warpVelocity !== 0 || warp !== 0; },
    rewind() { if (warpVelocity === 0) warpVelocity = -8640; },
    update(dt: number): void {
      if (warpVelocity < 0) {
        warp += warpVelocity * dt;
        if (warp < -6 * 3600) warpVelocity = 1;
      } else if (warpVelocity > 0) {
        // Catch up to the present with an easing spin.
        warp = Math.min(0, warp + Math.max(1800, -warp * 2.4) * dt);
        if (warp === 0) warpVelocity = 0;
      }
      const now = new Date();
      const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + (warp === 0 ? 0 : now.getMilliseconds() / 1000) + warp;
      const whole = warp === 0 ? Math.floor(seconds) : seconds;
      if (whole === drawnSecond) return;
      drawnSecond = whole;
      faces.forEach((face) => draw(face, seconds));
    },
    dispose() { faces.forEach((face) => face.texture.dispose()); },
  };
}

export interface DrapeOptions {
  radius: number;
  /** Where the disc folds, measured from its centre along +z. */
  fold: number;
  /** Bend radius of the fold. Smaller is sharper. */
  bend: number;
  /** 'edge' hangs over one side; 'rod' hangs over both, like a towel on a branch. */
  mode: 'edge' | 'rod';
  /** Extra downward stretch of the hanging part (the melt). */
  melt: number;
  phase: number;
}

/** Polar grid so the melt deforms smoothly and the rim stays round. */
function discGeometry(rings = 12, segments = 44): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  positions.push(0, 0, 0); uvs.push(0.5, 0.5);
  for (let ring = 1; ring <= rings; ring++) {
    const radius = ring / rings;
    for (let segment = 0; segment < segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push(x, 0, z);
      uvs.push(0.5 + x * 0.5, 0.5 - z * 0.5);
    }
  }
  for (let segment = 0; segment < segments; segment++) indices.push(0, 1 + ((segment + 1) % segments), 1 + segment);
  for (let ring = 1; ring < rings; ring++) {
    const inner = 1 + (ring - 1) * segments;
    const outer = 1 + ring * segments;
    for (let segment = 0; segment < segments; segment++) {
      const next = (segment + 1) % segments;
      indices.push(inner + segment, inner + next, outer + segment, outer + segment, inner + next, outer + next);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);
  return geometry;
}

export function drapePoint(x: number, z: number, options: DrapeOptions, melt: number, wobble: number, out: Vector3): Vector3 {
  const { fold, bend } = options;
  const distance = options.mode === 'rod' ? Math.abs(z - fold) : z - fold;
  const direction = options.mode === 'rod' ? Math.sign(z - fold) || 1 : 1;
  if (distance <= 0) return out.set(x, 0, z);
  const quarter = Math.PI * bend / 2;
  let y: number;
  let along: number;
  if (distance <= quarter) {
    along = Math.sin(distance / bend) * bend;
    y = -(1 - Math.cos(distance / bend)) * bend;
  } else {
    const hanging = distance - quarter;
    along = bend - hanging * 0.06;
    y = -bend - hanging * (1 + melt * hanging) - Math.sin(x * 3.1 + wobble) * 0.05 * hanging;
  }
  // The melting side narrows slightly as it sags, like soft wax.
  const narrowing = 1 - Math.min(0.22, Math.max(0, -y) * 0.12 * (1 + melt));
  return out.set(x * narrowing, y, fold + direction * along);
}

export interface MeltingClock {
  object: Group;
  mesh: Mesh<BufferGeometry, MeshStandardMaterial>;
  update(time: number, dt: number, near: boolean): void;
  react(): void;
  dispose(): void;
}

export function createMeltingClock(texture: CanvasTexture, options: DrapeOptions): MeltingClock {
  const geometry = discGeometry();
  const base = Float32Array.from(geometry.getAttribute('position').array);
  const position = geometry.getAttribute('position') as BufferAttribute;
  const material = new MeshStandardMaterial({ map: texture, side: DoubleSide, roughness: 0.42, metalness: 0.08 });
  const mesh = new Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.raycast = () => {};
  const object = new Group();
  object.add(mesh);
  const point = new Vector3();
  let pulse = 0;
  let lastMelt = Number.NaN;

  const deform = (melt: number, wobble: number): void => {
    for (let index = 0; index < position.count; index++) {
      drapePoint(base[index * 3] * options.radius, base[index * 3 + 2] * options.radius, options, melt, wobble, point);
      position.setXYZ(index, point.x, point.y + 0.012, point.z);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  };
  deform(options.melt, options.phase);

  return {
    object, mesh,
    update(time, dt, near) {
      pulse = Math.max(0, pulse - dt * 0.45);
      if (!near && pulse === 0) return;
      const melt = options.melt * (1 + 0.18 * Math.sin(time * 0.35 + options.phase)) + pulse * pulse * 1.6;
      if (Math.abs(melt - lastMelt) < 0.0015 && pulse === 0) return;
      lastMelt = melt;
      deform(melt, options.phase + Math.sin(time * 0.5 + options.phase) * 0.6);
    },
    react() { pulse = 1; },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}

/** The orange pocket watch from the painting, crawling with ants. */
export function createAntWatch() {
  const object = new Group();
  const orange = new MeshStandardMaterial({ color: '#cf6f2a', roughness: 0.34, metalness: 0.55 });
  const lid = new Mesh(new CylinderGeometry(0.34, 0.34, 0.07, 36), orange);
  lid.position.y = 0.035;
  const bow = new Mesh(new TorusGeometry(0.075, 0.018, 8, 18), orange);
  bow.position.set(0, 0.04, -0.43);
  bow.rotation.x = Math.PI / 2;
  const crown = new Mesh(new CylinderGeometry(0.03, 0.03, 0.08, 10).rotateX(Math.PI / 2), orange);
  crown.position.set(0, 0.035, -0.37);
  for (const mesh of [lid, bow, crown]) { mesh.castShadow = true; mesh.raycast = () => {}; object.add(mesh); }

  const antParts = [
    new SphereGeometry(0.018, 8, 6).translate(0.042, 0, 0),
    new SphereGeometry(0.013, 8, 6).scale(1.2, 0.9, 0.9).translate(0.012, 0, 0),
    new SphereGeometry(0.024, 8, 6).scale(1.45, 0.9, 1).translate(-0.03, 0, 0),
  ];
  const antGeometry = mergeGeometries(antParts)!;
  antParts.forEach((geometry) => geometry.dispose());
  const antMaterial = new MeshStandardMaterial({ color: '#15110f', roughness: 0.5 });
  const count = 26;
  const ants = new InstancedMesh(antGeometry, antMaterial, count);
  ants.raycast = () => {};
  object.add(ants);
  const seeds = Array.from({ length: count }, (_, index) => ({
    radius: 0.07 + ((index * 37) % 23) / 23 * 0.22,
    angle: index * 2.399,
    speed: (0.35 + ((index * 13) % 7) / 7 * 0.5) * (index % 3 === 0 ? -1 : 1),
    wobble: index * 1.7,
  }));
  const matrix = new Matrix4();
  const rotation = new Quaternion();
  const scale = new Vector3(1, 1, 1);
  const place = new Vector3();
  const up = new Vector3(0, 1, 0);
  let scatter = 0;

  return {
    object, count,
    update(time: number, dt: number, near: boolean) {
      scatter = Math.max(0, scatter - dt * 0.35);
      if (!near && scatter === 0) return;
      const spread = 1 + Math.sin(Math.min(1, scatter) * Math.PI / 2) * 1.8;
      seeds.forEach((ant, index) => {
        const angle = ant.angle + time * ant.speed * (1 + scatter * 3);
        const radius = ant.radius * spread + Math.sin(time * 2.1 + ant.wobble) * 0.012;
        // Ants flung past the rim walk on the block; the rest stay on the lid.
        place.set(Math.cos(angle) * radius, radius > 0.34 ? 0.012 : 0.075, Math.sin(angle) * radius);
        rotation.setFromAxisAngle(up, -angle + (ant.speed > 0 ? -Math.PI / 2 : Math.PI / 2));
        ants.setMatrixAt(index, matrix.compose(place, rotation, scale));
      });
      ants.instanceMatrix.needsUpdate = true;
    },
    react() { scatter = 1; },
    dispose() {
      for (const mesh of [lid, bow, crown]) mesh.geometry.dispose();
      orange.dispose();
      antGeometry.dispose();
      antMaterial.dispose();
      ants.dispose();
    },
  };
}

/** Orient an object so its local +z faces `facing` (horizontal). */
export function faceToward(object: Object3D, facing: Vector3): void {
  object.rotation.set(0, Math.atan2(facing.x, facing.z), 0);
}
