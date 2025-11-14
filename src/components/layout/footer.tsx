import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-icon-logo.png";

export function Footer() {
  return (
    <footer className="w-full text-white">
      <div className="h-1 w-full" style={{ backgroundImage: "linear-gradient(to right, #9B2242, #0b3a86)" }} />
      <div className="bg-[#0b3a86]" style={{ backgroundImage: "linear-gradient(to bottom, rgba(11,58,134,0.96), rgba(11,58,134,0.86))" }}>
        <div className="container py-12">
          <div className="grid gap-10 lg:grid-cols-3 items-start">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Image src={LogoIcon} alt="Jodohmu" className="h-9 w-auto" />
                <div className="ml-2 flex items-baseline">
                  <span className="text-2xl font-bold">Jodoh</span>
                  <span className="text-2xl font-bold" style={{ color: "#ffd7e2" }}>mu</span>
                </div>
              </div>
              <p className="text-white/80 text-sm max-w-sm">
                Find your soulmate with care, faith, and sincerity.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 text-sm">
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">About</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">How It Works</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">Pricing</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="/privacy" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">Privacy</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="/terms" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">Terms</Link>
            </div>

            {/* Social */}
            <div className="flex items-center lg:justify-end gap-3">
              <Link href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t bg-[#0b3a86]" style={{ borderColor: "#9B224233" }}>
        <div className="container flex flex-col sm:flex-row items-center justify-between py-4 text-xs text-white/70 gap-2">
          <p> {new Date().getFullYear()} Jodohmu. All rights reserved.</p>
          <p>
            Crafted with <span style={{ color: "#ffd7e2" }}>heart</span> and faith.
          </p>
        </div>
      </div>
    </footer>
  );
}
