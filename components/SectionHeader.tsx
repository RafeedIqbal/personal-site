"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface SectionHeaderProps {
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Terminal command shown after the `$` prompt. */
  command: string;
  /** Plain-language heading for assistive technology. */
  title: string;
  /** Optional right-aligned annotation after the hairline rule. */
  right?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}

export default function SectionHeader({
  index,
  command,
  title,
  right,
  delay = 0,
  children,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref}>
      <motion.div
        initial={false}
        animate={!reduce && inView ? { opacity: [0.65, 1] } : { opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, delay }}
        className="js-reveal mb-11 flex flex-wrap items-center gap-x-3.5 gap-y-3"
      >
        <span aria-hidden="true" className="text-xs text-accent">{index}</span>
        <h2 id={`section-${index}-title`} className="text-[13px] font-normal text-fg">
          <span className="sr-only">{title}</span>
          <span aria-hidden="true"><span className="text-subtle">$</span> {command}</span>
        </h2>
        <div aria-hidden="true" className="min-w-4 flex-1 border-t border-white/[0.07]" />
        {right}
      </motion.div>

      <motion.div
        className="js-reveal"
        initial={false}
        animate={!reduce && inView ? { opacity: [0.65, 1], y: [6, 0] } : { opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, delay: delay + 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
