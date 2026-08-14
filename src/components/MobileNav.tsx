"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "儀表板" },
  { href: "/goals", label: "目標設定" },
  { href: "/exercises", label: "訓練項目" },
  { href: "/calendar", label: "訓練行事曆" },
  { href: "/metrics", label: "身體指標" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded border border-line px-3 py-1.5 text-sm"
        aria-expanded={open}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        選單
      </button>
      {open && (
        <div className="absolute left-0 top-11 w-48 rounded border border-line bg-surface shadow-card py-2 z-20">
          {NAV_ITEMS.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block px-4 py-2 text-sm",
                  active ? "text-accent-dark font-medium" : "text-ink hover:bg-paper"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
