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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

async function annotatedCapture(filename, mode) {
  const annotations = mode === 'moving 3D exhibition' ? [
    ['#exhibit-featured-client .exhibit-link', '01 · Ordinary project link'],
    ['#exhibit-featured-client .exhibit-overlay', '02 · Readable text plate'],
    ['[data-view-toggle]', '03 · View choice'],
    ['.exhibition-controls', '04 · One-handed travel'],
  ] : [
    ['#exhibit-featured-client figcaption', '01 · Authored image caption'],
    ['#exhibit-featured-client .stop-drawing', '02 · Illustrated architecture'],
    ['[data-view-toggle]', '03 · View choice'],
    ['.exhibition-controls', '04 · One-handed travel'],
  ];
  await page.evaluate((items) => {
    const layer = document.createElement('div');
    layer.dataset.captureAnnotations = '';
    layer.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;font:600 11px/1.2 monospace;letter-spacing:.02em;color:#292e29';
    for (const [selector, label] of items) {
      const target = document.querySelector(selector);
      if (!target) throw new Error(`Missing capture target: ${selector}`);
      const box = target.getBoundingClientRect();
      const outline = document.createElement('div');
      outline.style.cssText = `position:absolute;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;border:2px solid #8e4935;box-sizing:border-box`;
      const caption = document.createElement('span');
      caption.textContent = label;
      caption.style.cssText = 'position:absolute;left:0;bottom:100%;max-width:220px;padding:4px 6px;border:1px solid #8e4935;background:#f4f0e6;white-space:nowrap';
      outline.append(caption); layer.append(outline);
    }
    document.body.append(layer);
  }, annotations);
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
  await page.waitForFunction(() => window.__exhibition?.panelTextureReady === true);
  await page.locator('#exhibit-featured-client').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await page.waitForFunction(() => window.__exhibition?.currentStopId === 'exhibit-featured-client');
  await annotatedCapture('gallery.png', 'moving 3D exhibition');
  await page.locator('[data-view-toggle]').click();
  await page.locator('html[data-view="still"]').waitFor();
  await page.locator('#exhibit-featured-client').evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await annotatedCapture('still.png', 'illustrated still catalogue');
  if (errors.length) throw new Error(`Browser errors during capture: ${errors.join('; ')}`);
} finally {
  await browser.close();
}
