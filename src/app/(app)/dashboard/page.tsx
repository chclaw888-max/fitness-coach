import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/StatCard";
import GoalProgressGroup, { isGoalAchieved } from "@/components/GoalProgressGroup";
import BodyMetricsChart from "@/components/charts/BodyMetricsChart";
import TrainingFrequencyChart from "@/components/charts/TrainingFrequencyChart";
import ExerciseTrendChart from "@/components/charts/ExerciseTrendChart";
import ImportSeedButton from "@/components/ImportSeedButton";
import { currentPeriodLabel } from "@/lib/period";
import type { Goal, BodyMetric, TrainingLog, PeriodType } from "@/types/database.types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PERIOD_META: { type: PeriodType; label: string }[] = [
  { type: "year", label: "年度目標" },
  { type: "month", label: "月度目標" },
  { type: "week", label: "週間目標" },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [{ data: goals }, { data: metrics }, { data: recentLogs }, { data: allLogs }] = await Promise.all([
    supabase.from("goals").select("*").order("period_label", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("body_metrics").select("*").order("measured_date", { ascending: true }),
    supabase
      .from("training_logs")
      .select("*")
      .gte("log_date", thirtyDaysAgo)
      .order("log_date", { ascending: false }),
    supabase.from("training_logs").select("*").order("log_date", { ascending: true }),
  ]);

  const goalList = (goals ?? []) as Goal[];
  const metricList = (metrics ?? []) as BodyMetric[];
  const logList = (recentLogs ?? []) as TrainingLog[];
  const allLogList = (allLogs ?? []) as TrainingLog[];

  const latestMetric = metricList[metricList.length - 1];
  const firstMetric = metricList[0];
  const weightDelta =
    latestMetric?.weight != null && firstMetric?.weight != null
      ? (latestMetric.weight - firstMetric.weight).toFixed(1)
      : null;

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
          label="訓練項目趨勢"
          value={new Set(allLogList.map((l) => l.exercise_name)).size}
          unit="項"
          hint="可於下方查詢個別趨勢"
        />
      </div>

      {/* 年 / 月 / 週 目標達成，分開顯示並標示當前週期標籤 */}
      <div>
        <h2 className="font-display text-lg mb-3">目標達成（本期）</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERIOD_META.map(({ type, label }) => {
            const currentLabel = currentPeriodLabel(type);
            const items = goalList.filter((g) => g.period_type === type && g.period_label === currentLabel);
            const achieved = items.filter(isGoalAchieved).length;
            return (
              <StatCard
                key={type}
                label={label}
                value={items.length > 0 ? `${achieved} / ${items.length}` : "—"}
                hint={`週期：${currentLabel}`}
              />
            );
          })}
        </div>
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
          <h2 className="font-display text-lg">訓練項目趨勢查詢</h2>
          <Link href="/calendar" className="text-xs text-accent-dark hover:underline">
            前往行事曆新增紀錄 →
          </Link>
        </div>
        <p className="text-sm text-muted mb-4">選擇任一訓練項目，查看重量與次數隨時間的變化。</p>
        <ExerciseTrendChart logs={allLogList} />
      </div>

      {/* 目標進度：依年 / 月 / 週分區塊呈現，並顯示各期間標籤 */}
      <div>
        <h2 className="font-display text-lg mb-3">目標進度</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {PERIOD_META.map(({ type, label }) => (
            <div key={type} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base">{label}</h3>
                <Link href="/goals" className="text-xs text-accent-dark hover:underline">
                  管理 →
                </Link>
              </div>
              <GoalProgressGroup periodType={type} goals={goalList.filter((g) => g.period_type === type)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
