'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/layout/animated-section";
import { ParallaxHero } from "@/components/layout/parallax-hero";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, Users, Star, Calendar, Quote, ShieldCheck, Handshake, Sparkles, HeartHandshake, MessageCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import heroSectionImage from "@/assets/jodoh-mu-hero-section.png";
import indoBrideImage from "@/assets/indo-bride.png";
import indoGroomImage from "@/assets/indo-groom.png";
import sundaneseGroomImage from "@/assets/sundanese-groom.png";
import sundaneseBrideImage from "@/assets/sundanese-bride.png";
import indoGroomImage2 from "@/assets/indo-groom2.png";

export default function Home() {
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

  const meetingPhases = [
    {
      icon: ShieldCheck,
      title: t("homepage.meetings.steps.intake.title"),
      description: t("homepage.meetings.steps.intake.description"),
      accent: "from-[#9B2242]/80 to-[#c1486c]/90"
    },
    {
      icon: HeartHandshake,
      title: t("homepage.meetings.steps.curated.title"),
      description: t("homepage.meetings.steps.curated.description"),
      accent: "from-[#0b3a86]/85 to-[#4364c7]/95"
    },
    {
      icon: MessageCircle,
      title: t("homepage.meetings.steps.checkins.title"),
      description: t("homepage.meetings.steps.checkins.description"),
      accent: "from-[#f7a4c7]/90 to-[#f4c2d8]/95"
    }
  ];

  const meetingPromises = [
    t("homepage.meetings.promises.safe"),
    t("homepage.meetings.promises.transparent"),
    t("homepage.meetings.promises.family")
  ];

  const whatsappHref = `https://wa.me/6281122210303?text=${encodeURIComponent(
    t("homepage.whatsappCta.prefill")
  )}`;
  const whatsappButtonLabel = t("homepage.whatsappCta.button");

  const testimonials = [
    {
      quote: t("homepage.testimonials.stories.aishaOmar.quote"),
      name: t("homepage.testimonials.stories.aishaOmar.name"),
      accentColor: "#9B2242",
      avatar: "https://i.pravatar.cc/200?u=aisha.omar@example.com",
      fallback: "AO",
      delay: 0,
    },
    {
      quote: t("homepage.testimonials.stories.fatimaAli.quote"),
      name: t("homepage.testimonials.stories.fatimaAli.name"),
      accentColor: "#0b3a86",
      avatar: "https://i.pravatar.cc/200?u=fatima.ali@example.com",
      fallback: "FA",
      delay: 0.1,
    },
  ];

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
                    asChild
                    size="lg"
                    className="rounded-full bg-white px-10 py-6 text-lg font-semibold text-[#9B2242] shadow-[0_14px_28px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/90"
                  >
                    <Link href="/register">{t("homepage.hero.cta")}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/70 bg-white/10 px-10 py-6 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
                  >
                    <Link href="/contact">{t("homepage.hero.secondaryCta")}</Link>
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
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white">
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
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.45em] text-white">
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
                    asChild
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-[#9B2242] to-[#c24977] px-8 py-6 text-sm font-semibold text-white shadow-lg shadow-[#9B2242]/30 transition-all duration-300 hover:shadow-[#9B2242]/40"
                  >
                    <Link href="/register">{t("homepage.features.storyCta")}</Link>
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
                  className="rounded-[24px] object-cover"
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
              <span className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9B2242]/20 bg-gradient-to-r from-[#9B2242]/10 to-[#0b3a86]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242]">
                {t("homepage.philosophy.badge")}
              </span>
              <h2 className="text-4xl font-serif font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-foreground via-[#9B2242] to-foreground bg-clip-text text-transparent">
                {t("homepage.philosophy.heading")}
              </h2>
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
                  className="rounded-[24px] object-cover"
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
                  className="rounded-[20px] object-cover"
                />
              </div>
              <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-[28px] border border-[#dce6ff]/40 bg-white/70 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                <Image
                  src={indoGroomImage}
                  alt="Indonesian groom smiling"
                  fill
                  className="rounded-[20px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="relative overflow-hidden w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-[#dfe9ff] via-[#f3f7ff] to-[#e4f0ff]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 right-16 h-60 w-60 rounded-full bg-[#c0d5ff]/60 blur-[160px]" />
            <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-[#a9caff]/55 blur-[150px]" />
            <div className="absolute top-1/3 right-1/3 h-36 w-36 rounded-full bg-white/58 blur-3xl" />
          </div>
          <div className="container relative z-10 grid items-center gap-16 px-4 md:px-6 lg:grid-cols-[1.1fr_1fr]">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/82 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#264380] shadow-sm shadow-white/40"
              >
                {t("homepage.meetings.badge")}
              </motion.div>
              <h2 className="text-4xl font-bold font-serif tracking-tighter sm:text-5xl bg-gradient-to-r from-[#1f3f7f] via-[#4a6cf7] to-[#1f3f7f] bg-clip-text text-transparent">
                {t("homepage.meetings.title")}
              </h2>
              <p className="max-w-[620px] text-lg md:text-xl leading-relaxed text-[#1b2f52]/88">
                {t("homepage.meetings.description")}
              </p>
              <p className="max-w-[620px] text-base md:text-lg leading-relaxed text-[#1b2f52]/72">
                {t("homepage.meetings.secondary")}
              </p>

              <div className="grid gap-3">
                {meetingPromises.map((promise) => (
                  <div key={promise} className="flex items-start gap-3 rounded-2xl bg-white/82 p-4 shadow-sm shadow-[#27407a]/10 border border-white/70">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#3655c5]" />
                    <p className="text-sm md:text-base leading-relaxed text-[#1b2f52]/84">{promise}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex flex-col gap-6"
            >
              <div className="absolute -top-10 -right-6 h-32 w-32 rounded-full bg-[#4a6cf7]/18 blur-3xl" />
              {meetingPhases.map(({ icon: Icon, title, description, accent }, index) => (
                <div
                  key={title}
                  className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 backdrop-blur-xl shadow-xl shadow-[#0b3a86]/10"
                >
                  <div className={`absolute inset-x-6 -top-20 h-32 rounded-full bg-gradient-to-br ${accent} opacity-35 blur-3xl`} />
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/86 shadow-lg shadow-[#27407a]/12">
                      <Icon className="h-6 w-6 text-[#1f3f7f]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#2f4a8a]/78">{String(index + 1).padStart(2, '0')}</p>
                      <h3 className="mt-1 text-lg font-semibold text-[#12213f]">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#23365a]/82">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container text-center"
          >
            <h2 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-[#9B2242] to-foreground bg-clip-text text-transparent">{t("homepage.testimonials.title")}</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl mt-4 leading-relaxed">{t("homepage.testimonials.subtitle")}</p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-8 py-12 lg:grid-cols-2">
            {testimonials.map(({ quote, name, accentColor, avatar, fallback, delay }) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-[#9B2242]/5 hover:from-[#9B2242]/10 hover:via-card hover:to-[#0b3a86]/10 transition-all duration-300">
                  <CardContent className="p-8 flex flex-col items-center text-center relative">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="absolute top-4 left-4"
                      style={{ color: `${accentColor}33` }}
                    >
                      <Quote className="w-12 h-12" />
                    </motion.div>
                    <Avatar className="w-24 h-24 mb-4 border-4 shadow-lg" style={{ borderColor: `${accentColor}33` }}>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <p className="text-lg italic text-muted-foreground leading-relaxed relative z-10">{`"${quote}"`}</p>
                    <div className="flex items-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4" style={{ color: accentColor, fill: accentColor }} />
                      ))}
                    </div>
                    <p className="font-semibold mt-4 text-xl text-foreground">- {name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-[#9B2242] via-[#9B2242]/90 to-[#0b3a86] text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container flex flex-col items-center justify-center gap-6 px-4 text-center md:px-6 relative z-10"
          >
            <h2 className="text-4xl font-extrabold tracking-tight font-serif">{t("homepage.cta.title")}</h2>
            <p className="max-w-[600px] text-lg leading-relaxed text-white/90">
              {t("homepage.cta.description")}
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-white text-[#9B2242] hover:bg-white/90 rounded-full px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 border border-white/20">
                <Link href="/register">{t("homepage.cta.button")}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatedSection>
      </main>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappButtonLabel}
        className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_16px_36px_rgba(37,211,102,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#20c25c] hover:shadow-[0_20px_48px_rgba(37,211,102,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.16 5.335 5.495 0 12.05 0c3.181.002 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.439-9.892-9.892-9.892-5.452 0-9.887 4.434-9.889 9.889-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.986zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.794.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </span>
        <span className="text-sm font-semibold leading-tight">{whatsappButtonLabel}</span>
      </a>
    </div>
  );
}
