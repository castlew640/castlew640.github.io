import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, Float32BufferAttribute, Group,
  Mesh, MeshBasicMaterial, type MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, Texture,
} from 'three';
import { polyline, segments, type Inks } from './ink';

export function createExhibits(stops: HTMLElement[], inks: Inks, stone: MeshStandardMaterial,
  anisotropy: number, requestRender: () => void) {
  const group = new Group();
  const panelGeometry = new PlaneGeometry(4, 2);
  const panels: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  const geometries: BufferGeometry[] = [panelGeometry];
  const cleanups: (() => void)[] = [];
  const edges: number[] = [];
  const drawn: number[] = [];
  const marks: number[] = [];
  let disposed = false;
  let walkwayObstructions = 0;
  inks.leader.transparent = true;
  const noRaycast = (): void => {};
  const colors = { lit: new Color('#ece6d6'), shade: new Color('#d2c9b5'), deep: new Color('#c2baa6') };

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, deep = false): void => {
    const geometry = new BoxGeometry(w, h, d).translate(x, y, z);
    const normals = geometry.getAttribute('normal');
    const values: number[] = [];
    for (let i = 0; i < normals.count; i++) {
      const color = deep || normals.getY(i) < -0.5 ? colors.deep : normals.getX(i) > 0.5 ? colors.shade : colors.lit;
      values.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    if (bounds.min.y < 3 - 0.00001 && bounds.min.x < 3 && bounds.max.x > -3) walkwayObstructions++;
    const mesh = new Mesh(geometry, stone);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.raycast = noRaycast;
    group.add(mesh);
    geometries.push(geometry);
    const outline = new EdgesGeometry(geometry);
    edges.push(...outline.getAttribute('position').array);
    outline.dispose();
  };

  stops.forEach((stop, index) => {
    const z = -30 - 18 * index;
    const variant = index % 3;
    const figure = stop.querySelector<HTMLElement>('figure[data-panel-source]')!;
    const img = figure.querySelector('img')!;
    for (const x of [-3.9, 3.9]) box(1, 5.2, 1, x, 2.6, z);
    box(8.8, 0.8, 1, 0, 5.6, z);
    // A rim around the image, not a second opaque plane in front of it.
    for (const x of [-2.06, 2.06]) box(0.12, 2.12, 0.12, x, 4.1, z);
    box(4, 0.1, 0.12, 0, 3.05, z);
    box(4, 0.12, 0.12, 0, 5.16, z);
    // The 3.0 m clearance is the sill's lower face. Its upper rear overlaps
    // the reveal, behind the image plane, leaving every pixel unobscured.
    box(4.4, 0.2, variant === 1 ? 0.5 : 0.3, 0, 3.1, z - (variant === 1 ? 0.20 : 0.10), true);
    const profile = variant === 1
      ? [-4.4, 6, z, -3.3, 6, z, -3.3, 6.5, z, -2.2, 6.5, z, -2.2, 7.4, z, 2.2, 7.4, z, 2.2, 6.5, z, 3.3, 6.5, z, 3.3, 6, z, 4.4, 6, z]
      : [-4.4, 6, z, 0, 7.4, z, 4.4, 6, z];
    group.add(polyline(profile, inks.unbuilt, true));
    for (const x of [-5, 5]) drawn.push(x, 0, z, x, 6, z);
    for (const side of [-1, 1]) {
      const x = side * 5.8;
      // Match ExhibitDrawing's index % 3: solid right / solid left / both drawn.
      if ((variant === 0 && side === 1) || (variant === 1 && side === -1)) {
        for (const dx of [-0.45, 0.45]) box(0.2, 4.6, 0.3, x + dx, 2.3, z);
        box(1.3, 0.2, 0.3, x, 4.7, z);
      } else drawn.push(x - 0.55, 0, z, x - 0.55, 4.8, z, x - 0.55, 4.8, z, x + 0.55, 4.8, z, x + 0.55, 4.8, z, x + 0.55, 0, z);
    }
    marks.push(2, 3.1, z + 0.07, 3.4, 2.3, z + 0.51);
    for (const x of [-1.4, 0, 1.4]) marks.push(x, 3, z + 0.061, x, 3.16, z + 0.061);
    const dot = segments([2, 3.1, z + 0.071, 2.00001, 3.1, z + 0.071], inks.leader, false);
    // Reuse the rust material; a per-draw width changes no shared material count.
    const prepareLine = dot.onBeforeRender;
    dot.onBeforeRender = function (...args) { prepareLine.apply(this, args); inks.leader.linewidth = 3; inks.leader.uniformsNeedUpdate = true; };
    dot.onAfterRender = () => { inks.leader.linewidth = 1.4; };
    group.add(dot);

    const material = new MeshBasicMaterial({ color: '#f4f0e6', toneMapped: false });
    const panel = new Mesh(panelGeometry, material);
    panel.position.set(0, 4.1, z + 0.06);
    panel.layers.enable(1);
    panel.userData.stop = stop;
    panel.userData.variant = variant;
    panels.push(panel);
    group.add(panel);
    const hatchPoints: number[] = [];
    for (let x = -4; x < 2; x += 0.22) {
      const start = Math.max(-2, x);
      const end = Math.min(2, x + 2);
      if (start < end) hatchPoints.push(start, 3.1 + start - x, z + 0.07, end, 3.1 + end - x, z + 0.07);
    }
    const hatch = segments(hatchPoints, inks.leader, false);
    hatch.visible = false;
    const prepareHatch = hatch.onBeforeRender;
    hatch.onBeforeRender = function (...args) { prepareHatch.apply(this, args); inks.leader.opacity = 0.3; inks.leader.uniformsNeedUpdate = true; };
    hatch.onAfterRender = () => { inks.leader.opacity = 1; };
    group.add(hatch);
    let failed = false;
    const fail = (): void => {
      if (disposed || failed) return;
      failed = true;
      material.map?.dispose();
      material.map = null;
      material.needsUpdate = true;
      hatch.visible = true;
      figure.removeAttribute('aria-hidden');
      figure.dataset.imageDescription = img.alt;
      figure.classList.add('panel-source-failed');
      requestRender();
    };
    img.addEventListener('error', fail);
    void (async () => {
      try {
        await img.decode();
        if (disposed || failed) return;
        const texture = new Texture(img);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(8, anisotropy);
        texture.generateMipmaps = true;
        // Match object-fit:cover without stretching the actual evidence.
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio > 2) { texture.repeat.x = 2 / ratio; texture.offset.x = (1 - texture.repeat.x) / 2; }
        else { texture.repeat.y = ratio / 2; texture.offset.y = (1 - texture.repeat.y) / 2; }
        texture.needsUpdate = true;
        material.map = texture;
        material.color.set('#ffffff');
        material.needsUpdate = true;
        figure.setAttribute('aria-hidden', 'true');
        requestRender();
      } catch { fail(); }
    })();
    cleanups.push(() => {
      img.removeEventListener('error', fail);
      figure.removeAttribute('aria-hidden');
      // A failed real image stays safely presented after returning to still view.
      material.map?.dispose();
      material.dispose();
    });
  });
  group.add(segments(edges, inks.built, false), segments(drawn, inks.unbuilt, true), segments(marks, inks.leader, false));
  return {
    group, panels, walkwayObstructions,
    dispose() {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      group.traverse((object) => { if (object instanceof Mesh && object.geometry !== panelGeometry && !geometries.includes(object.geometry)) object.geometry.dispose(); });
      geometries.forEach((geometry) => geometry.dispose());
    },
  };
}
