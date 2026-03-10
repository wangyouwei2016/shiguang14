import { useMemo, useState } from 'react';
import { Backpack, PencilLine } from 'lucide-react';
import { FocusReview, UpdateFocusReviewInput } from '@/lib/useFocusCycle';
import FocusReviewEditModal from '@/components/FocusReviewEditModal';

interface FocusReviewSectionProps {
  focusReviews: FocusReview[];
  updateFocusReview: (reviewId: string, input: UpdateFocusReviewInput) => void;
}

const ID_RADIX = 36;
const ID_START_INDEX = 2;
const ID_END_INDEX = 9;
const TASK_LINE_PREFIX_PATTERN = /^[-*]\s+/;

function createSnapshotTaskId(): string {
  return Math.random().toString(ID_RADIX).substring(ID_START_INDEX, ID_END_INDEX);
}

function formatReviewDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function toCompletedTaskTitles(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(TASK_LINE_PREFIX_PATTERN, '').trim())
    .filter(Boolean);
}

function toCompletedTaskIds(existingIds: string[], titles: string[]): string[] {
  return titles.map((_, index) => existingIds[index] ?? createSnapshotTaskId());
}

function toTasksText(titles: string[]): string {
  return titles.join('\n');
}

export default function FocusReviewSection({ focusReviews, updateFocusReview }: FocusReviewSectionProps) {
  const reviews = useMemo(() => [...focusReviews].sort((a, b) => b.createdAt - a.createdAt), [focusReviews]);
  const [editingReview, setEditingReview] = useState<FocusReview | null>(null);
  const [draftSummary, setDraftSummary] = useState('');
  const [draftTasksText, setDraftTasksText] = useState('');

  const startEditing = (review: FocusReview) => {
    setEditingReview(review);
    setDraftSummary(review.summary);
    setDraftTasksText(toTasksText(review.completedTaskTitles));
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setDraftSummary('');
    setDraftTasksText('');
  };

  const saveEditing = () => {
    if (!editingReview) {
      return;
    }
    const titles = toCompletedTaskTitles(draftTasksText);
    const ids = toCompletedTaskIds(editingReview.completedTaskIds, titles);
    updateFocusReview(editingReview.id, {
      summary: draftSummary,
      completedTaskIds: ids,
      completedTaskTitles: titles,
    });
    cancelEditing();
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-14">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-medium text-[#3A3731] tracking-wide flex items-center gap-2">
            <Backpack size={16} strokeWidth={1.5} className="text-[#7A8B76]" />
            行囊复盘
          </h3>
          <span className="text-[12px] text-[#7A7772]">{reviews.length}</span>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/55 rounded-[12px] border border-[#3A3731]/10 p-6 hover:bg-white/75 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-[15px] text-[#3A3731] tracking-wide leading-relaxed truncate">
                    {review.startDate} 至 {review.endDate}
                  </h4>
                  <p className="text-[12px] text-[#7A7772] font-mono tracking-wider mt-1">
                    {formatReviewDate(review.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[12px] text-[#7A7772]">完成 {review.completedTaskTitles.length} 项</span>
                  <button
                    onClick={() => startEditing(review)}
                    className="p-1.5 rounded-md text-[#7A7772] hover:text-[#3A3731] hover:bg-[#3A3731]/5 transition-colors"
                    title="编辑复盘"
                  >
                    <PencilLine size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-[#3A3731]/10 bg-white/70 p-4">
                  <p className="text-[12px] text-[#7A7772] tracking-wider mb-2">已完成任务</p>
                  {review.completedTaskTitles.length === 0 ? (
                    <p className="text-[13px] text-[#7A7772]">本周期未记录已完成任务。</p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {review.completedTaskTitles.map((title, index) => (
                        <p key={`${review.id}-${index}`} className="text-[14px] text-[#3A3731] tracking-wide">
                          {title}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-[#3A3731]/10 bg-white/70 p-4">
                  <p className="text-[12px] text-[#7A7772] tracking-wider mb-2">复盘总结</p>
                  <p className="text-[14px] text-[#5A5752] leading-relaxed tracking-wide whitespace-pre-wrap">
                    {review.summary.trim().length > 0 ? review.summary : '（未填写复盘总结）'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingReview && (
        <FocusReviewEditModal
          review={editingReview}
          draftSummary={draftSummary}
          draftTasksText={draftTasksText}
          onDraftSummaryChange={setDraftSummary}
          onDraftTasksTextChange={setDraftTasksText}
          onCancel={cancelEditing}
          onSave={saveEditing}
        />
      )}
    </>
  );
}
