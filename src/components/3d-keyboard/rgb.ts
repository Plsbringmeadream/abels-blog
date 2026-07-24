import { Color } from 'three';

import type { RgbMode } from './keyboard-state';

export interface RgbKeyPosition {
  x: number;
  z: number;
}

export interface RgbOptions {
  enabled: boolean;
  mode: RgbMode;
  brightness: number;
  time: number;
  pulse: ({ startedAt?: number } & RgbKeyPosition) | null;
}

const STATIC_LEFT = new Color('#b80020');
const STATIC_RIGHT = new Color('#ff3150');
const RIPPLE_BASE = new Color('#230006');
const RIPPLE_RING = new Color('#ff3454');

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrapUnit = (value: number) => ((value % 1) + 1) % 1;
const finiteOr = (value: number, fallback: number) => (Number.isFinite(value) ? value : fallback);

function staticColor(x: number): Color {
  const normalizedX = clamp((x + 9.5) / 19, 0, 1);
  return STATIC_LEFT.clone().lerp(STATIC_RIGHT, normalizedX);
}

function rippleColor(key: RgbKeyPosition, options: RgbOptions): Color {
  if (!options.pulse) return RIPPLE_BASE.clone();

  const startedAt = options.pulse.startedAt ?? options.time;
  const age = Math.max(0, options.time - startedAt);
  const fade = clamp(1 - age / 1.2, 0, 1);
  const distance = Math.hypot(key.x - options.pulse.x, key.z - options.pulse.z);
  const ringRadius = age * 6;
  const ringWidth = 0.45;
  const ring = Math.exp(-((distance - ringRadius) ** 2) / (2 * ringWidth ** 2)) * fade;

  return RIPPLE_BASE.clone().lerp(RIPPLE_RING, ring);
}

export function rgbForKey(key: RgbKeyPosition, options: RgbOptions): string {
  if (!options.enabled) return '#000000';

  const safeKey = {
    x: finiteOr(key.x, 0),
    z: finiteOr(key.z, 0),
  };
  const safeTime = finiteOr(options.time, 0);
  const safeBrightness = Number.isFinite(options.brightness)
    ? clamp(options.brightness, 0, 1)
    : 0;
  const safePulse =
    options.pulse &&
    Number.isFinite(options.pulse.x) &&
    Number.isFinite(options.pulse.z) &&
    (options.pulse.startedAt === undefined || Number.isFinite(options.pulse.startedAt))
      ? options.pulse
      : null;
  const safeOptions: RgbOptions = {
    ...options,
    brightness: safeBrightness,
    time: safeTime,
    pulse: safePulse,
  };

  let color: Color;
  switch (options.mode) {
    case 'static':
      color = staticColor(safeKey.x);
      break;
    case 'breathing': {
      const pulse = Math.max(0, 0.55 + 0.45 * Math.sin(safeTime * 2));
      color = staticColor(safeKey.x).multiplyScalar(pulse);
      break;
    }
    case 'rainbow':
      color = new Color().setHSL(wrapUnit(safeKey.x * 0.035 + safeKey.z * 0.025 - safeTime * 0.08), 0.85, 0.58);
      break;
    case 'ripple':
      color = rippleColor(safeKey, safeOptions);
      break;
  }

  color.multiplyScalar(safeBrightness);
  return `#${color.getHexString().toLowerCase()}`;
}
