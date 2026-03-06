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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shiguang14_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Default tasks for demonstration
      setTasks([
        { id: '1', title: '阅读《设计心理学》前三章', createdAt: Date.now() - 100000, status: 'today', tags: ['阅读'] },
        { id: '2', title: '整理上周的灵感笔记', createdAt: Date.now() - 200000, status: 'focus', tags: ['复盘'] },
        { id: '3', title: '学习 Next.js App Router', createdAt: Date.now() - 300000, status: 'idea', tags: ['编程'] },
        { id: '4', title: '完成拾光14的UI设计', createdAt: Date.now() - 400000, status: 'completed', completedAt: Date.now() - 50000, tags: ['设计'], isHighlight: true, highlightNote: '极简风格很有挑战，但最终效果很满意！' },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shiguang14_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (title: string, tags: string[] = []) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
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

  return { tasks, addTask, updateTaskStatus, toggleHighlight, deleteTask, isLoaded };
}
