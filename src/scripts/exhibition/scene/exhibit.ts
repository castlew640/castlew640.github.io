import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, Float32BufferAttribute, Group,
  Mesh, MeshBasicMaterial, type MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, Texture, Vector2,
} from 'three';
import { polyline, segments, type Inks } from './ink';
import { routeBounds, routeMatrix } from './path';
import { containedScale } from '../../../lib/evidence-fit';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function createExhibits(stops: HTMLElement[], inks: Inks, stone: MeshStandardMaterial,
  anisotropy: number, requestRender: () => void, landingStation: number) {
  const group = new Group();
  const completed = new Group();
  const bounds = routeBounds(landingStation + 24);
  const panelGeometry = new PlaneGeometry(4, 2);
  const panels: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  const geometries: BufferGeometry[] = [panelGeometry];
  const cleanups: (() => void)[] = [];
  const textureWindows: { station: number; setActive(active: boolean): void }[] = [];
  let disposed = false;
  let walkwayObstructions = 0;
  inks.leader.transparent = true;
  const noRaycast = (): void => {};
  const colors = { lit: new Color('#ece6d6'), shade: new Color('#d2c9b5'), deep: new Color('#c2baa6') };

  stops.forEach((stop, index) => {
    const portal = new Group();
    const portalStation = 30 + 18 * index;
    portal.applyMatrix4(routeMatrix(portalStation, bounds));
    group.add(portal);
    const edges: number[] = [];
    const drawn: number[] = [];
    const marks: number[] = [];
    const variant = index % 3;
    const figure = stop.querySelector<HTMLElement>('figure[data-panel-source]')!;
    const img = figure.querySelector('img')!;
    const contain = figure.dataset.evidenceFit === 'contain';
    const imageScale = new Vector2(1, 1);

    const box = (w: number, h: number, d: number, x: number, y: number, z = 0, deep = false): Mesh => {
      const geometry = new BoxGeometry(w, h, d).translate(x, y, z);
      const normals = geometry.getAttribute('normal');
      const values: number[] = [];
      for (let i = 0; i < normals.count; i++) {
        const color = deep || normals.getY(i) < -0.5 ? colors.deep : normals.getX(i) > 0.5 ? colors.shade : colors.lit;
        values.push(color.r, color.g, color.b);
      }
      geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
      geometry.computeBoundingBox();
      const localBounds = geometry.boundingBox!;
      if (localBounds.min.y < 3 - 0.00001 && localBounds.min.x < 3 && localBounds.max.x > -3) walkwayObstructions++;
      const mesh = new Mesh(geometry, stone);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.raycast = noRaycast;
      portal.add(mesh);
      geometries.push(geometry);
      const outline = new EdgesGeometry(geometry);
      edges.push(...outline.getAttribute('position').array);
      outline.dispose();
      return mesh;
    };

    // Portal 2's right pier is deliberately a drawing in the visible world.
    // Its complete stone counterpart is present only in the completed layer.
    for (const side of [-1, 1]) {
      const x = side * 3.9;
      if (index === 1 && side === 1) {
        drawn.push(x - 0.5, 0, 0, x - 0.5, 5.2, 0, x - 0.5, 5.2, 0, x + 0.5, 5.2, 0,
          x + 0.5, 5.2, 0, x + 0.5, 0, 0, x + 0.5, 0, 0, x - 0.5, 0, 0);
        const geometry = new BoxGeometry(1, 5.2, 1).translate(x, 2.6, 0);
        const values = Array.from({ length: geometry.getAttribute('position').count }, () => colors.lit.toArray()).flat();
        geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
        const mesh = new Mesh(geometry, stone);
        mesh.applyMatrix4(routeMatrix(portalStation, bounds));
        completed.add(mesh);
        geometries.push(geometry);
      } else box(1, 5.2, 1, x, 2.6);
    }
    box(8.8, 0.8, 1, 0, 5.6);
    for (const x of [-2.06, 2.06]) box(0.12, 2.12, 0.12, x, 4.1);
    box(4, 0.1, 0.12, 0, 3.05);
    box(4, 0.12, 0.12, 0, 5.16);
    box(4.4, 0.2, variant === 1 ? 0.5 : 0.3, 0, 3.1, -(variant === 1 ? 0.20 : 0.10), true);
    const profile = variant === 1
      ? [-4.4, 6, 0, -3.3, 6, 0, -3.3, 6.5, 0, -2.2, 6.5, 0, -2.2, 7.4, 0, 2.2, 7.4, 0, 2.2, 6.5, 0, 3.3, 6.5, 0, 3.3, 6, 0, 4.4, 6, 0]
      : [-4.4, 6, 0, 0, 7.4, 0, 4.4, 6, 0];
    portal.add(polyline(profile, inks.unbuilt, true));
    for (const x of [-5, 5]) drawn.push(x, 0, 0, x, 6, 0);
    for (const side of [-1, 1]) {
      const x = side * 5.8;
      // Preserve the deterministic outboard-member variation separately from
      // the portal-2 impossible pier above.
      if ((variant === 0 && side === 1) || (variant === 1 && side === -1)) {
        for (const dx of [-0.45, 0.45]) box(0.2, 4.6, 0.3, x + dx, 2.3);
        box(1.3, 0.2, 0.3, x, 4.7);
      } else drawn.push(x - 0.55, 0, 0, x - 0.55, 4.8, 0, x - 0.55, 4.8, 0, x + 0.55, 4.8, 0, x + 0.55, 4.8, 0, x + 0.55, 0, 0);
    }
    marks.push(2, 3.1, 0.07, 3.4, 2.3, 0.51);
    for (const x of [-1.4, 0, 1.4]) marks.push(x, 3, 0.061, x, 3.16, 0.061);
    const dot = segments([2, 3.1, 0.071, 2.00001, 3.1, 0.071], inks.leader, false);
    const prepareLine = dot.onBeforeRender;
    dot.onBeforeRender = function (...args) { prepareLine.apply(this, args); inks.leader.linewidth = 3; inks.leader.uniformsNeedUpdate = true; };
    dot.onAfterRender = () => { inks.leader.linewidth = 1.4; };
    portal.add(dot);

    const material = new MeshBasicMaterial({ color: '#f4f0e6', toneMapped: false });
    if (contain) {
      // Keep one pickable 4x2 panel and one GPU texture: shade the unused UV
      // area in stone instead of cropping the decoded DOM image or adding a mesh.
      material.onBeforeCompile = (shader) => {
        shader.uniforms.evidenceScale = { value: imageScale };
        shader.uniforms.evidenceStone = { value: colors.lit };
        shader.fragmentShader = shader.fragmentShader.replace('void main() {',
          'uniform vec2 evidenceScale; uniform vec3 evidenceStone;\nvoid main() {');
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec2 evidenceUv = (vMapUv - vec2(0.5)) / evidenceScale + vec2(0.5);
            if (any(lessThan(evidenceUv, vec2(0.0))) || any(greaterThan(evidenceUv, vec2(1.0)))) {
              diffuseColor.rgb = evidenceStone;
            } else {
              diffuseColor *= texture2D(map, evidenceUv);
            }
          #endif
        `);
      };
      material.customProgramCacheKey = () => 'contained-evidence-v1';
    }
    const panel = new Mesh(panelGeometry, material);
    panel.position.set(0, 4.1, 0.06);
    panel.layers.enable(1);
    panel.userData.stop = stop;
    panel.userData.stopId = stop.dataset.stopId ?? stop.id;
    panel.userData.variant = variant;
    panel.userData.evidenceFit = contain ? 'contain' : 'cover';
    panel.userData.imageScale = imageScale;
    panels.push(panel);
    portal.add(panel);
    const hatchPoints: number[] = [];
    for (let x = -4; x < 2; x += 0.22) {
      const start = Math.max(-2, x);
      const end = Math.min(2, x + 2);
      if (start < end) hatchPoints.push(start, 3.1 + start - x, 0.07, end, 3.1 + end - x, 0.07);
    }
    const hatch = segments(hatchPoints, inks.leader, false);
    hatch.visible = false;
    const prepareHatch = hatch.onBeforeRender;
    hatch.onBeforeRender = function (...args) { prepareHatch.apply(this, args); inks.leader.opacity = 0.3; inks.leader.uniformsNeedUpdate = true; };
    hatch.onAfterRender = () => { inks.leader.opacity = 1; };
    portal.add(hatch);
    portal.add(segments(edges, inks.built, false), segments(drawn, inks.unbuilt, true), segments(marks, inks.leader, false));

    // Every portal uses one stone draw instead of one draw per structural
    // member. Keep the separate panel and ink so picking and construction
    // strokes still behave independently as the catalogue grows.
    const stones = portal.children.filter((object): object is Mesh<BufferGeometry, MeshStandardMaterial> =>
      object instanceof Mesh && object.material === stone);
    const mergedStone = mergeGeometries(stones.map((mesh) => mesh.geometry));
    if (!mergedStone) throw new Error('Portal stone geometry could not be merged');
    for (const mesh of stones) {
      portal.remove(mesh);
      const geometryIndex = geometries.indexOf(mesh.geometry);
      if (geometryIndex !== -1) geometries.splice(geometryIndex, 1);
      mesh.geometry.dispose();
    }
    const portalStone = new Mesh(mergedStone, stone);
    portalStone.castShadow = portalStone.receiveShadow = true;
    portalStone.raycast = noRaycast;
    portal.add(portalStone);
    geometries.push(mergedStone);

    let failed = false;
    let active = false;
    let generation = 0;
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
    const prepare = async (token: number): Promise<void> => {
      try {
        await img.decode();
        if (disposed || failed || !active || token !== generation) return;
        const texture = new Texture(img);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(8, anisotropy);
        texture.generateMipmaps = true;
        const ratio = img.naturalWidth / img.naturalHeight;
        if (contain) {
          const scale = containedScale(img.naturalWidth, img.naturalHeight);
          imageScale.set(scale.x, scale.y);
        } else if (ratio > 2) { texture.repeat.x = 2 / ratio; texture.offset.x = (1 - texture.repeat.x) / 2; }
        else { texture.repeat.y = ratio / 2; texture.offset.y = (1 - texture.repeat.y) / 2; }
        texture.needsUpdate = true;
        material.map = texture;
        material.color.set('#ffffff');
        material.needsUpdate = true;
        hatch.visible = false;
        figure.removeAttribute('aria-hidden');
        requestRender();
      } catch { if (active && token === generation) fail(); }
    };
    textureWindows.push({
      station: portalStation,
      setActive(next) {
        if (active === next || disposed) return;
        active = next;
        generation++;
        if (active) {
          if (!failed) {
            hatch.visible = !material.map;
            void prepare(generation);
          }
        } else {
          material.map?.dispose();
          material.map = null;
          material.color.set('#f4f0e6');
          material.needsUpdate = true;
          hatch.visible = false;
        }
        requestRender();
      },
    });
    cleanups.push(() => {
      generation++;
      img.removeEventListener('error', fail);
      figure.removeAttribute('aria-hidden');
      material.map?.dispose();
      material.dispose();
    });
  });

  return {
    group, completed, panels, walkwayObstructions,
    setActiveStation(station: number) {
      if (disposed || !Number.isFinite(station) || textureWindows.length === 0) return;
      let nearest = 0;
      for (let index = 1; index < textureWindows.length; index++) {
        if (Math.abs(textureWindows[index].station - station) < Math.abs(textureWindows[nearest].station - station)) nearest = index;
      }
      textureWindows.forEach((window, index) => window.setActive(Math.abs(index - nearest) <= 1));
    },
    dispose() {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      for (const root of [group, completed]) root.traverse((object) => {
        if (object instanceof Mesh && object.geometry !== panelGeometry && !geometries.includes(object.geometry)) object.geometry.dispose();
      });
      geometries.forEach((geometry) => geometry.dispose());
    },
  };
}
