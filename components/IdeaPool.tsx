import { Task, TaskPatch, TaskStatus } from '@/lib/useTasks';
import { motion } from 'motion/react';
import { Hash, ArrowRight, Trash2, PencilLine } from 'lucide-react';
import { useState } from 'react';

const TAG_SPLIT_REGEX = /\s+/;

interface IdeaPoolProps {
  tasks: Task[];
  updateTask: (id: string, patch: TaskPatch) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

function toTagString(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(' ');
}

function toTags(rawTags: string): string[] {
  return rawTags
    .split(TAG_SPLIT_REGEX)
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);
}

export default function IdeaPool({ tasks, updateTask, updateTaskStatus, deleteTask }: IdeaPoolProps) {
  const ideas = tasks.filter(t => t.status === 'idea');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftTags, setDraftTags] = useState('');

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setDraftTitle(task.title);
    setDraftTags(toTagString(task.tags));
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setDraftTitle('');
    setDraftTags('');
  };

  const saveTask = (taskId: string) => {
    const title = draftTitle.trim();
    if (!title) {
      return;
    }
    updateTask(taskId, { title, tags: toTags(draftTags) });
    cancelEditing();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-10">
        <h2 className="font-serif text-2xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">灵感池</h2>
        <p className="text-[15px] text-[#7A7772] leading-relaxed tracking-wide">清空大脑，把所有未加工的想法存放在这里。</p>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {ideas.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-[#7A7772] border border-dashed border-[#3A3731]/15 rounded-xl bg-white/30">
            <p className="text-[15px] tracking-wide">灵感池空空如也</p>
            <p className="text-[13px] mt-2 opacity-70">在上方输入框记录你的第一个闪念</p>
          </div>
        ) : (
          ideas.map(task => {
            const isEditing = editingTaskId === task.id;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={task.id}
                className="group bg-white/50 p-6 rounded-[12px] border border-[#3A3731]/5 shadow-none hover:bg-white/80 hover:border-[#3A3731]/15 transition-all duration-300 flex items-start justify-between gap-3"
              >
                {isEditing ? (
                  <div className="flex-1 space-y-3">
                    <input
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[15px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
                      placeholder="任务标题"
                      autoFocus
                    />
                    <input
                      value={draftTags}
                      onChange={(event) => setDraftTags(event.target.value)}
                      className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[13px] text-[#7A7772] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
                      placeholder="#标签1 #标签2"
                    />
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        onClick={cancelEditing}
                        className="text-[13px] text-[#7A7772] px-3 py-1.5 hover:bg-[#3A3731]/5 rounded-md transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => saveTask(task.id)}
                        disabled={!draftTitle.trim()}
                        className="text-[13px] bg-white border border-[#3A3731]/15 text-[#3A3731] px-3 py-1.5 rounded-md hover:bg-[#3A3731]/5 disabled:opacity-40 transition-colors active:translate-y-[1px]"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 pr-4">
                      <h3 className="text-[15px] text-[#3A3731] mb-4 leading-relaxed tracking-wide">{task.title}</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-[12px] text-[#7A7772]/70 font-mono tracking-wider">
                          {new Date(task.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                        </span>
                        {task.tags.map(tag => (
                          <span key={tag} className="flex items-center text-[11px] font-mono border border-[#3A3731]/10 text-[#7A7772] px-1.5 py-0.5 rounded-sm bg-transparent">
                            <Hash size={10} className="mr-0.5 opacity-50" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => startEditing(task)}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="编辑"
                      >
                        <PencilLine size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'focus')}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="移入行囊"
                      >
                        <ArrowRight size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
