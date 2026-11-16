import { Badge } from '@/components/ui/badge';
import type { Role } from '@/types';

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="capitalize">
      {role}
    </Badge>
  );
}
