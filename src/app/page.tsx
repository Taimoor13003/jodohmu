'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/layout/animated-section";
import { HorizontalScrollSection } from "@/components/layout/horizontal-scroll-section";
import { ParallaxHero } from "@/components/layout/parallax-hero";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, Users, Star, Calendar, Quote, ShieldCheck, Handshake, Sparkles, HeartHandshake, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

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

  const heroHighlights = [
    t("homepage.hero.highlight.points.support"),
    t("homepage.hero.highlight.points.faith"),
    t("homepage.hero.highlight.points.confidential"),
  ];

  const heroStats = [
    {
      value: t("homepage.hero.stats.matches.value"),
      label: t("homepage.hero.stats.matches.label"),
    },
    {
      value: t("homepage.hero.stats.success.value"),
      label: t("homepage.hero.stats.success.label"),
    },
    {
      value: t("homepage.hero.stats.cities.value"),
      label: t("homepage.hero.stats.cities.label"),
    },
  ];

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

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <main className="flex-1">
        <ParallaxHero imageUrls={[
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop',
        ]}>
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#9B2242]/40 to-black/60" />
            <div className="container relative z-10 px-4 py-24 lg:py-32">
              <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="space-y-8 text-white"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/85"
                  >
                    {t("homepage.hero.badge")}
                  </motion.span>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                    className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-white via-[#ffd7e2] to-white bg-clip-text text-transparent drop-shadow-[0_35px_45px_rgba(0,0,0,0.45)]"
                  >
                    {t("homepage.hero.title")}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                    className="max-w-2xl text-base md:text-lg lg:text-xl leading-relaxed text-white/85"
                  >
                    {t("homepage.hero.description")}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                    className="flex flex-wrap gap-3"
                  >
                    {heroHighlights.map((point) => (
                      <span
                        key={point}
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/90 shadow-sm shadow-black/30"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#ffd7e2]" />
                        {point}
                      </span>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                    className="flex flex-wrap items-center gap-4"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-[#9B2242] to-[#b63b62] hover:from-[#9B2242]/90 hover:to-[#b63b62]/90 text-white rounded-full px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-[#9B2242]/35 transition-all duration-300 border border-white/30"
                    >
                      <Link href="/register">{t("homepage.hero.cta")}</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-white/40 bg-white/10 px-8 py-6 text-base font-medium text-white/90 backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:text-white"
                    >
                      <Link href="/contact" className="inline-flex items-center gap-2">
                        {t("homepage.hero.secondaryCta")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  className="relative"
                >
                  <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-[#ffd7e2]/40 blur-3xl" />
                  <div className="relative rounded-[32px] border border-white/25 bg-white/12 p-8 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.45)] text-white space-y-8">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">
                        {t("homepage.hero.statsTitle")}
                      </p>
                      <p className="text-lg leading-relaxed text-white/85">
                        {t("homepage.hero.statsSubtitle")}
                      </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-3">
                      {heroStats.map(({ value, label }) => (
                        <div key={label} className="space-y-1.5">
                          <p className="text-3xl font-semibold tracking-tight text-white">
                            {value}
                          </p>
                          <p className="text-sm text-white/70">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
                      <Heart className="h-5 w-5 text-[#ffd7e2]" />
                      <span>{t("homepage.hero.statsFooter")}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
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

        <div className="w-full py-20 md:py-28 lg:py-36">
          <HorizontalScrollSection>
            {featureCards.map(({ Icon, title, description, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="w-[85vw] max-w-[24rem] sm:w-96 flex-shrink-0 p-6 flex flex-col items-center text-center shadow-2xl border-0 bg-gradient-to-br from-card via-card to-[#9B2242]/5 hover:from-[#9B2242]/10 hover:via-card hover:to-[#0b3a86]/10 transition-all duration-300">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] rounded-full p-4 mb-4 shadow-lg"
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold font-serif mb-2 text-foreground">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </Card>
              </motion.div>
            ))}
          </HorizontalScrollSection>
        </div>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block rounded-lg bg-gradient-to-r from-[#9B2242]/10 to-[#0b3a86]/10 px-4 py-2 text-sm font-semibold text-foreground border border-[#9B2242]/20"
              >
                {t("homepage.philosophy.badge")}
              </motion.div>
              <h2 className="text-4xl font-bold font-serif tracking-tighter sm:text-5xl bg-gradient-to-r from-foreground via-[#9B2242] to-foreground bg-clip-text text-transparent">{t("homepage.philosophy.heading")}</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed leading-relaxed">
                {t("homepage.philosophy.description")}
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <Image
                  alt="Our Philosophy"
                  className="mx-auto rounded-2xl sm:w-full shadow-2xl"
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2070&auto=format&fit=crop"
                  width={550}
                  height={550}
                  sizes="(min-width: 1024px) 550px, 100vw"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#9B2242]/20 via-transparent to-[#0b3a86]/10 rounded-2xl pointer-events-none"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-[#9B2242]/20 to-[#0b3a86]/20 rounded-full z-20 pointer-events-none blur-xl"
              ></motion.div>
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
