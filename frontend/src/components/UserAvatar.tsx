import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string; // e.g. a custom size like "size-16"
  fallbackClassName?: string; // e.g. a larger initial like "text-xl"
}

// Initial-letter avatar (we don't store profile pictures).
export function UserAvatar({ name, size = 'default', className, fallbackClassName }: Props) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn('font-medium', fallbackClassName)}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </AvatarFallback>
    </Avatar>
  );
}
