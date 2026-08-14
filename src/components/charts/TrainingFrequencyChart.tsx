"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Exercise, TrainingLog } from "@/types/database.types";

export default function TrainingFrequencyChart({ logs, exercises = [] }: { logs: TrainingLog[]; exercises?: Exercise[] }) {
  const categoryByName = new Map(exercises.filter((e) => e.category).map((e) => [e.name, e.category]));

  const counts = new Map<string, number>();
  for (const log of logs) {
    const key = log.exercise_name;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const chartData = Array.from(counts.entries())
    .map(([name, count]) => ({
      name: categoryByName.get(name) ? `${name}（${categoryByName.get(name)}）` : name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        近 30 天尚無訓練紀錄，前往「訓練行事曆」開始紀錄。
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#E4E1D9" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E4E1D9" }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#10182B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E4E1D9", fontSize: 12 }} />
        <Bar dataKey="count" name="次數" fill="#0F9E8E" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
