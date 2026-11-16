import { useEffect, useState } from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { usersApi } from '@/api/auth';
import { getErrorMessage } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Role, User } from '@/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

export default function Admin() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.list().then(setUsers).catch((e) => setError(getErrorMessage(e)));
  }, []);

  const changeRole = async (id: string, role: Role) => {
    setError('');
    try {
      const updated = await usersApi.updateRole(id, role);
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Users</h1>
          <p className="mt-1 text-muted-foreground">Manage who has admin access.</p>
        </div>
        <span className="text-sm text-muted-foreground">{users.length} total</span>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mt-6 py-0 sm:mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">User</TableHead>
              {/* Hidden on phones; the date moves under the email instead. */}
              <TableHead className="hidden px-4 sm:table-cell">Joined</TableHead>
              <TableHead className="px-4 text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} />
                    {/* A max width lets `truncate` work inside a table cell, so a long email
                        can't push the table wider than a phone screen. */}
                    <div className="min-w-0 max-w-[45vw] sm:max-w-xs">
                      <p className="truncate font-medium">
                        {u.name} {u.id === me?.id && <span className="font-normal text-muted-foreground">(you)</span>}
                      </p>
                      <p className="truncate text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">Joined {formatDate(u.createdAt)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <Select
                    value={u.role}
                    onValueChange={(role) => changeRole(u.id, role as Role)}
                    disabled={u.id === me?.id}
                  >
                    <SelectTrigger className="ml-auto w-28" aria-label={`Role for ${u.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {ROLE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
