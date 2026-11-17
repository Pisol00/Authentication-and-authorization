import type { FormEvent, ReactNode } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { LogoMark } from '@/components/LogoMark';
import { AnimatedPage, Collapse, useLastMessage } from '@/components/Motion';

interface Props {
  title: string;
  subtitle: string;
  submitLabel: string;
  submittingLabel: string;
  error: string;
  submitting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  footer: ReactNode;
  children: ReactNode; // the form fields
}

// Shared card layout for the login and register pages.
export default function AuthLayout(p: Props) {
  const shownError = useLastMessage(p.error);
  return (
    // Card centered on every screen size; less padding on phones.
    <AnimatedPage className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-6 sm:py-12">
      <Card className="w-full max-w-sm sm:[--card-spacing:--spacing(6)]">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center"><LogoMark /></div>
          <CardTitle className="text-xl">{p.title}</CardTitle>
          <CardDescription>{p.subtitle}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* noValidate: skip the browser's own tooltips; fields show zod errors instead */}
          <form onSubmit={p.onSubmit} noValidate>
            <FieldGroup>
              <Collapse show={!!p.error}>
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{shownError}</AlertDescription>
                </Alert>
              </Collapse>
              {p.children}
              <Button type="submit" className="w-full" disabled={p.submitting}>
                {p.submitting && <Spinner />}
                {p.submitting ? p.submittingLabel : p.submitLabel}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex-wrap justify-center border-t text-center text-sm text-muted-foreground">{p.footer}</CardFooter>
      </Card>
    </AnimatedPage>
  );
}
