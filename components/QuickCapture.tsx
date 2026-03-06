import { useState, useRef, useEffect } from 'react';
import { Plus, Hash } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickCaptureProps {
  onAdd: (title: string, tags: string[]) => void;
}

export default function QuickCapture({ onAdd }: QuickCaptureProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractTags = (text: string) => {
    const words = text.split(' ');
    return words.filter(w => w.startsWith('#') && w.length > 1).map(w => w.substring(1));
  };

  const cleanTitle = (text: string) => {
    return text.split(' ').filter(w => !w.startsWith('#')).join(' ').trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const tags = extractTags(inputValue);
    const title = cleanTitle(inputValue) || inputValue;

    onAdd(title, tags);
    setInputValue('');
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className={`relative flex items-center bg-white/70 backdrop-blur-[2px] rounded-lg transition-all duration-300 ${
        isFocused 
          ? 'border-[#7A8B76]/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)]' 
          : 'border-[#3A3731]/10 shadow-none hover:bg-white/80'
      } border`}
      initial={false}
      animate={{ y: isFocused ? -1 : 0 }}
    >
      <div className="pl-5 pr-3 py-3.5 text-[#7A7772]">
        <Plus size={18} className={isFocused ? 'text-[#7A8B76]' : 'opacity-60'} strokeWidth={1.5} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="记录闪念... (使用 # 添加标签)"
        className="flex-1 bg-transparent border-none outline-none text-[#3A3731] placeholder:text-[#7A7772]/60 py-3.5 text-[15px] tracking-wide"
      />
      
      <div className="absolute right-14 flex space-x-1.5 pointer-events-none">
        {extractTags(inputValue).map((tag, i) => (
          <span key={i} className="flex items-center text-[11px] font-mono border border-[#3A3731]/10 text-[#7A7772] px-1.5 py-0.5 rounded-sm bg-[#F5F3EF]/50">
            <Hash size={10} className="mr-0.5 opacity-50" />
            {tag}
          </span>
        ))}
      </div>

      <button 
        type="submit"
        disabled={!inputValue.trim()}
        className="mr-1.5 p-2 rounded-md bg-transparent text-[#7A7772] hover:bg-[#3A3731]/5 hover:text-[#3A3731] disabled:opacity-30 disabled:hover:bg-transparent transition-colors active:translate-y-[1px]"
      >
        <ArrowRightIcon size={18} strokeWidth={1.5} />
      </button>
    </motion.form>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
