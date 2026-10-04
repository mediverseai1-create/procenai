export function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return <img src="/procenai-mark.png" alt="" className={className} />;
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
