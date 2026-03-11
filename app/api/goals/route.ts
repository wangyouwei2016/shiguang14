import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_USER_COOKIE_NAME, AuthConfig, MultiAuthConfig, readAuthConfig } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GoalTerm = 'long' | 'mid' | 'short';

interface Goal {
  id: string;
  title: string;
  note: string;
  term: GoalTerm;
  createdAt: number;
  updatedAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEGACY_GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const USERS_DIR = path.join(DATA_DIR, 'users');
const GOALS_FILENAME = 'goals.json';

type GoalsFileSelection =
  | { ok: true; filePath: string }
  | { ok: false; response: NextResponse };

function toUserDir(username: string): string {
  return path.join(USERS_DIR, encodeURIComponent(username));
}

function toUserGoalsFile(username: string): string {
  return path.join(toUserDir(username), GOALS_FILENAME);
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

function isGoalTerm(value: unknown): value is GoalTerm {
  return value === 'long' || value === 'mid' || value === 'short';
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isGoal(value: unknown): value is Goal {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const goal = value as Partial<Goal>;
  return (
    typeof goal.id === 'string' &&
    typeof goal.title === 'string' &&
    typeof goal.note === 'string' &&
    isGoalTerm(goal.term) &&
    typeof goal.createdAt === 'number' &&
    typeof goal.updatedAt === 'number'
  );
}

function parseGoals(value: unknown): Goal[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid payload: goals must be an array');
  }
  if (!value.every((item) => isGoal(item))) {
    throw new Error('Invalid payload: goal schema mismatch');
  }
  return value;
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

async function migrateLegacyGoalsFile(config: MultiAuthConfig, username: string, goalsFile: string): Promise<void> {
  if (username !== getFirstUsername(config)) {
    return;
  }
  if (await fileExists(goalsFile)) {
    return;
  }
  if (!(await fileExists(LEGACY_GOALS_FILE))) {
    return;
  }
  await fs.mkdir(path.dirname(goalsFile), { recursive: true });
  try {
    await fs.rename(LEGACY_GOALS_FILE, goalsFile);
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

async function ensureGoalsFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (await fileExists(filePath)) {
    return;
  }
  await fs.writeFile(filePath, '[]\n', 'utf8');
}

async function getGoalsFileSelection(): Promise<GoalsFileSelection> {
  const config = readAuthConfig();
  if (config.mode === 'single') {
    await ensureGoalsFile(LEGACY_GOALS_FILE);
    return { ok: true, filePath: LEGACY_GOALS_FILE };
  }

  const username = await getAuthenticatedUsername(config);
  if (!username) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!config.users.has(username)) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userGoalsFile = toUserGoalsFile(username);
  await migrateLegacyGoalsFile(config, username, userGoalsFile);
  await ensureGoalsFile(userGoalsFile);
  return { ok: true, filePath: userGoalsFile };
}

async function readGoals(goalsFile: string): Promise<Goal[]> {
  const content = await fs.readFile(goalsFile, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseGoals(parsed);
}

async function writeGoals(goalsFile: string, goals: Goal[]): Promise<void> {
  const tempFile = `${goalsFile}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(goals, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, goalsFile);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const selection = await getGoalsFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const goals = await readGoals(selection.filePath);
    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Failed to read goals file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const selection = await getGoalsFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const payload = (await request.json()) as { goals?: unknown };
    const goals = parseGoals(payload.goals);
    await writeGoals(selection.filePath, goals);
    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write goals file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
