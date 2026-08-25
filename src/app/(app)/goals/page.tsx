import { createClient } from "@/lib/supabase/server";
import type { Goal, PeriodType } from "@/types/database.types";
import AddGoalForm from "@/components/goals/AddGoalForm";
import GoalCard from "@/components/goals/GoalCard";
import YearSelector from "@/app/(app)/components/YearSelector";

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
            <YearSelector years={years} defaultYear={defaultYear} />
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
                <div className="space-y-4">
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