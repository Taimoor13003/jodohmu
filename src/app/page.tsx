import React from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/layout/animated-section";
import { HorizontalScrollSection } from "@/components/layout/horizontal-scroll-section";
import { ParallaxHero } from "@/components/layout/parallax-hero";
import { Heart, Users, Star, Phone, Handshake, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
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

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <div className="container text-center">
            <h2 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Why Choose Jodohmu?</h2>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl mt-4">We are more than an app. We are your dedicated partners in finding a meaningful, lasting marriage.</p>
          </div>
        </AnimatedSection>

        <HorizontalScrollSection>
          <div className="flex gap-8 p-8">
            <Card className="w-96 flex-shrink-0 p-6 flex flex-col items-center text-center shadow-xl">
              <div className="bg-primary rounded-full p-4 mb-4">
                <Heart className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">Personalized Matching</h3>
              <p className="text-muted-foreground">Our dedicated team gets to know you, your values, and your aspirations to find matches that truly resonate with your heart.</p>
            </Card>
            <Card className="w-96 flex-shrink-0 p-6 flex flex-col items-center text-center shadow-xl">
              <div className="bg-primary rounded-full p-4 mb-4">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">Serious Community</h3>
              <p className="text-muted-foreground">Join a private, vetted community of individuals who are genuinely ready for a meaningful, long-term commitment.</p>
            </Card>
            <Card className="w-96 flex-shrink-0 p-6 flex flex-col items-center text-center shadow-xl">
              <div className="bg-primary rounded-full p-4 mb-4">
                <Calendar className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">Guided Meetings</h3>
              <p className="text-muted-foreground">We facilitate meetings in a way that is comfortable, respectful, and true to your faith.</p>
            </Card>
            <Card className="w-96 flex-shrink-0 p-6 flex flex-col items-center text-center shadow-xl">
              <div className="bg-primary rounded-full p-4 mb-4">
                <Star className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">Halal & Supervised</h3>
              <p className="text-muted-foreground">All interactions are designed to be respectful, with options for supervised meetings.</p>
            </Card>
          </div>
        </HorizontalScrollSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">Our Philosophy</div>
              <h2 className="text-4xl font-bold font-serif tracking-tighter sm:text-5xl">More Than an App, We're Your Partners</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Finding a life partner is one of the most important journeys you'll ever take. At Jodohmu, we don't leave it to chance. Our matchmakers work with you like a dedicated team, providing guidance, support, and a human touch that algorithms can't replicate.
              </p>
            </div>
            <div className="relative">
              <Image
                alt="Our Philosophy"
                className="mx-auto rounded-xl sm:w-full shadow-2xl"
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop"
                width={550}
                height={550}
                sizes="(min-width: 1024px) 550px, 100vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              />
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-accent rounded-full z-20 pointer-events-none"></div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36 bg-secondary">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
            <div className="relative lg:order-last">
              <Image
                alt="Guided Meetings"
                className="mx-auto rounded-xl sm:w-full shadow-2xl"
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop"
                width={550}
                height={550}
                sizes="(min-width: 1024px) 550px, 100vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              />
              <div className="absolute -top-8 -left-8 w-48 h-48 bg-primary rounded-full z-20 pointer-events-none"></div>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">Safe & Respectful</div>
              <h2 className="text-4xl font-bold font-serif tracking-tighter sm:text-5xl">Meetings with Intention</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Your comfort and safety are our top priorities. We arrange meetings in a controlled, respectful environment—be it our office or a trusted public space—often with the presence of an imam or family members, ensuring every interaction is dignified and purposeful.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-36">
          <div className="container text-center">
            <h2 className="font-serif text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">From Our Community</h2>
            <div className="mx-auto grid max-w-4xl gap-8 py-12 lg:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-accent">
                    <AvatarImage src="https://i.pravatar.cc/200?u=aisha.omar@example.com" />
                    <AvatarFallback>AO</AvatarFallback>
                  </Avatar>
                  <p className="text-lg italic text-muted-foreground">"Jodohmu helped me find a partner who shares my values and life goals. The process was so respectful and personalized. We are now happily married!"</p>
                  <p className="font-semibold mt-4 text-xl">- Aisha & Omar</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-accent">
                    <AvatarImage src="https://i.pravatar.cc/200?u=fatima.ali@example.com" />
                    <AvatarFallback>FA</AvatarFallback>
                  </Avatar>
                  <p className="text-lg italic text-muted-foreground">"I was tired of endless swiping. Jodohmu's team took the time to understand me and introduced me to my husband. I couldn't be happier."</p>
                  <p className="font-semibold mt-4 text-xl">- Fatima & Ali</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="w-full py-20 md:py-28 lg:py-32 bg-primary text-primary-foreground">
          <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center md:px-6">
            <h2 className="text-4xl font-extrabold tracking-tight font-serif">Ready to Find 'The One'?</h2>
            <p className="max-w-[600px] text-lg">
              Your search for a meaningful, lasting partnership starts here. Let us be your guide on the beautiful journey to marriage.
            </p>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90 rounded-full px-8 py-6 text-lg font-semibold">
              <Link href="/register">Create Your Profile</Link>
            </Button>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
}
