import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

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
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');

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

async function ensureGoalsFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(GOALS_FILE);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    await fs.writeFile(GOALS_FILE, '[]\n', 'utf8');
  }
}

async function readGoals(): Promise<Goal[]> {
  await ensureGoalsFile();
  const content = await fs.readFile(GOALS_FILE, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseGoals(parsed);
}

async function writeGoals(goals: Goal[]): Promise<void> {
  await ensureGoalsFile();
  const tempFile = `${GOALS_FILE}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(goals, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, GOALS_FILE);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const goals = await readGoals();
    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    console.error('Failed to read goals file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { goals?: unknown };
    const goals = parseGoals(payload.goals);
    await writeGoals(goals);
    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write goals file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
