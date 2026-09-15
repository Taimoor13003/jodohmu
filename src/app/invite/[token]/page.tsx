import type { Metadata } from "next";
import InviteView from "./InviteView";

export const dynamic = "force-dynamic";

const title = "Profil Jodohmu kamu sudah siap";
const description = "Masuk untuk melihat, melengkapi, dan membagikan profil ta'aruf kamu di Jodohmu.";

export const metadata: Metadata = {
  title: { absolute: `${title} — Jodohmu` },
  description,
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
  openGraph: { type: "website", siteName: "Jodohmu", locale: "id_ID", title, description },
};

export default function InvitePage({ params }: { params: { token: string } }) {
  return <InviteView token={params.token} />;
}
