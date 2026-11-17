import type { ReactNode } from 'react';
import { CalendarDaysIcon, ShieldCheckIcon, UserIcon, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AnimatedPage } from '@/components/Motion';
import { UserAvatar } from '@/components/UserAvatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  // `user` was already loaded by AuthContext (/auth/me on page load) — no extra request here.
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <AnimatedPage className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-xl font-semibold tracking-tight break-words sm:text-2xl">Hi, {user.name.split(' ')[0]}</h1>
      <p className="mt-1 text-muted-foreground">Here&apos;s your account at a glance.</p>

      <Card className="mt-6 max-w-2xl gap-0 overflow-hidden pt-0 sm:mt-8 sm:[--card-spacing:--spacing(6)]">
        {/* Cover band; the avatar overlaps its bottom edge. */}
        <div className="h-24 bg-linear-to-br from-muted via-muted/70 to-accent" aria-hidden="true" />

        <CardContent>
          <UserAvatar
            name={user.name}
            className="-mt-8 size-16 ring-4 ring-card"
            fallbackClassName="text-xl"
          />
          <div className="mt-3 min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-tight">{user.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>

          <Separator className="my-5" />

          {/* One column on phones, two side by side on larger screens. */}
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={isAdmin ? ShieldCheckIcon : UserIcon} label="Role">
              {isAdmin ? 'Administrator' : 'Member'}
            </InfoItem>
            <InfoItem icon={CalendarDaysIcon} label="Member since">
              {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </InfoItem>
          </dl>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}

// Icon tile + label + value.
function InfoItem({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{children}</dd>
      </div>
    </div>
  );
}
