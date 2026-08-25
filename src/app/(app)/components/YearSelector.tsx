"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface YearSelectorProps {
  years: string[];
  defaultYear: string;
}

export default function YearSelector({ years, defaultYear }: YearSelectorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedYear = searchParams.get("year") ?? defaultYear;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <label className="text-sm text-muted mt-1 flex items-center">
      查詢年度：
      <select
        value={selectedYear}
        onChange={handleChange}
        className="ml-1 border rounded px-2 py-0.5 text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}