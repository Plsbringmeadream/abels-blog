// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardSceneActivity, useWebGLContextLoss } from './KeyboardRuntime';
import { KeyboardErrorFallback } from './KeyboardErrorBoundary';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useWebGLContextLoss', () => {
  it('prevents context restoration retry and exposes failure state', () => {
    const canvas = document.createElement('canvas');
    function Probe() {
      const { webglFailed, onCreated } = useWebGLContextLoss();
      useEffect(() => onCreated({ gl: { domElement: canvas } }), [onCreated]);
      return webglFailed ? <KeyboardErrorFallback /> : <span>WebGL ready</span>;
    }
    const view = render(<Probe />);
    const event = new Event('webglcontextlost', { cancelable: true });
    act(() => canvas.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByText('Interactive keyboard is unavailable right now.')).toBeTruthy();
    view.unmount();
  });
});

describe('useKeyboardSceneActivity', () => {
  it('defaults active when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    function Probe() {
      const { rootRef, active } = useKeyboardSceneActivity();
      return <div ref={rootRef} data-active={String(active)} />;
    }
    const view = render(<Probe />);
    expect(view.container.firstElementChild?.getAttribute('data-active')).toBe('true');
  });

  it('tracks intersection and cleans up the observer', () => {
    let callback!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    class Observer {
      constructor(next: IntersectionObserverCallback) { callback = next; }
      observe() {}
      disconnect = disconnect;
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    function Probe() {
      const { rootRef, active } = useKeyboardSceneActivity();
      return <div ref={rootRef} data-active={String(active)} />;
    }
    const view = render(<Probe />);
    act(() => callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(view.container.firstElementChild?.getAttribute('data-active')).toBe('false');
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
