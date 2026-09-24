import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const baseURL = args.get('--base-url');
const label = args.get('--label');
const output = args.get('--output');
const seconds = Number(args.get('--seconds') ?? 30);
if (!baseURL || !label || !output || !Number.isFinite(seconds) || seconds < 3) {
  throw new Error('Usage: node scripts/measure-exhibition.mjs --base-url URL --label NAME --seconds 30 --output PATH');
}
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const browser = await chromium.launch();

async function snapshot(page, includeNavigation = true) {
  return page.evaluate((navigation) => {
    const entries = performance.getEntriesByType('resource').concat(navigation ? performance.getEntriesByType('navigation') : []);
    const resources = entries.map((entry) => ({
      name: entry.name,
      transferSize: (entry instanceof PerformanceResourceTiming || entry instanceof PerformanceNavigationTiming) ? entry.transferSize : 0,
      encodedBodySize: (entry instanceof PerformanceResourceTiming || entry instanceof PerformanceNavigationTiming) ? entry.encodedBodySize : 0,
    }));
    return {
      resources,
      transferBytes: resources.reduce((sum, item) => sum + item.transferSize, 0),
      encodedBodyBytes: resources.reduce((sum, item) => sum + item.encodedBodySize, 0),
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      userAgent: navigator.userAgent,
      scene: window.__exhibition ? { ...window.__exhibition } : null,
    };
  }, includeNavigation);
}

function stats(samples) {
  if (!samples.length) throw new Error('Empty animation-frame sample; measurement cannot pass');
  const ordered = [...samples].sort((a, b) => a - b);
  return {
    count: ordered.length,
    medianMs: ordered[Math.floor((ordered.length - 1) * 0.5)],
    p95Ms: ordered[Math.ceil(ordered.length * 0.95) - 1],
    worstMs: ordered.at(-1),
  };
}

async function traverse(page) {
  return page.evaluate(async (duration) => {
    const stops = Array.from(document.querySelectorAll('#exhibition [data-stop]'));
    const start = stops[0].getBoundingClientRect().top + scrollY;
    const end = stops.at(-1).getBoundingClientRect().top + scrollY;
    const intervals = [];
    const submission = [];
    let prior = 0;
    let priorRenderCount = -1;
    let started = 0;
    await new Promise((done) => {
      const frame = (now) => {
        if (!started) started = now;
        if (prior) intervals.push(now - prior);
        prior = now;
        const progress = Math.min(1, (now - started) / (duration * 1000));
        const cycle = progress * 6;
        const leg = cycle % 1;
        const fraction = Math.floor(cycle) % 2 === 0 ? leg : 1 - leg;
        scrollTo({ top: start + fraction * (end - start), behavior: 'instant' });
        const cost = Number(window.__exhibition?.lastSubmissionMs);
        const renderCount = Number(window.__exhibition?.renderCount);
        if (renderCount !== priorRenderCount && Number.isFinite(cost) && cost > 0) submission.push(cost);
        priorRenderCount = renderCount;
        if (progress < 1) requestAnimationFrame(frame);
        else done();
      };
      requestAnimationFrame(frame);
    });
    return { intervals, submission, traversals: 'three forward and three backward legs' };
  }, seconds);
}

try {
  const stillContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 810 } });
  const stillPage = await stillContext.newPage();
  await stillPage.goto(baseURL, { waitUntil: 'load' });
  const still = await snapshot(stillPage);
  await stillContext.close();

  const context = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 810 } });
  await context.addInitScript(() => localStorage.setItem('exhibition-view', 'moving'));
  const page = await context.newPage();
  await page.goto(baseURL, { waitUntil: 'load' });
  await page.locator('html[data-scene="active"]').waitFor();
  await page.waitForFunction(() => Number(window.__exhibition?.renderCount) > 0);
  await page.waitForFunction(() => Number(window.__exhibition?.panelTextures) > 0);
  const startup = await snapshot(page);
  const coldSamples = await traverse(page);
  const full = await snapshot(page);
  await page.evaluate(() => performance.clearResourceTimings());
  const warmSamples = await traverse(page);
  const warm = await snapshot(page, false);
  const gpu = await page.evaluate(() => {
    const canvas = document.querySelector('.exhibition-canvas canvas');
    const gl = canvas?.getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_debug_renderer_info');
    return gl ? {
      vendor: extension ? gl.getParameter(extension.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    } : null;
  });
  const result = {
    evidenceClass: 'headless Chromium lab; rAF scheduling proxy, not displayed GPU frame time',
    label, timestamp: new Date().toISOString(), sha, baseURL, seconds, gpu,
    browserVersion: browser.version(), platform: process.platform,
    still, startup, full, warm,
    coldFrameIntervals: stats(coldSamples.intervals),
    coldSubmission: stats(coldSamples.submission),
    warmFrameIntervals: stats(warmSamples.intervals),
    warmSubmission: stats(warmSamples.submission),
    traversal: coldSamples.traversals,
  };
  await mkdir(dirname(resolve(output)), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ label, sha, stillBytes: still.transferBytes, startupBytes: startup.transferBytes,
    fullBytes: full.transferBytes, warmBytes: warm.transferBytes, coldFrameIntervals: result.coldFrameIntervals,
    coldSubmission: result.coldSubmission, output }, null, 2));
  await context.close();
} finally { await browser.close(); }
