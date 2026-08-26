"use client";

import type { Goal, PeriodType } from "@/types/database.types";
import clsx from "clsx";
import { useState, useTransition } from "react";
import { deleteGoal } from "@/lib/actions/goals";

const PERIOD_LABEL: Record<PeriodType, string> = {
  year: "年度",
  month: "月度",
  week: "週間",
};

export function isGoalAchieved(goal: Goal) {
  return goal.is_checklist
    ? goal.is_completed
    : goal.target_value != null && (goal.current_value ?? 0) >= goal.target_value;
}

export default function GoalProgressGroup({
  periodType,
  goals,
  onDeleteGoal,
}: {
  periodType: PeriodType;
  goals: Goal[];
  onDeleteGoal?: (id: string) => Promise<void>;
}) {
  if (goals.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted border border-dashed border-line rounded">
        尚無{PERIOD_LABEL[periodType]}目標
      </div>
    );
  }

  const [deletePrompts, setDeletePrompts] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // 依 period_label（例如 2026 / 2026-08 / 2026-W33）分組，最新的排在最前面
  const grouped = new Map<string, Goal[]>();
  for (const g of goals) {
    if (!grouped.has(g.period_label)) grouped.set(g.period_label, []);
    grouped.get(g.period_label)!.push(g);
  }
  const labels = Array.from(grouped.keys()).sort().reverse();

  return (
    <div className="space-y-5">
      {labels.map((label) => {
        const items = grouped.get(label)!;
        return (
          <div key={label}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-medium text-accent-dark bg-accent-soft rounded px-2 py-0.5">
                {label}
              </span>
              <span className="text-xs text-muted">
                {items.filter(isGoalAchieved).length} / {items.length} 項達成
              </span>
            </div>
            <ul className="space-y-3">
              {items.map((goal) => {
                let displayPct = 0;
                let barPct = 0;
                if (!goal.is_checklist && goal.target_value != null) {
                  const current = goal.current_value ?? 0;
                  const target = goal.target_value;
                  if (target !== 0) {
                    displayPct = Math.round(((current - target) / target) * 100);
                    // barPct: progress towards target assuming increase goal (current/target) but cap at 100
                    barPct = Math.min(100, Math.round((current / target) * 100));
                  } else {
                    displayPct = current !== 0 ? 100 : 0;
                    barPct = displayPct;
                  }
                } else {
                  displayPct = goal.is_completed ? 100 : 0;
                  barPct = displayPct;
                }

                return (
                  <li key={goal.id} className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ink truncate max-w-[200px]">{goal.title}</span>
                        {onDeleteGoal && (
                          <button
                            onClick={() => {
                              setDeletePrompts(prev => ({ ...prev, [goal.id]: true }));
                            }}
                            className="text-xs text-muted hover:text-warn"
                            aria-label="刪除目標"
                          >
                            刪除
                          </button>
                        )}
                      </div>
                      {deletePrompts[goal.id] && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-warn">確定要刪除此目標嗎？此操作無法復原。</span>
                          <button
                            onClick={async () => {
                              setIsDeleting(prev => ({ ...prev, [goal.id]: true }));
                              try {
                                await onDeleteGoal?.(goal.id);
                                setDeletePrompts(prev => {
                                  const newPrompts = { ...prev };
                                  delete newPrompts[goal.id];
                                  return newPrompts;
                                });
                                setIsDeleting(prev => {
                                  const newState = { ...prev };
                                  delete newState[goal.id];
                                  return newState;
                                });
                              } catch (error) {
                                console.error('Failed to delete goal:', error);
                                setIsDeleting(prev => {
                                  const newState = { ...prev };
                                  delete newState[goal.id];
                                  return newState;
                                });
                              }
                            }}
                            className="text-xs text-muted hover:text-warn"
                          >
                            確認刪除
                          </button>
                          <button
                            onClick={() => {
                              setDeletePrompts(prev => {
                                const newPrompts = { ...prev };
                                delete newPrompts[goal.id];
                                return newPrompts;
                              });
                            }}
                            className="text-xs text-muted hover:text-warn"
                          >
                            取消
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted">
                        {goal.is_checklist
                          ? goal.is_completed ? "已完成" : "進行中"
                          : `${goal.current_value ?? 0}${goal.unit ?? ""} / ${goal.target_value ?? "-"}${goal.unit ?? ""}`}
                        <span className="ml-3 font-mono">
                          {displayPct >= 0 ? `+${displayPct}` : `${displayPct}`}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-20 rounded-full bg-line overflow-hidden shrink-0">
                      <div
                        className={clsx("h-full rounded-full", barPct >= 100 ? "bg-good" : "bg-accent")}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
