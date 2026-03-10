import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '@/lib/useTasks';
import { CompleteFocusWindowInput, FocusWindow, FOCUS_WINDOW_DAYS } from '@/lib/useFocusCycle';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCheck, Circle, Play, Sun } from 'lucide-react';
import FocusReviewModal from '@/components/FocusReviewModal';

interface Focus14Props {
  tasks: Task[];
  activeWindow: FocusWindow | null;
  beginWindow: (startDate: string) => void;
  completeActiveWindow: (input: CompleteFocusWindowInput) => void;
  cycleSaveError: string | null;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toDateInputValue(date: Date): string {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateString: string, days: number): string {
  if (!DATE_INPUT_PATTERN.test(dateString)) {
    return dateString;
  }
  const [year, month, day] = dateString.split('-').map(Number);
  const nextDate = new Date(year, month - 1, day + days);
  return toDateInputValue(nextDate);
}

function toRangeBoundary(dateString: string, isEndBoundary: boolean): number {
  const [year, month, day] = dateString.split('-').map(Number);
  if (isEndBoundary) {
    return new Date(year, month - 1, day + 1).getTime() - 1;
  }
  return new Date(year, month - 1, day).getTime();
}

function collectCompletedTasks(tasks: Task[], activeWindow: FocusWindow): Task[] {
  const startBoundary = toRangeBoundary(activeWindow.startDate, false);
  const endBoundary = toRangeBoundary(activeWindow.endDate, true);
  return tasks
    .filter(
      (task) =>
        task.status === 'completed' &&
        typeof task.completedAt === 'number' &&
        task.completedAt >= startBoundary &&
        task.completedAt <= endBoundary,
    )
    .sort((left, right) => (right.completedAt ?? 0) - (left.completedAt ?? 0));
}

function formatCycleRange(window: FocusWindow): string {
  return `${window.startDate} 至 ${window.endDate}`;
}

export default function Focus14({
  tasks,
  activeWindow,
  beginWindow,
  completeActiveWindow,
  cycleSaveError,
  updateTaskStatus,
}: Focus14Props) {
  const focusTasks = tasks.filter((task) => task.status === 'focus');
  const ideaTasks = tasks.filter((task) => task.status === 'idea');
  const [selectedStartDate, setSelectedStartDate] = useState(() => toDateInputValue(new Date()));
  const [reviewSummary, setReviewSummary] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const previewEndDate = useMemo(
    () => addDaysToDate(selectedStartDate, FOCUS_WINDOW_DAYS - 1),
    [selectedStartDate],
  );
  const completedTasksInWindow = useMemo(() => {
    if (activeWindow === null) {
      return [];
    }
    return collectCompletedTasks(tasks, activeWindow);
  }, [tasks, activeWindow]);

  const handleBeginWindow = () => {
    if (activeWindow !== null) {
      return;
    }
    beginWindow(selectedStartDate);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewSummary('');
  };

  const handleCompleteWindow = () => {
    if (activeWindow === null) {
      return;
    }
    completeActiveWindow({
      summary: reviewSummary.trim(),
      completedTaskIds: completedTasksInWindow.map((task) => task.id),
      completedTaskTitles: completedTasksInWindow.map((task) => task.title),
    });
    closeReviewModal();
  };

  const currentCycleText = activeWindow
    ? `当前周期：${formatCycleRange(activeWindow)}`
    : `预计周期：${selectedStartDate} 至 ${previewEndDate}`;
  const dateInputValue = activeWindow ? activeWindow.startDate : selectedStartDate;

  return (
    <>
      <div className="h-full flex flex-col">
        <header className="mb-10">
          <h2 className="font-serif text-2xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">14 天行囊</h2>
          <p className="text-[15px] text-[#7A7772] leading-relaxed tracking-wide">挑选两周内能完成的任务，小步快跑。</p>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col h-full bg-white/60 backdrop-blur-[1px] rounded-[12px] border border-[#3A3731]/10 shadow-none overflow-hidden">
            <div className="px-5 py-4 border-b border-[#3A3731]/5 bg-transparent space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-[#3A3731] text-[15px] tracking-wide flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B76] mr-2.5 opacity-80"></span>
                  当前行囊 ({focusTasks.length})
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <CalendarDays size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A7772]" />
                  <input
                    type="date"
                    value={dateInputValue}
                    onChange={(event) => setSelectedStartDate(event.target.value)}
                    disabled={activeWindow !== null}
                    className="h-8 rounded-md border border-[#3A3731]/15 bg-white/80 pl-8 pr-2 text-xs text-[#3A3731] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <button
                  onClick={handleBeginWindow}
                  disabled={activeWindow !== null}
                  className="inline-flex items-center gap-1 rounded-md border border-[#3A3731]/15 bg-white/80 px-3 py-1.5 text-xs text-[#3A3731] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play size={12} strokeWidth={1.8} />
                  开启
                </button>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  disabled={activeWindow === null}
                  className="inline-flex items-center gap-1 rounded-md border border-[#3A3731]/15 bg-[#3A3731] px-3 py-1.5 text-xs text-white hover:bg-[#2F2C27] disabled:bg-[#7A7772] disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCheck size={13} strokeWidth={1.8} />
                  结束
                </button>
              </div>
              <p className="text-xs text-[#7A7772]">{currentCycleText}</p>
              {cycleSaveError && <p className="text-xs text-red-600">周期保存失败：{cycleSaveError}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent">
              {focusTasks.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#7A7772] text-[14px] tracking-wide text-center px-4 opacity-70">
                  行囊是空的
                  <br />
                  从右侧灵感池挑选任务放入行囊
                </div>
              ) : (
                focusTasks.map((task) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    key={task.id}
                    className="group flex items-center p-6 bg-white/50 rounded-[12px] border border-[#3A3731]/5 shadow-none hover:bg-white/80 hover:border-[#3A3731]/15 transition-all duration-300"
                  >
                    <div className="mr-5 text-[#7A7772]">
                      <Circle size={22} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[#3A3731] text-[15px] leading-relaxed tracking-wide">{task.title}</h4>
                      <div className="mt-2 flex items-center space-x-1.5 flex-wrap">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[11px] font-mono border border-[#3A3731]/10 text-[#7A7772] px-1.5 py-0.5 rounded-sm bg-transparent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'idea')}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="放回灵感池"
                      >
                        <ArrowRight size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'today')}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="放入今日案头"
                      >
                        <Sun size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col h-full bg-transparent rounded-[12px] border border-[#3A3731]/10 border-dashed overflow-hidden hidden lg:flex">
            <div className="px-5 py-4 border-b border-[#3A3731]/5 border-dashed flex justify-between items-center">
              <h3 className="font-medium text-[#7A7772] text-[14px] tracking-wide">灵感池备选</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {ideaTasks.map((task) => (
                <div key={task.id} className="group flex items-center justify-between p-3 bg-white/40 hover:bg-white/70 rounded-lg border border-transparent hover:border-[#3A3731]/5 transition-colors">
                  <span className="text-[14px] text-[#7A7772] group-hover:text-[#3A3731] truncate pr-4 tracking-wide transition-colors">{task.title}</span>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'focus')}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors shrink-0"
                    title="移入行囊"
                  >
                    <ArrowLeft size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isReviewModalOpen && activeWindow && (
        <FocusReviewModal
          activeWindow={activeWindow}
          completedTasks={completedTasksInWindow}
          reviewSummary={reviewSummary}
          onReviewSummaryChange={setReviewSummary}
          onCancel={closeReviewModal}
          onConfirm={handleCompleteWindow}
        />
      )}
    </>
  );
}
