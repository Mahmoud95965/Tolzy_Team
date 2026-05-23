'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface WaveSVGProps {
  /** 
   * Fill color for the wave. 
   * Matches Tailwind fill class. Should match the background of the section directly below the wave.
   * e.g., 'fill-white dark:fill-slate-900' or an arbitrary hex like 'fill-[#0f172a]'
   */
  fillColor?: string;
  /** 
   * Background color behind the wave curve. 
   * Typically matches the background of the hero section above the wave (#090a0f).
   * Supports standard Tailwind bg classes.
   */
  backgroundColor?: string;
  /** 
   * Toggle the gentle waving animation.
   * Uses smooth GPU-accelerated SVG path morphing.
   */
  animate?: boolean;
  /** 
   * Extra classes for fine-tuned layout control.
   */
  className?: string;
  /**
   * Opacity of the background/secondary wave layer (adds depth)
   */
  secondaryWaveOpacity?: number;
}

export default function WaveSVG({
  fillColor = 'fill-white dark:fill-[#0b0f19]',
  backgroundColor = 'bg-[#090a0f]',
  animate = true,
  className = '',
  secondaryWaveOpacity = 0.4,
}: WaveSVGProps) {
  
  // High-fidelity smooth wave paths for continuous morphing
  // Front Wave Paths (1440x120 aspect ratio)
  const frontPathA = "M0,60 C240,110 480,20 720,60 C960,100 1200,30 1440,60 L1440,120 L0,120 Z";
  const frontPathB = "M0,75 C240,40 480,90 720,75 C960,60 1200,85 1440,75 L1440,120 L0,120 Z";

  // Secondary Background Wave Paths (translucent, offset for 3D depth)
  const backPathA = "M0,45 C320,10 640,95 960,45 C1280,5 1360,60 1440,45 L1440,120 L0,120 Z";
  const backPathB = "M0,35 C320,80 640,20 960,35 C1280,55 1360,15 1440,35 L1440,120 L0,120 Z";

  return (
    <div className={`relative w-full ${backgroundColor} overflow-hidden pointer-events-none select-none -mt-1 z-20 ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-[60px] md:h-[100px] block"
      >
        {/* Secondary Back Wave (Slightly transparent for beautiful layered depth) */}
        <motion.path
          d={backPathA}
          className={`${fillColor}`}
          style={{ opacity: secondaryWaveOpacity }}
          animate={
            animate
              ? {
                  d: [backPathA, backPathB, backPathA],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />

        {/* Primary Front Wave (Matches target content background color perfectly) */}
        <motion.path
          d={frontPathA}
          className={`${fillColor}`}
          animate={
            animate
              ? {
                  d: [frontPathA, frontPathB, frontPathA],
                }
              : {}
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  );
}
