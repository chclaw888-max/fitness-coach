import type { Goal } from "@/types/database.types";
import clsx from "clsx";

const PERIOD_LABEL: Record<Goal["period_type"], string> = {
  year: "年度",
  month: "月度",
  week: "週間",
};

export default function GoalProgressList({ goals }: { goals: Goal[] }) {
  if (goals.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted">
        尚未設定目標，前往「目標設定」建立第一個目標。
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {goals.map((goal) => {
        const pct =
          !goal.is_checklist && goal.target_value
            ? Math.min(100, Math.round(((goal.current_value ?? 0) / goal.target_value) * 100))
            : goal.is_completed
            ? 100
            : 0;

        return (
          <li key={goal.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] uppercase text-muted shrink-0">
                  {PERIOD_LABEL[goal.period_type]}
                </span>
                <span className="text-sm font-medium text-ink truncate">{goal.title}</span>
              </div>
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
  );
}
