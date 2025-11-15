"use client";

import {
  Shield,
  Lock,
  Eye,
  Users,
  Settings,
  Trash2,
  Info,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  UserX,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function PrivacyContent() {
  const { t, lang } = useLanguage();
  const locale = lang === "id" ? "id-ID" : "en-US";
  const formattedDate = new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const personalInformationItems = [
    t("privacy.sections.information.personal.items.nameEmail"),
    t("privacy.sections.information.personal.items.phone"),
    t("privacy.sections.information.personal.items.profile"),
    t("privacy.sections.information.personal.items.age"),
    t("privacy.sections.information.personal.items.location"),
  ];

  const usageDataItems = [
    t("privacy.sections.information.usage.items.interactions"),
    t("privacy.sections.information.usage.items.views"),
    t("privacy.sections.information.usage.items.communication"),
    t("privacy.sections.information.usage.items.analytics"),
  ];

  const technicalDataItems = [
    t("privacy.sections.information.technical.items.ip"),
    t("privacy.sections.information.technical.items.browser"),
    t("privacy.sections.information.technical.items.os"),
    t("privacy.sections.information.technical.items.cookies"),
  ];

  const usagePurposes = [
    t("privacy.sections.usage.items.service"),
    t("privacy.sections.usage.items.profile"),
    t("privacy.sections.usage.items.matching"),
    t("privacy.sections.usage.items.communication"),
    t("privacy.sections.usage.items.safety"),
    t("privacy.sections.usage.items.notifications"),
    t("privacy.sections.usage.items.improvements"),
    t("privacy.sections.usage.items.legal"),
  ];

  const securityMeasures = [
    t("privacy.sections.security.items.encryption"),
    t("privacy.sections.security.items.authentication"),
    t("privacy.sections.security.items.assessments"),
    t("privacy.sections.security.items.access"),
  ];

  const userRights = [
    t("privacy.sections.rights.items.access"),
    t("privacy.sections.rights.items.correct"),
    t("privacy.sections.rights.items.delete"),
    t("privacy.sections.rights.items.object"),
    t("privacy.sections.rights.items.portability"),
    t("privacy.sections.rights.items.withdraw"),
  ];

  const sharingItems = [
    {
      title: t("privacy.sections.sharing.items.firebase.title"),
      description: t("privacy.sections.sharing.items.firebase.description"),
      linkText: t("privacy.sections.sharing.items.firebase.linkText"),
      linkHref: "https://policies.google.com/privacy",
    },
    {
      title: t("privacy.sections.sharing.items.providers.title"),
      description: t("privacy.sections.sharing.items.providers.description"),
    },
    {
      title: t("privacy.sections.sharing.items.legal.title"),
      description: t("privacy.sections.sharing.items.legal.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#9B2242] via-[#9B2242]/80 to-[#0b3a86]/90 opacity-95"></div>
        <div className="relative bg-gradient-to-br from-[#9B2242]/10 via-transparent to-[#0b3a86]/5">
          <div className="container py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm ring-2 ring-white/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-serif text-white drop-shadow-lg">
                  {t("privacy.hero.title")}
                </h1>
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {t("privacy.hero.subtitle")}
                </p>
                <p className="text-white/70">
                  {t("privacy.hero.updatedPrefix")}: {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-12 max-w-4xl">
        <div className="space-y-12">
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.introduction.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.introduction.body")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.information.title")}
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t("privacy.sections.information.personal.title")}
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      {personalInformationItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t("privacy.sections.information.usage.title")}
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      {usageDataItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {t("privacy.sections.information.technical.title")}
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                      {technicalDataItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.usage.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.usage.description")}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {usagePurposes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.sharing.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.sharing.description")}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {sharingItems.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}:</strong> {item.description}
                      {item.linkHref && (
                        <>
                          {" "}
                          <a
                            href={item.linkHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {item.linkText}
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.sharing.note")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.security.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.security.description")}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {securityMeasures.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.rights.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.rights.description")}
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-lg">
                  {userRights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.retention.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.retention.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserX className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.children.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.children.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.international.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.international.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.updates.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.updates.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-serif text-foreground">
                  {t("privacy.sections.contact.title")}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {t("privacy.sections.contact.description")}
                </p>
                <div className="bg-gradient-to-r from-[#9B2242]/5 to-[#0b3a86]/5 p-6 rounded-xl border border-border/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>{t("privacy.sections.contact.items.email.label")}</strong>{" "}
                      <a
                        href={`mailto:${t("privacy.sections.contact.items.email.value")}`}
                        className="text-primary hover:underline"
                      >
                        {t("privacy.sections.contact.items.email.value")}
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>{t("privacy.sections.contact.items.phone.label")}</strong>{" "}
                      <a
                        href={`tel:${t("privacy.sections.contact.items.phone.value")}`}
                        className="text-primary hover:underline"
                      >
                        {t("privacy.sections.contact.items.phone.value")}
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-foreground">
                      <strong>{t("privacy.sections.contact.items.location.label")}</strong>{" "}
                      {t("privacy.sections.contact.items.location.value")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
