import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-ink/10 bg-white/90 p-6 shadow-panel backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
