const AUTH_COOKIE_NAME = 'shiguang14_auth';
const AUTH_USER_COOKIE_NAME = 'shiguang14_user';
const PASSWORD_ENV_NAME = 'APP_LOGIN_PASSWORD';
const USERS_ENV_NAME = 'APP_LOGIN_USERS';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const HASH_ALGORITHM = 'SHA-256';

export type AuthMode = 'single' | 'multi';

export interface SingleAuthConfig {
  mode: 'single';
  password: string;
}

export interface MultiAuthConfig {
  mode: 'multi';
  users: Map<string, string>;
  orderedUsernames: readonly string[];
}

export type AuthConfig = SingleAuthConfig | MultiAuthConfig;

function parseUsersEnv(rawValue: string): { users: Map<string, string>; orderedUsernames: string[] } {
  const entries = rawValue.split(',').map((entry) => entry.trim());
  if (entries.length === 0 || entries.some((entry) => entry.length === 0)) {
    throw new Error(`Invalid ${USERS_ENV_NAME}: expected "username:password,username:password"`);
  }

  const users = new Map<string, string>();
  const orderedUsernames: string[] = [];

  for (const entry of entries) {
    const parts = entry.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid ${USERS_ENV_NAME}: each entry must be "username:password"`);
    }
    const username = parts[0].trim();
    const password = parts[1];
    if (!username || !password) {
      throw new Error(`Invalid ${USERS_ENV_NAME}: username and password must be non-empty`);
    }
    if (users.has(username)) {
      throw new Error(`Invalid ${USERS_ENV_NAME}: duplicate username "${username}"`);
    }
    users.set(username, password);
    orderedUsernames.push(username);
  }

  return { users, orderedUsernames };
}

export function readAuthConfig(): AuthConfig {
  const usersRaw = process.env[USERS_ENV_NAME];
  const passwordRaw = process.env[PASSWORD_ENV_NAME];

  if (usersRaw && passwordRaw) {
    throw new Error(`Configuration error: ${USERS_ENV_NAME} and ${PASSWORD_ENV_NAME} cannot both be set`);
  }
  if (usersRaw) {
    const { users, orderedUsernames } = parseUsersEnv(usersRaw);
    if (orderedUsernames.length === 0) {
      throw new Error(`Invalid ${USERS_ENV_NAME}: at least one user is required`);
    }
    return { mode: 'multi', users, orderedUsernames };
  }
  if (passwordRaw) {
    return { mode: 'single', password: passwordRaw };
  }

  throw new Error(`Missing required environment variable: ${USERS_ENV_NAME} or ${PASSWORD_ENV_NAME}`);
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

export async function createSingleAuthToken(password: string): Promise<string> {
  return hashString(password);
}

export async function createMultiUserAuthToken(username: string, password: string): Promise<string> {
  return hashString(`${username}\u0000${password}`);
}

export {
  AUTH_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  PASSWORD_ENV_NAME,
  USERS_ENV_NAME,
};
