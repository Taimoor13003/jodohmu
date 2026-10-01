import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

/* The branded 1200x630 card messaging apps show when a Jodohmu link is pasted
   into a chat. One layout, different words per page. */

export const OG_SIZE = { width: 1200, height: 630 };

export interface BrandCard {
  eyebrow: string;
  lead: string;
  emphasis: string;
  sub: string;
  footer: string;
  /** big text inside the circle, and the small caps under it */
  medallion: string;
  medallionLabel: string;
}

const C = {
  paper: "#FFFAF7",
  ink: "#102B61",
  body: "#52617C",
  accent: "#9B2242",
  rose: "#9B2242",
  navy: "#0B3A86",
};

async function googleFont(family: string, spec: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:${spec}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, { cache: "force-cache" }).then(r => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return src ? await fetch(src, { cache: "force-cache" }).then(r => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

/**
 * The logo as a data URI, or null. On the deployed site the `public` folder is
 * not always on the function's disk, so fall back to the copy the site serves;
 * a missing logo must never take the whole preview down with it.
 */
async function loadLogo(): Promise<string | null> {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "jodohmu-logo.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch { /* not on disk — try the served copy */ }
  try {
    const res = await fetch("https://www.jodohmu.com/jodohmu-logo.png", { cache: "force-cache" });
    if (!res.ok) return null;
    return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join("L")}Z`;
}

export async function brandCard(card: BrandCard): Promise<ImageResponse> {
  const { eyebrow, lead, emphasis, sub, footer, medallion, medallionLabel } = card;
  const wordmark = "Jodohmu";
  const serifText = `${lead}${emphasis}${medallion}${wordmark}`;
  const sansText = `${eyebrow}${sub}${footer}${medallionLabel}`;
  const [serif, serifItalic, sans, sansBold] = await Promise.all([
    googleFont("Playfair+Display", "wght@500", serifText),
    googleFont("Playfair+Display", "ital,wght@1,500", serifText),
    googleFont("Nunito", "wght@600", sansText),
    googleFont("Nunito", "wght@800", sansText),
  ]);

  const fonts = [
    serif && { name: "Playfair", data: serif, weight: 500 as const, style: "normal" as const },
    serifItalic && { name: "Playfair", data: serifItalic, weight: 500 as const, style: "italic" as const },
    sans && { name: "Nunito", data: sans, weight: 600 as const, style: "normal" as const },
    sansBold && { name: "Nunito", data: sansBold, weight: 800 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 500 | 600 | 800; style: "normal" | "italic" }[];

  const logoSrc = await loadLogo();

  const emphasisSize = emphasis.length > 26 ? 52 : emphasis.length > 18 ? 60 : 68;

  const stars: string[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      stars.push(starPath(44 + col * 88 + (row % 2) * 44, 40 + row * 84, 22, 9));
    }
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.paper, fontFamily: "Nunito" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 760, padding: "60px 40px 54px 76px" }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={logoSrc} width={178} height={80} />
          ) : (
            <div style={{ display: "flex", height: 80, alignItems: "center", fontFamily: "Playfair", fontSize: 44, color: C.ink }}>{wordmark}</div>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 19, fontWeight: 800, letterSpacing: 6, color: C.accent }}>{eyebrow}</div>
            <div style={{ display: "flex", marginTop: 22, fontFamily: "Playfair", fontSize: 58, lineHeight: 1.1, color: C.ink }}>{lead}</div>
            <div style={{ display: "flex", fontFamily: "Playfair", fontStyle: "italic", fontSize: emphasisSize, lineHeight: 1.1, color: C.rose }}>
              {emphasis}
            </div>
            <div style={{ display: "flex", marginTop: 26, width: 96, height: 2, background: C.accent }} />
            <div style={{ display: "flex", marginTop: 24, fontSize: 26, fontWeight: 600, lineHeight: 1.45, color: C.body, maxWidth: 620 }}>{sub}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", fontSize: 19, fontWeight: 600, color: C.body }}>
            <div style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: C.accent, marginRight: 14 }} />
            {footer}
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", flex: 1, alignItems: "center", justifyContent: "center", background: C.navy }}>
          <svg width="440" height="630" viewBox="0 0 440 630" style={{ position: "absolute", top: 0, left: 0 }}>
            {stars.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={C.accent} strokeOpacity="0.22" strokeWidth="1.2" />
            ))}
          </svg>
          <div style={{ display: "flex", width: 236, height: 236, borderRadius: 236, border: `2px solid ${C.accent}`, alignItems: "center", justifyContent: "center", background: C.navy }}>
            <div style={{ display: "flex", flexDirection: "column", width: 200, height: 200, borderRadius: 200, alignItems: "center", justifyContent: "center", background: C.paper }}>
              <div style={{ display: "flex", fontFamily: "Playfair", fontStyle: medallion.length > 2 ? "italic" : "normal", fontSize: medallion.length > 2 ? 56 : 92, lineHeight: 1, color: C.navy }}>{medallion}</div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 15, fontWeight: 800, letterSpacing: 5, color: C.accent }}>{medallionLabel}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
