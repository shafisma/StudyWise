'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FileText,
  FileQuestion,
  Layers,
  BrainCircuit,
  History,
  MessageCircleQuestion,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/quiz', icon: FileQuestion, label: 'Quiz' },
  { href: '/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/eli5', icon: MessageCircleQuestion, label: 'ELI5' },
  { href: '/history', icon: History, label: 'History' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === '/') {
    return null; // Don't show header on landing page
  }

  const navLinks = (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith(item.href)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
           <Link href="/" className="flex items-center gap-2 mr-6">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold">StudyWise</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm lg:flex">
            {navLinks}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                 <Link href="/" className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span className="font-bold">StudyWise</span>
                </Link>
                <div className="flex flex-col space-y-2">
                    {navLinks}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
