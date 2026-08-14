import { createClient } from "@/lib/supabase/server";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import type { Exercise, TrainingLog } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const now = new Date();
  const [yearStr, monthStr] = (searchParams.month ?? `${now.getFullYear()}-${now.getMonth() + 1}`).split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const supabase = createClient();
  const [{ data: logs }, { data: exercisesData }] = await Promise.all([
    supabase
      .from("training_logs")
      .select("*")
      .gte("log_date", monthStart)
      .lte("log_date", monthEnd)
      .order("created_at", { ascending: true }),
    supabase.from("exercises").select("*").order("name", { ascending: true }),
  ]);

  const logsByDate: Record<string, TrainingLog[]> = {};
  for (const log of (logs ?? []) as TrainingLog[]) {
    (logsByDate[log.log_date] ??= []).push(log);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow">Calendar</div>
        <h1 className="font-display text-2xl mt-1">訓練行事曆</h1>
        <p className="text-sm text-muted mt-1">
          點選日期填寫當天的訓練項目（器材或動作）與內容（重量或次數）。
        </p>
      </div>

      <CalendarGrid
        year={year}
        month={month}
        logsByDate={logsByDate}
        exercises={(exercisesData ?? []) as Exercise[]}
        todayISO={now.toISOString().slice(0, 10)}
      />
    </div>
  );
}
