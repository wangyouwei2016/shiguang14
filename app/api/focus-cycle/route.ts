import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_USER_COOKIE_NAME, AuthConfig, MultiAuthConfig, readAuthConfig } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface FocusWindow {
  startDate: string;
  endDate: string;
}

interface FocusReview {
  id: string;
  startDate: string;
  endDate: string;
  summary: string;
  completedTaskIds: string[];
  completedTaskTitles: string[];
  createdAt: number;
}

interface FocusCycleState {
  activeWindow: FocusWindow | null;
  reviews: FocusReview[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEGACY_FOCUS_CYCLE_FILE = path.join(DATA_DIR, 'focus-cycle.json');
const USERS_DIR = path.join(DATA_DIR, 'users');
const FOCUS_CYCLE_FILENAME = 'focus-cycle.json';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type FocusCycleFileSelection =
  | { ok: true; filePath: string }
  | { ok: false; response: NextResponse };

function toUserDir(username: string): string {
  return path.join(USERS_DIR, encodeURIComponent(username));
}

function toUserFocusCycleFile(username: string): string {
  return path.join(toUserDir(username), FOCUS_CYCLE_FILENAME);
}

function getFirstUsername(config: MultiAuthConfig): string {
  return config.orderedUsernames[0];
}

async function getAuthenticatedUsername(config: AuthConfig): Promise<string | null> {
  if (config.mode === 'single') {
    return null;
  }
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_USER_COOKIE_NAME)?.value ?? null;
}

const INITIAL_FOCUS_CYCLE: FocusCycleState = { activeWindow: null, reviews: [] };

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && DATE_PATTERN.test(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isFocusWindow(value: unknown): value is FocusWindow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const windowValue = value as Partial<FocusWindow>;
  return isDateString(windowValue.startDate) && isDateString(windowValue.endDate);
}

function isFocusReview(value: unknown): value is FocusReview {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const review = value as Partial<FocusReview>;
  return (
    typeof review.id === 'string' &&
    isDateString(review.startDate) &&
    isDateString(review.endDate) &&
    typeof review.summary === 'string' &&
    isStringArray(review.completedTaskIds) &&
    isStringArray(review.completedTaskTitles) &&
    typeof review.createdAt === 'number'
  );
}

function parseFocusCycle(value: unknown): FocusCycleState {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Invalid payload: focusCycle must be an object');
  }
  const cycle = value as Partial<FocusCycleState>;
  const validWindow = cycle.activeWindow === null || isFocusWindow(cycle.activeWindow);
  const validReviews = Array.isArray(cycle.reviews) && cycle.reviews.every((item) => isFocusReview(item));
  if (!validWindow || !validReviews) {
    throw new Error('Invalid payload: focusCycle schema mismatch');
  }
  const reviews = cycle.reviews as FocusReview[];
  return {
    activeWindow: cycle.activeWindow ?? null,
    reviews,
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    return false;
  }
}

async function migrateLegacyFocusCycleFile(
  config: MultiAuthConfig,
  username: string,
  focusCycleFile: string,
): Promise<void> {
  if (username !== getFirstUsername(config)) {
    return;
  }
  if (await fileExists(focusCycleFile)) {
    return;
  }
  if (!(await fileExists(LEGACY_FOCUS_CYCLE_FILE))) {
    return;
  }
  await fs.mkdir(path.dirname(focusCycleFile), { recursive: true });
  try {
    await fs.rename(LEGACY_FOCUS_CYCLE_FILE, focusCycleFile);
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

async function ensureFocusCycleFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (await fileExists(filePath)) {
    return;
  }
  await fs.writeFile(filePath, `${JSON.stringify(INITIAL_FOCUS_CYCLE, null, 2)}\n`, 'utf8');
}

async function getFocusCycleFileSelection(): Promise<FocusCycleFileSelection> {
  const config = readAuthConfig();
  if (config.mode === 'single') {
    await ensureFocusCycleFile(LEGACY_FOCUS_CYCLE_FILE);
    return { ok: true, filePath: LEGACY_FOCUS_CYCLE_FILE };
  }

  const username = await getAuthenticatedUsername(config);
  if (!username) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!config.users.has(username)) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userFocusCycleFile = toUserFocusCycleFile(username);
  await migrateLegacyFocusCycleFile(config, username, userFocusCycleFile);
  await ensureFocusCycleFile(userFocusCycleFile);
  return { ok: true, filePath: userFocusCycleFile };
}

async function readFocusCycle(focusCycleFile: string): Promise<FocusCycleState> {
  const content = await fs.readFile(focusCycleFile, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseFocusCycle(parsed);
}

async function writeFocusCycle(focusCycleFile: string, focusCycle: FocusCycleState): Promise<void> {
  const tempFile = `${focusCycleFile}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(focusCycle, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, focusCycleFile);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const selection = await getFocusCycleFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const focusCycle = await readFocusCycle(selection.filePath);
    return NextResponse.json({ focusCycle }, { status: 200 });
  } catch (error) {
    console.error('Failed to read focus cycle file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const selection = await getFocusCycleFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const payload = (await request.json()) as { focusCycle?: unknown };
    const focusCycle = parseFocusCycle(payload.focusCycle);
    await writeFocusCycle(selection.filePath, focusCycle);
    return NextResponse.json({ focusCycle }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write focus cycle file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
