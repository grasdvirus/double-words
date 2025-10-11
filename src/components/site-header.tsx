"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Swords, Trophy, BookOpen, Settings, Home, Menu, User, LogIn, LogOut, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useUser, useAuth } from "@/firebase";
import { signInWithGoogle, signOut } from "@/firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItems = [
  { href: "/play", label: "Jouer", icon: Swords },
  { href: "/rules", label: "Règles", icon: BookOpen },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function AuthButton() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  if (isUserLoading) return <Button variant="ghost" size="icon" disabled><Loader2 className="animate-spin" /></Button>;

  if (user) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User Avatar'}/>
              <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Profil</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User Avatar'}/>
                  <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold">{user.displayName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button onClick={() => auth && signOut(auth)} variant="destructive" className="mt-4">
                  <LogOut className="mr-2"/>
                  Déconnexion
                </Button>
            </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Button onClick={() => auth && signInWithGoogle(auth)}>
      <LogIn className="mr-2" />
      Connexion
    </Button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Swords className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Double Words
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "text-primary hover:text-primary")}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
            {pathname !== "/" && (
                 <Button asChild variant="ghost" size="icon">
                  <Link href="/" aria-label="Accueil">
                    <Home />
                  </Link>
                </Button>
            )}
            <AuthButton />
        
            {/* Mobile Navigation */}
            <div className="flex items-center md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right">
                <SheetHeader className="text-left">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                    Naviguez à travers les différentes sections du jeu.
                    </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                        <Link
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-lg font-medium",
                            pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                        </Link>
                    </SheetClose>
                    ))}
                </nav>
                </SheetContent>
            </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
