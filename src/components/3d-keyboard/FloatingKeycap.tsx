import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingKeycapProps {
  position: [number, number, number];
  label: string;
  color: string;
}

/**
 * A keycap floating/bouncing around the keyboard with idle animation.
 */
export default function FloatingKeycap({ position, label, color }: FloatingKeycapProps) {
  const ref = useRef<THREE.Group>(null);
  const phase = Math.random() * Math.PI * 2;
  const floatAmp = 0.04 + Math.random() * 0.05;

  // Generate a miniature keycap geometry (same profile as normal keys)
  const geom = useRef<THREE.BufferGeometry | null>(null);

  if (!geom.current) {
    const w = 0.65;
    const d = 0.65;
    const h = 0.38;
    const dishDepth = 0.03;
    const segW = 8;
    const segD = 8;
    const segH = 3;

    const geo = new THREE.BoxGeometry(w, h, d, segW, segH, segD);
    const pos = geo.attributes.position;
    const vert = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      vert.fromBufferAttribute(pos, i);
      if (vert.y > h * 0.2) {
        const cx = Math.abs(vert.x / (w / 2));
        const cz = Math.abs(vert.z / (d / 2));
        const dist = Math.max(cx, cz);
        if (vert.y > h * 0.35) {
          vert.y -= Math.pow(dist, 1.5) * dishDepth;
        }
        const taper = 0.05;
        vert.x *= (1 - taper * (vert.y / h));
        vert.z *= (1 - taper * (vert.y / h));
      }
      if (vert.y < -h * 0.3) {
        vert.x *= (1 + 0.03 * Math.abs(vert.y / h));
        vert.z *= (1 + 0.03 * Math.abs(vert.y / h));
      }
      pos.setXYZ(i, vert.x, vert.y, vert.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geom.current = geo;
  }

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.7 + phase) * floatAmp;
    ref.current.rotation.x = Math.sin(t * 0.4 + phase * 0.5) * 0.06;
    ref.current.rotation.z = Math.cos(t * 0.35 + phase) * 0.06;
  });

  return (
    <group ref={ref} position={position} rotation={[0.1, Math.random() * 0.8, 0.05]}>
      <mesh geometry={geom.current} castShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.08}
          roughness={0.5}
          clearcoat={0.2}
        />
      </mesh>
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.09}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}
