"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode, Children } from 'react';

interface HorizontalScrollSectionProps {
  children: ReactNode;
}

export function HorizontalScrollSection({ children }: HorizontalScrollSectionProps) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={targetRef} className="relative h-[180vh] overflow-hidden bg-secondary">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Subtle background image for guaranteed visual change */}
        <div
          className="absolute inset-0 opacity-25 bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        {/* Color blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[-4rem] h-80 w-80 rounded-full bg-primary/40 blur-3xl" />

        {/* Soft grid pattern */}
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.08) 2px, transparent 3px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Animated sheen */}
        <motion.div
          aria-hidden
          className="absolute -inset-[20%] rounded-[9999px] bg-[conic-gradient(from_0deg,theme(colors.accent/10),transparent_30%,transparent_70%,theme(colors.primary/10))]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
          style={{ filter: 'blur(50px)' }}
        />

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-secondary" />
      </div>

      <div className="sticky top-0 z-10 flex h-screen items-center">
                {/* Mobile: simple horizontal scroller */}
        <div className="no-scrollbar relative mx-auto flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-4 w-full md:hidden">
          {Children.map(children, (child, idx) => (
            <div key={idx} className="snap-center shrink-0 w-[85vw] max-w-[24rem]">
              {child}
            </div>
          ))}
        </div>

        {/* Desktop: parallax-linked track */}
        <motion.div style={{ x }} className="hidden md:flex gap-8 px-6 w-full">
          {Children.map(children, (child, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.96 },
                show: (i: number) => ({
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 140, damping: 18, delay: i * 0.08 },
                }),
              }}
              whileHover={{ y: -8, rotate: 0.5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="will-change-transform"
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
