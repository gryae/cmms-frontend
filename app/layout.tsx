

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '../theme'; // ⬅️ FIX PATH


import type { Metadata } from 'next';
import ClientProviders from './providers';

export const metadata = {
  title: 'LAPOR SKKKJ',
  description: 'Maintenance Management System',
  icons: {
    icon: '/kailo.svg',
    type: 'image/svg',
  },
};




export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <CssBaseline />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

