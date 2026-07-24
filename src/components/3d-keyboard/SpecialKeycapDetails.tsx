import type { KeyVariant } from './keyboard-layout';
import { PRODUCT_SHOT } from './keyboard-product-shot';

interface SpecialKeycapDetailsProps {
  variant: KeyVariant;
  width: number;
  height: number;
}

const ANIME_COLORS: Readonly<Record<string, string>> = Object.freeze({
  'anime-red': '#b52c36',
  'anime-blue': '#3b79a6',
  'anime-purple': '#7b3e91',
  'anime-mint': '#58a88c',
});

export function specialKeycapColor(variant: KeyVariant | undefined, fallback: string): string {
  if (!variant || variant === 'standard' || variant === 'space-art') return fallback;
  if (variant === 'creature') return PRODUCT_SHOT.palette.magentaAccent;
  if (variant === 'gamepad') return PRODUCT_SHOT.palette.creamAccent;
  if (variant === 'etched-enter') return PRODUCT_SHOT.palette.silverAccent;
  return ANIME_COLORS[variant] ?? fallback;
}

function AnimePortrait({ variant, height }: { variant: string; height: number }) {
  const y = height / 2 + 0.018;
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 24]} />
        <meshStandardMaterial color="#f1c7a7" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.012, -0.13]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 5]} />
        <meshStandardMaterial color={ANIME_COLORS[variant] ?? '#694d83'} roughness={0.76} />
      </mesh>
      {[-0.085, 0.085].map((x) => (
        <mesh key={x} position={[x, 0.024, 0.025]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshBasicMaterial color="#271822" />
        </mesh>
      ))}
      <mesh position={[0.03, 0.025, 0.13]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.018, 0.025]} />
        <meshBasicMaterial color="#fff2ea" />
      </mesh>
    </group>
  );
}

export default function SpecialKeycapDetails({
  variant,
  width,
  height,
}: SpecialKeycapDetailsProps) {
  const topY = height / 2;

  if (variant.startsWith('anime-')) {
    return <AnimePortrait variant={variant} height={height} />;
  }

  if (variant === 'creature') {
    return (
      <group position={[0, topY, 0]}>
        {[-0.22, 0.22].map((x) => (
          <mesh key={`ear-${x}`} position={[x, 0.16, -0.22]} rotation={[0.15, 0, x * 1.2]}>
            <coneGeometry args={[0.13, 0.28, 10]} />
            <meshStandardMaterial color="#f15aa0" roughness={0.68} />
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.36, 24, 16]} />
          <meshPhysicalMaterial color="#dd3b87" roughness={0.56} clearcoat={0.16} />
        </mesh>
        {[-0.13, 0.13].map((x) => (
          <mesh key={`eye-${x}`} position={[x, 0.21, 0.27]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
            <boxGeometry args={[0.11, 0.025, 0.11]} />
            <meshBasicMaterial color="#ffe96b" />
          </mesh>
        ))}
      </group>
    );
  }

  if (variant === 'gamepad') {
    return (
      <group position={[0, topY + 0.015, 0]}>
        <mesh position={[0, 0.08, -0.08]}>
          <boxGeometry args={[0.72, 0.17, 0.58]} />
          <meshPhysicalMaterial color="#f2eee3" roughness={0.5} clearcoat={0.08} />
        </mesh>
        <mesh position={[0.08, 0.18, -0.08]}>
          <boxGeometry args={[0.34, 0.025, 0.18]} />
          <meshBasicMaterial color="#d9777b" />
        </mesh>
        <mesh position={[-0.2, 0.18, 0.1]}>
          <boxGeometry args={[0.2, 0.028, 0.065]} />
          <meshBasicMaterial color="#e2b817" />
        </mesh>
        <mesh position={[-0.2, 0.18, 0.1]}>
          <boxGeometry args={[0.065, 0.03, 0.2]} />
          <meshBasicMaterial color="#e2b817" />
        </mesh>
        {[-0.02, 0.1].map((z, index) => (
          <mesh key={z} position={[0.23 + index * 0.09, 0.19, z]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshBasicMaterial color={index ? '#52a8b7' : '#d95a67'} />
          </mesh>
        ))}
      </group>
    );
  }

  if (variant === 'etched-enter') {
    return (
      <group position={[0, topY + 0.02, 0]}>
        {[-0.25, -0.08, 0.1, 0.27].map((z, index) => (
          <mesh key={z} position={[index % 2 ? 0.12 : -0.08, 0, z]} rotation={[0, index % 2 ? -0.35 : 0.28, 0]}>
            <boxGeometry args={[width * 0.62, 0.025, 0.025]} />
            <meshBasicMaterial color="#30333a" />
          </mesh>
        ))}
      </group>
    );
  }

  if (variant === 'space-art') {
    return (
      <group position={[0.7, topY + 0.025, 0]}>
        <mesh rotation={[0, 0.15, -0.02]}>
          <boxGeometry args={[1.5, 0.035, 0.07]} />
          <meshPhysicalMaterial
            color={PRODUCT_SHOT.palette.mirrorMetal}
            metalness={1}
            roughness={0.16}
          />
        </mesh>
        <mesh position={[0.15, 0.025, 0.04]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.85, 0.025, 0.045]} />
          <meshBasicMaterial color={PRODUCT_SHOT.palette.redLight} toneMapped={false} />
        </mesh>
      </group>
    );
  }

  return null;
}
