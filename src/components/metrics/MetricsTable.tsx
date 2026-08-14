"use client";

import { useState, useTransition } from "react";
import { deleteBodyMetric, updateBodyMetric } from "@/lib/actions/bodyMetrics";
import type { BodyMetric } from "@/types/database.types";

function MetricRow({ m }: { m: BodyMetric }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="border-b border-line last:border-0 bg-paper/40">
        <td colSpan={6} className="px-4 py-4">
          <form
            action={async (formData) => {
              await updateBodyMetric(m.id, formData);
              setIsEditing(false);
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end"
          >
            <div>
              <label className="label">日期</label>
              <input name="measured_date" type="date" className="input" defaultValue={m.measured_date} required />
            </div>
            <div>
              <label className="label">體重</label>
              <input name="weight" type="number" step="0.1" className="input" defaultValue={m.weight ?? ""} />
            </div>
            <div>
              <label className="label">體脂</label>
              <input name="body_fat" type="number" step="0.1" className="input" defaultValue={m.body_fat ?? ""} />
            </div>
            <div>
              <label className="label">內臟脂肪</label>
              <input name="visceral_fat" type="number" step="0.1" className="input" defaultValue={m.visceral_fat ?? ""} />
            </div>
            <div>
              <label className="label">肌肉量</label>
              <input name="muscle_mass" type="number" step="0.1" className="input" defaultValue={m.muscle_mass ?? ""} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm px-4 py-1.5">儲存</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary text-sm px-4 py-1.5">
                取消
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0 font-mono text-xs">
      <td className="px-4 py-3 font-sans text-ink font-medium">{m.measured_date}</td>
      <td className="px-4 py-3">{m.weight ?? "—"}</td>
      <td className="px-4 py-3">{m.body_fat ?? "—"}</td>
      <td className="px-4 py-3">{m.visceral_fat ?? "—"}</td>
      <td className="px-4 py-3">{m.muscle_mass ?? "—"}</td>
      <td className="px-4 py-3 text-right font-sans whitespace-nowrap">
        <button onClick={() => setIsEditing(true)} className="text-xs text-muted hover:text-accent-dark mr-3">
          編輯
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteBodyMetric(m.id))}
          className="text-xs text-muted hover:text-warn"
        >
          刪除
        </button>
      </td>
    </tr>
  );
}

export default function MetricsTable({ metrics }: { metrics: BodyMetric[] }) {
  if (metrics.length === 0) {
    return <div className="card p-6 text-sm text-muted text-center">尚無身體指標紀錄</div>;
  }

  const sorted = metrics.slice().sort((a, b) => b.measured_date.localeCompare(a.measured_date));

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">日期</th>
            <th className="px-4 py-3 font-medium">體重</th>
            <th className="px-4 py-3 font-medium">體脂</th>
            <th className="px-4 py-3 font-medium">內臟脂肪</th>
            <th className="px-4 py-3 font-medium">肌肉量</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => (
            <MetricRow key={m.id} m={m} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
