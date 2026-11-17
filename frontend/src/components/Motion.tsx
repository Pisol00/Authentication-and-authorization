// Shared animations (motion, formerly Framer Motion). Kept short and subtle on purpose.
import { useState, type ReactNode } from 'react';
import { AnimatePresence, type HTMLMotionProps } from 'motion/react';
import * as m from 'motion/react-m'; // lightweight components; features come from <LazyMotion>

// Page content fades in and rises 8px. Used instead of <main> on every page.
export function AnimatedPage(props: HTMLMotionProps<'main'>) {
  return (
    <m.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...props}
    />
  );
}

// Returns the last non-empty value, so a message keeps its text while it animates out
// (otherwise it would be blank during the closing animation).
export function useLastMessage(message: string | undefined): string | undefined {
  const [last, setLast] = useState(message);
  if (message && message !== last) setLast(message); // React's "adjust state during render" pattern
  return message || last;
}

// Smoothly opens/closes its content (error messages, alerts) instead of making the layout jump.
export function Collapse({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}
