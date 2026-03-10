import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

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
const FOCUS_CYCLE_FILE = path.join(DATA_DIR, 'focus-cycle.json');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

async function ensureFocusCycleFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FOCUS_CYCLE_FILE);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    const initialData: FocusCycleState = { activeWindow: null, reviews: [] };
    await fs.writeFile(FOCUS_CYCLE_FILE, `${JSON.stringify(initialData, null, 2)}\n`, 'utf8');
  }
}

async function readFocusCycle(): Promise<FocusCycleState> {
  await ensureFocusCycleFile();
  const content = await fs.readFile(FOCUS_CYCLE_FILE, 'utf8');
  const parsed = JSON.parse(content) as unknown;
  return parseFocusCycle(parsed);
}

async function writeFocusCycle(focusCycle: FocusCycleState): Promise<void> {
  await ensureFocusCycleFile();
  const tempFile = `${FOCUS_CYCLE_FILE}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(focusCycle, null, 2)}\n`, 'utf8');
  await fs.rename(tempFile, FOCUS_CYCLE_FILE);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    const focusCycle = await readFocusCycle();
    return NextResponse.json({ focusCycle }, { status: 200 });
  } catch (error) {
    console.error('Failed to read focus cycle file:', error);
    return NextResponse.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { focusCycle?: unknown };
    const focusCycle = parseFocusCycle(payload.focusCycle);
    await writeFocusCycle(focusCycle);
    return NextResponse.json({ focusCycle }, { status: 200 });
  } catch (error) {
    const message = toErrorMessage(error);
    const status = message.startsWith('Invalid payload') || error instanceof SyntaxError ? 400 : 500;
    console.error('Failed to write focus cycle file:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
