"use client";

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
import type { BodyMetric } from "@/types/database.types";

export default function BodyMetricsChart({ data }: { data: BodyMetric[] }) {
  const chartData = data
    .slice()
    .sort((a, b) => a.measured_date.localeCompare(b.measured_date))
    .map((d) => ({
      date: d.measured_date.slice(5), // MM-DD
      體重: d.weight,
      體脂: d.body_fat,
      內臟脂肪: d.visceral_fat,
      肌肉量: d.muscle_mass,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        尚無身體指標紀錄，前往「身體指標」頁面新增第一筆資料。
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#E4E1D9" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={{ stroke: "#E4E1D9" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#E4E1D9", fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="體重" stroke="#0F9E8E" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="體脂" stroke="#C6552F" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="肌肉量" stroke="#10182B" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="內臟脂肪" stroke="#9CA3AF" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
