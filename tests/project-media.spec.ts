import { expect, test } from '@playwright/test';

test('page-only native video waits for activation while home uses the still', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  const home = await page.content();
  expect(home).not.toContain('/media/fixture-personal-01/');
  await expect(page.locator('video, source[src$=".mp4"]')).toHaveCount(0);
  expect(requests.filter((url) => url.includes('.mp4'))).toHaveLength(0);
  await expect(page.locator('[data-slug="fixture-personal-01"] img')).toHaveAttribute('src', /_astro\/.+\.webp/);

  await page.goto('/projects/fixture-personal-01/');
  const video = page.locator('video');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect(video).toHaveAttribute('preload', 'none');
  await expect(video).toHaveAttribute('poster', /_astro\/.+\.webp/);
  await expect(video.locator('track[kind="captions"]')).toHaveAttribute('srclang', 'en');
  await expect(page.getByText('A rust circle crosses a plain paper background.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Download video/i })).toHaveAttribute('href', '/media/fixture-personal-01/silent-demo.mp4');
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await video.focus();
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0)).toBe(true);
});

test('wide terminal and portrait diagram keep all four corners in the HTML presentation', async ({ page }) => {
  await page.goto('/projects/fixture-personal-01/');
  for (const kind of ['terminal', 'diagram']) {
    const figure = page.locator(`.evidence-grid figure[data-evidence-kind="${kind}"]`);
    await expect(figure).toHaveAttribute('data-evidence-fit', 'contain');
    const img = figure.locator('img');
    await expect(img).toHaveCSS('object-fit', 'contain');
    const dimensions = await img.evaluate((element: HTMLImageElement) => ({ width: element.naturalWidth, height: element.naturalHeight }));
    expect(Math.max(dimensions.width, dimensions.height)).toBeLessThanOrEqual(1600);
  }
  await page.goto('/');
  const figure = page.locator('[data-slug="fixture-personal-01"] figure[data-panel-source]');
  await expect(figure).toHaveAttribute('data-evidence-kind', 'terminal');
  await expect(figure).toHaveAttribute('data-evidence-fit', 'contain');
  await expect(figure.locator('img')).toHaveCSS('object-fit', 'contain');
});

test('route-mounted panel reuses the optimized still without cropping or changing pick corners', async ({ page }) => {
  await page.goto('/#exhibit-fixture-personal-01');
  await expect.poll(() => page.evaluate(() => window.__exhibition?.panelTextureReady)).toBe(true);
  const data = await page.evaluate(() => ({ ...window.__exhibition! }));
  expect(data.panelStopId).toBe('exhibit-fixture-personal-01');
  expect(data.panelEvidenceFit).toBe('contain');
  expect(data.panelReusesImage).toBe(true);
  expect(data.panelImageScaleX).toBe(1);
  expect(data.panelImageScaleY).toBeCloseTo(0.4);
  expect(data.panelFacingCamera).toBe(true);
  for (let corner = 0; corner < 4; corner++) {
    expect(Number(data[`panelCorner${corner}X`])).toBeGreaterThanOrEqual(0);
    expect(Number(data[`panelCorner${corner}X`])).toBeLessThanOrEqual(1);
    expect(Number(data[`panelCorner${corner}Y`])).toBeGreaterThanOrEqual(0);
    expect(Number(data[`panelCorner${corner}Y`])).toBeLessThanOrEqual(1);
  }
});
