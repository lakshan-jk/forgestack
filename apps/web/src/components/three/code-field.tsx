'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Real tokens from the ForgeStack repo — module names, API routes, functions,
 * and file paths. Deliberately calm: tokens sit still (no flying motion), faint,
 * with only a whisper of pointer parallax, so it reads as ambient texture that
 * never competes with the content in front of it.
 */
const TOKENS = [
  'fastify',
  'mongodb',
  'redis',
  'bullmq',
  'jwt',
  'qdrant',
  'ollama',
  'rag',
  'POST /api/generate',
  'POST /rag/query',
  'resolveModules()',
  'generateProject()',
  'src/server.ts',
  'modules/rag/rag.route.ts',
  'docker-compose.yml',
  'z.object({ ... })',
  'await app.listen()',
  'dependsOn: [...]',
  '$vectorSearch',
  'ForgeStack',
];

const ACCENT = '#8b7cff';
const GREEN = '#3fd07f';
const BLUE = '#5aa2ff';
const FG = '#aab0bd';

function colorFor(token: string): string {
  if (/^(POST|GET|pnpm|docker|await|const|export)/.test(token)) return GREEN;
  if (/(\.ts|\.yml|\/)/.test(token) && !/^(POST|GET)/.test(token)) return BLUE;
  if (/^[a-z-]+$|ForgeStack/.test(token)) return ACCENT;
  return FG;
}

interface Item {
  token: string;
  x: number;
  y: number;
  z: number;
  color: string;
  opacity: number;
}

/** Fainter the further back it sits — gives depth without motion. */
function opacityForDepth(z: number): number {
  const t = Math.max(0, Math.min(1, (z + 16) / 15)); // -16 (far) → -1 (near)
  return (0.14 + t * 0.16) * 1; // ~0.14 far, ~0.3 near
}

function buildItems(count: number): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < count; i += 1) {
    const token = TOKENS[i % TOKENS.length]!;
    const z = -Math.random() * 15 - 1;
    items.push({
      token,
      x: (Math.random() - 0.5) * 18,
      y: (Math.random() - 0.5) * 11,
      z,
      color: colorFor(token),
      opacity: opacityForDepth(z),
    });
  }
  return items;
}

function CodeField({ reduced }: { reduced: boolean }) {
  const items = useMemo(() => buildItems(reduced ? 16 : 22), [reduced]);
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    const drift = Math.sin(state.clock.elapsedTime * 0.04) * 0.04;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      state.pointer.x * 0.06 + drift,
      1.6,
      delta,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      -state.pointer.y * 0.04,
      1.6,
      delta,
    );
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i} position={[it.x, it.y, it.z]}>
          <Html center distanceFactor={13} style={{ pointerEvents: 'none' }} zIndexRange={[0, 0]}>
            <span
              style={{
                fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
                fontSize: 13,
                fontWeight: 500,
                color: it.color,
                opacity: it.opacity,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {it.token}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

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

export default function CodeBackgroundScene() {
  const reduced = usePrefersReducedMotion();
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <CodeField reduced={reduced} />
    </Canvas>
  );
}
