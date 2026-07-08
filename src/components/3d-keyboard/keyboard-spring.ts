export interface KeySpringState {
  travel: number;
  velocity: number;
}

const MAX_DELTA = 1 / 30;
const PRESSED_TRAVEL = -0.055;
const STIFFNESS = 620;
const DAMPING = 26;

export function keySpringIsMoving(state: KeySpringState, pressed: boolean): boolean {
  const target = pressed ? PRESSED_TRAVEL : 0;
  return Math.abs(state.travel - target) > 0.0001 || Math.abs(state.velocity) > 0.0005;
}

export function stepKeySpring(
  state: KeySpringState,
  pressed: boolean,
  delta: number,
): KeySpringState {
  return stepKeySpringInPlace({ ...state }, pressed, delta);
}

export function stepKeySpringInPlace<T extends KeySpringState>(
  state: T,
  pressed: boolean,
  delta: number,
): T {
  const travel = Number.isFinite(state.travel) ? state.travel : 0;
  const velocity = Number.isFinite(state.velocity) ? state.velocity : 0;
  const dt = Math.min(MAX_DELTA, Math.max(0, Number.isFinite(delta) ? delta : 0));
  const target = pressed ? PRESSED_TRAVEL : 0;
  const acceleration = (target - travel) * STIFFNESS - velocity * DAMPING;
  const nextVelocity = velocity + acceleration * dt;
  const nextTravel = travel + nextVelocity * dt;

  state.travel = Number.isFinite(nextTravel) ? Math.min(0.012, Math.max(-0.065, nextTravel)) : target;
  state.velocity = Number.isFinite(nextVelocity) ? nextVelocity : 0;
  return state;
}
