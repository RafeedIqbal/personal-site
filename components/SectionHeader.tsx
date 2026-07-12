"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface SectionHeaderProps {
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Terminal command shown after the `$` prompt. */
  command: string;
  /** Optional right-aligned annotation after the hairline rule. */
  right?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}

export default function SectionHeader({
  index,
  command,
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
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? { opacity: 1 } : inView ? { opacity: 1 } : {}}
        transition={reduce ? { duration: 0 } : { duration: 0.3, delay }}
        className="js-reveal mb-11 flex items-center gap-3.5"
      >
        <span className="text-xs text-accent">{index}</span>
        <h2 className="text-[13px] font-normal text-fg">
          <span className="text-subtle">$</span> {command}
        </h2>
        <div className="flex-1 border-t border-white/[0.07]" />
        {right}
      </motion.div>

      <motion.div
        className="js-reveal"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={reduce ? { opacity: 1, y: 0 } : inView ? { opacity: 1, y: 0 } : {}}
        transition={reduce ? { duration: 0 } : { duration: 0.4, delay: delay + 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
