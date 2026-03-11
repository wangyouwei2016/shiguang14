import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

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
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

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

async function ensureTasksFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(TASKS_FILE);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    await fs.writeFile(TASKS_FILE, '[]\n', 'utf8');
  }
}

async function readTasks(): Promise<Task[]> {
  await ensureTasksFile();
  const content = await fs.readFile(TASKS_FILE, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseTasks(parsed);
}

async function writeTasks(tasks: Task[]): Promise<void> {
  await ensureTasksFile();
  const tempFile = `${TASKS_FILE}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, TASKS_FILE);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const tasks = await readTasks();
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Failed to read tasks file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { tasks?: unknown };
    const tasks = parseTasks(payload.tasks);
    await writeTasks(tasks);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write tasks file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
