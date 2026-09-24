// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import { readFileSync } from 'node:fs';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { isSoftwareRenderer, SOFTWARE_RENDERER } from '../src/lib/exhibition/graphics.ts';

// policy.ts reads matchMedia at import time, so load it against a minimal window.
Object.assign(globalThis, { matchMedia: () => ({ matches: false, addEventListener() {} }) });
const { chooseView } = await import('../src/scripts/exhibition/policy.ts');

const decide = (overrides: Partial<Parameters<typeof chooseView>[0]> & { software?: boolean } = {}) => {
  let probed = 0;
  const result = chooseView({
    explicit: null, reduce: false, phone: false,
    softwareGraphics: () => { probed++; return overrides.software ?? false; },
    ...overrides,
  });
  return { ...result, probed };
};

test('an explicit choice always wins and never probes the graphics', () => {
  assert.deepEqual(decide({ explicit: 'moving', reduce: true, phone: true, software: true }), { mode: 'moving', reason: 'none', probed: 0 });
  assert.deepEqual(decide({ explicit: 'still' }), { mode: 'still', reason: 'none', probed: 0 });
});

test('reduced motion, then the phone default, then slow graphics choose the still view', () => {
  assert.deepEqual(decide({ reduce: true, phone: true, software: true }), { mode: 'still', reason: 'reduced-motion', probed: 0 });
  assert.deepEqual(decide({ phone: true, software: true }), { mode: 'still', reason: 'phone', probed: 0 });
  assert.deepEqual(decide({ software: true }), { mode: 'still', reason: 'graphics', probed: 1 });
  assert.deepEqual(decide(), { mode: 'moving', reason: 'none', probed: 1 });
});

test('software rasterizers are recognized and ordinary GPUs are not', () => {
  for (const name of [
    'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
    'llvmpipe (LLVM 15.0.7, 256 bits)', 'Microsoft Basic Render Driver', 'Google SwiftShader',
  ]) assert.equal(isSoftwareRenderer(name), true, name);
  for (const name of [
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'Apple GPU',
    'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)', 'Adreno (TM) 650',
  ]) assert.equal(isSoftwareRenderer(name), false, name);
});

test('the pre-paint head script uses the same software-renderer pattern', () => {
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
  assert.ok(layout.includes(`/${SOFTWARE_RENDERER.source}/i.test(`), 'BaseLayout must mirror SOFTWARE_RENDERER');
});
