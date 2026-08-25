type AdSlotProps = {
  variant?: "banner" | "box";
  className?: string;
};

// Placeholder per spazi pubblicitari (banner / box). In produzione,
// sostituire il contenuto con lo script/tag di Google AdSense o del
// network scelto, usando NEXT_PUBLIC_ADSENSE_CLIENT_ID.
export function AdSlot({ variant = "banner", className = "" }: AdSlotProps) {
  const sizeClasses = variant === "banner" ? "h-16 w-full" : "h-40 w-full";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-400 ${sizeClasses} ${className}`}
      aria-label="Spazio pubblicitario"
    >
      Spazio pubblicitario
    </div>
  );
}
