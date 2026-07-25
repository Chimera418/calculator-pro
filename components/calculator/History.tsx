"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Trash2, History as HistoryIcon } from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { formatCurrency } from "@/lib/utils";

interface SessionEntry {
  id: string;
  expression: string;
  result: string;
}

export function History({
  entries,
  onClear,
  onReuse,
}: {
  entries: SessionEntry[];
  onClear: () => void;
  onReuse: (result: string) => void;
}) {
  const gate = useFeatureGate("history");

  return (
    <div className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 shadow-[var(--shadow)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
          <HistoryIcon className="h-4 w-4" /> History
        </h2>
        {!gate.isLocked && entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--danger)]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {gate.isLocked ? (
        <button
          onClick={gate.onLockedClick}
          className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center transition hover:bg-[var(--surface-2)]"
        >
          <Lock className="h-6 w-6 text-[var(--lock)]" />
          <p className="text-sm font-medium text-[var(--fg)]">History is locked</p>
          <p className="text-xs text-[var(--muted)]">
            {gate.planName} — {formatCurrency(gate.price)}
          </p>
        </button>
      ) : entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-center text-xs text-[var(--muted)]">
          Your calculations will appear here.
        </div>
      ) : (
        <ul className="flex-1 space-y-1 overflow-y-auto">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <button
                  onClick={() => onReuse(e.result)}
                  className="w-full rounded-xl px-3 py-2 text-right transition hover:bg-[var(--surface-2)]"
                >
                  <div className="truncate text-xs text-[var(--muted)]">{e.expression}</div>
                  <div className="tnum truncate text-base font-medium text-[var(--fg)]">
                    = {e.result}
                  </div>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}