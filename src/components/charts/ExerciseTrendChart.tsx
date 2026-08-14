"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TrainingLog } from "@/types/database.types";

function parseRepsToNumber(reps: string | null): number | null {
  if (!reps) return null;
  const match = reps.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export default function ExerciseTrendChart({ logs }: { logs: TrainingLog[] }) {
  const exerciseNames = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(log.exercise_name);
    return Array.from(set).sort();
  }, [logs]);

  const [selected, setSelected] = useState<string>(exerciseNames[0] ?? "");

  const chartData = useMemo(() => {
    return logs
      .filter((l) => l.exercise_name === selected)
      .slice()
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .map((l) => ({
        date: l.log_date.slice(5),
        重量: l.weight,
        次數: parseRepsToNumber(l.reps),
      }));
  }, [logs, selected]);

  if (exerciseNames.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        尚無訓練紀錄，前往「訓練行事曆」開始紀錄後即可查詢趨勢。
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label className="label mb-0 shrink-0">選擇訓練項目</label>
        <select
          className="input max-w-xs"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          此項目尚無紀錄
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#E4E1D9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E4E1D9" }} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E4E1D9", fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="重量" stroke="#0F9E8E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="次數" stroke="#C6552F" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
