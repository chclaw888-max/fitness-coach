import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import GoalProgressList from "@/components/GoalProgressList";
import BodyMetricsChart from "@/components/charts/BodyMetricsChart";
import TrainingFrequencyChart from "@/components/charts/TrainingFrequencyChart";
import ImportSeedButton from "@/components/ImportSeedButton";
import type { Goal, BodyMetric, TrainingLog } from "@/types/database.types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [{ data: goals }, { data: metrics }, { data: recentLogs }] = await Promise.all([
    supabase.from("goals").select("*").order("created_at", { ascending: true }),
    supabase.from("body_metrics").select("*").order("measured_date", { ascending: true }),
    supabase
      .from("training_logs")
      .select("*")
      .gte("log_date", thirtyDaysAgo)
      .order("log_date", { ascending: false }),
  ]);

  const goalList = (goals ?? []) as Goal[];
  const metricList = (metrics ?? []) as BodyMetric[];
  const logList = (recentLogs ?? []) as TrainingLog[];

  const latestMetric = metricList[metricList.length - 1];
  const firstMetric = metricList[0];
  const weightDelta =
    latestMetric?.weight != null && firstMetric?.weight != null
      ? (latestMetric.weight - firstMetric.weight).toFixed(1)
      : null;

  const completedGoals = goalList.filter((g) =>
    g.is_checklist ? g.is_completed : g.target_value ? (g.current_value ?? 0) >= g.target_value : false
  ).length;

  const isEmpty = goalList.length === 0 && logList.length === 0 && metricList.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="section-eyebrow">Dashboard</div>
          <h1 className="font-display text-2xl mt-1">總覽儀表板</h1>
        </div>
        {isEmpty && <ImportSeedButton />}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="最新體重"
          value={latestMetric?.weight ?? "—"}
          unit={latestMetric?.weight != null ? "KG" : undefined}
          hint={weightDelta ? `累積變化 ${weightDelta} KG` : "尚無紀錄"}
        />
        <StatCard
          label="最新體脂"
          value={latestMetric?.body_fat ?? "—"}
          unit={latestMetric?.body_fat != null ? "%" : undefined}
          hint={latestMetric ? latestMetric.measured_date : "尚無紀錄"}
        />
        <StatCard
          label="近 30 天訓練次數"
          value={logList.length}
          unit="次"
          hint="含所有訓練項目"
        />
        <StatCard
          label="目標達成"
          value={`${completedGoals} / ${goalList.length}`}
          hint="年 / 月 / 週目標總計"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">身體指標趨勢</h2>
            <Link href="/metrics" className="text-xs text-accent-dark hover:underline">
              查看全部 →
            </Link>
          </div>
          <BodyMetricsChart data={metricList} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">近 30 天訓練頻率</h2>
            <Link href="/calendar" className="text-xs text-accent-dark hover:underline">
              查看行事曆 →
            </Link>
          </div>
          <TrainingFrequencyChart logs={logList} />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">目標進度</h2>
          <Link href="/goals" className="text-xs text-accent-dark hover:underline">
            管理目標 →
          </Link>
        </div>
        <GoalProgressList goals={goalList} />
      </div>
    </div>
  );
}
