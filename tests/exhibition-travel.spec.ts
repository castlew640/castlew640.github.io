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
    // Back and Forward bracket the itinerary label without overlapping it.
    const label = (await nav.locator('.exhibition-now').boundingBox())!;
    expect(label.x).toBeGreaterThanOrEqual(boxes[0].x + boxes[0].width);
    expect(boxes[1].x).toBeGreaterThanOrEqual(label.x + label.width);
    await expect(nav).toHaveCSS('overflow', 'visible');
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

for (const viewport of [{ width: 1440, height: 810 }, { width: 1024, height: 768 }, { width: 390, height: 664 }, { width: 844, height: 390 }]) {
  test(`every exhibit settles in view, clear of its placard and the controls, at ${viewport.width} by ${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, hasTouch: viewport.width < 900, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    if (await page.locator('html').getAttribute('data-view') === 'still') await page.locator('[data-view-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-scene', 'active');
    const exhibits = page.locator('#exhibition [data-stop][data-slug]');
    const projectCount = await exhibits.count();
    expect(projectCount).toBeGreaterThan(0);
    for (const exhibit of await exhibits.all()) {
      const id = (await exhibit.getAttribute('id'))!;
      await exhibit.evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
      // CI renders in software, so give the camera time to settle.
      await expect.poll(() => page.evaluate(() => [window.__exhibition?.currentStopId, window.__exhibition?.u === window.__exhibition?.uTarget, window.__exhibition?.panelTextureReady]), { timeout: 20_000 })
        .toEqual([id, true, true]);
      const data = await page.evaluate(() => window.__exhibition!);
      const panel = { left: Number(data.panelLeft) * viewport.width, right: Number(data.panelRight) * viewport.width,
        top: Number(data.panelTop) * viewport.height, bottom: Number(data.panelBottom) * viewport.height };
      expect(panel.left).toBeGreaterThanOrEqual(0);
      expect(panel.right).toBeLessThanOrEqual(viewport.width);
      // The evidence is large enough to read and never hidden by HTML.
      expect((panel.right - panel.left) / viewport.width).toBeGreaterThan(viewport.width < 768 ? 0.6 : 0.3);
      const placard = (await exhibit.locator('.placard').boundingBox())!;
      const controls = (await page.locator('.exhibition-controls').boundingBox())!;
      // Landscape phones fold the primary nav away to leave room for the scene.
      const header = await page.locator('.primary-nav').boundingBox();
      for (const box of [placard, controls]) {
        const overlapsX = panel.left < box.x + box.width - 1 && panel.right > box.x + 1;
        const overlapsY = panel.top < box.y + box.height - 1 && panel.bottom > box.y + 1;
        expect(overlapsX && overlapsY, `${id} evidence is covered`).toBe(false);
      }
      if (header) expect(panel.top).toBeGreaterThanOrEqual(header.y + header.height - 1);
      expect(Number(data.drawCalls)).toBeLessThanOrEqual(120);
      expect(Number(data.triangles)).toBeLessThanOrEqual(150_000);
    }
    await context.close();
  });
}

test('phone placards stay above the travel bar and scroll to every action at enlarged text sizes', async ({ browser }) => {
  for (const width of [390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 664 }, hasTouch: true, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    await page.goto('/');
    await page.locator('[data-view-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-view', 'moving');
    await page.addStyleTag({ content: ':root { font-size: 200%; }' });
    const exhibit = page.locator('#exhibition [data-stop][data-slug]').first();
    await exhibit.evaluate((el) => scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: 'auto' }));
    await expect(exhibit).toHaveAttribute('data-current', '');
    const placard = exhibit.locator('.placard');
    const controls = (await page.locator('.exhibition-controls').boundingBox())!;
    const sheet = (await placard.boundingBox())!;
    expect(sheet.y + sheet.height).toBeLessThanOrEqual(controls.y + 1);
    await expect(placard).toHaveCSS('overflow-y', 'auto');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const selector of ['.view-exhibit', '.exhibit-link', '.exhibit-summary', '.contract-labels']) {
      await exhibit.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'nearest' }));
      const box = (await exhibit.locator(selector).boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(sheet.y - 1);
      expect(box.y + Math.min(box.height, sheet.height)).toBeLessThanOrEqual(sheet.y + sheet.height + 1);
    }
    for (const button of await page.locator('.exhibition-controls button').all()) await expect(button).toBeInViewport({ ratio: 1 });
    await context.close();
  }
});
