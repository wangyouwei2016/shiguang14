import { useState, useEffect } from 'react';

export type TaskStatus = 'idea' | 'focus' | 'today' | 'completed';

export interface Task {
  id: string;
  title: string;
  createdAt: number;
  status: TaskStatus;
  tags: string[];
  completedAt?: number;
  isHighlight?: boolean;
  highlightNote?: string;
}

export type TaskPatch = Partial<Pick<Task, 'title' | 'tags' | 'highlightNote' | 'isHighlight'>>;

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

  const addTask = (title: string, tags: string[] = []) => {
    const newTask: Task = {
      id: createTaskId(),
      title,
      createdAt: Date.now(),
      status: 'idea',
      tags,
    };
    setTasks(prev => [newTask, ...prev]);
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

  const updateTask = (id: string, patch: TaskPatch) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) {
        return task;
      }
      return { ...task, ...patch };
    }));
  };

  return { tasks, addTask, updateTask, updateTaskStatus, toggleHighlight, deleteTask, isLoaded, loadError, saveError };
}
