import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full antialiased overflow-hidden text-slate-900 bg-slate-50 selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
