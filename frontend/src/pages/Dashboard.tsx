import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/RoleBadge';
import { UserAvatar } from '@/components/UserAvatar';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Dashboard() {
  // `user` was already loaded by AuthContext (/auth/me on page load) — no extra request here.
  const { user } = useAuth();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <h1 className="text-xl font-semibold tracking-tight break-words sm:text-2xl">Hi, {user.name.split(' ')[0]}</h1>
      <p className="mt-1 text-muted-foreground">Here&apos;s your account at a glance.</p>

      <Card className="mt-6 max-w-xl sm:mt-8 sm:[--card-spacing:--spacing(6)]">
        <CardHeader>
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={user.name} size="lg" />
            <div className="min-w-0">
              <CardTitle className="truncate">{user.name}</CardTitle>
              <CardDescription className="truncate">{user.email}</CardDescription>
            </div>
          </div>
          <CardAction><RoleBadge role={user.role} /></CardAction>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          {/* Phones: label above value. Larger screens: label left, value right. */}
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-muted-foreground">Member since</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="shrink-0 text-muted-foreground">User ID</dt>
              {/* Full UUID wraps on phones instead of being cut off with "…". */}
              <dd className="min-w-0 font-mono text-xs break-all text-muted-foreground sm:truncate">{user.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
