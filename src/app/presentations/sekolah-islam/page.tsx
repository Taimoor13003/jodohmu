import type { Metadata } from "next";
import { IslamicSchoolPresentation } from "./islamic-school-presentation";

export const metadata: Metadata = {
  title: "Can We Still Find the Right Partner While Protecting Our Modesty and Values?",
  description: "A values-led Muslim path through modern dating, ta’aruf, and marriage.",
  robots: { index: false, follow: false },
};

export default function IslamicSchoolPresentationPage() {
  return <IslamicSchoolPresentation />;
}
