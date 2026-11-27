/* How X counts a post's length, close enough for the composer and the server check (safe in the browser):
   a link always counts as 23, Latin text 1 per character, and emoji, Chinese, Arabic etc. 2 each. */

export const X_TEXT_LIMIT = 280;
const URL_RE = /https?:\/\/\S+/g;

const light = (cp: number) =>
  (cp >= 0 && cp <= 0x10ff) || (cp >= 0x2000 && cp <= 0x200d) || (cp >= 0x2010 && cp <= 0x201f) || (cp >= 0x2032 && cp <= 0x2037);

export function xLength(text: string): number {
  let n = 0;
  const rest = text.replace(URL_RE, () => { n += 23; return ""; });
  for (const ch of Array.from(rest)) n += light(ch.codePointAt(0)!) ? 1 : 2;
  return n;
}

// The text cut to fit X, on a word where possible, ending in "…"
export function fitX(text: string): string {
  const body = text.trim();
  if (xLength(body) <= X_TEXT_LIMIT) return body;
  const chars = Array.from(body);
  // Longest start of the text that still fits with the "…"
  let lo = 0, hi = chars.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (xLength(chars.slice(0, mid).join("") + "…") <= X_TEXT_LIMIT) lo = mid; else hi = mid - 1;
  }
  const cut = lo;
  let out = chars.slice(0, cut).join("");
  const space = out.lastIndexOf(" ");
  if (space > out.length * 0.7) out = out.slice(0, space);
  return `${out.trimEnd()}…`;
}
