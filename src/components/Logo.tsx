export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M9 27V7h8.5a5.5 5.5 0 0 1 0 11H14" stroke="var(--primary)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11v16" stroke="var(--primary)" strokeWidth="3.2" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className={`font-display text-xl font-semibold ${light ? "text-white" : "text-foreground"}`}>
        procen <span className="text-primary">ai</span>
      </span>
    </span>
  );
}
