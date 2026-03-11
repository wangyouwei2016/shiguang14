import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_USER_COOKIE_NAME, AuthConfig, MultiAuthConfig, readAuthConfig } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TaskStatus = 'idea' | 'focus' | 'today' | 'completed';
type IdeaRealm = 'lingsi' | 'duyu';

interface Task {
  id: string;
  title: string;
  createdAt: number;
  status: TaskStatus;
  tags: string[];
  completedAt?: number;
  isHighlight?: boolean;
  highlightNote?: string;
  sourceGoalId?: string;
  ideaRealm?: IdeaRealm;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEGACY_TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const USERS_DIR = path.join(DATA_DIR, 'users');
const TASKS_FILENAME = 'tasks.json';

type TasksFileSelection =
  | { ok: true; filePath: string }
  | { ok: false; response: NextResponse };

function toUserDir(username: string): string {
  return path.join(USERS_DIR, encodeURIComponent(username));
}

function toUserTasksFile(username: string): string {
  return path.join(toUserDir(username), TASKS_FILENAME);
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

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === 'idea' || value === 'focus' || value === 'today' || value === 'completed';
}

function isIdeaRealm(value: unknown): value is IdeaRealm {
  return value === 'lingsi' || value === 'duyu';
}

function isNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const task = value as Partial<Task>;
  const validRequiredFields =
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.createdAt === 'number' &&
    isTaskStatus(task.status) &&
    Array.isArray(task.tags) &&
    task.tags.every((tag) => typeof tag === 'string');

  if (!validRequiredFields) {
    return false;
  }

  const validOptionalFields =
    (task.completedAt === undefined || typeof task.completedAt === 'number') &&
    (task.isHighlight === undefined || typeof task.isHighlight === 'boolean') &&
    (task.highlightNote === undefined || typeof task.highlightNote === 'string') &&
    (task.sourceGoalId === undefined || typeof task.sourceGoalId === 'string') &&
    (task.ideaRealm === undefined || isIdeaRealm(task.ideaRealm));

  return validOptionalFields;
}

function parseTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) {
    throw new Error('Invalid payload: tasks must be an array');
  }
  if (!value.every((item) => isTask(item))) {
    throw new Error('Invalid payload: task schema mismatch');
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

async function migrateLegacyTasksFile(config: MultiAuthConfig, username: string, tasksFile: string): Promise<void> {
  if (username !== getFirstUsername(config)) {
    return;
  }
  if (await fileExists(tasksFile)) {
    return;
  }
  if (!(await fileExists(LEGACY_TASKS_FILE))) {
    return;
  }
  await fs.mkdir(path.dirname(tasksFile), { recursive: true });
  try {
    await fs.rename(LEGACY_TASKS_FILE, tasksFile);
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }
    throw error;
  }
}

async function ensureTasksFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  if (await fileExists(filePath)) {
    return;
  }
  await fs.writeFile(filePath, '[]\n', 'utf8');
}

async function getTasksFileSelection(): Promise<TasksFileSelection> {
  const config = readAuthConfig();
  if (config.mode === 'single') {
    await ensureTasksFile(LEGACY_TASKS_FILE);
    return { ok: true, filePath: LEGACY_TASKS_FILE };
  }

  const username = await getAuthenticatedUsername(config);
  if (!username) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!config.users.has(username)) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const userTasksFile = toUserTasksFile(username);
  await migrateLegacyTasksFile(config, username, userTasksFile);
  await ensureTasksFile(userTasksFile);
  return { ok: true, filePath: userTasksFile };
}

async function readTasks(tasksFile: string): Promise<Task[]> {
  const content = await fs.readFile(tasksFile, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseTasks(parsed);
}

async function writeTasks(tasksFile: string, tasks: Task[]): Promise<void> {
  const tempFile = `${tasksFile}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, tasksFile);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const selection = await getTasksFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const tasks = await readTasks(selection.filePath);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Failed to read tasks file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const selection = await getTasksFileSelection();
    if (!selection.ok) {
      return selection.response;
    }
    const payload = (await request.json()) as { tasks?: unknown };
    const tasks = parseTasks(payload.tasks);
    await writeTasks(selection.filePath, tasks);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write tasks file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
