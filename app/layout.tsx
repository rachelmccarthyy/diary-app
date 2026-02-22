import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Diary',
  description: 'A private diary for your thoughts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
