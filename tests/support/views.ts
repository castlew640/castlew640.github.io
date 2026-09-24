import type { BrowserContext, Page } from '@playwright/test';

/**
 * Choose the 3D exhibition once, as a visitor would with the view button.
 * CI draws WebGL in software, where the default is the illustrated view.
 */
export async function chooseMoving(target: BrowserContext | Page): Promise<void> {
  await target.addInitScript(() => {
    if (sessionStorage.getItem('test-view-seeded')) return;
    sessionStorage.setItem('test-view-seeded', 'true');
    localStorage.setItem('exhibition-view', 'moving');
  });
}

/**
 * Report an ordinary GPU to the view policy's probe (a detached canvas) so
 * tests can exercise the desktop default on CI's software renderer. The
 * mounted scene still sees the real renderer and stays in its light mode.
 */
export async function pretendHardwareGraphics(target: BrowserContext | Page): Promise<void> {
  await target.addInitScript(() => {
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const original = prototype.getParameter;
      prototype.getParameter = function (this: WebGLRenderingContext, parameter: number) {
        const probe = this.canvas instanceof HTMLCanvasElement && !this.canvas.isConnected;
        return parameter === 0x9246 && probe ? 'Test GPU' : Reflect.apply(original, this, [parameter]);
      } as typeof original;
    }
  });
}
