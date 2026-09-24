/** Software rasterizers (SwiftShader, llvmpipe, WARP) draw the 3D exhibition at a few frames per second. */
export const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function isSoftwareRenderer(name: string): boolean {
  return SOFTWARE_RENDERER.test(name);
}
