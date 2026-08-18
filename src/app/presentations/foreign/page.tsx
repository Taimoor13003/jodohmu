import type { Metadata } from "next";
import { ForeignPresentation } from "./foreign-presentation";

type SearchParams = Record<string, string | string[] | undefined>;

export const metadata: Metadata = {
  title: "Your Jodohmu International Journey",
  description: "A tailored presentation for Jodohmu's international matchmaking service.",
  robots: { index: false, follow: false },
};

const readParam = (value: SearchParams[string]) => (Array.isArray(value) ? value[0] : value);

export default function ForeignPresentationPage({ searchParams }: { searchParams: SearchParams }) {
  const visible = readParam(searchParams.show)?.split(",") ?? ["safar", "amanah"];
  const showSafar = visible.includes("safar");
  const showAmanah = visible.includes("amanah");

  return <ForeignPresentation client={readParam(searchParams.client)} pricesVisible={readParam(searchParams.prices) !== "hidden"} showSafar={showSafar || !showAmanah} showAmanah={showAmanah || !showSafar} presenter={readParam(searchParams.presenter) === "1"} />;
}
