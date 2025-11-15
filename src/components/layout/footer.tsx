import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, FileText, Shield, Info, Heart, DollarSign } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";

export function Footer() {
  return (
    <footer className="w-full text-[#0b3a86]">
      <div className="h-1 w-full bg-gradient-to-r from-[#f6adc3] via-[#f39cb5] to-[#f18aa7]" />
      <div className="bg-gradient-to-b from-[#fbe0ea] via-[#f7c7d7] to-[#f3aec4] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="container py-16 relative z-10">
          <div className="grid gap-12 lg:grid-cols-3 items-start">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center">
                <Image src={LogoIcon} alt="Jodohmu" height={250} />
              </div>
              <p className="text-[#0b3a86] text-base leading-relaxed max-w-sm font-semibold">
                Find your soulmate with care, faith, and sincerity.
              </p>
              <div className="flex items-center gap-2 text-[#0b3a86] font-semibold">
                <Heart className="w-4 h-4" style={{ color: "#0b3a86" }} />
                <span className="text-sm">Trusted by thousands</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-lg font-semibold text-[#0b3a86]">Quick Links</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 text-sm text-[#0b3a86] font-medium">
                <Link href="#" className="flex items-center gap-2 text-[#0b3a86] hover:text-[#07265d] hover:underline underline-offset-4 decoration-[#0b3a86] transition-all duration-300 hover:scale-105 font-semibold">
                  <Info className="w-4 h-4" />
                  About
                </Link>
                <span className="hidden sm:block text-[#0b3a86]/30">•</span>
                <Link href="#" className="flex items-center gap-2 text-[#0b3a86] hover:text-[#07265d] hover:underline underline-offset-4 decoration-[#0b3a86] transition-all duration-300 hover:scale-105 font-semibold">
                  <Heart className="w-4 h-4" />
                  How It Works
                </Link>
                <span className="hidden sm:block text-[#0b3a86]/30">•</span>
                <Link href="#" className="flex items-center gap-2 text-[#0b3a86] hover:text-[#07265d] hover:underline underline-offset-4 decoration-[#0b3a86] transition-all duration-300 hover:scale-105 font-semibold">
                  <Info className="w-4 h-4" />
                  Pricing
                </Link>
                <span className="hidden sm:block text-[#0b3a86]/30">•</span>
                <Link href="/privacy" className="flex items-center gap-2 text-[#0b3a86] hover:text-[#07265d] hover:underline underline-offset-4 decoration-[#0b3a86] transition-all duration-300 hover:scale-105 font-semibold">
                  <Shield className="w-4 h-4" />
                  Privacy
                </Link>
                <span className="hidden sm:block text-[#0b3a86]/30">•</span>
                <Link href="/terms" className="flex items-center gap-2 text-[#0b3a86] hover:text-[#07265d] hover:underline underline-offset-4 decoration-[#0b3a86] transition-all duration-300 hover:scale-105 font-semibold">
                  <FileText className="w-4 h-4" />
                  Terms
                </Link>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <h3 className="text-lg font-semibold text-[#0b3a86]">Connect With Us</h3>
              <div className="flex items-center gap-4">
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-gradient-to-r hover:from-[#f18aa7] hover:to-[#f6adc3] ring-1 ring-white/30 hover:ring-white/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#f18aa7]/30">
                  <Facebook className="h-5 w-5 text-[#0b3a86] group-hover:text-white transition-colors" />
                </Link>
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-gradient-to-r hover:from-[#f18aa7] hover:to-[#f6adc3] ring-1 ring-white/30 hover:ring-white/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#f18aa7]/30">
                  <Instagram className="h-5 w-5 text-[#0b3a86] group-hover:text-white transition-colors" />
                </Link>
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 hover:bg-gradient-to-r hover:from-[#f18aa7] hover:to-[#f6adc3] ring-1 ring-white/30 hover:ring-white/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#f18aa7]/30">
                  <Twitter className="h-5 w-5 text-[#0b3a86] group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#f18aa7]/40 bg-[#f7c7d7] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/15 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-xl"></div>
        </div>
        <div className="container flex flex-col sm:flex-row items-center justify-between py-6 text-sm text-[#0b3a86] gap-4 relative z-10 font-medium">
          <p className="flex items-center gap-2 font-semibold">
            <span> {new Date().getFullYear()} Jodohmu</span>
            <span>•</span>
            <span>All rights reserved</span>
          </p>
          <p className="flex items-center gap-2 font-semibold">
            <span>Crafted with</span>
            <Heart className="w-4 h-4" style={{ color: "#0b3a86" }} />
            <span>and faith</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
