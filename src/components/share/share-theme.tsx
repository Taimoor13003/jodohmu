/* Visual language for recipient-facing profile links: an editorial, private
   introduction — ivory paper, ink, hairlines, a restrained gold and rose. */

export const T = {
  paper: "#FBF8F3",
  paperDeep: "#F3ECE1",
  card: "#FFFFFF",
  ink: "#1C1917",
  body: "#44403C",
  muted: "#78716C",
  faint: "#A8A29E",
  hairline: "#E9E2D6",
  navy: "#0B3A86",
  navyDeep: "#0A2754",
  rose: "#9B2242",
  roseSoft: "#FBF0F3",
  gold: "#A8834A",
  goldSoft: "#F4EBDC",
  sage: "#EDF3EE",
  sageInk: "#3C6A51",
};

export const serif = "var(--font-playfair), Georgia, 'Times New Roman', serif";

export const cardShadow = "0 1px 2px rgba(28,25,23,0.04), 0 18px 48px -20px rgba(28,25,23,0.18)";

/** Quiet eight-point-star lattice, used where a photo is intentionally withheld. */
export function GeometricPattern({ color = T.gold, opacity = 0.16 }: { color?: string; opacity?: number }) {
  const id = "jm-star-lattice";
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full" style={{ opacity }}>
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M28 6 L34 22 L50 28 L34 34 L28 50 L22 34 L6 28 L22 22 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
          />
          <rect x="18" y="18" width="20" height="20" fill="none" stroke={color} strokeWidth="0.9" transform="rotate(45 28 28)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function Eyebrow({ children, color = T.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="text-[10.5px] font-extrabold uppercase" style={{ color, letterSpacing: "0.22em" }}>
      {children}
    </p>
  );
}

export function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
