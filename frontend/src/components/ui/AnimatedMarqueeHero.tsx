"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  /** Optional CTA — omitted on the live site for a cleaner hero */
  ctaText?: string;
  images: string[];
  className?: string;
}

const ActionButton = ({ children }: { children: React.ReactNode }) => (
  <motion.button
    type="button"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-8 px-8 py-3 rounded-full bg-blue-wardrobe-light text-white font-semibold shadow-lg transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white/50"
  >
    {children}
  </motion.button>
);

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  className,
}) => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  const list = images.length > 0 ? images : [""];
  const duplicatedImages = [...list, ...list].filter((src) => src);

  return (
    <section
      className={cn(
        "relative w-full min-h-[100dvh] overflow-hidden bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark",
        "flex flex-col items-center text-center px-4",
        /* Mobile: content starts below the nav — avoid vertical centering that pushes copy toward the bottom */
        "pt-20 pb-8 sm:pt-24 sm:pb-10",
        "md:min-h-screen md:justify-center md:pt-0 md:pb-10",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center w-full max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-3 sm:mb-4 inline-block rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-blue-50 backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white font-serif leading-[1.1]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.35 }}
          className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg text-blue-50/95 px-1"
        >
          {description}
        </motion.p>

        {ctaText ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE_IN_ANIMATION_VARIANTS}
            transition={{ delay: 0.5 }}
          >
            <ActionButton>{ctaText}</ActionButton>
          </motion.div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-[32%] sm:h-[34%] md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_88%,transparent)]">
        <motion.div
          className="flex gap-3 sm:gap-4 pl-2"
          animate={{
            x: ["-50%", "0%"],
            transition: {
              ease: "linear",
              duration: Math.max(28, duplicatedImages.length * 5),
              repeat: Infinity,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-[3/4] h-40 sm:h-48 md:h-64 flex-shrink-0"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 5}deg`,
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover object-top rounded-2xl shadow-lg"
                />
              ) : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
