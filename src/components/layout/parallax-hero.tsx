'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ParallaxHeroProps = {
  imageUrls: (string | StaticImageData)[];
  imageAlts?: (string | undefined)[];
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  baseImageClassName?: string;
  imageQuality?: number;
  baseImageSizes?: string;
};

const MotionImage = motion.create(Image);

export function ParallaxHero({
  imageUrls,
  imageAlts,
  children,
  className,
  overlayClassName,
  contentClassName,
  baseImageClassName,
  imageQuality,
  baseImageSizes,
}: ParallaxHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const [hydrated, setHydrated] = useState(false);
  // Only run the scroll-linked parallax on larger, pointer-precise screens.
  // On phones, continuously transforming/scaling the large hero image fights
  // the browser's native scroll thread and stutters — so we render a static
  // image there for smooth scrolling. We also respect reduced-motion.
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setHydrated(true);
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsLargeScreen(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const enableParallax = hydrated && isLargeScreen && !prefersReducedMotion;

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const scale1 = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y2 = useTransform(scrollYProgress, [0, 1], ['5%', '-15%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['-20%', '5%']);
  const baseImageClasses = baseImageClassName ?? 'object-cover opacity-50';
  const overlayClasses = overlayClassName ?? 'bg-gradient-to-t from-black/60 via-transparent to-black/20';
  const contentClasses = cn(
    'relative z-10 flex h-full items-center justify-center text-center text-white',
    contentClassName,
  );

  return (
    <section
      ref={ref}
      className={cn('relative w-full h-screen overflow-hidden', className)}
    >
      <div className="absolute inset-0">
        {/* Base layer — Image renders instantly for LCP; motion.div wraps after hydration for parallax */}
        {imageUrls[0] ? (
          enableParallax ? (
            <motion.div className="absolute inset-0" style={{ y: y1, scale: scale1, willChange: 'transform' }}>
              <Image
                src={imageUrls[0]}
                alt={imageAlts?.[0] ?? "Jodohmu offline ta'aruf matchmaking hero"}
                fill
                priority
                fetchPriority="high"
                className={baseImageClasses}
                quality={imageQuality}
                sizes={baseImageSizes ?? "100vw"}
              />
            </motion.div>
          ) : (
            <Image
              src={imageUrls[0]}
              alt={imageAlts?.[0] ?? "Jodohmu offline ta'aruf matchmaking hero"}
              fill
              priority
              fetchPriority="high"
              className={baseImageClasses}
              quality={imageQuality}
              sizes={baseImageSizes ?? "100vw"}
            />
          )
        ) : null}
        {/* Layer 2 */}
        {imageUrls[1] ? (
          <MotionImage
            src={imageUrls[1]}
            alt={imageAlts?.[1] ?? "Couple illustration"}
            width={500}
            height={700}
            className="absolute top-1/4 left-10 object-cover rounded-lg shadow-2xl opacity-80"
            style={{ y: y2 }}
            quality={imageQuality}
          />
        ) : null}
        {/* Layer 3 */}
        {imageUrls[2] ? (
          <MotionImage
            src={imageUrls[2]}
            alt={imageAlts?.[2] ?? "Matching journey illustration"}
            width={400}
            height={500}
            className="absolute bottom-10 right-10 object-cover rounded-lg shadow-2xl opacity-90"
            style={{ y: y3 }}
            quality={imageQuality}
          />
        ) : null}
      </div>

      <div className={cn('absolute inset-0', overlayClasses)} />

      {enableParallax ? (
        <motion.div className={contentClasses} style={{ y: yText, opacity: opacityText, willChange: 'transform, opacity' }}>{children}</motion.div>
      ) : (
        <div className={contentClasses}>{children}</div>
      )}
    </section>
  );
}
