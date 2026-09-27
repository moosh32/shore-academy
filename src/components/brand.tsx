import Link from "next/link";

export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="6" fill="currentColor" className="text-primary" />
      <path d="M5 20h22" stroke="#f6f1e6" strokeWidth="1.5" />
      <path
        d="M5 20c3-4 5-4 8 0s5 4 8 0 4-4 6 0"
        fill="none"
        stroke="#f6f1e6"
        strokeWidth="1.4"
      />
      <circle cx="23" cy="10" r="1.6" fill="#d4c19a" />
    </svg>
  );
}

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Mark />
      <span className="leading-tight">
        <span className="font-heading block text-[1.15rem] leading-none font-medium">
          אקדמיית שור
        </span>
        <span className="text-muted-foreground mt-1 block text-[11px]">מתמטיקת סיכון</span>
      </span>
    </Link>
  );
}
