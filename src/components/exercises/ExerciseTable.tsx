"use client";

import { useTransition } from "react";
import { deleteExercise } from "@/lib/actions/exercises";
import type { Exercise } from "@/types/database.types";

export default function ExerciseTable({ exercises }: { exercises: Exercise[] }) {
  const [isPending, startTransition] = useTransition();

  if (exercises.length === 0) {
    return <div className="card p-6 text-sm text-muted text-center">尚無訓練項目</div>;
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">動作</th>
            <th className="px-4 py-3 font-medium">肌群</th>
            <th className="px-4 py-3 font-medium">分類</th>
            <th className="px-4 py-3 font-medium">預設組數 x 次數</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex) => (
            <tr key={ex.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 font-medium text-ink">{ex.name}</td>
              <td className="px-4 py-3 text-muted">{ex.muscle_group || "—"}</td>
              <td className="px-4 py-3 text-muted">{ex.category || "—"}</td>
              <td className="px-4 py-3 text-muted font-mono">
                {ex.default_sets ?? "-"} x {ex.default_reps ?? "-"} {ex.default_unit ?? ""}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteExercise(ex.id))}
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
