import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const colorClass = tone === "dark" ? "text-primary-foreground" : "text-primary";

  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", colorClass, className)}
      aria-label="TNL Motors home"
    >
      <svg
        viewBox="0 0 190 76"
        className="h-10 w-[116px] shrink-0"
        role="img"
        aria-label="TNL Motors"
      >
        <g fill="currentColor">
          <text
            x="95"
            y="42"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="42"
            fontStyle="italic"
            fontWeight="900"
            letterSpacing="-3"
          >
            TNL
          </text>
          <text
            x="95"
            y="60"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="10"
            fontWeight="700"
            letterSpacing="4"
          >
            MOTORS
          </text>
        </g>
        <path
          d="M18 42C31 8 83 5 137 17c19 4 31 12 36 21"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".92"
        />
        <path
          d="M25 55c28 10 73 11 111 1 17-4 27-10 35-18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".72"
        />
      </svg>
    </Link>
  );
}
