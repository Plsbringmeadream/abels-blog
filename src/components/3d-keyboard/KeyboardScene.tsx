import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import React, { useEffect, useState } from 'react';

import Keyboard from './Keyboard';
import KeyboardControls from './KeyboardControls';
import KeyboardErrorBoundary, { KeyboardErrorFallback } from './KeyboardErrorBoundary';
import { KeyboardExperienceProvider, useKeyboardExperience } from './KeyboardExperience';
import { useKeyboardSceneActivity, useWebGLContextLoss } from './KeyboardRuntime';
import { keyboardFrameloop, keyboardShouldAutoRotate } from './keyboard-render-policy';
import { cameraPositionForAspect, PRODUCT_SHOT } from './keyboard-product-shot';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function ProductCameraFraming() {
  const { camera, size } = useThree();
  useEffect(() => {
    const position = cameraPositionForAspect(PRODUCT_SHOT.homepage.camera, size.width / size.height);
    camera.position.set(...position);
    camera.lookAt(...PRODUCT_SHOT.homepage.camera.target);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function KeyboardCanvas({ variant, active, onCreated }: { variant: 'homepage' | 'build'; active: boolean; onCreated: ({ gl }: { gl: { domElement: HTMLCanvasElement } }) => void }) {
  const reducedMotion = useReducedMotion();
  const { state } = useKeyboardExperience();
  return (
    <Canvas
      camera={{ position: PRODUCT_SHOT.homepage.camera.position, fov: PRODUCT_SHOT.homepage.camera.fov }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, alpha: true }}
      frameloop={keyboardFrameloop(state.enabled, state.mode, reducedMotion, active)}
      onCreated={onCreated}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
      shadows
    >
      <ProductCameraFraming />
      <ambientLight intensity={0.16} color="#dfe7ff" />
      <directionalLight
        {...PRODUCT_SHOT.lights.coolKey}
        castShadow
        shadow-mapSize-width={PRODUCT_SHOT.shadows.directional.mapSize}
        shadow-mapSize-height={PRODUCT_SHOT.shadows.directional.mapSize}
        shadow-camera-left={PRODUCT_SHOT.shadows.directional.left}
        shadow-camera-right={PRODUCT_SHOT.shadows.directional.right}
        shadow-camera-top={PRODUCT_SHOT.shadows.directional.top}
        shadow-camera-bottom={PRODUCT_SHOT.shadows.directional.bottom}
        shadow-bias={-0.0008}
      />
      <directionalLight {...PRODUCT_SHOT.lights.redRim} />
      <directionalLight {...PRODUCT_SHOT.lights.warmFill} />
      <pointLight
        name="product-shot-underpool"
        position={[0, 0.28, -0.8]}
        intensity={0.9}
        distance={11}
        decay={2}
        color={PRODUCT_SHOT.palette.redLight}
      />
      <mesh
        name="product-shot-desk"
        position={[0, PRODUCT_SHOT.desk.topY - PRODUCT_SHOT.desk.thickness / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[PRODUCT_SHOT.desk.width, PRODUCT_SHOT.desk.thickness, PRODUCT_SHOT.desk.depth]} />
        <meshStandardMaterial
          color={PRODUCT_SHOT.desk.color}
          roughness={PRODUCT_SHOT.desk.roughness}
          metalness={0.04}
        />
      </mesh>
      <ContactShadows
        position={[0, PRODUCT_SHOT.desk.topY + 0.01, 0]}
        opacity={0.5}
        scale={PRODUCT_SHOT.shadows.contact.scale}
        resolution={PRODUCT_SHOT.shadows.contact.resolution}
        frames={PRODUCT_SHOT.shadows.contact.frames}
        blur={2.8}
        far={4.5}
        color="#171126"
      />
      <Environment preset="studio" environmentIntensity={0.72} />
      <group position={PRODUCT_SHOT.keyboard.position} rotation={[0, PRODUCT_SHOT.keyboard.rotationY, 0]}>
        <Keyboard reducedMotion={reducedMotion} active={active} />
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 2}
        minDistance={PRODUCT_SHOT.homepage.camera.controls.minDistance}
        maxDistance={PRODUCT_SHOT.homepage.camera.controls.maxDistance}
        autoRotate={keyboardShouldAutoRotate(state.enabled, state.mode, reducedMotion, active)}
        autoRotateSpeed={0.25}
        target={PRODUCT_SHOT.homepage.camera.target}
      />
    </Canvas>
  );
}

export default function KeyboardScene({ variant = 'homepage', controls = 'full' }: { variant?: 'homepage' | 'build'; controls?: 'compact' | 'full' }) {
  const { rootRef, active } = useKeyboardSceneActivity();
  const { webglFailed, onCreated } = useWebGLContextLoss();
  return (
    <KeyboardErrorBoundary>
      <KeyboardExperienceProvider>
        <div ref={rootRef} className="keyboard-3d-container" style={{ width: '100%', height: '100%', position: 'relative' }} role="region" aria-label="Interactive 3D mechanical keyboard">
          {webglFailed ? <KeyboardErrorFallback /> : <KeyboardCanvas variant={variant} active={active} onCreated={onCreated} />}
          <div style={{ position: 'absolute', inset: 'auto 16px 16px', zIndex: 5, pointerEvents: 'auto' }}>
            <KeyboardControls variant={controls} />
          </div>
        </div>
      </KeyboardExperienceProvider>
    </KeyboardErrorBoundary>
  );
}
