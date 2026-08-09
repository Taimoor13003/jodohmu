'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/layout/animated-section";
import { ParallaxHero } from "@/components/layout/parallax-hero";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, Users, Star, Calendar, ShieldCheck, Handshake, Sparkles, HeartHandshake, MessageCircle, CheckCircle2, MapPin, MapPinned } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import { analytics } from "@/lib/analytics";
import { HomeContactForm } from "@/components/home/HomeContactForm";
import heroSectionImage from "@/assets/jodoh-mu-hero-section.png";
import indoBrideImage from "@/assets/indo-bride.png";
import indoGroomImage from "@/assets/indo-groom.png";
import sundaneseGroomImage from "@/assets/sundanese-groom.png";
import sundaneseBrideImage from "@/assets/sundanese-bride.png";
import indoGroomImage2 from "@/assets/indo-groom2.png";

const OfficeLocationMap = dynamic(
  () => import("@/components/home/office-location-map").then((module) => module.OfficeLocationMap),
  { ssr: false }
);

export default function HomePage() {
  const { t } = useLanguage();

  const featureCards = [
    {
      Icon: Heart,
      title: t("homepage.features.cards.personalized.title"),
      description: t("homepage.features.cards.personalized.description"),
      delay: 0,
    },
    {
      Icon: Users,
      title: t("homepage.features.cards.community.title"),
      description: t("homepage.features.cards.community.description"),
      delay: 0.1,
    },
    {
      Icon: Calendar,
      title: t("homepage.features.cards.guided.title"),
      description: t("homepage.features.cards.guided.description"),
      delay: 0.2,
    },
    {
      Icon: Star,
      title: t("homepage.features.cards.halal.title"),
      description: t("homepage.features.cards.halal.description"),
      delay: 0.3,
    },
  ];

  const matchingStories = [
    {
      badge: t("homepage.features.stories.curated.badge"),
      title: t("homepage.features.stories.curated.title"),
      subtitle: t("homepage.features.stories.curated.subtitle"),
      gradient: "from-[#ffe0ef] to-[#ffd2dd]",
      image: sundaneseBrideImage,
      position: "lg:-rotate-6 lg:-translate-y-10 lg:-translate-x-16 z-30",
    },
    {
      badge: t("homepage.features.stories.trusted.badge"),
      title: t("homepage.features.stories.trusted.title"),
      subtitle: t("homepage.features.stories.trusted.subtitle"),
      gradient: "from-[#fff2d9] to-[#ffe7b3]",
      image: sundaneseGroomImage,
      position: "lg:rotate-3 lg:translate-y-4 lg:-translate-x-2 z-20",
    },
    {
      badge: t("homepage.features.stories.celebrated.badge"),
      title: t("homepage.features.stories.celebrated.title"),
      subtitle: t("homepage.features.stories.celebrated.subtitle"),
      gradient: "from-[#e7f0ff] to-[#d3e2ff]",
      image: indoGroomImage2,
      position: "lg:rotate-8 lg:translate-y-16 lg:translate-x-12 z-10",
    },
  ];

  const [primaryStory, ...secondaryStories] = matchingStories;

  const meetingScenarios = [
    {
      icon: ShieldCheck,
      title: t("homepage.meetings.steps.intake.title"),
      description: t("homepage.meetings.steps.intake.description"),
      feeling: t("homepage.meetings.steps.intake.feeling")
    },
    {
      icon: HeartHandshake,
      title: t("homepage.meetings.steps.curated.title"),
      description: t("homepage.meetings.steps.curated.description"),
      feeling: t("homepage.meetings.steps.curated.feeling")
    },
    {
      icon: MessageCircle,
      title: t("homepage.meetings.steps.checkins.title"),
      description: t("homepage.meetings.steps.checkins.description"),
      feeling: t("homepage.meetings.steps.checkins.feeling")
    },
    {
      icon: Calendar,
      title: t("homepage.meetings.steps.natural.title"),
      description: t("homepage.meetings.steps.natural.description"),
      feeling: t("homepage.meetings.steps.natural.feeling")
    }
  ];

  const meetingPromises = [
    t("homepage.meetings.promises.safe"),
    t("homepage.meetings.promises.transparent"),
    t("homepage.meetings.promises.family")
  ];

  const officeLocations = [
    { name: t("homepage.locations.cities.jakarta"), x: 218, y: 278, mapX: "26.7%", mapY: "64.8%", position: [-6.2088, 106.8456] as [number, number], phase: "soon" as const },
    { name: t("homepage.locations.cities.bandung"), x: 231, y: 292, mapX: "28.3%", mapY: "67.8%", position: [-6.9175, 107.6191] as [number, number], phase: "soon" as const },
    { name: t("homepage.locations.cities.yogyakarta"), x: 279, y: 311, mapX: "34.2%", mapY: "71.7%", position: [-7.7956, 110.3695] as [number, number], phase: "soon" as const },
    { name: t("homepage.locations.cities.surabaya"), x: 319, y: 300, mapX: "39.1%", mapY: "69.4%", position: [-7.2575, 112.7521] as [number, number], phase: "soon" as const },
    { name: t("homepage.locations.cities.medan"), x: 79, y: 72, mapX: "9.7%", mapY: "24.2%", position: [3.5952, 98.6722] as [number, number], phase: "next" as const },
    { name: t("homepage.locations.cities.samarinda"), x: 394, y: 158, mapX: "48.1%", mapY: "41.1%", position: [-0.5022, 117.1536] as [number, number], phase: "next" as const },
    { name: t("homepage.locations.cities.makassar"), x: 432, y: 255, mapX: "52.9%", mapY: "60.4%", position: [-5.1477, 119.4327] as [number, number], phase: "next" as const },
    { name: t("homepage.locations.cities.jayapura"), x: 795, y: 201, mapX: "99.4%", mapY: "50.3%", position: [-2.5337, 140.7181] as [number, number], phase: "third" as const },
    { name: t("homepage.locations.cities.kualaLumpur"), x: 130, y: 81, mapX: "16.3%", mapY: "20.3%", position: [3.139, 101.6869] as [number, number], phase: "third" as const },
    { name: t("homepage.locations.cities.singapore"), x: 167, y: 119, mapX: "20.9%", mapY: "29.8%", position: [1.3521, 103.8198] as [number, number], phase: "third" as const },
  ];

  const [showForm, setShowForm] = useState(false);

  const heroTagline = t("homepage.hero.tagline");

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <main className="flex-1">
        <ParallaxHero
          imageUrls={[heroSectionImage]}
          imageAlts={["Couple consulting with Jodohmu matchmaker"]}
          baseImageClassName="object-cover"
          overlayClassName="bg-gradient-to-b from-[#0b3a86]/25 via-[#9B2242]/15 to-transparent"
          contentClassName="flex h-full items-center"
          className="h-auto min-h-[70vh] lg:min-h-[80vh]"
          imageQuality={75}
          baseImageSizes="(min-width: 1024px) 1200px, 100vw"
        >
          <div className="container grid items-center gap-12 px-4 py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 text-white drop-shadow-xl"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-white"
              >
                {t("homepage.hero.badge")}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-white opacity-60"
              >
                Berbasis di Bandung, Indonesia
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t("homepage.hero.title")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="max-w-xl text-lg leading-relaxed text-white/90"
              >
                {heroTagline}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-white px-10 py-6 text-lg font-semibold text-[#9B2242] shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/90"
                    onClick={() => { setShowForm(true); analytics.ctaClick('hero_register', 'home'); }}
                  >
                    {t("homepage.hero.cta")}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/70 bg-white/10 px-10 py-6 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                  >
                    <Link href="/contact" onClick={() => analytics.ctaClick('hero_contact', 'home')}>{t("homepage.hero.secondaryCta")}</Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="hidden justify-end lg:flex"
            >
              <div className="max-w-md rounded-[32px] border border-white/25 bg-white/10 p-6 text-left text-white shadow-2xl backdrop-blur-lg">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.45em] text-white">
                  {primaryStory.badge}
                </span>
                <p className="mt-4 text-2xl font-semibold leading-snug">
                  {primaryStory.title}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  {primaryStory.subtitle}
                </p>
              </div>
            </motion.div>
          </div>
        </ParallaxHero>

        <AnimatedSection className="relative overflow-hidden w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-[#fde0ed] via-[#fbe7f1] to-[#f6ccd9]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-12 h-64 w-64 rounded-full bg-[#f8bcd4]/70 blur-[140px]" />
            <div className="absolute bottom-0 right-10 h-60 w-60 rounded-full bg-[#f5a9c5]/65 blur-[140px]" />
            <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
          </div>
          <div className="container relative z-10 flex flex-col items-center text-center gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl space-y-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/78 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242] shadow-sm shadow-white/45">
                {t("homepage.whyChoose.badge")}
              </span>
              <h2 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-[#9B2242] via-[#f26d9b] to-[#b23a62] bg-clip-text text-transparent">
                {t("homepage.whyChoose.title")}
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-[#732845]/88">
                {t("homepage.whyChoose.description")}
              </p>
              <p className="text-base md:text-lg leading-relaxed text-[#732845]/75">
                {t("homepage.whyChoose.secondary")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid w-full max-w-5xl gap-6 md:grid-cols-3"
            >
              {[
                {
                  icon: ShieldCheck,
                  title: t("homepage.whyChoose.highlights.trust.title"),
                  description: t("homepage.whyChoose.highlights.trust.description"),
                  accent: "from-[#f26d9b]/85 to-[#f59fba]/90"
                },
                {
                  icon: Handshake,
                  title: t("homepage.whyChoose.highlights.guidance.title"),
                  description: t("homepage.whyChoose.highlights.guidance.description"),
                  accent: "from-[#eb588a]/82 to-[#f383ab]/90"
                },
                {
                  icon: Sparkles,
                  title: t("homepage.whyChoose.highlights.curation.title"),
                  description: t("homepage.whyChoose.highlights.curation.description"),
                  accent: "from-[#f49cba]/80 to-[#f7bbcf]/88"
                }
              ].map(({ icon: Icon, title, description, accent }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-8 backdrop-blur-xl shadow-xl shadow-[#9B2242]/10 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`absolute inset-x-6 -top-16 h-32 rounded-full bg-gradient-to-br ${accent} opacity-38 blur-3xl transition-opacity duration-300 group-hover:opacity-58`} />
                  <div className="relative flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-white/85 via-[#fde8f2]/80 to-white/60 shadow-lg shadow-[#b23a62]/12 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-[#9B2242]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#681c34]">{title}</h3>
                    <p className="text-sm leading-relaxed text-[#7a2c41]/80">{description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative overflow-hidden w-full py-20 md:py-28 lg:py-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#ffe9f3,_transparent_55%),_radial-gradient(circle_at_bottom_right,_#e6efff,_transparent_50%)]" />
          <div className="relative container space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#9B2242] shadow-sm shadow-white/70">
                {t("homepage.features.badge")}
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#4c1f35] sm:text-4xl">
                {t("homepage.features.title")}
              </h2>
              <p className="mx-auto max-w-3xl text-base md:text-lg leading-relaxed text-[#6a3952]/85">
                {t("homepage.features.subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative mx-auto flex w-full max-w-5xl flex-col rounded-[48px] border border-white/70 bg-white/90 shadow-[0_55px_120px_rgba(155,34,66,0.22)] backdrop-blur-xl lg:flex-row"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[48px] bg-gradient-to-br from-[#ffe0ef] via-[#ffd2dd] to-[#fce5f1] lg:w-[42%] lg:rounded-l-[48px] lg:rounded-tr-[0]">
                <Image
                  src={primaryStory.image}
                  alt={primaryStory.title}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.45em] text-white">
                    {primaryStory.badge}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl font-semibold leading-tight">
                    {primaryStory.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {primaryStory.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-8 px-8 py-10 text-left text-[#4c1f35] lg:px-12">
                <div className="space-y-4">
                  {featureCards.map(({ Icon, title, description }) => (
                    <div key={title} className="flex items-start gap-4 rounded-3xl bg-[#fdeaf1]/70 px-5 py-4 text-sm text-[#7d2f4d]">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#9B2242] to-[#f7a4c7] text-white shadow-lg shadow-[#9B2242]/25">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-[#4c1f35]">{title}</p>
                        <p className="text-[#684157]/85">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-[#9B2242] to-[#c24977] px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-[#9B2242]/30 transition-all duration-300 hover:shadow-[#9B2242]/40"
                    onClick={() => { setShowForm(true); analytics.ctaClick('story_register', 'home'); }}
                  >
                    {t("homepage.features.storyCta")}
                  </Button>
                  <p className="text-xs text-[#6a3952]/70 max-w-[260px]">
                    {t("homepage.features.storyFootnote")}
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {secondaryStories.map(({ badge, title, subtitle, image }) => (
                    <div key={title} className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm shadow-[#9B2242]/15 backdrop-blur-xl">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl">
                        <Image
                          src={image}
                          alt={title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="inline-block rounded-full bg-[#fdeaf1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9B2242]">
                          {badge}
                        </span>
                        <p className="text-sm font-semibold text-[#4c1f35]">{title}</p>
                        <p className="text-xs text-[#684157]/80">{subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative w-full bg-white py-20 md:py-28 lg:py-32">
          <div className="container grid items-center gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden justify-end lg:flex"
            >
              <div className="relative h-[420px] w-full max-w-xs overflow-hidden rounded-[32px] border border-[#f7c7d8]/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <Image
                  src={indoBrideImage}
                  alt="Indonesian bride smiling"
                  fill
                  loading="lazy"
                  className="rounded-[24px] object-cover"
                  sizes="(min-width: 1024px) 320px, 0px"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-first space-y-6 text-center lg:order-none lg:text-left"
            >
              <p className="mx-auto max-w-2xl text-muted-foreground md:text-xl/relaxed leading-relaxed lg:mx-0">
                {t("homepage.philosophy.description")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden justify-start lg:flex"
            >
              <div className="relative h-[420px] w-full max-w-xs overflow-hidden rounded-[32px] border border-[#dce6ff]/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                <Image
                  src={indoGroomImage}
                  alt="Indonesian groom smiling"
                  fill
                  loading="lazy"
                  className="rounded-[24px] object-cover"
                  sizes="(min-width: 1024px) 320px, 0px"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-last flex flex-col items-center gap-6 lg:hidden"
            >
              <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-[28px] border border-[#f7c7d8]/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <Image
                  src={indoBrideImage}
                  alt="Indonesian bride smiling"
                  fill
                  loading="lazy"
                  className="rounded-[20px] object-cover"
                  sizes="(max-width: 1023px) 384px, 0px"
                />
              </div>
              <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-[28px] border border-[#dce6ff]/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                <Image
                  src={indoGroomImage}
                  alt="Indonesian groom smiling"
                  fill
                  loading="lazy"
                  className="rounded-[20px] object-cover"
                  sizes="(max-width: 1023px) 384px, 0px"
                />
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative w-full overflow-hidden bg-[#f8f5f2] py-20 md:py-28 lg:py-32">
          <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-[#f5d8df]/55 blur-3xl" />
          <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-[#dce7fc]/65 blur-3xl" />
          <div className="container relative px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="mx-auto max-w-3xl text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f8e6ec] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9B2242]">
                <Sparkles className="h-4 w-4" />
                {t("homepage.meetings.badge")}
              </div>
              <h2 className="mt-6 font-serif text-4xl font-bold tracking-[-0.055em] text-[#102b61] sm:text-5xl md:text-6xl">
                {t("homepage.meetings.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#52617c]">{t("homepage.meetings.description")}</p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {meetingScenarios.map(({ icon: Icon, title, description, feeling }) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="group relative flex min-h-[295px] flex-col overflow-hidden rounded-[1.6rem] border border-[#173d82]/10 bg-white p-6 shadow-[0_12px_28px_rgba(16,43,97,0.06)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(16,43,97,0.12)] sm:p-7"
                >
                  <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#f8e7ed] transition-transform duration-500 group-hover:scale-125" />
                  <div className="flex items-center">
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7edf0] text-[#9B2242]"><Icon className="h-5 w-5" /></div>
                  </div>
                  <h3 className="relative mt-7 text-xl font-semibold tracking-tight text-[#152f62]">{title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-[#66738b]">{description}</p>
                  <div className="relative mt-auto border-t border-[#173d82]/10 pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#9B2242]/70">{t("homepage.meetings.feelingLabel")}</p>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#304775]">{feeling}</p>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-8 grid overflow-hidden rounded-[1.9rem] bg-[#102b61] shadow-[0_24px_65px_rgba(16,43,97,0.22)] lg:grid-cols-[1.05fr_0.95fr]"
            >
              <div className="relative min-h-[360px] lg:min-h-[480px]">
                <Image src="/images/home/jodohmu-mission-guided-introduction.png" alt="A warm guided introduction with family support" fill className="object-cover" sizes="(max-width: 1023px) 100vw, 52vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102b61]/78 via-[#102b61]/5 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-[#102b61]/75 p-5 text-white backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[320px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f7bfd0]">{t("homepage.meetings.about.label")}</p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight tracking-[-0.03em]">{t("homepage.meetings.about.title")}</p>
                </div>
              </div>
              <div className="relative flex flex-col justify-center overflow-hidden px-7 py-10 text-white sm:px-12 lg:px-14">
                <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-[#9B2242]/55 blur-3xl" />
                <div className="relative">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f7bfd0]">{t("homepage.meetings.mission.label")}</p>
                  <h3 className="mt-5 max-w-lg font-serif text-3xl font-bold leading-[1.06] tracking-[-0.045em] sm:text-4xl">{t("homepage.meetings.mission.title")}</h3>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-white/72">{t("homepage.meetings.mission.description")}</p>
                  <div className="mt-7 space-y-3">
                    {meetingPromises.map((promise) => (
                      <div key={promise} className="flex items-start gap-3 text-sm leading-relaxed text-white/88"><CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#f7bfd0]" />{promise}</div>
                    ))}
                  </div>
                  <p className="mt-8 border-t border-white/15 pt-5 text-sm font-medium leading-relaxed text-[#f7bfd0]">{t("homepage.meetings.mission.closing")}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative w-full overflow-hidden bg-[#fffaf7] py-20 md:py-28 lg:py-32">
          <div className="absolute -right-28 top-12 h-96 w-96 rounded-full bg-[#f8dfe6]/70 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#e1ebff]/75 blur-3xl" />
          <div className="container relative grid gap-12 px-4 md:px-6 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f8e7ed] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.23em] text-[#9B2242]">
                <Heart className="h-4 w-4" /> {t("homepage.about.title")}
              </span>
              <h2 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-[1.04] tracking-[-0.055em] text-[#102b61] sm:text-5xl md:text-6xl">
                {t("homepage.about.heading")}
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#52617c]">{t("homepage.about.description")}</p>
              <div className="mt-9 grid max-w-xl gap-4 sm:grid-cols-3">
                {['personal', 'thoughtful', 'present'].map((pillar) => (
                  <div key={pillar} className="border-l-2 border-[#9B2242]/45 pl-3">
                    <p className="text-sm font-bold tracking-tight text-[#203a70]">{t(`homepage.about.pillars.${pillar}.title`)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#6a7690]">{t(`homepage.about.pillars.${pillar}.description`)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="relative mx-auto h-[440px] w-full max-w-[490px] sm:h-[500px]"
            >
              <div className="absolute inset-x-7 top-4 bottom-4 rounded-[2rem] bg-[#102b61]" />
              <div className="absolute left-0 top-0 h-[82%] w-[78%] overflow-hidden rounded-[2rem] border-4 border-[#fffaf7] shadow-[0_20px_44px_rgba(16,43,97,0.2)]">
                <Image src="/images/home/jodohmu-about-guidance.png" alt="Two Jodohmu guides having a thoughtful conversation" fill className="object-cover" sizes="(max-width: 1023px) 78vw, 380px" />
              </div>
              <div className="absolute bottom-0 right-0 h-[44%] w-[48%] rounded-[2rem] border-4 border-[#fffaf7] bg-[#9B2242] shadow-[0_20px_44px_rgba(16,43,97,0.2)]">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/20" />
                <div className="absolute bottom-7 left-7 right-7 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">Jodohmu</p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight">{t("homepage.about.title")}</p>
                </div>
              </div>
              <div className="absolute left-[10%] top-[61%] z-10 max-w-[260px] rounded-2xl bg-white px-5 py-4 shadow-[0_12px_30px_rgba(16,43,97,0.16)]">
                <p className="font-serif text-lg font-bold leading-tight tracking-[-0.025em] text-[#102b61]">{t("homepage.about.manifesto")}</p>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative w-full overflow-hidden bg-[#f5f8ff] py-20 md:py-28 lg:py-32">
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#dce7fc]/80 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#f8dfe6]/70 blur-3xl" />
          <div className="container relative grid gap-12 px-4 md:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-16">
            <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.23em] text-[#9B2242] shadow-sm"><MapPinned className="h-4 w-4" /> {t("homepage.locations.badge")}</span>
              <h2 className="mt-6 max-w-xl font-serif text-4xl font-bold leading-[1.04] tracking-[-0.055em] text-[#102b61] sm:text-5xl">{t("homepage.locations.title")}</h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#52617c]">{t("homepage.locations.description")}</p>
              <div className="mt-8 grid gap-3">
                {[
                  { phase: t("homepage.locations.phaseOneLabel"), description: t("homepage.locations.phaseOneDescription"), color: "text-[#9B2242]", background: "bg-[#9B2242]" },
                  { phase: t("homepage.locations.phaseTwoLabel"), description: t("homepage.locations.phaseTwoDescription"), color: "text-[#5271ad]", background: "bg-[#5271ad]" },
                  { phase: t("homepage.locations.phaseThreeLabel"), description: t("homepage.locations.phaseThreeDescription"), color: "text-[#7b4bb7]", background: "bg-[#7b4bb7]" },
                ].map(({ phase, description, color, background }) => (
                  <div key={phase} className="flex items-center gap-3 rounded-2xl border border-[#173d82]/10 bg-white/80 p-4 shadow-sm">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${background} text-white shadow-sm`}><MapPin className="h-4 w-4" fill="currentColor" /></span>
                    <div><p className={`font-semibold ${color}`}>{phase}</p><p className="mt-0.5 text-sm text-[#52617c]">{description}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.1 }} className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-[0_24px_60px_rgba(16,43,97,0.14)] backdrop-blur-xl sm:p-7">
              <OfficeLocationMap
                label={t("homepage.locations.mapLabel")}
                locations={officeLocations.map(({ name, phase, position }) => ({
                  name,
                  phase,
                  position,
                  status: phase === "soon" ? t("homepage.locations.comingSoon") : phase === "next" ? t("homepage.locations.nextPhase") : t("homepage.locations.phaseThree"),
                }))}
              />
              {false && <div className="relative aspect-[2/1] overflow-hidden rounded-[1.25rem] border border-[#173d82]/10 bg-[#dce7fc]">
                <iframe
                  title={t("homepage.locations.mapLabel")}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=94%2C-12%2C142%2C7&layer=mapnik"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0" aria-label={t("homepage.locations.mapLabel")}>
                  {officeLocations.map(({ name, mapX, mapY, phase }) => (
                    <div key={name} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: mapX, top: mapY }}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg ${phase === "soon" ? "bg-[#9B2242] text-white" : "bg-[#5271ad] text-white"}`}>
                        <MapPin className="h-4 w-4" fill="currentColor" />
                      </span>
                      <span className={`absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white ${phase === "soon" ? "bg-[#9B2242]" : "bg-[#5271ad]"}`} />
                    </div>
                  ))}
                </div>
              </div>}
              <p className="mt-3 text-center text-[11px] text-[#52617c]">© <a className="underline underline-offset-2 hover:text-[#102b61]" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors</p>
              {false && <svg viewBox="0 0 800 400" className="h-auto w-full" role="img" aria-label={t("homepage.locations.mapLabel")}>
                <defs><linearGradient id="islandFill" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#dce7fc" /><stop offset="1" stopColor="#f7dce6" /></linearGradient></defs>
                <path d="M454.7 362.9L447.6 363.3 425 348.6 440.9 344.4 449.8 350.9 455.8 357.3ZM518.1 360.8L503.5 365.5 501.4 362.9 503 355.8 510.3 342.9 527.1 334.6 528.9 338.7 529.2 345.1ZM406.8 317.8L412.9 323.4 423.5 321.7 427.7 330.6 408 334.9 396.2 337.7 387.1 337.5 392.9 325.4 402.2 325.2ZM492 317.8L489.5 329.5 463.9 335.4 441.3 332.9 441.2 325.2 454.7 320.8 465.4 327.1 476.7 325.5ZM248.9 290.1L281.5 292.2 285.3 283.5 316.8 293.6 323 307.2 348.6 311.1 369.5 323.6 350 331.6 331.3 323.1 315.9 323.7 298.2 322.2 282.3 318.4 262.6 310.3 250.1 308.2 243 310.9 212 302.2 209 293.2 193.5 291.6 205.1 271.5 225.8 272.7 239.5 281 246.6 282.6ZM693.2 278.2L684.4 292.5 682.8 276.7 685.8 269.1 689.4 262 693.2 268.2ZM565.9 220.2L559.6 227.2 547.8 223.3 544.5 214.3 561.7 213.2ZM620.8 212.5L627 228.6 612.6 219.9 598.4 218.2 588.8 219.6 577 218.8 581 207.2 602.1 206.4ZM683.3 171.6L688 205.7 705.7 218.3 719.9 195.9 739.4 183.2 754.5 183.2 769.1 190.6 781.7 198.1 800 202.1 800.3 270.7 800.6 339.3 785.4 322 768.1 317.8 763.9 323.8 742.4 324.5 749.6 307.3 760.3 301.5 755.9 278.6 747.7 260.9 714.7 243.1 700.7 241.3 675.1 221.9 670.1 232.1 663.6 234 659.7 226.2 659.6 217.1 646.6 206.7 665 199.2 677.1 199.6 675.7 194 650.8 193.9 644 181.4 628.8 177.5 621.6 167.1 644.6 162 653.3 155.1 680.6 163.8ZM531.8 117.5L518.1 138.4 505.3 142.4 488.9 138.3 460.5 139.3 445.7 142.4 443.2 158.3 458.5 177 467.7 167.5 499.4 160.3 498 170 490.6 167 483.2 179.3 468.2 187.5 484.3 214.4 481.2 221.7 496.5 246 496.4 259.8 487.3 266 480.6 258.6 488.8 241.4 472.1 249.5 467.9 243.7 470.1 235.5 457.8 223.2 459.1 202.7 447.8 209.1 449.2 233.6 449.9 263.8 439.1 266.8 431.8 260.6 436.7 241.3 434 220.9 426.9 220.8 421.6 206.4 428.6 192.6 431 175.9 439.6 144.1 443.2 135.4 457.6 119.8 470.9 126 492.4 128.9 512 128.1 528.8 112.8ZM590.4 123.5L589.5 141.9 580.8 139.9 578.2 152.7 585.2 163.8 580.4 166.3 573.6 153 568.5 126.1 571.9 109.2 577.6 101.6 578.8 113.1 588.8 114.9ZM406.4 108.9L425.5 128.4 405.3 130.9 399.6 145.2 400.4 164.3 384 178.7 383.6 199.7 377 231.8 374.5 224.4 355.1 233.8 348.4 221 336.3 219.8 327.8 213 307.5 220.6 301.3 210.4 290.2 211.6 276.2 209.1 273.5 180.9 265.1 175.1 256.9 157 254.5 138.6 256.5 119.1 266.6 105.1 269.5 119.2 281.1 131.1 292.1 126.8 302.9 128.3 312.9 117.7 321 115.8 337.1 121.7 351 117.2 359.7 88 366.3 80.6 372.2 56.7 391.7 56.7 406.5 60.3 396.8 79.3 409.3 99.2ZM201.2 270.6L182.3 271 168 253.4 146.1 236.2 138.8 223.5 125.9 206.3 117.5 190.5 104.5 161.1 89.6 143.5 84.6 125.4 78.3 109 63 95.7 54.1 77.7 41.3 65.9 23.5 42.7 22 32 33 32.9 59.3 36.9 74.4 57.5 87.5 71.8 96.9 80.5 113 103.2 130.3 103.5 144.7 117.9 154.5 135.6 167.5 145.2 160.6 162.4 170.4 169.7 176.5 170.2 179.4 184.9 185.3 196.6 197.8 198.5 206.1 211.8 201.8 238Z" fill="url(#islandFill)" fillRule="evenodd" stroke="#9bb2dc" strokeWidth="3" strokeLinejoin="round" />
                {officeLocations.map(({ name, x, y, phase }) => <g key={name} transform={`translate(${x} ${y})`}><circle r="13" fill={phase === "soon" ? "#9B2242" : "#5271ad"} opacity="0.15" /><circle r="7" fill={phase === "soon" ? "#9B2242" : "#5271ad"} stroke="white" strokeWidth="3" /></g>)}
              </svg>}
              <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#52617c]"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#9B2242]" />{t("homepage.locations.comingSoon")}</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#5271ad]" />{t("homepage.locations.nextPhase")}</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#7b4bb7]" />{t("homepage.locations.phaseThree")}</span></div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ── Hiring strip ── */}
        <div className="w-full border-y border-[#0b3a86]/10 bg-[#f5f8ff] py-3">
          <div className="container flex flex-wrap items-center justify-center gap-3 text-center sm:justify-between">
            <p className="text-sm font-semibold text-[#0b3a86]">
              🌙 We are hiring — 3 open positions
            </p>
            <Link
              href="/careers"
              className="shrink-0 rounded-full border border-[#0b3a86]/30 bg-white px-4 py-1.5 text-xs font-bold text-[#0b3a86] shadow-sm transition-colors hover:border-[#9B2242]/40 hover:text-[#9B2242]"
            >
              View Roles →
            </Link>
          </div>
        </div>

        <AnimatedSection className="relative w-full overflow-hidden bg-[#fff2f6] py-20 md:py-28 lg:py-32">
          <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-[#f6cedc] blur-3xl" />
          <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-[#f4d7e2] blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container relative px-4 md:px-6"
          >
            <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#9B2242] via-[#8a1f42] to-[#641631] px-6 py-10 text-white shadow-[0_24px_60px_rgba(125,26,61,0.24)] sm:px-10 sm:py-12 lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:px-16 lg:py-16">
              <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full border border-white/10" />
              <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#f7aac5]/35 blur-3xl" />
              <div className="relative flex flex-col justify-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#ffd3e0]">{t("homepage.cta.label")}</p>
                <h2 className="mt-5 max-w-lg font-serif text-4xl font-bold leading-[1.04] tracking-[-0.05em] sm:text-5xl">{t("homepage.cta.title")}</h2>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/72">{t("homepage.cta.description")}</p>
                <div className="mt-9 space-y-4 border-t border-white/15 pt-7">
                  {["private", "conversation", "pace"].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/84">
                      <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#ffd3e0]" />
                      {t(`homepage.cta.reassurance.${item}`)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative mt-10 rounded-[1.7rem] border border-white/20 bg-[#651631]/35 px-5 py-1 shadow-inner shadow-black/10 sm:px-8 lg:mt-0">
                <HomeContactForm />
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </main>

      {/* Google Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative w-full max-w-2xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-black/20 text-white hover:bg-black/40 transition"
              aria-label="Close"
            >
              ✕
            </button>
            <iframe
              src="https://forms.gle/zF2xZV9hFAW7aXcp9"
              className="w-full h-full border-0"
              title="Registration Form"
            />
          </div>
        </div>
      )}
    </div>
  );
}
