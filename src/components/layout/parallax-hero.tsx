"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ParallaxHeroProps {
  children: ReactNode;
  imageUrl: string;
}

export function ParallaxHero({ children, imageUrl }: ParallaxHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section
      ref={ref}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center text-center text-white"
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center brightness-50"
        style={{ backgroundImage: `url(${imageUrl})`, y: backgroundY }}
      />
      <div className="relative z-10 container px-4 md:px-6">
        {children}
      </div>
    </section>
  );
}
