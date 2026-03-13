'use client';

import { useState } from 'react';
import { Box, Toolbar, Container, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../../components/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* DESKTOP SIDEBAR */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Sidebar />
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        open={mobileOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 240,
          },
        }}
      >
        <Sidebar />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >

        {/* MOBILE HEADER */}
        <Toolbar sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* DESKTOP SPACER */}
        <Toolbar sx={{ display: { xs: 'none', md: 'block' } }} />

        <Container
          maxWidth="lg"
          sx={{
            py: { xs: 2, md: 4 },
            px: { xs: 2, md: 3 },
            flexGrow: 1,
          }}
        >
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