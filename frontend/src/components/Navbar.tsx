import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, LogOutIcon, UsersIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { LogoMark } from '@/components/LogoMark';
import { UserAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn('text-sm transition-colors', isActive ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground');

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-5 sm:gap-8">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <LogoMark />
            <span className="hidden sm:inline">AuthSystem</span>
          </div>
          {/* Only admins have more than one page, so only they need nav links. */}
          {user?.role === 'admin' && (
            <div className="hidden items-center gap-6 sm:flex">
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/admin" className={navClass}>Users</NavLink>
            </div>
          )}
        </div>

        {/* While /auth/me is pending we don't know who the user is yet — render nothing
            instead of "Log in / Sign up", which would flash for logged-in users. */}
        {loading ? null : user ? (
          <>
            {/* Larger screens: name, avatar and Log out in a row. */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <UserAvatar name={user.name} />
              <Separator orientation="vertical" className="mx-1 h-5!" />
              <Button variant="ghost" asChild>
                <Link to="/logout"><LogOutIcon /> Log out</Link>
              </Button>
            </div>

            {/* Phones: everything behind the avatar, so the bar never overflows. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full sm:hidden" aria-label="Open account menu">
                  <UserAvatar name={user.name} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard"><LayoutDashboardIcon /> Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><UsersIcon /> Users</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/logout"><LogOutIcon /> Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <NavLink to="/login">Log in</NavLink>
            </Button>
            <Button asChild>
              <Link to="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
