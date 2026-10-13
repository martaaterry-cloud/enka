// Invalidate callbacks immediately when Auth changes, before React renders.
let userId: string | null = null;
let generation = 0;
export function setAuthIdentity(next: string | null) {
  if (next !== userId) { userId = next; generation += 1; }
}
export function captureAuthIdentity(expected: string) {
  const captured = generation;
  return () => userId === expected && generation === captured;
}

export function authIdentityGeneration() { return generation; }
