"use client";

import { useState, useTransition } from "react";
import { updateGoalProgress, toggleGoalCompleted, deleteGoal } from "@/lib/actions/goals";
import type { Goal } from "@/types/database.types";
import clsx from "clsx";

export default function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(goal.current_value ?? 0);

  const pct =
    !goal.is_checklist && goal.target_value
      ? Math.min(100, Math.round(((current ?? 0) / goal.target_value) * 100))
      : goal.is_completed
      ? 100
      : 0;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{goal.title}</p>
          {goal.metric_name && (
            <p className="text-xs text-muted mt-0.5">{goal.metric_name}</p>
          )}
        </div>
        <button
          onClick={() => startTransition(() => deleteGoal(goal.id))}
          disabled={isPending}
          className="text-xs text-muted hover:text-warn shrink-0"
          aria-label="刪除目標"
        >
          刪除
        </button>
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
