import type { Metadata } from "next";
import { IndonesiaPresentation } from "./indonesia-presentation";

type SearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Perjalanan Jodohmu Anda",
  description: "Presentasi khusus untuk layanan matchmaking Jodohmu di Indonesia.",
  robots: { index: false, follow: false },
};

const readParam = (value: SearchParams[string]) => (Array.isArray(value) ? value[0] : value);

export default function IndonesiaPresentationPage({ searchParams }: { searchParams: SearchParams }) {
  const visible = readParam(searchParams.show)?.split(",") ?? ["pearl", "ruby", "diamond"];
  const showPearl = visible.includes("pearl");
  const showRuby = visible.includes("ruby");
  const showDiamond = visible.includes("diamond");
  const noneSelected = !showPearl && !showRuby && !showDiamond;

  return (
    <IndonesiaPresentation
      client={readParam(searchParams.client)}
      pricesVisible={readParam(searchParams.prices) !== "hidden"}
      showPearl={noneSelected || showPearl}
      showRuby={noneSelected || showRuby}
      showDiamond={noneSelected || showDiamond}
      presenter={readParam(searchParams.presenter) === "1"}
    />
  );
}
