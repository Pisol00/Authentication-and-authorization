import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

// Waits `delay` ms before showing anything. Most loads (a lazy page, /auth/me) finish
// faster than that, so the user never sees a spinner flash on refresh.
export function PageSpinner({ delay = 300 }: { delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      {visible && <Spinner className="size-5 text-muted-foreground" />}
    </div>
  );
}
