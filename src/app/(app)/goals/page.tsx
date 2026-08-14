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

export default async function GoalsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("period_label", { ascending: false })
    .order("created_at", { ascending: true });

  const goals = (data ?? []) as Goal[];

  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow">Goals</div>
        <h1 className="font-display text-2xl mt-1">目標設定</h1>
        <p className="text-sm text-muted mt-1">
          設定年度、月度、週間目標，並填入量化指標追蹤進度。
        </p>
      </div>

      <AddGoalForm />

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const items = goals.filter((g) => g.period_type === group.type);
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
