import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242]">404</p>
      <h1 className="font-serif text-4xl font-bold text-[#0b3a86]">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-[#4a4f63]">Halaman yang Anda cari tidak ada atau sudah dipindahkan. / The page you are looking for does not exist or has moved.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/" className="rounded-full bg-[#0b3a86] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#9B2242]">Beranda</Link>
        <Link href="/en" hrefLang="en" className="rounded-full border border-[#0b3a86]/30 px-5 py-2.5 text-sm font-bold text-[#0b3a86] hover:border-[#9B2242]/40 hover:text-[#9B2242]">English home</Link>
      </div>
    </section>
  );
}
