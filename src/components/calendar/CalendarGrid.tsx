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

function TrainingLogItem({ log, category, isPr = false }: { log: TrainingLog; category?: string; isPr?: boolean }) {
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
              <label className="label">組號</label>
              <input name="set_number" type="number" className="input" defaultValue={log.set_number ?? ""} />
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
          <div>
            <label className="label">RPE (1-10)</label>
            <input name="rpe" type="number" min="1" max="10" className="input" defaultValue={log.rpe ?? ""} />
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
        {category && (
          <span className="mr-2 inline-block rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-mono text-accent-dark align-middle">
            {category}
          </span>
        )}
        {isPr && (
          <span className="mr-2 inline-block rounded bg-warn/20 px-1.5 py-0.5 text-[10px] font-mono text-warn-dark align-middle">
            🎉 新紀錄
          </span>
        )}
        <span className="font-medium text-ink">{log.exercise_name}</span>
        <span className="ml-2 text-muted font-mono text-xs">
          組#{log.set_number ?? "-"}: {log.reps ?? "-"} 次 x {log.weight != null ? `${log.weight}${log.unit ?? "KG` : "-"}
          {log.rpe != null ? ` · RPE ${log.rpe}` : ""}
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
  prLogIds = [],
}: {
  year: number;
  month: number;
  logsByDate: Record<string, TrainingLog[]>;
  exercises: Exercise[];
  todayISO: string;
  prLogIds?: string[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [customMode, setCustomMode] = useState(false);

  const exerciseById = useMemo(() => new Map(exercises.map((ex) => [ex.id, ex])), [exercises]);
  const exerciseByName = useMemo(() => new Map(exercises.map((ex) => [ex.name, ex])), [exercises]);
  const categoryOf = (log: TrainingLog) =>
    (log.exercise_id && exerciseById.get(log.exercise_id)?.category) ||
    exerciseByName.get(log.exercise_name)?.category ||
    undefined;

  const exercisesByCategory = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const ex of exercises) {
      const key = ex.category || "未分類";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ex);
    }
    return map;
  }, [exercises]);

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
                      {categoryOf(log) && <span className="text-accent-dark">[{categoryOf(log)}]</span>} {log.exercise_name}
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
              <TrainingLogItem key={log.id} log={log} category={categoryOf(log)} isPr={prLogIds.includes(log.id)} />
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
                    const form = e.target.form;
                    if (!form) return;
                    const hiddenInput = form.elements.namedItem("exercise_name") as HTMLInputElement;
                    const hiddenMuscle = form.elements.namedItem("muscle_group") as HTMLInputElement;
                    const hiddenSet = form.elements.namedItem("set_number") as HTMLInputElement;
                    const hiddenReps = form.elements.namedItem("reps") as HTMLInputElement;
                    const hiddenWeight = form.elements.namedItem("weight") as HTMLInputElement;
                    const hiddenUnit = form.elements.namedItem("unit") as HTMLInputElement;
                    const hiddenRpe = form.elements.namedItem("rpe") as HTMLInputElement;
                    if (hiddenInput) hiddenInput.value = opt?.text ?? "";
                    if (hiddenMuscle) hiddenMuscle.value = opt?.dataset.muscle ?? "";
                    // Set default values from exercise options
                    const ex = (opt?.value ? Array.from(exercisesByCategory.entries()).flatMap(([, items]) => items).find((ex) => ex.id === opt.value) : undefined) as Exercise | undefined;
                    if (ex) {
                      if (hiddenSet) hiddenSet.value = ex.default_sets?.toString() ?? "";
                      if (hiddenReps) hiddenReps.value = ex.default_reps ?? "";
                      if (hiddenWeight) hiddenWeight.value = ""; // weight not known
                      if (hiddenUnit) hiddenUnit.value = ex.default_unit ?? "KG";
                      if (hiddenRpe) hiddenRpe.value = ""; // RPE not known
                    }
                  }}
                >
                  <option value="">請選擇動作</option>
                  {Array.from(exercisesByCategory.entries()).map(([category, items]) => (
                    <optgroup key={category} label={category}>
                      {items.map((ex) => (
                        <option key={ex.id} value={ex.id} data-muscle={ex.muscle_group ?? ""}>
                          {ex.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
              <input type="hidden" name="exercise_name" />
              <input type="hidden" name="muscle_group" />
              <input type="hidden" name="set_number" />
              <input type="hidden" name="reps" />
              <input type="hidden" name="weight" />
              <input type="hidden" name="unit" />
              <input type="hidden" name="rpe" />
              <button
                type="button"
                onClick={() => setCustomMode((v) => !v)}
                className="mt-1 text-xs text-accent-dark hover:underline"
              >
                {customMode ? "改用項目庫選擇" : "改為手動輸入動作名稱"}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="label">組號</label>
                <input name="set_number" type="number" className="input" placeholder="1" />
              </div>
              <div>
                <label className="label">次數</label>
                <input name="reps" className="input" placeholder="10" />
              </div>
              <div>
                <label className="label">重量</label>
                <input name="weight" type="number" step="0.1" className="input" placeholder="20" />
              </div>
              <div>
                <label className="label">RPE (1-10)</label>
                <input name="rpe" type="number" min="1" max="10" className="input" placeholder="8" />
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
