import { Task, TaskStatus } from '@/lib/useTasks';
import { motion } from 'motion/react';
import { Hash, ArrowRight, ArrowLeft, Sun } from 'lucide-react';

interface Focus14Props {
  tasks: Task[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

export default function Focus14({ tasks, updateTaskStatus }: Focus14Props) {
  const focusTasks = tasks.filter(t => t.status === 'focus');
  const ideaTasks = tasks.filter(t => t.status === 'idea');

  return (
    <div className="h-full flex flex-col">
      <header className="mb-10">
        <h2 className="font-serif text-2xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">14 天行囊</h2>
        <p className="text-[15px] text-[#7A7772] leading-relaxed tracking-wide">挑选两周内能完成的任务，小步快跑。</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
        {/* Left Column: Focus 14 */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white/60 backdrop-blur-[1px] rounded-[12px] border border-[#3A3731]/10 shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-[#3A3731]/5 bg-transparent flex justify-between items-center">
            <h3 className="font-medium text-[#3A3731] text-[15px] tracking-wide flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B76] mr-2.5 opacity-80"></span>
              当前行囊 ({focusTasks.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent">
            {focusTasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#7A7772] text-[14px] tracking-wide text-center px-4 opacity-70">
                行囊是空的<br/>从右侧灵感池挑选任务放入行囊
              </div>
            ) : (
              focusTasks.map(task => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  key={task.id}
                  className="group bg-white/80 p-4 rounded-lg border border-[#3A3731]/5 shadow-none hover:border-[#3A3731]/15 transition-colors"
                >
                  <h4 className="text-[#3A3731] text-[15px] leading-relaxed tracking-wide mb-3">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1.5">
                      {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[11px] font-mono border border-[#3A3731]/10 text-[#7A7772] px-1.5 py-0.5 rounded-sm bg-transparent">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'idea')}
                        className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                        title="放回灵感池"
                      >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'today')}
                        className="px-2 py-1.5 border border-[#3A3731]/15 text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors flex items-center active:translate-y-[1px]"
                        title="放入今日案头"
                      >
                        <Sun size={14} className="mr-1.5 opacity-70" strokeWidth={1.5} />
                        <span className="text-[12px] tracking-wide">今日</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Idea Pool (Mini) */}
        <div className="lg:col-span-2 flex flex-col h-full bg-transparent rounded-[12px] border border-[#3A3731]/10 border-dashed overflow-hidden hidden lg:flex">
          <div className="px-5 py-4 border-b border-[#3A3731]/5 border-dashed flex justify-between items-center">
            <h3 className="font-medium text-[#7A7772] text-[14px] tracking-wide">灵感池备选</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {ideaTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 bg-white/40 hover:bg-white/70 rounded-lg border border-transparent hover:border-[#3A3731]/5 transition-colors">
                <span className="text-[14px] text-[#7A7772] group-hover:text-[#3A3731] truncate pr-4 tracking-wide transition-colors">{task.title}</span>
                <button 
                  onClick={() => updateTaskStatus(task.id, 'focus')}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors shrink-0"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
