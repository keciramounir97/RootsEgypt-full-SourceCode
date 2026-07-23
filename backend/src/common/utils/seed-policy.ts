/** Seed only missing system accounts; never overwrite user-owned records at startup. */
export function shouldCreateSeedUser(existing: unknown): boolean {
  return !existing;
}
