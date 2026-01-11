import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppShell from '@/components/app/app-shell';
import { Inter, Poppins, Roboto_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['700'],
  variable: '--font-heading',
});

const fontMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'StudyWise AI - Your Personal AI Study Assistant',
    template: '%s | StudyWise AI',
  },
  description: 'Transform your study routine with AI. Generate notes, flashcards, quizzes, and concept maps from any text or topic instantly.',
  keywords: ['AI study assistant', 'generate notes', 'flashcards maker', 'quiz generator', 'study tools', 'education AI', 'concept maps'],
  authors: [{ name: 'StudyWise Team' }],
  creator: 'StudyWise AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://studywise.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'StudyWise AI - Your Personal AI Study Assistant',
    description: 'Transform your study routine with AI. Generate notes, flashcards, quizzes, and concept maps from any text or topic instantly.',
    siteName: 'StudyWise AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StudyWise AI - Your Personal AI Study Assistant',
    description: 'AI-powered study tools: Notes, Flashcards, Quizzes, and more.',
    creator: '@studywiseai',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey || publishableKey === '<Your Publishable Key>') {
    return (
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
          <div className="flex flex-col min-h-screen items-center justify-center bg-muted">
            <div className="p-8 border rounded-lg bg-card text-card-foreground text-center shadow-lg">
              <h1 className="text-2xl font-bold mb-2 text-destructive">Configuration Missing</h1>
              <p className="text-muted-foreground">Clerk authentication is not configured correctly.</p>
              <p className="text-muted-foreground mt-1">Please add your valid <code className="p-1 bg-muted rounded-sm">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code className="p-1 bg-muted rounded-sm">CLERK_SECRET_KEY</code> to the <code className="p-1 bg-muted rounded-sm">.env</code> file.</p>
            </div>
          </div>
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignInUrl="/notes"
      afterSignUpUrl="/notes"
    >
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased", 
          fontSans.variable, 
          fontHeading.variable, 
          fontMono.variable
        )}>
            <AppShell>
              {children}
            </AppShell>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
