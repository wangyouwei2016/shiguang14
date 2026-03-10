import { Task } from '@/lib/useTasks';
import { FocusWindow } from '@/lib/useFocusCycle';

interface FocusReviewModalProps {
  activeWindow: FocusWindow;
  completedTasks: Task[];
  reviewSummary: string;
  onReviewSummaryChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function formatCycleRange(window: FocusWindow): string {
  return `${window.startDate} 至 ${window.endDate}`;
}

export default function FocusReviewModal({
  activeWindow,
  completedTasks,
  reviewSummary,
  onReviewSummaryChange,
  onCancel,
  onConfirm,
}: FocusReviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#3A3731]/10 bg-[#F5F3EF] shadow-xl p-6 space-y-4">
        <header className="space-y-1">
          <h3 className="font-serif text-xl text-[#3A3731]">结束 14 天行囊并复盘</h3>
          <p className="text-sm text-[#7A7772]">周期：{formatCycleRange(activeWindow)}</p>
        </header>
        <section className="rounded-lg border border-[#3A3731]/10 bg-white/75 p-4">
          <h4 className="text-sm text-[#3A3731] mb-2">本周期已完成任务（{completedTasks.length}）</h4>
          {completedTasks.length === 0 ? (
            <p className="text-sm text-[#7A7772]">本周期暂无已完成任务。</p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="text-sm text-[#3A3731] flex items-center justify-between gap-3">
                  <span className="truncate">{task.title}</span>
                  <span className="shrink-0 text-xs text-[#7A7772]">
                    {new Date(task.completedAt as number).toLocaleDateString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        <textarea
          value={reviewSummary}
          onChange={(event) => onReviewSummaryChange(event.target.value)}
          placeholder="输入本轮复盘总结..."
          className="w-full h-32 resize-none rounded-md border border-[#3A3731]/15 bg-white/90 px-3 py-2 text-sm text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#7A7772] rounded-md hover:bg-[#3A3731]/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm text-white bg-[#3A3731] rounded-md hover:bg-[#2F2C27] transition-colors"
          >
            保存并结束
          </button>
        </div>
      </div>
    </div>
  );
}
