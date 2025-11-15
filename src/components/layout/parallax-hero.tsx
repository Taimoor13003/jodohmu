'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image, { type StaticImageData } from 'next/image';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

type ParallaxHeroProps = {
  imageUrls: (string | StaticImageData)[];
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  baseImageClassName?: string;
  imageQuality?: number;
};

const MotionImage = motion(Image);

export function ParallaxHero({
  imageUrls,
  children,
  className,
  overlayClassName,
  contentClassName,
  baseImageClassName,
  imageQuality,
}: ParallaxHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ['-10%', '20%']);
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
        {/* Base layer */}
        {imageUrls[0] ? (
          <MotionImage
            src={imageUrls[0]}
            alt=""
            fill
            priority
            className={baseImageClasses}
            style={{ y: y1 }}
            quality={imageQuality}
          />
        ) : null}
        {/* Layer 2 */}
        {imageUrls[1] ? (
          <MotionImage
            src={imageUrls[1]}
            alt=""
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
            alt=""
            width={400}
            height={500}
            className="absolute bottom-10 right-10 object-cover rounded-lg shadow-2xl opacity-90"
            style={{ y: y3 }}
            quality={imageQuality}
          />
        ) : null}
      </div>

      <div className={cn('absolute inset-0', overlayClasses)} />

      <div className={contentClasses}>{children}</div>
    </section>
  );
}
