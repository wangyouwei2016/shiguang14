'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks, TaskPatch } from '@/lib/useTasks';
import { useGoals, Goal, GoalPatch, GOAL_TERM_LABELS } from '@/lib/useGoals';
import { useFocusCycle } from '@/lib/useFocusCycle';

// Components
import Sidebar from '@/components/Sidebar';
import QuickCapture from '@/components/QuickCapture';
import IdeaPool from '@/components/IdeaPool';
import Focus14 from '@/components/Focus14';
import TodaysDesk from '@/components/TodaysDesk';
import TimeFootprints from '@/components/TimeFootprints';

export type ViewType = 'today' | 'focus' | 'idea' | 'history';

export default function App() {
  const { tasks, addTask, updateTask, updateTaskStatus, updateTasksByGoalId, toggleHighlight, deleteTask, deleteTasksByGoalId, isLoaded, loadError, saveError } = useTasks();
  const { goals, addGoal, updateGoal, deleteGoal, isLoaded: isGoalsLoaded, loadError: goalsLoadError, saveError: goalsSaveError } = useGoals();
  const { focusCycle, beginWindow, completeActiveWindow, updateReview, isLoaded: isCycleLoaded, loadError: cycleLoadError, saveError: cycleSaveError } = useFocusCycle();
  const [currentView, setCurrentView] = useState<ViewType>('today');

  if (!isLoaded || !isGoalsLoaded || !isCycleLoaded) return null;

  const fatalError = loadError ?? goalsLoadError ?? cycleLoadError;
  if (fatalError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F5F3EF] text-[#3A3731]">
        <div className="max-w-xl text-center space-y-3 px-6">
          <h2 className="font-serif text-2xl">任务数据加载失败</h2>
          <p className="text-[#7A7772] text-sm leading-relaxed break-words">{fatalError}</p>
        </div>
      </div>
    );
  }

  const persistError = saveError ?? goalsSaveError ?? cycleSaveError;

  const handleAddGoalToFocus = (goal: Goal) => {
    const hasActiveTask = tasks.some((task) => task.sourceGoalId === goal.id && task.status !== 'completed');
    if (hasActiveTask) {
      return;
    }
    addTask(goal.title, [GOAL_TERM_LABELS[goal.term]], { status: 'focus', sourceGoalId: goal.id });
  };

  const handleUpdateGoal = (goalId: string, patch: GoalPatch) => {
    updateGoal(goalId, patch);
    const taskPatch: TaskPatch = {};
    if (patch.title !== undefined) {
      taskPatch.title = patch.title;
    }
    if (patch.term !== undefined) {
      taskPatch.tags = [GOAL_TERM_LABELS[patch.term]];
    }
    if (taskPatch.title !== undefined || taskPatch.tags !== undefined) {
      updateTasksByGoalId(goalId, taskPatch);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
    deleteTasksByGoalId(goalId);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F3EF] relative">
      {/* Subtle radial gradient for wabi-sabi depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#FFFFFF_0%,_transparent_60%)] opacity-40 pointer-events-none"></div>

      {/* Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-white/30">
        {/* Grid Background Overlay */}
        <div className="absolute inset-0 bg-wabi-grid opacity-60 pointer-events-none"></div>
        
        {/* Global Quick Capture */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-6">
          <QuickCapture onAdd={addTask} />
        </div>

        {persistError && (
          <div className="absolute top-24 right-6 z-50 rounded-md border border-red-300 bg-red-50/95 px-4 py-2 text-xs text-red-700">
            保存失败：{persistError}
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-y-auto pt-32 pb-16 px-6 lg:px-16">
          <div className="max-w-4xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {currentView === 'today' && (
                  <TodaysDesk
                    tasks={tasks}
                    updateTask={updateTask}
                    updateTaskStatus={updateTaskStatus}
                    deleteTask={deleteTask}
                  />
                )}
                {currentView === 'focus' && (
                  <Focus14
                    tasks={tasks}
                    activeWindow={focusCycle.activeWindow}
                    beginWindow={beginWindow}
                    completeActiveWindow={completeActiveWindow}
                    cycleSaveError={cycleSaveError}
                    updateTaskStatus={updateTaskStatus}
                  />
                )}
                {currentView === 'idea' && (
                  <IdeaPool
                    tasks={tasks}
                    goals={goals}
                    addGoal={addGoal}
                    addGoalToFocus={handleAddGoalToFocus}
                    updateGoal={handleUpdateGoal}
                    updateTask={updateTask}
                    updateTaskStatus={updateTaskStatus}
                    deleteTask={deleteTask}
                    deleteGoal={handleDeleteGoal}
                    goalsSaveError={goalsSaveError}
                  />
                )}
                {currentView === 'history' && (
                  <TimeFootprints
                    tasks={tasks}
                    focusReviews={focusCycle.reviews}
                    updateFocusReview={updateReview}
                    updateTask={updateTask}
                    toggleHighlight={toggleHighlight}
                    deleteTask={deleteTask}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
