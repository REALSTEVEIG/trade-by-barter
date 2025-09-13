import * as React from 'react';
import Link from 'next/link';
import { Bell, Menu, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SearchBar from '@/components/common/search-bar';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  user?: {
    id: string;
    name: string;
    avatar?: string;
  } | undefined;
  onSearch?: (query: string) => void;
  className?: string;
}

export function Header({ user, onSearch, className }: HeaderProps): React.ReactElement {
  return (
    <header className={cn('bg-white border-b border-border-gray sticky top-0 z-50', className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="splash-logo w-8 h-8">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold text-neutral-dark font-display">
                TradeByBarter
              </span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar
              placeholder="Search for items..."
              {...(onSearch && { onSearch })}
              className="w-full"
            />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  asChild
                >
                  <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-white rounded-full text-xs flex items-center justify-center">
                      3
                    </span>
                  </Link>
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href="/chat">
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </Button>

                {/* Favorites */}
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User Profile */}
                <Button
                  variant="ghost"
                  className="p-1"
                  asChild
                >
                  <Link href="/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-secondary text-white text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchBar
            placeholder="Search for items..."
            {...(onSearch && { onSearch })}
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;