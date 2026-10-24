import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** CSS-only infinite marquee (Aceternity "infinite moving cards"); pauses on hover. */
export function Marquee({ children, className, duration = "40s", reverse = false }: { children: ReactNode; className?: string; duration?: string; reverse?: boolean }) {
  return (
    <div className={cn("group relative flex overflow-hidden mask-fade-x", className)} style={{ ["--marquee-duration" as string]: duration }}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className={cn(
            "flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
