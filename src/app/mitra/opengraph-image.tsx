import { OG_SIZE, brandCard } from "@/lib/og-card";

/* Link preview for the Mitra page. No commission figures — those are shared
   one-to-one, never on anything public. */

export const runtime = "nodejs";
export const alt = "Program Mitra Jodohmu";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return brandCard({
    eyebrow: "PROGRAM MITRA JODOHMU",
    lead: "Bantu mereka",
    emphasis: "bertemu jodohnya",
    sub: "Jadilah Mitra Jodohmu: pendampingan yang terhormat dan melibatkan keluarga.",
    footer: "Daftar menjadi Mitra  ·  jodohmu.com/mitra",
    medallion: "Mitra",
    medallionLabel: "JODOHMU",
  });
}
