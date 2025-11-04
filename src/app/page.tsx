'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/layout/animated-section";
import { ParallaxHero } from "@/components/layout/parallax-hero";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, Users, Star, Calendar, Quote, ShieldCheck, Handshake, Sparkles, HeartHandshake, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import heroSectionImage from "@/assets/jodoh-mu-hero-section.png";
import indoBrideImage from "@/assets/indo-bride.png";
import indoGroomImage from "@/assets/indo-groom.png";

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
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1080&auto=format&fit=crop",
      position: "lg:-rotate-6 lg:-translate-y-10 lg:-translate-x-16 z-30",
    },
    {
      badge: t("homepage.features.stories.trusted.badge"),
      title: t("homepage.features.stories.trusted.title"),
      subtitle: t("homepage.features.stories.trusted.subtitle"),
      gradient: "from-[#fff2d9] to-[#ffe7b3]",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1080&auto=format&fit=crop",
      position: "lg:rotate-3 lg:translate-y-4 lg:-translate-x-2 z-20",
    },
    {
      badge: t("homepage.features.stories.celebrated.badge"),
      title: t("homepage.features.stories.celebrated.title"),
      subtitle: t("homepage.features.stories.celebrated.subtitle"),
      gradient: "from-[#e7f0ff] to-[#d3e2ff]",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1080&auto=format&fit=crop",
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
        <ParallaxHero imageUrls={[
          'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop',
        ]}>
          <div className="flex flex-col items-center space-y-6 text-white">
            <h1 className="font-serif text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              A Love That Lasts a Lifetime
            </h1>
            <p className="max-w-[700px] text-gray-200 md:text-xl font-light">
              Jodohmu is where serious commitment meets modern matchmaking. We provide a heartfelt, premium service to help you find your soulmate in a way that honors your faith and values.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold">
              <Link href="/register">Begin Your Journey</Link>
            </Button>
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
                  priority
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
                  priority
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
    </div>
  );
}
