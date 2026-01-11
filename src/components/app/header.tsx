
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FileText,
  FileQuestion,
  Layers,
  BrainCircuit,
  TrendingUp,
  MessageCircleQuestion,
  Menu,
  X,
  ClipboardCheck,
  Share2,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const navItems = [
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/quiz', icon: FileQuestion, label: 'Quiz' },
  { href: '/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/eli5', icon: MessageCircleQuestion, label: 'Explainer' },
  { href: '/exam', icon: ClipboardCheck, label: 'Exam' },
  { href: '/concept-map', icon: Share2, label: 'Concept Map'},
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/achievements', icon: Award, label: 'Achievements'},
];

export default function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Removed check for landing page to show header everywhere
  // if (pathname === '/') {
  //   return null; 
  // }

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

        <div className="flex flex-1 items-center justify-end gap-4">
            <SignedIn>
                <UserButton afterSignOutUrl="/"/>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button variant="default" size="sm">
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>

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
              <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                 <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                    <SheetDescription className="text-left">
                        Navigate to different sections of StudyWise
                    </SheetDescription>
                  </SheetHeader>
                 <Link href="/" className="flex items-center gap-2 my-4" onClick={() => setIsMobileMenuOpen(false)}>
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span className="font-bold">StudyWise</span>
                </Link>
                <div className="flex flex-col space-y-3">
                    {navLinks}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
