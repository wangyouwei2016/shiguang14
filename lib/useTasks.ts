import { useState, useEffect } from 'react';

export type TaskStatus = 'idea' | 'focus' | 'today' | 'completed';

export type IdeaRealm = 'lingsi' | 'duyu';

export interface Task {
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

export type TaskPatch = Partial<Pick<Task, 'title' | 'tags' | 'highlightNote' | 'isHighlight' | 'ideaRealm'>>;

interface AddTaskOptions {
  status?: TaskStatus;
  sourceGoalId?: string;
  ideaRealm?: IdeaRealm;
}

interface TasksResponse {
  tasks?: Task[];
  error?: string;
}

const TASKS_ENDPOINT = '/api/tasks';
const ID_RADIX = 36;
const ID_START_INDEX = 2;
const ID_END_INDEX = 9;

function createTaskId(): string {
  return Math.random().toString(ID_RADIX).substring(ID_START_INDEX, ID_END_INDEX);
}

function buildTask(title: string, tags: string[], options: AddTaskOptions): Task {
  const status = options.status ?? 'idea';
  const ideaRealm = status === 'idea' ? (options.ideaRealm ?? 'lingsi') : undefined;
  const task: Task = {
    id: createTaskId(),
    title,
    createdAt: Date.now(),
    status,
    tags,
    sourceGoalId: options.sourceGoalId,
    ideaRealm,
  };
  if (status === 'completed') {
    task.completedAt = Date.now();
  }
  return task;
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

async function loadTasksFromServer(): Promise<Task[]> {
  const response = await fetch(TASKS_ENDPOINT, {
    method: 'GET',
    cache: 'no-store',
  });
  const payload = (await response.json()) as TasksResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? 'Failed to load tasks');
  }
  if (!Array.isArray(payload.tasks)) {
    throw new Error('Invalid tasks payload');
  }
  return payload.tasks;
}

async function saveTasksToServer(tasks: Task[], signal: AbortSignal): Promise<void> {
  const response = await fetch(TASKS_ENDPOINT, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
    signal,
  });

  if (response.ok) {
    return;
  }

  const payload = (await response.json()) as TasksResponse;
  throw new Error(payload.error ?? 'Failed to save tasks');
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    loadTasksFromServer()
      .then((loadedTasks) => {
        if (!isActive) {
          return;
        }
        setTasks(loadedTasks);
        setLoadError(null);
        setIsLoaded(true);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error('Failed to load tasks:', error);
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

    saveTasksToServer(tasks, controller.signal)
      .then(() => {
        setSaveError(null);
      })
      .catch((error) => {
        if (isAbortError(error)) {
          return;
        }
        console.error('Failed to save tasks:', error);
        setSaveError(toErrorMessage(error));
      });

    return () => {
      controller.abort();
    };
  }, [tasks, isLoaded, loadError]);

  const addTask = (title: string, tags: string[] = [], options: AddTaskOptions = {}) => {
    setTasks(prev => [buildTask(title, tags, options), ...prev]);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updates: Partial<Task> = { status };
        if (status === 'completed' && t.status !== 'completed') {
          updates.completedAt = Date.now();
        }
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const toggleHighlight = (id: string, note?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, isHighlight: !t.isHighlight, highlightNote: note !== undefined ? note : t.highlightNote } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteTasksByGoalId = (goalId: string) => {
    setTasks(prev => prev.filter(task => task.sourceGoalId !== goalId));
  };

  const updateTask = (id: string, patch: TaskPatch) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) {
        return task;
      }
      return { ...task, ...patch };
    }));
  };

  const updateTasksByGoalId = (goalId: string, patch: TaskPatch) => {
    setTasks(prev => prev.map(task => {
      if (task.sourceGoalId !== goalId) {
        return task;
      }
      return { ...task, ...patch };
    }));
  };

  return {
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    updateTasksByGoalId,
    toggleHighlight,
    deleteTask,
    deleteTasksByGoalId,
    isLoaded,
    loadError,
    saveError,
  };
}
