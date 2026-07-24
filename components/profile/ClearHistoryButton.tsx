"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { clearHistory } from "@/app/actions/calculator";

export function ClearHistoryButton() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await clearHistory();
          router.refresh();
        })
      }
      className="flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--danger)] disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" /> Clear
    </button>
  );
}