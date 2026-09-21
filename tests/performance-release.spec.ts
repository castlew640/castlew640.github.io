import { expect, test } from '@playwright/test';
// @ts-expect-error Node types are intentionally not a production dependency.
import { createHash } from 'node:crypto';

declare const process: { env: Record<string, string | undefined> };
const fixtureCount = Number(process.env.GROWTH_FIXTURE_COUNT ?? 2);
const isFixture = Boolean(process.env.GROWTH_FIXTURE_SUITE);

test('texture work stays near the active station and idle rendering stops', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('exhibition-view', 'moving');
    const original = HTMLImageElement.prototype.decode;
    (window as typeof window & { __decodeCalls: string[] }).__decodeCalls = [];
    HTMLImageElement.prototype.decode = function () {
      (window as typeof window & { __decodeCalls: string[] }).__decodeCalls.push(this.currentSrc || this.src);
      return original.call(this);
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderCount ?? 0)).toBeGreaterThan(0);
  if (fixtureCount >= 10) {
    const initial = await page.evaluate(() => ({
      decoded: (window as typeof window & { __decodeCalls: string[] }).__decodeCalls.length,
      uploaded: window.__exhibition?.panelGpuTextures,
    }));
    expect(initial.decoded).toBeLessThanOrEqual(3);
    expect(initial.uploaded).toBeLessThanOrEqual(3);
  }
  await page.waitForTimeout(1100);
  const idle = await page.evaluate(() => window.__exhibition?.renderCount);
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => window.__exhibition?.renderCount)).toBe(idle);
});

test('ten remounts and five project visits release scene listeners and contexts', async ({ page }) => {
  test.skip(isFixture, 'The real N=2 release owns this repeated-visit check.');
  await page.addInitScript(() => {
    localStorage.setItem('exhibition-view', 'still');
    const active = new Set<string>();
    const ids = new WeakMap<object, number>();
    let nextId = 0;
    const id = (value: object) => { if (!ids.has(value)) ids.set(value, ++nextId); return ids.get(value); };
    const key = (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | EventListenerOptions) =>
      `${id(target)}:${type}:${listener ? id(listener) : 0}:${typeof options === 'boolean' ? options : Boolean(options?.capture)}`;
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const textures = new Set<WebGLTexture>();
    const canvases = new WeakSet<HTMLCanvasElement>();
    let createdContexts = 0;
    let lostContexts = 0;
    const createTexture = WebGL2RenderingContext.prototype.createTexture;
    const deleteTexture = WebGL2RenderingContext.prototype.deleteTexture;
    WebGL2RenderingContext.prototype.createTexture = function () {
      const texture = createTexture.call(this);
      if (texture) textures.add(texture);
      return texture;
    };
    WebGL2RenderingContext.prototype.deleteTexture = function (texture) {
      if (texture) textures.delete(texture);
      return deleteTexture.call(this, texture);
    };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      const context = Reflect.apply(getContext, this, [type, ...args]);
      if (type === 'webgl2' && context && !canvases.has(this)) {
        canvases.add(this);
        createdContexts++;
        add.call(this, 'webglcontextlost', () => { lostContexts++; textures.clear(); });
      }
      return context;
    } as typeof getContext;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (listener) active.add(key(this, type, listener, options));
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (listener) active.delete(key(this, type, listener, options));
      return remove.call(this, type, listener, options);
    };
    (window as typeof window & { __activeListeners: () => number }).__activeListeners = () => active.size;
    (window as typeof window & { __gpuOwnership: () => { createdContexts: number; lostContexts: number; liveTextures: number } }).__gpuOwnership = () =>
      ({ createdContexts, lostContexts, liveTextures: textures.size });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
  const baseline = await page.evaluate(() => (window as typeof window & { __activeListeners: () => number }).__activeListeners());
  const toggle = page.locator('[data-view-toggle]');
  const resources: string[] = [];
  for (let visit = 0; visit < 10; visit++) {
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
    await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
    const current = await page.evaluate(() => ({ ...window.__exhibition! }));
    resources.push(JSON.stringify({ geometries: current.geometries, textures: current.textures,
      materials: current.materials, quality: current.qualityLevel }));
    expect(resources.at(-1)).toBe(resources[0]);
    expect((await page.evaluate(() => (window as typeof window & { __gpuOwnership: () => { liveTextures: number } }).__gpuOwnership())).liveTextures).toBeGreaterThan(0);
    await toggle.click();
    await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => (window as typeof window & { __gpuOwnership: () => { lostContexts: number } }).__gpuOwnership().lostContexts)).toBe(visit + 1);
    expect(await page.evaluate(() => (window as typeof window & { __gpuOwnership: () => { liveTextures: number } }).__gpuOwnership().liveTextures)).toBe(0);
    expect(await page.evaluate(() => (window as typeof window & { __activeListeners: () => number }).__activeListeners())).toBe(baseline);
  }
  expect((await page.evaluate(() => (window as typeof window & { __gpuOwnership: () => { createdContexts: number } }).__gpuOwnership())).createdContexts).toBe(10);
  for (let visit = 0; visit < 5; visit++) {
    await page.goto('/projects/featured-client/');
    await page.getByRole('link', { name: /Back to the exhibition/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'still');
    await expect(page.locator('.exhibition-canvas')).toHaveCount(0);
  }
});

test('expanded fixture preserves every route, ordered exhibit and return anchor', async ({ page, request }) => {
  test.skip(!isFixture || fixtureCount !== 10, 'N=10 isolated fixture only.');
  await page.goto('/');
  const slugs = await page.locator('#exhibition [data-slug]').evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.slug));
  expect(slugs).toEqual(['featured-client', ...Array.from({ length: 9 }, (_, i) => `fixture-personal-${String(i + 1).padStart(2, '0')}`)]);
  const previewURLs = await page.locator('#exhibition [data-slug] figure[data-panel-source] img').evaluateAll((nodes) => nodes.map((node) => (node as HTMLImageElement).getAttribute('src')));
  expect(new Set(previewURLs).size).toBe(10);
  const images = await Promise.all(previewURLs.map(async (url) => {
    expect(url).toMatch(/^\/_astro\/.*\.webp$/);
    const response = await request.get(url!);
    expect(response.status()).toBe(200);
    const body = await response.body();
    expect(body.length).toBeLessThanOrEqual(180_000);
    return { sha256: createHash('sha256').update(body).digest('hex'), bytes: body.length };
  }));
  expect(new Set(images.map((image) => image.sha256)).size).toBe(10);
  console.log(`N=10 distinct optimized previews: ${images.length}; encoded bytes: ${images.reduce((sum, image) => sum + image.bytes, 0)}`);
  for (const slug of slugs) {
    const response = await request.get(`/projects/${slug}/`);
    expect(response.status(), slug).toBe(200);
    const id = `exhibit-${slug}`;
    await page.locator(`[data-slug="${slug}"]`).evaluate((element) => element.scrollIntoView());
    await expect.poll(() => page.evaluate(() => window.__exhibition?.currentStopId)).toBe(id);
    await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
    const scene = await page.evaluate(() => ({ ...window.__exhibition! }));
    expect(Number(scene.panelGpuTextures)).toBeLessThanOrEqual(3);
    expect(Number(scene.textures)).toBeLessThanOrEqual(14);
    expect(Number(scene.drawCalls)).toBeLessThanOrEqual(198);
    expect(Number(scene.triangles)).toBeLessThanOrEqual(282_000);
    expect(Number(scene.materials)).toBeLessThanOrEqual(27);
    expect(Number(scene.lineSegments)).toBeLessThanOrEqual(4_800);
    expect(Number(scene.renderTargetRendersPerFrame)).toBeLessThanOrEqual(1);
    const x = (Number(scene.panelCorner0X) + Number(scene.panelCorner2X)) / 2 * 1280;
    const y = (Number(scene.panelCorner0Y) + Number(scene.panelCorner2Y)) / 2 * 720;
    await page.mouse.click(x, y);
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/$`));
    await page.getByRole('link', { name: /Back to the exhibition/ }).click();
    await expect(page).toHaveURL(new RegExp(`#exhibit-${slug}$`));
  }
});
