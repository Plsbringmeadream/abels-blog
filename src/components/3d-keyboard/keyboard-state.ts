export const RGB_MODES = ['static', 'breathing', 'rainbow', 'ripple'] as const;

export type RgbMode = (typeof RGB_MODES)[number];

export interface KeyboardState {
  pressed: ReadonlySet<string>;
  enabled: boolean;
  mode: RgbMode;
  brightness: number;
  pulse: { code: string; sequence: number } | null;
}

export type KeyboardAction =
  | { type: 'press'; code: string }
  | { type: 'release'; code: string }
  | { type: 'clear' }
  | { type: 'toggle-rgb' }
  | { type: 'next-mode' }
  | { type: 'previous-mode' }
  | { type: 'set-mode'; mode: RgbMode }
  | { type: 'brightness'; delta: number };

export function createKeyboardState(): KeyboardState {
  return {
    pressed: new Set<string>(),
    enabled: true,
    mode: 'static',
    brightness: 1,
    pulse: null,
  };
}

const clampBrightness = (brightness: number) => Math.min(1, Math.max(0.1, brightness));

export function keyboardReducer(state: KeyboardState, action: KeyboardAction): KeyboardState {
  switch (action.type) {
    case 'press': {
      if (state.pressed.has(action.code)) return state;
      const pressed = new Set(state.pressed);
      pressed.add(action.code);
      return {
        ...state,
        pressed,
        pulse: { code: action.code, sequence: (state.pulse?.sequence ?? 0) + 1 },
      };
    }
    case 'release': {
      if (!state.pressed.has(action.code)) return state;
      const pressed = new Set(state.pressed);
      pressed.delete(action.code);
      return { ...state, pressed };
    }
    case 'clear':
      return { ...state, pressed: new Set<string>() };
    case 'toggle-rgb':
      return { ...state, enabled: !state.enabled };
    case 'next-mode': {
      const index = RGB_MODES.indexOf(state.mode);
      return { ...state, mode: RGB_MODES[(index + 1) % RGB_MODES.length] };
    }
    case 'previous-mode': {
      const index = RGB_MODES.indexOf(state.mode);
      return { ...state, mode: RGB_MODES[(index - 1 + RGB_MODES.length) % RGB_MODES.length] };
    }
    case 'set-mode':
      return { ...state, mode: action.mode };
    case 'brightness':
      return { ...state, brightness: clampBrightness(state.brightness + action.delta) };
  }
}
