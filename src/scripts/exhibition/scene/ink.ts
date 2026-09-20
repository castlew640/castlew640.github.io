import { Vector2 } from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

export function createInkMaterials(cssSize: Vector2) {
  // At the 12 m design standoff in the 1440 × 810 reference viewport:
  // metres / CSS px = 2 × 12 × tan(fovY / 2) / 810 = 0.01041449.
  // fovY = 2 × atan(tan(32°) / (1440/810)). Thus 5/5 px = .05207/.05207 m,
  // 4/7 px = .04166/.07290 m, and 2/6 px = .02083/.06249 m.
  // These remain model-space distances at every approach: dash phase never crawls.
  const m = 2 * 12 * Math.tan(32 * Math.PI / 180) / 1440;
  const inks = {
    built: new LineMaterial({ color: '#4e5144', linewidth: 1.4 }),
    unbuilt: new LineMaterial({ color: '#8b877b', linewidth: 1.3, dashed: true, dashSize: 5 * m, gapSize: 5 * m }),
    construction: new LineMaterial({ color: '#b9b3a4', linewidth: 1, dashed: true, dashSize: 4 * m, gapSize: 7 * m }),
    arc: new LineMaterial({ color: '#b9b3a4', linewidth: 1, dashed: true, dashSize: 2 * m, gapSize: 6 * m }),
    registration: new LineMaterial({ color: '#656256', linewidth: 1 }),
    leader: new LineMaterial({ color: '#8e4935', linewidth: 1.4 }),
  };
  for (const material of Object.values(inks)) {
    material.worldUnits = false;
    material.alphaToCoverage = true;
    material.resolution.copy(cssSize);
    material.depthWrite = false;
  }
  return inks;
}

export type Inks = ReturnType<typeof createInkMaterials>;

function configure<T extends LineSegments2>(line: T, dashed: boolean): T {
  if (dashed) line.computeLineDistances();
  line.raycast = () => {};
  // Also keep CSS pixels during future offscreen reflection passes.
  line.onBeforeRender = (renderer) => { renderer.getSize(line.material.resolution); };
  return line;
}

export function polyline(points: number[], material: LineMaterial, dashed: boolean): Line2 {
  const geometry = new LineGeometry();
  geometry.setPositions(points);
  return configure(new Line2(geometry, material), dashed);
}

// Batch disconnected edges per ink so the architectural drawing stays within
// its draw-call budget without joining unrelated endpoints with extra strokes.
export function segments(points: number[], material: LineMaterial, dashed: boolean): LineSegments2 {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(points);
  return configure(new LineSegments2(geometry, material), dashed);
}
