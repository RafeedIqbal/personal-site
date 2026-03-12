"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CommandBlockProps {
  command: string;
  children: React.ReactNode;
  delay?: number;
}

export default function CommandBlock({
  command,
  children,
  delay = 0,
}: CommandBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay }}
        className="flex items-center gap-2 text-sm"
      >
        <span className="text-[#888888] font-bold">rafeed@portfolio</span>
        <span className="text-[#555555]">:~$</span>
        <span className="text-white">{command}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: delay + 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
