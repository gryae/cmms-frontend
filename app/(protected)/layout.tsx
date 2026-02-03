'use client';

import { Box, Toolbar, Container } from '@mui/material';
import Sidebar from '../../components/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar tetap pada tempatnya */}
      <Sidebar />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Mencegah konten overflow pada layar kecil
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Toolbar sebagai spacer untuk fixed header jika ada */}
        <Toolbar /> 

        <Container 
          maxWidth="lg" // Membatasi lebar agar konten tidak terlalu "melar" di layar ultrawide
          sx={{ 
            py: { xs: 2, md: 4 }, // Padding lebih kecil di mobile, lega di desktop
            px: { xs: 2, md: 3 },
            flexGrow: 1,
          }}
        >
          {/* Animasi masuk sederhana untuk semua halaman dashboard */}
          <Box
            sx={{
              animation: 'fadeIn 0.5s ease-out',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}