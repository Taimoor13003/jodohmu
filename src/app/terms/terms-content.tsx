"use client";

import type { ReactNode } from "react";

import {
  FileText,
  UserCheck,
  Shield,
  AlertTriangle,
  X,
  MapPin,
  Phone,
  Mail,
  Info,
  Link as LinkIcon,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function TermsContent() {
  const { t, lang } = useLanguage();
  const locale = lang === "id" ? "id-ID" : "en-US";
  const formattedDate = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountSecurityItems = [
    t("terms.sections.account.security.items.responsibility"),
    t("terms.sections.account.security.items.notify"),
    t("terms.sections.account.security.items.liability"),
    t("terms.sections.account.security.items.sharing"),
  ];

  const contentProhibitions = [
    t("terms.sections.conduct.content.items.falseInfo"),
    t("terms.sections.conduct.content.items.inappropriate"),
    t("terms.sections.conduct.content.items.fakePhotos"),
    t("terms.sections.conduct.content.items.explicit"),
  ];

  const behaviorProhibitions = [
    t("terms.sections.conduct.behavior.items.harassment"),
    t("terms.sections.conduct.behavior.items.spam"),
    t("terms.sections.conduct.behavior.items.personalInfo"),
    t("terms.sections.conduct.behavior.items.illegal"),
  ];

  const profileGuidelines = [
    t("terms.sections.guidelines.profile.items.photos"),
    t("terms.sections.guidelines.profile.items.bio"),
    t("terms.sections.guidelines.profile.items.contactInfo"),
    t("terms.sections.guidelines.profile.items.promotions"),
  ];

  const disclaimers = [
    {
      title: t("terms.sections.disclaimers.items.guarantees.title"),
      body: t("terms.sections.disclaimers.items.guarantees.body"),
    },
    {
      title: t("terms.sections.disclaimers.items.safety.title"),
      body: t("terms.sections.disclaimers.items.safety.body"),
    },
    {
      title: t("terms.sections.disclaimers.items.liability.title"),
      body: t("terms.sections.disclaimers.items.liability.body"),
    },
  ];

  const terminationItems = [
    {
      title: t("terms.sections.termination.voluntary.title"),
      body: t("terms.sections.termination.voluntary.body"),
    },
    {
      title: t("terms.sections.termination.byJodohmu.title"),
      body: t("terms.sections.termination.byJodohmu.body"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9B2242] via-[#9B2242]/80 to-[#0b3a86]/90 opacity-95" />
        <div className="relative bg-gradient-to-br from-[#9B2242]/10 via-transparent to-[#0b3a86]/5">
          <div className="container py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm ring-2 ring-white/20">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-serif text-white drop-shadow-lg">
                  {t("terms.hero.title")}
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {t("terms.hero.subtitle")}
                </p>
                <p className="text-white/70">
                  {t("terms.hero.updatedPrefix")}: {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-12 max-w-4xl">
        <div className="space-y-12">
          <SectionCard
            icon={<FileText className="w-6 h-6 text-primary" />}
            title={t("terms.sections.acceptance.title")}
            body={t("terms.sections.acceptance.body")}
          />

          <SectionCard icon={<UserCheck className="w-6 h-6 text-primary" />} title={t("terms.sections.eligibility.title")}>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("terms.sections.eligibility.body")}
            </p>
            <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
              <p className="text-foreground font-semibold">
                {t("terms.sections.eligibility.important.label")}
              </p>
              <p className="text-muted-foreground">
                {t("terms.sections.eligibility.important.body")}
              </p>
            </div>
          </SectionCard>

          <SectionCard icon={<Shield className="w-6 h-6 text-primary" />} title={t("terms.sections.account.title")}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.account.registration.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.account.registration.body")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.account.security.title")}
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {accountSecurityItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<AlertTriangle className="w-6 h-6 text-primary" />} title={t("terms.sections.conduct.title")}>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("terms.sections.conduct.description")}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.conduct.content.title")}
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {contentProhibitions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.conduct.behavior.title")}
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {behaviorProhibitions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<FileText className="w-6 h-6 text-primary" />} title={t("terms.sections.guidelines.title")}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.guidelines.profile.title")}
                </h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {profileGuidelines.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.guidelines.removal.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.guidelines.removal.body")}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<Shield className="w-6 h-6 text-primary" />} title={t("terms.sections.intellectual.title")}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.intellectual.your.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.intellectual.your.body")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.intellectual.platform.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.intellectual.platform.body")}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<AlertTriangle className="w-6 h-6 text-primary" />} title={t("terms.sections.disclaimers.title")}>
            <div className="space-y-4">
              {disclaimers.map(({ title, body }) => (
                <div key={title}>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{body}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<X className="w-6 h-6 text-primary" />} title={t("terms.sections.termination.title")}>
            <div className="space-y-4">
              {terminationItems.map(({ title, body }) => (
                <div key={title}>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{body}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<Info className="w-6 h-6 text-primary" />} title={t("terms.sections.changes.title")}>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t("terms.sections.changes.description")}
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t("terms.sections.changes.notification")}
              </p>
            </div>
          </SectionCard>

          <SectionCard icon={<LinkIcon className="w-6 h-6 text-primary" />} title={t("terms.sections.privacy.title")}>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("terms.sections.privacy.description")}{" "}
              <a href="/privacy" className="text-primary hover:underline">
                {t("terms.sections.privacy.linkText")}
              </a>
              .
            </p>
          </SectionCard>

          <SectionCard icon={<MapPin className="w-6 h-6 text-primary" />} title={t("terms.sections.law.title")}>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.law.governing.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.law.governing.body")}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t("terms.sections.law.dispute.title")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("terms.sections.law.dispute.body")}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<Mail className="w-6 h-6 text-primary" />} title={t("terms.sections.contact.title")}>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t("terms.sections.contact.description")}
            </p>
            <div className="bg-gradient-to-r from-[#9B2242]/5 to-[#0b3a86]/5 p-6 rounded-xl border border-border/50 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <p className="text-foreground">
                  <strong>{t("terms.sections.contact.items.email.label")}</strong>{" "}
                  <a
                    href={`mailto:${t("terms.sections.contact.items.email.value")}`}
                    className="text-primary hover:underline"
                  >
                    {t("terms.sections.contact.items.email.value")}
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-foreground">
                  <strong>{t("terms.sections.contact.items.phone.label")}</strong>{" "}
                  <a
                    href={`tel:${t("terms.sections.contact.items.phone.value")}`}
                    className="text-primary hover:underline"
                  >
                    {t("terms.sections.contact.items.phone.value")}
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <p className="text-foreground">
                  <strong>{t("terms.sections.contact.items.location.label")}</strong>{" "}
                  {t("terms.sections.contact.items.location.value")}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  body?: string;
  children?: ReactNode;
}

function SectionCard({ icon, title, body, children }: SectionCardProps) {
  return (
    <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-foreground">{title}</h2>
          {body ? <p className="text-muted-foreground leading-relaxed text-lg">{body}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
