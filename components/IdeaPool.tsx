import { IdeaRealm, Task, TaskPatch, TaskStatus } from '@/lib/useTasks';
import { Goal, GoalPatch, GoalTerm } from '@/lib/useGoals';
import { Lightbulb, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import GoalManager from '@/components/GoalManager';
import IdeaRealmSection from '@/components/IdeaRealmSection';

const TAG_SPLIT_REGEX = /\s+/;
const DEFAULT_IDEA_REALM: IdeaRealm = 'lingsi';

function getIdeaRealm(task: Task): IdeaRealm {
  return task.ideaRealm ?? DEFAULT_IDEA_REALM;
}

interface IdeaPoolProps {
  tasks: Task[];
  goals: Goal[];
  addGoal: (title: string, note: string, term: GoalTerm) => void;
  updateGoal: (id: string, patch: GoalPatch) => void;
  deleteGoal: (id: string) => void;
  addGoalToFocus: (goal: Goal) => void;
  updateTask: (id: string, patch: TaskPatch) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  goalsSaveError: string | null;
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

export default function IdeaPool({
  tasks,
  goals,
  addGoal,
  updateGoal,
  deleteGoal,
  addGoalToFocus,
  updateTask,
  updateTaskStatus,
  deleteTask,
  goalsSaveError,
}: IdeaPoolProps) {
  const ideaTasks = tasks.filter((task) => task.status === 'idea');
  const duyuTasks = ideaTasks.filter((task) => getIdeaRealm(task) === 'duyu');
  const lingsiTasks = ideaTasks.filter((task) => getIdeaRealm(task) === 'lingsi');
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

  const moveToFocus = (taskId: string) => {
    updateTaskStatus(taskId, 'focus');
  };

  const toggleIdeaRealm = (taskId: string, next: IdeaRealm) => {
    updateTask(taskId, { ideaRealm: next });
  };

  return (
    <div className="h-full flex flex-col">
      <header className="mb-10">
        <h2 className="font-serif text-2xl font-medium tracking-[0.08em] text-[#3A3731] mb-3">觉行三境</h2>
        <p className="text-[15px] text-[#7A7772] leading-relaxed tracking-wide">独语 · 灵思 · 问程</p>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 space-y-10">
        <IdeaRealmSection
          title="独语"
          description="内观·明心见性"
          Icon={MessageCircle}
          realm="duyu"
          tasks={duyuTasks}
          editingTaskId={editingTaskId}
          draftTitle={draftTitle}
          draftTags={draftTags}
          onDraftTitleChange={setDraftTitle}
          onDraftTagsChange={setDraftTags}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSave={saveTask}
          onDelete={deleteTask}
          onMoveToFocus={moveToFocus}
          onToggleRealm={toggleIdeaRealm}
          emptyTitle="暂无独语"
          emptySubtitle="把自己和自己的对话写在这里"
        />

        <IdeaRealmSection
          title="灵思"
          description="入微·步步为营"
          Icon={Lightbulb}
          realm="lingsi"
          tasks={lingsiTasks}
          editingTaskId={editingTaskId}
          draftTitle={draftTitle}
          draftTags={draftTags}
          onDraftTitleChange={setDraftTitle}
          onDraftTagsChange={setDraftTags}
          onStartEditing={startEditing}
          onCancelEditing={cancelEditing}
          onSave={saveTask}
          onDelete={deleteTask}
          onMoveToFocus={moveToFocus}
          onToggleRealm={toggleIdeaRealm}
          emptyTitle="暂无灵思"
          emptySubtitle="在上方输入框记录你的第一个闪念"
        />

        <GoalManager
          goals={goals}
          tasks={tasks}
          addGoal={addGoal}
          updateGoal={updateGoal}
          deleteGoal={deleteGoal}
          addGoalToFocus={addGoalToFocus}
          saveError={goalsSaveError}
        />
      </div>
    </div>
  );
}
