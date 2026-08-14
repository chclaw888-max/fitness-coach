"use client";

import { useState, useRef } from "react";
import { createGoal } from "@/lib/actions/goals";

function defaultLabel(period: string) {
  const now = new Date();
  if (period === "year") return String(now.getFullYear());
  if (period === "month") return now.toISOString().slice(0, 7);
  // week：ISO 週別 YYYY-Www
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export default function AddGoalForm() {
  const [period, setPeriod] = useState("month");
  const [isChecklist, setIsChecklist] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createGoal(formData);
        formRef.current?.reset();
        setIsChecklist(false);
      }}
      className="card p-5 space-y-4"
    >
      <h3 className="font-display text-base">新增目標</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">週期</label>
          <select
            name="period_type"
            className="input"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="year">年度</option>
            <option value="month">月度</option>
            <option value="week">週間</option>
          </select>
        </div>
        <div>
          <label className="label">週期標籤</label>
          <input
            name="period_label"
            className="input"
            defaultValue={defaultLabel(period)}
            key={period}
            placeholder="2026 / 2026-08 / 2026-W33"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">目標標題</label>
        <input name="title" className="input" placeholder="例如：槓鈴臥推達 0.5 倍自體重" required />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          name="is_checklist"
          checked={isChecklist}
          onChange={(e) => setIsChecklist(e.target.checked)}
          className="rounded border-line"
        />
        非量化目標（以完成勾選為主，例如「熟悉肌肉位置」）
      </label>

      {!isChecklist && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">量化指標</label>
            <input name="metric_name" className="input" placeholder="例如：臥推重量" />
          </div>
          <div>
            <label className="label">目標值</label>
            <input name="target_value" type="number" step="0.1" className="input" placeholder="45" />
          </div>
          <div>
            <label className="label">單位</label>
            <input name="unit" className="input" placeholder="KG" />
          </div>
        </div>
      )}

      <div>
        <label className="label">備註</label>
        <textarea name="notes" className="input" rows={2} placeholder="選填" />
      </div>

      <button type="submit" className="btn-primary w-full">新增目標</button>
    </form>
  );
}
