import {
  createContext,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import React from 'react';

import { KEY_BY_CODE } from './keyboard-layout';
import {
  createKeyboardState,
  type KeyboardAction,
  type KeyboardState,
  keyboardReducer,
} from './keyboard-state';

export interface KeyboardExperienceValue {
  state: KeyboardState;
  press: (code: string) => void;
  release: (code: string) => void;
  dispatch: Dispatch<KeyboardAction>;
}

const KeyboardExperienceContext = createContext<KeyboardExperienceValue | null>(null);

const FN_SHORTCUTS: Readonly<Record<string, KeyboardAction>> = {
  ArrowLeft: { type: 'previous-mode' },
  ArrowRight: { type: 'next-mode' },
  ArrowUp: { type: 'brightness', delta: 0.1 },
  ArrowDown: { type: 'brightness', delta: -0.1 },
  Space: { type: 'toggle-rgb' },
};

export function KeyboardExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(keyboardReducer, undefined, createKeyboardState);
  const capsLockHeld = useRef(false);

  const press = useCallback((code: string) => {
    if (KEY_BY_CODE.has(code)) dispatch({ type: 'press', code });
  }, []);

  const release = useCallback((code: string) => {
    if (KEY_BY_CODE.has(code)) dispatch({ type: 'release', code });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'CapsLock') {
        capsLockHeld.current = true;
        press(event.code);
        return;
      }

      const shortcut = capsLockHeld.current ? FN_SHORTCUTS[event.code] : undefined;
      if (shortcut) {
        event.preventDefault();
        dispatch(shortcut);
        return;
      }

      press(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'CapsLock') capsLockHeld.current = false;
      release(event.code);
    };

    const clearPressed = () => {
      capsLockHeld.current = false;
      dispatch({ type: 'clear' });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clearPressed();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearPressed);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearPressed);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearPressed();
    };
  }, [press, release]);

  const value = useMemo(() => ({ state, press, release, dispatch }), [state, press, release]);

  return (
    <KeyboardExperienceContext.Provider value={value}>
      {children}
    </KeyboardExperienceContext.Provider>
  );
}

export function useKeyboardExperience(): KeyboardExperienceValue {
  const value = useContext(KeyboardExperienceContext);
  if (!value) {
    throw new Error('useKeyboardExperience must be used within KeyboardExperienceProvider');
  }
  return value;
}
