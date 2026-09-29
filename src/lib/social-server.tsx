import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import {
  SOCIAL_POSTS, buildCard, describeChoices, findPage, helloLines,
  type CardContent, type FieldChoices, type FigureChoice, type SocialPageKey,
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

/* ── "hello" template: the @nikahin_foreigner Canva look ── */
const H = { red: "#761410", navy: "#242A46", title: "#E4E4E4", shadow: "#0D1020", cursor: "#4B3F9E" };
const BAND = 230;
const ART_H = CARD_SIZE.height - BAND;

// Two wireframe globes, as in the template, drawn once for both slides
function globeMarkup(cx: number, cy: number, r: number, tilt: number) {
  const meridians = [0.22, 0.5, 0.78].map((k) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * k}" ry="${r}"/>`).join("");
  const parallels = [-0.8, -0.55, -0.28, 0, 0.28, 0.55, 0.8].map((k) => {
    const dy = r * k;
    const rx = Math.sqrt(r * r - dy * dy);
    return `<ellipse cx="${cx}" cy="${cy + dy}" rx="${rx}" ry="${rx * 0.16}"/>`;
  }).join("");
  return `<g transform="rotate(${tilt} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r}"/>${meridians}${parallels}</g>`;
}
const GLOBES = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE.width}" height="${ART_H}" viewBox="0 0 ${CARD_SIZE.width} ${ART_H}" fill="none" stroke="#9A4A45" stroke-width="2.5">${globeMarkup(20, 560, 210, -18)}${globeMarkup(1070, 760, 230, 16)}</svg>`,
)}`;

async function helloFonts(card: CardContent) {
  const { title, sub } = helloLines(card);
  const text = `@${card.page.handle}${title}${sub}Profile${card.rows.map((r) => r.label + r.value).join("")}${card.intro}“”more info?klik DM now!${card.code}:·`;
  const [regular, bold] = await Promise.all([googleFont("Inter", "wght@600", text), googleFont("Inter", "wght@800", text)]);
  return [
    regular && { name: "Inter", data: regular, weight: 600 as const, style: "normal" as const },
    bold && { name: "Inter", data: bold, weight: 800 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600 | 800; style: "normal" }[];
}

function HelloFrame({ card, children }: { card: CardContent; children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: H.red, fontFamily: "Inter" }}>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img src={GLOBES} width={CARD_SIZE.width} height={ART_H} style={{ position: "absolute", left: 0, top: 0 }} />
      <div style={{ position: "absolute", top: 62, left: 0, right: 0, display: "flex", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#FFFFFF" }}>
        @{card.page.handle}
      </div>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAND, background: H.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", position: "relative", width: 620, height: 142 }}>
          <div style={{ position: "absolute", left: 0, top: 12, width: 620, height: 130, borderRadius: 65, background: H.shadow }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 620, height: 130, borderRadius: 65, background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: H.navy, letterSpacing: -1.5, lineHeight: 1 }}>more info?</div>
            <div style={{ display: "flex", fontSize: 48, fontWeight: 800, color: H.navy, letterSpacing: -1.5, lineHeight: 1 }}>klik DM now!</div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={iconSvg("pointer", H.cursor, "#FFFFFF", 1.6)} width={104} height={104} style={{ position: "absolute", left: 548, top: 74 }} />
        </div>
        <div style={{ position: "absolute", right: 40, bottom: 24, display: "flex", fontSize: 26, fontWeight: 800, color: "rgba(255,255,255,0.55)" }}>{card.code}</div>
      </div>
    </div>
  );
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
const figureCache = new Map<Figure, string>();

// The artwork if we have it, otherwise the drawn silhouette
async function figureImage(figure: Figure): Promise<string> {
  const cached = figureCache.get(figure);
  if (cached) return cached;
  const src = await readFile(FIGURE_FILES[figure])
    .then((png) => `data:image/png;base64,${png.toString("base64")}`)
    .catch(() => figureSvg(figure, { base: "#DEDEDE", shade: "#C6C6C6" }));
  figureCache.set(figure, src);
  return src;
}

async function renderHelloIntro(card: CardContent): Promise<ImageResponse> {
  const { title, sub } = helloLines(card);
  const titleSize = title.length <= 14 ? 132 : title.length <= 19 ? 104 : 84;
  const figure = { width: 640, height: 768, src: await figureImage(card.figure) };
  return new ImageResponse(
    (
      <HelloFrame card={card}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={figure.src} width={figure.width} height={figure.height}
          style={{ position: "absolute", left: (CARD_SIZE.width - figure.width) / 2 + 30, top: ART_H - figure.height }} />
        <div style={{ position: "absolute", top: 138, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 800, color: H.title, letterSpacing: -titleSize * 0.045, lineHeight: 1 }}>{title}</div>
          {sub && <div style={{ display: "flex", marginTop: 16, fontSize: 60, fontWeight: 800, color: "#FFFFFF", letterSpacing: -2 }}>{sub}</div>}
        </div>
      </HelloFrame>
    ),
    { ...CARD_SIZE, fonts: await helloFonts(card) },
  );
}

async function renderHelloProfile(card: CardContent): Promise<ImageResponse> {
  // Everything switched on must still fit above the band, so rows tighten as they grow
  const dense = card.rows.length > 6 || (card.rows.length > 4 && card.intro.length > 0);
  const icon = dense ? 62 : 78;
  const gap = dense ? 16 : 26;
  return new ImageResponse(
    (
      <HelloFrame card={card}>
        {/* Title and rows sit centred in the space between the handle and the band */}
        <div style={{ position: "absolute", top: 120, bottom: BAND + 30, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: dense ? 88 : 104, fontWeight: 800, color: "#FFFFFF", letterSpacing: -3 }}>Profile</div>
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
      </HelloFrame>
    ),
    { ...CARD_SIZE, fonts: await helloFonts(card) },
  );
}

// Every slide of a card as PNG bytes, in posting order
export async function renderSlides(card: CardContent): Promise<ArrayBuffer[]> {
  const images = card.template === "hello"
    ? await Promise.all([renderHelloIntro(card), renderHelloProfile(card)])
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

// Instagram fetches each image first; wait until a container is ready (usually a few seconds)
async function waitReady(containerId: string) {
  for (let i = 0; i < 20; i++) {
    const { status_code } = await graph<{ status_code?: string }>(containerId, { params: { fields: "status_code" } });
    if (status_code === "FINISHED") return;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram could not process the image (${status_code}).`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Instagram is taking too long to process the image. Try again in a minute.");
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
  const published = await graph<{ id: string }>(`${igUserId}/media_publish`, { method: "POST", params: { creation_id: containerId } });
  await onPublished?.(published.id);
  const media = await graph<{ permalink?: string }>(published.id, { params: { fields: "permalink" } }).catch(() => ({ permalink: undefined }));
  return { mediaId: published.id, permalink: media.permalink ?? null };
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

// A post stuck in "publishing" this long is treated as failed, so it can be tried again
const STALE_MS = 5 * 60 * 1000;

/* Posts one client's card to one page and records it on social_posts/<candidate>_<page>:
   the exact card, the caption, and what the team hid or changed. Used by the Post button. */
export async function createPost({ candidateId, pageKey, choices, figure, caption, actor }: {
  candidateId: string;
  pageKey: SocialPageKey;
  choices: FieldChoices;
  figure: FigureChoice;
  caption: string;
  actor: { uid: string; name: string };
}): Promise<{ permalink: string | null }> {
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
  const changes = describeChoices(page.key, choices, profile, figure);

  // One post per client per page; claiming the record first also stops a double click posting twice
  const ref = db.collection(SOCIAL_POSTS).doc(`${candidateId}_${page.key}`);
  await db.runTransaction(async (tx) => {
    const existing = (await tx.get(ref)).data();
    const updated = (existing?.updatedAt as Timestamp | undefined)?.toMillis() ?? 0;
    if (existing?.status === "published") throw new PostError(`Already posted on @${page.handle}.`, 409);
    if (existing?.status === "publishing" && Date.now() - updated < STALE_MS) throw new PostError("This post is already being published.", 409);
    tx.set(ref, {
      candidateId, candidateName: String(profile.fullName || profile.name || ""), page: page.key, handle: page.handle,
      code: card.code, card, choices, changes, caption: text,
      status: "publishing", error: null, permalink: null, mediaId: null, imageUrl: null, imageUrls: [],
      consentConfirmed: true, byUid: actor.uid, byName: actor.name,
      createdAt: existing?.createdAt ?? FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
  });

  let publishedId: string | null = null;
  try {
    const account = await instagramAccount(page.handle);
    if (!account) throw new Error(`The poster can't see @${page.handle}. Check its access in Meta Business Settings.`);
    const slides = await renderSlides(card);
    const imageUrls = await Promise.all(slides.map((png, i) => hostCard(png, `${card.code}-${page.key}-${i + 1}`)));
    await ref.update({ imageUrl: imageUrls[0], imageUrls, updatedAt: FieldValue.serverTimestamp() });
    const { permalink } = await publishImages(account.id, imageUrls, text, async (id) => {
      publishedId = id;
      await ref.update({ status: "published", mediaId: id, publishedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
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
