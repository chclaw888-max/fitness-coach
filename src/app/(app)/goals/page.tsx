import { createClient } from "@/lib/supabase/server";
import type { Goal, PeriodType } from "@/types/database.types";
import AddGoalForm from "@/components/goals/AddGoalForm";
import GoalCard from "@/components/goals/GoalCard";

export const dynamic = "force-dynamic";

const GROUPS: { type: PeriodType; label: string }[] = [
  { type: "year", label: "年度目標" },
  { type: "month", label: "月度目標" },
  { type: "week", label: "週間目標" },
];

export default async function GoalsPage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("period_label", { ascending: false })
    .order("created_at", { ascending: true });

  const yearParams = await searchParams;
  const goals = (data ?? []) as Goal[];

  // Year selector logic
  const years = [...new Set(goals.filter(g => g.period_type === "year").map(g => g.period_label))].sort((a, b) => b.localeCompare(a));
  const defaultYear = years.length > 0 ? years[0] : String(new Date().getFullYear());
  const selectedYear = yearParams.year ?? defaultYear;
  const filteredGoals = goals.filter(g => g.period_label.startsWith(selectedYear));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="section-eyebrow">Goals</div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display text-2xl mt-1">目標設定</h1>
            <label className="text-sm text-muted mt-1 flex items-center">
              查詢年度：
              <select
                value={selectedYear}
                onChange={(e) => {
                  const year = e.target.value;
                  window.location.href = `${window.location.pathname}?year=${year}`;
                }}
                className="ml-1 border rounded px-2 py-0.5 text-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <AddGoalForm />

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const items = filteredGoals.filter((g) => g.period_type === group.type);
          return (
            <div key={group.type}>
              <h2 className="font-display text-base mb-3">{group.label}</h2>
              {items.length === 0 ? (
                <div className="card p-6 text-sm text-muted text-center">
                  尚無{group.label}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}