import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { loadSharePreview } from "@/lib/share-preview";

/* Link unfurl card for WhatsApp / Meet / Slack. Deliberately never shows a
   candidate's photo or name: unfurls are cached by the messaging app and would
   outlive a revoked or expired link. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Perkenalan pribadi dari Jodohmu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  paper: "#FBF8F3",
  ink: "#1C1917",
  body: "#57534E",
  gold: "#B08D57",
  rose: "#9B2242",
  navy: "#0A2754",
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

function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join("L")}Z`;
}

export default async function OpengraphImage({ params }: { params: { token: string } }) {
  const preview = await loadSharePreview(params.token);

  const eyebrow = !preview.live
    ? "JODOHMU"
    : preview.purpose === "promotion"
      ? "PROFIL PILIHAN JODOHMU"
      : "PERKENALAN PRIBADI";

  const lead = !preview.live ? "Perkenalan pribadi" : preview.purpose === "promotion" ? "Seseorang yang" : "Untuk";
  const emphasis = !preview.live
    ? "dari Jodohmu"
    : preview.purpose === "promotion"
      ? "layak Anda kenal"
      : preview.recipientLabel || "Anda";

  const sub = !preview.live
    ? "Ta'aruf yang terarah dan menjaga kehormatan setiap kandidat."
    : preview.purpose === "promotion"
      ? "Ta'aruf yang terarah, terverifikasi, dan penuh amanah."
      : `${preview.profileCount > 1 ? `${preview.profileCount} profil pilihan` : "Satu profil pilihan"}, disiapkan khusus oleh tim Jodohmu.`;

  const medallion = preview.live ? String(preview.profileCount) : "✦";
  const medallionLabel = preview.live ? (preview.profileCount > 1 ? "PROFIL" : "PROFIL") : "AMANAH";
  const footer = "Rahasia & terbatas  ·  jodohmu.com";

  const serifText = `${lead}${emphasis}${medallion}`;
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

  const logo = await readFile(path.join(process.cwd(), "public", "jodohmu-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logoSrc} width={178} height={80} />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 19, fontWeight: 800, letterSpacing: 6, color: C.gold }}>{eyebrow}</div>
            <div style={{ display: "flex", marginTop: 22, fontFamily: "Playfair", fontSize: 58, lineHeight: 1.1, color: C.ink }}>{lead}</div>
            <div style={{ display: "flex", fontFamily: "Playfair", fontStyle: "italic", fontSize: emphasisSize, lineHeight: 1.1, color: C.rose }}>
              {emphasis}
            </div>
            <div style={{ display: "flex", marginTop: 26, width: 96, height: 2, background: C.gold }} />
            <div style={{ display: "flex", marginTop: 24, fontSize: 26, fontWeight: 600, lineHeight: 1.45, color: C.body, maxWidth: 620 }}>{sub}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", fontSize: 19, fontWeight: 600, color: C.body }}>
            <div style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: C.gold, marginRight: 14 }} />
            {footer}
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", flex: 1, alignItems: "center", justifyContent: "center", background: C.navy }}>
          <svg width="440" height="630" viewBox="0 0 440 630" style={{ position: "absolute", top: 0, left: 0 }}>
            {stars.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={C.gold} strokeOpacity="0.22" strokeWidth="1.2" />
            ))}
          </svg>
          <div style={{ display: "flex", width: 236, height: 236, borderRadius: 236, border: `2px solid ${C.gold}`, alignItems: "center", justifyContent: "center", background: C.navy }}>
            <div style={{ display: "flex", flexDirection: "column", width: 200, height: 200, borderRadius: 200, alignItems: "center", justifyContent: "center", background: C.paper }}>
              <div style={{ display: "flex", fontFamily: "Playfair", fontSize: 92, lineHeight: 1, color: C.navy }}>{medallion}</div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 15, fontWeight: 800, letterSpacing: 5, color: C.gold }}>{medallionLabel}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
