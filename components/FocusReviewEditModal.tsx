import { FocusReview } from '@/lib/useFocusCycle';

interface FocusReviewEditModalProps {
  review: FocusReview;
  draftSummary: string;
  draftTasksText: string;
  onDraftSummaryChange: (value: string) => void;
  onDraftTasksTextChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

function formatCycleRange(review: FocusReview): string {
  return `${review.startDate} 至 ${review.endDate}`;
}

export default function FocusReviewEditModal({
  review,
  draftSummary,
  draftTasksText,
  onDraftSummaryChange,
  onDraftTasksTextChange,
  onCancel,
  onSave,
}: FocusReviewEditModalProps) {
  return (
    <div className="fixed inset-0 z-[110] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#3A3731]/10 bg-[#F5F3EF] shadow-xl p-6 space-y-4">
        <header className="space-y-1">
          <h3 className="font-serif text-xl text-[#3A3731]">编辑行囊复盘</h3>
          <p className="text-sm text-[#7A7772]">周期：{formatCycleRange(review)}</p>
        </header>

        <section className="space-y-2">
          <p className="text-[12px] text-[#7A7772] tracking-wider">完成的任务（每行一个）</p>
          <textarea
            value={draftTasksText}
            onChange={(event) => onDraftTasksTextChange(event.target.value)}
            placeholder="例如：\n- 读完一本书\n- 写完一篇文章"
            className="w-full h-36 resize-none rounded-md border border-[#3A3731]/15 bg-white/90 px-3 py-2 text-sm text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
            autoFocus
          />
        </section>

        <section className="space-y-2">
          <p className="text-[12px] text-[#7A7772] tracking-wider">复盘总结</p>
          <textarea
            value={draftSummary}
            onChange={(event) => onDraftSummaryChange(event.target.value)}
            placeholder="输入本轮复盘总结..."
            className="w-full h-32 resize-none rounded-md border border-[#3A3731]/15 bg-white/90 px-3 py-2 text-sm text-[#3A3731] outline-none focus:border-[#7A8B76]/50 focus:ring-1 focus:ring-[#7A8B76]/50"
          />
        </section>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[#7A7772] rounded-md hover:bg-[#3A3731]/5 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm text-white bg-[#3A3731] rounded-md hover:bg-[#2F2C27] transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
