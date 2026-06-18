/** Brasão / monograma — assinatura visual do casal (SVG puro, sem JS). */
export function Crest({
  left,
  right,
  size = 96,
}: {
  left: string;
  right: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path
        d="M50 5 V19 M44 11 H56"
        stroke="var(--ink-accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="54" r="33" fill="none" stroke="var(--ink-accent)" strokeWidth="1.1" />
      <circle cx="50" cy="54" r="28.5" fill="none" stroke="var(--ink-accent)" strokeWidth="0.5" opacity="0.8" />
      <g fill="none" stroke="var(--ink-accent)" strokeWidth="1" strokeLinecap="round">
        <path d="M50 86 C36 85 26 76 23 64" />
        <path d="M50 86 C64 85 74 76 77 64" />
        <path d="M31 74 q-5 -3 -5 -8" />
        <path d="M31 74 q4 -4 9 -3" />
        <path d="M27 66 q-5 -2 -6 -7" />
        <path d="M27 66 q4 -4 9 -3" />
        <path d="M69 74 q5 -3 5 -8" />
        <path d="M69 74 q-4 -4 -9 -3" />
        <path d="M73 66 q5 -2 6 -7" />
        <path d="M73 66 q-4 -4 -9 -3" />
      </g>
      <text x="37.5" y="62" textAnchor="middle" fill="var(--on-ink)" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500 }}>
        {left || "A"}
      </text>
      <text x="50" y="60" textAnchor="middle" fill="var(--ink-accent)" style={{ fontFamily: "var(--font-display)", fontSize: 16, fontStyle: "italic" }}>
        &amp;
      </text>
      <text x="62.5" y="62" textAnchor="middle" fill="var(--on-ink)" style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500 }}>
        {right || "B"}
      </text>
    </svg>
  );
}
