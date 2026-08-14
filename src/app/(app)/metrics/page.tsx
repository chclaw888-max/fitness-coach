import { createClient } from "@/lib/supabase/server";
import type { BodyMetric } from "@/types/database.types";
import AddMetricForm from "@/components/metrics/AddMetricForm";
import MetricsTable from "@/components/metrics/MetricsTable";
import BodyMetricsChart from "@/components/charts/BodyMetricsChart";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const supabase = createClient();
  const { data } = await supabase.from("body_metrics").select("*").order("measured_date", { ascending: true });
  const metrics = (data ?? []) as BodyMetric[];

  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow">Body Metrics</div>
        <h1 className="font-display text-2xl mt-1">身體指標</h1>
        <p className="text-sm text-muted mt-1">
          記錄體重、體脂、內臟脂肪與肌肉量，追蹤長期變化趨勢。
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-4">趨勢圖</h2>
        <BodyMetricsChart data={metrics} />
      </div>

      <AddMetricForm />
      <MetricsTable metrics={metrics} />
    </div>
  );
}
