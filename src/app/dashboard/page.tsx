"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Users, Sparkles, HeartHandshake, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-lg">Loading...</div>;
  }

  const adminActions = (
    <div className="grid gap-3 md:grid-cols-2">
      <ActionLink
        title="Create user"
        description="Add admins, workers, or candidates with intake details."
        href="/admin/users"
        icon={<ShieldCheck className="h-5 w-5" />}
      />
      <ActionLink
        title="Manage profiles"
        description="Browse and manage candidate profiles."
        href="/profiles"
        icon={<Users className="h-5 w-5" />}
      />
    </div>
  );

  const workerActions = (
    <ActionLink
      title="Manage profiles"
      description="Search and manage candidate profiles."
      href="/profiles"
      icon={<Users className="h-5 w-5" />}
    />
  );

  const candidateActions = (
    <ActionLink
      title="Update my details"
      description="Message our team and we’ll adjust your profile."
      href="https://wa.me/6281122210303"
      external
      icon={<HeartHandshake className="h-5 w-5" />}
    />
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f7ecf4] via-white to-[#e7f0ff]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -left-10 h-52 w-52 rounded-full bg-[#9B2242]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#0b3a86]/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-10">
        <Card className="mb-6 border-0 bg-white/90 shadow-2xl">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#9B2242] uppercase tracking-wide">Dashboard</p>
              <CardTitle className="text-3xl text-[#0b3a86]">Welcome back, {user.displayName || "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
            </div>
            <div className="rounded-full bg-[#0b3a86]/10 px-4 py-2 text-sm font-semibold text-[#0b3a86]">
              Role: {role}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Profiles" value="—" hint="Coming soon" />
            <StatCard title="Recent views" value="—" hint="Logged per profile" />
            <StatCard title="Likes" value="—" hint="Logged per profile" />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-0 bg-white/90 shadow-xl lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#9B2242]">
                <Sparkles className="h-4 w-4" /> Quick actions
              </div>
              <CardTitle className="text-2xl text-[#0b3a86]">
                {role === "admin"
                  ? "Admin controls"
                  : role === "worker"
                  ? "Profile management"
                  : "Your profile support"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {role === "admin" && adminActions}
              {role === "worker" && workerActions}
              {role === "candidate" && candidateActions}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0b3a86]">
                <ShieldCheck className="h-4 w-4" /> Support
              </div>
              <CardTitle className="text-xl text-[#0b3a86]">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Chat our team if you need updates, approvals, or guidance.</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://wa.me/6281122210303" target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </Link>
              </Button>
              <Button asChild className="w-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white">
                <Link href="/faq">
                  Visit FAQ
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-[#0b3a86]">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ActionLink({
  title,
  description,
  href,
  icon,
  external = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link
      href={href}
      {...linkProps}
      className="group flex items-start gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mt-1 rounded-full bg-[#0b3a86]/10 p-2 text-[#0b3a86]">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-[#0b3a86] font-semibold">
          {title}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}
