import type { Metadata } from "next";
import { EntrepreneurshipPresentation } from "./entrepreneurship-presentation";

export const metadata: Metadata = {
  title: "Money, Purpose, and Building Jodohmu",
  description: "An entrepreneurship talk: how Islam frames wealth, and how purpose turned into a real startup.",
  robots: { index: false, follow: false },
};

export default function EntrepreneurshipPresentationPage() {
  return <EntrepreneurshipPresentation />;
}
