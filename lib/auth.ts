const AUTH_COOKIE_NAME = 'shiguang14_auth';
const PASSWORD_ENV_NAME = 'APP_LOGIN_PASSWORD';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const HASH_ALGORITHM = 'SHA-256';

function readPasswordFromEnv(): string {
  const password = process.env[PASSWORD_ENV_NAME];
  if (!password) {
    throw new Error(`Missing required environment variable: ${PASSWORD_ENV_NAME}`);
  }
  return password;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}

export async function hashString(value: string): Promise<string> {
  const encodedValue = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest(HASH_ALGORITHM, encodedValue);
  return toHex(digest);
}

export async function isPasswordValid(inputPassword: string): Promise<boolean> {
  return constantTimeEqual(inputPassword, readPasswordFromEnv());
}

export async function createExpectedAuthToken(): Promise<string> {
  return hashString(readPasswordFromEnv());
}

export {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  PASSWORD_ENV_NAME,
};
