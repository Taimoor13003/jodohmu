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
import { Heart, Users, Star, Calendar, Quote } from "lucide-react";
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
          <div className="flex flex-col items-center space-y-8 text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <h1 className="font-serif text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-white via-[#ffd7e2] to-white bg-clip-text text-transparent drop-shadow-2xl">
                {t("homepage.hero.title")}
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="max-w-[700px] text-gray-100 md:text-xl font-light leading-relaxed mt-6"
              >
                {t("homepage.hero.description")}
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-gradient-to-r from-[#9B2242] to-[#9B2242]/80 hover:from-[#9B2242]/90 hover:to-[#9B2242]/70 text-white rounded-full px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-[#9B2242]/25 transition-all duration-300 border border-white/20">
                <Link href="/register">{t("homepage.hero.cta")}</Link>
              </Button>
            </motion.div>
          </div>
        </ParallaxHero>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-[#9B2242] to-foreground bg-clip-text text-transparent">{t("homepage.whyChoose.title")}</h2>
              <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl mt-4 leading-relaxed">{t("homepage.whyChoose.description")}</p>
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

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36 bg-gradient-to-br from-secondary via-secondary/50 to-background">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative lg:order-last"
            >
              <div className="relative">
                <Image
                  alt="Guided Meetings"
                  className="mx-auto rounded-2xl sm:w-full shadow-2xl"
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=2070&auto=format&fit=crop"
                  width={550}
                  height={550}
                  sizes="(min-width: 1024px) 550px, 100vw"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b3a86]/20 via-transparent to-[#9B2242]/10 rounded-2xl pointer-events-none"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="absolute -top-8 -left-8 w-48 h-48 bg-gradient-to-br from-[#0b3a86]/20 to-[#9B2242]/20 rounded-full z-20 pointer-events-none blur-xl"
              ></motion.div>
            </motion.div>
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
                className="inline-block rounded-lg bg-gradient-to-r from-[#0b3a86]/10 to-[#9B2242]/10 px-4 py-2 text-sm font-semibold text-foreground border border-[#0b3a86]/20"
              >
                {t("homepage.meetings.badge")}
              </motion.div>
              <h2 className="text-4xl font-bold font-serif tracking-tighter sm:text-5xl bg-gradient-to-r from-foreground via-[#0b3a86] to-foreground bg-clip-text text-transparent">{t("homepage.meetings.title")}</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed leading-relaxed">
                {t("homepage.meetings.description")}
              </p>
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
