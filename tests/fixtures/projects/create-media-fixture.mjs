// Run manually when intentionally regenerating the checked-in, self-authored demo.
// Chromium's canvas recorder is used only at authoring time, never in CI.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 144;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    const mimeType = 'video/mp4;codecs=avc1.42E01E';
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('Chromium MP4 recorder unavailable');
    const stream = canvas.captureStream(0);
    const track = stream.getVideoTracks()[0];
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 120000 });
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
    const finished = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = reject;
    });
    recorder.start();
    for (let frame = 0; frame < 10; frame++) {
      context.fillStyle = '#f4f0e6';
      context.fillRect(0, 0, 256, 144);
      context.fillStyle = '#8e4935';
      context.beginPath();
      context.arc(42 + frame * 19, 72, 22, 0, Math.PI * 2);
      context.fill();
      track.requestFrame();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    recorder.stop();
    await finished;
    track.stop();
    const blob = new Blob(chunks, { type: 'video/mp4' });
    return [...new Uint8Array(await blob.arrayBuffer())];
  });
  const path = fileURLToPath(new URL('./silent-demo.mp4', import.meta.url));
  await writeFile(path, Buffer.from(bytes));
  console.log(`Wrote ${path} (${bytes.length} bytes)`);
} finally {
  await browser.close();
}
