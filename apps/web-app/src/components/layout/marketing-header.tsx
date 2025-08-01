import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Car, Menu } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  return (
    <header className="border-border/40 bg-background sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto flex h-32 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Logo height={220} width={220} className="mx-auto" />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 md:flex">
          <NavigationMenu>
            <NavigationMenuList className="space-x-8 lg:space-x-10">
              <NavigationMenuItem>
                <Link
                  to="/"
                  className="hover:text-primary text-lg font-medium transition-colors group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2.5"
                >
                  Features
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/"
                  className="hover:text-primary text-lg font-medium transition-colors group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2.5"
                >
                  Pricing
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/"
                  className="hover:text-primary text-lg font-medium transition-colors group inline-flex h-11 w-max items-center justify-center rounded-md bg-background px-4 py-2.5"
                >
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <ThemeToggle />
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/sign-in"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold transition-all duration-200 group inline-flex h-11 w-max items-center justify-center rounded-lg px-5 py-2.5 shadow-md hover:shadow-lg"
                >
                  Sign In
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto px-4 pt-4 pb-3">
              {/* Mobile Navigation List */}
              <nav className="space-y-1">
                <Link
                  to="/"
                  className="text-foreground/90 hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-lg font-medium transition-colors"
                >
                  Features
                </Link>
                <Link
                  to="/"
                  className="text-foreground/90 hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-lg font-medium transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/"
                  className="text-foreground/90 hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-lg font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/sign-in"
                  className="text-foreground/90 hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
