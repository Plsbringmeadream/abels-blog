import React from 'react';

import { RGB_MODES, type RgbMode } from './keyboard-state';
import { useKeyboardExperience } from './KeyboardExperience';

export default function KeyboardControls({ variant = 'full' }: { variant?: 'compact' | 'full' }) {
  const { state, dispatch } = useKeyboardExperience();

  const setBrightness = (value: number) => {
    dispatch({ type: 'brightness', delta: value / 100 - state.brightness });
  };

  return (
    <div
      className={`keyboard-controls keyboard-controls--toolbar keyboard-controls--${variant}`}
      role="group"
      aria-label="Keyboard lighting controls"
    >
      <style>{`
        .keyboard-controls { position:relative; display:flex; align-items:flex-end; justify-content:flex-end; flex-wrap:wrap; gap:4px; width:max-content; max-width:calc(100% - 24px); color:#f5f1fb; font:600 10px/1.15 system-ui,sans-serif; pointer-events:auto; }
        .keyboard-controls__main { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:5px; max-width:100%; padding:5px; border:1px solid rgba(255,255,255,.14); border-radius:14px; background:rgba(18,14,27,.76); box-shadow:0 8px 24px rgba(8,5,14,.26); backdrop-filter:blur(14px) saturate(130%); }
        .keyboard-controls button, .keyboard-controls summary { box-sizing:border-box; border:1px solid rgba(255,255,255,.13); border-radius:999px; color:inherit; background:rgba(255,255,255,.07); cursor:pointer; }
        .keyboard-controls button { min-height:26px; padding:5px 8px; font:inherit; text-transform:capitalize; white-space:nowrap; }
        .keyboard-controls button:hover, .keyboard-controls summary:hover { background:rgba(255,255,255,.14); }
        .keyboard-controls button:focus-visible, .keyboard-controls summary:focus-visible, .keyboard-controls input:focus-visible { outline:2px solid #d98bd7; outline-offset:2px; }
        .keyboard-controls button[aria-pressed="true"] { color:#fff; border-color:rgba(224,151,222,.72); background:linear-gradient(120deg,rgba(118,81,183,.96),rgba(215,97,162,.94)); }
        .keyboard-controls__power { letter-spacing:.05em; }
        .keyboard-controls__modes { display:flex; gap:3px; }
        .keyboard-controls__brightness { display:flex; align-items:center; gap:4px; padding:0 3px 0 4px; color:rgba(245,241,251,.78); white-space:nowrap; }
        .keyboard-controls__brightness input { width:68px; margin:0; accent-color:#d16eb7; }
        .keyboard-controls__help { position:relative; flex:none; }
        .keyboard-controls__help summary { display:grid; place-items:center; min-width:26px; min-height:26px; padding:5px 7px; list-style:none; user-select:none; }
        .keyboard-controls__help summary::-webkit-details-marker { display:none; }
        .keyboard-controls__help p { position:absolute; right:0; bottom:calc(100% + 8px); width:260px; max-width:calc(100vw - 32px); margin:0; padding:8px 10px; border:1px solid rgba(255,255,255,.14); border-radius:9px; color:#f5f1fb; background:rgba(18,14,27,.94); box-shadow:0 8px 24px rgba(8,5,14,.3); font-weight:500; }
        .keyboard-controls--compact button { padding-inline:7px; }
        .keyboard-controls--compact .keyboard-controls__brightness span { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
        .keyboard-controls--compact .keyboard-controls__main { flex:1 1 300px; }
        .keyboard-controls--compact .keyboard-controls__brightness input { width:60px; }
      `}</style>
      <div className="keyboard-controls__main">
        <button
          type="button"
          className="keyboard-controls__power"
          aria-label="RGB power"
          aria-pressed={state.enabled}
          onClick={() => dispatch({ type: 'toggle-rgb' })}
        >
          RGB
        </button>

        <div className="keyboard-controls__modes" role="group" aria-label="RGB mode">
          {RGB_MODES.map((mode: RgbMode) => (
            <button
              type="button"
              key={mode}
              aria-label={mode}
              aria-pressed={state.mode === mode}
              onClick={() => dispatch({ type: 'set-mode', mode })}
            >
              {mode === 'breathing' ? 'breathe' : mode}
            </button>
          ))}
        </div>

        <label className="keyboard-controls__brightness">
          <span>Brightness</span>
          <input
            type="range"
            aria-label="RGB brightness"
            min="10"
            max="100"
            step="10"
            value={Math.round(state.brightness * 100)}
            onChange={(event) => setBrightness(Number(event.currentTarget.value))}
          />
        </label>
      </div>

      <details className="keyboard-controls__help">
        <summary aria-label="Keyboard shortcuts">Shortcuts</summary>
        <p>Caps + arrows: mode / brightness · Caps + Space: RGB power</p>
      </details>
    </div>
  );
}
