'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Home,
  TrendingUp,
  Activity,
  Settings,
  CheckCircle,
  User,
  Bell,
  ChevronDown,
  LogOut,
  Crown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Insights', href: '/insights', icon: TrendingUp },
  { name: 'Exercises', href: '/exercises', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo size="sm" />
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-md transition-all duration-200',
                      isActive
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{session?.user?.name || 'Profile'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium border-b dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Connected</span>
                    </div>
                    {session?.user?.email && (
                      <div className="text-xs text-gray-500 mt-1">{session.user.email}</div>
                    )}
                  </div>

                  <DropdownMenuItem>
                    <Bell className="w-4 h-4 mr-2" />
                    <span>Notifications</span>
                    <Badge variant="secondary" className="ml-auto">3</Badge>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    <span>My Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Crown className="w-4 h-4 mr-2" />
                    <span>Upgrade to Premium</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/auth' })}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 m-2 rounded-lg">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 mb-1', isActive ? 'text-white dark:text-black' : '')} />
                  <span className={cn('text-xs', isActive ? 'text-white dark:text-black' : '')}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}