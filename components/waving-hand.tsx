"use client";

import { motion } from "motion/react";

export function WavingHand() {
  return (
    <motion.span
      className="inline-block origin-[70%_70%]"
      initial={{ rotate: 0 }}
      whileInView={{
        rotate: [0, 14, -8, 14, -4, 10, 0],
      }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.3,
      }}
    >
      👋
    </motion.span>
  );
}
