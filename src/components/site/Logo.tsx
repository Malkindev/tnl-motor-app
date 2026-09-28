import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex shrink-0 items-center", className)}
      aria-label="TNL Motors home"
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-white p-1",
          tone === "dark" ? "shadow-sm" : "shadow-none",
        )}
      >
        <img
          src="/tnl-motors-logo.svg"
          alt="TNL Motors"
          width={783}
          height={438}
          decoding="async"
          fetchPriority="high"
          className="block h-auto w-24 sm:w-28 md:w-32"
        />
      </span>
    </Link>
  );
}
