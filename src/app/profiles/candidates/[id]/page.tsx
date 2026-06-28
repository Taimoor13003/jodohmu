import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profil Saya — Jodohmu",
  robots: "noindex, nofollow",
};

export default function Page({ params }: { params: { id: string } }) {
  return <ProfileClient id={params.id} />;
}
