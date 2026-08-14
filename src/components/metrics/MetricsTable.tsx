"use client";

import { useTransition } from "react";
import { deleteBodyMetric } from "@/lib/actions/bodyMetrics";
import type { BodyMetric } from "@/types/database.types";

export default function MetricsTable({ metrics }: { metrics: BodyMetric[] }) {
  const [isPending, startTransition] = useTransition();

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
            <tr key={m.id} className="border-b border-line last:border-0 font-mono text-xs">
              <td className="px-4 py-3 font-sans text-ink font-medium">{m.measured_date}</td>
              <td className="px-4 py-3">{m.weight ?? "—"}</td>
              <td className="px-4 py-3">{m.body_fat ?? "—"}</td>
              <td className="px-4 py-3">{m.visceral_fat ?? "—"}</td>
              <td className="px-4 py-3">{m.muscle_mass ?? "—"}</td>
              <td className="px-4 py-3 text-right font-sans">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteBodyMetric(m.id))}
                  className="text-xs text-muted hover:text-warn"
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
