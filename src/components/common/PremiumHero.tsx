'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface PremiumHeroProps {
  /** The main prominent title. Supports both strings and React Nodes. */
  title: React.ReactNode;
  /** Secondary subtitle supporting markdown or paragraphs. */
  subtitle: React.ReactNode;
  /** Optional top banner/badge text (e.g. "ميزة جديدة", "تولزي كوبايلوت") */
  badgeText?: string;
  /** Optional Lucide icon to display inside the badge */
  badgeIcon?: LucideIcon;
  /** Gradient back-glow color theme */
  glowColor?: 'blue' | 'violet' | 'emerald';
  /** Custom slot for content like search bars, inputs or CTAs */
  children?: React.ReactNode;
  /** Extra wrapping classes */
  className?: string;
}

export default function PremiumHero({
  title,
  subtitle,
  badgeText,
  badgeIcon: BadgeIcon,
  glowColor = 'blue',
  children,
  className = '',
}: PremiumHeroProps) {
  
  // Define glow colors mapping to fit the Deep Slate (#090a0f) theme perfectly
  const glowStyles = {
    blue: {
      primaryGlow: 'bg-blue-500/20 dark:bg-blue-600/25',
      secondaryGlow: 'bg-cyan-500/15 dark:bg-indigo-500/20',
      badgeBorder: 'border-blue-500/30 dark:border-blue-400/25',
      badgeText: 'text-blue-600 dark:text-blue-300',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/5',
      titleGradient: 'from-blue-400 via-indigo-200 to-cyan-300',
    },
    violet: {
      primaryGlow: 'bg-purple-600/20 dark:bg-violet-600/25',
      secondaryGlow: 'bg-fuchsia-500/15 dark:bg-pink-500/20',
      badgeBorder: 'border-purple-500/30 dark:border-violet-400/25',
      badgeText: 'text-purple-600 dark:text-violet-300',
      badgeBg: 'bg-purple-500/10 dark:bg-violet-500/5',
      titleGradient: 'from-violet-400 via-pink-200 to-fuchsia-300',
    },
    emerald: {
      primaryGlow: 'bg-emerald-500/15 dark:bg-emerald-600/20',
      secondaryGlow: 'bg-teal-500/15 dark:bg-cyan-500/15',
      badgeBorder: 'border-emerald-500/30 dark:border-emerald-400/25',
      badgeText: 'text-emerald-600 dark:text-emerald-300',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
      titleGradient: 'from-emerald-400 via-teal-200 to-cyan-300',
    },
  };

  const selectedGlow = glowStyles[glowColor];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section
      className={`relative min-h-[550px] md:min-h-[650px] w-full flex flex-col justify-center items-center overflow-hidden bg-[#090a0f] text-white px-4 pt-32 pb-16 font-sans dir-rtl ${className}`}
    >
      {/* Dynamic Animated Radial Glows */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Main central-top radial glow */}
        <motion.div
          className={`absolute top-[-10%] left-[10%] md:left-[25%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full blur-[100px] md:blur-[150px] ${selectedGlow.primaryGlow}`}
          animate={{
            scale: [1, 1.15, 0.95, 1],
            x: [0, 20, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />

        {/* Secondary supportive glow */}
        <motion.div
          className={`absolute bottom-[10%] right-[5%] md:right-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[80px] md:blur-[130px] ${selectedGlow.secondaryGlow}`}
          animate={{
            scale: [1, 0.9, 1.1, 1],
            x: [0, -25, 25, 0],
            y: [0, 20, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Subtle grid background overlay to add depth */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Content Area */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Premium Pill Badge */}
        {badgeText && (
          <motion.div
            variants={itemVariants}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${selectedGlow.badgeBorder} ${selectedGlow.badgeBg} backdrop-blur-md mb-6`}
          >
            {BadgeIcon && <BadgeIcon className={`w-4 h-4 ${selectedGlow.badgeText}`} />}
            <span className={`text-xs md:text-sm font-semibold tracking-wide ${selectedGlow.badgeText}`}>
              {badgeText}
            </span>
          </motion.div>
        )}

        {/* Main Dynamic Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-normal mb-6"
        >
          {typeof title === 'string' ? (
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedGlow.titleGradient}`}>
              {title}
            </span>
          ) : (
            title
          )}
        </motion.h1>

        {/* Subtitle with Ultra-thin Glassmorphic Styling or standard premium typography */}
        <motion.p
          variants={itemVariants}
          className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed mb-10 text-center"
        >
          {subtitle}
        </motion.p>

        {/* Optional Custom Content Slot (e.g., Search bar, filter toggles, stats) */}
        {children && (
          <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl px-4 md:px-0"
          >
            <div className="relative p-1 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl shadow-black/50">
              {children}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
