"use client";

import { useState, useRef } from "react";
import { createGoal } from "@/lib/actions/goals";
import { currentPeriodLabel } from "@/lib/period";

function defaultLabel(period: string) {
  return currentPeriodLabel(period as "year" | "month" | "week");
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="label">目標標題</label>
          <input name="title" className="input" placeholder="例如：槓鈴臥推達 0.5 倍自體重" required />
        </div>
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
        <div className="grid sm:grid-cols-3 gap-3">
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

      <button type="submit" className="btn-primary">新增目標</button>
    </form>
  );
}
