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

  // Compute PR flags: for each exercise, find max weight and max reps within the month
  const maxWeightMap: Record<string, number> = {};
  const maxRepsMap: Record<string, number> = {};
  for (const log of (logs ?? []) as TrainingLog[]) {
    const name = log.exercise_name;
    const weight = log.weight ?? 0;
    const repsStr = log.reps ?? "";
    const repsNum = parseRepsToNumber(repsStr) ?? 0;
    if (!maxWeightMap[name] || weight > maxWeightMap[name]) {
      maxWeightMap[name] = weight;
    }
    if (!maxRepsMap[name] || repsNum > maxRepsMap[name]) {
      maxRepsMap[name] = repsNum;
    }
  }

  // Determine which logs are PRs (weight == max weight OR reps == max reps for that exercise)
  const prLogIds = new Set<string>();
  for (const log of (logs ?? []) as TrainingLog[]) {
    const name = log.exercise_name;
    const weight = log.weight ?? 0;
    const repsStr = log.reps ?? "";
    const repsNum = parseRepsToNumber(repsStr) ?? 0;
    if (weight === maxWeightMap[name] || repsNum === maxRepsMap[name]) {
      prLogIds.add(log.id);
    }
  }

  // Helper to parse reps string to number
  function parseRepsToNumber(reps: string | null): number | null {
    if (!reps) return null;
    const match = reps.match(/\d+(\.\d+)?/);
    return match ? Number(match[0]) : null;
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
        prLogIds={Array.from(prLogIds)}
      />
    </div>
  );
}
