'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, CalendarDays, Sun, History, Plus, Hash } from 'lucide-react';
import { useTasks, TaskStatus } from '@/lib/useTasks';

// Components
import Sidebar from '@/components/Sidebar';
import QuickCapture from '@/components/QuickCapture';
import IdeaPool from '@/components/IdeaPool';
import Focus14 from '@/components/Focus14';
import TodaysDesk from '@/components/TodaysDesk';
import TimeFootprints from '@/components/TimeFootprints';

export type ViewType = 'today' | 'focus' | 'idea' | 'history';

export default function App() {
  const { tasks, addTask, updateTaskStatus, toggleHighlight, deleteTask, isLoaded } = useTasks();
  const [currentView, setCurrentView] = useState<ViewType>('today');

  if (!isLoaded) return null;

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
                  <TodaysDesk tasks={tasks} updateTaskStatus={updateTaskStatus} />
                )}
                {currentView === 'focus' && (
                  <Focus14 tasks={tasks} updateTaskStatus={updateTaskStatus} />
                )}
                {currentView === 'idea' && (
                  <IdeaPool tasks={tasks} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} />
                )}
                {currentView === 'history' && (
                  <TimeFootprints tasks={tasks} toggleHighlight={toggleHighlight} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
