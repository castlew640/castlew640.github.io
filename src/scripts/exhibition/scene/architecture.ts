import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, ExtrudeGeometry, Float32BufferAttribute,
  Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Shape,
} from 'three';
import { polyline, segments, type Inks } from './ink';

export function createArchitecture(inks: Inks, landingStopZ: number) {
  const group = new Group();
  group.name = 'architecture';
  const built = new Group();
  built.name = 'built';
  const drawn = new Group();
  drawn.name = 'drawn';
  group.add(built, drawn);
  const stone = new MeshStandardMaterial({
    roughness: 0.92, metalness: 0, vertexColors: true,
    // The approved .55 hemisphere uses physical irradiance in r186 and alone
    // leaves ivory below the palette's shadow floor. A shared warm bounce term
    // keeps that floor while retaining the exact three-light rig and real shadows.
    emissive: '#ece6d6', emissiveIntensity: 0.42,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  const colors = {
    lit: new Color('#ece6d6'), shade: new Color('#d2c9b5'),
    deep: new Color('#c2baa6'), floor: new Color('#e4dece'),
  };
  const edges: number[] = [];
  const unbuilt: number[] = [];
  const registration: number[] = [];
  const construction: number[] = [];
  const geometries: BufferGeometry[] = [];
  let walkwayObstructions = 0;

  function solid(geometry: BufferGeometry, floor = false): Mesh {
    const normals = geometry.getAttribute('normal');
    const colorsArray: number[] = [];
    for (let i = 0; i < normals.count; i++) {
      const color = floor ? colors.floor : normals.getY(i) < -0.5 ? colors.deep
        : normals.getX(i) > 0.5 ? colors.shade : colors.lit;
      colorsArray.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colorsArray, 3));
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    // The floor is the path itself, not an obstruction above its y=.12 surface.
    if (!floor && box.min.y < 3 && box.max.y > 0.12 && box.min.x < 3 && box.max.x > -3) walkwayObstructions++;
    const mesh = new Mesh(geometry, stone);
    mesh.castShadow = mesh.receiveShadow = true;
    built.add(mesh);
    geometries.push(geometry);
    const outline = new EdgesGeometry(geometry, 20);
    edges.push(...outline.getAttribute('position').array);
    outline.dispose();
    return mesh;
  }

  function box(width: number, height: number, depth: number, x: number, y: number, z: number, floor = false): void {
    solid(new BoxGeometry(width, height, depth).translate(x, y, z), floor);
  }
  const end = landingStopZ - 20;
  box(6, 0.12, 4 - end, 0, 0.06, (4 + end) / 2, true);
  for (const x of [-4.5, 4.5]) box(0.5, 4, 8, x, 2, -4);
  // A continuous roof ends abruptly at z=-8. Shallow ribs make its underside
  // coffered; beyond the break the same grid is ink alone.
  box(9.5, 0.25, 8, 0, 5.125, -4);
  for (const z of [-1, -3, -5, -7]) box(9, 0.2, 0.25, 0, 4.9, z);
  for (const x of [-3, -1, 1, 3]) box(0.25, 0.2, 8, x, 4.9, -4);
  for (const z of [-9, -11, -13, -15]) unbuilt.push(-4.5, 5, z, 4.5, 5, z);
  for (const x of [-4.5, -3, -1, 1, 3, 4.5]) unbuilt.push(x, 5, -8, x, 5, -16);

  // A 5 m outer crown, 6.8 m clear opening and piers outside ±3.4.
  // The ring is bounded by two circular segments; its outer rise is 1.8 m
  // above the 3.2 m springing, with a .5 m stone crown thickness.
  const arch = new Shape();
  function arcPoints(halfWidth: number, rise: number): [number, number][] {
    const radius = (halfWidth * halfWidth + rise * rise) / (2 * rise);
    const centre = 3.2 + rise - radius;
    return Array.from({ length: 49 }, (_, index) => {
      const x = -halfWidth + index / 48 * 2 * halfWidth;
      return [x, centre + Math.sqrt(radius * radius - x * x)];
    });
  }
  const outer = arcPoints(4.4, 1.8);
  const inner = arcPoints(3.4, 1.3).reverse();
  arch.moveTo(...outer[0]);
  for (const point of outer.slice(1)) arch.lineTo(...point);
  for (const point of inner) arch.lineTo(...point);
  arch.closePath();
  solid(new ExtrudeGeometry(arch, { depth: 1, bevelEnabled: false, steps: 1 }).translate(0, 0, -12.5));
  for (const x of [-3.9, 3.9]) box(1, 3.2, 1, x, 1.6, -12);
  const swing = arcPoints(4.9, 2.3).flatMap(([x, y]) => [x, y, -11.48]);
  drawn.add(polyline(swing, inks.arc, true));
  for (const x of [-4.4, 4.4]) {
    for (const y of [0.12, 5]) registration.push(x - 0.073, y, -11.48, x + 0.073, y, -11.48, x, y - 0.073, -11.48, x, y + 0.073, -11.48);
  }

  for (const x of [-5.8, 5.8]) {
    for (let z = -16; z >= landingStopZ; z -= 8) {
      unbuilt.push(x - 0.25, 0, z, x - 0.25, 4.6, z, x + 0.25, 0, z, x + 0.25, 4.6, z,
        x - 0.25, 4.6, z, x + 0.25, 4.6, z);
    }
    unbuilt.push(x, 4.6, -16, x, 4.6, landingStopZ - 6);
    construction.push(x, 0.02, -8, x, 0.02, end);
  }
  construction.push(-10, 0.02, -12, 10, 0.02, -12, -10, 0.02, landingStopZ, 10, 0.02, landingStopZ);
  drawn.add(segments(edges, inks.built, false), segments(unbuilt, inks.unbuilt, true),
    segments(construction, inks.construction, true), segments(registration, inks.registration, false));
  const waterMaterial = new MeshBasicMaterial({ color: '#e3e5d8', toneMapped: false });
  const water = new Mesh(new PlaneGeometry(60, 200).rotateX(-Math.PI / 2).translate(0, 0, -90), waterMaterial);
  water.name = 'water';
  group.add(water);

  return {
    group, built, drawn, stone, water, walkwayObstructions,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      drawn.traverse((object) => { if (object instanceof Mesh) object.geometry.dispose(); });
      water.geometry.dispose();
      waterMaterial.dispose();
      stone.dispose();
    },
  };
}
