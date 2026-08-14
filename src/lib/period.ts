export function currentPeriodLabel(period: "year" | "month" | "week", base: Date = new Date()) {
  if (period === "year") return String(base.getFullYear());
  if (period === "month") return base.toISOString().slice(0, 7);

  // week：ISO 週別 YYYY-Www
  const d = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
