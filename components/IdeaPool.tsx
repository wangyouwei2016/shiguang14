import { Task, TaskStatus } from '@/lib/useTasks';
import { motion } from 'motion/react';
import { Hash, ArrowRight, Trash2 } from 'lucide-react';

interface IdeaPoolProps {
  tasks: Task[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
}

export default function IdeaPool({ tasks, updateTaskStatus, deleteTask }: IdeaPoolProps) {
  const ideas = tasks.filter(t => t.status === 'idea');

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
          ideas.map(task => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              key={task.id}
              className="group bg-white/70 backdrop-blur-[1px] p-5 rounded-[12px] border border-[#3A3731]/10 shadow-none hover:bg-white/90 transition-colors flex items-start justify-between"
            >
              <div className="flex-1 pr-4">
                <h3 className="text-[16px] text-[#3A3731] font-medium mb-3 leading-relaxed tracking-wide">{task.title}</h3>
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
              
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => updateTaskStatus(task.id, 'focus')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#3A3731]/15 bg-transparent text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md text-[13px] tracking-wide transition-colors active:translate-y-[1px]"
                >
                  <span>移入行囊</span>
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
