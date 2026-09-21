import {
  BoxGeometry, BufferGeometry, Color, EdgesGeometry, ExtrudeGeometry, Float32BufferAttribute,
  Group, Mesh, MeshStandardMaterial, Shape, Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { polyline, segments, type Inks } from './ink';
import { routeBounds, routeMatrix, routePoint } from './path';

export function createArchitecture(inks: Inks, landingStation: number) {
  const landingStopZ = -landingStation;
  const bounds = routeBounds(landingStation + 24);
  const group = new Group();
  group.name = 'architecture';
  const built = new Group();
  built.name = 'built';
  const drawn = new Group();
  drawn.name = 'drawn';
  group.add(built, drawn);
  const completed = new Group();
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
  let maximumStructuralBend = 0;
  let nearestLowStructure = Number.POSITIVE_INFINITY;

  function warpArchitecturePoint(point: Vector3, station: number, side: number): Vector3 {
    if (point.y <= 3) return point;
    const t = Math.min(1, (point.y - 3) / 4);
    const eased = t * t * (3 - 2 * t);
    const segment = Math.floor(station / 18);
    // The ribs lean inward on both sides; adjacent fixed route segments have
    // opposite leading edges, avoiding a repetitive perfectly vertical arcade.
    const alternating = segment % 2 === 0 ? 1 : -1;
    point.x += -side * 0.65 * eased + alternating * 0.15 * eased;
    return point;
  }

  function deform(geometry: BufferGeometry, station: number, visibleClearance = true): void {
    const positions = geometry.getAttribute('position');
    const point = new Vector3();
    for (let index = 0; index < positions.count; index++) {
      point.fromBufferAttribute(positions, index);
      const before = point.x;
      const side = point.x === 0 ? 0 : Math.sign(point.x);
      warpArchitecturePoint(point, station, side);
      maximumStructuralBend = Math.max(maximumStructuralBend, Math.abs(point.x - before));
      positions.setXYZ(index, point.x, point.y, point.z);
      if (visibleClearance && point.y > 0.12 && point.y < 1.62) nearestLowStructure = Math.min(nearestLowStructure, Math.abs(point.x));
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }

  function solid(geometry: BufferGeometry, floor = false, station?: number, outline = true): Mesh {
    if (station !== undefined) {
      if (!floor) deform(geometry, station);
      geometry.applyMatrix4(routeMatrix(station, bounds));
    }
    const normals = geometry.getAttribute('normal');
    const colorsArray: number[] = [];
    for (let i = 0; i < normals.count; i++) {
      const color = floor ? colors.floor : normals.getY(i) < -0.5 ? colors.deep
        : normals.getX(i) > 0.5 ? colors.shade : colors.lit;
      colorsArray.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colorsArray, 3));
    geometry.computeBoundingBox();
    const mesh = new Mesh(geometry, stone);
    mesh.castShadow = mesh.receiveShadow = true;
    built.add(mesh);
    geometries.push(geometry);
    if (outline) {
      const edgeGeometry = new EdgesGeometry(geometry, 20);
      edges.push(...edgeGeometry.getAttribute('position').array);
      edgeGeometry.dispose();
    }
    return mesh;
  }

  function box(width: number, height: number, depth: number, x: number, y: number, z: number, floor = false): void {
    if (!floor && y - height / 2 < 3 && y + height / 2 > 0.12 && x - width / 2 < 3 && x + width / 2 > -3) walkwayObstructions++;
    solid(new BoxGeometry(width, height, depth, 1, floor ? 1 : 4, 1).translate(x, y, 0), floor, -z);
  }
  const end = landingStopZ - 20;
  // Fixed route samples form one continuous local six-metre walkway. The
  // slight overlap closes sample seams without changing local clearance.
  for (let station = 1; station <= landingStation + 20; station += 2) {
    solid(new BoxGeometry(6, 0.12, 2.04).translate(0, 0.06, 0), true, station, false);
  }
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
  function arcPoints(halfWidth: number, rise: number, spring = 3.2): [number, number][] {
    const radius = (halfWidth * halfWidth + rise * rise) / (2 * rise);
    const centre = spring + rise - radius;
    return Array.from({ length: 25 }, (_, index) => {
      const angle = Math.asin(halfWidth / radius) * (index / 12 - 1);
      const x = radius * Math.sin(angle);
      return [x, centre + Math.sqrt(radius * radius - x * x)];
    });
  }
  const outer = arcPoints(4.4, 1.8);
  const inner = arcPoints(3.4, 1.3).reverse();
  arch.moveTo(...outer[0]);
  for (const point of outer.slice(1)) arch.lineTo(...point);
  for (const point of inner) arch.lineTo(...point);
  arch.closePath();
  solid(new ExtrudeGeometry(arch, { depth: 1, bevelEnabled: false, steps: 1 }).translate(0, 0, -0.5), false, 12);
  for (const x of [-3.9, 3.9]) box(1, 3.2, 1, x, 1.6, -12);
  const worldLines = (points: number[]): number[] => {
    const transformed: number[] = [];
    for (let index = 0; index < points.length; index += 3) {
      const station = -points[index + 2];
      const local = warpArchitecturePoint(new Vector3(points[index], points[index + 1], 0), station, Math.sign(points[index]));
      transformed.push(...routePoint(station, local.x, local.y, bounds).toArray());
    }
    return transformed;
  };
  const swing = arcPoints(4.9, 2.3).flatMap(([x, y]) => [x, y, -11.48]);
  drawn.add(polyline(worldLines(swing), inks.arc, true));
  for (const x of [-4.4, 4.4]) {
    for (const y of [0.12, 5]) registration.push(x - 0.073, y, -11.48, x + 0.073, y, -11.48, x, y - 0.073, -11.48, x, y + 0.073, -11.48);
  }

  for (const x of [-5.8, 5.8]) {
    for (let z = -16; z >= landingStopZ + 16; z -= 8) {
      unbuilt.push(x - 0.25, 0, z, x - 0.25, 4.6, z, x + 0.25, 0, z, x + 0.25, 4.6, z,
        x - 0.25, 4.6, z, x + 0.25, 4.6, z);
    }
    unbuilt.push(x, 4.6, -16, x, 4.6, landingStopZ + 16);
    construction.push(x, 0.02, -8, x, 0.02, end);
  }
  const aboutZ = landingStopZ + 10;
  // Place the subject ahead of the stop, rather than directly over the camera.
  const corniceZ = aboutZ - 12;
  const cornice = solid(new BoxGeometry(4, 0.6, 1.2).translate(0, 5.2, 0), false, -corniceZ);
  cornice.name = 'floating-cornice';
  const corniceLines: number[] = [];
  for (const x of [-2, 2]) for (const z of [corniceZ - 0.6, corniceZ + 0.6]) {
    corniceLines.push(x, 0, z, x, 4.9, z);
    const geometry = new BoxGeometry(0.15, 4.9, 0.15, 1, 4, 1).translate(x, 2.45, 0);
    deform(geometry, -z, false);
    geometry.applyMatrix4(routeMatrix(-z, bounds));
    const values = Array.from({ length: geometry.getAttribute('position').count }, () => colors.lit.toArray()).flat();
    geometry.setAttribute('color', new Float32BufferAttribute(values, 3));
    completed.add(new Mesh(geometry, stone)); geometries.push(geometry);
  }
  const corniceDrawing = segments(corniceLines, inks.construction, true);
  drawn.add(corniceDrawing);
  for (const x of [-7.5, 7.5]) {
    // Wide, open side arcades, drawn only; no new portal across the path.
    for (const radius of [2, 2.3]) {
      const points = [-radius, 0, -radius, 2.3];
      for (let i = 0; i <= 12; i++) { const angle = Math.PI - i * Math.PI / 12; points.push(radius * Math.cos(angle), 2.3 + radius * Math.sin(angle)); }
      points.push(radius, 0);
      for (let i = 0; i < points.length - 2; i += 2) unbuilt.push(x, points[i + 1], aboutZ - 6 + points[i], x, points[i + 3], aboutZ - 6 + points[i + 2]);
    }
  }
  const landingArchZ = landingStopZ - 18;
  const landingShape = new Shape();
  const landingOuter = arcPoints(4.4, 3.8);
  const landingInner = arcPoints(3.4, 2.8).reverse();
  landingShape.moveTo(...landingOuter[0]);
  for (const point of [...landingOuter.slice(1), ...landingInner]) landingShape.lineTo(...point);
  landingShape.closePath();
  const landingRing = solid(new ExtrudeGeometry(landingShape, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5), false, -landingArchZ);
  landingRing.name = 'landing-ring';
  const landingLeft = solid(new BoxGeometry(1, 3.2, 1).translate(-3.9, 1.6, landingArchZ));
  landingLeft.name = 'landing-left-pier';
  // There is deliberately no right-pier mesh in the visible architecture.
  const rightGeometry = new BoxGeometry(1, 3.2, 1, 1, 4, 1).translate(3.9, 1.6, 0);
  deform(rightGeometry, -landingArchZ, false);
  rightGeometry.applyMatrix4(routeMatrix(-landingArchZ, bounds));
  const rightEdges = new EdgesGeometry(rightGeometry);
  const landingRight = new Group();
  const rightDrawing = segments(Array.from(rightEdges.getAttribute('position').array), inks.unbuilt, true);
  rightDrawing.userData.excludeCompletion = true;
  landingRight.add(rightDrawing); drawn.add(landingRight);
  rightEdges.dispose();
  const rightColors = Array.from({ length: rightGeometry.getAttribute('position').count }, () => colors.lit.toArray()).flat();
  rightGeometry.setAttribute('color', new Float32BufferAttribute(rightColors, 3));
  completed.add(new Mesh(rightGeometry, stone)); geometries.push(rightGeometry);
  // The four supports above are intentionally completion-only. Tracking this
  // from the construction site avoids misclassifying nearby curved walkway
  // samples by their world-axis bounding boxes.
  const corniceSolidSupports = 0;
  const landingRightMeshes = landingRight.children.filter((object) => object instanceof Mesh && !object.geometry.getAttribute('instanceStart')).length;
  construction.push(-10, 0.02, -12, 10, 0.02, -12, -10, 0.02, landingStopZ, 10, 0.02, landingStopZ);
  drawn.add(segments(edges, inks.built, false), segments(worldLines(unbuilt), inks.unbuilt, true),
    segments(worldLines(construction), inks.construction, true), segments(worldLines(registration), inks.registration, false));
  return {
    group, built, drawn, completed, stone, walkwayObstructions,
    get maximumStructuralBend() { return maximumStructuralBend; },
    get localWalkwayClearance() { return Math.min(6, nearestLowStructure * 2); },
    cornice, landingLeft, landingRing, corniceSupports: corniceLines.length / 6, corniceSolidSupports, landingRightMeshes,
    batch() {
      // Once the independent completed copy exists, batch static stone for both
      // the main and shadow passes. Keep the floor receiving but not casting.
      const parts = built.children.filter((object): object is Mesh => object instanceof Mesh).map((mesh) => mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone());
      const merged = mergeGeometries(parts)!;
      parts.forEach((part) => part.dispose());
      built.clear();
      const mesh = new Mesh(merged, stone); mesh.castShadow = mesh.receiveShadow = true; mesh.raycast = () => {};
      built.add(mesh); geometries.push(merged);
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      drawn.traverse((object) => { if (object instanceof Mesh) object.geometry.dispose(); });
      stone.dispose();
    },
  };
}
