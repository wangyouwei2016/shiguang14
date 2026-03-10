import { useEffect, useState } from 'react';

export const FOCUS_WINDOW_DAYS = 14;

export interface FocusWindow {
  startDate: string;
  endDate: string;
}

export interface FocusReview {
  id: string;
  startDate: string;
  endDate: string;
  summary: string;
  completedTaskIds: string[];
  completedTaskTitles: string[];
  createdAt: number;
}

export interface FocusCycleState {
  activeWindow: FocusWindow | null;
  reviews: FocusReview[];
}

export interface CompleteFocusWindowInput {
  summary: string;
  completedTaskIds: string[];
  completedTaskTitles: string[];
}

export interface UpdateFocusReviewInput {
  summary: string;
  completedTaskIds: string[];
  completedTaskTitles: string[];
}

interface FocusCycleResponse {
  focusCycle?: FocusCycleState;
  error?: string;
}

const FOCUS_CYCLE_ENDPOINT = '/api/focus-cycle';
const ID_RADIX = 36;
const ID_START_INDEX = 2;
const ID_END_INDEX = 9;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function createReviewId(): string {
  return Math.random().toString(ID_RADIX).substring(ID_START_INDEX, ID_END_INDEX);
}

function toDateInputValue(date: Date): string {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day + days);
  return toDateInputValue(nextDate);
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

function isFocusCycleState(value: unknown): value is FocusCycleState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const state = value as Partial<FocusCycleState>;
  const activeWindowValid = state.activeWindow === null || isFocusWindow(state.activeWindow);
  return activeWindowValid && Array.isArray(state.reviews) && state.reviews.every((item) => isFocusReview(item));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function loadFocusCycleFromServer(): Promise<FocusCycleState> {
  const response = await fetch(FOCUS_CYCLE_ENDPOINT, { method: 'GET', cache: 'no-store' });
  const payload = (await response.json()) as FocusCycleResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to load focus cycle');
  }
  if (!isFocusCycleState(payload.focusCycle)) {
    throw new Error('Invalid focus cycle payload');
  }
  return payload.focusCycle;
}

async function saveFocusCycleToServer(focusCycle: FocusCycleState, signal: AbortSignal): Promise<void> {
  const response = await fetch(FOCUS_CYCLE_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ focusCycle }),
    signal,
  });
  if (response.ok) {
    return;
  }
  const payload = (await response.json()) as FocusCycleResponse;
  throw new Error(payload.error ?? 'Failed to save focus cycle');
}

export function useFocusCycle() {
  const [focusCycle, setFocusCycle] = useState<FocusCycleState>({ activeWindow: null, reviews: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    loadFocusCycleFromServer()
      .then((serverCycle) => {
        if (!isActive) {
          return;
        }
        setFocusCycle(serverCycle);
        setLoadError(null);
        setIsLoaded(true);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error('Failed to load focus cycle:', error);
        setLoadError(toErrorMessage(error));
        setIsLoaded(true);
      });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || loadError !== null) {
      return;
    }
    const controller = new AbortController();
    saveFocusCycleToServer(focusCycle, controller.signal)
      .then(() => {
        setSaveError(null);
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }
        console.error('Failed to save focus cycle:', error);
        setSaveError(toErrorMessage(error));
      });
    return () => {
      controller.abort();
    };
  }, [focusCycle, isLoaded, loadError]);

  const beginWindow = (startDate: string) => {
    const endDate = addDays(startDate, FOCUS_WINDOW_DAYS - 1);
    setFocusCycle((prev) => ({ ...prev, activeWindow: { startDate, endDate } }));
  };

  const completeActiveWindow = (input: CompleteFocusWindowInput) => {
    setFocusCycle((prev) => {
      if (prev.activeWindow === null) {
        return prev;
      }
      const review: FocusReview = {
        id: createReviewId(),
        startDate: prev.activeWindow.startDate,
        endDate: prev.activeWindow.endDate,
        summary: input.summary,
        completedTaskIds: input.completedTaskIds,
        completedTaskTitles: input.completedTaskTitles,
        createdAt: Date.now(),
      };
      return { activeWindow: null, reviews: [review, ...prev.reviews] };
    });
  };

  const updateReview = (reviewId: string, input: UpdateFocusReviewInput) => {
    setFocusCycle((prev) => ({
      ...prev,
      reviews: prev.reviews.map((review) => {
        if (review.id !== reviewId) {
          return review;
        }
        return {
          ...review,
          summary: input.summary,
          completedTaskIds: input.completedTaskIds,
          completedTaskTitles: input.completedTaskTitles,
        };
      }),
    }));
  };

  return {
    focusCycle,
    beginWindow,
    completeActiveWindow,
    updateReview,
    isLoaded,
    loadError,
    saveError,
  };
}
