import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ONE DIRECTORY | Hospitality Property-Management ERP',
  description:
    'Comprehensive multi-property hospitality ERP for Resorts, Homestays, Villas, Camps, and Hotels. Seamlessly orchestrating guest lifecycle from enquiry to repeat booking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" style={{ background: '#F8F6F1' }}>
      <body
        className={`${inter.variable} font-sans h-full antialiased overflow-hidden selection:bg-[#2E6E8E]/20 selection:text-[#1E2A32]`}
      >
        {children}
      </body>
    </html>
  );
}
