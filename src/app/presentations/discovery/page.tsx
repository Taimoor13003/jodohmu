import type { Metadata } from "next";
import { DiscoveryPresentation } from "./discovery-presentation";

export const metadata: Metadata = {
  title: "Discovery Conversation — Jodohmu",
  description: "A guide for the matchmaker's discovery conversation with a new client.",
  robots: { index: false, follow: false },
};

export default function DiscoveryPresentationPage() {
  return <DiscoveryPresentation />;
}
