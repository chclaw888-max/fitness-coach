import type { Goal, PeriodType } from "@/types/database.types";
import clsx from "clsx";

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
}: {
  periodType: PeriodType;
  goals: Goal[];
}) {
  if (goals.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-muted border border-dashed border-line rounded">
        尚無{PERIOD_LABEL[periodType]}目標
      </div>
    );
  }

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
                const pct = !goal.is_checklist && goal.target_value
                  ? Math.min(100, Math.round(((goal.current_value ?? 0) / goal.target_value) * 100))
                  : goal.is_completed ? 100 : 0;

                return (
                  <li key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink truncate">{goal.title}</span>
                      <span className="text-xs font-mono text-muted shrink-0 ml-2">
                        {goal.is_checklist
                          ? goal.is_completed ? "已完成" : "進行中"
                          : `${goal.current_value ?? 0}${goal.unit ?? ""} / ${goal.target_value ?? "-"}${goal.unit ?? ""}`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                      <div
                        className={clsx("h-full rounded-full", pct >= 100 ? "bg-good" : "bg-accent")}
                        style={{ width: `${pct}%` }}
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
