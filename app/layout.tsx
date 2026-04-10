import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mijn Brein Buddy',
  description:
    'AI-gestuurde leerplatform voor kinderen. Oefen rekenen, taal, spelling en logica op jouw niveau.',
  keywords: ['leren', 'kinderen', 'rekenen', 'taal', 'spelling', 'AI', 'onderwijs'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
