"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "./header";
import { Footer } from "./footer";
import { WhatsAppFab } from "./whatsapp-fab";

const APP_PREFIXES = ["/dashboard", "/admin", "/profile/"];

export function PublicShell({
  children,
  whatsappHref,
}: {
  children: React.ReactNode;
  whatsappHref: string;
}) {
  const { loading } = useAuth();
  const pathname = usePathname();

  const isAppRoute = APP_PREFIXES.some((p) => pathname.startsWith(p));

  // App routes (dashboard / admin / public profile) manage their own shell
  if (isAppRoute) return <>{children}</>;

  // While auth is resolving on marketing pages, skip the shell to avoid flash
  if (loading) return <>{children}</>;

  return (
    <>
      <Header />
      <main id="main-content" role="main">
        {children}
      </main>
      <Footer />
      <WhatsAppFab href={whatsappHref} />
    </>
  );
}
