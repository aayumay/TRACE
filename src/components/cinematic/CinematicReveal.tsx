import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const MOTION_TAGS = {
  div: motion.div,
  header: motion.header,
  section: motion.section,
  article: motion.article,
  footer: motion.footer,
} as const;

type MotionTag = keyof typeof MOTION_TAGS;

/**
 * CinematicReveal — scroll-triggered entrance for inner pages.
 *
 * Uses the TRACE transition language (opacity + y + scale + blur + clip
 * reveal) instead of a plain fade. Deterministic: fires once when the
 * element enters the viewport, identical whether scrolling forward or back.
 *
 * Presentation-only wrapper. Children logic is never touched.
 */
export function CinematicReveal({
  children,
  className = '',
  delay = 0,
  y = 48,
  amount = 0.2,
  blur = '10px',
  as = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
  blur?: string;
  as?: MotionTag;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, amount });
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial={
        reduced
          ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : { opacity: 0, y, scale: 0.98, filter: `blur(${blur})` }
      }
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : reduced
            ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
            : { opacity: 0, y, scale: 0.98, filter: `blur(${blur})` }
      }
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}