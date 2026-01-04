import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bisca Assistant',
  description: 'Assistente inteligente para o jogo de cartas Bisca',
  manifest: '/manifest.json',
  themeColor: '#16a34a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bisca Assistant',
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
};

export default RootLayout;
