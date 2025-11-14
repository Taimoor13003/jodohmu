import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, FileText, Shield, Info, Heart, DollarSign } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-icon-logo.png";

export function Footer() {
  return (
    <footer className="w-full text-white" style={{background: "#9d455cff"}}>
      <div className="h-1 w-full bg-gradient-to-r from-brand-rose to-brand-blue" />
      <div className="bg-gradient-to-b from-brand-blue/96 to-brand-blue/86 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        <div className="container py-16 relative z-10">
          <div className="grid gap-12 lg:grid-cols-3 items-start">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center">
                <Image src={LogoIcon} alt="Jodohmu" className="h-10 w-auto" />
                <div className="ml-3 flex items-baseline">
                  <span className="text-3xl font-bold">Jodoh</span>
                  <span className="text-3xl font-bold text-[#ffd7e2]">mu</span>
                </div>
              </div>
              <p className="text-white/80 text-base leading-relaxed max-w-sm">
                Find your soulmate with care, faith, and sincerity.
              </p>
              <div className="flex items-center gap-2 text-brand-pink/80">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm">Trusted by thousands</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-lg font-semibold text-white/90">Quick Links</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 text-sm">
                <Link href="#" className="flex items-center gap-2 text-white/80 hover:text-brand-pink hover:underline underline-offset-4 decoration-brand-pink transition-all duration-300 hover:scale-105">
                  <Info className="w-4 h-4" />
                  About
                </Link>
                <span className="hidden sm:block text-white/20">•</span>
                <Link href="#" className="flex items-center gap-2 text-white/80 hover:text-brand-pink hover:underline underline-offset-4 decoration-brand-pink transition-all duration-300 hover:scale-105">
                  <Heart className="w-4 h-4" />
                  How It Works
                </Link>
                <span className="hidden sm:block text-white/20">•</span>
                <Link href="#" className="flex items-center gap-2 text-white/80 hover:text-brand-pink hover:underline underline-offset-4 decoration-brand-pink transition-all duration-300 hover:scale-105">
                  <Info className="w-4 h-4" />
                  Pricing
                </Link>
                <span className="hidden sm:block text-white/20">•</span>
                <Link href="/privacy" className="flex items-center gap-2 text-white/80 hover:text-brand-pink hover:underline underline-offset-4 decoration-brand-pink transition-all duration-300 hover:scale-105">
                  <Shield className="w-4 h-4" />
                  Privacy
                </Link>
                <span className="hidden sm:block text-white/20">•</span>
                <Link href="/terms" className="flex items-center gap-2 text-white/80 hover:text-brand-pink hover:underline underline-offset-4 decoration-brand-pink transition-all duration-300 hover:scale-105">
                  <FileText className="w-4 h-4" />
                  Terms
                </Link>
              </div>
            </div>

            {/* Social */}
            <div className="flex flex-col items-center lg:items-end space-y-4">
              <h3 className="text-lg font-semibold text-white/90">Connect With Us</h3>
              <div className="flex items-center gap-4">
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-brand-rose hover:to-brand-blue ring-1 ring-white/20 hover:ring-brand-rose/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand-rose/25">
                  <Facebook className="h-5 w-5 text-white group-hover:text-white transition-colors" />
                </Link>
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-brand-rose hover:to-brand-blue ring-1 ring-white/20 hover:ring-brand-rose/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand-rose/25">
                  <Instagram className="h-5 w-5 text-white group-hover:text-white transition-colors" />
                </Link>
                <Link href="#" className="group inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-brand-rose hover:to-brand-blue ring-1 ring-white/20 hover:ring-brand-rose/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand-rose/25">
                  <Twitter className="h-5 w-5 text-white group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[#9B2242]/20 bg-[#0b3a86] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        </div>
        <div className="container flex flex-col sm:flex-row items-center justify-between py-6 text-sm text-white/70 gap-4 relative z-10">
          <p className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Jodohmu</span>
            <span className="text-white/40">•</span>
            <span>All rights reserved</span>
          </p>
          <p className="flex items-center gap-2">
            <span>Crafted with</span>
            <Heart className="w-4 h-4 text-brand-pink fill-current" />
            <span>and faith</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
