export type EvidenceKind = 'screenshot' | 'terminal' | 'diagram' | 'illustration';
export type EvidenceFit = 'contain' | 'cover';

export function evidenceFit(kind: EvidenceKind, requested: EvidenceFit, width: number, height: number): EvidenceFit {
  if (kind === 'terminal' || kind === 'diagram' || requested === 'contain') return 'contain';
  const ratio = width / height;
  if (!Number.isFinite(ratio) || ratio <= 0) return 'contain';
  const croppedWidth = 1 - Math.min(1, 2 / ratio);
  const croppedHeight = 1 - Math.min(1, ratio / 2);
  return croppedWidth <= 0.1 + 1e-10 && croppedHeight <= 0.1 + 1e-10 ? 'cover' : 'contain';
}

export function containedScale(width: number, height: number): { x: number; y: number } {
  const ratio = width / height;
  if (!Number.isFinite(ratio) || ratio <= 0) return { x: 1, y: 1 };
  return ratio > 2 ? { x: 1, y: 2 / ratio } : { x: ratio / 2, y: 1 };
}

export function imageSize(width: number, height: number): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Evidence image dimensions must be positive and finite');
  }
  const scale = Math.min(1, 1600 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
