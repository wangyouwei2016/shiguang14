import { Task, TaskStatus } from '@/lib/useTasks';
import { motion, AnimatePresence } from 'motion/react';
import { Circle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface TodaysDeskProps {
  tasks: Task[];
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

function MiniCalendar() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white/40 backdrop-blur-[1px] rounded-[12px] border border-[#3A3731]/10 p-6 shadow-none">
      <div className="text-[15px] font-serif text-[#3A3731] mb-6 tracking-[0.08em] text-center">
        {today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-3">
        {weekDays.map(day => (
          <div key={day} className="text-[11px] text-[#7A7772] font-mono tracking-widest">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center">
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`
              w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] tracking-wide transition-colors
              ${day === currentDate ? 'bg-[#7A8B76] text-white shadow-sm' : 'text-[#3A3731]'}
              ${!day ? 'invisible' : ''}
              ${day && day !== currentDate ? 'hover:bg-[#3A3731]/5 cursor-default' : ''}
            `}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TodaysDesk({ tasks, updateTaskStatus }: TodaysDeskProps) {
  const todayTasks = tasks.filter(t => t.status === 'today');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = (id: string) => {
    setCompletingId(id);
    // Delay the actual status update to allow the animation to play
    setTimeout(() => {
      updateTaskStatus(id, 'completed');
      setCompletingId(null);
    }, 1500);
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="h-full flex flex-col">
      <header className="mb-12">
        <h2 className="font-serif text-3xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">今日案头</h2>
        <p className="text-[#7A7772] text-[15px] tracking-wide">{dateString}</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {todayTasks.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="w-20 h-20 bg-transparent border border-[#3A3731]/10 border-dashed rounded-full flex items-center justify-center mx-auto mb-6 opacity-60">
                <CheckCircle2 size={24} className="text-[#7A7772]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] text-[#3A3731] font-medium mb-3 tracking-wide">今日无事，便是好事</h3>
              <p className="text-[14px] text-[#7A7772] tracking-wide">去「14天行囊」挑选 1-3 件事放入案头吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {todayTasks.map(task => {
                  const isCompleting = completingId === task.id;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: isCompleting ? 0.4 : 1, 
                        y: 0,
                        x: isCompleting ? 20 : 0
                      }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.4, ease: "easeOut" } }}
                      key={task.id}
                      className={`group flex items-center p-5 bg-white/70 backdrop-blur-[1px] rounded-[12px] border transition-all duration-500 ${
                        isCompleting ? 'border-transparent bg-transparent' : 'border-[#3A3731]/10 shadow-none hover:bg-white/90'
                      }`}
                    >
                      <button 
                        onClick={() => handleComplete(task.id)}
                        disabled={isCompleting}
                        className="mr-5 text-[#7A7772] hover:text-[#7A8B76] transition-colors disabled:opacity-50"
                      >
                        {isCompleting ? (
                          <CheckCircle2 size={24} className="text-[#7A8B76]" strokeWidth={1.5} />
                        ) : (
                          <Circle size={24} strokeWidth={1.5} />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`text-[16px] tracking-wide leading-relaxed transition-all duration-500 ${
                          isCompleting ? 'text-[#7A7772] line-through decoration-[#7A7772]/50' : 'text-[#3A3731]'
                        }`}>
                          {task.title}
                        </h3>
                      </div>

                      {!isCompleting && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'focus')}
                          className="opacity-0 group-hover:opacity-100 p-2 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-all"
                          title="移回行囊"
                        >
                          <ArrowRight size={18} strokeWidth={1.5} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1 hidden lg:block">
          <MiniCalendar />
        </div>
      </div>
    </div>
  );
}
