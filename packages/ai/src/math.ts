/** Vector math shared by the in-memory store and any local ranking. */

export function dot(a: number[], b: number[]): number {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) sum += a[i]! * b[i]!;
  return sum;
}

export function magnitude(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

/** L2-normalise a vector. Returns a zero vector unchanged. */
export function normalize(v: number[]): number[] {
  const mag = magnitude(v);
  if (mag === 0) return v.slice();
  return v.map((x) => x / mag);
}

/** Cosine similarity; 0 when either vector has zero magnitude. */
export function cosineSimilarity(a: number[], b: number[]): number {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}
