"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isAppRoute = APP_PREFIXES.some((p) => pathname.startsWith(p));

  // App routes (dashboard / admin / public profile) manage their own shell
  if (isAppRoute) return <>{children}</>;

  // The shell must render during SSR too — header/footer carry the site-wide
  // internal links crawlers rely on. Auth-dependent UI inside Header handles
  // its own loading state instead of hiding the whole shell.
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
