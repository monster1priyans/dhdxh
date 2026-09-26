// PIN hashing: PBKDF2-SHA256, 150,000 iterations, 16-byte random salt (WebCrypto).
export const PIN_ITERATIONS = 150_000;
export const MAX_TRIES = 5;
export const BASE_LOCKOUT_MS = 30_000;
export const RESET_DELAY_MS = 24 * 60 * 60 * 1000;

export interface PinRecord { salt: string; hash: string }
export interface PinState {
  fails: number;            // wrong tries since the last lockout
  lockouts: number;         // lockouts in a row (each doubles the wait)
  lockedUntil: number;      // epoch ms, 0 when not locked out
  resetAt: number | null;   // "Forgot PIN": the PIN is removed at this time
}
export const freshState = (): PinState => ({ fails: 0, lockouts: 0, lockedUntil: 0, resetAt: null });

const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export const isValidPin = (pin: string) => /^[0-9]{4}$/.test(pin);

async function derive(pin: string, salt: Uint8Array, iterations = PIN_ITERATIONS): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function createPinRecord(pin: string, iterations = PIN_ITERATIONS): Promise<PinRecord> {
  if (!isValidPin(pin)) throw new Error('PIN must be 4 digits');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: b64(salt), hash: b64(await derive(pin, salt, iterations)) };
}

export async function verifyPin(pin: string, rec: PinRecord, iterations = PIN_ITERATIONS): Promise<boolean> {
  const got = await derive(pin, unb64(rec.salt), iterations);
  const want = unb64(rec.hash);
  if (got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i]; // constant time
  return diff === 0;
}

/** Applies one wrong try: after MAX_TRIES, lock out for 30 s, doubling each time. */
export function afterWrongTry(s: PinState, now: number): PinState {
  const fails = s.fails + 1;
  if (fails < MAX_TRIES) return { ...s, fails };
  const lockouts = s.lockouts + 1;
  return { ...s, fails: 0, lockouts, lockedUntil: now + BASE_LOCKOUT_MS * 2 ** (lockouts - 1) };
}

/** The right PIN clears tries, lockouts and any pending "Forgot PIN" reset. */
export const afterRightPin = (): PinState => freshState();
