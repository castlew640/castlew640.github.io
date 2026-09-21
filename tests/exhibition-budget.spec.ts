import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { name: 'laptop', viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1, hasTouch: false },
  { name: 'portrait', viewport: { width: 390, height: 664 }, deviceScaleFactor: 3, hasTouch: true },
  { name: 'ultrawide', viewport: { width: 1730, height: 800 }, deviceScaleFactor: 1, hasTouch: false },
];

async function ready(page: Page, hash = 'exhibit-featured-client'): Promise<void> {
  await page.goto(`/#${hash}`);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderCount ?? 0)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
}

for (const { name, ...options } of viewports) {
  test(`completed reflection and actual scene budgets at ${name}`, async ({ browser }) => {
    const context = await browser.newContext({ ...options, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await ready(page);
    const projectCount = await page.locator('#exhibition [data-stop][data-slug]').count();
    const data = await page.evaluate(() => ({ ...window.__exhibition! }));
    const within = (key: string, maximum: number) => Number(data[key]) <= maximum;
    // r186 allocates internal render-target attachments beyond the design's
    // three sampled textures. Keep the actual renderer count, with a measured
    // five-allocation cap at N=1 (one additional panel allocation per exhibit).
    expect({ calls: within('drawCalls', 90), triangles: within('triangles', 120000),
      materials: within('materials', 17 + projectCount), gpuTextures: within('textures', 4 + projectCount),
      lines: within('lineSegments', 1200 + 400 * Math.max(0, projectCount - 1)), reflectionPasses: within('renderTargetRendersPerFrame', 1),
      targetWidth: within('reflectionTargetWidth', 1024), targetHeight: within('reflectionTargetHeight', 512),
    }).toEqual({ calls: true, triangles: true, materials: true, gpuTextures: true, lines: true,
      reflectionPasses: true, targetWidth: true, targetHeight: true });
    expect(data).toMatchObject({ reflectionLayerMask: 4, completedLayerZeroObjects: 0, lightsOnBothLayers: true,
      shadowLights: 1, station: 18, currentStopId: 'exhibit-featured-client', cameraRotationX: 0, cameraRoll: 0,
      cameraUpX: 0, cameraUpY: 1, cameraUpZ: 0, pickablePanels: projectCount, transformations: 3, impossibleConstructions: 2,
      corniceSupports: 4, corniceSolidSupports: 0, landingLeftSolid: true, landingRightMeshes: 0, walkwayObstructions: 0 });
    expect(data.cameraRotationX === 0).toBe(true);
    const aspect = Number(data.cssWidth) / Number(data.cssHeight);
    const expected = Math.max(36, Math.min(68, 2 * Math.atan(Math.tan(32 * Math.PI / 180) / aspect) * 180 / Math.PI));
    expect(Math.abs(Number(data.fovY) - expected)).toBeLessThanOrEqual(0.01);
    await page.waitForTimeout(1100);
    const count = await page.evaluate(() => window.__exhibition?.renderCount);
    await page.waitForTimeout(1100);
    expect(await page.evaluate(() => window.__exhibition?.renderCount)).toBe(count);
    await context.close();
  });
}

test('small-surface fallback keeps mirrored ink without a render target', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 600, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await ready(page, 'about');
  const data = await page.evaluate(() => ({ ...window.__exhibition! }));
  expect(data).toMatchObject({ reflectionEnabled: false, renderTargetRendersPerFrame: 0, reflectionTargetWidth: 0, reflectionTargetHeight: 0 });
  expect(Number(data.reflectionFallbackSegments)).toBeGreaterThan(0);
  expect(Number(data.lineSegments)).toBeLessThanOrEqual(1200);
  await page.setViewportSize({ width: 1440, height: 810 });
  await expect.poll(() => page.evaluate(() => window.__exhibition?.reflectionEnabled)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderTargetRendersPerFrame)).toBe(1);
  await context.close();
});

test('three transformations follow camera distance, reverse exactly, and remain idle mid-progress', async ({ page }) => {
  await ready(page);
  const samples: Record<string, number | boolean | string>[] = [];
  for (const station of [4, 12, 24, 36, 24]) {
    await page.evaluate((station) => {
      const ids = ['entrance', 'exhibit-featured-client', 'about', 'landing'];
      const positions = [0, -18, -36, -46];
      const z = -station;
      const index = positions.findIndex((value, i) => i < 3 && z <= value && z >= positions[i + 1]);
      const start = document.getElementById(ids[index])!.getBoundingClientRect().top + scrollY;
      const end = document.getElementById(ids[index + 1])!.getBoundingClientRect().top + scrollY;
      scrollTo({ top: start + (end - start) * (positions[index] - z) / (positions[index] - positions[index + 1]), behavior: 'instant' });
    }, station);
    await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.station))).toBeCloseTo(station, 1);
    const data = await page.evaluate(() => ({ ...window.__exhibition! }));
    for (let index = 0; index < 3; index++) {
      const t = Math.max(0, Math.min(1, (16 - Math.abs(-Number(data.station) - Number(data[`transformation${index}Z`]))) / 8));
      const progress = t * t * (3 - 2 * t);
      expect(Math.abs(Number(data[`transformation${index}Progress`]) - progress)).toBeLessThanOrEqual(0.001);
      expect(data[`transformation${index}Shadow`]).toBe(progress >= 0.5);
      expect(data[`transformation${index}MeshVisible`]).toBe(progress > 0);
    }
    if (station === 24) samples.push(data);
  }
  for (let index = 0; index < 3; index++) expect(samples[1][`transformation${index}Progress`]).toBe(samples[0][`transformation${index}Progress`]);
  expect(Number(samples[1].transformation2Progress)).toBeGreaterThan(0);
  expect(Number(samples[1].transformation2Progress)).toBeLessThan(1);
  await page.waitForTimeout(200);
  const count = await page.evaluate(() => window.__exhibition?.renderCount);
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => window.__exhibition?.renderCount)).toBe(count);
});
