import bcrypt from 'bcryptjs';

describe('Auth Security Module', () => {
  test('Password hashing produces secure hash different from plaintext', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toEqual(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});
