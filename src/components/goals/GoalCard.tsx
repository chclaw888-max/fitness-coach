"use client";

import { useState, useRef, useTransition } from "react";
import { updateGoalProgress, toggleGoalCompleted, deleteGoal, updateGoal } from "@/lib/actions/goals";
import type { Goal } from "@/types/database.types";
import clsx from "clsx";

export default function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(goal.current_value ?? 0);
  const [isEditing, setIsEditing] = useState(false);
  const [isChecklistEdit, setIsChecklistEdit] = useState(goal.is_checklist);
  const formRef = useRef<HTMLFormElement>(null);

  const pct =
    !goal.is_checklist && goal.target_value
      ? Math.min(100, Math.round(((current ?? 0) / goal.target_value) * 100))
      : goal.is_completed
      ? 100
      : 0;

  if (isEditing) {
    return (
      <form
        ref={formRef}
        action={async (formData) => {
          await updateGoal(goal.id, formData);
          setIsEditing(false);
        }}
        className="card p-4 space-y-3"
      >
        <div>
          <label className="label">目標標題</label>
          <input name="title" className="input" defaultValue={goal.title} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">週期</label>
            <select name="period_type" className="input" defaultValue={goal.period_type}>
              <option value="year">年度</option>
              <option value="month">月度</option>
              <option value="week">週間</option>
            </select>
          </div>
          <div>
            <label className="label">週期標籤</label>
            <input name="period_label" className="input" defaultValue={goal.period_label} required />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="is_checklist"
            checked={isChecklistEdit}
            onChange={(e) => setIsChecklistEdit(e.target.checked)}
            className="rounded border-line"
          />
          非量化目標（以完成勾選為主）
        </label>

        {!isChecklistEdit && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">量化指標</label>
              <input name="metric_name" className="input" defaultValue={goal.metric_name ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">目標值</label>
                <input name="target_value" type="number" step="0.1" className="input" defaultValue={goal.target_value ?? ""} />
              </div>
              <div>
                <label className="label">單位</label>
                <input name="unit" className="input" defaultValue={goal.unit ?? ""} />
              </div>
            </div>
            <input type="hidden" name="current_value" value={goal.current_value ?? 0} />
          </div>
        )}

        <div>
          <label className="label">備註</label>
          <textarea name="notes" className="input" rows={2} defaultValue={goal.notes ?? ""} />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 text-sm">儲存</button>
          <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1 text-sm">
            取消
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{goal.title}</p>
          {goal.metric_name && (
            <p className="text-xs text-muted mt-0.5">{goal.metric_name}</p>
          )}
          {(goal.period_type === "month" || goal.period_type === "week") && (
            <p className="text-xs text-muted mt-0.5">{goal.period_label}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setIsEditing(true)} className="text-xs text-muted hover:text-accent-dark">
            編輯
          </button>
          <button
            onClick={() => startTransition(() => deleteGoal(goal.id))}
            disabled={isPending}
            className="text-xs text-muted hover:text-warn"
            aria-label="刪除目標"
          >
            刪除
          </button>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-line overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", pct >= 100 ? "bg-good" : "bg-accent")}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {goal.is_checklist ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked={goal.is_completed}
              onChange={(e) => startTransition(() => toggleGoalCompleted(goal.id, e.target.checked))}
              className="rounded border-line"
            />
            {goal.is_completed ? "已完成" : "標記完成"}
          </label>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <input
              type="number"
              step="0.1"
              className="input w-24 py-1"
              value={current ?? ""}
              onChange={(e) => setCurrent(Number(e.target.value))}
              onBlur={() => startTransition(() => updateGoalProgress(goal.id, current ?? 0))}
            />
            <span className="text-muted text-xs">
              / {goal.target_value ?? "-"} {goal.unit}
            </span>
          </div>
        )}
        <span className="font-mono text-xs text-muted">{pct}%</span>
      </div>
    </div>
  );
}
