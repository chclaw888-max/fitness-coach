export default function StatCard({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="section-eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-display text-3xl text-ink">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
