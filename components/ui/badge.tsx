import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tone === "default" && "bg-ink/6 text-ink",
        tone === "success" && "bg-pine/12 text-pine",
        tone === "warning" && "bg-ember/12 text-ember"
      )}
    >
      {children}
    </span>
  );
}
