"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { importSeedData } from "@/lib/actions/seed";

export default function ImportSeedButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        className="btn-secondary text-xs px-3 py-1.5"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await importSeedData();
            setMessage(
              result?.alreadyImported
                ? "已匯入過範例資料"
                : "已匯入教練規劃的訓練庫與目標範本"
            );
            router.refresh();
          })
        }
      >
        {isPending ? "匯入中…" : "匯入 Excel 範例資料"}
      </button>
      {message && <span className="text-xs text-muted">{message}</span>}
    </div>
  );
}
