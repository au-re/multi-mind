export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number) {
  return clamp(value, 0, 1);
}

export function clampInt(value: number, min: number, max: number) {
  return clamp(Math.floor(value), min, max);
}
