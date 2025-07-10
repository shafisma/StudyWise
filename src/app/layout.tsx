import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/app/app-shell';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'StudyWise AI',
  description: 'AI-powered study assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
          <AppShell>
            {children}
          </AppShell>
        <Toaster />
      </body>
    </html>
  );
}
