import type { Metadata } from "next";

// Signed-in holding page: keep it out of search results.
export const metadata: Metadata = {
  title: "Permintaan terkirim",
  robots: { index: false, follow: false },
};

export default function RequestSubmittedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
