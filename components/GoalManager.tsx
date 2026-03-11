import { ArrowRight, PencilLine, Plus, Target, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Goal, GoalPatch, GoalTerm, GOAL_TERM_LABELS } from '@/lib/useGoals';
import { Task } from '@/lib/useTasks';

interface GoalManagerProps {
  goals: Goal[];
  tasks: Task[];
  addGoal: (title: string, note: string, term: GoalTerm) => void;
  updateGoal: (id: string, patch: GoalPatch) => void;
  deleteGoal: (id: string) => void;
  addGoalToFocus: (goal: Goal) => void;
  saveError: string | null;
}

const GOAL_TERM_ORDER: GoalTerm[] = ['long', 'mid', 'short'];

function hasLinkedTask(tasks: Task[], goalId: string): boolean {
  return tasks.some((task) => task.sourceGoalId === goalId && task.status !== 'completed');
}

function getGroupedGoals(goals: Goal[]): Record<GoalTerm, Goal[]> {
  return {
    long: goals.filter((goal) => goal.term === 'long'),
    mid: goals.filter((goal) => goal.term === 'mid'),
    short: goals.filter((goal) => goal.term === 'short'),
  };
}

export default function GoalManager({
  goals,
  tasks,
  addGoal,
  updateGoal,
  deleteGoal,
  addGoalToFocus,
  saveError,
}: GoalManagerProps) {
  const [titleInput, setTitleInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [termInput, setTermInput] = useState<GoalTerm>('short');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingNote, setEditingNote] = useState('');
  const [editingTerm, setEditingTerm] = useState<GoalTerm>('short');

  const groupedGoals = useMemo(() => getGroupedGoals(goals), [goals]);

  const handleAddGoal = () => {
    const title = titleInput.trim();
    if (!title) {
      return;
    }
    addGoal(title, noteInput.trim(), termInput);
    setTitleInput('');
    setNoteInput('');
    setTermInput('short');
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingTitle(goal.title);
    setEditingNote(goal.note);
    setEditingTerm(goal.term);
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditingTitle('');
    setEditingNote('');
    setEditingTerm('short');
  };

  const saveEditing = (goalId: string) => {
    const title = editingTitle.trim();
    if (!title) {
      return;
    }
    updateGoal(goalId, { title, note: editingNote.trim(), term: editingTerm });
    cancelEditing();
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-serif text-xl text-[#3A3731] tracking-[0.08em] flex items-center">
            <Target size={18} strokeWidth={1.6} className="mr-2 text-[#7A8B76]" />
            问程
          </h3>
          <span className="text-[12px] text-[#7A7772] tracking-wide truncate">立志·知行合一</span>
        </div>
      </div>

      <div className="bg-white/50 rounded-[12px] border border-[#3A3731]/5 p-5 space-y-3">
        <input
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
          placeholder="新增目标标题"
          className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[15px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
        />
        <textarea
          value={noteInput}
          onChange={(event) => setNoteInput(event.target.value)}
          placeholder="目标注释（可选）"
          className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[14px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50 resize-none h-20"
        />
        <div className="flex items-center justify-between gap-3">
          <select
            value={termInput}
            onChange={(event) => setTermInput(event.target.value as GoalTerm)}
            className="bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[13px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
          >
            {GOAL_TERM_ORDER.map((term) => (
              <option key={term} value={term}>
                {GOAL_TERM_LABELS[term]}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddGoal}
            disabled={!titleInput.trim()}
            className="flex items-center text-[13px] bg-white border border-[#3A3731]/15 text-[#3A3731] px-3 py-1.5 rounded-md hover:bg-[#3A3731]/5 disabled:opacity-40 transition-colors active:translate-y-[1px]"
          >
            <Plus size={14} className="mr-1.5" strokeWidth={1.5} />
            添加目标
          </button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-md border border-red-300 bg-red-50/95 px-4 py-2 text-xs text-red-700">
          目标保存失败：{saveError}
        </div>
      )}

      <div className="space-y-6">
        {GOAL_TERM_ORDER.map((term) => (
          <div key={term} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[14px] font-medium text-[#3A3731] tracking-wide">{GOAL_TERM_LABELS[term]}</h4>
              <span className="text-[12px] text-[#7A7772]">{groupedGoals[term].length}</span>
            </div>

            {groupedGoals[term].length === 0 ? (
              <div className="text-[13px] text-[#7A7772] border border-dashed border-[#3A3731]/15 rounded-[12px] px-4 py-3">
                暂无{GOAL_TERM_LABELS[term]}
              </div>
            ) : (
              groupedGoals[term].map((goal) => {
                const linked = hasLinkedTask(tasks, goal.id);
                const isEditing = editingGoalId === goal.id;
                return (
                  <div
                    key={goal.id}
                    className="group bg-white/50 rounded-[12px] border border-[#3A3731]/5 hover:bg-white/80 hover:border-[#3A3731]/15 transition-all duration-300 p-5"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                          className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[15px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
                        />
                        <textarea
                          value={editingNote}
                          onChange={(event) => setEditingNote(event.target.value)}
                          className="w-full bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[14px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50 resize-none h-20"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <select
                            value={editingTerm}
                            onChange={(event) => setEditingTerm(event.target.value as GoalTerm)}
                            className="bg-white/90 border border-[#3A3731]/15 rounded-md px-3 py-2 text-[13px] text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
                          >
                            {GOAL_TERM_ORDER.map((item) => (
                              <option key={item} value={item}>
                                {GOAL_TERM_LABELS[item]}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={cancelEditing}
                              className="text-[13px] text-[#7A7772] px-3 py-1.5 hover:bg-[#3A3731]/5 rounded-md transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => saveEditing(goal.id)}
                              disabled={!editingTitle.trim()}
                              className="text-[13px] bg-white border border-[#3A3731]/15 text-[#3A3731] px-3 py-1.5 rounded-md hover:bg-[#3A3731]/5 disabled:opacity-40 transition-colors active:translate-y-[1px]"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[15px] text-[#3A3731] leading-relaxed tracking-wide">{goal.title}</h5>
                          <p className="text-[13px] text-[#7A7772] mt-2 leading-relaxed whitespace-pre-wrap">
                            {goal.note || '暂无注释'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => startEditing(goal)}
                            className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                            title="编辑目标"
                          >
                            <PencilLine size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md transition-colors"
                            title="删除目标"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => addGoalToFocus(goal)}
                            disabled={linked}
                            className="p-1.5 text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 rounded-md disabled:opacity-35 transition-colors"
                            title={linked ? '已在行囊中' : '加入14天行囊'}
                          >
                            <ArrowRight size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
