import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedPage } from '@/components/Motion';

export default function Forbidden() {
  return (
    <AnimatedPage className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-6 text-center sm:py-12">
      <p className="font-mono text-sm text-muted-foreground">403</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Access denied</h1>
      <p className="mt-1.5 text-muted-foreground">You don&apos;t have permission to view this page.</p>
      <Button variant="outline" className="mt-6" asChild>
        <Link to="/dashboard"><ArrowLeftIcon /> Back to dashboard</Link>
      </Button>
    </AnimatedPage>
  );
}
