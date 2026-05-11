import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OfflineBanner } from './feedback/OfflineBanner';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <OfflineBanner />
      <Navbar />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1 p-5 lg:p-8">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
