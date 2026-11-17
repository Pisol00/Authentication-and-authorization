import { Link, NavLink } from 'react-router-dom';
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoMark } from '@/components/LogoMark';
import { UserAvatar } from '@/components/UserAvatar';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

// Pages in the top nav. Only admins see them (a regular user has just the dashboard).
const NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/admin', label: 'Users', icon: UsersIcon },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
      {/* 3 columns: logo | nav (centered) | account. The outer columns share the remaining
          space equally, so the middle stays centered whatever is on either side. */}
      <nav className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="hidden font-semibold tracking-tight sm:inline">AuthSystem</span>
        </div>

        {/* Nav links with an underline on the current page (icons only on phones).
            Full navbar height, so the underline sits on the navbar's bottom border like a tab. */}
        <div className="self-stretch">
          {isAdmin && (
            <div className="flex h-full items-stretch gap-2 sm:gap-6">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  aria-label={label}
                  className={({ isActive }) =>
                    cn(
                      'relative inline-flex items-center gap-2 px-2 text-sm font-medium transition-colors sm:px-1',
                      // underline: 2px bar drawn over the header's 1px bottom border
                      'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-colors',
                      isActive
                        ? 'text-foreground after:bg-foreground'
                        : 'text-muted-foreground after:bg-transparent hover:text-foreground',
                    )
                  }
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="col-start-3 flex items-center justify-end gap-2">
          {/* While /auth/me is pending we don't know who the user is yet — render nothing
              instead of "Log in / Sign up", which would flash for logged-in users. */}
          {loading ? null : user ? (
            <AccountMenu user={user} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <NavLink to="/login"><LogInIcon /> Log in</NavLink>
              </Button>
              <Button asChild>
                <Link to="/register"><UserPlusIcon /> Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

// Avatar button that opens the account menu (same on every screen size).
// The menu only holds account things; page links live in the top nav.
function AccountMenu({ user }: { user: User }) {
  const isAdmin = user.role === 'admin';
  const RoleIcon = isAdmin ? ShieldCheckIcon : UserIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Plain button, no hover background: the name and arrow just get darker. */}
        <button type="button" className="group flex h-10 items-center gap-2 rounded-full outline-none" aria-label="Open account menu">
          <UserAvatar name={user.name} />
          <span className="hidden max-w-40 truncate text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground group-data-[state=open]:text-foreground sm:inline">
            {user.name}
          </span>
          {/* Arrow flips while the menu is open. */}
          <ChevronDownIcon className="hidden size-4 text-muted-foreground transition-[color,transform] duration-200 group-hover:text-foreground group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-xl p-2 shadow-lg">
        {/* Who is logged in, on a soft panel */}
        <DropdownMenuLabel className="mb-1 rounded-lg bg-muted/60 p-3 font-normal">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RoleIcon className="size-3.5" />
            {isAdmin ? 'Administrator' : 'Member'}
          </p>
        </DropdownMenuLabel>

        {/* 44px tall on phones (touch target), 40px on larger screens. */}
        <DropdownMenuItem variant="destructive" asChild className="min-h-11 gap-3 rounded-lg px-3 sm:min-h-10">
          <Link to="/logout"><LogOutIcon /> Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
