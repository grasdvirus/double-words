"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Swords, Trophy, BookOpen, Settings, Home } from "lucide-react";

const navItems = [
  { href: "/play", label: "Jouer", icon: Swords },
  { href: "/rules", label: "Règles", icon: BookOpen },
  { href: "/leaderboard", label: "Classement", icon: Trophy },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              Double Words
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
        <nav className="flex items-center space-x-1">
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
        </div>
      </div>
    </header>
  );
}
