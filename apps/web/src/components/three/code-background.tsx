'use client';

import dynamic from 'next/dynamic';

// Lazy, client-only — the three.js chunk loads after first paint on every page.
const CodeBackgroundScene = dynamic(() => import('./code-field'), { ssr: false });

/**
 * Fixed, app-wide 3D backdrop: a field of real ForgeStack code tokens drifting
 * through depth. Sits behind all content, ignores pointer events, and falls
 * back to the flat page background until it loads (or if WebGL is off).
 */
export function CodeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20" aria-hidden>
      <CodeBackgroundScene />
      {/* Scrim keeps the code faint and content readable everywhere. */}
      <div className="absolute inset-0 bg-[rgba(8,9,12,0.5)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_0%,rgba(8,9,12,0.85)_78%)]" />
    </div>
  );
}
