import { describe, expect, it } from 'vitest';
import { afterRightPin, afterWrongTry, createPinRecord, freshState, verifyPin } from './pin';

describe('pin', () => {
  it('hashes with a random salt and verifies', async () => {
    const a = await createPinRecord('1234', 1000);
    const b = await createPinRecord('1234', 1000);
    expect(a.salt).not.toBe(b.salt);
    expect(await verifyPin('1234', a, 1000)).toBe(true);
    expect(await verifyPin('1235', a, 1000)).toBe(false);
  });

  it('rejects non 4-digit PINs', async () => {
    await expect(createPinRecord('12a4')).rejects.toThrow();
    await expect(createPinRecord('12345')).rejects.toThrow();
  });

  it('locks out for 30 s after 5 wrong tries, doubling each time', () => {
    let s = freshState();
    for (let i = 0; i < 4; i++) s = afterWrongTry(s, 0);
    expect(s).toMatchObject({ fails: 4, lockedUntil: 0 });
    s = afterWrongTry(s, 1000);
    expect(s).toMatchObject({ fails: 0, lockouts: 1, lockedUntil: 31_000 });
    for (let i = 0; i < 5; i++) s = afterWrongTry(s, 100_000);
    expect(s).toMatchObject({ lockouts: 2, lockedUntil: 160_000 });
    expect(afterRightPin()).toEqual(freshState());
  });
});
