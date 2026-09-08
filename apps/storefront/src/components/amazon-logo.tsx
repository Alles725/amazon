export function AmazonLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 66" role="img" aria-label="Amazon" className={className}>
      <text
        x="2"
        y="40"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="40"
        fontWeight="700"
        letterSpacing="-1"
        fill="#111"
      >
        amazon
      </text>
      <path
        d="M16 49C40 62 92 63 116 45"
        fill="none"
        stroke="#ff9900"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M104 40L120 43.5L109 55Z" fill="#ff9900" />
    </svg>
  );
}
