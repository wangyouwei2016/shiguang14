import { Sun, CalendarDays, Inbox, History } from 'lucide-react';
import { ViewType } from '@/app/page';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const navItems = [
    { id: 'today', label: '今日案头', icon: Sun },
    { id: 'focus', label: '14天行囊', icon: CalendarDays },
    { id: 'idea', label: '灵感池', icon: Inbox },
    { id: 'history', label: '时光印记', icon: History },
  ] as const;

  return (
    <aside className="w-64 bg-transparent border-r border-[#3A3731]/10 flex flex-col h-full hidden md:flex relative z-10">
      <div className="p-8">
        <h1 className="font-serif text-2xl font-medium tracking-[0.08em] text-[#3A3731]">
          拾光 <span className="text-[#8B7355] italic">14</span>
        </h1>
        <p className="text-[11px] text-[#7A7772] mt-3 tracking-[0.15em] uppercase font-mono">Focus & Grow</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 relative ${
                isActive 
                  ? 'text-[#3A3731] font-medium' 
                  : 'text-[#7A7772] hover:bg-[#3A3731]/5 hover:text-[#3A3731]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#E8E5DF]/60 rounded-lg border border-[#3A3731]/5"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-3 text-[15px]">
                <Icon size={16} className={isActive ? 'text-[#3A3731]' : 'opacity-70'} strokeWidth={isActive ? 2 : 1.5} />
                <span className="tracking-wide">{item.label}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
