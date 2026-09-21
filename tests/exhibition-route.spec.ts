import { expect, test, type Browser, type Page } from '@playwright/test';

async function openMoving(browser: Browser, viewport: { width: number; height: number }) {
  const context = await browser.newContext({
    viewport,
    hasTouch: viewport.width < 900,
    deviceScaleFactor: viewport.width < 900 ? 3 : 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.renderCount ?? 0)).toBeGreaterThan(0);
  return { context, page };
}

async function visitStop(page: Page, id: string): Promise<Record<string, number | boolean | string>> {
  await page.locator(`#${id}`).evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await expect.poll(() => page.evaluate(() => window.__exhibition?.currentStopId)).toBe(id);
  return page.evaluate(() => ({ ...window.__exhibition! }));
}

test('native travel follows a winding, rising route with a level horizon', async ({ browser }) => {
  const { context, page } = await openMoving(browser, { width: 1440, height: 810 });
  const stops = await page.locator('#exhibition [data-stop]').evaluateAll((elements) =>
    elements.map((element) => (element as HTMLElement).dataset.stopId ?? element.id));
  const samples = [];
  for (const id of stops) samples.push(await visitStop(page, id));
  samples.forEach((sample, index) => {
    const expected = index === samples.length - 1 ? (samples.length - 3) * 18 + 28 : index * 18;
    expect(Number(sample.station)).toBeCloseTo(expected, 2);
  });
  expect(samples.some((sample) => Math.abs(Number(sample.cameraX)) > 0.01)).toBe(true);
  expect(samples.some((sample) => Math.abs(Number(sample.cameraY) - 1.62) > 0.01)).toBe(true);
  for (const sample of samples) {
    expect(Math.abs(Number(sample.cameraYaw))).toBeLessThanOrEqual(12 * Math.PI / 180 + 1e-6);
    expect(sample.cameraRoll).toBe(0);
    expect(sample.cameraRotationX).toBe(0);
    expect([sample.cameraUpX, sample.cameraUpY, sample.cameraUpZ]).toEqual([0, 1, 0]);
  }
  await context.close();
});

for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 664 }, { width: 844, height: 390 }]) {
  test(`all transformed evidence corners are framed at ${viewport.width} by ${viewport.height}`, async ({ browser }) => {
    const { context, page } = await openMoving(browser, viewport);
    const exhibitIds = await page.locator('#exhibition [data-stop][data-slug]').evaluateAll((elements) => elements.map((element) => element.id));
    for (const id of exhibitIds) {
      const data = await visitStop(page, id);
      const corners = Array.from({ length: 4 }, (_, index) => ({
        x: Number(data[`panelCorner${index}X`]),
        y: Number(data[`panelCorner${index}Y`]),
      }));
      expect(corners.every(({ x, y }) => x >= 0 && x <= 1 && y >= 0.05 && y <= 1)).toBe(true);
      expect(data.panelStopId).toBe(id);
      expect(data.panelFacingCamera).toBe(true);
      const panelBottom = Math.max(...corners.map(({ y }) => y));
      const overlay = await page.locator(`#${id} .exhibit-overlay`).boundingBox();
      expect(overlay).not.toBeNull();
      expect(overlay!.y).toBeGreaterThanOrEqual(panelBottom * viewport.height);
    }
    await context.close();
  });
}

test('the actual panel opens its matching canonical route and browser return restores the stop', async ({ browser }) => {
  const { context, page } = await openMoving(browser, { width: 1440, height: 810 });
  const exhibit = page.locator('#exhibition [data-stop][data-slug]').first();
  const id = await exhibit.getAttribute('id');
  const slug = await exhibit.getAttribute('data-slug');
  expect(id).not.toBeNull();
  expect(slug).not.toBeNull();
  const data = await visitStop(page, id!);
  const x = (Number(data.panelCorner0X) + Number(data.panelCorner2X)) / 2 * 1440;
  const y = (Number(data.panelCorner0Y) + Number(data.panelCorner2Y)) / 2 * 810;
  await page.mouse.click(x, y);
  await expect(page).toHaveURL(new RegExp(`/projects/${slug}/?$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.__exhibition?.currentStopId)).toBe(id);
  await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.station))).toBeCloseTo(18, 1);
  await page.mouse.click(x, y);
  await page.getByRole('link', { name: '← Back to the exhibition' }).click();
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect(exhibit).toBeFocused();
  await context.close();
});
