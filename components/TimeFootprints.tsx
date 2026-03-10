import { Task, TaskPatch } from '@/lib/useTasks';
import { motion } from 'motion/react';
import { Star, CheckCircle2, MessageSquarePlus, Trash2, PencilLine } from 'lucide-react';
import { useState } from 'react';
import { FocusReview, UpdateFocusReviewInput } from '@/lib/useFocusCycle';
import FocusReviewSection from '@/components/FocusReviewSection';

interface TimeFootprintsProps {
  tasks: Task[];
  focusReviews: FocusReview[];
  updateFocusReview: (reviewId: string, input: UpdateFocusReviewInput) => void;
  deleteFocusReview: (reviewId: string) => void;
  updateTask: (id: string, patch: TaskPatch) => void;
  toggleHighlight: (id: string, note?: string) => void;
  deleteTask: (id: string) => void;
}

export default function TimeFootprints({ tasks, focusReviews, updateFocusReview, deleteFocusReview, updateTask, toggleHighlight, deleteTask }: TimeFootprintsProps) {
  const completedTasks = tasks
    .filter(t => t.status === 'completed' && t.completedAt)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitleText, setTaskTitleText] = useState('');

  // Group by month
  const groupedTasks: Record<string, Task[]> = {};
  completedTasks.forEach(task => {
    const date = new Date(task.completedAt!);
    const monthYear = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    if (!groupedTasks[monthYear]) {
      groupedTasks[monthYear] = [];
    }
    groupedTasks[monthYear].push(task);
  });

  const handleSaveNote = (id: string) => {
    updateTask(id, { highlightNote: noteText.trim() });
    setEditingNoteId(null);
    setNoteText('');
  };

  const startTaskEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitleText(task.title);
  };

  const cancelTaskEditing = () => {
    setEditingTaskId(null);
    setTaskTitleText('');
  };

  const saveTaskTitle = (id: string) => {
    const title = taskTitleText.trim();
    if (!title) {
      return;
    }
    updateTask(id, { title });
    cancelTaskEditing();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-12">
        <h2 className="font-serif text-3xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">时光印记</h2>
        <p className="text-[15px] text-[#7A7772] tracking-wide">见证成长，慢慢的成就感，都在这里。</p>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 pb-20">
        <FocusReviewSection focusReviews={focusReviews} updateFocusReview={updateFocusReview} deleteFocusReview={deleteFocusReview} />

        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center text-[#7A7772] mt-20 text-[15px] tracking-wide">
            还没有完成的任务，去「今日案头」打个勾吧。
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedTasks).map(([month, monthTasks]) => (
              <div key={month} className="relative">
                <h3 className="sticky top-0 bg-[#F5F3EF]/90 backdrop-blur-sm py-3 text-[12px] font-mono tracking-[0.2em] text-[#7A7772] uppercase z-10 mb-8">
                  {month}
                </h3>
                
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-[#3A3731]/10 before:to-transparent">
                  {monthTasks.map((task, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      key={task.id} 
                      className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${task.isHighlight ? 'my-12' : ''}`}
                    >
                      {/* Timeline Dot */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-[#F5F3EF] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-none ${
                        task.isHighlight ? 'bg-[#7A8B76] text-white w-10 h-10' : 'bg-white border border-[#3A3731]/10 text-[#7A7772]'
                      }`}>
                        {task.isHighlight ? <Star size={14} fill="currentColor" strokeWidth={1.5} /> : <CheckCircle2 size={14} strokeWidth={1.5} />}
                      </div>

                      {/* Content Card */}
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[12px] transition-all duration-300 ${
                        task.isHighlight 
                          ? 'bg-white/90 border border-[#7A8B76]/30 shadow-[0_4px_20px_rgb(0,0,0,0.03)]' 
                          : 'bg-white/50 border border-[#3A3731]/5 hover:bg-white/80 hover:border-[#3A3731]/15'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[11px] text-[#7A7772] font-mono tracking-wider">
                            {new Date(task.completedAt!).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => startTaskEditing(task)}
                              className={`p-1.5 rounded-md transition-colors ${
                                task.isHighlight ? 'text-[#7A7772] hover:bg-[#3A3731]/5' : 'text-[#7A7772] hover:bg-[#3A3731]/5 opacity-0 group-hover:opacity-100'
                              }`}
                              title="编辑"
                            >
                              <PencilLine size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                task.isHighlight ? 'text-[#7A7772] hover:bg-[#3A3731]/5' : 'text-[#7A7772] hover:bg-[#3A3731]/5 opacity-0 group-hover:opacity-100'
                              }`}
                              title="删除"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => toggleHighlight(task.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                task.isHighlight ? 'text-[#7A8B76] bg-[#7A8B76]/10' : 'text-[#7A7772] hover:bg-[#3A3731]/5 opacity-0 group-hover:opacity-100'
                              }`}
                              title={task.isHighlight ? '取消印记' : '标记印记'}
                            >
                              <Star size={14} className={task.isHighlight ? 'fill-current' : ''} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>

                        {editingTaskId === task.id ? (
                          <div className="space-y-3">
                            <input
                              value={taskTitleText}
                              onChange={(event) => setTaskTitleText(event.target.value)}
                              className="w-full bg-transparent border border-[#3A3731]/10 rounded-md p-3 text-[14px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50 tracking-wide leading-relaxed"
                              placeholder="任务标题"
                              autoFocus
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={cancelTaskEditing}
                                className="text-[13px] text-[#7A7772] px-4 py-2 hover:bg-[#3A3731]/5 rounded-md transition-colors"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => saveTaskTitle(task.id)}
                                disabled={!taskTitleText.trim()}
                                className="text-[13px] bg-white border border-[#3A3731]/15 text-[#3A3731] px-4 py-2 rounded-md hover:bg-[#3A3731]/5 disabled:opacity-40 transition-colors active:translate-y-[1px]"
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        ) : (
                          <h4 className={`text-[#3A3731] leading-relaxed tracking-wide ${task.isHighlight ? 'text-[16px] font-medium' : 'text-[15px]'}`}>
                            {task.title}
                          </h4>
                        )}

                        {/* Highlight Note Section */}
                        {task.isHighlight && (
                          <div className="mt-5 pt-5 border-t border-[#3A3731]/5">
                            {editingNoteId === task.id ? (
                              <div className="space-y-3">
                                <textarea 
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="写下复盘感悟..."
                                  className="w-full bg-transparent border border-[#3A3731]/10 rounded-md p-3 text-[14px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50 resize-none h-24 tracking-wide leading-relaxed"
                                  autoFocus
                                />
                                <div className="flex justify-end space-x-2">
                                  <button 
                                    onClick={() => setEditingNoteId(null)}
                                    className="text-[13px] text-[#7A7772] px-4 py-2 hover:bg-[#3A3731]/5 rounded-md transition-colors"
                                  >
                                    取消
                                  </button>
                                  <button 
                                    onClick={() => handleSaveNote(task.id)}
                                    className="text-[13px] bg-white border border-[#3A3731]/15 text-[#3A3731] px-4 py-2 rounded-md hover:bg-[#3A3731]/5 transition-colors active:translate-y-[1px]"
                                  >
                                    保存
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="group/note cursor-pointer"
                                onClick={() => {
                                  setNoteText(task.highlightNote || '');
                                  setEditingNoteId(task.id);
                                }}
                              >
                                {task.highlightNote ? (
                                  <p className="text-[14px] text-[#5A5752] font-serif italic leading-relaxed tracking-wide">
                                    「{task.highlightNote}」
                                  </p>
                                ) : (
                                  <div className="flex items-center text-[13px] text-[#7A8B76]/70 hover:text-[#7A8B76] transition-colors tracking-wide">
                                    <MessageSquarePlus size={14} className="mr-2" strokeWidth={1.5} />
                                    添加复盘感悟
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
