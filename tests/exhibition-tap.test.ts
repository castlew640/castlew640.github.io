// @ts-expect-error Node test module types are intentionally not a production dependency.
import assert from 'node:assert/strict';
// @ts-expect-error Node test module types are intentionally not a production dependency.
import test from 'node:test';
import { registerTap } from '../src/scripts/exhibition/tap.ts';

function harness() {
  const target = new EventTarget();
  const state = { clicks: 0, hits: 0, scrollY: 0, overCanvas: true, mounted: true, slug: 'featured-client' as string | null, hasAnchor: true };
  const listeners: { type: string; passive: boolean }[] = [];
  const selectors: string[] = [];
  const add = target.addEventListener.bind(target);
  target.addEventListener = (type, listener, options) => {
    listeners.push({ type, passive: typeof options === 'object' && options.passive === true });
    add(type, listener, options);
  };
  Object.defineProperty(target, 'scrollY', { get: () => state.scrollY });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    elementFromPoint: () => state.overCanvas ? { matches: () => true } : null,
    querySelector: (selector: string) => {
      selectors.push(selector);
      if (selector !== '#exhibit-featured-client[data-slug="featured-client"]') return null;
      return { querySelector: (link: string) => {
        selectors.push(link);
        return state.hasAnchor && link === 'a[href="/projects/featured-client/"]' ? { click: () => state.clicks++ } : null;
      } };
    },
  } });
  registerTap(() => state.mounted ? { hitPanel: () => { state.hits++; return state.slug; } } : null);
  const pointer = (type: string, overrides: Partial<PointerEvent> = {}) => {
    const event = new Event(type);
    const values = { pointerId: 1, isPrimary: true, button: 0, clientX: 100, clientY: 100, timeStamp: 0, ...overrides };
    for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
    target.dispatchEvent(event);
  };
  return { state, listeners, selectors, pointer, target };
}

test('a tap at every inclusive threshold delegates exactly once to the matching DOM anchor', () => {
  const h = harness();
  h.pointer('pointerdown');
  h.pointer('pointermove', { clientX: 106, clientY: 108 });
  h.state.scrollY = 4;
  h.pointer('pointerup', { clientX: 106, clientY: 108, timeStamp: 500 });
  assert.equal(h.state.clicks, 1);
  assert.equal(h.state.hits, 1);
  assert.deepEqual(h.selectors, ['#exhibit-featured-client[data-slug="featured-client"]', 'a[href="/projects/featured-client/"]']);
});

const failures: [string, (h: ReturnType<typeof harness>) => void][] = [
  ['long press', (h) => h.pointer('pointerup', { timeStamp: 501 })],
  ['maximum excursion even after returning to the origin', (h) => { h.pointer('pointermove', { clientX: 111 }); h.pointer('pointermove'); h.pointer('pointerup'); }],
  ['release movement without a move event', (h) => h.pointer('pointerup', { clientY: 111 })],
  ['scroll displacement without an event', (h) => { h.state.scrollY = 5; h.pointer('pointerup'); }],
  ['momentum scroll even with no net displacement', (h) => { h.target.dispatchEvent(new Event('scroll')); h.pointer('pointerup'); }],
  ['second pointer even after it is released', (h) => { h.pointer('pointerdown', { pointerId: 2, isPrimary: false }); h.pointer('pointerup', { pointerId: 2, isPrimary: false }); h.pointer('pointerup'); }],
  ['another primary pointer from a different device', (h) => { h.pointer('pointerdown', { pointerId: 2 }); h.pointer('pointerup', { pointerId: 2 }); h.pointer('pointerup'); }],
  ['pointer cancellation', (h) => { h.pointer('pointercancel'); h.pointer('pointerup'); }],
  ['leaving then reentering the canvas', (h) => { h.state.overCanvas = false; h.pointer('pointermove'); h.state.overCanvas = true; h.pointer('pointerup'); }],
  ['leaving the viewport without another move', (h) => { h.state.overCanvas = false; h.pointer('pointerout'); h.state.overCanvas = true; h.pointer('pointerup'); }],
  ['release outside the canvas', (h) => { h.state.overCanvas = false; h.pointer('pointerup'); }],
  ['release of an unrelated pointer', (h) => h.pointer('pointerup', { pointerId: 2 })],
  ['nonprimary release', (h) => h.pointer('pointerup', { isPrimary: false })],
  ['lost window focus', (h) => { h.target.dispatchEvent(new Event('blur')); h.pointer('pointerup'); }],
];
for (const [reason, finish] of failures) {
  test(`rejects ${reason} before asking the scene to hit-test`, () => {
    const h = harness();
    h.pointer('pointerdown');
    finish(h);
    assert.equal(h.state.clicks, 0);
    assert.equal(h.state.hits, 0);
  });
}

test('an ordinary DOM target, nonprimary press, or secondary mouse button cannot begin a tap', () => {
  for (const mode of ['dom', 'nonprimary', 'secondary']) {
    const h = harness();
    h.state.overCanvas = mode !== 'dom';
    h.pointer('pointerdown', { isPrimary: mode !== 'nonprimary', button: mode === 'secondary' ? 2 : 0 });
    h.state.overCanvas = true;
    h.pointer('pointerup');
    assert.equal(h.state.hits, 0);
  }
});

test('still view, a missed panel, or a missing anchor cannot navigate', () => {
  for (const mode of ['still', 'miss', 'missing-anchor']) {
    const h = harness();
    h.state.mounted = mode !== 'still';
    h.state.slug = mode === 'miss' ? null : 'featured-client';
    h.state.hasAnchor = mode !== 'missing-anchor';
    h.pointer('pointerdown');
    h.pointer('pointerup');
    assert.equal(h.state.clicks, 0);
  }
});

test('unsafe scene slugs are rejected before composing any selector', () => {
  for (const slug of ['bad"], a', '../featured-client', 'Featured-client', '-featured', 'featured--client', '']) {
    const h = harness();
    h.state.slug = slug;
    h.pointer('pointerdown');
    h.pointer('pointerup');
    assert.deepEqual(h.selectors, []);
    assert.equal(h.state.clicks, 0);
  }
});

test('a cancelled multi-pointer gesture cannot restart until every pointer is released', () => {
  const h = harness();
  h.pointer('pointerdown');
  h.pointer('pointerdown', { pointerId: 2, isPrimary: false });
  h.pointer('pointerup');
  h.pointer('pointerdown');
  h.pointer('pointerup');
  assert.equal(h.state.clicks, 0);
  h.pointer('pointerup', { pointerId: 2, isPrimary: false });
  h.pointer('pointerdown');
  h.pointer('pointerup');
  assert.equal(h.state.clicks, 1);
});

test('every gesture listener is passive and no wheel or touch listener is installed', () => {
  const h = harness();
  assert.deepEqual(h.listeners.map(({ type }) => type), ['pointerdown', 'pointermove', 'pointerout', 'scroll', 'pointercancel', 'blur', 'pointerup']);
  assert.ok(h.listeners.every(({ passive }) => passive));
});
