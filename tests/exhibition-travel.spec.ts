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
