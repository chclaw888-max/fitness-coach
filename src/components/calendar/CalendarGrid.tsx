"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { createTrainingLog, deleteTrainingLog, updateTrainingLog } from "@/lib/actions/trainingLogs";
import type { Exercise, TrainingLog } from "@/types/database.types";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function TrainingLogItem({ log }: { log: TrainingLog }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="rounded border border-line px-3 py-3">
        <form
          action={async (formData) => {
            await updateTrainingLog(log.id, formData);
            setIsEditing(false);
          }}
          className="grid sm:grid-cols-2 gap-2"
        >
          <div className="sm:col-span-2">
            <label className="label">訓練項目</label>
            <input name="exercise_name" className="input" defaultValue={log.exercise_name} required />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:col-span-2">
            <div>
              <label className="label">組數</label>
              <input name="sets" type="number" className="input" defaultValue={log.sets ?? ""} />
            </div>
            <div>
              <label className="label">次數</label>
              <input name="reps" className="input" defaultValue={log.reps ?? ""} />
            </div>
            <div>
              <label className="label">重量</label>
              <input name="weight" type="number" step="0.1" className="input" defaultValue={log.weight ?? ""} />
            </div>
          </div>
          <div>
            <label className="label">肌群</label>
            <input name="muscle_group" className="input" defaultValue={log.muscle_group ?? ""} />
          </div>
          <div>
            <label className="label">單位</label>
            <input name="unit" className="input" defaultValue={log.unit ?? "KG"} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">備註</label>
            <input name="notes" className="input" defaultValue={log.notes ?? ""} />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary text-sm px-4 py-1.5">儲存</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary text-sm px-4 py-1.5">
              取消
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded border border-line px-3 py-2 text-sm">
      <div>
        <span className="font-medium text-ink">{log.exercise_name}</span>
        <span className="ml-2 text-muted font-mono text-xs">
          {log.sets ?? "-"} 組 x {log.reps ?? "-"} 下
          {log.weight != null ? ` · ${log.weight}${log.unit ?? "KG"}` : ""}
        </span>
        {log.muscle_group && (
          <span className="ml-2 text-muted text-xs">（{log.muscle_group}）</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => setIsEditing(true)} className="text-xs text-muted hover:text-accent-dark">
          編輯
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteTrainingLog(log.id))}
          className="text-xs text-muted hover:text-warn"
        >
          刪除
        </button>
      </div>
    </li>
  );
}

export default function CalendarGrid({
  year,
  month, // 1-12
  logsByDate,
  exercises,
  todayISO,
}: {
  year: number;
  month: number;
  logsByDate: Record<string, TrainingLog[]>;
  exercises: Exercise[];
  todayISO: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [customMode, setCustomMode] = useState(false);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const startWeekday = firstOfMonth.getUTCDay(); // 0=Sun
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const arr: { date: string | null; day: number | null }[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(year, month - 1, d));
      arr.push({ date: toISODate(date), day: d });
    }
    while (arr.length % 7 !== 0) arr.push({ date: null, day: null });
    return arr;
  }, [year, month]);

  const selectedLogs = logsByDate[selectedDate] ?? [];

  function changeMonth(delta: number) {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    router.push(`/calendar?month=${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="btn-secondary px-3 py-1.5 text-xs">
            ← 上個月
          </button>
          <h2 className="font-display text-lg">
            {year} 年 {month} 月
          </h2>
          <button onClick={() => changeMonth(1)} className="btn-secondary px-3 py-1.5 text-xs">
            下個月 →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1 font-mono">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, i) => {
            if (!cell.date) return <div key={i} />;
            const logs = logsByDate[cell.date] ?? [];
            const isSelected = cell.date === selectedDate;
            const isToday = cell.date === todayISO;
            return (
              <button
                key={cell.date}
                onClick={() => setSelectedDate(cell.date!)}
                className={clsx(
                  "min-h-[76px] rounded border p-2 text-left align-top transition-colors",
                  isSelected ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent/50"
                )}
              >
                <div className={clsx("font-mono text-xs", isToday ? "text-accent-dark font-semibold" : "text-muted")}>
                  {cell.day}
                </div>
                <div className="mt-1 space-y-0.5">
                  {logs.slice(0, 2).map((log) => (
                    <div key={log.id} className="truncate rounded bg-ink/5 px-1 py-0.5 text-[10px] text-ink">
                      {log.exercise_name}
                    </div>
                  ))}
                  {logs.length > 2 && (
                    <div className="text-[10px] text-muted">+{logs.length - 2} 項</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base">{selectedDate} 訓練紀錄</h3>
        </div>

        {selectedLogs.length > 0 && (
          <ul className="mb-5 space-y-2">
            {selectedLogs.map((log) => (
              <TrainingLogItem key={log.id} log={log} />
            ))}
          </ul>
        )}

        <form
          action={async (formData) => {
            formData.set("log_date", selectedDate);
            await createTrainingLog(formData);
          }}
          className="space-y-3"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">訓練項目</label>
              {customMode ? (
                <input name="exercise_name" className="input" placeholder="輸入自訂動作名稱" required />
              ) : (
                <select
                  name="exercise_id"
                  className="input"
                  required
                  onChange={(e) => {
                    const opt = e.target.selectedOptions[0];
                    const hiddenInput = e.target.form?.elements.namedItem("exercise_name") as HTMLInputElement;
                    const hiddenMuscle = e.target.form?.elements.namedItem("muscle_group") as HTMLInputElement;
                    if (hiddenInput) hiddenInput.value = opt?.text ?? "";
                    if (hiddenMuscle) hiddenMuscle.value = opt?.dataset.muscle ?? "";
                  }}
                >
                  <option value="">請選擇動作</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id} data-muscle={ex.muscle_group ?? ""}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              )}
              <input type="hidden" name="exercise_name" />
              <input type="hidden" name="muscle_group" />
              <button
                type="button"
                onClick={() => setCustomMode((v) => !v)}
                className="mt-1 text-xs text-accent-dark hover:underline"
              >
                {customMode ? "改用項目庫選擇" : "改為手動輸入動作名稱"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">組數</label>
                <input name="sets" type="number" className="input" placeholder="3" />
              </div>
              <div>
                <label className="label">次數</label>
                <input name="reps" className="input" placeholder="10" />
              </div>
              <div>
                <label className="label">重量</label>
                <input name="weight" type="number" step="0.1" className="input" placeholder="20" />
              </div>
            </div>
          </div>

          <div>
            <label className="label">單位</label>
            <input name="unit" className="input" defaultValue="KG" />
          </div>

          <div>
            <label className="label">備註</label>
            <input name="notes" className="input" placeholder="選填" />
          </div>

          <button type="submit" className="btn-primary">新增到 {selectedDate}</button>
        </form>
      </div>
    </div>
  );
}
