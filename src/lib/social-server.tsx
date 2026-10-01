import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import {
  REEL_TIMING, SOCIAL_POSTS, buildCard, describeChoices, findPage, helloLines, sakinahLines,
  type CardContent, type FieldChoices, type FigureChoice, type PostFormat, type SocialPageKey,
} from "@/lib/social";
import { figureSvg, iconSvg, type Figure } from "@/lib/social-figures";

/* Server side of social posting: draws the slides, hosts them, and publishes them through
   the Instagram Graph API as the "Jodohmu Poster Bot" system user. */

const GRAPH = "https://graph.facebook.com/v23.0";
// Instagram sometimes never answers a request; without a limit the post (and the screen) waits forever
const GRAPH_TIMEOUT_MS = 20_000;
export const CARD_SIZE = { width: 1080, height: 1350 };

const C = { paper: "#FFFAF7", ink: "#102B61", body: "#52617C", line: "#E9DFD8" };

async function googleFont(family: string, spec: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:${spec}&text=${encodeURIComponent(text)}`;
    const css = await fetch(cssUrl, { cache: "force-cache", signal: AbortSignal.timeout(10_000) }).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return src ? await fetch(src, { cache: "force-cache", signal: AbortSignal.timeout(10_000) }).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function renderClassic(card: CardContent): Promise<ImageResponse> {
  const serifText = `${card.title}${card.name}${card.intro}“”`;
  // Fonts are fetched only for the characters used, so include the upper-cased labels too
  const sansText = `@${card.page.handle}${card.page.label}${card.page.label.toUpperCase()}${card.code}${card.rows.map((r) => r.label + r.label.toUpperCase() + r.value).join("")}PROFIL PILIHANKODE PROFILTertarik berkenalan? Kirim DM dengan kode ini.·`;
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

  const accent = card.page.accent;
  // Everything switched on must still fit one 4:5 card, so type steps down as content grows
  const dense = card.rows.length > 6 || (card.rows.length > 4 && card.intro.length > 60);
  const titleSize = card.title.length > 22 ? 64 : 76;
  const rowSize = dense ? 30 : 34;
  const block = { display: "flex", flexShrink: 0 } as const;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.paper, fontFamily: "Nunito", padding: 44 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, border: `3px solid ${accent}`, borderRadius: 36, padding: "64px 72px" }}>
          <div style={{ ...block, justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: accent }}>@{card.page.handle}</div>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 4, color: C.paper, background: accent, borderRadius: 999, padding: "10px 26px" }}>
              {card.page.label.toUpperCase()}
            </div>
          </div>

          <div style={{ ...block, marginTop: dense ? 44 : 64, fontSize: 24, fontWeight: 800, letterSpacing: 8, color: accent }}>PROFIL PILIHAN</div>
          <div style={{ ...block, marginTop: 14, fontFamily: "Playfair", fontSize: titleSize, lineHeight: 1.08, color: C.ink }}>{card.title}</div>
          {card.name && (
            <div style={{ ...block, marginTop: 8, fontFamily: "Playfair", fontStyle: "italic", fontSize: 46, color: accent }}>{card.name}</div>
          )}
          <div style={{ ...block, marginTop: dense ? 24 : 34, width: 120, height: 3, background: accent }} />

          <div style={{ ...block, flexDirection: "column", marginTop: dense ? 18 : 28 }}>
            {card.rows.map((row) => (
              <div key={row.label} style={{ display: "flex", alignItems: "baseline", padding: dense ? "11px 0" : "15px 0", borderBottom: `2px solid ${C.line}` }}>
                <div style={{ display: "flex", width: 330, flexShrink: 0, fontSize: rowSize - 10, fontWeight: 800, letterSpacing: 2, color: C.body }}>{row.label.toUpperCase()}</div>
                <div style={{ display: "flex", flex: 1, fontSize: rowSize, fontWeight: 600, color: C.ink }}>{row.value}</div>
              </div>
            ))}
          </div>

          {card.intro && (
            <div style={{ ...block, marginTop: dense ? 26 : 36, fontFamily: "Playfair", fontStyle: "italic", fontSize: dense ? 32 : 36, lineHeight: 1.3, color: C.ink }}>
              “{card.intro}”
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />
          <div style={{ ...block, justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: C.body, maxWidth: 640, lineHeight: 1.4 }}>
              Tertarik berkenalan? Kirim DM dengan kode ini.
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ display: "flex", fontSize: 20, fontWeight: 800, letterSpacing: 4, color: C.body }}>KODE PROFIL</div>
              <div style={{ display: "flex", marginTop: 6, fontSize: 46, fontWeight: 800, color: accent }}>{card.code}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...CARD_SIZE, fonts },
  );
}

/* ── "hello" template: the @nikahin_foreigner Canva look.
   Drawn as separate parts so the same design makes the 4:5 carousel slides and the layers of the 9:16 Reel. ── */
const H = { red: "#761410", navy: "#242A46", title: "#E4E4E4", shadow: "#0D1020", cursor: "#4B3F9E" };
const PILL = { width: 620, height: 130 };

// Where things sit on the 4:5 card, and on the taller Reel canvas, whose navy band is deeper as in the Canva Reel.
// Globes are [centre x, centre y, radius, tilt].
const helloLayout = (height: number) => height > CARD_SIZE.height
  ? { band: 400, handle: 134, title: 286, profileTop: 240, figure: { width: 800, height: 960 }, globes: [[20, 720, 215, -18], [1070, 1010, 235, 16]] }
  : { band: 230, handle: 62, title: 138, profileTop: 120, figure: { width: 640, height: 768 }, globes: [[20, 560, 210, -18], [1070, 760, 230, 16]] };

// Two wireframe globes, as in the template
function globeMarkup(cx: number, cy: number, r: number, tilt: number) {
  const meridians = [0.22, 0.5, 0.78].map((k) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r}"/>`).join("");
  const parallels = [-0.8, -0.55, -0.28, 0, 0.28, 0.55, 0.8].map((k) => {
    const dy = r * k;
    const rx = Math.sqrt(r * r - dy * dy);
    return `<ellipse cx="${cx}" cy="${cy + dy}" rx="${rx}" ry="${rx * 0.16}"/>`;
  }).join("");
  return `<g transform="rotate(${tilt} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r}"/>${meridians}${parallels}</g>`;
}

async function helloFonts(card: CardContent) {
  const { title, sub } = helloLines(card);
  const text = `@${card.page.handle}${title}${sub}Profile${card.rows.map((r) => r.label + r.value).join("")}${card.intro}“”more info?klik DM now!${card.code}:·`;
  const [regular, bold] = await Promise.all([googleFont("Inter", "wght@600", text), googleFont("Inter", "wght@800", text)]);
  return [
    regular && { name: "Inter", data: regular, weight: 600 as const, style: "normal" as const },
    bold && { name: "Inter", data: bold, weight: 800 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600 | 800; style: "normal" }[];
}

// What never changes from card to card: the globes, and the navy band with its empty button and pointer
function helloBackground(height: number) {
  const { band, globes } = helloLayout(height);
  const artH = height - band;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE.width}" height="${artH}" viewBox="0 0 ${CARD_SIZE.width} ${artH}" fill="none" stroke="#9A4A45" stroke-width="2.5">${globes.map(([cx, cy, r, tilt]) => globeMarkup(cx, cy, r, tilt)).join("")}</svg>`;
  return [
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img key="globes" src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} width={CARD_SIZE.width} height={artH} style={{ position: "absolute", left: 0, top: 0 }} />,
    <div key="band" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: band, background: H.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", position: "relative", width: PILL.width, height: PILL.height + 12 }}>
        <div style={{ position: "absolute", left: 0, top: 12, width: PILL.width, height: PILL.height, borderRadius: 65, background: H.shadow }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: PILL.width, height: PILL.height, borderRadius: 65, background: "#FFFFFF" }} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={iconSvg("pointer", H.cursor, "#FFFFFF", 1.6)} width={104} height={104} style={{ position: "absolute", left: 548, top: 74 }} />
      </div>
    </div>,
  ];
}

// Our own silhouette artwork, when it has been added: 800×960 transparent PNGs, figure facing left, cut off at the bottom edge.
// Written out per figure so the files are bundled with the server code.
const FIGURE_FILES: Record<Figure, string> = {
  man: path.join(process.cwd(), "public", "social-figures", "man.png"),
  man_peci: path.join(process.cwd(), "public", "social-figures", "man-peci.png"),
  man_peci_beard: path.join(process.cwd(), "public", "social-figures", "man-peci-beard.png"),
  woman: path.join(process.cwd(), "public", "social-figures", "woman.png"),
  hijab: path.join(process.cwd(), "public", "social-figures", "hijab.png"),
};
// The same figures mirrored (facing right) and painted green for @taaruf_sekarang, so its posts don't match the other pages
const SAKINAH_FIGURE_FILES: Record<Figure, string> = {
  man: path.join(process.cwd(), "public", "social-figures", "sakinah", "man.png"),
  man_peci: path.join(process.cwd(), "public", "social-figures", "sakinah", "man-peci.png"),
  man_peci_beard: path.join(process.cwd(), "public", "social-figures", "sakinah", "man-peci-beard.png"),
  woman: path.join(process.cwd(), "public", "social-figures", "sakinah", "woman.png"),
  hijab: path.join(process.cwd(), "public", "social-figures", "sakinah", "hijab.png"),
};
const figureCache = new Map<string, string>();

// The artwork if we have it, otherwise the drawn silhouette
async function figureImage(figure: Figure, files: Record<Figure, string> = FIGURE_FILES): Promise<string> {
  const cached = figureCache.get(files[figure]);
  if (cached) return cached;
  const src = await readFile(files[figure])
    .then((png) => `data:image/png;base64,${png.toString("base64")}`)
    .catch(() => figureSvg(figure, { base: "#DEDEDE", shade: "#C6C6C6" }));
  figureCache.set(files[figure], src);
  return src;
}

type HelloPart = "header" | "figure" | "title" | "sub" | "cta" | "heading" | "rows";

// Every part of the design, placed for a canvas of the given height
async function helloParts(card: CardContent, height: number): Promise<Record<HelloPart, React.ReactNode>> {
  const L = helloLayout(height);
  const tall = height > CARD_SIZE.height;
  const artH = height - L.band;
  const { title, sub } = helloLines(card);
  const titleSize = title.length <= 14 ? 132 : title.length <= 19 ? 104 : 84;
  // Everything switched on must still fit above the band, so rows tighten as they grow
  const dense = card.rows.length > 6 || (card.rows.length > 4 && card.intro.length > 0);
  const icon = dense ? 62 : 78;
  const gap = dense ? 16 : 26;
  const code = { display: "flex", fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.55)" } as const;

  // The intro's two lines are laid out together and shown one at a time, so each sits where it does on the full slide
  const intro = (show: "title" | "sub") => (
    <div key={show} style={{ position: "absolute", top: L.title, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", opacity: show === "title" ? 1 : 0, fontSize: titleSize, fontWeight: 800, color: H.title, letterSpacing: -titleSize * 0.045, lineHeight: 1 }}>{title}</div>
      {sub && <div style={{ display: "flex", opacity: show === "sub" ? 1 : 0, marginTop: 16, fontSize: 60, fontWeight: 800, color: "#FFFFFF", letterSpacing: -2 }}>{sub}</div>}
    </div>
  );
  // The same for the profile: heading and rows sit centred together in the space between the handle and the band
  const profile = (show: "heading" | "rows") => (
    <div key={show} style={{ position: "absolute", top: L.profileTop, bottom: L.band + 30, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", opacity: show === "heading" ? 1 : 0, fontSize: dense ? 88 : 104, fontWeight: 800, color: "#FFFFFF", letterSpacing: -3 }}>Profile</div>
      <div style={{ display: "flex", flexDirection: "column", opacity: show === "rows" ? 1 : 0 }}>
        <div style={{ display: "flex", flexDirection: "column", marginTop: dense ? 26 : 46, width: 840 }}>
          {card.rows.map((row, i) => (
            <div key={row.key} style={{ display: "flex", alignItems: "center", marginTop: i ? gap : 0 }}>
              <div style={{ display: "flex", flexShrink: 0, width: icon, height: icon, borderRadius: icon, marginRight: 28, alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.14)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                {row.icon && <img src={iconSvg(row.icon, "#FFFFFF")} width={icon * 0.52} height={icon * 0.52} />}
              </div>
              <div style={{ display: "flex", flexShrink: 0, width: 270, fontSize: dense ? 34 : 40, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{row.label}</div>
              <div style={{ display: "flex", flex: 1, fontSize: dense ? 38 : 46, fontWeight: 800, color: "#FFFFFF", letterSpacing: -1 }}>{row.value}</div>
            </div>
          ))}
        </div>
        {card.intro && (
          <div style={{ display: "flex", marginTop: dense ? 30 : 44, width: 840, fontSize: dense ? 34 : 38, fontWeight: 600, lineHeight: 1.3, color: "rgba(255,255,255,0.9)" }}>
            “{card.intro}”
          </div>
        )}
      </div>
    </div>
  );

  return {
    // The page's handle and the profile code: in the band's corner on the card, under the handle on a Reel (Instagram covers a Reel's bottom edge)
    header: (
      <div key="header" style={{ position: "absolute", left: 0, top: 0, width: CARD_SIZE.width, height, display: "flex" }}>
        <div style={{ position: "absolute", top: L.handle, left: 0, right: 0, display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#FFFFFF" }}>
          @{card.page.handle}
        </div>
        {tall
          ? <div style={{ position: "absolute", top: L.handle + 50, left: 0, right: 0, justifyContent: "center", ...code }}>{card.code}</div>
          : <div style={{ position: "absolute", right: 40, bottom: 24, ...code }}>{card.code}</div>}
      </div>
    ),
    figure: (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img key="figure" src={await figureImage(card.figure)} width={L.figure.width} height={L.figure.height}
        style={{ position: "absolute", left: (CARD_SIZE.width - L.figure.width) / 2 + 30, top: artH - L.figure.height }} />
    ),
    title: intro("title"),
    sub: intro("sub"),
    // The words on the band's button
    cta: (
      <div key="cta" style={{ position: "absolute", left: (CARD_SIZE.width - PILL.width) / 2, top: artH + (L.band - PILL.height - 12) / 2, width: PILL.width, height: PILL.height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: H.navy, letterSpacing: -1.5, lineHeight: 1 }}>more info?</div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: H.navy, letterSpacing: -1.5, lineHeight: 1 }}>klik DM now!</div>
      </div>
    ),
    heading: profile("heading"),
    rows: profile("rows"),
  };
}

// Some parts of the design on one canvas: on the red page with its band, or on a transparent one to lay over the Reel's video
async function renderHello(card: CardContent, parts: HelloPart[], { height = CARD_SIZE.height, bare = false } = {}): Promise<ImageResponse> {
  const all = await helloParts(card, height);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Inter", ...(bare ? {} : { background: H.red }) }}>
        {!bare && helloBackground(height)}
        {parts.map((p) => all[p])}
      </div>
    ),
    { width: CARD_SIZE.width, height, fonts: await helloFonts(card) },
  );
}

/* ── "sakinah" template: @taaruf_sekarang, deep green with a gold-edged arch, after the page's Canva palette.
   Drawn as separate parts so the same design makes the 4:5 carousel slides and the layers of the 9:16 Reel. ── */
const S = {
  deep: "#1D352D", deeper: "#11211C", sage: "#C9D0BF", sageDark: "#AEB9A7", gold: "#C9AD74",
  cream: "#F5F1E8", ink: "#1D352D", muted: "#7D8C82", line: "#E2DCCD",
};

async function sakinahFonts(card: CardContent) {
  const { greeting, big, sub } = sakinahLines(card);
  const labels = card.rows.map((r) => r.label + r.label.toUpperCase()).join("");
  const sans = `@${card.page.handle.toUpperCase()}${greeting}${greeting.toUpperCase()}${big}${sub}${sub.toUpperCase()}${labels}${card.rows.map((r) => r.value).join("")}${card.code}PROFIL PILIHANPROFILGeser untuk melihat profil→DM kami dengan kode·`;
  const serif = `${big}${card.name}${card.intro}“”Info lebih lanjut?`;
  const [regular, medium, display, displayItalic] = await Promise.all([
    googleFont("Jost", "wght@400", sans), googleFont("Jost", "wght@500", sans),
    googleFont("Cormorant+Garamond", "wght@600", serif), googleFont("Cormorant+Garamond", "ital,wght@1,500", serif),
  ]);
  return [
    regular && { name: "Jost", data: regular, weight: 400 as const, style: "normal" as const },
    medium && { name: "Jost", data: medium, weight: 500 as const, style: "normal" as const },
    display && { name: "Cormorant", data: display, weight: 600 as const, style: "normal" as const },
    displayItalic && { name: "Cormorant", data: displayItalic, weight: 500 as const, style: "italic" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: "normal" | "italic" }[];
}

const eyebrow = { display: "flex", fontSize: 24, fontWeight: 500, letterSpacing: 6, color: S.gold } as const;
type SakinahPart = "header" | "introArt" | "introText" | "hint" | "profile" | "cta";

// Every part of the design, placed for a canvas of the given height (the 4:5 layout sits centred on a 9:16 one)
async function sakinahParts(card: CardContent, height: number): Promise<Record<SakinahPart, React.ReactNode>> {
  const dy = (height - CARD_SIZE.height) / 2;
  const { greeting, big, sub } = sakinahLines(card);
  const bigSize = big.length <= 10 ? 150 : big.length <= 15 ? 118 : 92;
  const arch = { left: 270, top: 170 + dy, width: 540, height: 660 };
  const fig = { width: 500, height: 600 };
  // The serif draws old-style numbers, so the age goes in the small line above the profile heading
  const heading = card.name || big.replace(/^saya /, "");
  const above = ["PROFIL", /\d/.test(heading) ? "" : sub.toUpperCase()].filter(Boolean).join("  ·  ");
  // Everything switched on must fit the card, so rows tighten as they grow
  const n = card.rows.length + (card.intro ? 2 : 0);
  const value = n > 8 ? 32 : n > 6 ? 35 : 38;
  const pad = n > 8 ? 15 : n > 6 ? 19 : 24;

  return {
    header: (
      <div key="header" style={{ position: "absolute", top: 82 + dy, left: 90, right: 90, display: "flex", justifyContent: "space-between" }}>
        <div style={eyebrow}>@{card.page.handle.toUpperCase()}</div>
        <div style={eyebrow}>{card.code}</div>
      </div>
    ),
    // The arch: a gold outline offset around a sage window holding the silhouette
    introArt: (
      <div key="introArt" style={{ position: "absolute", left: 0, top: 0, width: CARD_SIZE.width, height, display: "flex" }}>
        <div style={{ position: "absolute", left: arch.left - 18, top: arch.top - 18, width: arch.width + 36, height: arch.height + 18, display: "flex", border: `2px solid ${S.gold}`, borderBottom: "none", borderRadius: `${(arch.width + 36) / 2}px ${(arch.width + 36) / 2}px 0 0` }} />
        <div style={{
          position: "absolute", left: arch.left, top: arch.top, width: arch.width, height: arch.height, display: "flex", overflow: "hidden",
          borderRadius: `${arch.width / 2}px ${arch.width / 2}px 0 0`, backgroundImage: `linear-gradient(180deg, ${S.sage} 0%, ${S.sageDark} 100%)`,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={await figureImage(card.figure, SAKINAH_FIGURE_FILES)} width={fig.width} height={fig.height} style={{ position: "absolute", left: (arch.width - fig.width) / 2 - 24, top: arch.height - fig.height }} />
        </div>
        <div style={{ position: "absolute", left: arch.left - 60, top: arch.top + arch.height, width: arch.width + 120, height: 2, display: "flex", background: S.gold }} />
      </div>
    ),
    introText: (
      <div key="introText" style={{ position: "absolute", top: arch.top + arch.height + 52, left: 60, right: 60, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...eyebrow, flexShrink: 0, fontSize: 28, letterSpacing: 9, color: S.sage }}>{greeting.toUpperCase()}</div>
        <div style={{ display: "flex", flexShrink: 0, marginTop: 6, fontFamily: "Cormorant", fontSize: bigSize, fontWeight: 600, color: S.cream, lineHeight: 1 }}>{big}</div>
        {sub && (
          <div style={{ display: "flex", flexShrink: 0, alignItems: "center", marginTop: 18 }}>
            <div style={{ display: "flex", width: 56, height: 1.5, background: S.gold }} />
            <div style={{ display: "flex", margin: "0 24px", fontSize: 38, fontWeight: 400, color: S.cream, letterSpacing: 1 }}>{sub}</div>
            <div style={{ display: "flex", width: 56, height: 1.5, background: S.gold }} />
          </div>
        )}
      </div>
    ),
    hint: (
      <div key="hint" style={{ position: "absolute", bottom: 78 + dy, left: 0, right: 0, display: "flex", justifyContent: "center", fontSize: 24, fontWeight: 400, letterSpacing: 3, color: "rgba(201,208,191,0.7)" }}>
        Geser untuk melihat profil →
      </div>
    ),
    profile: (
      <div key="profile" style={{ position: "absolute", top: 168 + dy, left: 90, right: 90, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ ...eyebrow, flexShrink: 0, letterSpacing: 8 }}>{above}</div>
        <div style={{ display: "flex", flexShrink: 0, marginTop: 8, fontFamily: /\d/.test(heading) ? "Jost" : "Cormorant", fontSize: heading.length > 18 ? 66 : 84, fontWeight: 600, color: S.cream, lineHeight: 1.05, textAlign: "center" }}>{heading}</div>
        <div style={{ display: "flex", flexShrink: 0, flexDirection: "column", width: "100%", marginTop: 40, padding: "22px 60px", background: S.cream, borderRadius: 24 }}>
          {card.rows.map((row, i) => (
            <div key={row.key} style={{ display: "flex", alignItems: "center", padding: `${pad}px 0`, borderTop: i ? `1.5px solid ${S.line}` : "none" }}>
              <div style={{ display: "flex", flexShrink: 0, width: 330, fontSize: 21, fontWeight: 500, letterSpacing: 3, color: S.muted }}>{row.label.toUpperCase()}</div>
              <div style={{ display: "flex", flex: 1, fontSize: value, fontWeight: 500, color: S.ink, lineHeight: 1.2 }}>{row.value}</div>
            </div>
          ))}
          {card.intro && (
            <div style={{ display: "flex", borderTop: `1.5px solid ${S.line}`, padding: `${pad + 6}px 0 ${pad}px`, fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: value + 4, lineHeight: 1.25, color: S.ink }}>
              “{card.intro}”
            </div>
          )}
        </div>
      </div>
    ),
    cta: (
      <div key="cta" style={{ position: "absolute", bottom: 88 + dy, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", flexShrink: 0, fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 500, fontSize: 50, color: S.cream }}>Info lebih lanjut?</div>
        <div style={{ display: "flex", flexShrink: 0, alignItems: "center", marginTop: 14 }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 400, letterSpacing: 1, color: S.sage }}>DM kami dengan kode</div>
          <div style={{ display: "flex", marginLeft: 18, padding: "8px 24px", borderRadius: 999, background: S.gold, fontSize: 28, fontWeight: 500, letterSpacing: 2, color: S.deeper }}>{card.code}</div>
        </div>
      </div>
    ),
  };
}

// Some parts of the design on one canvas: on the deep green page, or on a transparent one to lay over the Reel's video
async function renderSakinah(card: CardContent, parts: SakinahPart[], { height = CARD_SIZE.height, bare = false } = {}): Promise<ImageResponse> {
  const all = await sakinahParts(card, height);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Jost", ...(bare ? {} : { backgroundImage: `linear-gradient(180deg, ${S.deep} 0%, ${S.deeper} 100%)` }) }}>
        {!bare && <div style={{ position: "absolute", left: 40, top: 40, right: 40, bottom: 40, display: "flex", border: "1.5px solid rgba(201,173,116,0.35)", borderRadius: 6 }} />}
        {parts.map((p) => all[p])}
      </div>
    ),
    { width: CARD_SIZE.width, height, fonts: await sakinahFonts(card) },
  );
}

/* ── Reels: the design's parts laid over a plain background video on Cloudinary, each fading in on its own ── */
export const REEL_SIZE = { width: 1080, height: 1920 };
type ReelDesign = {
  // The page's background as a video (with its music) and as a still, uploaded once (renderReelBase + ffmpeg).
  // A new track means a new video file and a new name here.
  video: string;
  still: string;
  // [layer, starts at (s), fade in (ms)], bottom to top, all running to the end. Just before the cut a fresh background fades
  // in over the intro (Cloudinary can't fade an image layer out), then the profile appears on it.
  timeline: [string, number, number][];
  // The parts on the Reel's two still frames (editor preview and the Reel's cover)
  stills: [string[], string[]];
  render: (card: CardContent, parts: string[], bare: boolean) => Promise<ImageResponse>;
};
const REELS: Partial<Record<CardContent["template"], ReelDesign>> = {
  hello: {
    video: "social-reels/base/hello-v1", still: "social-reels/base/hello-bg-v1",
    timeline: [
      ["figure", 0, 400], ["title", 0.3, 500], ["sub", 0.9, 500], ["cta", 1.5, 500], ["background", 6.7, 500],
      ["header", 0, 400], ["heading", 7.1, 400], ["rows", 7.5, 600], ["cta", 8.3, 500],
    ],
    stills: [["header", "figure", "title", "sub", "cta"], ["header", "heading", "rows", "cta"]],
    render: (card, parts, bare) => renderHello(card, parts as HelloPart[], { height: REEL_SIZE.height, bare }),
  },
  sakinah: {
    video: "social-reels/base/sakinah-v1", still: "social-reels/base/sakinah-bg-v1",
    timeline: [["introArt", 0, 1000], ["introText", 0.8, 900], ["background", 5.6, 600], ["header", 0, 600], ["profile", 6.0, 700], ["cta", 6.8, 800]],
    stills: [["header", "introArt", "introText"], ["header", "profile", "cta"]],
    render: (card, parts, bare) => renderSakinah(card, parts as SakinahPart[], { height: REEL_SIZE.height, bare }),
  },
};
export const hasReel = (card: CardContent) => Boolean(REELS[card.template]);

// The plain background the Reel's base video is made from (see ReelDesign)
export async function renderReelBase(card: CardContent): Promise<ArrayBuffer> {
  const design = REELS[card.template];
  if (!design) throw new Error("This page has no Reel design yet.");
  return (await design.render(card, [], false)).arrayBuffer();
}

// The Reel's two still frames, in order
async function renderReelStills(card: CardContent, design: ReelDesign) {
  return Promise.all(design.stills.map((parts) => design.render(card, parts, false)));
}

// Hosts every layer, then asks Cloudinary for the finished MP4 (it builds it on the first request) and a cover image
export async function buildReel(card: CardContent, name: string): Promise<{ videoUrl: string; coverUrl: string; profileUrl: string }> {
  const design = REELS[card.template];
  const seconds = REEL_TIMING[card.template]?.seconds;
  if (!design || !seconds) throw new Error("This page has no Reel design yet.");
  // A part that appears twice (a button on both halves) is hosted once
  const parts = Array.from(new Set(design.timeline.map(([part]) => part))).filter((part) => part !== "background");
  const [layers, stills] = await Promise.all([
    Promise.all(parts.map(async (part) => {
      const png = await (await design.render(card, [part], true)).arrayBuffer();
      return hostLayer(png, `${name}-${part}`);
    })),
    renderReelStills(card, design).then((images) => Promise.all(images.map((i) => i.arrayBuffer())))
      .then((pngs) => Promise.all(pngs.map((png, i) => hostCard(png, `${name}-reel-${i + 1}`)))),
  ]);
  const [coverUrl, profileUrl] = stills;
  const layerId = (part: string) => (part === "background" ? design.still : layers[parts.indexOf(part)]);
  const chain = design.timeline.map(([part, start, fade]) => `l_${layerId(part).replace(/\//g, ":")}/e_fade:${fade}/fl_layer_apply,so_${start},eo_${seconds}`).join("/");
  const videoUrl = cloudinary.url(design.video, { resource_type: "video", format: "mp4", raw_transformation: `${chain}/q_auto,vc_h264,ac_aac` });
  await warmVideo(videoUrl);
  return { videoUrl, coverUrl, profileUrl };
}

// Transparent PNG layers stay PNG; returns the public ID the video refers to
async function hostLayer(png: ArrayBuffer, name: string): Promise<string> {
  const dataUri = `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
  const upload = () => cloudinary.uploader.upload(dataUri, { folder: "social-reels", public_id: name, format: "png", overwrite: true, invalidate: true });
  const res = await upload().catch(() => new Promise((r) => setTimeout(r, 1500)).then(upload))
    .catch((err) => { throw new Error(`Layer upload failed: ${errorText(err)}`); });
  return res.public_id;
}

// Cloudinary makes the video on the first request; wait for it so Instagram doesn't fetch a half-made file
async function warmVideo(url: string) {
  const until = Date.now() + 40_000;
  while (Date.now() < until) {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(Math.max(until - Date.now(), 1000)) }).catch(() => null);
    if (res?.ok) { await res.arrayBuffer(); return; }
    if (res && res.status !== 423) throw new Error(`The video couldn't be made (${res.status} ${res.headers.get("x-cld-error") ?? ""}).`.trim());
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error("The video is taking too long to make. Try again in a minute.");
}

// Every slide of a card as PNG bytes, in posting order; for a Reel, its two still frames
export async function renderSlides(card: CardContent, format: PostFormat = "carousel"): Promise<ArrayBuffer[]> {
  const reel = format === "reel" ? REELS[card.template] : undefined;
  const images = reel
    ? await renderReelStills(card, reel)
    : card.template === "hello"
      ? await Promise.all([renderHello(card, ["header", "figure", "title", "sub", "cta"]), renderHello(card, ["header", "heading", "rows", "cta"])])
      : card.template === "sakinah"
        ? await Promise.all([renderSakinah(card, ["header", "introArt", "introText", "hint"]), renderSakinah(card, ["header", "profile", "cta"])])
        : [await renderClassic(card)];
  return Promise.all(images.map((image) => image.arrayBuffer()));
}

// Instagram only accepts JPEGs at a public URL, so the card is hosted on Cloudinary as a JPEG
export async function hostCard(png: ArrayBuffer, name: string): Promise<string> {
  const dataUri = `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
  const upload = () => cloudinary.uploader.upload(dataUri, { folder: "social-posts", public_id: name, format: "jpg", overwrite: true });
  // Uploads occasionally fail on a stale connection; one retry clears it
  const res = await upload().catch(() => new Promise((r) => setTimeout(r, 1500)).then(upload))
    .catch((err) => { throw new Error(`Image upload failed: ${errorText(err)}`); });
  return res.secure_url;
}

// Cloudinary rejects with plain objects ({ message, http_code }) or { error: { message } }, not Error instances
export function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  const e = err as { message?: string; error?: { message?: string } } | null;
  return e?.message ?? e?.error?.message ?? (typeof err === "string" ? err : JSON.stringify(err)) ?? "unknown error";
}

export const metaToken = () => process.env.META_SYSTEM_USER_TOKEN?.trim() || null;

async function graph<T>(pathAndQuery: string, init?: { method?: "GET" | "POST"; params?: Record<string, string> }): Promise<T> {
  const token = metaToken();
  if (!token) throw new Error("Instagram is not connected yet (META_SYSTEM_USER_TOKEN is empty).");
  const method = init?.method ?? "GET";
  const url = new URL(`${GRAPH}/${pathAndQuery}`);
  const body = new URLSearchParams({ ...(init?.params ?? {}), access_token: token });
  const signal = AbortSignal.timeout(GRAPH_TIMEOUT_MS);
  const res = method === "GET"
    ? await fetch(`${url.toString()}${url.search ? "&" : "?"}${body.toString()}`, { cache: "no-store", signal })
    : await fetch(url, { method, body, cache: "no-store", signal });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(`Instagram: ${json.error?.message ?? res.statusText}`);
  return json;
}

// The Instagram account behind a handle, found through the Pages the system user was given
export async function instagramAccount(handle: string): Promise<{ id: string; username: string } | null> {
  const pages = await graph<{ data: { instagram_business_account?: { id: string; username: string } }[] }>(
    "me/accounts",
    { params: { fields: "name,instagram_business_account{id,username}", limit: "100" } },
  );
  const match = pages.data.find((p) => p.instagram_business_account?.username?.toLowerCase() === handle.toLowerCase());
  return match?.instagram_business_account ?? null;
}

// Where Instagram is with a container: "ready", still "processing", or an error
async function containerState(containerId: string): Promise<"ready" | "processing"> {
  const { status_code, status } = await graph<{ status_code?: string; status?: string }>(containerId, { params: { fields: "status_code,status" } });
  if (status_code === "FINISHED") return "ready";
  if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram could not process the post (${status || status_code}).`);
  return "processing";
}

// Instagram fetches each image first; wait until a container is ready (usually a few seconds)
async function waitReady(containerId: string) {
  for (let i = 0; i < 20; i++) {
    if ((await containerState(containerId)) === "ready") return;
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Instagram is taking too long to process the image. Try again in a minute.");
}

async function publishContainer(igUserId: string, containerId: string, onPublished?: (mediaId: string) => Promise<void>) {
  const published = await graph<{ id: string }>(`${igUserId}/media_publish`, { method: "POST", params: { creation_id: containerId } });
  await onPublished?.(published.id);
  const media = await graph<{ permalink?: string }>(published.id, { params: { fields: "permalink" } }).catch(() => ({ permalink: undefined }));
  return { mediaId: published.id, permalink: media.permalink ?? null };
}

// One image becomes a single post; several become a swipeable carousel, in order.
// onPublished runs as soon as Instagram confirms, before the link lookup, so the record is right even if that lookup fails.
export async function publishImages(igUserId: string, imageUrls: string[], caption: string, onPublished?: (mediaId: string) => Promise<void>): Promise<{ mediaId: string; permalink: string | null }> {
  let containerId: string;
  if (imageUrls.length === 1) {
    containerId = (await graph<{ id: string }>(`${igUserId}/media`, { method: "POST", params: { image_url: imageUrls[0], caption } })).id;
  } else {
    // Slides are prepared side by side; Promise.all keeps them in posting order
    const children = await Promise.all(imageUrls.map(async (url) => {
      const child = await graph<{ id: string }>(`${igUserId}/media`, { method: "POST", params: { image_url: url, is_carousel_item: "true" } });
      await waitReady(child.id);
      return child.id;
    }));
    containerId = (await graph<{ id: string }>(`${igUserId}/media`, {
      method: "POST", params: { media_type: "CAROUSEL", children: children.join(","), caption },
    })).id;
  }
  await waitReady(containerId);
  return publishContainer(igUserId, containerId, onPublished);
}

// Instagram needs longer for a video; when it isn't ready by the deadline the container is left to finish later (finishPost)
async function publishReel(igUserId: string, videoUrl: string, coverUrl: string, caption: string, deadline: number,
  onContainer: (containerId: string) => Promise<void>, publish: () => Promise<{ permalink: string | null } | null>,
): Promise<{ permalink: string | null; pending: boolean }> {
  const { id } = await graph<{ id: string }>(`${igUserId}/media`, {
    method: "POST", params: { media_type: "REELS", video_url: videoUrl, cover_url: coverUrl, caption, share_to_feed: "true" },
  });
  await onContainer(id);
  while (Date.now() < deadline) {
    if ((await containerState(id)) === "ready") {
      const done = await publish();
      return done ? { permalink: done.permalink, pending: false } : { permalink: null, pending: true };
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  return { permalink: null, pending: true };
}

// Publishes a post's processed Reel container, once: whoever claims it first (the post request or finishPost) publishes it
async function claimAndPublish(ref: FirebaseFirestore.DocumentReference): Promise<{ permalink: string | null } | null> {
  const post = await adminDb().runTransaction(async (tx) => {
    const now = (await tx.get(ref)).data();
    if (now?.status !== "publishing" || now.publishClaimed || !now.containerId || !now.igUserId) return null;
    tx.update(ref, { publishClaimed: true });
    return now;
  });
  if (!post) return null;
  const { permalink } = await publishContainer(post.igUserId, post.containerId, (id) =>
    ref.update({ status: "published", mediaId: id, publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }).then(() => undefined));
  await ref.update({ permalink, updatedAt: FieldValue.serverTimestamp() });
  return { permalink };
}

// false once a post was deleted on Instagram; null when Instagram can't be asked right now
export async function mediaExists(mediaId: string): Promise<boolean | null> {
  const token = metaToken();
  if (!token) return null;
  try {
    const res = await fetch(`${GRAPH}/${mediaId}?fields=id&access_token=${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (res.ok) return true;
    const json = (await res.json().catch(() => ({}))) as { error?: { code?: number } };
    // Code 100 is "object does not exist": the post was deleted
    return json.error?.code === 100 ? false : null;
  } catch {
    return null;
  }
}

export class PostError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

// A post stuck in "publishing" this long is treated as failed, so it can be tried again (a Reel Instagram is still processing gets longer)
const STALE_MS = 5 * 60 * 1000;
const STALE_REEL_MS = 20 * 60 * 1000;

/* Posts one client's card to one page and records it on social_posts/<candidate>_<page>:
   the exact card, the caption, and what the team hid or changed. Used by the Post button. */
export async function createPost({ candidateId, pageKey, choices, figure, format, caption, actor }: {
  candidateId: string;
  pageKey: SocialPageKey;
  choices: FieldChoices;
  figure: FigureChoice;
  format: PostFormat;
  caption: string;
  actor: { uid: string; name: string };
}): Promise<{ permalink: string | null; pending?: boolean }> {
  const started = Date.now();
  const db = adminDb();
  const page = findPage(pageKey);
  if (!page) throw new PostError("Unknown page.", 400);
  if (!page.connected) throw new PostError(`@${page.handle} is not connected to the poster yet.`, 400);
  if (!metaToken()) throw new PostError("Instagram is not connected yet. Add the Meta token first.", 400);
  const text = caption.trim().slice(0, 2200);
  if (!text) throw new PostError("Write a caption first.", 400);

  const candidateSnap = await db.collection("candidate_intake").doc(candidateId).get();
  if (!candidateSnap.exists) throw new PostError("Client not found.", 404);
  const profile = candidateSnap.data()!;
  const card = buildCard(page.key, candidateId, profile, choices, figure);
  const reel = format === "reel" && Boolean(page.reel) && hasReel(card);
  const changes = describeChoices(page.key, choices, profile, figure);

  // One post per client per page; claiming the record first also stops a double click posting twice
  const ref = db.collection(SOCIAL_POSTS).doc(`${candidateId}_${page.key}`);
  await db.runTransaction(async (tx) => {
    const existing = (await tx.get(ref)).data();
    const updated = (existing?.updatedAt as Timestamp | undefined)?.toMillis() ?? 0;
    if (existing?.status === "published") throw new PostError(`Already posted on @${page.handle}.`, 409);
    if (existing?.status === "publishing" && Date.now() - updated < (existing.containerId ? STALE_REEL_MS : STALE_MS)) throw new PostError("This post is already being published.", 409);
    tx.set(ref, {
      candidateId, candidateName: String(profile.fullName || profile.name || ""), page: page.key, handle: page.handle,
      code: card.code, card, choices, changes, caption: text,
      format: reel ? "reel" : "carousel", status: "publishing", error: null, permalink: null, mediaId: null, imageUrl: null, imageUrls: [],
      videoUrl: null, containerId: null, igUserId: null, publishClaimed: false,
      consentConfirmed: true, byUid: actor.uid, byName: actor.name,
      createdAt: existing?.createdAt ?? FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
  });

  let publishedId: string | null = null;
  try {
    const account = await instagramAccount(page.handle);
    if (!account) throw new Error(`The poster can't see @${page.handle}. Check its access in Meta Business Settings.`);
    const markPublished = async (id: string) => {
      publishedId = id;
      await ref.update({ status: "published", mediaId: id, publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    };
    if (reel) {
      const { videoUrl, coverUrl, profileUrl } = await buildReel(card, `${card.code}-${page.key}`);
      await ref.update({ imageUrl: coverUrl, imageUrls: [coverUrl, profileUrl], videoUrl, updatedAt: FieldValue.serverTimestamp() });
      // Leave room inside the 60s request limit; whatever is left is finished by finishPost
      return await publishReel(account.id, videoUrl, coverUrl, text, started + 50_000,
        (containerId) => ref.update({ containerId, igUserId: account.id, updatedAt: FieldValue.serverTimestamp() }).then(() => undefined),
        async () => {
          const done = await claimAndPublish(ref);
          if (done) publishedId = "reel";
          return done;
        });
    }
    const slides = await renderSlides(card);
    const imageUrls = await Promise.all(slides.map((png, i) => hostCard(png, `${card.code}-${page.key}-${i + 1}`)));
    await ref.update({ imageUrl: imageUrls[0], imageUrls, updatedAt: FieldValue.serverTimestamp() });
    const { permalink } = await publishImages(account.id, imageUrls, text, markPublished);
    await ref.update({ permalink, updatedAt: FieldValue.serverTimestamp() });
    return { permalink };
  } catch (err) {
    // Once Instagram has confirmed the post it is live, whatever fails afterwards
    if (publishedId) return { permalink: null };
    const message = errorText(err) || "Posting failed.";
    await ref.update({ status: "failed", error: message, updatedAt: FieldValue.serverTimestamp() });
    throw new PostError(message, 502);
  }
}

/* A Reel Instagram was still processing when its post request ended: publish it once Instagram is ready.
   Called by the composer while it waits, and whenever this client's posts are listed. */
export async function finishPost(ref: FirebaseFirestore.DocumentReference): Promise<{ status: string; permalink: string | null }> {
  const post = (await ref.get()).data();
  if (!post || post.status !== "publishing" || !post.containerId || !post.igUserId) return { status: post?.status ?? "missing", permalink: post?.permalink ?? null };
  try {
    if ((await containerState(post.containerId)) === "processing") {
      const updated = (post.updatedAt as Timestamp | undefined)?.toMillis() ?? 0;
      if (Date.now() - updated < STALE_REEL_MS) return { status: "publishing", permalink: null };
      throw new Error("Instagram took too long to process the video.");
    }
    const done = await claimAndPublish(ref);
    if (!done) return { status: (await ref.get()).data()?.status ?? "publishing", permalink: null };
    return { status: "published", permalink: done.permalink };
  } catch (err) {
    const message = errorText(err) || "Posting failed.";
    await ref.update({ status: "failed", error: message, publishClaimed: false, updatedAt: FieldValue.serverTimestamp() });
    return { status: "failed", permalink: null };
  }
}
