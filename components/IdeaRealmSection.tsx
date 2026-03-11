import { IdeaRealm, Task } from '@/lib/useTasks';
import { Lightbulb, MessageCircle } from 'lucide-react';
import IdeaTaskCard from '@/components/IdeaTaskCard';
import type React from 'react';

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface IdeaRealmSectionProps {
  title: string;
  description: string;
  Icon: IconComponent;
  realm: IdeaRealm;
  tasks: Task[];
  editingTaskId: string | null;
  draftTitle: string;
  draftTags: string;
  onDraftTitleChange: (value: string) => void;
  onDraftTagsChange: (value: string) => void;
  onStartEditing: (task: Task) => void;
  onCancelEditing: () => void;
  onSave: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onMoveToFocus: (taskId: string) => void;
  onToggleRealm: (taskId: string, next: IdeaRealm) => void;
  emptyTitle: string;
  emptySubtitle: string;
}

function getToggleConfig(realm: IdeaRealm) {
  if (realm === 'lingsi') {
    return {
      next: 'duyu' as const,
      title: '移到独语',
      Icon: MessageCircle,
    };
  }
  return {
    next: 'lingsi' as const,
    title: '移到灵思',
    Icon: Lightbulb,
  };
}

export default function IdeaRealmSection({
  title,
  description,
  Icon,
  realm,
  tasks,
  editingTaskId,
  draftTitle,
  draftTags,
  onDraftTitleChange,
  onDraftTagsChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  onDelete,
  onMoveToFocus,
  onToggleRealm,
  emptyTitle,
  emptySubtitle,
}: IdeaRealmSectionProps) {
  const toggle = getToggleConfig(realm);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-serif text-xl text-[#3A3731] tracking-[0.08em] flex items-center">
            <Icon size={18} strokeWidth={1.6} className="mr-2 text-[#7A8B76]" />
            {title}
          </h3>
          <span className="text-[12px] text-[#7A7772] tracking-wide truncate">{description}</span>
        </div>
        <span className="text-[12px] text-[#7A7772]">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-[#7A7772] border border-dashed border-[#3A3731]/15 rounded-xl bg-white/30">
          <p className="text-[15px] tracking-wide">{emptyTitle}</p>
          <p className="text-[13px] mt-2 opacity-70">{emptySubtitle}</p>
        </div>
      ) : (
        tasks.map((task) => (
          <IdeaTaskCard
            key={task.id}
            task={task}
            isEditing={editingTaskId === task.id}
            draftTitle={draftTitle}
            draftTags={draftTags}
            onDraftTitleChange={onDraftTitleChange}
            onDraftTagsChange={onDraftTagsChange}
            onCancelEditing={onCancelEditing}
            onSave={onSave}
            onStartEditing={onStartEditing}
            onDelete={onDelete}
            onMoveToFocus={onMoveToFocus}
            onToggleRealm={(taskId) => onToggleRealm(taskId, toggle.next)}
            toggleRealmTitle={toggle.title}
            ToggleRealmIcon={toggle.Icon}
          />
        ))
      )}
    </section>
  );
}
