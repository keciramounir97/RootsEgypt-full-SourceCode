import { shouldCreateSeedUser } from './seed-policy';

describe('seed policy', () => {
  it('creates a seed account only when the account is missing', () => {
    expect(shouldCreateSeedUser(undefined)).toBe(true);
    expect(shouldCreateSeedUser(null)).toBe(true);
    expect(shouldCreateSeedUser({ id: 1 })).toBe(false);
  });
});
