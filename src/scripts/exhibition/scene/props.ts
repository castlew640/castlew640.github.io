import {
  BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, CatmullRomCurve3, Color, ConeGeometry, CylinderGeometry,
  DoubleSide, ExtrudeGeometry, Float32BufferAttribute, Group, IcosahedronGeometry, InstancedMesh, LatheGeometry, Matrix4,
  Mesh, MeshStandardMaterial, Object3D, PlaneGeometry, Quaternion, Shape, SphereGeometry, SRGBColorSpace, TubeGeometry,
  Vector2, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createAntWatch, createMeltingClock, drapePoint, faceToward, type FaceStyle, type MeltingClock } from './clocks';
import type { Placement } from './layout';

export interface Prop {
  object: Object3D;
  /** Invisible, generous hit volume on the picking layer. */
  proxy: Mesh;
  react(): void;
  /** Whether a reaction is still playing (keeps the loop awake). */
  readonly busy: boolean;
}

/** Ambient animation; `near` lets distant detail rest. */
type Animator = (time: number, dt: number, near: (object: Object3D, radius: number) => boolean) => void;

export const PICK_LAYER = 1;
const proxyMaterial = new MeshStandardMaterial({ visible: false });

export function proxyBox(width: number, height: number, depth: number, x = 0, y = height / 2, z = 0): Mesh {
  const proxy = new Mesh(new BoxGeometry(width, height, depth).translate(x, y, z), proxyMaterial);
  proxy.layers.set(PICK_LAYER);
  return proxy;
}

export function isProxy(object: Object3D): boolean {
  return object instanceof Mesh && object.material === proxyMaterial;
}

/** Cylinder spanning a → b; the building block for legs, crutches and branches. */
export function beam(a: Vector3, b: Vector3, radiusA: number, radiusB = radiusA, segments = 7): BufferGeometry {
  const direction = b.clone().sub(a);
  const geometry = new CylinderGeometry(radiusB, radiusA, direction.length(), segments);
  geometry.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()));
  geometry.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return geometry;
}

export function paint(geometry: BufferGeometry, color: string | Color): BufferGeometry {
  const target = geometry.index ? geometry.toNonIndexed() : geometry;
  if (target !== geometry) geometry.dispose();
  const value = color instanceof Color ? color : new Color(color);
  const count = target.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) value.toArray(colors, index * 3);
  target.setAttribute('color', new Float32BufferAttribute(colors, 3));
  if (target.getAttribute('uv')) target.deleteAttribute('uv');
  return target;
}

export function merged(parts: BufferGeometry[]): BufferGeometry {
  const geometry = mergeGeometries(parts)!;
  parts.forEach((part) => part.dispose());
  return geometry;
}

export function taperedTube(points: Vector3[], radius: number, taper: number, segments = 40): BufferGeometry {
  const curve = new CatmullRomCurve3(points);
  const radial = 8;
  const geometry = new TubeGeometry(curve, segments, radius, radial, false);
  const position = geometry.getAttribute('position');
  const centre = new Vector3();
  const point = new Vector3();
  for (let segment = 0; segment <= segments; segment++) {
    curve.getPointAt(segment / segments, centre);
    const scale = 1 - taper * segment / segments;
    for (let r = 0; r <= radial; r++) {
      const index = segment * (radial + 1) + r;
      point.fromBufferAttribute(position, index).sub(centre).multiplyScalar(scale).add(centre);
      position.setXYZ(index, point.x, point.y, point.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function placed(object: Object3D, placement: Placement): Object3D {
  object.position.copy(placement.position);
  faceToward(object, placement.facing);
  return object;
}

export function settle(object: Object3D, shadows = true): void {
  object.traverse((child) => {
    if (child instanceof Mesh && !isProxy(child)) {
      child.castShadow = shadows;
      child.receiveShadow = true;
      if (child.raycast === Mesh.prototype.raycast) child.raycast = () => {};
    }
  });
}

/** A damped shake that starts at `started` and settles within a few seconds. */
function wobble(time: number, started: number, strength: number, decay = 2.2, frequency = 9): number {
  const t = time - started;
  return t < 0 || t > 4 ? 0 : Math.sin(t * frequency) * Math.exp(-t * decay) * strength;
}

export function createProps(faces: Record<FaceStyle, CanvasTexture>, layout: {
  block: Placement; egg: Placement; sofa: Placement; stage: Placement; castle: Vector3; pathEnd: number;
}) {
  const group = new Group();
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T): T => { owned.push(item); return item; };
  const clocks: MeltingClock[] = [];
  const props: Record<string, Prop> = {};
  const animators: Animator[] = [];
  const vertexColored = own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 }));
  const clock = (style: FaceStyle, options: Parameters<typeof createMeltingClock>[1]): MeltingClock => {
    const created = own(createMeltingClock(faces[style], options));
    clocks.push(created);
    return created;
  };
  let time = 0;

  // ——— The Persistence block: a dead olive tree, two soft clocks and the ant watch.
  {
    const root = placed(new Group(), layout.block);
    const bark = '#5b4430';
    root.add(new Mesh(own(merged([
      paint(new BoxGeometry(4.4, 1.05, 2.1).translate(0, 0.525, 0), '#9a7b52'),
      paint(taperedTube([
        new Vector3(-1.75, 1.0, -0.65), new Vector3(-1.6, 1.8, -0.55), new Vector3(-1.85, 2.6, -0.5),
        new Vector3(-1.65, 3.25, -0.45), new Vector3(-1.2, 3.55, -0.35), new Vector3(-0.2, 3.62, -0.3), new Vector3(0.7, 3.5, -0.25),
      ], 0.16, 0.82), bark),
      paint(taperedTube([new Vector3(-1.78, 2.7, -0.5), new Vector3(-2.2, 3.1, -0.55), new Vector3(-2.35, 3.55, -0.6)], 0.06, 0.8, 12), bark),
    ])), vertexColored));
    const branchClock = clock('blue', { radius: 0.62, fold: 0.14, bend: 0.06, mode: 'rod', melt: 0.55, phase: 0.4 });
    branchClock.object.position.set(0.05, 3.62, -0.3);
    branchClock.object.rotation.y = 0.12;
    const edgeClock = clock('cream', { radius: 0.72, fold: 0.34, bend: 0.1, mode: 'edge', melt: 0.35, phase: 1.9 });
    edgeClock.object.position.set(0.9, 1.05, 0.72);
    edgeClock.object.rotation.y = 0.1;
    const watch = own(createAntWatch());
    watch.object.position.set(-0.55, 1.05, 0.35);
    watch.object.rotation.y = 0.5;
    root.add(branchClock.object, edgeClock.object, watch.object);
    settle(root);
    group.add(root);
    const proxy = proxyBox(4.8, 4.2, 2.6);
    const watchProxy = proxyBox(1.1, 0.6, 1.1, -0.55, 1.25, 0.35);
    root.add(proxy, watchProxy);
    let started = -10;
    props.persistence = {
      object: root, proxy,
      get busy() { return time - started < 3; },
      react() { started = time; branchClock.react(); edgeClock.react(); },
    };
    props.ants = { object: watch.object, proxy: watchProxy, get busy() { return false; }, react() { watch.react(); } };
    animators.push((t, dt, near) => watch.update(t, dt, near(root, 40)));
  }

  // ——— Elephants on impossibly long legs, crossing the far horizon.
  {
    const legLength = 11;
    const hide = '#433530';
    const legGeometry = own(merged([
      paint(new CylinderGeometry(0.2, 0.08, legLength, 6).translate(0, -legLength / 2, 0), '#3d302a'),
      paint(new SphereGeometry(0.2, 8, 6).translate(0, -legLength * 0.56, 0), '#3d302a'),
      paint(new CylinderGeometry(0.2, 0.26, 0.4, 8).translate(0, -legLength + 0.2, 0), '#3d302a'),
    ]));
    const herd = [
      { z: -(layout.pathEnd + 170), x: -160, speed: 1.9, scale: 1 },
      { z: -(layout.pathEnd + 215), x: 40, speed: 1.6, scale: 1.1 },
      { z: -(layout.pathEnd + 250), x: 220, speed: 1.75, scale: 0.95 },
    ];
    const legs = own(new InstancedMesh(legGeometry, vertexColored, herd.length * 4));
    legs.frustumCulled = false;
    legs.raycast = () => {};
    group.add(legs);
    const bodyGeometry = own(merged([
      paint(new SphereGeometry(1, 20, 14).scale(2.7, 1.75, 1.55), hide),
      paint(new SphereGeometry(1.05, 16, 12).translate(2.55, 0.45, 0), hide),
      paint(new SphereGeometry(1, 12, 10).scale(0.18, 0.95, 0.85).translate(2.25, 0.6, 0.95), '#3a2d28'),
      paint(new SphereGeometry(1, 12, 10).scale(0.18, 0.95, 0.85).translate(2.25, 0.6, -0.95), '#3a2d28'),
      paint(new ConeGeometry(0.1, 1.1, 8).rotateZ(-2.1).translate(3.3, -0.15, 0.35), '#eadfc8'),
      paint(new ConeGeometry(0.1, 1.1, 8).rotateZ(-2.1).translate(3.3, -0.15, -0.35), '#eadfc8'),
      paint(new BoxGeometry(2.1, 0.35, 2.0).translate(0, 1.65, 0), '#8e4935'),
      paint(new CylinderGeometry(0.28, 0.52, 5.2, 4).rotateY(Math.PI / 4).translate(0, 4.4, 0), '#e0cfae'),
      paint(new ConeGeometry(0.4, 0.8, 4).rotateY(Math.PI / 4).translate(0, 7.4, 0), '#e0cfae'),
    ]));
    const trunkGeometry = own(paint(taperedTube([
      new Vector3(0, 0, 0), new Vector3(0.55, -0.6, 0), new Vector3(0.75, -1.6, 0), new Vector3(0.6, -2.5, 0), new Vector3(0.85, -2.9, 0),
    ], 0.26, 0.6, 16), hide));
    const hips = [[1.55, 0.7], [1.55, -0.7], [-1.55, 0.7], [-1.55, -0.7]];
    const matrix = new Matrix4();
    const hip = new Object3D();
    const span = 900;
    const elephants = herd.map((member, index) => {
      const body = new Mesh(bodyGeometry, vertexColored);
      const trunk = new Mesh(trunkGeometry, vertexColored);
      trunk.position.set(3.35, 0.2, 0);
      body.add(trunk);
      body.scale.setScalar(member.scale);
      body.raycast = trunk.raycast = () => {};
      group.add(body);
      const proxy = proxyBox(10, legLength + 10, 5, 0.5, -legLength / 2 + 2);
      body.add(proxy);
      const elephant = { ...member, body, trunk, walked: index * 37, started: -10 };
      props[`elephant${index}`] = {
        object: body, proxy,
        get busy() { return time - elephant.started < 2.5; },
        react() { elephant.started = time; },
      };
      return elephant;
    });
    animators.push((t, dt) => {
      elephants.forEach((elephant, index) => {
        const since = t - elephant.started;
        // A trumpeting elephant stops walking, lifts its trunk and rears a little.
        if (since > 2.4) elephant.walked += dt * elephant.speed;
        const x = ((elephant.x + elephant.walked + span / 2) % span + span) % span - span / 2;
        const stride = elephant.walked * 0.55;
        const bob = Math.sin(stride * 2) * 0.12;
        const height = (legLength + 1.2) * elephant.scale;
        const raise = since > 2.4 ? 0 : Math.sin(Math.min(1, since / 0.5) * Math.PI / 2) * Math.min(1, (2.4 - since) / 0.6);
        elephant.body.position.set(x, height + bob, elephant.z);
        elephant.body.rotation.z = raise * 0.08;
        elephant.trunk.rotation.z = raise * 1.9;
        hips.forEach(([along, across], leg) => {
          const phase = stride + (leg === 0 || leg === 3 ? 0 : Math.PI);
          hip.position.set(x + along * elephant.scale, height - 0.6 * elephant.scale + bob, elephant.z + across * elephant.scale);
          hip.rotation.set(0, 0, Math.sin(phase) * 0.2);
          hip.scale.setScalar(elephant.scale);
          hip.updateMatrix();
          legs.setMatrixAt(index * 4 + leg, matrix.copy(hip.matrix));
        });
      });
      legs.instanceMatrix.needsUpdate = true;
    });
  }

  // ——— A castle on a floating rock: a nod to Magritte, and to the name on the door.
  {
    const rock = new IcosahedronGeometry(1, 2);
    const position = rock.getAttribute('position');
    const point = new Vector3();
    for (let index = 0; index < position.count; index++) {
      point.fromBufferAttribute(position, index);
      const key = Math.sin(point.x * 17.1 + point.y * 31.7 + point.z * 11.3) * 9143.21;
      point.multiplyScalar(0.85 + 0.3 * (key - Math.floor(key)));
      if (point.y < 0) { point.y *= 2.3; point.x *= 1 + point.y * 0.22; point.z *= 1 + point.y * 0.22; }
      else point.y = Math.min(point.y, 0.32) + (point.y - Math.min(point.y, 0.32)) * 0.15;
      position.setXYZ(index, point.x * 10, point.y * 7, point.z * 9);
    }
    rock.computeVertexNormals();
    const top = 0.32 * 7;
    const parts: BufferGeometry[] = [paint(rock, '#8b7154')];
    const tower = (x: number, z: number, radius: number, height: number): void => {
      parts.push(paint(new CylinderGeometry(radius, radius * 1.08, height, 12).translate(x, top + height / 2, z), '#d6c6a4'));
      for (let merlon = 0; merlon < 8; merlon++) {
        const angle = merlon / 8 * Math.PI * 2;
        parts.push(paint(new BoxGeometry(radius * 0.4, 0.55, radius * 0.4)
          .translate(x + Math.cos(angle) * radius * 0.9, top + height + 0.27, z + Math.sin(angle) * radius * 0.9), '#cdbc98'));
      }
    };
    tower(-3.2, -1.2, 1.15, 6.2);
    tower(1.6, 1.4, 0.95, 8.4);
    tower(3.8, -2.2, 1.3, 5.2);
    parts.push(paint(new BoxGeometry(5.2, 3.4, 0.9).rotateY(0.35).translate(-0.8, top + 1.7, 0.1), '#cdbc98'));
    parts.push(paint(new BoxGeometry(0.9, 3.0, 4.2).translate(3.0, top + 1.5, -0.4), '#cdbc98'));
    const castle = new Mesh(own(merged(parts)), own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true })));
    castle.position.copy(layout.castle);
    castle.raycast = () => {};
    group.add(castle);
    const proxy = proxyBox(22, 30, 20, 0, 0);
    castle.add(proxy);
    let started = -10;
    props.castle = {
      object: castle, proxy,
      get busy() { return time - started < 3; },
      react() { started = time; },
    };
    animators.push((t) => {
      castle.position.y = layout.castle.y + Math.sin(t * 0.33) * 0.9 + wobble(t, started, 2.2, 1.2, 3);
      castle.rotation.y = Math.sin(t * 0.07) * 0.25 + wobble(t, started, 0.3, 1.2, 2);
    });
  }

  // ——— The egg where new work hatches.
  {
    const profile: Vector2[] = [];
    for (let index = 0; index <= 24; index++) {
      const t = index / 24 * Math.PI;
      profile.push(new Vector2(Math.max(0.0001, Math.sin(t) * 0.9 * (1 + 0.14 * Math.cos(t))), 1.3 - Math.cos(t) * 1.3));
    }
    const root = placed(new Group(), layout.egg);
    root.add(new Mesh(own(paint(merged([
      new CylinderGeometry(1.05, 1.2, 0.45, 28).translate(0, 0.225, 0),
      new CylinderGeometry(0.75, 0.9, 0.3, 28).translate(0, 0.6, 0),
    ]), '#d9cdb4')), vertexColored));
    const egg = new Mesh(own(new LatheGeometry(profile, 36)), own(new MeshStandardMaterial({ color: '#f4ecdd', roughness: 0.45 })));
    egg.position.y = 0.74;
    egg.add(new Mesh(own(paint(merged([
      beam(new Vector3(0.12, 1.95, 0.78), new Vector3(0.3, 1.72, 0.8), 0.02),
      beam(new Vector3(0.3, 1.72, 0.8), new Vector3(0.22, 1.5, 0.83), 0.02),
    ]), '#6f5a42')), vertexColored));
    root.add(egg);
    settle(root);
    group.add(root);
    const proxy = proxyBox(2.4, 3.6, 2.4);
    root.add(proxy);
    let started = -10;
    props.egg = { object: root, proxy, get busy() { return time - started < 3.5; }, react() { started = time; } };
    animators.push((t) => {
      egg.rotation.z = wobble(t, started, 0.22, 1.4, 11);
      egg.rotation.x = wobble(t, started + 0.1, 0.12, 1.4, 9);
    });
  }

  // ——— Mae West lips sofa, where the About stop invites you to sit.
  {
    const root = placed(new Group(), layout.sofa);
    const upper = new Shape();
    upper.moveTo(-1.5, 0);
    upper.bezierCurveTo(-1.2, 0.2, -0.9, 0.92, -0.5, 0.95);
    upper.bezierCurveTo(-0.25, 0.98, -0.12, 0.72, 0, 0.72);
    upper.bezierCurveTo(0.12, 0.72, 0.25, 0.98, 0.5, 0.95);
    upper.bezierCurveTo(0.9, 0.92, 1.2, 0.2, 1.5, 0);
    upper.bezierCurveTo(0.8, 0.14, 0.3, 0.22, 0, 0.2);
    upper.bezierCurveTo(-0.3, 0.22, -0.8, 0.14, -1.5, 0);
    const lower = new Shape();
    lower.moveTo(-1.5, 0);
    lower.bezierCurveTo(-1.1, -0.55, -0.6, -0.98, 0, -0.98);
    lower.bezierCurveTo(0.6, -0.98, 1.1, -0.55, 1.5, 0);
    lower.bezierCurveTo(0.8, -0.06, 0.3, -0.14, 0, -0.14);
    lower.bezierCurveTo(-0.3, -0.14, -0.8, -0.06, -1.5, 0);
    const bevel = { bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.16, bevelSegments: 5, curveSegments: 24 };
    const lipsMaterial = own(new MeshStandardMaterial({ color: '#b31d2a', roughness: 0.34, metalness: 0.05 }));
    const back = new Mesh(own(new ExtrudeGeometry(upper, { ...bevel, depth: 0.55 }).scale(1.3, 1.3, 1)), lipsMaterial);
    back.position.set(0, 0.58, -0.75);
    const seat = new Mesh(own(new ExtrudeGeometry(lower, { ...bevel, depth: 0.42 }).rotateX(-Math.PI / 2).scale(1.3, 1, 1.05)), lipsMaterial);
    seat.position.set(0, 0.2, -0.28);
    seat.rotation.x = -0.08;
    const lips = new Group();
    lips.add(back, seat);
    const table = new Mesh(own(paint(merged([
      new CylinderGeometry(0.42, 0.42, 0.06, 24).translate(0, 0.9, 0),
      new CylinderGeometry(0.05, 0.05, 0.9, 8).translate(0, 0.45, 0),
      new CylinderGeometry(0.3, 0.34, 0.05, 20).translate(0, 0.025, 0),
    ]), '#2f2a26')), vertexColored);
    table.position.set(2.55, 0, 0.1);
    const tableClock = clock('cream', { radius: 0.5, fold: 0.26, bend: 0.05, mode: 'edge', melt: 0.5, phase: 3.1 });
    tableClock.object.position.set(2.55, 0.93, 0.1);
    tableClock.object.rotation.y = -0.4;
    const armClock = clock('blue', { radius: 0.46, fold: 0.05, bend: 0.12, mode: 'rod', melt: 0.4, phase: 0.8 });
    armClock.object.position.set(-1.62, 0.95, -0.35);
    armClock.object.rotation.y = Math.PI / 2 + 0.2;
    root.add(lips, table, tableClock.object, armClock.object);
    settle(root);
    group.add(root);
    const proxy = proxyBox(4.6, 2.6, 2.6, 0.3);
    root.add(proxy);
    let started = -10;
    props.sofa = { object: root, proxy, get busy() { return time - started < 2; }, react() { started = time; } };
    animators.push((t) => {
      const pucker = wobble(t, started, 0.16, 2.6, 8);
      lips.scale.set(1 - pucker * 0.6, 1 + pucker, 1 + pucker * 0.4);
    });
  }

  // ——— The landing stage: a chest of drawers keeps the resume; a lobster telephone takes calls.
  {
    const stage = placed(new Group(), layout.stage);
    stage.add(new Mesh(own(paint(merged([
      new CylinderGeometry(6.4, 6.6, 0.28, 64).translate(0, 0.14, 0),
      new CylinderGeometry(5.9, 6.4, 0.12, 64).translate(0, 0.34, 0),
    ]), '#e6dac2')), vertexColored));
    const floor = 0.4;

    const cabinet = new Group();
    cabinet.position.set(-3.2, floor, -0.2);
    cabinet.rotation.y = 0.28;
    cabinet.add(new Mesh(own(paint(merged([
      new BoxGeometry(1.6, 2.3, 0.9).translate(0, 1.35, 0),
      new BoxGeometry(1.72, 0.1, 1.0).translate(0, 2.55, 0),
      ...[-0.65, 0.65].flatMap((x) => [-0.32, 0.32].map((z) => new CylinderGeometry(0.06, 0.04, 0.2, 8).translate(x, 0.1, z))),
    ]), '#6b432a')), vertexColored));
    const drawerParts: BufferGeometry[] = [];
    for (const y of [0.55, 1.08, 1.61]) {
      drawerParts.push(paint(new BoxGeometry(1.42, 0.44, 0.06).translate(0, y, 0.48), '#87583a'));
      for (const x of [-0.34, 0.34]) drawerParts.push(paint(new SphereGeometry(0.05, 10, 8).translate(x, y, 0.53), '#caa24f'));
    }
    cabinet.add(new Mesh(own(merged(drawerParts)), vertexColored));
    const drawer = new Group();
    drawer.position.set(0, 2.14, 0.3);
    drawer.add(new Mesh(own(paint(merged([
      new BoxGeometry(1.42, 0.44, 0.06).translate(0, 0, 0.18),
      new BoxGeometry(1.36, 0.06, 0.6).translate(0, -0.19, -0.12),
      new BoxGeometry(0.05, 0.36, 0.6).translate(-0.66, -0.02, -0.12),
      new BoxGeometry(0.05, 0.36, 0.6).translate(0.66, -0.02, -0.12),
      new SphereGeometry(0.05, 10, 8).translate(-0.34, 0, 0.23),
      new SphereGeometry(0.05, 10, 8).translate(0.34, 0, 0.23),
    ]), '#87583a')), vertexColored));
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = 256;
    paperCanvas.height = 360;
    const paper = paperCanvas.getContext('2d')!;
    paper.fillStyle = '#f7f2e6';
    paper.fillRect(0, 0, 256, 360);
    paper.fillStyle = '#292e29';
    paper.font = '30px "Iowan Old Style", Palatino, Georgia, serif';
    paper.fillText('William Castle', 22, 52);
    paper.fillStyle = '#8e4935';
    paper.font = '600 13px "Courier New", monospace';
    paper.fillText('RESUME', 22, 78);
    paper.fillStyle = '#b9b3a4';
    for (let line = 0; line < 13; line++) paper.fillRect(22, 104 + line * 18, line % 4 === 3 ? 120 : 200 - (line * 23) % 50, 5);
    const paperTexture = own(new CanvasTexture(paperCanvas));
    paperTexture.colorSpace = SRGBColorSpace;
    // The resume sheet hangs out of its drawer as softly as the clocks.
    const sheetGeometry = own(new PlaneGeometry(0.62, 0.86, 8, 14).rotateX(-Math.PI / 2));
    const sheetPosition = sheetGeometry.getAttribute('position') as BufferAttribute;
    const point = new Vector3();
    for (let index = 0; index < sheetPosition.count; index++) {
      drapePoint(sheetPosition.getX(index), sheetPosition.getZ(index), { radius: 1, fold: 0.1, bend: 0.03, mode: 'edge', melt: 0.25, phase: 0 }, 0.25, 0.7, point);
      sheetPosition.setXYZ(index, point.x, point.y, point.z);
    }
    sheetGeometry.computeVertexNormals();
    const sheet = new Mesh(sheetGeometry, own(new MeshStandardMaterial({ map: paperTexture, side: DoubleSide, roughness: 0.9 })));
    sheet.position.set(0, 0.2, 0.12);
    drawer.add(sheet);
    cabinet.add(drawer);
    const cabinetClock = clock('cream', { radius: 0.42, fold: 0.2, bend: 0.04, mode: 'edge', melt: 0.6, phase: 2.2 });
    cabinetClock.object.position.set(0.62, 2.6, 0.02);
    cabinetClock.object.rotation.y = -Math.PI / 2;
    cabinet.add(cabinetClock.object);
    stage.add(cabinet);
    const cabinetProxy = proxyBox(2.2, 3.2, 1.8, 0, 1.6, 0.2);
    cabinet.add(cabinetProxy);
    let drawerStarted = -10;
    props.cabinet = { object: cabinet, proxy: cabinetProxy, get busy() { return time - drawerStarted < 2.5; }, react() { drawerStarted = time; } };
    animators.push((t) => {
      const since = t - drawerStarted;
      const open = since < 0 || since > 2.5 ? 0 : Math.sin(Math.min(1, since / 0.45) * Math.PI / 2) * (1 - Math.max(0, since - 1.6) / 0.9);
      drawer.position.z = 0.3 + open * 0.42;
    });

    const phone = new Group();
    phone.position.set(2.5, floor, 0.1);
    phone.rotation.y = -0.35;
    phone.add(new Mesh(own(paint(merged([
      new CylinderGeometry(0.46, 0.55, 1.0, 28).translate(0, 0.5, 0),
      new CylinderGeometry(0.62, 0.62, 0.08, 28).translate(0, 1.04, 0),
      new CylinderGeometry(0.11, 0.11, 0.02, 20).rotateX(-0.95).translate(0, 1.28, 0.2),
    ]), '#efe6d2')), vertexColored));
    const lacquer = own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.2 }));
    phone.add(new Mesh(own(paint(merged([
      new CylinderGeometry(0.2, 0.34, 0.3, 4).rotateY(Math.PI / 4).scale(1.35, 1, 1).translate(0, 1.23, 0),
      new BoxGeometry(0.06, 0.16, 0.06).translate(-0.3, 1.43, 0),
      new BoxGeometry(0.06, 0.16, 0.06).translate(0.3, 1.43, 0),
    ]), '#1c1a19')), lacquer));
    const handset = new Group();
    handset.add(new Mesh(own(paint(merged([
      beam(new Vector3(-0.34, 0.06, 0), new Vector3(0.34, 0.06, 0), 0.045),
      new CylinderGeometry(0.1, 0.07, 0.12, 14).translate(-0.36, 0, 0),
      new CylinderGeometry(0.1, 0.07, 0.12, 14).translate(0.36, 0, 0),
    ]), '#1c1a19')), lacquer));
    const lobster: BufferGeometry[] = [
      new SphereGeometry(1, 16, 10).scale(0.26, 0.11, 0.13).translate(0.12, 0.2, 0),
      new ConeGeometry(0.04, 0.16, 8).rotateZ(-Math.PI / 2).translate(0.44, 0.22, 0),
    ];
    for (let segment = 0; segment < 5; segment++) {
      lobster.push(new SphereGeometry(1, 12, 8).scale(0.075, 0.075 - segment * 0.006, 0.105 - segment * 0.01)
        .translate(-0.14 - segment * 0.1, 0.19 - segment * 0.012, 0));
    }
    for (const angle of [-0.55, 0, 0.55]) {
      lobster.push(new SphereGeometry(1, 10, 6).scale(0.1, 0.018, 0.05).rotateY(angle).translate(-0.7 - Math.cos(angle) * 0.03, 0.14, Math.sin(angle) * 0.07));
    }
    for (const side of [-1, 1]) {
      lobster.push(beam(new Vector3(0.3, 0.2, side * 0.08), new Vector3(0.48, 0.2, side * 0.28), 0.028));
      lobster.push(new SphereGeometry(1, 12, 8).scale(0.2, 0.07, 0.1).rotateY(side * -0.35).translate(0.66, 0.2, side * 0.36));
      lobster.push(new ConeGeometry(0.035, 0.18, 8).rotateZ(-Math.PI / 2).rotateY(side * -0.2).translate(0.9, 0.21, side * 0.42));
      lobster.push(beam(new Vector3(0.4, 0.24, side * 0.05), new Vector3(1.05, 0.5, side * 0.55), 0.008, 0.004, 5));
      for (let leg = 0; leg < 4; leg++) {
        lobster.push(beam(new Vector3(0.18 - leg * 0.08, 0.16, side * 0.08), new Vector3(0.14 - leg * 0.09, 0.02, side * 0.24), 0.012, 0.008, 5));
      }
    }
    handset.add(new Mesh(own(paint(merged(lobster), '#cf4a2b')), own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.05 }))));
    handset.position.set(0, 1.5, 0);
    phone.add(handset);
    phone.scale.setScalar(1.25);
    stage.add(phone);
    const phoneProxy = proxyBox(2.0, 2.4, 1.8, 0, 1.2);
    phone.add(phoneProxy);
    let ringStarted = -10;
    props.phone = { object: phone, proxy: phoneProxy, get busy() { return time - ringStarted < 1.6; }, react() { ringStarted = time; } };
    animators.push((t) => {
      const since = t - ringStarted;
      const ring = since < 1.2 ? Math.sin(since * 48) * 0.05 * (1 - since / 1.2) : 0;
      handset.position.y = 1.5 + Math.abs(ring) * 1.2;
      handset.rotation.z = ring;
    });

    // A giant pint, in keeping with "talk shop".
    const pint = new Group();
    pint.position.set(4.35, floor, 0.9);
    const outline = [[0, 0], [0.3, 0], [0.31, 0.05], [0.33, 0.72], [0.38, 0.86], [0.355, 1.0], [0.37, 1.14]].map(([x, y]) => new Vector2(x, y));
    const glass = new Mesh(own(new LatheGeometry(outline, 36)), own(new MeshStandardMaterial({
      color: '#f4fbff', transparent: true, opacity: 0.32, roughness: 0.03, metalness: 0.1, side: DoubleSide, depthWrite: false, envMapIntensity: 2.2,
    })));
    glass.renderOrder = 2;
    const beer = new Mesh(own(new LatheGeometry([[0, 0.05], [0.29, 0.05], [0.31, 0.72], [0.355, 0.86], [0.335, 1.0], [0, 1.0]]
      .map(([x, y]) => new Vector2(x, y)), 36)), own(new MeshStandardMaterial({ color: '#c47a1c', emissive: '#4a2200', roughness: 0.3, transparent: true, opacity: 0.9 })));
    const foam = new Mesh(own(new CylinderGeometry(0.345, 0.335, 0.1, 36)), own(new MeshStandardMaterial({ color: '#f6efe0', roughness: 0.9 })));
    beer.scale.y = 1;
    pint.add(beer, foam, glass);
    pint.scale.setScalar(1.1);
    stage.add(pint);
    const pintProxy = proxyBox(1.0, 1.5, 1.0, 0, 0.7);
    pint.add(pintProxy);
    let sipStarted = -10;
    const level = (t: number): number => {
      const since = t - sipStarted;
      if (since < 0 || since > 4.2) return 1;
      if (since < 1.4) return 1 - 0.85 * Math.sin(since / 1.4 * Math.PI / 2);
      if (since < 2.2) return 0.15;
      return 0.15 + 0.85 * Math.sin(Math.min(1, (since - 2.2) / 2) * Math.PI / 2);
    };
    const pour = (fill: number): void => {
      beer.scale.y = Math.max(0.001, fill);
      foam.visible = fill > 0.04;
      foam.position.y = 0.05 + 0.95 * fill + 0.03;
      foam.scale.set(0.9 + fill * 0.1, 1, 0.9 + fill * 0.1);
    };
    pour(1);
    props.pint = {
      object: pint, proxy: pintProxy,
      get busy() { return time - sipStarted < 4.3; },
      react() { if (time - sipStarted > 4.2) sipStarted = time; },
    };
    animators.push((t) => { if (t - sipStarted < 4.4) pour(level(t)); });
    settle(stage);
    glass.castShadow = beer.castShadow = foam.castShadow = false;
    group.add(stage);
  }

  const scratch = new Vector3();
  return {
    group, clocks, props,
    update(t: number, dt: number, camera: Vector3) {
      time = t;
      const near = (object: Object3D, radius: number): boolean => object.getWorldPosition(scratch).distanceToSquared(camera) < radius * radius;
      for (const clockItem of clocks) clockItem.update(t, dt, near(clockItem.object, 60));
      for (const animate of animators) animate(t, dt, near);
    },
    get busy() { return Object.values(props).some((prop) => prop.busy); },
    dispose() {
      owned.forEach((item) => item.dispose());
      group.traverse((object) => { if (isProxy(object)) (object as Mesh).geometry.dispose(); });
    },
  };
}
