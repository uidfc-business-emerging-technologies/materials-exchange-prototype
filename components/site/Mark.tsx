/** The Teaching Materials Exchange mark: a square and a circle that overlap, with a knocked-out quarter. */
export function Mark({ size = 36, ink = "#13294B", accent = "#FF5F05", knock = "#FFFFFF", title }: { size?: number; ink?: string; accent?: string; knock?: string; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title} style={{ flex: "none" }}>
      <rect x="6" y="18" width="24" height="24" fill={ink} />
      <circle cx="30" cy="18" r="12" fill={accent} />
      <path d="M30 18H18A12 12 0 0 0 30 30Z" fill={knock} />
    </svg>
  );
}
