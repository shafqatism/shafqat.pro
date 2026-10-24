"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Cycles through words with a blur/slide transition. */
export function FlipWords({ words, interval = 2600, className }: { words: readonly string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-block align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn("inline-block", className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
