'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FileQuestion,
  Layers,
  BrainCircuit,
  PanelLeft,
  History,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/notes', icon: FileText, label: 'Notes' },
  { href: '/quiz', icon: FileQuestion, label: 'Quiz' },
  { href: '/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/history', icon: History, label: 'History' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" className="h-10 w-full justify-start px-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">StudyWise</span>
            </Button>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col flex-1">
        {isMobile && (
           <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger asChild>
                <Button size="icon" variant="outline">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SidebarTrigger>
          </header>
        )}
        <SidebarInset>{children}</SidebarInset>
      </div>
    </div>
  );
}
