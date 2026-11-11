"use client";

import { useEffect } from "react";

export function Toast({ msg, type = "ok", onDone }: { msg: string; type?: "ok" | "err"; onDone: () => void }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
        type === "ok" ? "bg-emerald-600" : "bg-red-600"
      }`}
    >
      {msg}
    </div>
  );
}
