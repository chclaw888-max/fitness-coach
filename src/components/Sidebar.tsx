"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "儀表板", index: "01" },
  { href: "/goals", label: "目標設定", index: "02" },
  { href: "/exercises", label: "訓練項目", index: "03" },
  { href: "/calendar", label: "訓練行事曆", index: "04" },
  { href: "/metrics", label: "身體指標", index: "05" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-ink text-paper min-h-screen p-6">
      <div className="flex items-center gap-2 mb-10">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-paper/60">
          Coaching System
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-paper/10 text-paper font-medium"
                  : "text-paper/60 hover:text-paper hover:bg-paper/5"
              )}
            >
              <span className="font-mono text-[10px] text-accent">{item.index}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-paper/10 font-mono text-[10px] text-paper/40">
        私人健身教練 · 訓練管理系統
      </div>
    </aside>
  );
}
