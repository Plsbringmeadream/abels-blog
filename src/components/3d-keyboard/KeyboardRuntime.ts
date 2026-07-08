import { useCallback, useEffect, useRef, useState } from 'react';

export function useWebGLContextLoss() {
  const [webglFailed, setWebglFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    setWebglFailed(true);
  }, []);

  const detach = useCallback(() => {
    canvasRef.current?.removeEventListener('webglcontextlost', handleContextLost);
    canvasRef.current = null;
  }, [handleContextLost]);

  const onCreated = useCallback(({ gl }: { gl: { domElement: HTMLCanvasElement } }) => {
    detach();
    canvasRef.current = gl.domElement;
    gl.domElement.addEventListener('webglcontextlost', handleContextLost, { passive: false });
  }, [detach, handleContextLost]);

  useEffect(() => detach, [detach]);
  return { webglFailed, onCreated };
}

export function useKeyboardSceneActivity() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [intersecting, setIntersecting] = useState(true);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !rootRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      rootMargin: '120px',
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return { rootRef, active: intersecting && visible };
}
