'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

/** Each layer of the floating stack — a generated module. */
const MODULES = [
  { label: 'fastify', color: '#8b7cff' },
  { label: 'typescript', color: '#4f9dff' },
  { label: 'mongodb', color: '#3fd07f' },
  { label: 'redis', color: '#ff6b6b' },
  { label: 'jwt', color: '#f7c948' },
  { label: 'rag', color: '#b06bff' },
];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Slab({
  index,
  total,
  color,
  label,
}: {
  index: number;
  total: number;
  color: string;
  label: string;
}) {
  const y = (total / 2 - index) * 0.62 - 0.31;
  const x = index * 0.14 - 0.4;
  return (
    <group position={[x, y, 0]}>
      <RoundedBox args={[3, 0.5, 1.3]} radius={0.08} smoothness={4}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.9}
          roughness={0.35}
          metalness={0.15}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </RoundedBox>
      <Html position={[-1.85, 0, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.9)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
      </Html>
    </group>
  );
}

function StackScene({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    const targetY = -0.45 + state.pointer.x * 0.4 + state.clock.elapsedTime * 0.06;
    const targetX = 0.15 - state.pointer.y * 0.25;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3, delta);
  });

  return (
    <group ref={group} rotation={[0.15, -0.45, 0]}>
      {MODULES.map((m, i) => {
        const slab = <Slab index={i} total={MODULES.length} color={m.color} label={m.label} />;
        return reduced ? (
          <group key={m.label}>{slab}</group>
        ) : (
          <Float key={m.label} speed={1.4} rotationIntensity={0.1} floatIntensity={0.4}>
            {slab}
          </Float>
        );
      })}
    </group>
  );
}

export default function StackHero() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, -3, 2]} intensity={0.6} color="#8b7cff" />
      <StackScene reduced={reduced} />
    </Canvas>
  );
}
