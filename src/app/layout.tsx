import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SQL Builder',
  description: 'Kids-friendly SQL learning app',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}


