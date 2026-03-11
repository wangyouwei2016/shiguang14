import { Task } from '@/lib/useTasks';
import { motion } from 'motion/react';
import { ArrowRight, Hash, PencilLine, Trash2 } from 'lucide-react';
import type React from 'react';

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface IdeaTaskCardProps {
  task: Task;
  isEditing: boolean;
  draftTitle: string;
  draftTags: string;
  onDraftTitleChange: (value: string) => void;
  onDraftTagsChange: (value: string) => void;
  onCancelEditing: () => void;
  onSave: (taskId: string) => void;
  onStartEditing: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onMoveToFocus: (taskId: string) => void;
  onToggleRealm: (taskId: string) => void;
  toggleRealmTitle: string;
  ToggleRealmIcon: IconComponent;
}

const DATE_LOCALE = 'zh-CN';
const DATE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

function formatShortDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(DATE_LOCALE, DATE_FORMAT);
}

export default function IdeaTaskCard({
  task,
  isEditing,
  draftTitle,
  draftTags,
  onDraftTitleChange,
  onDraftTagsChange,
  onCancelEditing,
  onSave,
  onStartEditing,
  onDelete,
  onMoveToFocus,
  onToggleRealm,
  toggleRealmTitle,
  ToggleRealmIcon,
}: IdeaTaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-white/50 p-6 rounded-[12px] border border-[#3A3731]/5 shadow-none hover:bg-white/80 hover:border-[#3A3731]/15 transition-all duration-300 flex items-start justify-between gap-3"
    >
      {isEditing ? (
        <div className="flex-1 space-y-3">
          <input
            value={draftTitle}
            onChange={(event) => onDraftTitleChange(event.target.value)}
            className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[15px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
            placeholder="任务标题"
            autoFocus
          />
          <input
            value={draftTags}
            onChange={(event) => onDraftTagsChange(event.target.value)}
            className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[13px] text-[#7A7772] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
            placeholder="#标签1 #标签2"
          />
          <div className="flex justify-end items-center space-x-2">
            <button
              onClick={onCancelEditing}
              className="text-[13px] text-[#7A7772] px-3 py-1.5 hover:bg-[#3A3731]/5 rounded-md transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => onSave(task.id)}
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
                {formatShortDate(task.createdAt)}
              </span>
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center text-[11px] font-mono border border-[#3A3731]/10 text-[#7A7772] px-1.5 py-0.5 rounded-sm bg-transparent"
                >
                  <Hash size={10} className="mr-0.5 opacity-50" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onToggleRealm(task.id)}
              className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
              title={toggleRealmTitle}
            >
              <ToggleRealmIcon size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onStartEditing(task)}
              className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
              title="编辑"
            >
              <PencilLine size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
              title="删除"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onMoveToFocus(task.id)}
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
}
