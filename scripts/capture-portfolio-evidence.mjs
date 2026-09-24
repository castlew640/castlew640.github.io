import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const argument = process.argv.indexOf('--base-url');
if (argument < 0 || !process.argv[argument + 1]) throw new Error('Usage: node scripts/capture-portfolio-evidence.mjs --base-url http://127.0.0.1:4321');
const baseUrl = new URL(process.argv[argument + 1]);
if (!['http:', 'https:'].includes(baseUrl.protocol)) throw new Error('Capture origin must use HTTP or HTTPS');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'src/content/projects/portfolio');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', deviceScaleFactor: 1 });
await context.addInitScript(() => {
  if (!sessionStorage.getItem('capture-seeded')) {
    sessionStorage.setItem('capture-seeded', 'true');
    localStorage.setItem('exhibition-view', 'moving');
  }
  // Capture machines often rasterize WebGL in software, where the scene drops to
  // its light mode. Evidence shows what a visitor with a graphics card sees.
  for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const original = prototype.getParameter;
    prototype.getParameter = function (parameter) {
      return parameter === 0x9246 ? 'Evidence capture GPU' : Reflect.apply(original, this, [parameter]);
    };
  }
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

const annotations = {
  moving: [
    ['@panel', '01 · Tap the painting to open it'],
    ['#exhibit-featured-client .view-exhibit', '02 · In-place viewer'],
    ['#exhibit-featured-client .exhibit-link', '03 · Ordinary project link'],
    ['.exhibition-controls', '04 · One-handed travel'],
    ['[data-view-toggle]', '05 · View choice'],
  ],
  viewer: [
    ['#viewer-featured-client [data-viewer-track]', '01 · Every approved screenshot'],
    ['#viewer-featured-client .viewer-steps', '02 · Step or swipe'],
    ['#viewer-featured-client .viewer-contracts', '03 · Three separate contracts'],
    ['#viewer-featured-client .viewer-close', '04 · Back returns here'],
  ],
  still: [
    ['#exhibit-featured-client figcaption', '01 · Authored image caption'],
    ['#exhibit-featured-client .view-exhibit', '02 · Same in-place viewer'],
    ['.exhibition-controls', '03 · One-handed travel'],
    ['[data-view-toggle]', '04 · View choice'],
  ],
};

async function annotatedCapture(filename, mode, items) {
  await page.evaluate((items) => {
    const layer = document.createElement('div');
    layer.dataset.captureAnnotations = '';
    layer.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;font:600 11px/1.2 monospace;letter-spacing:.02em;color:#292e29';
    for (const [selector, label] of items) {
      let box;
      if (selector === '@panel') {
        const d = window.__exhibition;
        box = { left: d.panelLeft * innerWidth, top: d.panelTop * innerHeight, width: (d.panelRight - d.panelLeft) * innerWidth, height: (d.panelBottom - d.panelTop) * innerHeight };
      } else {
        const target = document.querySelector(selector);
        if (!target) throw new Error(`Missing capture target: ${selector}`);
        box = target.getBoundingClientRect();
      }
      const outline = document.createElement('div');
      outline.style.cssText = `position:absolute;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;border:2px solid #8e4935;box-sizing:border-box`;
      const caption = document.createElement('span');
      caption.textContent = label;
      caption.style.cssText = `position:absolute;${box.left + 260 > innerWidth ? 'right:0' : 'left:0'};${box.top < 30 ? 'top:100%' : 'bottom:100%'};max-width:260px;padding:4px 6px;border:1px solid #8e4935;background:#f4f0e6;white-space:nowrap`;
      outline.append(caption); layer.append(outline);
    }
    document.body.append(layer);
  }, items);
  try {
    await page.screenshot({ path: path.join(output, filename), animations: 'disabled' });
  } finally {
    await page.locator('[data-capture-annotations]').evaluate((layer) => layer.remove());
  }
  console.log(`${filename}: ${mode}, 1440x900 CSS px, DPR 1, ${new Date().toISOString()}, source ${sha}`);
}

try {
  const response = await page.goto(new URL('/#exhibit-featured-client', baseUrl).href);
  if (!response?.ok()) throw new Error(`Capture page returned HTTP ${response?.status()}`);
  await page.locator('html[data-scene="active"]').waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => window.__exhibition?.panelStopId === 'exhibit-featured-client'
    && window.__exhibition?.panelTextureReady === true && window.__exhibition?.u === window.__exhibition?.uTarget, null, { timeout: 30_000 });
  // Let the placard finish fading in.
  await page.waitForTimeout(800);
  await annotatedCapture('gallery.png', 'moving 3D exhibition', annotations.moving);
  await page.locator('#exhibit-featured-client .view-exhibit').click();
  await page.locator('#viewer-featured-client[open] img').first().evaluate((img) => img.decode());
  await page.waitForTimeout(500);
  await annotatedCapture('viewer.png', 'in-place exhibit viewer', annotations.viewer);
  await page.keyboard.press('Escape');
  await page.locator('#viewer-featured-client').waitFor({ state: 'hidden' });
  await page.locator('[data-view-toggle]').click();
  await page.locator('html[data-view="still"]').waitFor();
  await page.locator('#exhibit-featured-client').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await annotatedCapture('still.png', 'illustrated still catalogue', annotations.still);
  if (errors.length) throw new Error(`Browser errors during capture: ${errors.join('; ')}`);
} finally {
  await browser.close();
}
