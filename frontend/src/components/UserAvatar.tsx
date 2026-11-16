import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Initial-letter avatar (we don't store profile pictures).
export function UserAvatar({ name, size = 'default' }: { name: string; size?: 'sm' | 'default' | 'lg' }) {
  return (
    <Avatar size={size}>
      <AvatarFallback className="font-medium">{name.trim().charAt(0).toUpperCase() || '?'}</AvatarFallback>
    </Avatar>
  );
}
