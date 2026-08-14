"use client";

import { useRef } from "react";
import { upsertBodyMetric } from "@/lib/actions/bodyMetrics";

export default function AddMetricForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await upsertBodyMetric(formData);
        formRef.current?.reset();
      }}
      className="card p-5 space-y-4"
    >
      <h3 className="font-display text-base">新增 / 更新指標</h3>
      <p className="text-xs text-muted -mt-2">同一天再次輸入會覆蓋原本的紀錄</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <div>
          <label className="label">日期</label>
          <input name="measured_date" type="date" className="input" defaultValue={today} required />
        </div>
        <div>
          <label className="label">體重 (KG)</label>
          <input name="weight" type="number" step="0.1" className="input" placeholder="60.0" />
        </div>
        <div>
          <label className="label">體脂 (%)</label>
          <input name="body_fat" type="number" step="0.1" className="input" placeholder="22.0" />
        </div>
        <div>
          <label className="label">內臟脂肪</label>
          <input name="visceral_fat" type="number" step="0.1" className="input" placeholder="8" />
        </div>
        <div>
          <label className="label">肌肉量 (KG)</label>
          <input name="muscle_mass" type="number" step="0.1" className="input" placeholder="45.0" />
        </div>
        <div>
          <label className="label">備註</label>
          <input name="notes" className="input" placeholder="選填" />
        </div>
      </div>

      <button type="submit" className="btn-primary">儲存</button>
    </form>
  );
}
