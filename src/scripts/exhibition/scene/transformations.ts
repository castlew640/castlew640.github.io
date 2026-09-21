import {
  BoxGeometry, Color, EdgesGeometry, ExtrudeGeometry, Float32BufferAttribute, Group,
  Mesh, MeshBasicMaterial, Shape, type BufferGeometry, type MeshStandardMaterial, type Vector2,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { segments, type Inks } from './ink';

export function approachProgress(cameraZ: number, elementZ: number): number {
  // Reversed-edge smoothstep: fully drawn at 16 m, fully built at 8 m.
  const t = Math.max(0, Math.min(1, (16 - Math.abs(cameraZ - elementZ)) / 8));
  return t * t * (3 - 2 * t);
}

export function createTransformations(inks: Inks, stone: MeshStandardMaterial, aboutZ: number) {
  const group = new Group();
  const completed = new Group();
  const hatchMaterial = new MeshBasicMaterial({ color: '#8e4935', transparent: true, depthWrite: false });
  hatchMaterial.polygonOffset = true; hatchMaterial.polygonOffsetFactor = -1; hatchMaterial.polygonOffsetUnits = -1;
  hatchMaterial.onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying vec3 hatchPosition;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nhatchPosition = position;');
    shader.fragmentShader = 'varying vec3 hatchPosition;\n' + shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float hatch = fract(dot(hatchPosition.xy, vec2(0.819152, 0.573576)) / 0.07290143);
      if (hatch > 0.142857) discard;`);
  };
  const startColor = new Color('#8b877b');
  const endColor = new Color('#4e5144');
  const elements: { z: number; progress: number; mesh: Mesh; ink: ReturnType<typeof segments>; hatch: Mesh; local: Group }[] = [];
  const geometries: BufferGeometry[] = [];
  const arc = new Shape();
  arc.moveTo(-2.4, 0); arc.lineTo(-2.4, 2);
  for (let i = 0; i <= 16; i++) { const a = Math.PI - i * Math.PI / 16; arc.lineTo(2.4 * Math.cos(a), 2 + 2.4 * Math.sin(a)); }
  arc.lineTo(2.4, 0); arc.lineTo(2, 0); arc.lineTo(2, 2);
  for (let i = 0; i <= 16; i++) { const a = i * Math.PI / 16; arc.lineTo(2 * Math.cos(a), 2 + 2 * Math.sin(a)); }
  arc.lineTo(-2, 0); arc.closePath();
  const arch = new ExtrudeGeometry(arc, { depth: 0.65, bevelEnabled: false, steps: 1 });
  const bay = [-0.7, 0.7].flatMap((x) => [-0.7, 0.7].map((z) => new BoxGeometry(0.3, 4.6, 0.3).translate(x, 2.3, z)));
  const stairs = Array.from({ length: 4 }, (_, i) => new BoxGeometry(1.2, 0.35 * (i + 1), 0.65).translate(0, 0.175 * (i + 1), -i * 0.65));

  function add(parts: BufferGeometry[], x: number, z: number, rotation = 0): void {
    const normalized = parts.map((part) => { const result = part.index ? part.toNonIndexed() : part; if (result !== part) part.dispose(); return result; });
    const geometry = mergeGeometries(normalized)!;
    normalized.forEach((part) => part.dispose());
    const colors: number[] = [];
    const normals = geometry.getAttribute('normal');
    for (let i = 0; i < normals.count; i++) {
      const color = new Color(normals.getX(i) > 0.5 ? '#d2c9b5' : '#ece6d6');
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    const material = stone.clone(); material.transparent = true; material.depthWrite = false;
    const mesh = new Mesh(geometry, material); mesh.receiveShadow = true; mesh.raycast = () => {};
    const edgeGeometry = new EdgesGeometry(geometry, 20);
    const inkMaterial = inks.unbuilt.clone();
    const ink = segments(Array.from(edgeGeometry.getAttribute('position').array), inkMaterial, true);
    edgeGeometry.dispose();
    // Shared procedural 35-degree / 7px-at-design-standoff hatch, with no texture.
    const hatch = new Mesh(geometry, hatchMaterial); hatch.raycast = () => {};
    const local = new Group(); local.position.set(x, 0, z); local.rotation.y = rotation;
    local.add(mesh, ink, hatch); group.add(local);
    const finished = new Mesh(geometry, stone);
    finished.position.copy(local.position); finished.rotation.copy(local.rotation); completed.add(finished);
    const element = { z, progress: 0, mesh, ink, hatch, local };
    hatch.onBeforeRender = () => { hatchMaterial.opacity = 0.35 * (1 - element.progress); };
    elements.push(element);
    geometries.push(geometry, ink.geometry);
  }
  // Side elevation keeps the whole 4 m arch at x=5, outside the six-metre path.
  add([arch], 5, -9, Math.PI / 2);
  add(bay, -5.8, -30);
  add(stairs, -6.2, aboutZ);

  return {
    group, completed, elements,
    update(cameraZ: number): void {
      for (const element of elements) {
        const progress = approachProgress(cameraZ, element.z);
        element.progress = progress;
        element.mesh.visible = progress > 0;
        element.mesh.castShadow = progress >= 0.5;
        const material = element.mesh.material as MeshStandardMaterial;
        material.opacity = progress;
        material.depthWrite = progress === 1;
        element.ink.material.color.copy(startColor).lerp(endColor, progress);
        element.ink.material.linewidth = 1.3 + 0.1 * progress;
        element.ink.material.gapSize = inks.unbuilt.gapSize * (1 - progress);
        element.hatch.visible = progress > 0 && progress < 1;
        // Only the arch gains depth; the bay and stair gain opaque material.
        if (element === elements[0]) element.local.scale.z = 0.02 + 0.98 * progress;
      }
    },
    resize(size: Vector2) { elements.forEach((element) => element.ink.material.resolution.copy(size)); },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      elements.forEach((element) => { (element.mesh.material as MeshStandardMaterial).dispose(); element.ink.material.dispose(); });
      hatchMaterial.dispose();
    },
  };
}
