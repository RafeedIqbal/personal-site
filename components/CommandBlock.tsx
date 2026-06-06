"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface CommandBlockProps {
  command: string;
  children: React.ReactNode;
  delay?: number;
  /** Render the command-prompt line as a heading for document outline. */
  as?: "div" | "h2";
}

export default function CommandBlock({
  command,
  children,
  delay = 0,
  as = "div",
}: CommandBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  const HeadingTag = as === "h2" ? motion.h2 : motion.div;

  return (
    <div ref={ref} className="space-y-4">
      <HeadingTag
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? { opacity: 1 } : inView ? { opacity: 1 } : {}}
        transition={reduce ? { duration: 0 } : { duration: 0.3, delay }}
        className="js-reveal flex items-center gap-2 text-sm"
      >
        <span className="text-[#888888] font-bold">rafeed@portfolio</span>
        <span className="text-[#555555]">:~$</span>
        <span className="text-white">{command}</span>
      </HeadingTag>

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
