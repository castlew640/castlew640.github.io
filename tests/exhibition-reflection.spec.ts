import { expect, test, type Page } from '@playwright/test';

async function ready(page: Page, width = 1440): Promise<void> {
  await page.setViewportSize({ width, height: 810 });
  await page.goto('/#exhibit-featured-client');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderCount ?? 0)).toBeGreaterThan(0);
}

async function atStation(page: Page, station: number): Promise<Record<string, number | boolean | string>> {
  await page.evaluate((wanted) => {
    const stops = Array.from(document.querySelectorAll<HTMLElement>('#exhibition [data-stop]'));
    const stations = stops.map((stop, index) => index === stops.length - 1 ? (index - 2) * 18 + 28 : index * 18);
    const index = Math.max(0, stations.findIndex((value, i) => i < stations.length - 1 && wanted >= value && wanted <= stations[i + 1]));
    const start = stops[index].getBoundingClientRect().top + scrollY;
    const end = stops[index + 1].getBoundingClientRect().top + scrollY;
    scrollTo({ top: start + (end - start) * (wanted - stations[index]) / (stations[index + 1] - stations[index]), behavior: 'instant' });
  }, station);
  await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.station))).toBeCloseTo(station, 1);
  return page.evaluate(() => ({ ...window.__exhibition! }));
}

test('construction curves overhead while the six-metre path and evidence plane remain calm', async ({ page }) => {
  await ready(page);
  const data = await atStation(page, 18);
  expect(Number(data.maximumStructuralBend)).toBeGreaterThan(0.65);
  expect(Number(data.maximumStructuralBend)).toBeLessThanOrEqual(0.81);
  expect(Number(data.localWalkwayClearance)).toBeGreaterThanOrEqual(6);
  expect(data.walkwayObstructions).toBe(0);
  expect([data.panelMinX, data.panelMaxX, data.panelMinY, data.panelMaxY]).toEqual([-2, 2, 3.1, 5.1]);
  expect(data).toMatchObject({ impossibleConstructions: 2, corniceSupports: 4, corniceSolidSupports: 0,
    landingRightMeshes: 0, shadowLights: 1 });
});

test('approach construction is reversible by station and idle at partial progress', async ({ page }) => {
  await ready(page);
  for (const station of [0, 4, 12, 24, 36]) {
    const data = await atStation(page, station);
    for (let index = 0; index < 3; index++) {
      const distance = Math.abs(station - Number(data[`transformation${index}Station`]));
      const t = Math.max(0, Math.min(1, (16 - distance) / 8));
      const progress = t * t * (3 - 2 * t);
      expect(Number(data[`transformation${index}Progress`])).toBeCloseTo(progress, 2);
      expect(data[`transformation${index}Shadow`]).toBe(Number(data[`transformation${index}Progress`]) >= 0.5);
    }
    expect(Number(data.shadowTargetOffset)).toBeCloseTo(10, 2);
  }
  const forward = await atStation(page, 24);
  await atStation(page, 36);
  const reverse = await atStation(page, 24);
  for (let index = 0; index < 3; index++) {
    expect(reverse[`transformation${index}Progress`]).toBe(forward[`transformation${index}Progress`]);
    expect(reverse[`transformation${index}Shadow`]).toBe(forward[`transformation${index}Shadow`]);
    expect(reverse[`transformation${index}WorldX`]).toBe(forward[`transformation${index}WorldX`]);
  }
  await page.waitForTimeout(200);
  const count = await page.evaluate(() => window.__exhibition?.renderCount);
  await page.waitForTimeout(1100);
  expect(await page.evaluate(() => window.__exhibition?.renderCount)).toBe(count);
});

test('completed edges and water follow the whole route in live and fallback modes', async ({ page }) => {
  await ready(page);
  for (const station of [18, 36, 46]) {
    const data = await atStation(page, station);
    expect(data.reflectionLayerMask).toBe(4);
    expect(Number(data.completedEdgeCount)).toBeGreaterThan(0);
    expect(Number(data.fallbackEdgeCount)).toBeGreaterThan(0);
    expect(data.waterContainsRoute).toBe(true);
    expect(Number(data.waterNearRouteDistance)).toBeLessThanOrEqual(3);
    expect(Number(data.waterFarRouteDistance)).toBeGreaterThanOrEqual(26);
    expect(Number(data.waterNearStrength)).toBeCloseTo(0.42, 2);
    expect(Number(data.waterFarStrength)).toBe(0);
  }
  const live = await page.screenshot();
  expect(live.byteLength).toBeGreaterThan(1000);
  await page.setViewportSize({ width: 600, height: 810 });
  await expect.poll(() => page.evaluate(() => window.__exhibition?.reflectionEnabled)).toBe(false);
  const fallback = await page.evaluate(() => ({ ...window.__exhibition! }));
  expect(fallback.reflectionTargetWidth).toBe(0);
  expect(Number(fallback.reflectionFallbackSegments)).toBeGreaterThan(0);
  expect(Number(fallback.fallbackEdgeCount)).toBe(Number(fallback.completedEdgeCount));
  await page.screenshot();
  await page.setViewportSize({ width: 1440, height: 810 });
  await expect.poll(() => page.evaluate(() => window.__exhibition?.reflectionEnabled)).toBe(true);
  expect(await page.evaluate(() => window.__exhibition?.reflectionLayerMask)).toBe(4);
});
