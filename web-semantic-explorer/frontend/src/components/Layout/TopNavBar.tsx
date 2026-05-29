import { Link as RouterLink, useRouterState } from "@tanstack/react-router"
import { LogOut, Monitor, Moon, Settings, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Logo } from "@/components/Common/Logo"
import { getNavItems, type NavItem } from "@/components/Layout/navConfig"
import { type Theme, useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { getInitials } from "@/utils"

const THEME_ICONS: Record<Theme, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

function NavLink({ item }: { item: NavItem }) {
  const router = useRouterState()
  const isActive = router.location.pathname === item.path
  const Icon = item.icon

  return (
    <RouterLink
      to={item.path}
      className={cn(
        "inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all",
        isActive
          ? "-translate-x-0.5 -translate-y-0.5 border-foreground bg-background text-foreground shadow-[3px_3px_0_0_var(--color-foreground)]"
          : "border-transparent text-muted-foreground hover:border-foreground hover:bg-muted/60 hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{item.title}</span>
    </RouterLink>
  )
}

function NavAppearance() {
  const { setTheme, theme } = useTheme()
  const Icon = THEME_ICONS[theme]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        data-testid="theme-button"
        className="inline-flex size-9 items-center justify-center border-2 border-foreground bg-background text-muted-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
      >
        <Icon className="size-4" aria-hidden />
        <span className="sr-only">Apariencia</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-40 rounded-none border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <DropdownMenuItem
          data-testid="light-mode"
          className="rounded-none text-xs uppercase tracking-widest"
          onClick={() => setTheme("light")}
        >
          <Sun className="size-4" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid="dark-mode"
          className="rounded-none text-xs uppercase tracking-widest"
          onClick={() => setTheme("dark")}
        >
          <Moon className="size-4" />
          Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none text-xs uppercase tracking-widest"
          onClick={() => setTheme("system")}
        >
          <Monitor className="size-4" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavUser() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="user-menu"
        className="inline-flex max-w-[200px] items-center gap-2 border-2 border-foreground bg-background px-2 py-1 shadow-[2px_2px_0_0_var(--color-foreground)] transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_0_var(--color-foreground)]"
      >
        <Avatar className="size-7 rounded-none border border-foreground/30">
          <AvatarFallback className="rounded-none bg-muted text-[10px] font-mono uppercase">
            {getInitials(user.full_name || "User")}
          </AvatarFallback>
        </Avatar>
        <span className="hidden truncate text-[10px] font-mono uppercase tracking-widest sm:inline">
          {user.full_name?.split(" ")[0] ?? "Cuenta"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-56 rounded-none border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <DropdownMenuLabel className="rounded-none font-normal">
          <p className="truncate text-sm font-medium">{user.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-none">
          <RouterLink to="/settings" className="text-xs uppercase tracking-widest">
            <Settings className="size-4" />
            Ajustes
          </RouterLink>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-none text-xs uppercase tracking-widest"
          onClick={() => logout()}
        >
          <LogOut className="size-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TopNavBar() {
  const { user } = useAuth()
  const items = getNavItems(user?.is_superuser)

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b-2 border-foreground bg-background px-4 shadow-[0_4px_0_0_var(--color-foreground)] sm:gap-4 sm:px-6">
      <Logo variant="full" className="h-5 w-auto shrink-0" />
      <nav
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        aria-label="Principal"
      >
        {items.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <NavAppearance />
        <NavUser />
      </div>
    </header>
  )
}
