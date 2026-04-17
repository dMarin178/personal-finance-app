import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@presentation/components/header';

export const metadata: Metadata = {
  title: 'Personal Finance App',
  description: 'Manage your credit cards and expenses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
