"use client";

import { useRef } from "react";
import { createExercise } from "@/lib/actions/exercises";

export default function AddExerciseForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createExercise(formData);
        formRef.current?.reset();
      }}
      className="card p-5 space-y-4"
    >
      <h3 className="font-display text-base">新增訓練項目</h3>

      <div>
        <label className="label">動作名稱</label>
        <input name="name" className="input" placeholder="例如：啞鈴臥推" required />
      </div>

      <div>
        <label className="label">訓練肌群</label>
        <input name="muscle_group" className="input" placeholder="例如：胸肌、三頭肌、前三角" />
      </div>

      <div>
        <label className="label">分類</label>
        <input name="category" className="input" placeholder="例如：自主訓練 / 居家訓練 / 上課" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">預設組數</label>
          <input name="default_sets" type="number" className="input" placeholder="3" />
        </div>
        <div>
          <label className="label">預設次數</label>
          <input name="default_reps" className="input" placeholder="8-12" />
        </div>
        <div>
          <label className="label">單位</label>
          <input name="default_unit" className="input" defaultValue="KG" />
        </div>
      </div>

      <div>
        <label className="label">備註</label>
        <textarea name="notes" className="input" rows={2} placeholder="選填" />
      </div>

      <button type="submit" className="btn-primary w-full">新增項目</button>
    </form>
  );
}
