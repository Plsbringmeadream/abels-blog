import type { RgbMode } from './keyboard-state';

export function keyboardFrameloop(enabled: boolean, mode: RgbMode, reducedMotion: boolean, active = true): 'always' | 'demand' {
  return enabled && mode !== 'static' && !reducedMotion && active ? 'always' : 'demand';
}

export function keyboardShouldAutoRotate(enabled: boolean, mode: RgbMode, reducedMotion: boolean, active = true): boolean {
  return keyboardFrameloop(enabled, mode, reducedMotion, active) === 'always';
}

export function keyboardAnimationTime(elapsedTime: number, reducedMotion: boolean, active = true): number {
  return reducedMotion || !active ? 0 : elapsedTime;
}
