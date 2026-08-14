"use client";

import { useState, useTransition } from "react";
import { deleteExercise, updateExercise } from "@/lib/actions/exercises";
import type { Exercise } from "@/types/database.types";

function ExerciseRow({ ex }: { ex: Exercise }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="border-b border-line last:border-0 bg-paper/40">
        <td colSpan={5} className="px-4 py-4">
          <form
            action={async (formData) => {
              await updateExercise(ex.id, formData);
              setIsEditing(false);
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
          >
            <div className="lg:col-span-2">
              <label className="label">動作名稱</label>
              <input name="name" className="input" defaultValue={ex.name} required />
            </div>
            <div>
              <label className="label">肌群</label>
              <input name="muscle_group" className="input" defaultValue={ex.muscle_group ?? ""} />
            </div>
            <div>
              <label className="label">分類</label>
              <input name="category" className="input" defaultValue={ex.category ?? ""} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">組數</label>
                <input name="default_sets" type="number" className="input" defaultValue={ex.default_sets ?? ""} />
              </div>
              <div>
                <label className="label">次數</label>
                <input name="default_reps" className="input" defaultValue={ex.default_reps ?? ""} />
              </div>
              <div>
                <label className="label">單位</label>
                <input name="default_unit" className="input" defaultValue={ex.default_unit ?? "KG"} />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <label className="label">備註</label>
              <input name="notes" className="input" defaultValue={ex.notes ?? ""} />
            </div>
            <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
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
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 font-medium text-ink">{ex.name}</td>
      <td className="px-4 py-3 text-muted">{ex.muscle_group || "—"}</td>
      <td className="px-4 py-3 text-muted">{ex.category || "—"}</td>
      <td className="px-4 py-3 text-muted font-mono">
        {ex.default_sets ?? "-"} x {ex.default_reps ?? "-"} {ex.default_unit ?? ""}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <button onClick={() => setIsEditing(true)} className="text-xs text-muted hover:text-accent-dark mr-3">
          編輯
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(() => deleteExercise(ex.id))}
          className="text-xs text-muted hover:text-warn"
        >
          刪除
        </button>
      </td>
    </tr>
  );
}

export default function ExerciseTable({ exercises }: { exercises: Exercise[] }) {
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
            <ExerciseRow key={ex.id} ex={ex} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
