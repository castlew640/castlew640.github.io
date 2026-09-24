import {
  BoxGeometry, BufferGeometry, CanvasTexture, ExtrudeGeometry, Group, Matrix4, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Path, PlaneGeometry, Shape, SphereGeometry, SRGBColorSpace, Texture, Vector3,
} from 'three';
import { createMeltingClock, type FaceStyle, type MeltingClock } from './clocks';
import { FRAME_BORDER, UP, type StopLayout } from './layout';
import { beam, merged, paint, proxyBox, settle } from './props';

export interface Exhibit {
  stop: StopLayout;
  slug: string;
  element: HTMLElement;
  group: Group;
  canvas: Mesh<PlaneGeometry, MeshBasicMaterial>;
  proxy: Mesh;
  clock: MeltingClock;
  setHover(on: boolean): void;
  readonly textureReady: boolean;
  /** Width / height of the uploaded evidence, or 0 before it arrives. */
  readonly imageAspect: number;
}

const MAT = 0.16;

function frameGeometry(width: number, height: number): BufferGeometry {
  const border = FRAME_BORDER - MAT;
  const outerWidth = width + 2 * MAT + 2 * border;
  const outerHeight = height + 2 * MAT + 2 * border;
  const shape = new Shape();
  shape.moveTo(-outerWidth / 2, -outerHeight / 2);
  shape.lineTo(outerWidth / 2, -outerHeight / 2);
  shape.lineTo(outerWidth / 2, outerHeight / 2);
  shape.lineTo(-outerWidth / 2, outerHeight / 2);
  shape.closePath();
  const hole = new Path();
  const innerWidth = width + 2 * MAT;
  const innerHeight = height + 2 * MAT;
  hole.moveTo(-innerWidth / 2, -innerHeight / 2);
  hole.lineTo(-innerWidth / 2, innerHeight / 2);
  hole.lineTo(innerWidth / 2, innerHeight / 2);
  hole.lineTo(innerWidth / 2, -innerHeight / 2);
  hole.closePath();
  shape.holes.push(hole);
  const moulding = new ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.13, bevelSegments: 3, curveSegments: 1 });
  moulding.translate(0, 0, -0.06);
  const parts: BufferGeometry[] = [moulding];
  // Rosettes at the corners and mid-rails give the gilt a baroque rhythm.
  for (const x of [-1, 0, 1]) for (const y of [-1, 1]) {
    const rosette = new SphereGeometry(x === 0 ? 0.14 : 0.2, 14, 10).scale(1, 1, 0.55)
      .translate(x * (outerWidth / 2 - border / 2), y * (outerHeight / 2 - border / 2), 0.2);
    parts.push(rosette.toNonIndexed());
    rosette.dispose();
  }
  const geometry = merged(parts);
  geometry.computeVertexNormals();
  return geometry;
}

function supportGeometry(variant: number, width: number, height: number, ground: number): BufferGeometry {
  const halfWidth = width / 2 + FRAME_BORDER;
  const bottom = -height / 2 - FRAME_BORDER;
  const parts: BufferGeometry[] = [];
  const wood = '#6a4630';
  if (variant === 0) {
    // A painter's easel, far too tall, with a ledge under the frame.
    const top = height / 2 + FRAME_BORDER + 0.9;
    parts.push(paint(beam(new Vector3(-halfWidth * 0.62, ground, -0.3), new Vector3(-0.3, top, -0.34), 0.075, 0.05), wood));
    parts.push(paint(beam(new Vector3(halfWidth * 0.62, ground, -0.3), new Vector3(0.3, top, -0.34), 0.075, 0.05), wood));
    parts.push(paint(beam(new Vector3(0, ground, -2.3), new Vector3(0, top - 0.25, -0.4), 0.06, 0.045), wood));
    parts.push(paint(new BoxGeometry(halfWidth * 2 + 0.5, 0.12, 0.62).translate(0, bottom - 0.06, 0.02), wood));
    parts.push(paint(new BoxGeometry(halfWidth * 1.25, 0.08, 0.08).translate(0, (ground + bottom) / 2, -0.3), wood));
  } else if (variant === 1) {
    // Two forked crutches hold the painting up, as Dalí propped his soft forms.
    const crutch = '#b9905e';
    for (const side of [-1, 1]) {
      const foot = new Vector3(side * halfWidth * 0.9, ground, 0.9);
      const fork = new Vector3(side * halfWidth * 0.72, bottom - 0.42, 0.22);
      parts.push(paint(beam(foot, fork, 0.055, 0.05), crutch));
      parts.push(paint(beam(fork, new Vector3(side * (halfWidth * 0.72 - 0.26), bottom - 0.02, 0.2), 0.035), crutch));
      parts.push(paint(beam(fork, new Vector3(side * (halfWidth * 0.72 + 0.26), bottom - 0.02, 0.2), 0.035), crutch));
      parts.push(paint(new BoxGeometry(0.7, 0.07, 0.2).translate(side * halfWidth * 0.72, bottom - 0.02, 0.2), '#7a5a3a'));
      const grip = foot.clone().lerp(fork, 0.55);
      parts.push(paint(new BoxGeometry(0.32, 0.05, 0.05).translate(grip.x, grip.y, grip.z), '#7a5a3a'));
    }
    parts.push(paint(beam(new Vector3(0, ground, -2.4), new Vector3(0, 0.4, -0.12), 0.05), crutch));
  } else {
    // Four spindly legs with knobbly knees, borrowed from the elephants.
    const leg = '#3d302a';
    for (const side of [-1, 1]) for (const depth of [-1, 1]) {
      const hip = new Vector3(side * halfWidth * 0.78, bottom + 0.05, depth * 0.12);
      const knee = new Vector3(side * (halfWidth * 0.78 + 0.6), bottom + (ground - bottom) * 0.48, depth * 0.55);
      const foot = new Vector3(side * (halfWidth * 0.78 + 0.25), ground, depth * 0.85);
      parts.push(paint(beam(hip, knee, 0.09, 0.07), leg));
      parts.push(paint(beam(knee, foot, 0.07, 0.04), leg));
      parts.push(paint(new SphereGeometry(0.12, 10, 8).translate(knee.x, knee.y, knee.z), leg));
      parts.push(paint(new SphereGeometry(0.1, 10, 8).scale(1.3, 0.5, 1.3).translate(foot.x, foot.y + 0.04, foot.z), leg));
    }
  }
  return merged(parts);
}

function plaqueTexture(index: number, title: string): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 112;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#e2c47a');
  gradient.addColorStop(0.5, '#c79c47');
  gradient.addColorStop(1, '#9f7730');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(60, 40, 10, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  ctx.fillStyle = '#2d2112';
  ctx.textAlign = 'center';
  ctx.font = '600 19px "Courier New", monospace';
  ctx.fillText(`EXHIBIT ${String(index + 1).padStart(2, '0')}`, canvas.width / 2, 40);
  ctx.font = '36px "Iowan Old Style", Palatino, Georgia, serif';
  let label = title;
  while (ctx.measureText(label).width > canvas.width - 60 && label.length > 4) label = `${label.slice(0, -2).trimEnd()}…`;
  ctx.fillText(label, canvas.width / 2, 84);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createExhibits(layouts: StopLayout[], elements: HTMLElement[], faces: Record<FaceStyle, CanvasTexture>,
  anisotropy: number, requestRender: () => void) {
  const group = new Group();
  const owned: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T): T => { owned.push(item); return item; };
  const woodMaterial = own(new MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }));
  const matMaterial = own(new MeshStandardMaterial({ color: '#efe6d1', roughness: 0.95 }));
  const backMaterial = own(new MeshStandardMaterial({ color: '#4a3524', roughness: 0.9 }));
  const exhibits: Exhibit[] = [];
  const windows: { station: number; setActive(active: boolean): void }[] = [];
  let disposed = false;

  layouts.forEach((stop, index) => {
    const element = elements[index];
    const slug = element.dataset.slug ?? '';
    const figure = element.querySelector<HTMLElement>('figure[data-panel-source]');
    const img = figure?.querySelector('img') ?? null;
    const canvasSize = stop.canvas!;
    const variant = stop.variant ?? 0;
    const root = new Group();
    const { center, normal } = stop.subject;
    const xAxis = new Vector3().crossVectors(UP, normal).normalize();
    root.matrix.copy(new Matrix4().makeBasis(xAxis, UP, normal).setPosition(center));
    root.matrix.decompose(root.position, root.quaternion, root.scale);
    group.add(root);

    const gold = own(new MeshStandardMaterial({ color: '#c9a04c', metalness: 0.88, roughness: 0.3, emissive: '#6b4a10', emissiveIntensity: 0 }));
    const frame = new Mesh(own(frameGeometry(canvasSize.width, canvasSize.height)), gold);
    const mat = new Mesh(own(new PlaneGeometry(canvasSize.width + 2 * MAT, canvasSize.height + 2 * MAT)), matMaterial);
    mat.position.z = -0.01;
    const back = new Mesh(own(new BoxGeometry(canvasSize.width + 2 * FRAME_BORDER, canvasSize.height + 2 * FRAME_BORDER, 0.06)), backMaterial);
    back.position.z = -0.1;
    const material = own(new MeshBasicMaterial({ color: '#efe6d1', toneMapped: false }));
    const canvasGeometry = own(new PlaneGeometry(canvasSize.width, canvasSize.height));
    const uv = canvasGeometry.getAttribute('uv');
    for (let index = 0; index < uv.count; index++) uv.setY(index, 1 - uv.getY(index));
    const canvas = new Mesh(canvasGeometry, material);
    canvas.position.z = 0.012;
    const support = new Mesh(own(supportGeometry(variant, canvasSize.width, canvasSize.height, -center.y)), woodMaterial);
    const title = element.querySelector('.exhibit-title')?.textContent?.split(' — ')[0]?.trim() || slug;
    const plaqueMap = own(plaqueTexture(index, title));
    const plaque = new Mesh(own(new BoxGeometry(2.1, 0.37, 0.04)), own(new MeshStandardMaterial({ map: plaqueMap, metalness: 0.6, roughness: 0.4 })));
    plaque.position.set(0, -canvasSize.height / 2 - FRAME_BORDER / 2 - 0.02, 0.27);
    root.add(frame, mat, back, canvas, support, plaque);

    // A soft clock slumps over the front of the top rail near a corner. It
    // hangs no lower than the gilt border, so the evidence stays unobstructed.
    const corner = index % 2 === 0 ? 1 : -1;
    const clock = own(createMeltingClock(faces[index % 2 === 0 ? 'cream' : 'blue'],
      { radius: 0.56, fold: 0.16, bend: 0.06, mode: 'edge', melt: 0.32, phase: index * 1.3 }));
    // The moulding's bevel adds 0.13 around the border and 0.18 in front of the rail's centre.
    clock.object.position.set(corner * (canvasSize.width / 2 + FRAME_BORDER - 0.62), canvasSize.height / 2 + FRAME_BORDER + 0.13, 0.18 - 0.16);
    clock.object.rotation.y = corner * 0.12;
    root.add(clock.object);
    settle(root);
    canvas.castShadow = false;
    plaque.castShadow = false;

    const proxy = proxyBox(canvasSize.width + 2 * FRAME_BORDER + 0.4, canvasSize.height + 2 * FRAME_BORDER + 0.8, 1.2, 0, 0.2, 0);
    root.add(proxy);

    let failed = false;
    let active = false;
    let generation = 0;
    let ready = false;
    const fail = (): void => {
      if (disposed || failed || !figure || !img) return;
      failed = true;
      release();
      material.color.set('#d8cbb0');
      material.needsUpdate = true;
      figure.dataset.imageDescription = img.alt;
      figure.classList.add('panel-source-failed');
      requestRender();
    };
    img?.addEventListener('error', fail);
    let bitmap: ImageBitmap | null = null;
    const release = (): void => {
      material.map?.dispose();
      material.map = null;
      bitmap?.close();
      bitmap = null;
    };
    const prepare = async (token: number): Promise<void> => {
      if (!img) return;
      try {
        // The catalogue image is visually hidden in 3D, so its rendered size is
        // zero. Upload a bitmap of its natural size from the same request.
        img.loading = 'eager';
        await img.decode();
        const decoded = await createImageBitmap(img);
        if (disposed || failed || !active || token !== generation) { decoded.close(); return; }
        release();
        bitmap = decoded;
        const texture = new Texture(decoded);
        texture.colorSpace = SRGBColorSpace;
        texture.flipY = false;
        texture.anisotropy = Math.min(8, anisotropy);
        texture.needsUpdate = true;
        material.map = texture;
        material.color.set('#ffffff');
        material.needsUpdate = true;
        ready = true;
        requestRender();
      } catch { if (active && token === generation) fail(); }
    };
    windows.push({
      station: stop.station,
      setActive(next) {
        if (active === next || disposed) return;
        active = next;
        generation++;
        if (active) { if (!failed) void prepare(generation); }
        else {
          release();
          material.color.set('#efe6d1');
          material.needsUpdate = true;
          ready = false;
        }
        requestRender();
      },
    });
    owned.push({ dispose: () => { generation++; img?.removeEventListener('error', fail); release(); } });

    exhibits.push({
      stop, slug, element, group: root, canvas, proxy, clock,
      get textureReady() { return ready; },
      get imageAspect() { return bitmap ? bitmap.width / bitmap.height : 0; },
      setHover(on) { gold.emissiveIntensity = on ? 0.55 : 0; },
    });
  });

  return {
    group, exhibits,
    setActiveStation(station: number) {
      if (disposed || windows.length === 0 || !Number.isFinite(station)) return;
      let nearest = 0;
      for (let index = 1; index < windows.length; index++) {
        if (Math.abs(windows[index].station - station) < Math.abs(windows[nearest].station - station)) nearest = index;
      }
      windows.forEach((window, index) => window.setActive(Math.abs(index - nearest) <= 1));
    },
    update(time: number, dt: number, camera: Vector3) {
      for (const exhibit of exhibits) exhibit.clock.update(time, dt, exhibit.stop.subject.center.distanceToSquared(camera) < 70 * 70);
    },
    dispose() {
      disposed = true;
      owned.forEach((item) => item.dispose());
      group.traverse((object) => { if (object instanceof Mesh && object.material instanceof MeshStandardMaterial && !object.material.visible) object.geometry.dispose(); });
    },
  };
}

