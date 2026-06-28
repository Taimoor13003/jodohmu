import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profil Kandidat — Jodohmu",
  robots: "noindex",
};

export default function Page() {
  return <ProfileClient />;
}
