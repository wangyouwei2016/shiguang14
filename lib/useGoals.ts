import { useEffect, useState } from 'react';

export type GoalTerm = 'long' | 'mid' | 'short';

export interface Goal {
  id: string;
  title: string;
  note: string;
  term: GoalTerm;
  createdAt: number;
  updatedAt: number;
}

export type GoalPatch = Partial<Pick<Goal, 'title' | 'note' | 'term'>>;

interface GoalsResponse {
  goals?: Goal[];
  error?: string;
}

export const GOAL_TERM_LABELS: Record<GoalTerm, string> = {
  long: '长期目标',
  mid: '中期目标',
  short: '短期目标',
};

const GOALS_ENDPOINT = '/api/goals';
const ID_RADIX = 36;
const ID_START_INDEX = 2;
const ID_END_INDEX = 9;

function createGoalId(): string {
  return Math.random().toString(ID_RADIX).substring(ID_START_INDEX, ID_END_INDEX);
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

async function loadGoalsFromServer(): Promise<Goal[]> {
  const response = await fetch(GOALS_ENDPOINT, { method: 'GET', cache: 'no-store' });
  const payload = (await response.json()) as GoalsResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to load goals');
  }
  if (!Array.isArray(payload.goals)) {
    throw new Error('Invalid goals payload');
  }
  return payload.goals;
}

async function saveGoalsToServer(goals: Goal[], signal: AbortSignal): Promise<void> {
  const response = await fetch(GOALS_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goals }),
    signal,
  });
  if (response.ok) {
    return;
  }
  const payload = (await response.json()) as GoalsResponse;
  throw new Error(payload.error ?? 'Failed to save goals');
}

function createGoal(title: string, note: string, term: GoalTerm): Goal {
  const now = Date.now();
  return {
    id: createGoalId(),
    title,
    note,
    term,
    createdAt: now,
    updatedAt: now,
  };
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    loadGoalsFromServer()
      .then((loadedGoals) => {
        if (!isActive) {
          return;
        }
        setGoals(loadedGoals);
        setLoadError(null);
        setIsLoaded(true);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error('Failed to load goals:', error);
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
    saveGoalsToServer(goals, controller.signal)
      .then(() => {
        setSaveError(null);
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }
        console.error('Failed to save goals:', error);
        setSaveError(toErrorMessage(error));
      });
    return () => {
      controller.abort();
    };
  }, [goals, isLoaded, loadError]);

  const addGoal = (title: string, note: string, term: GoalTerm) => {
    setGoals((prev) => [createGoal(title, note, term), ...prev]);
  };

  const updateGoal = (id: string, patch: GoalPatch) => {
    setGoals((prev) => prev.map((goal) => {
      if (goal.id !== id) {
        return goal;
      }
      return { ...goal, ...patch, updatedAt: Date.now() };
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return { goals, addGoal, updateGoal, deleteGoal, isLoaded, loadError, saveError };
}
