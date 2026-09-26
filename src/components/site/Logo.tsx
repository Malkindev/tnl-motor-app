import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="TNL Motor home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-accent">
        <span className="font-display text-sm font-extrabold tracking-tight text-accent-foreground">
          T
        </span>
        <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent-foreground/70" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-lg font-extrabold uppercase tracking-tight",
            tone === "dark" ? "text-ink-foreground" : "text-foreground",
          )}
        >
          TNL<span className="text-accent"> Motor</span>
        </span>
        <span
          className={cn(
            "block text-[0.6rem] font-semibold uppercase tracking-[0.28em]",
            tone === "dark" ? "text-ink-muted" : "text-muted-foreground",
          )}
        >
          Quality Vehicles
        </span>
      </span>
    </Link>
  );
}
