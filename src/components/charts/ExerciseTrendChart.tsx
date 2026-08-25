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
import type { Exercise, TrainingLog } from "@/types/database.types";

function parseRepsToNumber(reps: string | null): number | null {
  if (!reps) return null;
  const match = reps.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

const CustomTooltip = ({ active, payload, label }: { active: boolean; payload: Array<{ name: string; value: number }> | null; label: string }) => {
  if (active === false || payload === null) {
    return null;
  }
  return (
    <div className="custom-tooltip" style={{ padding: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', pointerEvents: 'none' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{label}</div>
      {payload.map((item) => {
        const { name, value } = item;
        let formatted = value;
        if (name === "總訓練量") formatted = `${Math.round(value)}`;
        else if (name === "預估1RM") formatted = Number.isInteger(value) ? value : value.toFixed(1);
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }} key={name}>
            <span>{name}：</span>
            <span>{formatted}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function ExerciseTrendChart({ logs, exercises }: { logs: TrainingLog[]; exercises: Exercise[] }) {
  const categoryByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of exercises) if (ex.category) map.set(ex.name, ex.category);
    return map;
  }, [exercises]);

  const groupedNames = useMemo(() => {
    const names = new Set<string>();
    for (const log of logs) names.add(log.exercise_name);
    const groups = new Map<string, string[]>();
    for (const name of Array.from(names).sort()) {
      const category = categoryByName.get(name) || "未分類";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(name);
    }
    return groups;
  }, [logs, categoryByName]);

  const allNames = useMemo(() => Array.from(groupedNames.values()).flat(), [groupedNames]);
  const [selected, setSelected] = useState<string>(allNames[0] ?? "");

  const chartData = useMemo(() => {
    const filtered = logs
      .filter((l) => l.exercise_name === selected)
      .sort((a, b) => a.log_date.localeCompare(b.log_date));

    // Aggregate by date
    const aggMap = new Map<string, { volume: number; oneRM: number; count: number }>();
    for (const log of filtered) {
      const weight = log.weight ?? 0;
      const repsStr = log.reps ?? "";
      const repsNum = parseRepsToNumber(repsStr);
      const reps = repsNum ?? 0;
      if (weight <= 0 || reps <= 0) continue;
      const volume = weight * reps;
      // Brzycki formula for 1RM: weight * (36 / (37 - reps))
      const oneRM = weight * (36 / (37 - reps));
      const date = log.log_date;
      const existing = aggMap.get(date) || { volume: 0, oneRM: 0, count: 0 };
      aggMap.set(date, {
        volume: existing.volume + volume,
        oneRM: Math.max(existing.oneRM, oneRM), // keep max 1RM for the day
        count: existing.count + 1,
      });
    }

    // Convert to array sorted by date
    const result = Array.from(aggMap.entries())
      .map(([date, data]) => ({
        date: date.slice(5), // MM-DD
        總訓練量: data.volume,
        預估1RM: data.oneRM,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }, [logs, selected]);

  if (allNames.length === 0) {
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
          {Array.from(groupedNames.entries()).map(([category, names]) => (
            <optgroup key={category} label={category}>
              {names.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {categoryByName.get(selected) && (
          <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-mono text-accent-dark">
            {categoryByName.get(selected)}
          </span>
        )}
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
            <CustomTooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="總訓練量" stroke="#0F9E8E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="預估1RM" stroke="#C6552F" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
