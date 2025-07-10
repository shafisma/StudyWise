'use client';

import AppHeader from './header';

export default function AppShell({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1">
            {children}
        </main>
    </div>
  );
}
