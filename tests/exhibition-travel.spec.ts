import { expect, test } from '@playwright/test';

const entranceStatus = 'Entrance — the exhibition starts here.';
const endStatus = 'End of the exhibition.';

test.use({ reducedMotion: 'reduce' });

test('travel arrows retain comfortable targets and unclipped focus at every width', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Exhibition travel' });
    const boxes = [];
    for (const button of await nav.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(width < 768 ? 64 : 56);
      expect(box!.height).toBeGreaterThanOrEqual(width < 768 ? 64 : 56);
      boxes.push(box!);
      await button.focus();
      await expect(button).toHaveCSS('outline-offset', '5px');
      await expect(button).toHaveCSS('outline-style', 'solid');
    }
    expect(boxes).toHaveLength(2);
    expect(boxes[1].x - boxes[0].x - boxes[0].width).toBe(12);
    await expect(nav).toHaveCSS('overflow', 'visible');
    await expect(nav).toHaveCSS('padding', '8px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('phone arrows remain in the thumb band and fit landscape and enlarged text', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 664 }, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const buttons = page.getByRole('navigation', { name: 'Exhibition travel' }).getByRole('button');
  await expect(buttons).toHaveCount(2);
  for (const button of await buttons.all()) {
    const box = (await button.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(664 * 0.7);
    expect(box.y + box.height).toBeLessThanOrEqual(664);
  }
  await page.setViewportSize({ width: 750, height: 340 });
  for (const button of await buttons.all()) {
    const box = (await button.boundingBox())!;
    expect(box.width).toBe(56);
    expect(box.height).toBe(56);
    await expect(button).toBeInViewport({ ratio: 1 });
  }
  await page.setViewportSize({ width: 320, height: 664 });
  await page.addStyleTag({ content: ':root { font-size: 200%; }' });
  for (const button of await buttons.all()) {
    const box = (await button.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(64);
    expect(box.height).toBeGreaterThanOrEqual(64);
    await expect(button).toBeInViewport({ ratio: 1 });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});

test('endpoints stay in the tab order and announce why travel stops', async ({ page }) => {
  await page.goto('/');
  const back = page.getByRole('button', { name: 'Previous exhibit' });
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  const status = page.getByRole('status');
  await expect(back).toHaveAttribute('aria-disabled', 'true');
  await expect(status).toHaveText(entranceStatus);
  await forward.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(back).toBeFocused();
  const entrance = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => scrollY)).toBe(entrance);
  await page.evaluate(() => document.getElementById('landing')!.scrollIntoView());
  await expect(forward).toHaveAttribute('aria-disabled', 'true');
  await expect(status).toHaveText(endStatus);
  await back.focus();
  await page.keyboard.press('Tab');
  await expect(forward).toBeFocused();
  const end = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => scrollY)).toBe(end);
});

test('keyboard activation travels both ways without moving focus', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Exhibition travel' });
  const back = page.getByRole('button', { name: 'Previous exhibit' });
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  await back.focus();
  await page.keyboard.press('Tab');
  await expect(forward).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(nav).toHaveAttribute('data-stop-index', '1');
  await expect(forward).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Space');
  await expect(nav).toHaveAttribute('data-stop-index', '0');
  await expect(back).toBeFocused();
});

test('ten arrow activations preserve history and the arrival hash', async ({ page }) => {
  await page.goto('/#entrance');
  const before = await page.evaluate(() => ({ length: history.length, hash: location.hash }));
  const nav = page.getByRole('navigation', { name: 'Exhibition travel' });
  for (let index = 0; index < 10; index++) {
    await page.getByRole('button', { name: index % 2 === 0 ? 'Next exhibit' : 'Previous exhibit' }).click();
    await expect(nav).toHaveAttribute('data-stop-index', String(index % 2 === 0 ? 1 : 0));
  }
  expect(await page.evaluate(() => ({ length: history.length, hash: location.hash }))).toEqual(before);
});

test('native page scrolling and gesture policies remain intact', async ({ page }) => {
  await page.goto('/');
  const policies = await page.evaluate(() => ({
    touch: getComputedStyle(document.getElementById('exhibition')!).touchAction,
    containers: Array.from(document.querySelectorAll('canvas')).flatMap((el) => [el, el.parentElement!]).map((el) => getComputedStyle(el).touchAction),
    viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
  }));
  expect(policies.touch).toBe('auto');
  expect(policies.viewport).toBe('width=device-width, initial-scale=1');
  for (const touch of policies.containers) expect(touch).toBe('auto');
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test('back from halfway through each segment returns to its start without skipping or announcing an endpoint', async ({ page }) => {
  await page.goto('/#entrance');
  const stops = page.locator('#exhibition [data-stop]');
  const back = page.getByRole('button', { name: 'Previous exhibit' });
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  const nav = page.getByRole('navigation', { name: 'Exhibition travel' });
  const historyBefore = await page.evaluate(() => ({ length: history.length, hash: location.hash }));
  const count = await stops.count();
  for (let index = 0; index < count - 1; index++) {
    const start = await stops.nth(index).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const end = await stops.nth(index + 1).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await page.evaluate((top) => scrollTo({ top, behavior: 'auto' }), (start + end) / 2);
    await expect(nav).toHaveAttribute('data-stop-index', String(index));
    await expect(back).toHaveAttribute('aria-disabled', 'false');
    await expect(forward).toHaveAttribute('aria-disabled', 'false');
    await expect(page.getByRole('status')).toHaveText('');
    await back.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(Math.round(start));
    await expect(back).toBeFocused();
    await expect(back).toHaveAttribute('aria-disabled', String(index === 0));
    if (index === 0) await expect(page.getByRole('status')).toHaveText(entranceStatus);
    else {
      const previous = await stops.nth(index - 1).evaluate((el) => el.getBoundingClientRect().top + scrollY);
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(Math.round(previous));
      await expect(back).toBeFocused();
    }
  }
  expect(await page.evaluate(() => ({ length: history.length, hash: location.hash }))).toEqual(historyBefore);
});

test('fractional stop arrivals disable only actual endpoints and forward reaches the next stop', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: '.page-frame { padding-top: .375px; }' });
  const stops = page.locator('#exhibition [data-stop]');
  const back = page.getByRole('button', { name: 'Previous exhibit' });
  const forward = page.getByRole('button', { name: 'Next exhibit' });
  const nav = page.getByRole('navigation', { name: 'Exhibition travel' });
  const count = await stops.count();
  expect(await stops.evaluateAll((elements) => elements.some((el) => !Number.isInteger(el.getBoundingClientRect().top + scrollY)))).toBe(true);
  for (let index = 0; index < count; index++) {
    const top = await stops.nth(index).evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await page.evaluate((position) => scrollTo({ top: position, behavior: 'auto' }), top);
    await expect(nav).toHaveAttribute('data-stop-index', String(index));
    await expect(back).toHaveAttribute('aria-disabled', String(index === 0));
    await expect(forward).toHaveAttribute('aria-disabled', String(index === count - 1));
    await expect(page.getByRole('status')).toHaveText(index === 0 ? entranceStatus : index === count - 1 ? endStatus : '');
    if (index < count - 1) {
      const end = await stops.nth(index + 1).evaluate((el) => el.getBoundingClientRect().top + scrollY);
      await page.evaluate((position) => scrollTo({ top: position, behavior: 'auto' }), (top + end) / 2);
      await expect(back).toHaveAttribute('aria-disabled', 'false');
      await expect(page.getByRole('status')).toHaveText('');
      await forward.focus();
      await page.keyboard.press('Enter');
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(Math.round(end));
      await expect(forward).toBeFocused();
    }
  }
});

for (const viewport of [{ width: 1440, height: 810 }, { width: 390, height: 664 }, { width: 844, height: 390 }]) {
  test(`the real panel fits the computed field at ${viewport.width} by ${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 900, deviceScaleFactor: 3, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
    await page.locator('#exhibit-featured-client').evaluate((el) => el.scrollIntoView());
    await expect.poll(() => page.evaluate(() => Number(window.__exhibition?.cameraZ))).toBeCloseTo(-18, 2);
    const data = await page.evaluate(() => window.__exhibition!);
    const fovY = Number(data.fovY) * Math.PI / 180;
    const fovX = 2 * Math.atan(Math.tan(fovY / 2) * Number(data.cssWidth) / Number(data.cssHeight));
    const expectedWidthFraction = Math.atan(2.00 / 12) / Math.tan(fovX / 2);
    expect(Math.abs(Number(data.panelRight) - Number(data.panelLeft) - expectedWidthFraction)).toBeLessThanOrEqual(0.02);
    expect(Number(data.panelTop)).toBeGreaterThanOrEqual(0.05);
    expect(data).toMatchObject({ panelMinX: -2, panelMaxX: 2, panelMinY: 3.1, panelMaxY: 5.1, panelZ: -29.94, panelVariant: 0, panelTextureSRGB: true, panelReusesImage: true, pickablePanels: 1, nonPanelRaycasts: 0, walkwayObstructions: 0 });
    expect(Number(data.materials)).toBeLessThanOrEqual(18);
    expect(Number(data.drawCalls)).toBeLessThanOrEqual(90);
    expect(Number(data.triangles)).toBeLessThanOrEqual(120000);
    const overlay = await page.locator('.exhibit-overlay').boundingBox();
    expect(overlay!.y).toBeGreaterThan(Number(data.panelBottom) * viewport.height);
    if (viewport.width === 1440) {
      expect(Math.abs(overlay!.y / viewport.height - 0.46)).toBeLessThan(0.01);
      expect(overlay!.width).toBe(Math.min(34 * 16, viewport.width * 0.4));
    }
    if (viewport.width === 390) {
      const link = (await page.getByRole('link', { name: 'Read case study →' }).boundingBox())!;
      const controls = (await page.locator('.exhibition-controls').boundingBox())!;
      expect(1 - (link.y + link.height / 2) / viewport.height).toBeGreaterThanOrEqual(0.30);
      expect(1 - (link.y + link.height / 2) / viewport.height).toBeLessThanOrEqual(0.48);
      expect(controls.y - link.y - link.height).toBeGreaterThanOrEqual(16);
      await expect(page.locator('.exhibit-overlay')).toHaveCSS('padding-bottom', '104px');
    }
    await context.close();
  });
}

test('mobile exhibit text continues in document flow at enlarged sizes without covering controls', async ({ browser }) => {
  for (const width of [390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 664 }, hasTouch: true, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
    await page.addStyleTag({ content: ':root { font-size: 200%; }' });
    await page.locator('#exhibit-featured-client').evaluate((el) => el.scrollIntoView());
    await page.waitForTimeout(200);
    const link = (await page.getByRole('link', { name: 'Read case study →' }).boundingBox())!;
    const controls = (await page.locator('.exhibition-controls').boundingBox())!;
    expect(controls.y - link.y - link.height).toBeGreaterThanOrEqual(16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('.exhibit-overlay')).toHaveCSS('overflow-y', 'visible');
    for (const selector of ['.exhibit-summary', '.contract-labels']) {
      await page.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await expect(page.locator(selector)).toBeInViewport();
      expect(await page.locator(selector).evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor)).toContain('0.88');
    }
    for (const button of await page.locator('.exhibition-controls button').all()) await expect(button).toBeInViewport({ ratio: 1 });
    await context.close();
  }
});
